import express from 'express'
import { getListMachines, getDetailMachineController, getListEquiposController, getListActividadesController, saveOTMCorrectivaController } from '../controllers/otmCorrectivaController.js'

const router = express.Router()

// GET /api/otmCorrectiva/list-machines
router.get('/list-machines', getListMachines)

// GET /api/otmCorrectiva/get-detail-machine/:idMachine
router.get('/get-detail-machine/:idMachine', getDetailMachineController)

// GET /api/otmCorrectiva/get-list-equipos/:idMachine
router.get('/get-list-equipos/:idMachine', getListEquiposController)

// GET /api/otmCorrectiva/get-list-actividades  (todas)
router.get('/get-list-actividades', getListActividadesController)

// GET /api/otmCorrectiva/get-list-actividades/:claseActividad  (filtrada por clase)
router.get('/get-list-actividades/:claseActividad', getListActividadesController)

// POST /api/otmCorrectiva/save-otm
router.post('/save-otm', saveOTMCorrectivaController)

export default router
