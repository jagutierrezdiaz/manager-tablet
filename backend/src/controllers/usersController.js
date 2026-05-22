import { getUserById, getAllUsers, getNotSuspendedUsers, getSupervisores } from '../services/usersService.js'

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
    const { id } = req.params
    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ error: 'Parametro invalido' })
    }
    const user = await getUserById(parseInt(id, 10))
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