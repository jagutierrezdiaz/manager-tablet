<template>
    <div class="register-container">
        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="ArrowLeft" @click="$router.back()" />
            <div class="buttons-container-cards" v-if="itemsList.length > 0">
                <UiButton color="edit" icon="ArrowLeft" :disabled="currentIndex === 0" @click="anterior()" />

                <UiButton color="edit" icon="ArrowRight" :disabled="currentIndex === itemsList.length - 1"
                    @click="siguiente()" />
            </div>
        </div>

        <div v-if="rutaInfo" class="data-container">
            <UiTitleView 
            :titleOTM="rutaInfo.ID_TIPO_RUTA" 
            :titleActivity="rutaInfo.NOMBRE_TIPO_RUTA" 
            :text="`Ruta: ${String(rutaInfo.ID_NUMERICO || '').trim()}`"
            :fechaProgramada="rutaInfo.FECHA_PROGRAMADA"
                :colorCard="rutaInfo.COLOR_CARD || 'bg-primary'" />
        </div>

        <section class="section-card data-otm" v-if="currentItem">
            <div class="flex justify-between items-center mb-4">
                <h2>Referencias de la Ruta</h2>
                <span v-if="itemsList.length > 1" class="text-muted font-bold">
                    {{ currentIndex + 1 }} de {{ itemsList.length }}
                </span>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Proceso</th>
                        <td>{{ currentItem.NOMBRE_PROCESO }}</td>
                    </tr>
                    <tr>
                        <th>Etapa</th>
                        <td>{{ currentItem.NOMBRE_ETAPA }}</td>
                    </tr>
                    <tr>
                        <th>Máquina</th>
                        <td>{{ currentItem.NOMBRE_MAQUINA }}</td>
                    </tr>
                    <tr>
                        <th>Equipo</th>
                        <td>{{ currentItem.NOMBRE_EQUIPO }}</td>
                    </tr>
                </tbody>
            </table>
        </section>





        <section class="section-card data-tarea" v-if="currentItem">
            <h2 class="section-card-title">Tareas a realizar</h2>

            <textarea v-model="currentItem.INDICACIONES_ESPECIFICAS" placeholder="Escribe aquí tus tareas..." />
        </section>


        <section class="section-card data-observaciones" v-if="currentItem">
            <h2 class="section-card-title">Observaciones</h2>

            <textarea v-model="currentItem.OBSERVACION" placeholder="Escribe aquí tus observaciones..." />
        </section>


        <section class="section-card" v-if="currentItem">
            <h2 class="section-card-title">Resultados de la inspección</h2>
            <div class="flex flex-col gap-4">
                <h3>¿Cumple con los criterios de aceptación?</h3>
                <div class="flex gap-6">
                    <UiRadio label="Si cumple" v-model="currentItem.CUMPLE_REVISION" value="SI" color="create"
                        name="criterios" />
                    <UiRadio label="No cumple" v-model="currentItem.CUMPLE_REVISION" value="NO" color="delete"
                        name="criterios" />
                    <UiButton color="create" icon="Save" label="Guardar" @click="guardarRutaIndividual" />
                </div>
            </div>
        </section>




        <section class="section-card data-tiempo-ejecucion">
            <h2 style="margin:0; border:none; padding:0;">Tiempo Real de Ejecución Ruta</h2>
            <div class="flex items-center gap-3">
                <UiInput type="number" v-model="tiempoEjecucion" min="0" max="24" size="sm" minWidth="120px" />
                <span class="font-bold">Horas</span>
            </div>
        </section>

        <div class="footer-actions" v-if="itemsList.length > 0">
            <UiButton label="Cumplir" color="create" icon="Check" :disabled="!isUltimoRegistro"
                @click="cumplirRuta" />
        </div>

        <!-- Modal de Confirmación -->
        <UiModal v-if="rutaInfo" v-model="showConfirmModal" title="Finalizar Registro de Ruta"
            :message="`¿Estás seguro de que deseas marcar la ruta ${rutaInfo.NOMBRE_TIPO_RUTA} (ID: ${rutaInfo.ID_TIPO_RUTA}) como cumplida? Se guardarán todos los resultados de la inspección.`"
            confirmLabel="Sí, finalizar" confirmIcon="Check" @confirm="handleConfirmCumplir" />

        <!-- Alertas Flotantes -->
        <Transition name="fade-slide">
            <div v-if="alertConfig.show" class="alert-container-centered">
                <UiAlert :type="alertConfig.type" :title="alertConfig.title" :message="alertConfig.message"
                    @close="alertConfig.show = false" />
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import UiButton from '../../components/UiButton.vue'
import UiInput from '../../components/UiInput.vue'
import UiRadio from '../../components/UiRadio.vue'
import UiTitleView from '../../components/UiTitleView.vue'
import UiModal from '../../components/UiModal.vue'
import UiAlert from '../../components/UiAlert.vue'
import { getSelectedRuta, clearSelectedRuta } from '../../utils/dataTransfer.js'
import api from '../../api/axios.js'

