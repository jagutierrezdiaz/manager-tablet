import express from 'express'
import usersRouter from './users.js'
import graficsRouter from './grafic.js'
import personRouteListRouter from './personRouteList.js'
import otmProgramadaRouter from './otmProgamada.js'
import otmCorrectivaRouter from './otmCorrectiva.js'
import deviceRouter from './device.js'

const router = express.Router()

// Montar subrutas de la API aquí.
router.use('/users', usersRouter)
router.use('/grafics', graficsRouter)
router.use('/personRouteList', personRouteListRouter)
router.use('/otmProgramada', otmProgramadaRouter)
router.use('/otmCorrectiva', otmCorrectivaRouter)
router.use('/device', deviceRouter)

export default router

