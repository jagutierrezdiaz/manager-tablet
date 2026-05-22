
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
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
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
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
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

.info-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.actions {
    display: flex;
    gap: var(--space-md);
    width: 100%;
    flex-wrap: wrap;
    margin-top: var(--space-lg);
}

.actions > * {
    flex: 1;
}

.footer-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
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
    transition: opacity 0.3s ease;
}

.img-logo-emp:hover {
    opacity: 1;
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
    .img-logo-emp {
        max-width: 250px;
    }
}
</style>