import * as otmProgramadaService from '../services/otmProgramadaService.js'

export async function listOtmProgramadas(req, res, next) {
    try {
        const codigoPersona = String(req.query.codigoPersona || '').trim()
        if (!codigoPersona) {
            return res.status(400).json({ error: 'codigoPersona es requerido' })
        }
        const otmProgramada = await otmProgramadaService.getOtmProgramadas(codigoPersona)
        res.json(otmProgramada)
    }
    catch (err) {
        next(err)
    }
}

export async function getDatosOtmProgramada(req, res, next) {
    try {
        const idOtmProgramada = String(req.query.idOtmProgramada || '').trim()
        const datosOtmProgramada = await otmProgramadaService.getDatosOtmById(idOtmProgramada)
        res.json(datosOtmProgramada)
    }
    catch (err) {
        next(err)
    }
}

export async function getListTipoRepuestos(req, res, next) {
    try {
        const tipoRepuestos = await otmProgramadaService.getTipoRepuestos()
        res.json(tipoRepuestos)
    }
    catch (err) {
        next(err)
    }
}

export async function getListRepuestos(req, res, next) {
    try {
        const idTipoRepuesto = String(req.query.idTipoRepuesto || '').trim()
        if (!idTipoRepuesto) {
            return res.status(400).json({ error: 'idTipoRepuesto es requerido' })
        }
        const repuestos = await otmProgramadaService.getRepuestos(parseInt(idTipoRepuesto, 10))
        res.json(repuestos)
    }
    catch (err) {
        next(err)
    }
}

export async function savePersonaAsignadaOtmController(req, res, next) {
    try {
        const idOtm = String(req.params.idOtm || '').trim()
        const personaAsignada = req.body
        const rows = await otmProgramadaService.savePersonaAsignadaOtm(idOtm, personaAsignada)
        res.json(rows)
    }
    catch (err) {
        next(err)
    }
}

export async function deletePersonaAsignadaOtmController(req, res, next) {
    try {
        const idOtm = String(req.query.idOtm || '').trim()
        const codigoPersona = String(req.query.codigoPersona || '').trim()

        if (!idOtm || !codigoPersona) {
            return res.status(400).json({ error: 'idOtm y codigoPersona son requeridos' })
        }

        const rows = await otmProgramadaService.deletePersonaAsignadaOtm(idOtm, codigoPersona)
        res.json(rows)
    }
    catch (err) {
        next(err)
    }
}

export async function deleteSupervisorOtmController(req, res, next) {
    try {
        const idOtm = String(req.query.idOtm || '').trim()
        const codigoPersona = String(req.query.codigoPersona || '').trim()

        if (!idOtm || !codigoPersona) {
            return res.status(400).json({ error: 'idOtm y codigoPersona son requeridos' })
        }

        const result = await otmProgramadaService.deleteSupervisorOtm(idOtm, codigoPersona)
        res.json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function deleteFirmaPersonalOtmController(req, res, next) {
    try {
        const idOtm = String(req.query.idOtm || '').trim()
        const codigoPersona = String(req.query.codigoPersona || '').trim()

        if (!idOtm || !codigoPersona) {
            return res.status(400).json({ error: 'idOtm y codigoPersona son requeridos' })
        }

        const result = await otmProgramadaService.deleteFirmaPersonalOtm(idOtm, codigoPersona)
        res.json(result)
    }
    catch (err) {
        next(err)
    }
}

export async function getRepuestosAsignadosOtmController(req, res, next) {
    try {
        const idOtm = String(req.params.idOtm || req.query.idOtm || '').trim()
        if (!idOtm) {
            return res.status(400).json({ error: 'idOtm es requerido' })
        }
        const repuestosAsignados = await otmProgramadaService.getRepuestosAsignadosOtm(idOtm)
        res.json(repuestosAsignados)
    }
    catch (err) {
        next(err)
    }
}


export async function saveRepuestosAsignadosOtmController(req, res, next) { 
    try {
        const idOtm = String(req.params.idOtm || req.query.idOtm || '').trim()
        const repuestosAsignados = req.body
        const rows = await otmProgramadaService.saveRepuestosAsignadosOtm(idOtm, repuestosAsignados)
        res.json(rows)
    } catch (err) {
        next(err)
    }
}

export async function deleteRepuestosAsignadosOtmController(req, res, next) {
    try {
        const idOtm = String(req.params.idOtm || req.query.idOtm || '').trim()
        const idRepuesto = String(req.params.idRepuesto || req.query.idRepuesto || '').trim()

        if (!idOtm || !idRepuesto) {
            return res.status(400).json({ error: 'idOtm e idRepuesto son requeridos' })
        }

        const rows = await otmProgramadaService.deleteRepuestosAsignadosOtm(idOtm, idRepuesto)
        res.json(rows)
    }
    catch (err) {
        next(err)
    }
}

export async function aprobarOtmController(req, res, next) {
    try {
        const idOtm = String(req.params.idOtm || '').trim()
        const supervisorData = req.body
        const result = await otmProgramadaService.aprobarOtm(idOtm, supervisorData)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export async function saveOtmPhotoController(req, res, next) {
    try {
        const idOtm = String(req.params.idOtm || '').trim()
        const { photoNumber, image } = req.body
        const result = await otmProgramadaService.saveOtmPhoto(idOtm, photoNumber, image)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export async function deleteOtmPhotoController(req, res, next) {
    try {
        const idOtm = String(req.params.idOtm || '').trim()
        const photoNumber = req.query.photoNumber
        const result = await otmProgramadaService.deleteOtmPhoto(idOtm, photoNumber)
        res.json(result)
    } catch (err) {
        next(err)
    }
}


export async function saveCumplimientoOtmController(req, res, next) {
    try {
        const { tiempoReal, indiceCumplimiento, efectividadCumplimiento, comentariosCierre, tiempoMod, idOtm } = req.body
        
        
        console.log(tiempoReal, indiceCumplimiento, efectividadCumplimiento, comentariosCierre, tiempoMod, idOtm)

        if (!tiempoReal || !indiceCumplimiento || !efectividadCumplimiento || !comentariosCierre || !tiempoMod || !idOtm) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' })
        }
        
        const result = await otmProgramadaService.saveCumplimientoOtm(tiempoReal, indiceCumplimiento, efectividadCumplimiento, comentariosCierre, tiempoMod, idOtm)
        res.json(result)
    } catch (err) {
        next(err)
    }
}


export async function assignOtmToUserController(req, res, next) {
    try {
        const { idOtm, codigoPersona } = req.body
        if (!idOtm || !codigoPersona) {
            return res.status(400).json({ error: 'idOtm y codigoPersona son requeridos' })
        }
        const result = await otmProgramadaService.assignOtmToUser(idOtm, codigoPersona)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export async function validarOtmAnteriorController(req, res, next) {
    try {
        const idNumerico = String(req.body.idNumerico || '').trim()
        const idEquipo = String(req.body.idEquipo || '').trim()
        const idActividad = String(req.body.idActividad || '').trim()
        const result = await otmProgramadaService.validarOtmAnterior(idNumerico, idEquipo, idActividad)
        res.json(result)
    } catch (err) {
        next(err)
    }
}