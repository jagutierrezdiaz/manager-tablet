<template>
  <div class="container glass-panel">
    <div class="accent-bar"></div>
    <h2>Listado de Máquinas / Sistemas</h2>

    <UiListFilters
      v-model:select="procesoSeleccionado"
      v-model:search="searchQuery"
      select-label="Proceso"
      search-label="Buscar máquina / sistema"
      search-placeholder="Nombre de máquina, proceso o etapa..."
      select-placeholder="Seleccione un proceso"
      :select-options="procesosList"
      select-value-key="ID_PROCESO"
      select-label-key="NOMBRE_PROCESO"
      @select-change="loadMachines"
    />

    <div class="contenedor-card">
      <UiCard
        v-for="item in filteredList"
        :key="item.ID_MAQUINA"
        :content="{
          nameTask: item.NOMBRE_MAQUINA,
          subtitleTask: item.NOMBRE_PROCESO,
          descriptionTask: item.NOMBRE_ETAPA,
        }"
        @select="(color) => handleClick(item, color)"
      />
      <p v-if="procesoSeleccionado && list.length && !filteredList.length" class="empty-msg">
        Ninguna máquina coincide con la búsqueda.
      </p>
      <p v-else-if="procesoSeleccionado && !list.length" class="empty-msg">
        No hay máquinas registradas para este proceso.
      </p>
    </div>
  </div>
</template>

<script setup>

import axios from '../../api/axios.js'
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { setSelectedOtm } from '../../utils/dataTransfer.js'
import UiListFilters from '../../components/UiListFilters.vue'

const router = useRouter()
const list = ref([])
const procesosList = ref([])
const procesoSeleccionado = ref('')
const searchQuery = ref('')

const SEARCH_FIELDS = ['NOMBRE_MAQUINA', 'NOMBRE_PROCESO', 'NOMBRE_ETAPA']

const filteredList = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return list.value

  return list.value.filter((item) =>
    SEARCH_FIELDS.some((field) =>
      String(item[field] || '').toLowerCase().includes(query)
    )
  )
})

async function loadProcesos() {
  try {
    const response = await axios.get('otmCorrectiva/get-proceso-maquinas')
    procesosList.value = Array.isArray(response.data) ? response.data : []

    if (!procesoSeleccionado.value && procesosList.value.length > 0) {
      procesoSeleccionado.value = procesosList.value[0].ID_PROCESO
    }
  } catch (e) {
    console.error('Error al obtener procesos', e)
    procesosList.value = []
  }
}

async function loadMachines() {
  searchQuery.value = ''

  if (!procesoSeleccionado.value) {
    list.value = []
    return
  }

  try {
    const response = await axios.get('otmCorrectiva/list-machines', {
      params: { idProceso: procesoSeleccionado.value }
    })
    list.value = Array.isArray(response.data) ? response.data : []
  } catch (e) {
    console.error('Error al obtener la lista de máquinas', e)
    list.value = []
  }
}

async function loadData() {
  await loadProcesos()
  await loadMachines()
}

function handleClick(item, color) {
  setSelectedOtm({ ...item, COLOR_CARD: color })
  setTimeout(() => {
    router.push({
      name: 'otm-correctiva-register',
      params: { id: item.ID_MAQUINA }
    })
  }, 0)
}

onMounted(loadData)
onActivated(loadData)
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.contenedor-card {
  max-height: 620px;
  overflow-y: auto;
}

.empty-msg {
  text-align: center;
  color: var(--color-muted);
  padding: var(--space-lg);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.40);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: visible;
  width: 100%;
  max-width: 1050px;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .container {
    max-width: 720px;
    padding: var(--space-sm);
  }
}
</style>
