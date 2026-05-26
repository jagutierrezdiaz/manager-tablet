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

function query(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    let db
    try {
      db = await getConnection()
      db.query(sql, params, (err, result) => {
        // release connection
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

export default { query, getConnection, asyncLocalStorage }
