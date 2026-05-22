import { getOtmProgramadas, getDatosOtmById, getTipoRepuestos, getRepuestos } from '../services/otmProgramadaService.js'

export async function listOtmProgramadas(req, res, next) {
    try {
        const codigoPersona = String(req.query.codigoPersona || '').trim()
        if (!codigoPersona) {
            return res.status(400).json({ error: 'codigoPersona es requerido' })
        }
        const otmProgramada = await getOtmProgramadas(codigoPersona)
        res.json(otmProgramada)
    }
    catch (err) {
        next(err)
    }
}

export async function getDatosOtmProgramada(req, res, next) {
    try {
        const idOtmProgramada = String(req.query.idOtmProgramada || '').trim()
        const datosOtmProgramada = await getDatosOtmById(idOtmProgramada)
        res.json(datosOtmProgramada)
    }
    catch (err) {
        next(err)
    }
}

export async function getListTipoRepuestos(req, res, next) {
    try {
        const tipoRepuestos = await getTipoRepuestos()
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
        const repuestos = await getRepuestos(parseInt(idTipoRepuesto, 10))
        res.json(repuestos)
    }
    catch (err) {
        next(err)
    }
}