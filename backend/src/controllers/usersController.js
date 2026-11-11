import { getUserById, getAllUsers, getNotSuspendedUsers, getSupervisores, getPersonasAsignadas, getSupervisorAsignado } from '../services/usersService.js'

export async function listUsers(req, res, next) {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (err) {
    next(err)
  }
}

export async function listNotSuspendedUsers(req, res, next) {
  try {
    const users = await getNotSuspendedUsers()
    res.json(users)
  } catch (err) {
    next(err)
  }
}

export async function getUser(req, res, next) {
  try {
    // CODIGO_PERSONA es string(10): conservar ceros a la izquierda (ej. "0207")
    const id = String(req.params.id ?? '').trim()
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Parametro invalido' })
    }
    const user = await getUserById(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
}


export async function getListSupervisores(req, res, next) {
  try {
    const supervisores = await getSupervisores()
    res.json(supervisores)
  } catch (err) {
    next(err)
  }
}

export async function getListPersonasAsignadas(req, res, next) {
  try {
    const idOtm = req.params.idOtm || req.query.idOtm
    if (!idOtm) {
      return res.status(400).json({ error: 'Falta el parámetro idOtm' })
    }
    const personasAsignadas = await getPersonasAsignadas(idOtm)
    res.json(personasAsignadas)
  } catch (err) {
    next(err)
  }
}

export async function getSupervisorAsignadoController(req, res, next) {
  try {
    const idOtm = req.params.idOtm || req.query.idOtm
    if (!idOtm) {
      return res.status(400).json({ error: 'Falta el parámetro idOtm' })
    }
    const supervisor = await getSupervisorAsignado(idOtm)
    res.json(supervisor)
  } catch (err) {
    next(err)
  }
}
