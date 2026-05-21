<template>
  <div class="container">
    <UiCard v-for="item in list" :key="item.ID_MAQUINA" :content="{
      nameTask: item.NOMBRE_MAQUINA,
      subtitleTask: item.NOMBRE_PROCESO,
      descriptionTask: item.NOMBRE_ETAPA,
    }" @select="(color) => handleClick(item, color)" />
  </div>
</template>

<script setup>

import axios from '../../api/axios.js'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setSelectedOtm } from '../../utils/dataTransfer.js'

const router = useRouter()
const list = ref([])

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

onMounted(async () => {
  try {
    const response = await axios.get('otmCorrectiva/list-machines')
    list.value = Array.isArray(response.data) ? response.data : []
    console.log(list.value)
  } catch (e) {
    console.error('Error al obtener la lista de máquinas', e)
  }
})
</script>

<style scoped>
.container {
  padding: var(--space-md);
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}
</style>

