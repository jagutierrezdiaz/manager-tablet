import './firebirdEncoding.js'
import { firebirdNodeEncoding, toFirebirdBlobText, fromFirebirdText } from './firebirdEncoding.js'
import Fb from 'node-firebird'
import dotenv from 'dotenv'
import { AsyncLocalStorage } from 'async_hooks'

dotenv.config()

const POOL_SIZE = parseInt(process.env.FB_POOL_SIZE || '5', 10)
const asyncLocalStorage = new AsyncLocalStorage()

const options = {
  host: process.env.FB_HOST || '127.0.0.1',
  port: parseInt(process.env.FB_PORT || '3050', 10),
  user: process.env.FB_USER || 'SYSDBA',
  password: process.env.FB_PASSWORD || 'masterkey',
  lowercase_keys: false,
  blobAsText: true,
  encoding: process.env.FB_ENCODING || 'WIN1252',
  role: null,
  pageSize: 4096
}

const pools = new Map()

function getPool() {
  const dbId = asyncLocalStorage.getStore() || 'db1'

  if (pools.has(dbId)) {
    return pools.get(dbId)
  }

  // Buscar la base de datos correspondiente en el .env
  // db1 -> FB_DATABASE_1 o FB_DATABASE
  // db2 -> FB_DATABASE_2
  const envSuffix = dbId.replace('db', '')
  const dbPath = process.env[`FB_DATABASE_${envSuffix}`] || process.env.FB_DATABASE

  if (!dbPath) {
    throw new Error(`No se encontró configuración de base de datos para: ${dbId}`)
  }

  console.log(`Iniciando pool para ${dbId} con base de datos: ${dbPath}`)
  const poolOptions = { ...options, database: dbPath }
  const pool = Fb.pool(POOL_SIZE, poolOptions)
  pools.set(dbId, pool)
  return pool
}

function getConnection() {
  return new Promise((resolve, reject) => {
    const p = getPool()
    p.get((err, db) => {
      if (err) return reject(err)
      resolve(db)
    })
  })
}

function safeParamToString(p) {
  if (p === null || p === undefined) return 'NULL'
  if (typeof p === 'number') return String(p)
  if (Buffer.isBuffer(p)) {
    return `'${p.toString(firebirdNodeEncoding).replace(/'/g, "''")}'`
  }
  return `'${String(p).replace(/'/g, "''")}'`
}

function interpolateSql(sql, params = []) {
  let i = 0
  return sql.replace(/\?/g, () => {
    if (i >= params.length) return '?'
    return safeParamToString(params[i++])
  })
}

/** Imprime el SQL con los parámetros ya sustituidos (solo para depuración). */
export function logSql(sql, params = [], tag = '[SQL]') {
  try {
    const full = interpolateSql(sql, params).replace(/\s+/g, ' ').trim()
    console.log(tag, full)
  } catch {
    console.log(tag, String(sql).replace(/\s+/g, ' ').trim(), params)
  }
}

/**
 * Prepara parámetros para Firebird WIN1252/NONE.
 * - string → latin1-safe (VARCHAR vía SQLParamString parcheado).
 * - Buffer (p. ej. toFirebirdBlobText) → se envía tal cual al BLOB.
 */
export function encodeQueryParams(params = []) {
  return params.map((p) => {
    if (Buffer.isBuffer(p)) return p
    if (typeof p !== 'string') return p
    return Buffer.from(p, firebirdNodeEncoding).toString(firebirdNodeEncoding)
  })
}

export { toFirebirdBlobText, fromFirebirdText }

/** Corrige mojibake UTF-8→WIN1252 (ej. verificaciÃ³n). */
export function fixUtf8Mojibake(text) {
  return fromFirebirdText(text)
}

function query(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    let db
    try {
      const encodedParams = encodeQueryParams(params)
      if (process.env.SHOW_SQL === 'true') {
        logSql(sql, encodedParams)
      }
      db = await getConnection()
      db.query(sql, encodedParams, (err, result) => {
        try { db.detach() } catch (e) { /* ignore */ }
        if (err) return reject(err)
        resolve(result)
      })
    } catch (err) {
      if (db) {
        try { db.detach() } catch (e) { /* ignore */ }
      }
      reject(err)
    }
  })
}

export default {
  query,
  getConnection,
  asyncLocalStorage,
  encodeQueryParams,
  fixUtf8Mojibake,
  toFirebirdBlobText,
  fromFirebirdText
}
