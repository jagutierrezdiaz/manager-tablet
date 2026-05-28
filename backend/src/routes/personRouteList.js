import express from 'express'
import { getlistPersonRoute, getRouteDetails, getEjecucionRutaController, saveEjecucionRutaController } from '../controllers/personRouteListController.js'

const router = express.Router()

// GET /api/personRouteList
router.get('/', getlistPersonRoute)

// GET /api/personRouteList/details/:idTipoRuta
router.get('/details/:idTipoRuta', getRouteDetails)

// GET /api/personRouteList/ejecucion-ruta/:idNumero/:idTipoRuta/:idEquipo
router.get('/ejecucion-ruta/', getEjecucionRutaController)

// POST /api/personRouteList/ejecucion-ruta
router.post('/ejecucion-ruta', saveEjecucionRutaController)

export default router
