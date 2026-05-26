import { checkDevice, registerDevice } from '../services/deviceService.js'

export async function check(req, res, next) {
  try {
    const { id_persistente, direccion_ip } = req.query
    if (!id_persistente || !direccion_ip) {
      return res.status(400).json({ error: 'ID persistente y dirección IP son requeridos' })
    }
    const device = await checkDevice(id_persistente, direccion_ip)
    res.json({ registered: !!device, device })
  } catch (err) {
    next(err)
  }
}

export async function register(req, res, next) {
  try {
    const { id_persistente, direccion_ip, estado, codigo_persona } = req.body
    if (!id_persistente || !direccion_ip || !estado) {
      return res.status(400).json({ error: 'ID persistente, dirección IP y estado son requeridos' })
    }
    await registerDevice(id_persistente, direccion_ip, estado, codigo_persona)
    res.status(201).json({ message: 'Dispositivo registrado exitosamente' })
  } catch (err) {
    next(err)
  }
}

export function getMyIp(req, res) {
  // En muchos entornos, req.ip puede estar detrás de un proxy.
  // Intentamos obtener la IP real.
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  // Si es IPv6 localhost, convertir a IPv4
  const cleanIp = ip === '::1' ? '127.0.0.1' : ip.replace(/^.*:/, '')
  res.json({ ip: cleanIp })
}
