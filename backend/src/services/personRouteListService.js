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



export async function getRouteDetails(idTipoRuta) {
    const sql = `
        SELECT 
            TRIM(PR.ID_PROCESO) AS ID_PROCESO, 
            TRIM(PR.NOMBRE_PROCESO) AS NOMBRE_PROCESO, 
            TRIM(ET.ID_ETAPA) AS ID_ETAPA, 
            TRIM(ET.NOMBRE_ETAPA) AS NOMBRE_ETAPA,
            TRIM(MA.ID_MAQUINA) AS ID_MAQUINA, 
            TRIM(MA.NOMBRE_MAQUINA) AS NOMBRE_MAQUINA,
            TRIM(EQ.ID_EQUIPO) AS ID_EQUIPO, 
            TRIM(EQ.NOMBRE_EQUIPO) AS NOMBRE_EQUIPO,
            CAST(RM.INDICACIONES_ESPECIFICAS AS VARCHAR(8000)) AS INDICACIONES_ESPECIFICAS,
            TRIM(TR.ID_TIPO_RUTA) AS ID_TIPO_RUTA
        FROM PROCESO PR, ETAPA ET, MAQUINA MA, EQUIPO EQ,
            RUTA_MANTENIMIENTO RM, TIPO_RUTA TR
        WHERE PR.ID_PROCESO = ET.ID_PROCESO
            AND ET.ID_ETAPA = MA.ID_ETAPA
            AND MA.ID_MAQUINA = EQ.ID_MAQUINA
            AND EQ.ID_EQUIPO = RM.ID_EQUIPO
            AND RM.ID_TIPO_RUTA = TR.ID_TIPO_RUTA
            AND EQ.ESTADO_OPERACION = 'ACTIVO'
            AND TRIM(TR.ID_TIPO_RUTA) = ?
        ORDER BY PR.ID_PROCESO, ET.ID_ETAPA, MA.ID_MAQUINA, EQ.ID_EQUIPO
    `
    const rows = await db.query(sql, [String(idTipoRuta || '').trim()])
    return rows
}


export async function getEjecucionRuta(idNumero, idTipoRuta, idEquipo) {
    const sql = `
    SELECT *
        FROM EJECUCION_RUTA
        WHERE ID_NUMERICO  = ?
          AND ID_TIPO_RUTA = ?
          AND ID_EQUIPO    = ?
    `
    const rows = await db.query(sql, [
        idNumero,
        String(idTipoRuta || '').trim(),
        String(idEquipo || '').trim()
    ])
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