const router = useRouter()

const rutaInfo = ref(null)
const itemsList = ref([])
const currentIndex = ref(0)

// Estado para alertas
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

const currentItem = computed(() => {
    return itemsList.value.length > 0 ? itemsList.value[currentIndex.value] : null
})

const isUltimoRegistro = computed(() => {
    return itemsList.value.length > 0 && currentIndex.value === itemsList.value.length - 1
})

const tiempoEjecucion = ref(0)
const showConfirmModal = ref(false)

// Lógica de autoguardado en LocalStorage
const storageKey = computed(() => rutaInfo.value ? `draft_ruta_${rutaInfo.value.ID_TIPO_RUTA.trim()}` : null)

function saveDraft() {
    if (!storageKey.value) return
    const draft = {
        itemsList: itemsList.value,
        tiempoEjecucion: tiempoEjecucion.value
    }
    localStorage.setItem(storageKey.value, JSON.stringify(draft))
}

function handleManualSave() {
    saveDraft()
    console.log('Borrador guardado manualmente')
}

// Observar cambios para guardar automáticamente
watch([itemsList, tiempoEjecucion], () => {
    saveDraft()
}, { deep: true })

async function cumplirRuta() {
    if (!rutaInfo.value) return

    if (Number(tiempoEjecucion.value) <= 0) {
        showAlert('warning', 'Tiempo requerido', 'El tiempo real de ejecución debe ser mayor a 0. Corrígelo antes de cumplir la ruta.')
        return
    }

    try {
        // Validar contra la BD que todos los registros tengan OBSERVACION y CUMPLE_REVISION
        const response = await api.get('/personRouteList/all-routes-details', {
            params: {
                idNumerico: rutaInfo.value.ID_NUMERICO,
                idTipoRuta: String(rutaInfo.value.ID_TIPO_RUTA || '').trim()
            }
        })
        const detalles = Array.isArray(response.data) ? response.data : []
        const hayIncompletos = detalles.some(item =>
            String(item.OBSERVACION || '').trim() === '' ||
            String(item.CUMPLE_REVISION || '').trim() === ''
        )

        console.log('detalles', detalles)

        if (detalles.length === 0 || hayIncompletos) {
            showAlert('warning', 'Registros incompletos', 'Es necesario que todos los registros tengan observación y resultado de revisión (cumple / no cumple) antes de cumplir la ruta.')
            return
        }

        showConfirmModal.value = true
    } catch (error) {
        console.error('Error al validar los registros de la ruta:', error)
        showAlert('error', 'Error', 'No se pudieron validar los registros de la ruta: ' + (error.response?.data?.error || error.message))
    }
}

async function handleConfirmCumplir() {
    if (!rutaInfo.value) return

    try {
        const now = new Date()
        const fechaCumplida = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        const data = {
            ID_NUMERICO: rutaInfo.value.ID_NUMERICO,
            FECHA_CUMPLIDA: fechaCumplida,
            TIEMPO_REAL: tiempoEjecucion.value
        }
        console.log('cumplir-ruta data', data)
        await api.post('/personRouteList/cumplir-ruta', data)

        // Limpiar borrador al finalizar
        if (storageKey.value) {
            localStorage.removeItem(storageKey.value)
        }

        clearSelectedRuta()
        router.push({ name: 'principal-rutas' })
    } catch (error) {
        console.error('Error al cumplir la ruta:', error)
        showAlert('error', 'Error', 'No se pudo cumplir la ruta: ' + (error.response?.data?.error || error.message))
    }
}

async function siguiente() {
    console.log('[siguiente] index actual:', currentIndex.value, 'total:', itemsList.value.length)
    if (currentIndex.value < itemsList.value.length - 1) {
        currentIndex.value++
        console.log('[siguiente] nuevo index:', currentIndex.value)
        await fetchEjecucionRuta()
    }
}

async function anterior() {
    console.log('[anterior] index actual:', currentIndex.value, 'total:', itemsList.value.length)
    if (currentIndex.value > 0) {
        currentIndex.value--
        console.log('[anterior] nuevo index:', currentIndex.value)
        await fetchEjecucionRuta()
    }
}


