import db from '../db/index.js'

const MAX_REGISTROS_MOVIL = 5

export async function checkDevice(idPersistente, direccionIp) {
  const sql = `
    SELECT
      PK,
      ID_PERSISTENTE,
      DIRECCION_IP,
      ESTADO,
      FECHA_REGISTRO
    FROM REGISTRO_MOVIL
    WHERE ID_PERSISTENTE = ?
      AND DIRECCION_IP = ?
      AND ESTADO = 'ACTIVO'
  `
  const params = [idPersistente, direccionIp]
  const rows = await db.query(sql, params)
  if (!rows || rows.length === 0) return null
  return rows[0]
}

async function countRegistroMovil() {
  const sql = `SELECT COUNT(*) AS TOTAL FROM REGISTRO_MOVIL`
  const rows = await db.query(sql, [])
  return Number(rows[0]?.TOTAL ?? 0)
}

export async function registerDevice(idPersistente, direccionIp) {
  const existing = await checkDevice(idPersistente, direccionIp)
  if (existing) {
    return existing
  }

  const totalRegistros = await countRegistroMovil()
  if (totalRegistros >= MAX_REGISTROS_MOVIL) {
    const err = new Error(
      `No se puede registrar el dispositivo: se alcanzó el límite de ${MAX_REGISTROS_MOVIL} licencias.`
    )
    err.status = 409
    throw err
  }

  const sql = `
    INSERT INTO REGISTRO_MOVIL (
      ID_PERSISTENTE,
      DIRECCION_IP,
      ESTADO,
      FECHA_REGISTRO
    )
    VALUES (
      ?,
      ?,
      'ACTIVO',
      CURRENT_DATE
    )
  `
  const params = [idPersistente, direccionIp]
  await db.query(sql, params)
  return checkDevice(idPersistente, direccionIp)
}
