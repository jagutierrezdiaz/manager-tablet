
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
    <div
      class="container-login min-h-screen"
      :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${fondo})` }"
    >
        <div class="flex flex-col items-center justify-between min-h-screen gap-8 p-10">
            <img :src="logo" alt="" class="img-logo">
            
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

            <img :src="logo_emp" alt="" class="img-logo-emp">
        </div>
    </div>
</template>

<style scoped>
.container-login {
    min-height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
}

.glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(255, 255, 255, 0.3);
    width: 100%;
    max-width: 480px;
}

h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--color-text);
    margin-bottom: var(--space-lg);
    text-align: center;
}

.info-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
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

.img-logo {
    max-width: 320px;
    width: 80%;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.img-logo-emp {
    max-width: 200px;
    width: 50%;
    opacity: 0.9;
}

@media (max-width: 600px) {
    .actions {
        flex-direction: column-reverse;
    }
}

@media (min-width: 900px) {
    .img-logo {
        max-width: 450px;
    }
}
</style>