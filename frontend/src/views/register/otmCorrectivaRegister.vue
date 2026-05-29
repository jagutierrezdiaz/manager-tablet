<template>
    <div class="register-container">
        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="ArrowLeft" @click="$router.back()" />
        </div>

        <div v-if="otmData" class="data-container">



            <UiTitleView :titleOTM="otmData.NOMBRE_PROCESO" :titleActivity="otmData.NOMBRE_MAQUINA"
                :colorCard="otmData.COLOR_CARD" :text1="`Proceso: ${otmData.NOMBRE_PROCESO}`"
                :text2="`Máquina: ${otmData.NOMBRE_MAQUINA}`" />


            <section class="section-card">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="section-card-title">Equipo Seleccionado</h2>
                    <UiButton v-if="addEquiposList.length === 0"
                        :label="isAddingEquipo ? 'Cancelar' : 'Seleccionar Equipo'"
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
                <div class="section-head">
                    <h2 class="section-card-title">Actividades de mantenimiento</h2>
                    <UiButton :label="isAddingActividad ? 'Cancelar' : 'Agregar actividad'"
                        :color="isAddingActividad ? 'delete' : 'create'" :icon="isAddingActividad ? 'x' : 'plus'"
                        iconPosition="end" @click="agregaActividad()" />
                </div>

                <!-- Panel para agregar actividades -->
                <Transition name="fade-slide">
                    <div v-if="isAddingActividad" class="add-panel">
                        <div class="add-panel__field">
                            <label class="field-label">Clase de actividad</label>
                            <select v-model="claseActividadSeleccionada" class="clase-select"
                                @change="fetchActividades">
                                <option v-for="clase in clasesActividad" :key="clase" :value="clase">{{ clase }}
                                </option>
                            </select>
                        </div>

                        <UiSearchSelector :items="actividadesList"
                            :searchFields="['NOMBRE_ACTIVIDAD', 'CLASE_ACTIVIDAD']" itemKey="NOMBRE_ACTIVIDAD"
                            label="Buscar actividad" placeholder="Ej: Lubricar o Revisar"
                            :displayFormat="(a) => `${a.NOMBRE_ACTIVIDAD} (${a.CLASE_ACTIVIDAD})`"
                            @select="confirmarSeleccion" />
                    </div>
                </Transition>

                <div class="actividades-list">
                    <div class="actividad-chip" v-for="actividad in addActividadesList"
                        :key="actividad.NOMBRE_ACTIVIDAD">
                        <div class="actividad-chip__info">
                            <span class="actividad-chip__name">{{ actividad.NOMBRE_ACTIVIDAD }}</span>
                            <span class="actividad-chip__badge">{{ actividad.CLASE_ACTIVIDAD }}</span>
                        </div>
                        <UiButton color="delete" icon="trash" @click="eliminarActividad(actividad.NOMBRE_ACTIVIDAD)" />
                    </div>
                    <p v-if="addActividadesList.length === 0" class="empty-text">
                        No hay actividades asignadas.
                    </p>
                </div>
            </section>

            <section class="section-card">
                <h2 class="section-card-title mb-4">Parada de Máquina</h2>
                <div class="flex flex-col gap-4">
                    <h3>¿Causó parada de máquina?</h3>
                    <div class="flex gap-6 justify-center">
                        <UiRadio label="No" v-model="causoParada" value="NO" color="create" name="parada" />
                        <UiRadio label="Sí" v-model="causoParada" value="SI" color="delete" name="parada" />
                    </div>
                </div>
            </section>

            <section class="section-card">
                <h2 class="section-card-title">Observaciones</h2>

                <textarea v-model="observacionesOTM" placeholder="Escribe aquí tus observaciones..." />
            </section>

        </div>
        <div class="flex justify-center mt-6 mb-16">
            <UiButton label="Crear OTM" color="create" icon="Check" @click="crearOTM" />
        </div>
    </div>

    <!-- Modal de Confirmación -->
    <UiModal v-model="showConfirmModal" title="Crear Nueva OTM" :message="confirmMessage" confirmLabel="Sí, crear"
        confirmIcon="Check" @confirm="handleConfirmCrear" />

    <!-- Alertas Flotantes Centradas -->
    <Transition name="fade-slide">
        <div v-if="alertConfig.show" class="alert-container-centered">
            <UiAlert :type="alertConfig.type" :title="alertConfig.title" :message="alertConfig.message"
                @close="alertConfig.show = false" />
        </div>
    </Transition>
</template>

<script setup>
import { onMounted, ref, computed, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import UiTitleView from '../../components/UiTitleView.vue'
import UiButton from '../../components/UiButton.vue'
import UiRadio from '../../components/UiRadio.vue'
import UiSearchSelector from '../../components/UiSearchSelector.vue'
import UiModal from '../../components/UiModal.vue'
import UiAlert from '../../components/UiAlert.vue'
import axios from '../../api/axios.js'
const causoParada = ref('NO')

const emit = defineEmits(['logout', 'continue'])

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
const prioridadActividad = ref('Alta')
const observacionesOTM = ref('')
const showConfirmModal = ref(false)
const dataMachine = ref(null)
const listEquipos = ref([])
const addEquiposList = ref([])
const isAddingEquipo = ref(false)
const isAddingActividad = ref(false)

const alertConfig = ref({
    show: false,
    type: 'info',
    title: '',
    message: ''
})

function showAlert(type, title, message) {
    alertConfig.value = { show: true, type, title, message }
    setTimeout(() => {
        alertConfig.value.show = false
    }, 5000)
}

const clasesActividad = ['TODOS', 'LUBRICACION', 'ELECTRICO', 'MECANICO', 'INSTRUMENTACION']
const claseActividadSeleccionada = ref('TODOS')


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
        // Solo se permite un único equipo: la nueva selección reemplaza a la anterior
        addEquiposList.value = [{ ...equipo }]
        isAddingEquipo.value = false
    }
}

