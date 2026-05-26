import axios from 'axios'
import { getSelectedDbApiUrl } from '../utils/dbProfile.js'

const api = axios.create()

api.interceptors.request.use((config) => {
    const baseURL = getSelectedDbApiUrl() || import.meta.env.VITE_API_URL
    if (baseURL) {
        config.baseURL = baseURL
    }
    return config
})

export default api