async function fetchEjecucionRuta() {
    if (!rutaInfo.value || !currentItem.value) {
        console.warn('[fetchEjecucionRuta] cancelado: rutaInfo o currentItem es null', {
            rutaInfo: rutaInfo.value,
            currentItem: currentItem.value
        })
        return
    }

    const params = {
        idNumero: rutaInfo.value.ID_NUMERICO,
        idTipoRuta: String(rutaInfo.value.ID_TIPO_RUTA || '').trim(),
        idEquipo: String(currentItem.value.ID_EQUIPO || '').trim()
    }

    try {
        const response = await api.get('/personRouteList/ejecucion-ruta', { params })
        const data = response.data
        console.log("data fetchEjecucionRuta", data)
        if (Array.isArray(data) && data.length > 0) {
            const ejecucion = data[0]
            if (currentItem.value) {
                currentItem.value.CUMPLE_REVISION = String(ejecucion.CUMPLE_REVISION || '').trim().toUpperCase()
                currentItem.value.OBSERVACION = ejecucion.OBSERVACION || ''
            }
        } else {
            // Si no hay datos en la base de datos, limpiamos los campos para este ítem
            if (currentItem.value) {
                currentItem.value.CUMPLE_REVISION = ''
                currentItem.value.OBSERVACION = ''
            }
        }
    } catch (error) {
        console.error('[fetchEjecucionRuta] error:', error)
    }
}

async function loadData() {
    const data = getSelectedRuta()
    if (data) {
        // Resetear estado anterior
        rutaInfo.value = data
        itemsList.value = []
        currentIndex.value = 0
        tiempoEjecucion.value = 0

        try {
            const response = await api.get(`/personRouteList/details`, {
                params: { idTipoRuta: String(data.ID_TIPO_RUTA || '').trim() }
            })

            console.log("response loadData", response.data)

            // Intentar cargar borrador de LocalStorage
            const savedDraft = localStorage.getItem(storageKey.value)
            const draftData = savedDraft ? JSON.parse(savedDraft) : null

            // Inicializar los campos de cada ítem. Las tareas (borrador local) se conservan,
            // pero CUMPLE_REVISION y OBSERVACION se llenan desde la BD con getEjecucionRuta.
            itemsList.value = response.data.map(item => {
                const savedItem = draftData?.itemsList?.find(i => i.ID_EQUIPO === item.ID_EQUIPO)
                return {
                    ...item,
                    INDICACIONES_ESPECIFICAS: savedItem?.INDICACIONES_ESPECIFICAS ?? item.INDICACIONES_ESPECIFICAS,
                    CUMPLE_REVISION: '',
                    OBSERVACION: ''
                }
            })

            if (draftData?.tiempoEjecucion) {
                tiempoEjecucion.value = draftData.tiempoEjecucion
            }

            // Cargar desde la BD la ejecución (OBSERVACION y CUMPLE_REVISION) del primer ítem
            await fetchEjecucionRuta()

            console.log('itemsList cargado', itemsList.value)
        } catch (error) {
            console.error('Error al cargar detalles de la ruta:', error)
        }
    }
}

onMounted(() => {
    loadData()
})

onActivated(() => {
    loadData()
})

async function guardarEjecucionRuta() {
    if (!currentItem.value) return

    try {
        const data = {
            ID_NUMERICO: rutaInfo.value.ID_NUMERICO,
            ID_TIPO_RUTA: String(rutaInfo.value.ID_TIPO_RUTA || '').trim(),
            ID_EQUIPO: String(currentItem.value.ID_EQUIPO || '').trim(),
            CUMPLE_REVISION: currentItem.value.CUMPLE_REVISION,
            OBSERVACION: currentItem.value.OBSERVACION
        }
        console.log('data', data)
        await api.post('/personRouteList/ejecucion-ruta', data)
        showAlert('success', 'Guardado', 'La ejecución de la ruta se ha guardado correctamente.')
    } catch (error) {
        console.error('Error al guardar ejecución de ruta:', error)
        showAlert('error', 'Error', 'No se pudo guardar la ejecución de la ruta: ' + (error.response?.data?.error || error.message))
    }
}

async function guardarRutaIndividual() {
    await guardarEjecucionRuta()
}
</script>

<style scoped>
.register-container {
    padding: var(--space-md);
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.data-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.section-card {
    background: var(--color-background);
    border-radius: var(--space-sm);
    padding: var(--space-md);
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-card h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: var(--space-sm);
    color: var(--color-text);
    border-bottom: 2px solid var(--color-surface);
    padding-bottom: 2px;
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
    padding: 6px 2px;
    background: var(--color-surface);
}

td {
    padding: 6px 2px;
    font-size: 1rem;
    border-bottom: 1px solid var(--color-surface);
}

.data-otm th {
    width: 30%;
    background: transparent;
}

.buttons-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
    margin-top: var(--space-sm);
    padding-bottom: var(--space-sm);
    border-top: 1px solid var(--color-surface);
}

.buttons-container-cards {
    display: flex;
    justify-content: end;
    align-items: end;
    gap: var(--space-sm);
}

.footer-actions {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-xl);
    border-top: 1px solid var(--color-surface);
}



.data-tiempo-ejecucion {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
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