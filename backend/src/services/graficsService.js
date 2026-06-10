import db from '../db/index.js'


export async function getGeneralMonth(startDate, endDate) {
    const sql = `
    SELECT 
        CLASE_ACTIVIDAD, 
        TIPO_MANTENIMIENTO, 
        COUNT(ID_OTM) AS TOTAL
    FROM QROTM_ABIERTA
    WHERE CAST(FECHA_PROGRAMADA AS DATE) BETWEEN ? AND ?
    GROUP BY CLASE_ACTIVIDAD, TIPO_MANTENIMIENTO`
    const rows = await db.query(sql, [startDate, endDate])
    // Return pre-formatted aggregation suitable for charts: { label, count }
    return rows.map(r => {
        const tipo = r.TIPO_MANTENIMIENTO ?? ''
        const clase = r.CLASE_ACTIVIDAD ?? ''
        const label = `${tipo} - ${clase}`.trim()
        const count = Number(r.TOTAL ?? 0)
        return { label, count }
    })
}

export async function getExecutionIndex(ano) {
    const sql = `
    SELECT 
        NOMBRE_MES, 
        NRO_PROGRAMADA, 
        NRO_PENDIENTE,
        NRO_CUMPLIDA, 
        VLR_INDICE
    FROM INDICE_01 (?, 0, 'NA')
    ORDER BY NO_MES`
    const rows = await db.query(sql, [ano])
    return rows
}
