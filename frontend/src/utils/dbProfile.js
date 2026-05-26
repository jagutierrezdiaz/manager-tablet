export const DB_PROFILE_KEY = 'selectedDbProfile'

export const DB_PROFILES = [
    {
        id: 'db1',
        label: 'Base de datos 1',
        description: 'Normandy Planta (Producción)',
        apiUrl: import.meta.env.VITE_API_URL_DB_1 || import.meta.env.VITE_API_URL || '',
        available: true
    },
    {
        id: 'db2',
        label: 'Base de datos 2',
        description: 'Entorno de Pruebas (Test)',
        apiUrl: import.meta.env.VITE_API_URL_DB_2 || 'http://localhost:3001/api',
        available: true
    },
    {
        id: 'db3',
        label: 'Base de datos 3',
        description: 'Disponible próximamente',
        apiUrl: import.meta.env.VITE_API_URL_DB_3 || '',
        available: false
    }
]

export function getDbProfileById(id) {
    return DB_PROFILES.find((profile) => profile.id === id) ?? null
}

export function getSelectedDbProfile() {
    const id = sessionStorage.getItem(DB_PROFILE_KEY)
    if (!id) return null

    const profile = getDbProfileById(id)
    if (!profile || !profile.available) return null

    return profile
}

export function getSelectedDbProfileId() {
    return getSelectedDbProfile()?.id ?? null
}

export function getSelectedDbApiUrl() {
    return getSelectedDbProfile()?.apiUrl ?? ''
}

export function setSelectedDbProfile(id) {
    const profile = getDbProfileById(id)
    if (!profile || !profile.available) {
        throw new Error(`Perfil de base de datos no disponible: ${id}`)
    }

    sessionStorage.setItem(DB_PROFILE_KEY, profile.id)
    return profile
}

export function clearSelectedDbProfile() {
    sessionStorage.removeItem(DB_PROFILE_KEY)
}
