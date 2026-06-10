<template>
  <div class="layout-navigation">
    <!-- Top Bar: Logo -->
    <header class="top-bar">
      <div class="header-container">
        <img :src="logo" alt="Manager Logo" class="img-logo">
        <!-- Se comenta el logo de la empresa temporalmente:
        <img :src="logoEmp" alt="Hazlo Software" class="img-logo-emp">
       -->        
      </div>
  
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
import logoEmp from '../assets/hazlo_software.png'
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
  background: transparent; /* Totalmente transparente para lucir el fondo dinámico sin obstrucciones */
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: none; /* Pureza total sin líneas divisorias */
  padding: 4px var(--space-md);
}

.header-container {
  width: 100%;
  max-width: 1400px;
  display: flex;
  justify-content: center;     /*space-between;*/
  align-items: center;
  padding: 10px var(--space-md);
  background-color: #f2f4f7;
  border-radius: 20px;
  margin-top: 40px;
}


/*
.img-logo {
  height: 52px; 
  object-fit: contain;
}
*/
.img-logo-emp {
  height: 52px; /* Exactamente el mismo tamaño para simetria ideal */
  object-fit: contain;
  opacity: 1; /* Contraste y visibilidad estables */
}

@media (max-width: 600px) {
  .top-bar {
    height: 56px;
  }
  
  .img-logo {
    width: 100%;                  
    max-height: 40px;            
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35)); 
  }

  .img-logo-emp {
    height: 62px; /* Simetría ampliada adaptada a móviles */
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