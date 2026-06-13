import FingerprintJS from '@fingerprintjs/fingerprintjs'
import api from '../api/axios.js'

const DEVICE_ID_KEY = 'manager_device_persistent_id'
const DEVICE_REGISTERED_KEY = 'manager_device_registered_status'

let fpPromise = null

function loadFingerprint() {
    if (!fpPromise) {
        fpPromise = FingerprintJS.load()
    }
    return fpPromise
}

export async function getPersistentId() {
    const fp = await loadFingerprint()
    const { visitorId } = await fp.get()

    const cachedId = localStorage.getItem(DEVICE_ID_KEY)
    if (cachedId !== visitorId) {
        localStorage.setItem(DEVICE_ID_KEY, visitorId)
    }

    return visitorId
}

export function getDeviceRegisteredStatus() {
    return sessionStorage.getItem(DEVICE_REGISTERED_KEY) === 'true'
}

export function setDeviceRegisteredStatus(status) {
    sessionStorage.setItem(DEVICE_REGISTERED_KEY, status ? 'true' : 'false')
}

export function clearDeviceRegisteredStatus() {
    sessionStorage.removeItem(DEVICE_REGISTERED_KEY)
}

export async function fetchServerIp() {
    const ipRes = await api.get('device/my-ip')
    return ipRes.data.ip
}

export async function checkDeviceRegistration(idPersistente, direccionIp) {
    const checkRes = await api.get('device/check', {
        params: {
            id_persistente: idPersistente,
            direccion_ip: direccionIp
        }
    })
    return checkRes.data
}

export async function registerDeviceOnServer(idPersistente, direccionIp) {
    await api.post('device/register', {
        id_persistente: idPersistente,
        direccion_ip: direccionIp
    })
}

export async function ensureDeviceRegistered() {
    if (getDeviceRegisteredStatus()) {
        return { registered: true }
    }

    const idPersistente = await getPersistentId()
    const direccionIp = await fetchServerIp()
    const checkData = await checkDeviceRegistration(idPersistente, direccionIp)

    if (checkData.registered) {
        setDeviceRegisteredStatus(true)
        return { registered: true, idPersistente, direccionIp }
    }

    return { registered: false, idPersistente, direccionIp }
}
