import db, { logSql, toFirebirdBlobText, fromFirebirdText } from '../db/index.js'
import { firebirdNodeEncoding } from '../db/firebirdEncoding.js'

const LOG_CUMPLIR_OTM = '[CUMPLIR-OTM]'
const LOG_ELIMINAR_PERSONA_OTM = '[ELIMINAR-PERSONA-OTM]'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
    getFirmaPersonalDir,
    getFotosOtmDir,
    toPublicPath,
    toAbsolutePath
} from '../config/uploads.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** Suma días a una fecha (Firebird: fecha + entero = días). */
function addDaysToDate(fecha, dias) {
    const d = fecha instanceof Date ? new Date(fecha) : new Date(fecha)
    if (Number.isNaN(d.getTime())) {
        throw new Error(`Fecha inválida: ${fecha}`)
    }
    d.setDate(d.getDate() + Number(dias))
    return d
}

export async function getOtmProgramadas(codigoPersona) {
    const sql = `
        SELECT 
            OTM.ID_OTM,
            OTM.FECHA_PROGRAMADA, 
            OTM.LIMITE_CIERRE,
            AC.NOMBRE_ACTIVIDAD, 
            AC.TIPO_MANTENIMIENTO,
            AC.CLASE_ACTIVIDAD
        FROM OTM, ACTIVIDAD AC, CIERRE_MOD CM
        WHERE OTM.CUMPLIDA = 'NO'
            AND OTM.ID_ACTIVIDAD = AC.ID_ACTIVIDAD
            AND OTM.ID_OTM = CM.ID_OTM
            AND AC.TIPO_PROGRAMA IN ('PERIODO', 'NINGUNO')
            AND CM.CODIGO_PERSONA = ?
        ORDER BY OTM.FECHA_PROGRAMADA`
    const rows = await db.query(sql, [codigoPersona])
    return rows
}

function decodeBlobTextField(value) {
    if (value == null) return value
    if (Buffer.isBuffer(value)) return value.toString(firebirdNodeEncoding)
    if (typeof value === 'string') return fromFirebirdText(value)
    return value
}

export async function getDatosOtmById(idOtmProgramada) {
    const sql = `
        SELECT
            OTM.ID_NUMERICO,
            OTM.ID_OTM,
            OTM.FECHA_PROGRAMADA,
            OTM.FECHA_CIERRE,
            OTM.LIMITE_CIERRE,
            CAST(OTM.OBSERVACION_OTM AS VARCHAR(2000) CHARACTER SET OCTETS) AS OBSERVACION_OTM,
            CAST(OTM.COMENTARIOS_DE_CIERRE AS VARCHAR(2000) CHARACTER SET OCTETS) AS COMENTARIOS_DE_CIERRE,
            CAST(OTM.FOTO_1 AS VARCHAR(255)) AS FOTO_1,
            CAST(OTM.FOTO_2 AS VARCHAR(255)) AS FOTO_2,
            OTM.TIEMPO_REAL,
            OTM.TIEMPO_PROGRAMADO,

            AC.ID_ACTIVIDAD,
            AC.NOMBRE_ACTIVIDAD,
            AC.CLASE_ACTIVIDAD,
            AC.TIPO_MANTENIMIENTO,
            AC.PROGRAMABLE,
            AC.TIPO_PROGRAMA,

            BL.ID_PROCESO,
            BL.NOMBRE_PROCESO,
            BL.ID_ETAPA,
            BL.NOMBRE_ETAPA,
            BL.ID_MAQUINA,
            BL.NOMBRE_MAQUINA,
            BL.ID_EQUIPO,
            BL.NOMBRE_EQUIPO,

            AE.TIEMPO_MANTENIMIENTO,
            AE.VALOR_VARIABLE_MTTO AS TIEMPO_ESTIMADO_ACTIVIDAD,
            AE.VALOR_MINIMO,
            AE.VALOR_MAXIMO

        FROM OTM
        INNER JOIN ACTIVIDAD AC
                ON OTM.ID_ACTIVIDAD = AC.ID_ACTIVIDAD

        INNER JOIN QRBASE_LAYOUT BL
                ON OTM.ID_EQUIPO = BL.ID_EQUIPO

        INNER JOIN ACTIVIDAD_EQUIPO AE
                ON OTM.ID_EQUIPO = AE.ID_EQUIPO
            AND OTM.ID_ACTIVIDAD = AE.ID_ACTIVIDAD

        WHERE OTM.ID_OTM = ?
    `

    const rows = await db.query(sql, [idOtmProgramada])
    const list = Array.isArray(rows) ? rows : []
    return list.map((row) => ({
        ...row,
        OBSERVACION_OTM: decodeBlobTextField(row.OBSERVACION_OTM),
        COMENTARIOS_DE_CIERRE: decodeBlobTextField(row.COMENTARIOS_DE_CIERRE),
        NOMBRE_ACTIVIDAD: typeof row.NOMBRE_ACTIVIDAD === 'string'
            ? fromFirebirdText(row.NOMBRE_ACTIVIDAD)
            : row.NOMBRE_ACTIVIDAD
    }))
}

