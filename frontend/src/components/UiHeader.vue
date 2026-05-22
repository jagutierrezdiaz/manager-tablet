<template>
  <div class="layout-navigation">
    <!-- Top Bar: Logo -->
    <header class="top-bar">
      <img :src="logo" alt="Manager Logo" class="img-logo">
    </header>

    <!-- Bottom Navigation: Actions -->
    <nav class="bottom-nav">
      <div class="nav-container">
        <UiNavButton
          label="Inicio"
          icon="Home"
          :active="selected === 'inicio'"
          @click="onClick('inicio', 'principal-inicio')"
        />
        <UiNavButton
          label="Rutas"
          icon="Map"
          :active="selected === 'rutas'"
          @click="onClick('rutas', 'principal-rutas')"
        />
        <UiNavButton
          label="Programadas"
          icon="Calendar"
          :active="selected === 'programadas'"
          @click="onClick('programadas', 'principal-programadas')"
        />
        <UiNavButton
          label="Correctivas"
          icon="Wrench"
          :active="selected === 'correctivas'"
          @click="onClick('correctivas', 'principal-correctivas')"
        />
        <UiNavButton
          label="Cerrar sesión"
          icon="LogOut"
          :active="selected === 'logout'"
          @click="onClick('logout', 'principal-logout')"
        />
      </div>
    </nav>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiNavButton from './UiNavButton.vue'
import logo from '../assets/manager_logo.png'
import { getSessionUser, clearSessionUser } from '../utils/authSession.js'

const emit = defineEmits(['select-route'])
const route = useRoute()
const router = useRouter()

const selectedByRouteName = {
  'principal-inicio': 'inicio',
  'principal-rutas': 'rutas',
  'principal-programadas': 'programadas',
  'principal-correctivas': 'correctivas',
  'principal-logout': 'logout'
}

const selected = computed(() => selectedByRouteName[route.name] ?? '')

function onClick(name, routeName) {
  if (name === 'logout') {
      router.replace({ name: 'login' }).then(() => {
      clearSessionUser()
    }).catch(() => {
      clearSessionUser()
      router.replace({ name: 'login' })
    })
    return
  }
  emit('select-route', { name, routeName })
  if (!getSessionUser()) {
    router.replace({ name: 'login' }).catch(() => {})
    return
  }
  router.push({ name: routeName }).catch(() => {})
}
</script>

<style scoped>
/* Top Bar Styles */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(179deg, #0f172a 0%, #1e293b 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 4px var(--space-md);
}

.img-logo {
  height: 32px;
  object-fit: contain;
}

@media (max-width: 600px) {
  .top-bar {
    height: 56px;
  }
  .img-logo {
    height: 28px;
  }
  .top-spacer {
    height: 56px;
  }
}

/* Bottom Nav Styles */
.bottom-nav {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 600px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 1000;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 4px;
}

/* Dark Mode Overrides */
[data-theme="dark"] .top-bar,
[data-theme="dark"] .bottom-nav {
  background-color: rgba(15, 23, 42, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Spacers */
.top-spacer {
  height: 64px;
}

.bottom-spacer {
  height: 80px;
}

@media (min-width: 768px) {
  .bottom-spacer {
    height: 100px;
  }
}

/* Tablet / Desktop adjustments */
@media (min-width: 768px) {
  .bottom-nav {
    bottom: 24px;
    padding: 10px;
  }
  
  .img-logo {
    height: 40px;
  }
}

@media (max-width: 480px) {
  .bottom-nav {
    width: 100%;
    bottom: 0;
    border-radius: 20px 20px 0 0;
    padding: 6px 4px;
  }
  
  .nav-container {
    gap: 0;
  }
}
</style>