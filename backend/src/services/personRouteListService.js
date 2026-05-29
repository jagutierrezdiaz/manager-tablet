import db from '../db/index.js'

export async function listPersonRoute(codigoPersona) {
    const sql = `
    SELECT 
        PR.ID_NUMERICO, 
        PR.ID_TIPO_RUTA, 
        PR.FECHA_PROGRAMADA, 
        PR.OBSERVACION,
        
        TR.NOMBRE_TIPO_RUTA, 
        TR.CLASE_ACTIVIDAD ,
        
        MOD.NOMBRE_PERSONA
    FROM PROGRAMA_RUTA PR, MOD, TIPO_RUTA TR
    WHERE PR.CODIGO_PERSONA = MOD.CODIGO_PERSONA
        AND PR.ID_TIPO_RUTA = TR.ID_TIPO_RUTA
        AND PR.ESTADO = 'ABIERTA'
        AND MOD.CODIGO_PERSONA = ?
    ORDER BY PR.FECHA_PROGRAMADA DESC`
    const rows = await db.query(sql, [codigoPersona])
    return rows
}

export async function getAllRoutesDetails(idNumerico, idTipoRuta) {
    const params = [
        Number(idNumerico || 0),
        String(idTipoRuta || '').trim()
    ]
    const sql = `
        SELECT
            PR.ID_PROCESO,
            PR.NOMBRE_PROCESO,
            ET.ID_ETAPA,
            ET.NOMBRE_ETAPA,
            MA.ID_MAQUINA,
            MA.NOMBRE_MAQUINA,
            EQ.ID_EQUIPO,
            EQ.NOMBRE_EQUIPO,
            CAST(RM.INDICACIONES_ESPECIFICAS AS VARCHAR(8000)) AS INDICACIONES_ESPECIFICAS,
            TR.ID_TIPO_RUTA,
            ER.CUMPLE_REVISION,
            CAST(ER.OBSERVACION AS VARCHAR(8000)) AS OBSERVACION
        FROM PROCESO PR
        INNER JOIN ETAPA ET
                ON PR.ID_PROCESO = ET.ID_PROCESO
        INNER JOIN MAQUINA MA
                ON ET.ID_ETAPA = MA.ID_ETAPA
        INNER JOIN EQUIPO EQ
                ON MA.ID_MAQUINA = EQ.ID_MAQUINA
        INNER JOIN RUTA_MANTENIMIENTO RM
                ON EQ.ID_EQUIPO = RM.ID_EQUIPO
        INNER JOIN TIPO_RUTA TR
                ON RM.ID_TIPO_RUTA = TR.ID_TIPO_RUTA
        LEFT JOIN EJECUCION_RUTA ER
            ON ER.ID_NUMERICO = ?
            AND TRIM(ER.ID_TIPO_RUTA) = TRIM(TR.ID_TIPO_RUTA)
            AND TRIM(ER.ID_EQUIPO) = TRIM(EQ.ID_EQUIPO)
        WHERE EQ.ESTADO_OPERACION = 'ACTIVO'
        AND TRIM(TR.ID_TIPO_RUTA) = ?
        ORDER BY PR.ID_PROCESO,
                ET.ID_ETAPA,
                MA.ID_MAQUINA,
                EQ.ID_EQUIPO
    `
    const rows = await db.query(sql, params)
    return rows
}

export async function getRouteDetails(idTipoRuta) {
    const sql = `
        SELECT
            PR.ID_PROCESO,
            PR.NOMBRE_PROCESO,
            ET.ID_ETAPA,
            ET.NOMBRE_ETAPA,
            MA.ID_MAQUINA,
            MA.NOMBRE_MAQUINA,
            EQ.ID_EQUIPO,
            EQ.NOMBRE_EQUIPO,
            CAST(RM.INDICACIONES_ESPECIFICAS AS VARCHAR(8000)) AS INDICACIONES_ESPECIFICAS,
            TR.ID_TIPO_RUTA
        FROM PROCESO PR, ETAPA ET, MAQUINA MA, EQUIPO EQ,
            RUTA_MANTENIMIENTO RM, TIPO_RUTA TR
        WHERE PR.ID_PROCESO = ET.ID_PROCESO
            AND ET.ID_ETAPA = MA.ID_ETAPA
            AND MA.ID_MAQUINA = EQ.ID_MAQUINA
            AND EQ.ID_EQUIPO = RM.ID_EQUIPO
            AND RM.ID_TIPO_RUTA = TR.ID_TIPO_RUTA
            AND EQ.ESTADO_OPERACION = 'ACTIVO'
            AND TR.ID_TIPO_RUTA = ?
        ORDER BY PR.ID_PROCESO, ET.ID_ETAPA, MA.ID_MAQUINA, EQ.ID_EQUIPO
    `
    const rows = await db.query(sql, [idTipoRuta])
    return rows
}


export async function getEjecucionRuta(idNumerico, idTipoRuta, idEquipo) {
    const params = [
        Number(idNumerico),
        String(idTipoRuta || '').trim(),
        String(idEquipo || '').trim()
    ]
    console.log('getEjecucionRuta params:', params)

    const sql = `
    SELECT
        ID_NUMERICO,
        ID_TIPO_RUTA,
        ID_EQUIPO,
        CUMPLE_REVISION,
        CAST(OBSERVACION AS VARCHAR(8000)) AS OBSERVACION
        FROM EJECUCION_RUTA
        WHERE ID_NUMERICO  = ?
          AND TRIM(ID_TIPO_RUTA) = ?
          AND TRIM(ID_EQUIPO)    = ?
    `
    const rows = await db.query(sql, params)
    console.log(`getEjecucionRuta devolvió ${rows.length} filas`)
    return rows
}


export async function saveEjecucionRuta(data) {
    const sql = `
        UPDATE OR INSERT INTO EJECUCION_RUTA 
        (ID_NUMERICO, ID_TIPO_RUTA, ID_EQUIPO, CUMPLE_REVISION, OBSERVACION) 
        VALUES (?, ?, ?, ?, ?)
        MATCHING (ID_NUMERICO, ID_TIPO_RUTA, ID_EQUIPO)
    `
    const params = [
        data.ID_NUMERICO,
        String(data.ID_TIPO_RUTA || '').trim(),
        String(data.ID_EQUIPO || '').trim(),
        data.CUMPLE_REVISION,
        data.OBSERVACION
    ]
    const rows = await db.query(sql, params)
    return rows
}

export async function cumplirRuta(data) {
    const sql = `
        UPDATE PROGRAMA_RUTA
           SET FECHA_CUMPLIDA = ?
              ,ESTADO ='CUMPLIDA'
              ,OBSERVACION = null
              ,TIEMPO_REAL = ?
         WHERE ID_NUMERICO = ?
    `
    // Construir la fecha a medianoche LOCAL para evitar el desfase por zona horaria
    // (new Date('YYYY-MM-DD') la interpreta como UTC y resta horas al guardarla)
    const [anio, mes, dia] = String(data.FECHA_CUMPLIDA || '').split('-').map(Number)
    const fechaCumplida = new Date(anio, (mes || 1) - 1, dia || 1)

    const params = [
        fechaCumplida,
        data.TIEMPO_REAL,
        Number(data.ID_NUMERICO || 0)
    ]
    await db.query(sql, params)
    return { success: true, ID_NUMERICO: Number(data.ID_NUMERICO || 0) }
}