export async function getTipoRepuestos() {
    const sql = `
        SELECT 
            ID_TIPO_REPUESTO, 
            NOMBRE_TIPO_REPUESTO
        FROM TIPO_REPUESTO
        ORDER BY NOMBRE_TIPO_REPUESTO
    `
    const rows = await db.query(sql)
    return rows
}


export async function getRepuestos(idTipoRepuesto) {
    const sql = `
        SELECT 
            RE.ID_REPUESTO,
            RE.NOMBRE_REPUESTO,
            UM.UNIDAD_MEDIDA,
            CAST(CAST(RE.INV_ACTUAL AS NUMERIC(15,2)) AS VARCHAR(20)) AS INV_ACTUAL
        FROM REPUESTO RE
        INNER JOIN TIPO_REPUESTO TR
            ON RE.ID_TIPO_REPUESTO = TR.ID_TIPO_REPUESTO
        INNER JOIN UNIDAD_MEDIDA UM
            ON RE.UND_MEDIDA = UM.ID_UND
        WHERE TR.ID_TIPO_REPUESTO = ?
        ORDER BY RE.NOMBRE_REPUESTO;
    `
    const rows = await db.query(sql, [idTipoRepuesto])
    return rows
}

export async function savePersonaAsignadaOtm(idOtm, personaAsignada) {
    // Reemplazar la 'T' por un espacio para compatibilidad con Firebird
    const fechaInicio = personaAsignada.horaInicio.replace('T', ' ')
    const fechaFin = personaAsignada.horaFin.replace('T', ' ')

    // Convertir "HH:mm:ss" o "HH:mm" a horas decimales para la base de datos
    // Firebird espera un número en HORAS_TRABAJO
    let horasDecimales = 0
    if (personaAsignada.horaTotal && typeof personaAsignada.horaTotal === 'string') {
        const parts = personaAsignada.horaTotal.split(':')
        const h = parseInt(parts[0], 10) || 0
        const m = parseInt(parts[1], 10) || 0
        const s = parseInt(parts[2], 10) || 0
        horasDecimales = h + (m / 60) + (s / 3600)
        horasDecimales = parseFloat(horasDecimales.toFixed(2))
    } else {
        horasDecimales = parseFloat(personaAsignada.horaTotal) || 0
    }

    // 1. Guardar la firma si existe y es nueva (base64)
    if (personaAsignada.firma && personaAsignada.firma.startsWith('data:image/')) {
        await saveSignatureFile(idOtm, personaAsignada)
    }

    const sqlCheck = 'SELECT * FROM CIERRE_MOD WHERE ID_OTM = ? AND CODIGO_PERSONA = ?'
    const rows = await db.query(sqlCheck, [idOtm, personaAsignada.codigoPersona])

    if (rows && rows.length > 0) {
        const sqlUpdate = `
            UPDATE CIERRE_MOD 
            SET FECHA_INICIO = ?, FECHA_FIN = ?, ANO = ?, MES = ?, HORAS_TRABAJO = ?
            WHERE ID_OTM = ? AND CODIGO_PERSONA = ?
        `
        return await db.query(sqlUpdate, [
            fechaInicio,
            fechaFin,
            personaAsignada.ano,
            personaAsignada.mes,
            horasDecimales,
            idOtm,
            personaAsignada.codigoPersona
        ])
    } else {
        const sqlInsert = `
            INSERT INTO CIERRE_MOD (ID_OTM, CODIGO_PERSONA, FECHA_INICIO, FECHA_FIN, ANO, MES, HORAS_TRABAJO)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        return await db.query(sqlInsert, [
            idOtm,
            personaAsignada.codigoPersona,
            fechaInicio,
            fechaFin,
            personaAsignada.ano,
            personaAsignada.mes,
            horasDecimales
        ])
    }
}

async function saveSignatureFile(idOtm, personaAsignada) {
    try {
        const base64Data = personaAsignada.firma.replace(/^data:image\/png;base64,/, "")
        const uploadDir = getFirmaPersonalDir()

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const cleanNombre = personaAsignada.nombrePersona.replace(/[\\/:*?"<>|]/g, "")
        const fileName = `${idOtm}_${personaAsignada.codigoPersona}_${cleanNombre}.png`
        const filePath = path.join(uploadDir, fileName)

        fs.writeFileSync(filePath, base64Data, 'base64')

        const urlFirma = toPublicPath('Firma_Personal', fileName)

        // Verificar si ya existe la firma para esta OTM y persona
        const sqlCheck = 'SELECT ID_NUMERICO FROM FIRMA_PERSONAL WHERE ID_OTM = ? AND CODIGO_PERSONAL = ?'
        const rows = await db.query(sqlCheck, [idOtm, personaAsignada.codigoPersona])

        if (rows && rows.length > 0) {
            const sqlUpdate = 'UPDATE FIRMA_PERSONAL SET URL_FIRMA = ? WHERE ID_OTM = ? AND CODIGO_PERSONAL = ?'
            await db.query(sqlUpdate, [urlFirma, idOtm, personaAsignada.codigoPersona])
        } else {
            // Obtener el siguiente ID_NUMERICO
            const sqlMaxId = 'SELECT MAX(ID_NUMERICO) AS MAXID FROM FIRMA_PERSONAL'
            const maxRows = await db.query(sqlMaxId)
            const nextId = (maxRows[0]?.MAXID || 0) + 1

            const sqlInsert = 'INSERT INTO FIRMA_PERSONAL (ID_NUMERICO, CODIGO_PERSONAL, URL_FIRMA, ID_OTM) VALUES (?, ?, ?, ?)'
            await db.query(sqlInsert, [nextId, personaAsignada.codigoPersona, urlFirma, idOtm])
        }
    } catch (error) {
        console.error('Error saving signature file:', error)
        throw error
    }
}

function deletePhysicalFile(publicPath) {
    if (!publicPath) return

    const absolutePath = toAbsolutePath(publicPath)
    if (absolutePath && fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath)
    }
}

async function deleteSignatureFile(idOtm, codigoPersona, logTag) {
    const params = [idOtm, codigoPersona]
    const sqlGet = `
        SELECT CAST(URL_FIRMA AS VARCHAR(255)) AS URL_FIRMA
        FROM FIRMA_PERSONAL
        WHERE ID_OTM = ? AND CODIGO_PERSONAL = ?
    `
    if (logTag) logSql(sqlGet, params, `${logTag} SELECT firma`)
    const rows = await db.query(sqlGet, params)

    if (rows.length > 0) {
        deletePhysicalFile(rows[0].URL_FIRMA)
    }

    const sqlDelete = 'DELETE FROM FIRMA_PERSONAL WHERE ID_OTM = ? AND CODIGO_PERSONAL = ?'
    if (logTag) logSql(sqlDelete, params, `${logTag} DELETE firma`)
    await db.query(sqlDelete, params)
}

export async function deleteFirmaPersonalOtm(idOtm, codigoPersona) {
    await deleteSignatureFile(idOtm, codigoPersona)
    return { success: true, message: 'Firma eliminada correctamente' }
}



export async function deletePersonaAsignadaOtm(idOtm, codigoPersona) {
    await deleteSignatureFile(idOtm, codigoPersona, LOG_ELIMINAR_PERSONA_OTM)

    const sql = `
        DELETE FROM CIERRE_MOD WHERE ID_OTM = ? AND CODIGO_PERSONA = ?
    `
    const params = [idOtm, codigoPersona]
    logSql(sql, params, `${LOG_ELIMINAR_PERSONA_OTM} DELETE CIERRE_MOD`)
    const rows = await db.query(sql, params)
    return rows
}

export async function deleteSupervisorOtm(idOtm, codigoPersona) {
    await deleteSignatureFile(idOtm, codigoPersona)
    return { success: true, message: 'Supervisor eliminado correctamente' }
}



export async function getRepuestosAsignadosOtm(idOtm) {
    const sql = `
        SELECT
            RP.ID_REPUESTO,
            RP.NOMBRE_REPUESTO,
            UM.UNIDAD_MEDIDA,
            CR.UND_PROGRAMADA,
            CR.UND_REAL
        FROM CIERRE_REPUESTO CR
        INNER JOIN REPUESTO RP
            ON CR.ID_REPUESTO = RP.ID_REPUESTO
        INNER JOIN UNIDAD_MEDIDA UM
            ON RP.UND_MEDIDA = UM.ID_UND
        WHERE CR.ID_OTM = ?
        ORDER BY RP.NOMBRE_REPUESTO;
    `
    const rows = await db.query(sql, [idOtm])
    return rows
}

export async function saveRepuestosAsignadosOtm(idOtm, repuestosAsignados) {
    // Verificar si ya existe para actualizar o insertar
    const sqlCheck = 'SELECT * FROM CIERRE_REPUESTO WHERE ID_OTM = ? AND ID_REPUESTO = ?'
    const rows = await db.query(sqlCheck, [idOtm, repuestosAsignados.ID_REPUESTO])

    if (rows && rows.length > 0) {
        const sqlUpdate = `
            UPDATE CIERRE_REPUESTO 
            SET UND_REAL = ?, ANO = ?, MES = ?
            WHERE ID_OTM = ? AND ID_REPUESTO = ?
        `
        return await db.query(sqlUpdate, [
            repuestosAsignados.UND_REAL,
            repuestosAsignados.ano,
            repuestosAsignados.mes,
            idOtm,
            repuestosAsignados.ID_REPUESTO
        ])
    } else {
        const sqlInsert = `
            INSERT INTO CIERRE_REPUESTO
            (ID_OTM, ID_REPUESTO, ANO, MES, UND_PROGRAMADA, UND_REAL, VLR_UNIDAD, VLR_REPUESTO)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
        return await db.query(sqlInsert, [
            idOtm,
            repuestosAsignados.ID_REPUESTO,
            repuestosAsignados.ano,
            repuestosAsignados.mes,
            0,
            repuestosAsignados.UND_REAL,
            0,
            0
        ])
    }
}


