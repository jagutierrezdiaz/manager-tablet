import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const PORT = parseInt(process.env.PORT || '5000', 10)
const HOST = process.env.HOST || '0.0.0.0'

const server = app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en puerto ${PORT} (host ${HOST})`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...')
  server.close(() => process.exit(0))
})
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  server.close(() => process.exit(0))
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err)
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason)
})