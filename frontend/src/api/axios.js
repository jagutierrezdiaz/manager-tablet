import axios from 'axios'
import { getSelectedDbApiUrl, getSelectedDbProfileId } from '../utils/dbProfile.js'

const api = axios.create()

api.interceptors.request.use((config) => {
    const baseURL = getSelectedDbApiUrl() || import.meta.env.VITE_API_URL
    if (baseURL) {
        config.baseURL = baseURL
    }

    // Agregar el ID de la base de datos seleccionada en los headers
    const dbId = getSelectedDbProfileId()
    if (dbId) {
        config.headers['x-db-id'] = dbId
    }

    return config
})

export default api