export async function deleteRepuestosAsignadosOtm(idOtm, idRepuesto) {
    const sql = `
        DELETE FROM CIERRE_REPUESTO WHERE ID_OTM = ? AND ID_REPUESTO = ?
    `
    const rows = await db.query(sql, [idOtm, idRepuesto])
    return rows
}

export async function aprobarOtm(idOtm, supervisorData) {
    // 1. Guardar la firma si existe y es nueva (base64)
    if (supervisorData.firma && supervisorData.firma.startsWith('data:image/')) {
        await saveSignatureFile(idOtm, supervisorData)
    }

    // 2. Marcar la OTM como aprobada (esto dependerá de tu lógica de negocio, 
    // por ahora solo guardamos la firma y devolvemos éxito)
    // Podrías tener un campo ID_PERSONA_APRUEBA en la tabla OTM
    const sql = 'UPDATE OTM SET ASIGNADA = \'SI\' WHERE ID_OTM = ?'
    await db.query(sql, [idOtm])

    return { success: true, message: 'OTM aprobada correctamente' }
}

export async function saveOtmPhoto(idOtm, photoNumber, base64Data) {
    try {
        const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, "")
        const uploadDir = getFotosOtmDir()

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const fileName = `${idOtm}_foto_${photoNumber}.png`
        const filePath = path.join(uploadDir, fileName)

        fs.writeFileSync(filePath, cleanData, 'base64')

        const urlFoto = toPublicPath('Fotos_OTM', fileName)
        const fieldName = `FOTO_${photoNumber}`

        const sql = `UPDATE OTM SET ${fieldName} = ? WHERE ID_OTM = ?`
        await db.query(sql, [urlFoto, idOtm])

        return { success: true, url: urlFoto }
    } catch (error) {
        console.error('Error saving OTM photo:', error)
        throw error
    }
}

