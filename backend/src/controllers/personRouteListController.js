import * as personRouteListService from '../services/personRouteListService.js'

export async function getlistPersonRoute(req, res, next) {
    try {
        const codigoPersona = String(req.query.codigoPersona || '').trim()
        if (!codigoPersona) {
            return res.status(400).json({ error: 'codigoPersona es requerido' })
        }
        const personRoute = await personRouteListService.listPersonRoute(codigoPersona)
        res.json(personRoute)
    } catch (err) {
        next(err)
    }
}

export async function getRouteDetails(req, res, next) {
    try {
        const idTipoRuta = req.params.idTipoRuta
        if (!idTipoRuta) {
            return res.status(400).json({ error: 'idTipoRuta es requerido' })
        }
        const routeDetails = await personRouteListService.getRouteDetails(idTipoRuta)
        res.json(routeDetails)
    } catch (err) {
        next(err)
    }
}

export async function getEjecucionRutaController(req, res, next) {
    try {
        const idNumero = req.query.idNumero
        const idTipoRuta = req.query.idTipoRuta
        const idEquipo = req.query.idEquipo
        const ejecucionRuta = await personRouteListService.getEjecucionRuta(idNumero, idTipoRuta, idEquipo)
        res.json(ejecucionRuta)
    } catch (err) {
        next(err)
    }
}

export async function saveEjecucionRutaController(req, res, next) {
    try {
        const data = req.body
        const ejecucionRuta = await personRouteListService.saveEjecucionRuta(data)
        res.json(ejecucionRuta)
    } catch (err) {
        next(err)
    }
}