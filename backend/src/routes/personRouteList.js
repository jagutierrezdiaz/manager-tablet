import express from 'express'
import { getlistPersonRoute, getRouteDetails, getEjecucionRutaController, saveEjecucionRutaController, cumplirRutaController, getAllRoutesDetailsController } from '../controllers/personRouteListController.js'

const router = express.Router()

// GET /api/personRouteList
router.get('/', getlistPersonRoute)

// GET /api/personRouteList/all-routes-details/
router.get('/all-routes-details', getAllRoutesDetailsController)

// GET /api/personRouteList/details/:idTipoRuta
router.get('/details', getRouteDetails)

// GET /api/personRouteList/ejecucion-ruta/:idNumero/:idTipoRuta/:idEquipo
router.get('/ejecucion-ruta', getEjecucionRutaController)

// POST /api/personRouteList/ejecucion-ruta
router.post('/ejecucion-ruta', saveEjecucionRutaController)

// POST /api/personRouteList/cumplir-ruta
router.post('/cumplir-ruta', cumplirRutaController)

export default router
