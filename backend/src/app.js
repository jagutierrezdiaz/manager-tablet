import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import apiRouter from './routes/api.js'
import db from './db/index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

// Support single origin, multiple origins (comma/space/semicolon separated),
// or wildcard '*'. Preserve existing headers/methods.
let corsOptions
if (CORS_ORIGIN.trim() === '*') {
  corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-db-id']
  }
} else {
  const allowedOrigins = CORS_ORIGIN.split(/[,;\s]+/).filter(Boolean)
  corsOptions = {
    origin: (origin, cb) => {
      // allow non-browser requests (curl, server-to-server) where origin is undefined
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error('CORS not allowed'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-db-id']
  }
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Middleware para manejar el contexto de la base de datos
app.use((req, res, next) => {
  const dbId = req.headers['x-db-id'] || 'db1'
  db.asyncLocalStorage.run(dbId, () => {
    next()
  })
})

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`)
  next()
})

// Ruta raíz mínima
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando' })
})

// Montar todas las rutas de la API bajo /api (por ahora sólo /api/users)
app.use('/api', apiRouter)

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

export default app