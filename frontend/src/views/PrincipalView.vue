<script setup>
import UiHeader from '../components/UiHeader.vue'
import { useRouter } from 'vue-router'
import { getSessionUser, clearSessionUser } from '../utils/authSession.js'

const router = useRouter()



function onContinue() {
  if (!getSessionUser()) {
    clearSessionUser()
    router.replace({ name: 'login' })
    return
  }
}

function logout() {
  clearSessionUser()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="container-principal">
    <!-- Decoración industrial de planos técnicos no intrusiva (Pointer-events deshabilitado en esquina superior derecha) -->
    <div class="industrial-bg">
      <svg class="gear gear-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </div>

    <UiHeader />

    <div class="container-content">
      <div class="principal-outlet">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" @logout="logout" @continue="onContinue" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container-principal {
  min-height: 100vh;
  width: 100%;
  /* Fondo industrial profundo con destello superior */
  background: 
    radial-gradient(circle at top center, rgba(255, 255, 255, 0.12), transparent 45%),
    linear-gradient(180deg, #163766 0%, #0f2b54 50%, #0a1f3f 100%);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Rejilla técnica de diseño industrial transparente */
.container-principal::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
  background-size: 40px 40px, 20px 20px, 20px 20px;
  background-position: center;
  opacity: 0.35;
  z-index: 0;
}

/* Contonéo técnico decorativo desplazado por completo arriba a la derecha */
.industrial-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 320px;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.08;
  user-select: none;
}

.gear {
  position: absolute;
  color: #ffffff;
  transform-origin: center;
  will-change: transform;
}

.gear-1 {
  width: 380px;
  height: 380px;
  top: -80px;
  right: -80px;
  animation: spin 60s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.principal-outlet {
  flex: 1;
  min-width: 0;
  width: 100%;
  position: relative;
  z-index: 1;
}

.container-content {
  /* Barreras responsivas para garantizar que los paneles (glass-panel) jamás queden tapados por el logo superior y la bottom-nav */
  padding: 5.5rem 1.5rem 8.5rem 1.5rem; 
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

@media (min-width: 900px) {
  .container-content {
    padding: 8rem 2rem 9rem 2rem; /* Mayor aire visual en terminales de alta gama */
    gap: var(--space-xl);
  }
}

</style>
