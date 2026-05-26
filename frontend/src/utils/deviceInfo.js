const DEVICE_ID_KEY = 'manager_device_persistent_id'
const DEVICE_REGISTERED_KEY = 'manager_device_registered_status'

export function getPersistentId() {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
}

export function getDeviceRegisteredStatus() {
    return sessionStorage.getItem(DEVICE_REGISTERED_KEY) === 'true'
}

export function setDeviceRegisteredStatus(status) {
    sessionStorage.setItem(DEVICE_REGISTERED_KEY, status ? 'true' : 'false')
}
