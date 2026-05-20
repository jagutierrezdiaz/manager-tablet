<template>
  <div>
    <div class="flex flex-col container-header">
      <img :src="logo" alt="" class="img-logo">
      <div class="flex justify-between pr-4 pl-4 pb-2 flex-wrap gap-2">
        <UiNavButton
          label="Inicio"
          icon="Home"
          :active="selected === 'inicio'"
          @click="onClick('inicio', 'principal-inicio')"
        />
        <UiNavButton
          label="Ejecución Rutas"
          icon="Route"
          :active="selected === 'rutas'"
          @click="onClick('rutas', 'principal-rutas')"
        />
        <UiNavButton
          label="OTM Programadas"
          icon="CalendarPlus"
          :active="selected === 'programadas'"
          @click="onClick('programadas', 'principal-programadas')"
        />
        <UiNavButton
          label="OTM Correctivas"
          icon="CalendarX2"
          :active="selected === 'correctivas'"
          @click="onClick('correctivas', 'principal-correctivas')"
        />
      </div>
    </div>

    <!-- Spacer para que el contenido de la página no quede oculto por el header fijo -->
    <div class="header-spacer" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiNavButton from './UiNavButton.vue'
import logo from '../assets/manager_logo.png'
import { getSessionUser } from '../utils/authSession.js'

const emit = defineEmits(['select-route'])
const route = useRoute()
const router = useRouter()

const selectedByRouteName = {
  'principal-inicio': 'inicio',
  'principal-rutas': 'rutas',
  'principal-programadas': 'programadas',
  'principal-correctivas': 'correctivas'
}

const selected = computed(() => selectedByRouteName[route.name] ?? '')

function onClick(name, routeName) {
  emit('select-route', { name, routeName })
  if (!getSessionUser()) {
    router.replace({ name: 'login' }).catch(() => {})
    return
  }
  router.push({ name: routeName }).catch(() => {})
}
</script>

<style scoped>
.container-header {
  width: 90%;
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  border-radius: 10px;
  gap: 2px;
}

/* Centrar el contenido interno y limitar ancho para pantallas grandes */
.container-header header,
.container-header>div {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.img-logo {
  height: 40px;
  object-fit: contain;
  display: flex;
  justify-content: center;
}


/* Espacio que evita que el contenido quede oculto por el header fijo */
.header-spacer {
  height: 125px;
  width: 100%;
}

/* Ajustes responsive: en pantallas de tablet / móvil reducir botones y letra, aumentar spacer */
@media (max-width: 1024px) {
  /* Reducir tamaño de las imágenes del header para dejar más espacio */
  .img-logo,
  .img-logo-emp {
    height: 36px;
  }
}

/* Pantallas más pequeñas (teléfonos): aún más compacto y aumentar spacer */
@media (max-width: 600px) {
  .img-logo {
    height: 26px;
    margin-top: 10px;
  }

  /* Aumentar el spacer para que el contenido no quede oculto por el header */
  .header-spacer {
    height: 160px;
  }
}
/* Móvil: ocupar todo el ancho, apilar botones, quitar borde redondeado y suavizar blur/sombra */
@media (max-width: 600px) {
  .container-header {
    width: 100%;
    left: 0;
    transform: none;
    top: 0;
    border-radius: 0;
    padding-bottom: 8px;
  }

  /* Hacer que el contenido interno no esté limitado a max-width en móvil */
  .container-header header,
  .container-header>div {
    max-width: none;
    margin: 0;
    width: 100%;
    padding-left: 4px;
    padding-right: 4px;
  }

  /* Scroll horizontal para los botones en móvil */
  .container-header > div {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    justify-content: space-between;
    gap: 0;
    padding-bottom: 0;
    scrollbar-width: none;
  }

  .container-header > div::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  .ui-nav-btn {
    flex: 0 0 auto;
  }

  /* Aumentar el spacer para mayor separación con el contenido */
  .header-spacer {
    height: 140px;
  }
}
/* Mejoras visuales para escritorio: logos más grandes, botones alineados y mayor contraste */
@media (min-width: 1025px) {
  .container-header {
    width: 85%;
    top: 12px;
    padding: 2px 18px;
  }

  .container-header header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }

  .img-logo, .img-logo-emp {
    height: 42px;
  }

  /* Botones en línea centrados y con mayor separación */
  .container-header > div {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
    padding: 8px 12px;
  }
}
</style>