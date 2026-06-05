<script setup>
import logo from '../assets/manager_logo.png'
import logo_emp from '../assets/hazlo_software.png'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios.js'
import { getPersistentId, setDeviceRegisteredStatus } from '../utils/deviceInfo.js'
import UiButton from '../components/UiButton.vue'
import UiAlert from '../components/UiAlert.vue'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const ip = ref('')
const persistentId = getPersistentId()

async function checkAndRegister() {
    loading.value = true
    error.value = ''
    try {
        // 1. Obtener IP (este endpoint no requiere DB, pero axios usará la base_url de la DB seleccionada)
        const ipRes = await api.get('device/my-ip')
        ip.value = ipRes.data.ip

        // 2. Verificar si ya está registrado en la base de datos seleccionada
        const checkRes = await api.get('device/check', {
            params: {
                id_persistente: persistentId,
                direccion_ip: ip.value
            }
        })

        if (checkRes.data.registered) {
            setDeviceRegisteredStatus(true)
            // Si ya está registrado, vamos directo al login sin mostrar nada
            router.replace({ name: 'login' })
        } else {
            // No está registrado, desactivamos el loading para mostrar la UI de registro
            loading.value = false
        }
    } catch (err) {
        console.error('Error en el registro de dispositivo:', err)
        error.value = 'No se pudo conectar con el servidor para verificar el dispositivo.'
        loading.value = false
    }
}

async function handleRegister() {
    loading.value = true
    error.value = ''
    try {
        await api.post('device/register', {
            id_persistente: persistentId,
            direccion_ip: ip.value,
            estado: 'ACTIVO'
        })
        setDeviceRegisteredStatus(true)
        router.replace({ name: 'select-database' })
    } catch (err) {
        console.error('Error al registrar dispositivo:', err)
        error.value = 'Error al intentar registrar el dispositivo.'
        loading.value = false
    }
}

onMounted(() => {
    checkAndRegister()
})
</script>

<template>
    <div class="container-login min-h-screen">
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
        </div>

        <div class="content-wrapper">
            <header class="header-logo">
                <img :src="logo" alt="Manager Logo" class="img-logo">
            </header>

            <section class="glass-card">
                <h1>Registro de Dispositivo</h1>
                
                <div v-if="loading" class="loading-container">
                    <div class="spinner"></div>
                    <p>Verificando dispositivo...</p>
                </div>

                <div v-else-if="error" class="error-container">
                    <UiAlert type="error" :message="error" />
                    <UiButton label="Reintentar" color="read" @click="checkAndRegister" icon="RefreshCw" />
                </div>

                <div v-else class="register-prompt">
                    <p class="subtitle">Este dispositivo no se encuentra registrado en el sistema.</p>
                    <div class="device-info">
                        <div class="info-item">
                            <span class="label">ID Persistente:</span>
                            <span class="value">{{ persistentId }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Dirección IP:</span>
                            <span class="value">{{ ip }}</span>
                        </div>
                    </div>
                    <UiButton 
                        label="Registrar este dispositivo" 
                        color="create" 
                        size="lg" 
                        icon="Tablet" 
                        @click="handleRegister" 
                    />
                </div>
            </section>

            <footer class="footer-logo">
                <span class="powered-by">Realizado por</span>
                <img :src="logo_emp" alt="Hazlo Software" class="img-logo-emp">
            </footer>
        </div>
    </div>
</template>

<style scoped>
.container-login {
    min-height: 100vh;
    background: 
        radial-gradient(circle at top center, rgba(255, 255, 255, 0.12), transparent 45%),
        linear-gradient(180deg, #163766 0%, #0f2b54 50%, #0a1f3f 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

/* Rejilla técnica de fondo estilo plano industrial */
.container-login::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: 
        radial-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    background-size: 40px 40px, 20px 20px, 20px 20px;
    background-position: center;
    opacity: 0.4;
    z-index: 0;
}

.bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}

.circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
}

.circle-1 {
    width: 380px !important;
    height: 380px !important;
    background-color: transparent !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba%28255,255,255,0.08%29' stroke-width='0.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'/%3E%3C/svg%3E") !important;
    filter: none !important;
    opacity: 1 !important;
    top: -80px !important;
    right: -80px !important;
    left: auto !important;
    animation: spin 60s linear infinite;
    transform-origin: center;
    border-radius: 0% !important;
}

.circle-2 {
    display: none !important;
}

.content-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    padding: 3rem 1.5rem;
}

.header-logo {
    position: absolute;
    top: 3rem;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 3rem);
    max-width: 650px;
    display: flex;
    justify-content: center;
    margin-bottom: 0;
}

.img-logo {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

.glass-card {
    background: rgba(255, 255, 255, 0.85); /* Fiori Light Card */
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 28px;
    padding: 2.5rem 2rem;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.40);
    width: 100%;
    max-width: 480px;
    text-align: center;
    position: relative;
}

.glass-card::before {
    content: '';
    display: block;
    width: 120px;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    margin: 0 auto 1.5rem auto;
}

h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.subtitle {
    color: #475569;
    margin-bottom: 2rem;
    line-height: 1.5;
    font-size: 1.05rem;
    text-wrap: balance;
}

.loading-container {
    padding: 2.5rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
}

.loading-container p {
    color: #0f172a;
    font-weight: 700;
    font-size: 1rem;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(15, 35, 70, 0.08);
    border-left-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.device-info {
    background: rgba(15, 35, 70, 0.05);
    border-radius: 14px;
    padding: 1.25rem;
    margin-bottom: 2rem;
    text-align: left;
    border: 1px solid rgba(15, 35, 70, 0.10);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 1rem;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item .label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1e3a8a;
}

.info-item .value {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f172a;
    word-break: break-all;
    background: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(15, 35, 70, 0.06);
    margin-top: 2px;
}

.footer-logo {
    position: absolute;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: 0;
    width: 100%;
}

.powered-by {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 4px;
}

.img-logo-emp {
    max-width: 650px;
    width: 80%;
    height: auto;
    opacity: 0.85;
    margin-top: -14px; /* Eleva el logo reduciendo el espacio con respecto al texto */
}

@media (min-width: 768px) {
    .img-logo {
        max-width: 380px;
    }
}

</style>
