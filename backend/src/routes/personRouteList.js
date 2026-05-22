import express from 'express'
import { getlistPersonRoute } from '../controllers/personRouteListController.js'

const router = express.Router()

// GET /api/personRouteList
router.get('/', getlistPersonRoute)

export default router
