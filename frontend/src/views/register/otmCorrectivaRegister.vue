<template>
    <div class="register-container">
        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="ArrowLeft" @click="$router.back()" />
            <UiButton label="Iniciar Registro" color="create" icon="Play" />
        </div>

        <div v-if="otmData" class="data-container">
            <UiTitleView 
                :titleOTM="otmData.NOMBRE_PROCESO"
                :titleActivity="otmData.NOMBRE_MAQUINA" 
                :colorCard="otmData.COLOR_CARD" 
            />
            
            <section class="section-card">
                <h2>Detalles de la Máquina</h2>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="label">Proceso:</span>
                        <span class="value">{{ otmData.NOMBRE_PROCESO }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Etapa:</span>
                        <span class="value">{{ otmData.NOMBRE_ETAPA }}</span>
                    </div>
                </div>
            </section>
        </div>


    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import UiTitleView from '../../components/UiTitleView.vue'
import UiButton from '../../components/UiButton.vue'

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const otmData = ref(null)

onMounted(() => {
    const data = getSelectedOtm()
    if (data && (String(data.ID_OTM) === String(props.id) || String(data.ID_MAQUINA) === String(props.id))) {
        otmData.value = data
    } else {
        console.warn('Los datos en sesión no coinciden con el ID de la URL o no existen')
    }
})
</script>

<style scoped>
.register-container {
    padding: var(--space-md);
    max-width: 1000px;
    margin: 0 auto;
}

.data-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.section-card {
    background: var(--color-background);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-card h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: var(--space-md);
    color: var(--color-text);
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--color-muted);
}

.value {
    font-size: 1.1rem;
    font-weight: 500;
}

.buttons-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
    margin-top: var(--space-sm);
    padding-bottom: var(--space-sm);
}

@media (max-width: 600px) {
    .details-grid {
        grid-template-columns: 1fr;
    }
}
</style>
