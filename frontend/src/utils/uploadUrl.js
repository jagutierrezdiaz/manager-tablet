/**
 * Convierte la ruta guardada en BD (uploads/Firma_Personal/archivo.png)
 * en una URL accesible desde el navegador.
 */
export function resolveUploadUrl(storedPath) {
  if (!storedPath) return null
  if (storedPath.startsWith('data:') || /^https?:\/\//i.test(storedPath)) {
    return storedPath
  }

  const base = (import.meta.env.VITE_UPLOADS_URL || '/uploads').replace(/\/$/, '')
  const relative = String(storedPath)
    .replace(/^uploads[/\\]/i, '')
    .split(/[/\\]/)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${base}/${relative}`
}