export async function deleteOtmPhoto(idOtm, photoNumber) {
    try {
        const fieldName = `FOTO_${photoNumber}`

        // 1. Obtener la ruta actual del archivo
        const sqlGet = `SELECT CAST(${fieldName} AS VARCHAR(255)) AS RUTA FROM OTM WHERE ID_OTM = ?`
        const rows = await db.query(sqlGet, [idOtm])
        const currentPath = rows[0]?.RUTA

        // 2. Eliminar el archivo físico si existe
        if (currentPath) {
            deletePhysicalFile(currentPath)
        }

        // 3. Limpiar el campo en la base de datos
        const sqlUpdate = `UPDATE OTM SET ${fieldName} = NULL WHERE ID_OTM = ?`
        await db.query(sqlUpdate, [idOtm])

        return { success: true, message: 'Foto eliminada correctamente' }
    } catch (error) {
        console.error('Error deleting OTM photo:', error)
        throw error
    }
}


export async function previewOtmsFuturas(idOtm) {
    const datosRows = await getDatosOtmById(idOtm)
    if (!datosRows.length) {
        return {
            success: true,
            cantidad: 0,
            nombreActividad: null,
            diasProgramacion: 0,
            idNumerico: null,
            idActividad: null,
            idEquipo: null
        }
    }

    const {
        ID_NUMERICO,
        ID_ACTIVIDAD,
        ID_EQUIPO,
        NOMBRE_ACTIVIDAD,
        TIEMPO_ESTIMADO_ACTIVIDAD
    } = datosRows[0]

    const diasProgramacion = Number(TIEMPO_ESTIMADO_ACTIVIDAD ?? 0)

    const sqlFuturas = `
        SELECT ID_NUMERICO, ID_OTM
        FROM OTM
        WHERE ID_NUMERICO > ?
          AND ID_ACTIVIDAD = ?
          AND ID_EQUIPO = ?
          AND CUMPLIDA = 'NO'
        ORDER BY ID_NUMERICO
    `
    const paramsFuturas = [ID_NUMERICO, ID_ACTIVIDAD, ID_EQUIPO]
    logSql(sqlFuturas, paramsFuturas, `${LOG_CUMPLIR_OTM} SELECT preview OTMs futuras`)
    const otmsFuturas = await db.query(sqlFuturas, paramsFuturas)
    const list = Array.isArray(otmsFuturas) ? otmsFuturas : []

    return {
        success: true,
        cantidad: list.length,
        nombreActividad: NOMBRE_ACTIVIDAD ?? null,
        diasProgramacion,
        idNumerico: ID_NUMERICO,
        idActividad: ID_ACTIVIDAD,
        idEquipo: ID_EQUIPO
    }
}

