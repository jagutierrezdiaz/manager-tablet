<script setup>
import logo from '../assets/manager_logo.png'
import logo_emp from '../assets/hazlo_software.png'
import fondo from '../assets/fondo.jpg'
import { ref, onMounted, nextTick } from 'vue'
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
  await nextTick()
  const id = String(codigoPersonal.value || '').trim()

  if (!id) {
    alertMessage.value = 'Por favor, ingresa tu ID de usuario'
    alertType.value = 'warning'
    alertVisible.value = true
    return
  }

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
      
      <section class="section-info glass-card">
        <h1>Iniciar sesión</h1>
        <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
          <Transition name="fade-slide">
            <UiAlert v-if="alertVisible" :type="alertType" :message="alertMessage" @close="alertVisible = false" />
          </Transition>
          <UiInput v-model="codigoPersonal" type="text" label="ID Usuario" icon="User" placeholder="Ingresa tu ID" />
          <UiButton type="submit" label="Acceder" color="read" size="lg" icon="LogIn" iconPosition="end" />
        </form>
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
  max-width: 420px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: var(--space-lg);
  text-align: center;
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
  transition: opacity 0.3s ease;
}

.img-logo-emp:hover {
  opacity: 1;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

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