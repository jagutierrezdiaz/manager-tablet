import db from '../db/index.js'

export async function getOtmProgramadas(codigoPersona) {
    const sql = `
        SELECT 
            OTM.ID_OTM,
            OTM.FECHA_PROGRAMADA, 
            OTM.LIMITE_CIERRE,
            AC.NOMBRE_ACTIVIDAD, 
            AC.TIPO_MANTENIMIENTO,
            AC.CLASE_ACTIVIDAD
        FROM OTM, ACTIVIDAD AC, CIERRE_MOD CM
        WHERE OTM.CUMPLIDA = 'NO'
            AND OTM.ID_ACTIVIDAD = AC.ID_ACTIVIDAD
            AND OTM.ID_OTM = CM.ID_OTM
            AND CM.CODIGO_PERSONA = ?
        ORDER BY OTM.FECHA_PROGRAMADA`
    const rows = await db.query(sql, [codigoPersona])
    return rows
}

export async function getDatosOtmById(idOtmProgramada) {
    const sql = `
        SELECT 
            OTM.ID_NUMERICO,
            OTM.ID_OTM, 
            OTM.FECHA_PROGRAMADA,
            OTM.FECHA_CIERRE,
            OTM.LIMITE_CIERRE,
            OTM.OBSERVACION_OTM, 
            OTM.COMENTARIOS_DE_CIERRE,
            OTM.FOTO_1, 
            OTM.FOTO_2,
            OTM.TIEMPO_REAL,
            OTM.TIEMPO_PROGRAMADO,
            AC.ID_ACTIVIDAD,
            AC.NOMBRE_ACTIVIDAD,
            AC.CLASE_ACTIVIDAD,
            AC.TIPO_MANTENIMIENTO,
            AC.PROGRAMABLE,AC.TIPO_PROGRAMA,
            BL.ID_PROCESO, 
            BL.NOMBRE_PROCESO, 
            BL.ID_ETAPA,
            BL.NOMBRE_ETAPA, 
            BL.ID_MAQUINA, 
            BL.NOMBRE_MAQUINA,
            BL.ID_EQUIPO, 
            BL.NOMBRE_EQUIPO
        FROM OTM, ACTIVIDAD AC, QRBASE_LAYOUT BL
        WHERE OTM.ID_EQUIPO = BL.ID_EQUIPO
           AND OTM.ID_ACTIVIDAD = AC.ID_ACTIVIDAD
           AND OTM.ID_OTM =  ?
    `
    const rows = await db.query(sql, [idOtmProgramada])
    return rows
}