export async function saveCumplimientoOtm(
    tiempoReal,
    indiceCumplimiento,
    efectividadCumplimiento,
    comentariosCierre,
    tiempoMod,
    idOtm,
    reprogramarSiguientes = false
) {
    try {
        const sql = `
            UPDATE OTM
            SET TIEMPO_REAL = ?,
                INDICE_CUMPLIMIENTO = ?,
                EFECTIVIDAD_CUMPLIMIENTO = ?,
                COMENTARIOS_DE_CIERRE = ?,
                TIEMPO_MOD = ?,
                CUMPLIDA = 'SI',
                FECHA_CIERRE = CURRENT_DATE
            WHERE ID_OTM = ?
        `
        const paramsCumplir = [
            tiempoReal,
            indiceCumplimiento,
            efectividadCumplimiento,
            toFirebirdBlobText(comentariosCierre),
            tiempoMod,
            idOtm
        ]
        logSql(sql, paramsCumplir, `${LOG_CUMPLIR_OTM} UPDATE cumplida`)
        await db.query(sql, paramsCumplir)

        // --- Código anterior (UPDATE masivo de OTMs siguientes) ---
        // ... (comentado arriba en historial)

        const sqlParam = 'SELECT LIMITE_CIERRE FROM PARAMETRO'
        logSql(sqlParam, [], `${LOG_CUMPLIR_OTM} SELECT parametro`)
        const paramRows = await db.query(sqlParam, [])
        const varParametroLimiteCierre = Number(paramRows[0]?.LIMITE_CIERRE ?? 0)

        let cantidadFuturas = 0
        let nombreActividad = null
        let diasProgramacion = 0
        let reprogramadas = false

        const datosRows = await getDatosOtmById(idOtm)
        if (datosRows.length > 0) {
            const {
                ID_NUMERICO,
                ID_ACTIVIDAD,
                ID_EQUIPO,
                FECHA_CIERRE,
                TIEMPO_ESTIMADO_ACTIVIDAD,
                NOMBRE_ACTIVIDAD
            } = datosRows[0]

            nombreActividad = NOMBRE_ACTIVIDAD ?? null
            const varValorVariableMantto = Number(TIEMPO_ESTIMADO_ACTIVIDAD ?? 0)
            diasProgramacion = varValorVariableMantto
            let varFechaProgramadaAnterior = FECHA_CIERRE

            const sqlFuturas = `
                SELECT ID_NUMERICO, ID_OTM, ID_EQUIPO, ID_ACTIVIDAD,
                       FECHA_OTM, FECHA_PROGRAMADA, LIMITE_CIERRE, FECHA_CIERRE
                FROM OTM
                WHERE ID_NUMERICO > ?
                  AND ID_ACTIVIDAD = ?
                  AND ID_EQUIPO = ?
                  AND CUMPLIDA = 'NO'
                ORDER BY ID_NUMERICO
            `
            const paramsFuturas = [ID_NUMERICO, ID_ACTIVIDAD, ID_EQUIPO]
            logSql(sqlFuturas, paramsFuturas, `${LOG_CUMPLIR_OTM} SELECT OTMs futuras`)
            const otmsFuturas = await db.query(sqlFuturas, paramsFuturas)
            const listFuturas = Array.isArray(otmsFuturas) ? otmsFuturas : []
            cantidadFuturas = listFuturas.length

            // Paso 5: solo si el usuario aceptó reprogramar y hay OTMs futuras
            if (reprogramarSiguientes && cantidadFuturas > 0) {
                const sqlUpdateOne = `
                    UPDATE OTM O
                    SET O.FECHA_PROGRAMADA = ?,
                        O.LIMITE_CIERRE = ?
                    WHERE O.ID_NUMERICO = ?
                `

                for (const row of listFuturas) {
                    const varIdNumericoOTM = row.ID_NUMERICO
                    const varFechaNuevaProgramada = addDaysToDate(varFechaProgramadaAnterior, varValorVariableMantto)
                    const varLimiteCierre = addDaysToDate(varFechaNuevaProgramada, varParametroLimiteCierre)

                    const paramsUpdateOne = [varFechaNuevaProgramada, varLimiteCierre, varIdNumericoOTM]
                    logSql(sqlUpdateOne, paramsUpdateOne, `${LOG_CUMPLIR_OTM} UPDATE OTM futura ${varIdNumericoOTM}`)
                    await db.query(sqlUpdateOne, paramsUpdateOne)

                    varFechaProgramadaAnterior = varFechaNuevaProgramada
                }
                reprogramadas = true
            }
        }

        let message = 'La orden de trabajo ha sido finalizada con éxito.'
        if (reprogramadas) {
            message = `OTM finalizada. Se reprogramaron ${cantidadFuturas} OTM siguientes de la actividad «${nombreActividad || ''}» (${diasProgramacion} días de programación).`
        } else if (cantidadFuturas > 0) {
            message = 'OTM finalizada. No se reprogramaron las OTM siguientes.'
        } else {
            message = 'OTM finalizada. No había OTM siguientes para reprogramar.'
        }

        return {
            success: true,
            reprogramadas,
            cantidadFuturas,
            nombreActividad,
            diasProgramacion,
            message
        }
    } catch (error) {
        console.error('Error saving OTM cumplimiento:', error)
        throw error
    }
}