function eliminarEquipo(idEquipo) {
    addEquiposList.value = addEquiposList.value.filter(e => e.ID_EQUIPO !== idEquipo)
}

function crearOTM() {
    showConfirmModal.value = true
}

async function handleConfirmCrear() {
    if (addEquiposList.value.length === 0 || addActividadesList.value.length === 0) {
        showAlert('warning', 'Campos incompletos', 'Por favor seleccione un equipo y al menos una actividad.')
        return
    }

    try {
        const equipo = addEquiposList.value[0]
        const actividad = addActividadesList.value[0] // Tomamos la primera actividad seleccionada

        const data = {
            ID_EQUIPO: equipo.ID_EQUIPO,
            ID_ACTIVIDAD: actividad.ID_ACTIVIDAD,
            CAUSO_PARADA: causoParada.value,
            OBSERVACION_OTM: observacionesOTM.value,
            PRIORIDAD: prioridadActividad.value
        }

        console.log('Enviando datos OTM:', data)
        await axios.post('/otmCorrectiva/save-otm', data)

        showAlert('success', '¡Éxito!', 'La OTM Correctiva ha sido creada correctamente.')
        showConfirmModal.value = false
        clearSelectedOtm()

        setTimeout(() => {
            router.push({ name: 'principal-correctivas' }).catch(() => { })
        }, 2000)
    } catch (error) {
        console.error('Error al crear la OTM:', error)
        const errorMsg = error.response?.data?.error || 'Hubo un error al crear la OTM. Por favor intente de nuevo.'
        showAlert('error', 'Error al crear', errorMsg)
    }
}

function confirmarSeleccion(actividad) {
    const exists = addActividadesList.value.some(a => a.NOMBRE_ACTIVIDAD === actividad.NOMBRE_ACTIVIDAD)
    if (!exists) {
        addActividadesList.value.push({ ...actividad })
    }
    isAddingActividad.value = false
}

function eliminarActividad(nombreActividad) {
    addActividadesList.value = addActividadesList.value.filter(a => a.NOMBRE_ACTIVIDAD !== nombreActividad)
}

async function fetchActividades() {
    try {
        const clase = claseActividadSeleccionada.value
        const url = clase && clase !== 'TODOS'
            ? `/otmCorrectiva/get-list-actividades/${clase}`
            : '/otmCorrectiva/get-list-actividades'
        const response = await axios.get(url)
        actividadesList.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.error('Error al cargar actividades:', error)
        actividadesList.value = []
    }
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
        actividadesList.value = []
        claseActividadSeleccionada.value = 'TODOS'
        isAddingActividad.value = false
        try {
            const responseMachine = await axios.get(`/otmCorrectiva/get-detail-machine/${data.ID_MAQUINA}`)
            // La consulta devuelve un array, tomamos el primer elemento
            dataMachine.value = Array.isArray(responseMachine.data) ? responseMachine.data[0] : responseMachine.data

            const responseEquipos = await axios.get(`/otmCorrectiva/get-list-equipos/${data.ID_MAQUINA}`)
            listEquipos.value = responseEquipos.data

            await fetchActividades()

            console.log('dataMachine', dataMachine.value)
            console.log('listEquipos', listEquipos.value)
            console.log('actividadesList', actividadesList.value)
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

/* ===== Sección Actividades ===== */
.section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    flex-wrap: wrap;
}

.data-actividades {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.add-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--color-surface);
    border: 2px solid rgba(37, 99, 235, 0.12);
    border-radius: var(--radius);
}

.add-panel__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xxs);
}

.field-label {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--color-text);
}

.clase-select {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    border: 2px solid rgba(15, 23, 42, 0.08);
    background: var(--color-background);
    font-size: var(--fs-base);
    font-family: inherit;
    font-weight: 500;
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.clase-select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.actividades-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.actividad-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-md);
    background: var(--color-surface);
    border-radius: 10px;
    border-left: 4px solid var(--color-secondary);
}

.actividad-chip__info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    min-width: 0;
}

.actividad-chip__name {
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--color-text);
}

.actividad-chip__badge {
    font-size: var(--fs-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--color-secondary);
    background: rgba(124, 58, 237, 0.1);
    padding: 2px 10px;
    border-radius: 100px;
}

.empty-text {
    text-align: center;
    color: var(--color-muted);
    font-size: var(--fs-sm);
    padding: var(--space-md);
    margin: 0;
}

@media (pointer: coarse) {
    .clase-select {
        min-height: 48px;
    }
}

.alert-container-centered {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    width: 90%;
    max-width: 500px;
    pointer-events: none;
}

.alert-container-centered>* {
    pointer-events: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translate(-50%, -60%);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translate(-50%, -40%);
}
</style>
