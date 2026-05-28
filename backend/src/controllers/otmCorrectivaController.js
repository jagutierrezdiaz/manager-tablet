import * as otmCorrectivaService from '../services/otmCorrectivaService.js'

export async function getListMachines(req, res, next) {
    try {
        const machines = await otmCorrectivaService.getMachines()
        res.json(machines)
    } catch (error) {
        next(error)
    }
}

export async function getDetailMachineController(req, res, next) {
    try {
        const idMachine = req.params.idMachine
        const detailMachine = await otmCorrectivaService.getDetailMachine(idMachine)
        res.json(detailMachine)
    } catch (err) {
        next(err)
    }
}


export async function getListEquiposController(req, res, next) {
    try {
        const idMachine = req.params.idMachine
        const listEquipos = await otmCorrectivaService.getListEquipos(idMachine)
        res.json(listEquipos)
    } catch (err) {
        next(err)
    }
}

export async function getListActividadesController(req, res, next) {
    try {
        const claseActividad = req.params.claseActividad
        const listActividades = await otmCorrectivaService.getListActividades(claseActividad)
        res.json(listActividades)
    } catch (err) {
        next(err)
    }
}