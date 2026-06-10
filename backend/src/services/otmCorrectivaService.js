import db from '../db/index.js'

export async function getMachines(idProceso = null) {
    const params = []
    let filtroProceso = ''

    if (idProceso !== null && idProceso !== undefined && String(idProceso).trim() !== '') {
        filtroProceso = ' AND PR.ID_PROCESO = ?'
        params.push(idProceso)
    }

    const sql = `
        SELECT 
            PR.ID_PROCESO,
            PR.NOMBRE_PROCESO,
            ET.ID_ETAPA,
            ET.NOMBRE_ETAPA,
            MA.ID_MAQUINA,
            MA.NOMBRE_MAQUINA
        FROM PROCESO PR ,ETAPA ET, MAQUINA MA
        WHERE PR.ID_PROCESO = ET.ID_PROCESO AND
            ET.ID_ETAPA = MA.ID_ETAPA
            ${filtroProceso}
        ORDER BY PR.NOMBRE_PROCESO, ET.NOMBRE_ETAPA, MA.NOMBRE_MAQUINA`
    const rows = await db.query(sql, params)
    return rows
}

export async function getDetailMachine(idMachine) {
    const sql = `
        SELECT 
            PR.ID_PROCESO,
            PR.NOMBRE_PROCESO,
            ET.ID_ETAPA,
            ET.NOMBRE_ETAPA,
            MA.ID_MAQUINA,
            MA.NOMBRE_MAQUINA
        FROM PROCESO PR ,ETAPA ET, MAQUINA MA
        WHERE PR.ID_PROCESO = ET.ID_PROCESO AND
            ET.ID_ETAPA = MA.ID_ETAPA 
            AND MA.ID_MAQUINA = ?
    `
    const rows = await db.query(sql, [idMachine])
    return rows
}


export async function getListEquipos(idMachine) {
    const sql = `
        SELECT 
            EQ.ID_EQUIPO,
            TE.NOMBRE_TIPO_EQUIPO, 
            EQ.NOMBRE_EQUIPO
        FROM EQUIPO EQ, TIPO_EQUIPO TE
        WHERE TE.ID_TIPO_EQUIPO = EQ.ID_TIPO_EQUIPO
        AND EQ.ID_MAQUINA = ?
    `
    const rows = await db.query(sql, [idMachine])
    return rows
}

export async function getListActividades(claseActividad) {
    const clase = String(claseActividad || '').trim()
    const filtrarPorClase = clase !== '' && clase.toUpperCase() !== 'TODOS'

    let sql = `
        SELECT ID_ACTIVIDAD, NOMBRE_ACTIVIDAD, CLASE_ACTIVIDAD
        FROM ACTIVIDAD
        WHERE TIPO_MANTENIMIENTO = 'CORRECTIVO'
    `
    const params = []

    if (filtrarPorClase) {
        sql += ` AND CLASE_ACTIVIDAD = ?`
        params.push(clase)
    }

    const rows = await db.query(sql, params)
    return rows
}

export async function getMaxIdNumerico() {
    const sql = `
        SELECT MAX(ID_NUMERICO) AS MAXIDNUMERICO
        FROM OTM
    `
    const rows = await db.query(sql, [])
    return rows[0]?.MAXIDNUMERICO || 0
}

