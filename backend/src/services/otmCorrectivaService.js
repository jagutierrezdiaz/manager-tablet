import db from '../db/index.js'

export async function getMachines() {
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
        ORDER BY PR.NOMBRE_PROCESO, ET.NOMBRE_ETAPA, MA.NOMBRE_MAQUINA`
    const rows = await db.query(sql, [])
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

export async function saveOTMCorrectiva(data) {
    // 1. Obtener el siguiente ID_OTM
    const maxId = await getMaxIdNumerico()
    const nextId = Number(maxId) + 1

    console.log('idOTM: ', nextId)

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
    return { success: true, ID_OTM: nextId }
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