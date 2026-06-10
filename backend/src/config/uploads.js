import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendRoot = path.resolve(__dirname, '..', '..')

/** Ruta física donde se guardan uploads (firmas, fotos, etc.) */
export function getUploadsRoot() {
  const configured = process.env.UPLOADS_DIR?.trim()
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(backendRoot, configured)
  }
  return path.join(backendRoot, 'uploads')
}

export function getFirmaPersonalDir() {
  return path.join(getUploadsRoot(), 'Firma_Personal')
}

export function getFotosOtmDir() {
  return path.join(getUploadsRoot(), 'Fotos_OTM')
}

/** Ruta pública guardada en BD, p.ej. uploads/Firma_Personal/archivo.png */
export function toPublicPath(...segments) {
  return ['uploads', ...segments].join('/').replace(/\\/g, '/')
}

/** Convierte ruta pública de BD a ruta absoluta en disco */
export function toAbsolutePath(publicPath) {
  if (!publicPath) return null
  const relative = String(publicPath).replace(/^uploads[/\\]/i, '')
  return path.join(getUploadsRoot(), relative)
}
