<template>
    <div class="register-container">
        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="ArrowLeft" @click="$router.back()" />
            <UiButton label="Crear OTM" color="create" icon="Check" @click="crearOTM" />
        </div>

        <div v-if="otmData" class="data-container">
            <UiTitleView 
                :titleOTM="otmData.NOMBRE_PROCESO"
                :titleActivity="otmData.NOMBRE_MAQUINA" 
                :colorCard="otmData.COLOR_CARD" 
            />
            
            <section class="section-card data-actividades">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="section-card-title">Actividades de mantenimiento</h2>
                    <UiButton :label="isAddingActividad ? 'Cancelar' : 'Agregar actividad'"
                        :color="isAddingActividad ? 'delete' : 'create'" :icon="isAddingActividad ? 'x' : 'plus'"
                        iconPosition="end" @click="agregaActividad()" />
                </div>

                <!-- Buscador y Selector de Usuarios (Componente Abstraído) -->
                <Transition name="fade-slide">
                    <div v-if="isAddingActividad" class="mb-6">
                        <UiSearchSelector :items="actividadesList" :searchFields="['nombreActividad', 'codigoActividad']"
                            itemKey="codigoActividad" label="Buscar actividad (Nombre o Código)"
                            placeholder="Ej: Actividad 1 o 12345" selectLabel="Seleccionar actividad"
                            confirmLabel="Añadir a la lista"
                            :displayFormat="(a) => `Id: ${a.codigoActividad}  ${a.nombreActividad}`"
                            @select="confirmarSeleccion" />
                    </div>

                </Transition>
                <UiInput type="text" v-model="prioridadActividad" placeholder="Prioridad" />

                <div class="actividades-list">
                    <div class="actividad-item" v-for="actividad in addActividadesList" :key="actividad.codigoActividad">
                        <div class="actividad-info">
                            <div class="flex align-center gap-3">
                                <span class="actividad-name">Nombre: {{ actividad.nombreActividad }} - Id: {{ actividad.codigoActividad
                                }}</span>
                            </div>
                        </div>
                    </div>
                    <p v-if="addActividadesList.length === 0" class="text-muted text-center py-4">
                        No hay actividades adicionales asignadas.
                    </p>
                </div>
            </section>


            <section class="section-card">
                <h2 class="section-card-title">Observaciones</h2>

                <textarea placeholder="Escribe aquí tus observaciones..." />
            </section>
        </div>
    </div>

    <!-- Modal de Confirmación -->
    <UiModal
        v-model="showConfirmModal"
        title="Crear Nueva OTM"
        :message="confirmMessage"
        confirmLabel="Sí, crear"
        confirmIcon="Check"
        @confirm="handleConfirmCrear"
    />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import UiTitleView from '../../components/UiTitleView.vue'
import UiButton from '../../components/UiButton.vue'
import UiInput from '../../components/UiInput.vue'
import UiSearchSelector from '../../components/UiSearchSelector.vue'
import UiModal from '../../components/UiModal.vue'

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const router = useRouter()
const otmData = ref(null)
const actividadesList = ref([])
const addActividadesList = ref([])
const isAddingActividad = ref(false)
const prioridadActividad = ref('')
const showConfirmModal = ref(false)

const confirmMessage = computed(() => {
    if (!otmData.value) {
        return `¿Estás seguro de que deseas crear esta OTM Correctiva (ID: ${props.id})?`
    }

    const nombre = otmData.value.NOMBRE_MAQUINA || 'la máquina seleccionada'
    const id = otmData.value.ID_OTM || otmData.value.ID_MAQUINA || props.id
    return `¿Estás seguro de que deseas crear la OTM Correctiva para ${nombre} (ID: ${id})?`
})

function agregaActividad() {
    isAddingActividad.value = !isAddingActividad.value
}

function crearOTM() {
    showConfirmModal.value = true
}

function handleConfirmCrear() {
    clearSelectedOtm()
    showConfirmModal.value = false

    setTimeout(() => {
        router.push({ name: 'principal-correctivas' }).catch(() => {})
    }, 0)
}

function confirmarSeleccion(actividad) {
    addActividadesList.value.push(actividad)
    isAddingActividad.value = false
}

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


textarea {
    width: 100%;
    min-height: 150px;
    border-radius: var(--radius);
    border: 2px solid rgba(0, 0, 0, 0.05);
    padding: var(--space-md);
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    resize: vertical;
}

textarea:focus {
    outline: none;
    border-color: var(--color-primary);
}

@media (max-width: 600px) {
    .details-grid {
        grid-template-columns: 1fr;
    }
}
</style>
