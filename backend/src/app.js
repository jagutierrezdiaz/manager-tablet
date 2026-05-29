import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import apiRouter from './routes/api.js'
import db from './db/index.js'

dotenv.config()

const app = express()

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-db-id']
}))
app.use(express.json())
app.use(helmet())

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