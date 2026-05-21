<script setup>
import logo from '../assets/manager_logo.png'
import logo_emp from '../assets/hazlo_software.png'
import fondo from '../assets/fondo.jpg'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SESSION_USER_KEY } from '../utils/authSession.js'
import UiInput from '../components/UiInput.vue'
import UiButton from '../components/UiButton.vue'
import UiAlert from '../components/UiAlert.vue'

const router = useRouter()

const codigoPersonal = ref('')
const alertVisible = ref(false)
const alertMessage = ref('')
const alertType = ref('error')

// Al cargar la vista, obtener y mostrar todos los usuarios en consola
onMounted(async () => {
  try {
    const res = await fetch('/api/users')
    if (!res.ok) {
      console.error('Error al obtener usuarios:', res.statusText)
      return
    }
    const users = await res.json()
    // Mostrar en consola todos los usuarios
    // eslint-disable-next-line no-console
    console.log('Usuarios:', users)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error al conectarse al backend:', err)
  }
})

async function onSubmit() {
  alertVisible.value = false
  const id = String(codigoPersonal.value || '').trim()

  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`)
    if (res.status === 404) {
      alertMessage.value = 'Usuario no encontrado'
      alertType.value = 'error'
      alertVisible.value = true
      return
    }
    if (!res.ok) {
      alertMessage.value = `Error del servidor: ${res.statusText}`
      alertType.value = 'error'
      alertVisible.value = true
      return
    }
    const user = await res.json()
    // Guardar en sessionStorage para que PersonalInfoView lo lea
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
    router.push({ name: 'personal-info' })
  } catch (err) {
    alertMessage.value = 'Error de conexión con el servidor'
    alertType.value = 'error'
    alertVisible.value = true
    // eslint-disable-next-line no-console
    console.error('Login error', err)
  }
}
</script>


<template>
  <div class="container-login min-h-screen"
    :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${fondo})` }">
    <div class="flex flex-col items-center justify-between min-h-screen gap-8 p-10">
      <img :src="logo" alt="" class="img-logo">
      
      <section class="section-info glass-card">
        <h1>Iniciar sesión</h1>
        <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
          <UiAlert v-if="alertVisible" :type="alertType" :message="alertMessage" @close="alertVisible = false" />
          <UiInput v-model="codigoPersonal" type="text" label="ID Usuario" icon="User" placeholder="Ingresa tu ID" />
          <UiButton @click="onSubmit" label="Acceder" color="read" size="lg" icon="LogIn" iconPosition="end" />
        </form>
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
  max-width: 420px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
  text-align: center;
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

@media (min-width: 900px) {
  .img-logo {
    max-width: 450px;
  }
}
</style>