export async function saveComentariosCierre(comentariosCierre, idNumerico) {
    try {
        const sql = `
            UPDATE OTM
            SET COMENTARIOS_DE_CIERRE = ?
            WHERE ID_NUMERICO = ?
        `
        await db.query(sql, [toFirebirdBlobText(comentariosCierre), idNumerico])
        return { success: true, message: 'Comentarios de cierre guardados correctamente' }
    } catch (error) {
        console.error('Error saving comentarios de cierre:', error)
        throw error
    }
}


export async function assignOtmToUser(idOtm, codigoPersona) {
    try {
        // Verificar si ya existe la asignación
        const sqlCheck = 'SELECT * FROM CIERRE_MOD WHERE ID_OTM = ? AND CODIGO_PERSONA = ?'
        logSql(sqlCheck, [idOtm, codigoPersona], `${LOG_CUMPLIR_OTM} SELECT asignación usuario`)
        const rows = await db.query(sqlCheck, [idOtm, codigoPersona])

        if (rows && rows.length > 0) {
            return { success: true, message: 'La OTM ya está asignada al usuario' }
        }

        const sqlInsert = `
            INSERT INTO CIERRE_MOD
            (
                ID_OTM,
                CODIGO_PERSONA,
                FECHA_INICIO,
                FECHA_FIN,
                VLR_HORA,
                VLR_MOD,
                ANO,
                MES,
                HORAS_TRABAJO
            )
            VALUES
            (
                ?,
                ?,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                0,
                0,
                EXTRACT(YEAR FROM CURRENT_DATE),
                EXTRACT(MONTH FROM CURRENT_DATE),
                0
            )
        `
        logSql(sqlInsert, [idOtm, codigoPersona], `${LOG_CUMPLIR_OTM} INSERT asignación usuario`)
        await db.query(sqlInsert, [idOtm, codigoPersona])
        return { success: true, message: 'OTM asignada correctamente al usuario' }
    } catch (error) {
        console.error('Error assigning OTM to user:', error)
        throw error
    }
}