function formatOtmFecha(fecha) {
    if (!fecha) return '—'
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return String(fecha)
    return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

function buildOpenOtmErrorMessage(otm = {}) {
    return [
        'No se puede crear una nueva otm por que ya existe una abierta para este equipo y actividad.',
        '',
        `Equipo: ${otm.NOMBRE_EQUIPO || '—'}`,
        `Actividad: ${otm.NOMBRE_ACTIVIDAD || '—'}`,
        `OTM: ${otm.ID_OTM ?? '—'}`,
        `Fecha programada: ${formatOtmFecha(otm.FECHA_PROGRAMADA)}`,
        `Limite cierre: ${formatOtmFecha(otm.LIMITE_CIERRE)}`
    ].join('\n')
}

export async function saveOTMCorrectiva(data) {
    const otmCheck = await checkOtmActividadEquipoExists(data.ID_EQUIPO, data.ID_ACTIVIDAD)

    if (otmCheck.status === 'open') {
        const details = {
            NOMBRE_EQUIPO: otmCheck.otm.NOMBRE_EQUIPO,
            NOMBRE_ACTIVIDAD: otmCheck.otm.NOMBRE_ACTIVIDAD,
            ID_OTM: otmCheck.otm.ID_OTM,
            FECHA_PROGRAMADA: otmCheck.otm.FECHA_PROGRAMADA,
            LIMITE_CIERRE: otmCheck.otm.LIMITE_CIERRE
        }
        const err = new Error(buildOpenOtmErrorMessage(details))
        err.status = 409
        err.details = details
        throw err
    }

    if (otmCheck.status === 'none') {
        await insertActividadEquipoOtm(data.ID_EQUIPO, data.ID_ACTIVIDAD, data.TIEMPO_ACTIVIDAD)
    }

    // Si status === 'fulfilled' (CUMPLIDA = SI), omitir insertActividadEquipoOtm y crear la nueva OTM
    const maxId = await getMaxIdNumerico()
    const nextId = Number(maxId) + 1

    console.log('data: ', data)

    // 2. Obtener parámetros para el límite de cierre
    const paramsCierre = await getParametroLimiteCierre()
    const diasLimite = paramsCierre[0]?.LIMITE_CIERRE || 0

    // 3. Preparar fechas
    const now = new Date()
    const fechaOtm = now
    const fechaProgramada = now
    const mesOtm = now.getMonth() + 1
    const limiteCierre = new Date(now)
    limiteCierre.setDate(limiteCierre.getDate() + diasLimite)

    const sql = `
        INSERT INTO OTM (
            ID_EQUIPO, ID_ACTIVIDAD, ID_OTM, ID_SOLICITUD, FECHA_OTM, 
            FECHA_PROGRAMADA, REPROGRAMADA, MES_OTM, LIMITE_CIERRE, FECHA_CIERRE, 
            ID_PERSONA_ABRIR, COMENTARIOS_DE_CIERRE, ID_PERSONA_CERRAR, CERRADA, CUMPLIDA, 
            OBSERVACION_OTM, INDICE_CUMPLIMIENTO, EFECTIVIDAD_CUMPLIMIENTO, TIEMPO_PROGRAMADO, TIEMPO_REAL, 
            TIPO_CIM, OBSERVACION_CIM, TIEMPO_MOD, VLR_MOD, VLR_REPUESTO, 
            VLR_CIM, ESTADO_ACTIVIDAD, TIPO_MANTENIMIENTO, CAUSO_PARADA, COSTEADA, 
            PRIORIDAD, VALOR_FIJO_PROGRAMADA, VALOR_FIJO_CUMPLIDA, INDICE_CUMPLIMIENTO_FIJO, ASIGNADA, 
            VALOR_MIN_VBLE, VALOR_MAX_VBLE, FECHA_REGISTRO_VBLE, FOTO_1, FOTO_2, 
            RECUMPLIDA, VALOR_RANGO_PROGRAMADA, VALOR_RANGO_CUMPLIDA
        )
        VALUES (
            ?, ?, ?, NULL, ?, 
            ?, 'NO', ?, ?, NULL, 
            'U0001', NULL, NULL, 'NO', 'NO', 
            ?, NULL, NULL, 0, 0, 
            NULL, NULL, NULL, NULL, NULL, 
            NULL, NULL, 'CORRECTIVO', ?, 'NO', 
            ?, NULL, NULL, 0, 'SI', 
            0, 0, NULL, NULL, NULL, 
            'NO', 0, 0
        )
    `

    const params = [
        data.ID_EQUIPO,
        data.ID_ACTIVIDAD,
        nextId,
        fechaOtm,
        fechaProgramada,
        mesOtm,
        limiteCierre,
        data.OBSERVACION_OTM,
        data.CAUSO_PARADA,
        data.PRIORIDAD || 'Alta'
    ]

    await db.query(sql, params)
    await saveActividadEquipoOtm(data.ID_EQUIPO, data.ID_ACTIVIDAD)
    await insertModActividad(data.ID_ACTIVIDAD, data.CODIGO_PERSONA)

    // Obtener personas asociadas a la actividad e insertar en CIERRE_MOD
    const personas = await getPersonaActividad(data.ID_ACTIVIDAD)
    console.log('personas: ', personas)
    for (const persona of personas) {
        await insertCierreMod(nextId, persona.CODIGO_PERSONA)
    }

    return { success: true, ID_OTM: nextId }
}


export async function insertActividadEquipoOtm(idEquipo, idActividad, tiempoActividad) {
    const sql = `
        INSERT INTO ACTIVIDAD_EQUIPO(
            ID_EQUIPO,
            ID_ACTIVIDAD,
            TIEMPO_MANTENIMIENTO,
            VALOR_VARIABLE_MTTO,
            VALOR_MINIMO,
            VALOR_MAXIMO,
            UND_VARIABLE,
            HORAS_ACUMULADAS,
            ASIGNADO,
            PROGRAMADO,
            OTM,
            PRIORIDAD,
            FECHA_ESTADO,
            TIEMPO_TRABAJO,
            TIEMPO_ACTIVIDAD,
            ESTADO,
            ID_VARIABLE,
            FECHA_ASIGNACION,
            REINICIAR_TIPO_FIJO
        )
        VALUES
        (
            ?,                
            ?,              
            0,                     
            ?,              
            0,                     
            0,                     
            'No Aplica',                 
            0,                       
            'NO',                    
            'NO',                   
            'NO',                     
            'Alta',               
            null,                    
            0,                        
            0,          
            'ABIERTA',               
            'No Aplica',             
            CURRENT_TIMESTAMP,               
            null                    
        )
    `
    const params = [idEquipo, idActividad, tiempoActividad]
    await db.query(sql, params)
    return { success: true }
}

export async function saveActividadEquipoOtm(idEquipo, idActividad) {
    const sql = `
        UPDATE ACTIVIDAD_EQUIPO
        SET ASIGNADO = 'SI',
        OTM = 'SI'
        WHERE ID_EQUIPO = ?
        AND ID_ACTIVIDAD = ?;
    `
    const params = [idEquipo, idActividad]
    await db.query(sql, params)
    return { success: true }
}

export async function checkOtmActividadEquipoExists(idEquipo, idActividad) {
    const sql = `
        SELECT
            E.ID_EQUIPO,
            E.NOMBRE_EQUIPO,
            A.ID_ACTIVIDAD,
            A.NOMBRE_ACTIVIDAD,
            O.ID_NUMERICO,
            O.ID_OTM,
            O.FECHA_PROGRAMADA,
            O.LIMITE_CIERRE,
            O.CUMPLIDA
        FROM OTM O
        INNER JOIN EQUIPO E
                ON O.ID_EQUIPO = E.ID_EQUIPO
        INNER JOIN ACTIVIDAD A
                ON O.ID_ACTIVIDAD = A.ID_ACTIVIDAD
        WHERE O.ID_NUMERICO = (SELECT MAX(O2.ID_NUMERICO)
            FROM OTM O2
            WHERE O2.ID_ACTIVIDAD = ?
            AND O2.ID_EQUIPO = ?)
    `
    const rows = await db.query(sql, [idActividad, idEquipo])

    if (!rows || rows.length === 0) {
        return { status: 'none' }
    }

    const cumplida = String(rows[0].CUMPLIDA || '').trim().toUpperCase()

    if (cumplida === 'NO') {
        return { status: 'open', otm: rows[0] }
    }

    if (cumplida === 'SI') {
        return { status: 'fulfilled', otm: rows[0] }
    }

    return { status: 'none' }
}

export async function getParametroLimiteCierre() {
    const sql = `
        SELECT
            LIMITE_CIERRE,
            DIAS_PROYECCION
        FROM PARAMETRO
    `
    const rows = await db.query(sql, [])
    return rows
}

export async function insertModActividad(idActividad, codigoPersona) {
    const sql = `
        INSERT INTO MOD_ACTIVIDAD(
            ID_ACTIVIDAD,
            CODIGO_PERSONA
        )
        VALUES (?, ?)
    `
    const params = [idActividad, codigoPersona]
    await db.query(sql, params)
}


export async function getPersonaActividad(idActividad) {
    const sql = `
        SELECT MA.CODIGO_PERSONA
        FROM MOD_ACTIVIDAD MA
        WHERE MA.ID_ACTIVIDAD = ? 
    `
    const rows = await db.query(sql, [idActividad])
    return rows
}

export async function insertCierreMod(idOtm, codigoPersona) {
    const now = new Date()
    const ano = now.getFullYear()
    const mes = now.getMonth() + 1

    const sql = `
        INSERT INTO CIERRE_MOD
        (
            ID_OTM,
            CODIGO_PERSONA,
            FECHA_INICIO,
            FECHA_FIN,
            VLR_HORA,
            VLR_MOD,
            ANO,
            MES,
            HORAS_TRABAJO
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
        idOtm,
        codigoPersona,
        now,
        now,
        0,
        0,
        ano,
        mes,
        0
    ]
    await db.query(sql, params)
}

export async function getProcesoMaquinas() {
    const sql = `
        SELECT
            ID_NUMERICO,
            ID_PROCESO,
            NOMBRE_PROCESO
        FROM PROCESO
        ORDER BY NOMBRE_PROCESO;
    `
    const rows = await db.query(sql, [])
    return rows
}