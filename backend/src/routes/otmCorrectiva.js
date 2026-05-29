import express from 'express'
import { getListMachines, getDetailMachineController, getListEquiposController, getListActividadesController } from '../controllers/otmCorrectivaController.js'

const router = express.Router()

// GET /api/otmCorrectiva/list-machines
router.get('/list-machines', getListMachines)

// GET /api/otmCorrectiva/get-detail-machine/:idMachine
router.get('/get-detail-machine/:idMachine', getDetailMachineController)

// GET /api/otmCorrectiva/get-list-equipos/:idMachine
router.get('/get-list-equipos/:idMachine', getListEquiposController)

// GET /api/otmCorrectiva/get-list-actividades/:claseActividad
router.get('/get-list-actividades/:claseActividad', getListActividadesController)
export default router
