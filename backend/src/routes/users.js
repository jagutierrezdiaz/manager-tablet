import express from 'express'
import { listUsers, listNotSuspendedUsers, getUser, getListSupervisores, getListPersonasAsignadas } from '../controllers/usersController.js'

const router = express.Router()

// GET /api/users
router.get('/', listUsers)

// GET /api/users/not-suspended
router.get('/not-suspended', listNotSuspendedUsers)

// GET /api/users/supervisores
router.get('/get-supervisores', getListSupervisores)

// GET /api/users/personas-asignadas
router.get('/personas-asignadas', getListPersonasAsignadas)

// GET /api/users/personas-asignadas/:idOtm
router.get('/personas-asignadas/:idOtm', getListPersonasAsignadas)

// GET /api/users/:id
router.get('/:id', getUser)

export default router
