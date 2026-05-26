<template>
    <div class="register-container">

        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="arrow-left" @click="$router.back()" />
            <div v-if="itemsList.length > 0">
                <span v-if="itemsList.length > 1" class="pagination-info">{{ currentIndex + 1 }} de {{ itemsList.length
                    }}</span>
                <UiButton v-if="itemsList.length > 1" label="Anterior" color="edit" icon="arrow-left"
                    :disabled="currentIndex === 0" @click="anterior()" />

                <UiButton v-if="currentIndex < itemsList.length - 1" label="Siguiente" color="edit" icon="arrow-right"
                    @click="siguiente()" />

                <UiButton v-if="currentIndex === itemsList.length - 1" label="Cumplir" color="create" icon="save"
                    @click="cumplir()" />
            </div>
        </div>

        <!-- Alertas Flotantes -->
        <Transition name="fade-slide">
            <div v-if="alertConfig.show" class="alert-container-centered">
                <UiAlert 
                    :type="alertConfig.type" 
                    :title="alertConfig.title" 
                    :message="alertConfig.message"
                    @close="alertConfig.show = false" 
                />
            </div>
        </Transition>

        <div v-if="otmData && currentDatosOtm" class="data-container">

            <section class="section-card data-otm">
                <h2>Datos de la OTM</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Id Orden</th>
                            <th>Tipo Mantenimiento</th>
                            <th>Fecha Programada</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ otmData.ID_OTM }}</td>
                            <td>{{ otmData.TIPO_MANTENIMIENTO }}</td>
                            <td>{{ formatDate(otmData.FECHA_PROGRAMADA) }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="section-card data-item-referencia-layout">
                <h2>Referencia en el Layout</h2>
                <table>
                    <tbody>
                        <tr>
                            <th>Proceso</th>
                            <td>{{ currentDatosOtm.NOMBRE_PROCESO }}</td>
                        </tr>
                        <tr>
                            <th>Etapa</th>
                            <td>{{ currentDatosOtm.NOMBRE_ETAPA }}</td>
                        </tr>
                        <tr>
                            <th>Maquina</th>
                            <td>{{ currentDatosOtm.NOMBRE_MAQUINA }}</td>
                        </tr>
                        <tr>
                            <th>Equipo</th>
                            <td>{{ currentDatosOtm.NOMBRE_EQUIPO }}</td>
                        </tr>
                        <tr>
                            <th>Actividad</th>
                            <td>{{ currentDatosOtm.NOMBRE_ACTIVIDAD }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>


            <section class="section-card data-usuarios">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="section-card-title">Personal asignado</h2>
                    <UiButton :label="isAddingUser ? 'Cancelar' : 'Agregar Personal'"
                        :color="isAddingUser ? 'delete' : 'create'" :icon="isAddingUser ? 'x' : 'plus'"
                        iconPosition="end" @click="agregarUsuario()" />
                </div>

                <!-- Buscador y Selector de Usuarios (Componente Abstraído) -->
                <Transition name="fade-slide">
                    <div v-if="isAddingUser" class="mb-6">
                        <UiSearchSelector :items="usersList" :searchFields="['nombrePersona', 'codigoPersona']"
                            itemKey="codigoPersona" label="Buscar usuario (Nombre o Código)"
                            placeholder="Ej: Juan Perez o 12345" selectLabel="Seleccionar usuario"
                            confirmLabel="Añadir a la lista"
                            :displayFormat="(u) => `Id: ${u.codigoPersona}  ${u.nombrePersona}`"
                            @select="confirmarSeleccion" />
                    </div>
                </Transition>

                <div class="usuarios-list">
                    <div class="usuario-item" v-for="user in addUsersList" :key="user.codigoPersona">
                        <div class="usuario-info">
                            <div class="flex align-center gap-3">
                                <span class="usuario-name">Nombre: {{ user.nombrePersona }} - Id: {{ user.codigoPersona
                                }}</span>
                            </div>

                            <div class="flex flex-col align-center gap-3">
                                <div>
                                    <label>Hora de inicio</label>
                                    <UiInput type="datetime-local" v-model="user.horaInicio" size="sm" minWidth="120px"
                                        placeholder="Hora de inicio"
                                        :min="formatForDateTimeInput(otmData.FECHA_PROGRAMADA)" />

                                </div>
                                <div>
                                    <label>Hora de fin</label>
                                    <UiInput type="datetime-local" v-model="user.horaFin" size="sm" minWidth="120px"
                                        placeholder="Hora de fin"
                                        :min="user.horaInicio || formatForDateTimeInput(otmData.FECHA_PROGRAMADA)" />
                                </div>
                                <div>
                                    <label>Tiempo total</label>
                                    <UiInput type="text" v-model="user.horaTotal" size="sm" minWidth="120px"
                                        placeholder="00:00" readonly />
                                </div>
                            </div>
                        </div>

                        <div class="buttons-container-cards">
                            <UiButton color="create" icon="save" @click="guardarUsuario(user.codigoPersona)" />
                            <UiButton color="delete" icon="trash" @click="eliminarUsuario(user.codigoPersona)" />
                        </div>
                    </div>
                    <p v-if="addUsersList.length === 0" class="text-muted text-center py-4">
                        No hay personal adicional asignado.
                    </p>
                </div>
            </section>

            <section class="section-card repuestos-list">
                <div class="repuestos-list">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="section-card-title">Repuestos asignados</h2>
                        <UiButton :label="isAddingRepuesto ? 'Cancelar' : 'Agregar repuesto'"
                            :color="isAddingRepuesto ? 'delete' : 'create'" :icon="isAddingRepuesto ? 'x' : 'plus'"
                            iconPosition="end" @click="agregarRepuesto()" />
                    </div>

                    <Transition name="fade-slide">
                        <div v-if="isAddingRepuesto" class="mb-6 flex flex-col gap-4">
                            <!-- Paso 1: Seleccionar Tipo -->
                            <UiSearchSelector 
                                v-if="!selectedTipoRepuesto"
                                :items="tipoRepuestosList"
                                :searchFields="['NOMBRE_TIPO_REPUESTO']" 
                                itemKey="ID_TIPO_REPUESTO"
                                label="1. Buscar tipo de repuesto" 
                                placeholder="Ej: Rodamientos, Motores..."
                                selectLabel="Seleccionar tipo" 
                                confirmLabel="Siguiente"
                                :displayFormat="(r) => r.NOMBRE_TIPO_REPUESTO"
                                @select="confirmarSeleccionTipoRepuesto" 
                            />

                            <!-- Paso 2: Seleccionar Repuesto Específico -->
                            <div v-else class="flex flex-col gap-2">
                                <div class="flex justify-between items-center bg-primary/5 p-2 rounded border border-primary/10">
                                    <span class="text-sm font-bold">Tipo: {{ selectedTipoRepuesto.NOMBRE_TIPO_REPUESTO }}</span>
                                    <UiButton label="Cambiar tipo" size="sm" color="info" @click="selectedTipoRepuesto = null" />
                                </div>
                                <UiSearchSelector 
                                    :items="repuestosList"
                                    :searchFields="['NOMBRE_REPUESTO']" 
                                    itemKey="ID_REPUESTO"
                                    label="2. Buscar repuesto específico" 
                                    placeholder="Nombre del repuesto..."
                                    selectLabel="Seleccionar repuesto" 
                                    confirmLabel="Agregar repuesto"
                                    :displayFormat="(r) => `${r.NOMBRE_REPUESTO} (Stock: ${r.INV_ACTUAL})`"
                                    @select="confirmarSeleccionRepuesto" 
                                />
                            </div>
                        </div>
                    </Transition>

                    <!-- Lista de Repuestos Agregados -->
                    <div class="repuestos-agregados mt-4">
                        <div v-for="rep in addRepuestosList" :key="rep.ID_REPUESTO" class="repuesto-item-card">
                            <div class="flex justify-between items-center p-3 bg-surface rounded-lg border mb-2">
                                <div>
                                    <p class="font-bold">{{ rep.NOMBRE_REPUESTO }}</p>
                                    <p class="text-xs text-muted">Unidad de medida: {{ rep.UNIDAD_MEDIDA }}</p>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <label class="text-xs font-bold">Cant:</label>
                                        <input type="number" v-model="rep.UND_REAL" class="w-16 p-1 border rounded text-center" min="1" />
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <UiButton color="create" icon="save" size="sm" @click="guardarRepuesto(rep)" />
                                        <UiButton color="delete" icon="trash" size="sm" @click="eliminarRepuesto(rep.ID_REPUESTO)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-if="addRepuestosList.length === 0" class="text-center text-muted py-4">No hay repuestos agregados.</p>
                    </div>
                </div>
            </section>

            <section class="section-card">
                <h2 class="section-card-title">Fotos</h2>
                <div class="grid  gap-6 mt-4">
                    <UiImageUpload label="Foto 1" v-model="foto1"
                        placeholder="Capturar o seleccionar foto 1" />
                    <UiImageUpload label="Foto 2" v-model="foto2"
                        placeholder="Capturar o seleccionar foto 2" />
                </div>
            </section>


            <section class="data-observaciones">
                <h2 class="section-card-title">Observaciones</h2>
                <div class="section-card obs-box">
                    <h2>Observaciones al crear</h2>
                    <textarea v-model="currentDatosOtm.OBSERVACION_OTM" readonly />
                </div>

                <div class="section-card obs-box">
                    <h2>Observaciones al ejecutar</h2>
                    <textarea placeholder="Escribe aquí tus observaciones..." />
                </div>

                <UiButton label="Guardar observaciones" color="create" icon="save" iconPosition="end"
                    @click="guardarObservaciones()" />
            </section>

            <section class="section-card data-tiempo-ejecucion">
                <h2 style="margin:0; border:none; padding:0;">Tiempo de ejecución</h2>
                <div class="flex items-center gap-3">
                    <UiInput type="number" v-model="tiempoEjecucion" min="0" max="24" size="sm" minWidth="120px" />
                    <span class="font-bold">Horas</span>
                </div>
            </section>


            <section class="section-card">
                <h2 class="section-card-title">Aprobación OTM</h2>

                <Transition name="fade-slide">
                    <div class="mb-6">
                        <UiSearchSelector :items="supervisorList" :searchFields="['nombrePersona']"
                            itemKey="codigoPersona" label="Buscar supervisor"
                            placeholder="Ej: Juan Perez" selectLabel="Seleccionar supervisor"
                            confirmLabel="Añadir a la lista"
                            :displayFormat="(s) => `${s.nombrePersona}`" />
                    </div>
                </Transition>

                <UiButton label="Aprobar" color="create" icon="check" iconPosition="end" @click="aprobarOTM()" />
            </section>
        </div>

        <!-- Modal de Confirmación -->
        <UiModal 
            v-if="otmData && currentDatosOtm"
            v-model="showConfirmModal"
            title="Finalizar Orden de Trabajo"
            :message="`¿Estás seguro de que deseas marcar la OTM #${otmData.ID_OTM} (${currentDatosOtm.NOMBRE_ACTIVIDAD}) como cumplida? Esta acción no se puede deshacer.`"
            confirmLabel="Sí, finalizar"
            confirmIcon="Check"
            @confirm="handleConfirmCumplir"
        />
    </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import axios from '../../api/axios.js'
import UiButton from '../../components/UiButton.vue'
import UiInput from '../../components/UiInput.vue'
import UiSearchSelector from '../../components/UiSearchSelector.vue'
import UiImageUpload from '../../components/UiImageUpload.vue'
import UiModal from '../../components/UiModal.vue'
import UiAlert from '../../components/UiAlert.vue'
import { formatDate, formatForDateTimeInput } from '../../utils/formatDate.js'

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const router = useRouter()
const otmData = ref(null)
const itemsList = ref([])
const usersList = ref([])
const tipoRepuestosList = ref([])
const repuestosList = ref([])
const supervisorList = ref([])
const currentIndex = ref(0)
const tiempoEjecucion = ref(0)
const addUsersList = ref([])
const addSupervisorList = ref([])
const isAddingUser = ref(false)
const isAddingSupervisor = ref(false)
const isAddingRepuesto = ref(false)
const selectedTipoRepuesto = ref(null)
const addRepuestosList = ref([])
const foto1 = ref(null)
const foto2 = ref(null)
const showConfirmModal = ref(false)

// Estado para alertas
const alertConfig = ref({
    show: false,
    type: 'info',
    title: '',
    message: ''
})

function showAlert(type, title, message) {
    alertConfig.value = { show: true, type, title, message }
    // Todas las alertas se cierran automáticamente después de 5 segundos
    setTimeout(() => {
        alertConfig.value.show = false
    }, 5000)
}

// Calcular tiempo total automáticamente para cada usuario
watch(() => addUsersList.value, (newList) => {
    newList.forEach(user => {
        if (user.horaInicio && user.horaFin) {
            const start = new Date(user.horaInicio)
            const end = new Date(user.horaFin)
            
            const diffMs = end - start
            if (diffMs > 0) {
                const totalSeconds = Math.floor(diffMs / 1000)
                const hours = Math.floor(totalSeconds / 3600)
                const minutes = Math.floor((totalSeconds % 3600) / 60)
                
                user.horaTotal = [hours, minutes]
                    .map(v => v.toString().padStart(2, '0'))
                    .join(':')
            } else {
                user.horaTotal = '00:00'
            }
        } else {
            user.horaTotal = '00:00'
        }
    })
}, { deep: true })

const currentDatosOtm = computed(() => {
    return itemsList.value.length > 0 ? itemsList.value[currentIndex.value] : null
})

function siguiente() {
    if (currentIndex.value < itemsList.value.length - 1) {
        currentIndex.value++
    }
}

function anterior() {
    if (currentIndex.value > 0) {
        currentIndex.value--
    }
}

function cumplir() {
    showConfirmModal.value = true
}

function handleConfirmCumplir() {
    console.log('OTM Cumplida confirmada')
    // Aquí iría la lógica de guardado final
    clearSelectedOtm()
    router.push({ name: 'principal-programadas' })
}

onMounted(async () => {
    const data = getSelectedOtm()
    const idStr = String(props.id)

    // Verificamos que los datos correspondan al ID de la URL
    if (data && (String(data.ID_OTM) === idStr || String(data.ID_MAQUINA) === idStr)) {
        otmData.value = data

        try {
            // Ejecutamos ambas peticiones en paralelo
            const [otmRes, usersRes, tipoRepuestosRes, supervisoresRes, personasAsignadasRes, repuestosAsignadosRes] = await Promise.all([
                axios.get('otmProgramada/get-datos-otm-programada', { params: { idOtmProgramada: idStr } }),
                axios.get('users/not-suspended').catch(err => {
                    console.error('Error al cargar datos de los usuarios:', err)
                    return { data: [] }
                }),
                axios.get('otmProgramada/get-tipo-repuestos'),
                axios.get('users/get-supervisores'),
                axios.get('users/personas-asignadas', { params: { idOtm: idStr } }),
                axios.get('otmProgramada/get-repuestos-asignados-otm', { params: { idOtm: idStr } }),
            ])

            itemsList.value = Array.isArray(otmRes.data) ? otmRes.data : [otmRes.data]
            usersList.value = Array.isArray(usersRes.data) ? usersRes.data : [usersRes.data]
            currentIndex.value = 0
            tipoRepuestosList.value = Array.isArray(tipoRepuestosRes.data) ? tipoRepuestosRes.data : [tipoRepuestosRes.data]
            supervisorList.value = Array.isArray(supervisoresRes.data) ? supervisoresRes.data : [supervisoresRes.data]
            if (Array.isArray(personasAsignadasRes.data)) {
                addUsersList.value = personasAsignadasRes.data.map(u => ({
                    ...u,
                    horaInicio: formatForDateTimeInput(u.horaInicio),
                    horaFin: formatForDateTimeInput(u.horaFin),
                    // Si el backend ya trae horaTotal, lo usamos, si no el watch lo calculará
                    horaTotal: u.horaTotal || '00:00:00'
                }))
            }
            if (Array.isArray(repuestosAsignadosRes.data)) {
                addRepuestosList.value = repuestosAsignadosRes.data
                console.log('Repuestos asignados:', addRepuestosList.value)
            }
        } catch (error) {
            console.error('Error al cargar datos de la OTM:', error)
        }
    } else {
        console.warn('Los datos en sesión no coinciden con el ID de la URL o no existen')
    }

    // eslint-disable-next-line no-console
    console.log('Carga completada:', {
        otm: otmData.value,
        items: itemsList.value.length,
        users: usersList.value,
        personasAsignadas: addUsersList.value,
        repuestosAsignados: addRepuestosList.value
    })
})

function agregarUsuario() {
    isAddingUser.value = !isAddingUser.value
}


async function eliminarUsuario(codigoPersona) {
    try {
        await axios.delete('otmProgramada/delete-persona-asignada-otm', {
            params: {
                idOtm: otmData.value.ID_OTM,
                codigoPersona: codigoPersona
            }
        })
        addUsersList.value = addUsersList.value.filter(u => u.codigoPersona !== codigoPersona)
        showAlert('success', 'Eliminado', 'El personal ha sido eliminado correctamente')
    } catch (error) {
        console.error('Error al eliminar personal:', error)
        showAlert('error', 'Error', 'No se pudo eliminar el personal: ' + (error.response?.data?.error || error.message))
    }
}

async function guardarUsuario(codigoPersona) {
    const user = addUsersList.value.find(u => u.codigoPersona === codigoPersona)
    if (!user) return

    if (!user.horaInicio || !user.horaFin) {
        showAlert('warning', 'Datos incompletos', 'Debe ingresar hora de inicio y fin')
        return
    }

    const inicio = new Date(user.horaInicio)
    const fin = new Date(user.horaFin)
    const fechaProgramada = new Date(otmData.value.FECHA_PROGRAMADA)

    // Validaciones
    if (inicio >= fin) {
        showAlert('error', 'Fechas incorrectas', 'La fecha de inicio debe ser menor a la fecha de fin y no pueden ser iguales')
        return
    }

    if (inicio < fechaProgramada) {
        showAlert('error', 'Fecha inválida', `La fecha de inicio no puede ser menor a la fecha programada (${formatDate(otmData.value.FECHA_PROGRAMADA)})`)
        return
    }

    try {
        const payload = {
            codigoPersona: user.codigoPersona,
            horaInicio: user.horaInicio,
            horaFin: user.horaFin,
            horaTotal: user.horaTotal,
            ano: inicio.getFullYear(),
            mes: inicio.getMonth() + 1
        }

        await axios.post(`otmProgramada/save-persona-asignada-otm/${otmData.value.ID_OTM}`, payload)
        showAlert('success', 'Guardado en Base de Datos', 'El personal ha sido registrado correctamente en la base de datos.')
    } catch (error) {
        console.error('Error al guardar personal:', error)
        showAlert('error', 'Error de guardado', 'No se pudo guardar el personal: ' + (error.response?.data?.error || error.message))
    }
}

function confirmarSeleccion(user) {
    if (user) {
        // Evitar duplicados por codigoPersona
        const exists = addUsersList.value.some(u => u.codigoPersona === user.codigoPersona)
        if (!exists) {
            addUsersList.value.push({ ...user })
        }
        isAddingUser.value = false
    }
}

function agregarRepuesto() {
    isAddingRepuesto.value = !isAddingRepuesto.value
    selectedTipoRepuesto.value = null
    repuestosList.value = []
}


async function guardarRepuesto(repuesto) {
    if (!repuesto.UND_REAL || repuesto.UND_REAL <= 0) {
        showAlert('warning', 'Cantidad inválida', 'La cantidad ingresada debe ser mayor a 0')
        return
    }

    try {
        const now = new Date()
        const payload = {
            ID_REPUESTO: repuesto.ID_REPUESTO,
            UND_REAL: repuesto.UND_REAL,
            ano: now.getFullYear(),
            mes: now.getMonth() + 1
        }

        await axios.post('otmProgramada/save-repuestos-asignados-otm', payload, {
            params: { idOtm: otmData.value.ID_OTM }
        })
        
        showAlert('success', 'Repuesto guardado', `El repuesto ${repuesto.NOMBRE_REPUESTO} ha sido guardado correctamente`)
    } catch (error) {
        console.error('Error al guardar repuesto:', error)
        showAlert('error', 'Error de guardado', 'No se pudo guardar el repuesto: ' + (error.response?.data?.error || error.message))
    }
}


async function eliminarRepuesto(idRepuesto) {
    try {
        await axios.delete('otmProgramada/delete-repuestos-asignados-otm', {
            params: {
                idOtm: otmData.value.ID_OTM,
                idRepuesto: idRepuesto
            }
        })
        addRepuestosList.value = addRepuestosList.value.filter(r => r.ID_REPUESTO !== idRepuesto)
        showAlert('success', 'Eliminado', 'El repuesto ha sido eliminado correctamente')
    } catch (error) {
        console.error('Error al eliminar repuesto:', error)
        showAlert('error', 'Error', 'No se pudo eliminar el repuesto: ' + (error.response?.data?.error || error.message))
    }
}

async function confirmarSeleccionTipoRepuesto(tipo) {
    if (tipo) {
        selectedTipoRepuesto.value = tipo
        try {
            const res = await axios.get('otmProgramada/get-repuestos', {
                params: { idTipoRepuesto: tipo.ID_TIPO_REPUESTO }
            })
            repuestosList.value = Array.isArray(res.data) ? res.data : [res.data]
        } catch (error) {
            console.error('Error al cargar repuestos:', error)
        }
    }
}

function confirmarSeleccionRepuesto(repuesto) {
    if (repuesto) {
        // Evitar duplicados por ID_REPUESTO
        const exists = addRepuestosList.value.some(r => r.ID_REPUESTO === repuesto.ID_REPUESTO)
        if (!exists) {
            addRepuestosList.value.push({ 
                ...repuesto, 
                cantidad: 1,
                nombreTipoRepuesto: selectedTipoRepuesto.value.NOMBRE_TIPO_REPUESTO 
            })
        }
        isAddingRepuesto.value = false
        selectedTipoRepuesto.value = null
        repuestosList.value = []
    }
}

function aprobarOTM() {
    console.log('Aprobar OTM')
}

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

.data-item-referencia-layout th {
    width: 30%;
    background: transparent;
}

.data-tiempo-ejecucion {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
}

.data-observaciones {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    background: var(--color-background);
    border-radius: var(--space-sm);
    padding: var(--space-md);
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-card-title {
    font-size: 1.5rem !important;
    font-weight: 700;
    margin-bottom: 0 !important;
}

.obs-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.obs-box h2 {
    font-size: 1rem;
    border: none;
    margin: 0;
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

.buttons-container-cards {
    display: flex;
    justify-content: end;
    align-items: end;
    gap: var(--space-sm);
}

.usuario-item {
    display: flex;
    flex-direction: column;
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
    gap: var(--space-sm);
}

.usuario-name {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-text);
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

.pagination-info {
    font-weight: 700;
    color: var(--color-muted);
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

.alert-container-centered > * {
    pointer-events: auto;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
    .section-card {
        padding: var(--space-md);
    }
}
</style>
