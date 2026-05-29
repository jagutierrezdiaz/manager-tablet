import express from 'express'
import { check, register, getMyIp } from '../controllers/deviceController.js'

const router = express.Router()

router.get('/check', check)
router.post('/register', register)
router.get('/my-ip', getMyIp)

export default router
