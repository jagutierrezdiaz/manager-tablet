<template>
    <div class="register-container">
        <div v-if="otmData">
            <UiTitleView 
            :titleOTM="otmData.NOMBRE_PROCESO"
            :titleActivity="otmData.NOMBRE_MAQUINA" 
            :colorCard="otmData.COLOR_CARD" />
        </div>
        <button @click="$router.back()">Volver</button>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import UiTitleView from '../../components/UiTitleView.vue'

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const otmData = ref(null)

onMounted(() => {
    const data = getSelectedOtm()
    // Verificamos que los datos correspondan al ID de la URL
    if (data && (String(data.ID_OTM) === String(props.id) || String(data.ID_MAQUINA) === String(props.id))) {
        otmData.value = data
    } else {
        console.warn('Los datos en sesión no coinciden con el ID de la URL o no existen')
    }
    console.log('Datos recibidos en Registro Correctivo:', otmData.value)
})
</script>

<style scoped>

.data-preview {
    background: #f4f4f4;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}
</style>
