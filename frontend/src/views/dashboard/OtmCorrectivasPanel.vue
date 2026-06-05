<template>
  <div class="container glass-panel">
    <div class="accent-bar"></div>
    <h2>Listado de OTM programadas</h2>
    <div class="contenedor-card">
      <UiCard v-for="item in list" :key="item.ID_MAQUINA" :content="{
        nameTask: item.NOMBRE_MAQUINA,
        subtitleTask: item.NOMBRE_PROCESO,
        descriptionTask: item.NOMBRE_ETAPA,
      }" @select="(color) => handleClick(item, color)" />
    </div>
  </div>
</template>

<script setup>

import axios from '../../api/axios.js'
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { setSelectedOtm } from '../../utils/dataTransfer.js'

const router = useRouter()
const list = ref([])

async function loadMachines() {
  try {
    const response = await axios.get('otmCorrectiva/list-machines')
    list.value = Array.isArray(response.data) ? response.data : []
    console.log(list.value)
  } catch (e) {
    console.error('Error al obtener la lista de máquinas', e)
  }
}

function handleClick(item, color) {
  setSelectedOtm({ ...item, COLOR_CARD: color })
  // Usamos setTimeout para sacar la navegación del ciclo de actualización actual de Vue
  setTimeout(() => {
    router.push({
      name: 'otm-correctiva-register',
      params: { id: item.ID_MAQUINA }
    })
  }, 0)
}

onMounted(loadMachines)
onActivated(loadMachines)
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.contenedor-card {
  max-height: 530px;
  overflow-y: auto;
}


.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  /* Cristal templado premium Fiori Light */
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.40);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1050px;
  /* Tamaño máximo optimizado */
  margin: 0 auto;
  padding: 2.25rem 2rem;
}


.glass-panel .accent-bar {
  width: 120px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  margin: 0 auto 0.55rem auto;
}

.glass-panel h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}
</style>
