
<script setup>
import logo from '../assets/manager_logo.png'
import logo_emp from '../assets/hazlo_software.png'
import fondo from '../assets/fondo.jpg'
import UiInput from '../components/UiInput.vue'
import UiButton from '../components/UiButton.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSessionUser, clearSessionUser } from '../utils/authSession.js'

const router = useRouter()

const personalInfo = ref({
    nombrePersona: '',
    codigoPersona: '',
    cargoPersona: '',
})

// Función para cerrar sesión: limpiar almacenamiento y redirigir al login
const logout = () => {
    clearSessionUser()
    router.replace({ name: 'login' })
}


// Al montar, leer el usuario almacenado en sessionStorage.
onMounted(() => {
    const user = getSessionUser()
    if (!user) {
        router.replace({ name: 'login' })
        return
    }
    personalInfo.value.nombrePersona = user.nombrePersona || ''
    personalInfo.value.codigoPersona = user.codigoPersona || ''
    personalInfo.value.cargoPersona = user.cargoPersona || ''
})

const goToPrincipal = () => {
    if (!getSessionUser()) {
        clearSessionUser()
        router.replace({ name: 'login' })
        return
    }
    router.replace({ name: 'principal' })
}
</script>

<template>
    <div class="container-login min-h-screen">
        <!-- Abstract background elements -->
        <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
        </div>

        <div class="content-wrapper">
            <header class="header-logo">
                <img :src="logo" alt="Manager Logo" class="img-logo">
            </header>
            
            <section class="glass-card">
                <h1>Información Personal</h1>
                <div class="info-form">
                    <UiInput type="text" label="Nombre Completo" icon="User" v-model="personalInfo.nombrePersona" readOnly />
                    <UiInput type="text" label="Código" icon="UserCheck" v-model="personalInfo.codigoPersona" readOnly />
                    <UiInput type="text" label="Cargo" icon="Briefcase" v-model="personalInfo.cargoPersona" readOnly />
                    
                    <div class="actions">
                        <UiButton label="Continuar" color="read" size="lg" icon="ArrowRight" iconPosition="end" @click="goToPrincipal" />
                        <UiButton label="Cerrar sesión" color="delete" size="lg" icon="LogOut" @click="logout" outlined />
                    </div>
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

/* Background Decoration */
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

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
    /* Barreras de seguridad para proteger los logos absolutos */
    padding: 9.5rem 1.5rem 8.5rem 1.5rem; 
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
    padding: 2rem 1.75rem; /* Ajustado de forma compacta y ergonómica */
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.40);
    width: 100%;
    max-width: 480px;
    position: relative;
}

.glass-card::before {
    content: '';
    display: block;
    width: 120px;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    margin: 0 auto 1.25rem auto;
}

h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 1.5rem; /* Separación optimizada */
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-align: center;
}

.info-form {
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Micro-espaciador optimizado de inputs */
}

.actions {
    display: flex;
    gap: var(--space-md);
    width: 100%;
    flex-wrap: wrap;
    margin-top: 0.75rem; /* Margen superior compactado */
}

.actions > * {
    flex: 1;
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
    max-width: 320px;
    width: 80%;
    height: auto;
    opacity: 0.85;
    margin-top: -14px;
    /* Eleva el logo reduciendo el espacio con respecto al texto */
}

@media (max-width: 600px) {
    .actions {
        flex-direction: column-reverse;
    }
}

@media (min-width: 768px) {
    .img-logo {
        max-width: 380px;
    }
}
</style>