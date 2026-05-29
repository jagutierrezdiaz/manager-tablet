<script setup>
import logo from '../assets/manager_logo.png'
import logo_emp from '../assets/hazlo_software.png'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UiAlert from '../components/UiAlert.vue'
import { DB_PROFILES, setSelectedDbProfile } from '../utils/dbProfile.js'

const router = useRouter()
const alertVisible = ref(false)
const alertMessage = ref('')

function selectProfile(profile) {
    if (!profile.available) {
        alertMessage.value = 'Esta base de datos aún no está disponible.'
        alertVisible.value = true
        return
    }

    try {
        setSelectedDbProfile(profile.id)
        // Al seleccionar base de datos, vamos a verificar el dispositivo
        router.push({ name: 'device-register' })
    } catch (error) {
        alertMessage.value = error.message || 'No se pudo seleccionar la base de datos.'
        alertVisible.value = true
    }
}
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
                <h1>Seleccionar base de datos</h1>
                <p class="subtitle">Elige el entorno con el que deseas trabajar antes de iniciar sesión.</p>

                <Transition name="fade-slide">
                    <UiAlert
                        v-if="alertVisible"
                        type="warning"
                        :message="alertMessage"
                        @close="alertVisible = false"
                    />
                </Transition>

                <div class="profile-list">
                    <button
                        v-for="profile in DB_PROFILES"
                        :key="profile.id"
                        type="button"
                        class="profile-card"
                        :class="{ 'profile-card--disabled': !profile.available }"
                        :disabled="!profile.available"
                        @click="selectProfile(profile)"
                    >
                        <div class="profile-card__header">
                            <span class="profile-card__label">{{ profile.label }}</span>
                            <span v-if="!profile.available" class="profile-card__badge">Próximamente</span>
                        </div>
                        <p class="profile-card__description">{{ profile.description }}</p>
                    </button>
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
}

h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: var(--space-sm);
    text-align: center;
}

.subtitle {
    text-align: center;
    color: #64748b;
    margin-bottom: var(--space-lg);
    line-height: 1.5;
}

.profile-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.profile-card {
    width: 100%;
    text-align: left;
    background: #ffffff;
    border: 2px solid rgba(15, 23, 42, 0.08);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
}

.profile-card:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
}

.profile-card--disabled {
    opacity: 0.65;
    cursor: not-allowed;
    background: #f8fafc;
}

.profile-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    margin-bottom: 6px;
}

.profile-card__label {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
}

.profile-card__badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #92400e;
    background: #fef3c7;
    padding: 4px 8px;
    border-radius: 999px;
}

.profile-card__description {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
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

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
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
