import db from '../db/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
            OTM.FOTO_1, 
            OTM.FOTO_2,
            OTM.TIEMPO_REAL,
            OTM.TIEMPO_PROGRAMADO,
            AC.ID_ACTIVIDAD,
            AC.NOMBRE_ACTIVIDAD,
            AC.CLASE_ACTIVIDAD,
            AC.TIPO_MANTENIMIENTO,
            AC.PROGRAMABLE,AC.TIPO_PROGRAMA,
            BL.ID_PROCESO, 
            BL.NOMBRE_PROCESO, 
            BL.ID_ETAPA,
            BL.NOMBRE_ETAPA, 
            BL.ID_MAQUINA, 
            BL.NOMBRE_MAQUINA,
            BL.ID_EQUIPO, 
            BL.NOMBRE_EQUIPO
        FROM OTM, ACTIVIDAD AC, QRBASE_LAYOUT BL
        WHERE OTM.ID_EQUIPO = BL.ID_EQUIPO
           AND OTM.ID_ACTIVIDAD = AC.ID_ACTIVIDAD
           AND OTM.ID_OTM =  ?
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
        // Definir la ruta relativa a la raíz del backend (2 niveles arriba de src/services)
        const backendRoot = path.resolve(__dirname, '..', '..')
        const uploadDir = path.join(backendRoot, 'uploads', 'Firma_Personal')
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const cleanNombre = personaAsignada.nombrePersona.replace(/[\\/:*?"<>|]/g, "")
        const fileName = `${idOtm}_${personaAsignada.codigoPersona}_${cleanNombre}.png`
        const filePath = path.join(uploadDir, fileName)
        
        fs.writeFileSync(filePath, base64Data, 'base64')

        // Guardar en la tabla FIRMA_PERSONAL
        const urlFirma = `uploads/Firma_Personal/${fileName}`
        
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
        const backendRoot = path.resolve(__dirname, '..', '..')
        const uploadDir = path.join(backendRoot, 'uploads', 'Fotos_OTM')
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const fileName = `${idOtm}_foto_${photoNumber}.png`
        const filePath = path.join(uploadDir, fileName)
        
        fs.writeFileSync(filePath, cleanData, 'base64')

        const urlFoto = `uploads/Fotos_OTM/${fileName}`
        const fieldName = `FOTO_${photoNumber}`
        
        const sql = `UPDATE OTM SET ${fieldName} = ? WHERE ID_OTM = ?`
        await db.query(sql, [urlFoto, idOtm])

        return { success: true, url: urlFoto }
    } catch (error) {
        console.error('Error saving OTM photo:', error)
        throw error
    }
}