<template>
    <div class="register-container">
        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="ArrowLeft" @click="$router.back()" />
            <UiButton label="Crear OTM" color="create" icon="Check" @click="crearOTM" />
        </div>

        <div v-if="otmData" class="data-container">
            <UiTitleView :titleOTM="otmData.NOMBRE_PROCESO" :titleActivity="otmData.NOMBRE_MAQUINA"
                :colorCard="otmData.COLOR_CARD" />


            <section class="section-card data-machine" v-if="dataMachine">
                <h2 class="section-card-title">Referencia de la Maquina</h2>
                <table>
                    <tbody>
                        <tr>
                            <th>Proceso</th>
                            <td>{{ dataMachine.NOMBRE_PROCESO }}</td>
                        </tr>
                        <tr>
                            <th>Etapa</th>
                            <td>{{ dataMachine.NOMBRE_ETAPA }}</td>
                        </tr>
                        <tr>
                            <th>Máquina</th>
                            <td>{{ dataMachine.NOMBRE_MAQUINA }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="section-card">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="section-card-title">Equipo afectado</h2>
                    <UiButton :label="isAddingEquipo ? 'Cancelar' : 'Seleccionar Equipo'"
                        :color="isAddingEquipo ? 'delete' : 'create'" :icon="isAddingEquipo ? 'x' : 'plus'"
                        iconPosition="end" @click="isAddingEquipo = !isAddingEquipo" />
                </div>

                <Transition name="fade-slide">
                    <div v-if="isAddingEquipo" class="mb-6">
                        <UiSearchSelector :items="listEquipos" :searchFields="['NOMBRE_EQUIPO', 'NOMBRE_TIPO_EQUIPO']"
                            itemKey="ID_EQUIPO" label="Buscar equipo" placeholder="Ej: Motor o Bomba"
                            selectLabel="Seleccionar equipo" confirmLabel="Confirmar"
                            :displayFormat="(e) => `${e.NOMBRE_EQUIPO} (${e.NOMBRE_TIPO_EQUIPO})`"
                            @select="confirmarSeleccionEquipo" />
                    </div>
                </Transition>

                <div class="equipo-asignado mt-4">
                    <div v-for="eq in addEquiposList" :key="eq.ID_EQUIPO" class="usuario-item equipo-item">
                        <div class="usuario-info">
                            <span class="text-muted text-xs"> {{ eq.ID_EQUIPO }} - {{ eq.NOMBRE_TIPO_EQUIPO }}</span>
                            <span class="usuario-name text-sm">{{ eq.NOMBRE_EQUIPO }}</span>
                        </div>
                        <div class="buttons-container-cards">
                            <UiButton color="delete" icon="trash" @click="eliminarEquipo(eq.ID_EQUIPO)" />
                        </div>
                    </div>
                    <p v-if="addEquiposList.length === 0" class="text-muted text-center py-4">
                        No se ha seleccionado un equipo para esta OTM.
                    </p>
                </div>
            </section>

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
                        <UiSearchSelector :items="actividadesList"
                            :searchFields="['nombreActividad', 'codigoActividad']" itemKey="codigoActividad"
                            label="Buscar actividad (Nombre o Código)" placeholder="Ej: Actividad 1 o 12345"
                            selectLabel="Seleccionar actividad" confirmLabel="Añadir a la lista"
                            :displayFormat="(a) => `Id: ${a.codigoActividad}  ${a.nombreActividad}`"
                            @select="confirmarSeleccion" />
                    </div>

                </Transition>
                <UiInput type="text" v-model="prioridadActividad" placeholder="Prioridad" />

                <div class="actividades-list">
                    <div class="actividad-item" v-for="actividad in addActividadesList"
                        :key="actividad.codigoActividad">
                        <div class="actividad-info">
                            <div class="flex align-center gap-3">
                                <span class="actividad-name">Nombre: {{ actividad.nombreActividad }} - Id: {{
                                    actividad.codigoActividad
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
    <UiModal v-model="showConfirmModal" title="Crear Nueva OTM" :message="confirmMessage" confirmLabel="Sí, crear"
        confirmIcon="Check" @confirm="handleConfirmCrear" />
</template>

<script setup>
import { onMounted, ref, computed, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import UiTitleView from '../../components/UiTitleView.vue'
import UiButton from '../../components/UiButton.vue'
import UiInput from '../../components/UiInput.vue'
import UiSearchSelector from '../../components/UiSearchSelector.vue'
import UiModal from '../../components/UiModal.vue'
import axios from '../../api/axios.js'

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
const prioridadActividad = ref('')
const showConfirmModal = ref(false)
const dataMachine = ref(null)
const listEquipos = ref([])
const addEquiposList = ref([])
const isAddingEquipo = ref(false)
const listActividades = ref([])
const isAddingActividad = ref(false)


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

function confirmarSeleccionEquipo(equipo) {
    if (equipo) {
        const exists = addEquiposList.value.some(e => e.ID_EQUIPO === equipo.ID_EQUIPO)
        if (!exists) {
            addEquiposList.value.push({ ...equipo })
        }
        isAddingEquipo.value = false
    }
}

function eliminarEquipo(idEquipo) {
    addEquiposList.value = addEquiposList.value.filter(e => e.ID_EQUIPO !== idEquipo)
}

function crearOTM() {
    showConfirmModal.value = true
}

function handleConfirmCrear() {
    clearSelectedOtm()
    showConfirmModal.value = false

    setTimeout(() => {
        router.push({ name: 'principal-correctivas' }).catch(() => { })
    }, 0)
}

function confirmarSeleccion(actividad) {
    addActividadesList.value.push(actividad)
    isAddingActividad.value = false
}

async function loadData() {
    const data = getSelectedOtm()
    if (data && (String(data.ID_OTM) === String(props.id) || String(data.ID_MAQUINA) === String(props.id))) {
        // Resetear estado anterior
        otmData.value = data
        dataMachine.value = null
        listEquipos.value = []
        addActividadesList.value = []
        addEquiposList.value = []
        isAddingEquipo.value = false
        listActividades.value = []
        isAddingActividad.value = false
        try {
            const responseMachine = await axios.get(`/otmCorrectiva/get-detail-machine/${data.ID_MAQUINA}`)
            // La consulta devuelve un array, tomamos el primer elemento
            dataMachine.value = Array.isArray(responseMachine.data) ? responseMachine.data[0] : responseMachine.data
            
            const responseEquipos = await axios.get(`/otmCorrectiva/get-list-equipos/${data.ID_MAQUINA}`)
            listEquipos.value = responseEquipos.data

            const responseActividades = await axios.get(`/otmCorrectiva/get-list-actividades/CORRECTIVO`)
            listActividades.value = responseActividades.data

            console.log('dataMachine', dataMachine.value)
            console.log('listEquipos', listEquipos.value)
            console.log('listActividades', listActividades.value)
        } catch (error) {
            console.error('Error al cargar datos de la OTM Correctiva:', error)
        }
    } else {
        console.warn('Los datos en sesión no coinciden con el ID de la URL o no existen')
    }
}

onMounted(() => {
    loadData()
})

onActivated(() => {
    loadData()
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

.section-card-title {
    font-size: 1.5rem !important;
    font-weight: 700;
    margin-bottom: 0 !important;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    text-align: left;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-muted);
    padding: 8px 4px;
    background: var(--color-surface);
    width: 30%;
}

td {
    padding: 8px 4px;
    font-size: 1rem;
    border-bottom: 1px solid var(--color-surface);
}

.buttons-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
    margin-top: var(--space-sm);
    padding-bottom: var(--space-sm);
}

.usuario-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface);
    border-radius: 8px;
    margin-bottom: var(--space-md);
    border: 1px solid rgba(0, 0, 0, 0.02);
    gap: var(--space-sm);
}

.usuario-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.usuario-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
}

.buttons-container-cards {
    display: flex;
    gap: var(--space-sm);
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

.equipo-item {
    border-left: 4px solid var(--color-primary);
}
</style>
