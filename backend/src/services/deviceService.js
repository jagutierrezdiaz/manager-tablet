import db from '../db/index.js'

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
      AND DIRECCION_IP = ?;
  `
  const params = [idPersistente, direccionIp]
  const rows = await db.query(sql, params)
  if (!rows || rows.length === 0) return null
  return rows[0]
}

export async function registerDevice(idPersistente, direccionIp, estado, codigoPersona = null) {
  if (codigoPersona) {
    const sql = `
      INSERT INTO REGISTRO_MOVIL (
        ID_PERSISTENTE,
        DIRECCION_IP,
        ESTADO,
        FECHA_REGISTRO,
        CODIGO_PERSONA
      )
      VALUES (
        ?, 
        ?, 
        ?, 
        CURRENT_DATE,  
        ?  
      );
    `
    const params = [idPersistente, direccionIp, estado, codigoPersona]
    return await db.query(sql, params)
  } else {
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
        ?, 
        CURRENT_DATE 
      );
    `
    const params = [idPersistente, direccionIp, estado]
    return await db.query(sql, params)
  }
}