export async function validarOtmAnterior(idNumerico, idEquipo, idActividad) {
    if (!idNumerico || !idEquipo || !idActividad) {
        console.warn('Missing parameters for validating previous OTM')
        return { success: true, idOtm: null }
    }

    try {
        const sql = `
            SELECT ID_OTM
            FROM OTM
            WHERE ID_NUMERICO = (SELECT MIN(ID_NUMERICO)
            FROM OTM
            WHERE ID_NUMERICO  < ?
                AND ID_EQUIPO    = ?
                AND ID_ACTIVIDAD = ?
                AND CUMPLIDA='NO');
        `
        const paramsValidar = [idNumerico, idEquipo, idActividad]
        logSql(sql, paramsValidar, `${LOG_CUMPLIR_OTM} SELECT OTM anterior`)
        const rows = await db.query(sql, paramsValidar)
        
        if (rows.length > 0) {
            const idOtmAnterior = rows[0].ID_OTM
            const sqlDetalle = `
                SELECT O.ID_OTM, O.FECHA_PROGRAMADA, A.NOMBRE_ACTIVIDAD 
                FROM OTM O, ACTIVIDAD A
                WHERE O.ID_ACTIVIDAD = A.ID_ACTIVIDAD 
                AND O.ID_OTM = ?
            `
            logSql(sqlDetalle, [idOtmAnterior], `${LOG_CUMPLIR_OTM} SELECT detalle OTM anterior`)
            const rowsDetalle = await db.query(sqlDetalle, [idOtmAnterior])
            return { 
                success: true, 
                idOtm: idOtmAnterior,
                detalle: rowsDetalle.length > 0 ? rowsDetalle[0] : null
            }
        }

        return { success: true, idOtm: null }
    } catch (error) {
        console.error('Error validating previous OTM:', error)
        throw error
    }
}
