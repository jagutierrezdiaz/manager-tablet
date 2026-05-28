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
    const sql = `
        SELECT NOMBRE_ACTIVIDAD, CLASE_ACTIVIDAD
        FROM ACTIVIDAD
        WHERE CLASE_ACTIVIDAD = ?
        AND TIPO_MANTENIMIENTO ='CORRECTIVO'
    `
    const rows = await db.query(sql, [claseActividad])
    return rows
}