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
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
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
    width: 400px;
    height: 400px;
    background: var(--color-primary);
    top: -100px;
    right: -100px;
}

.circle-2 {
    width: 300px;
    height: 300px;
    background: var(--color-secondary);
    bottom: -50px;
    left: -50px;
}

.content-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 100vh;
    width: 100%;
    padding: var(--space-xl) var(--space-md);
}

.header-logo {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-sm);
}

.img-logo {
    max-width: 280px;
    width: 70%;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 100%;
    max-width: 480px;
    text-align: center;
}

h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: var(--space-md);
}

.subtitle {
    color: #64748b;
    margin-bottom: var(--space-lg);
    line-height: 1.5;
}

.loading-container {
    padding: var(--space-xl) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(15, 23, 42, 0.1);
    border-left-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.device-info {
    background: #f8fafc;
    border-radius: var(--radius);
    padding: var(--space-md);
    margin-bottom: var(--space-xl);
    text-align: left;
    border: 1px solid #e2e8f0;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: var(--space-sm);
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item .label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
}

.info-item .value {
    font-family: monospace;
    font-size: 0.9rem;
    color: #1e293b;
    word-break: break-all;
}

.footer-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: var(--space-sm);
}

.powered-by {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.4);
}

.img-logo-emp {
    max-width: 140px;
    width: 60%;
}

@media (min-width: 768px) {
    .img-logo {
        max-width: 380px;
    }
    .img-logo-emp {
        max-width: 250px;
    }
}
</style>
