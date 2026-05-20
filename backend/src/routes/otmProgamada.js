import express from 'express'
import * as otmProgramadaController from '../controllers/otmProgramadaController.js'

const router = express.Router()

// GET /api/otmProgamada/list-otm-programadas
router.get('/list-otm-programadas', otmProgramadaController.listOtmProgramadas)
router.get('/get-datos-otm-programada', otmProgramadaController.getDatosOtmProgramada)



export default router
