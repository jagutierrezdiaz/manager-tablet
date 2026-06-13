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
    const { id_persistente, direccion_ip } = req.body
    if (!id_persistente || !direccion_ip) {
      return res.status(400).json({ error: 'ID persistente y dirección IP son requeridos' })
    }
    const device = await registerDevice(id_persistente, direccion_ip)
    res.status(201).json({ message: 'Dispositivo registrado exitosamente', device })
  } catch (err) {
    next(err)
  }
}

export async function getMyIp(req, res, next) {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    if (!response.ok) {
      return res.status(502).json({ error: 'No se pudo obtener la IP pública del servidor' })
    }
    const data = await response.json()
    if (!data?.ip) {
      return res.status(502).json({ error: 'Respuesta inválida al consultar la IP pública' })
    }
    res.json({ ip: data.ip })
  } catch (error) {
    console.error('Error obteniendo IP pública:', error)
    next(error)
  }
}
