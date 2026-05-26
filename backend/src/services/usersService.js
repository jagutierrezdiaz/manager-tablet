import db from '../db/index.js'

// Convierte un identificador en formato snake_case a camelCase.
function snakeToCamel(key = '') {
  return key
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

// Convierte una fila de la tabla USUARIO a un objeto DTO listo para enviar
// en la respuesta. Excluye campos sensibles como la contraseña.
function convertUserRowToDto(dbRow = {}) {
  const dto = {}
  for (const [columnName, columnValue] of Object.entries(dbRow)) {
    const camelKey = snakeToCamel(columnName)
    // Excluir campos de contraseña por seguridad
    if (camelKey === 'contrasena' || camelKey === 'password') continue
    dto[camelKey] = columnValue
  }
  return dto
}

export async function getAllUsers() {
  const sql = 'SELECT * FROM MOD'
  const rows = await db.query(sql, [])
  if (!Array.isArray(rows)) return []
  return rows.map(convertUserRowToDto)
}

export async function getNotSuspendedUsers() {
  const sql = "SELECT * FROM MOD WHERE UPPER(TRIM(SUSPENDIDO)) = 'NO' ORDER BY NOMBRE_PERSONA"
  const rows = await db.query(sql, [])
  if (!Array.isArray(rows)) return []
  return rows.map(convertUserRowToDto)
}


export async function getUserById(id) {
  // Buscar por la clave numérica CODIGO_PERSONA de la tabla MOD
  const sql = `
    SELECT 
      MO.CODIGO_PERSONA,
      MO.NOMBRE_PERSONA,
      MO.ID_CARGO,
      CA.NOMBRE_CARGO AS CARGO_PERSONA
    FROM MOD MO
    LEFT JOIN CARGO_MOD CA
      ON MO.ID_CARGO = CA.ID_CARGO
    WHERE (MO.SUSPENDIDO IS NULL OR UPPER(TRIM(MO.SUSPENDIDO)) <> 'SI')
    AND MO.CODIGO_PERSONA = ?
  `
  const params = [id]
  const rows = await db.query(sql, params)
  if (!rows || rows.length === 0) return null
  return convertUserRowToDto(rows[0])
}

export async function getSupervisores() {
  const sql = `
    SELECT
      M.CODIGO_PERSONA,
      M.NOMBRE_PERSONA
    FROM MOD M
    INNER JOIN CARGO_MOD CM
      ON M.ID_CARGO = CM.ID_CARGO
    WHERE UPPER(TRIM(CM.NOMBRE_CARGO)) ='SUPERVISOR MANTENIMIENTO'
    ORDER BY CM.NOMBRE_CARGO,
      M.NOMBRE_PERSONA
  `
  const rows = await db.query(sql, [])
  return rows.map(convertUserRowToDto)
}


export async function getPersonasAsignadas(idOtm) {
  const sql = `
    SELECT 
      MO.NOMBRE_PERSONA, 
      MO.CODIGO_PERSONA,
      CM.FECHA_INICIO AS HORA_INICIO, 
      CM.FECHA_FIN AS HORA_FIN, 
      CM.HORAS_TRABAJO AS HORA_TOTAL
    FROM CIERRE_MOD CM, MOD MO
    WHERE CM.CODIGO_PERSONA = MO.CODIGO_PERSONA
      AND CM.ID_OTM = ?
    ORDER BY MO.NOMBRE_PERSONA
  `




  const params = [idOtm]
  const rows = await db.query(sql, params)
  return rows.map(convertUserRowToDto)
}