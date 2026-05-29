import express from 'express'
import * as otmProgramadaController from '../controllers/otmProgramadaController.js'

const router = express.Router()

// GET /api/otmProgamada/list-otm-programadas
router.get('/list-otm-programadas', otmProgramadaController.listOtmProgramadas)
router.get('/get-datos-otm-programada', otmProgramadaController.getDatosOtmProgramada)
router.get('/get-tipo-repuestos', otmProgramadaController.getListTipoRepuestos)
router.get('/get-repuestos', otmProgramadaController.getListRepuestos)
router.post('/save-persona-asignada-otm/:idOtm', otmProgramadaController.savePersonaAsignadaOtmController)
router.delete('/delete-persona-asignada-otm', otmProgramadaController.deletePersonaAsignadaOtmController)
router.get('/get-repuestos-asignados-otm', otmProgramadaController.getRepuestosAsignadosOtmController)
router.post('/save-repuestos-asignados-otm', otmProgramadaController.saveRepuestosAsignadosOtmController)
router.delete('/delete-repuestos-asignados-otm', otmProgramadaController.deleteRepuestosAsignadosOtmController)


export default router
