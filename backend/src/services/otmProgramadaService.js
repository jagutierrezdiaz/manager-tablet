import db from '../db/index.js'
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

export async function getDatosOtmById(idOtmProgramada) {
    const sql = `
        SELECT
            OTM.ID_NUMERICO,
            OTM.ID_OTM,
            OTM.FECHA_PROGRAMADA,
            OTM.FECHA_CIERRE,
            OTM.LIMITE_CIERRE,
            CAST(OTM.OBSERVACION_OTM AS VARCHAR(2000)) AS OBSERVACION_OTM,
            CAST(OTM.COMENTARIOS_DE_CIERRE AS VARCHAR(2000)) AS COMENTARIOS_DE_CIERRE,
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
    return rows
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



export async function deletePersonaAsignadaOtm(idOtm, codigoPersona) {
    const sql = `
        DELETE FROM CIERRE_MOD WHERE ID_OTM = ? AND CODIGO_PERSONA = ?
    `
    const rows = await db.query(sql, [idOtm, codigoPersona])
    return rows
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
            const fullPath = toAbsolutePath(currentPath)

            if (fullPath && fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
            }
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


export async function saveCumplimientoOtm(tiempoReal, indiceCumplimiento, efectividadCumplimiento, comentariosCierre, tiempoMod, idOtm) {
    try {
        const sql = `
            UPDATE OTM
            SET TIEMPO_REAL = ?,
                INDICE_CUMPLIMIENTO = ?,
                EFECTIVIDAD_CUMPLIMIENTO = ?,
                COMENTARIOS_DE_CIERRE = ?,
                TIEMPO_MOD = ?,
                CUMPLIDA = 'SI'
            WHERE ID_OTM = ?
        `
        await db.query(sql, [tiempoReal, indiceCumplimiento, efectividadCumplimiento, comentariosCierre, tiempoMod, idOtm])

        // 1. Obtener datos de la OTM que se acaba de cumplir
        const sqlGet = 'SELECT ID_NUMERICO, ID_ACTIVIDAD, ID_EQUIPO FROM OTM WHERE ID_OTM = ?'
        const rows = await db.query(sqlGet, [idOtm])

        if (rows.length > 0) {
            const { ID_NUMERICO, ID_ACTIVIDAD, ID_EQUIPO } = rows[0]

            // 2. Actualizar las OTMs programadas siguientes (mismo equipo y actividad)
            // Se incrementa tanto la fecha programada como el límite de cierre según el parámetro configurado
            const sqlUpdateNext = `
                UPDATE OTM O
                SET O.FECHA_PROGRAMADA = O.FECHA_PROGRAMADA + (SELECT P.LIMITE_CIERRE FROM PARAMETRO P),
                    O.LIMITE_CIERRE = O.LIMITE_CIERRE + (SELECT P.LIMITE_CIERRE FROM PARAMETRO P)
                WHERE O.ID_NUMERICO > ?
                  AND O.ID_ACTIVIDAD = ?
                  AND O.ID_EQUIPO = ?
                  AND O.CUMPLIDA = 'NO'
            `
            await db.query(sqlUpdateNext, [ID_NUMERICO, ID_ACTIVIDAD, ID_EQUIPO])
        }

        return { success: true, message: 'Cumplimiento de la OTM guardado y siguientes actualizadas correctamente' }
    } catch (error) {
        console.error('Error saving OTM cumplimiento:', error)
        throw error
    }
}


export async function assignOtmToUser(idOtm, codigoPersona) {
    try {
        // Verificar si ya existe la asignación
        const sqlCheck = 'SELECT * FROM CIERRE_MOD WHERE ID_OTM = ? AND CODIGO_PERSONA = ?'
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
        await db.query(sqlInsert, [idOtm, codigoPersona])
        return { success: true, message: 'OTM asignada correctamente al usuario' }
    } catch (error) {
        console.error('Error assigning OTM to user:', error)
        throw error
    }
}

export async function validarOtmAnterior(idNumerico, idEquipo, idActividad) {
    console.log('Validating previous OTM Params:', { idNumerico, idEquipo, idActividad })
    
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
        console.log('SQL:', sql, [idNumerico, idEquipo, idActividad])
        const rows = await db.query(sql, [idNumerico, idEquipo, idActividad])
        
        if (rows.length > 0) {
            const idOtmAnterior = rows[0].ID_OTM
            const sqlDetalle = `
                SELECT O.ID_OTM, O.FECHA_PROGRAMADA, A.NOMBRE_ACTIVIDAD 
                FROM OTM O, ACTIVIDAD A
                WHERE O.ID_ACTIVIDAD = A.ID_ACTIVIDAD 
                AND O.ID_OTM = ?
            `
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
