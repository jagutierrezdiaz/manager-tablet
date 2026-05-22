import express from 'express'
import { listUsers, listNotSuspendedUsers, getUser, getListSupervisores } from '../controllers/usersController.js'

const router = express.Router()

// GET /api/users
router.get('/', listUsers)

// GET /api/users/not-suspended
router.get('/not-suspended', listNotSuspendedUsers)

// GET /api/users/supervisores
router.get('/get-supervisores', getListSupervisores)

// GET /api/users/:id
router.get('/:id', getUser)

export default router
