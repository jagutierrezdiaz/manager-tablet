<template>
    <div class="register-container glass-panel">
        <div class="accent-bar"></div>
        <h2>Ejecución OTMs Programadas</h2>
        <div class="buttons-container">
            <UiButton label="Regresar" color="read" icon="arrow-left" @click="$router.back()" />
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
                <UiAlert :type="alertConfig.type" :title="alertConfig.title" :message="alertConfig.message"
                    @close="alertConfig.show = false" />
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
                                <div class="w-full">
                                    <label>Tiempo total</label>
                                    <div class="tiempo-total-row">
                                        <UiInput class="tiempo-total-input" type="text" v-model="user.horaTotal"
                                            size="sm" minWidth="0" placeholder="0,00" :readOnly="true" />
                                        <span class="tiempo-total-unidad">Horas</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4">
                                <UiSignature v-model="user.firma" label="Firma Persona de Mantenimiento" :height="150"
                                    @clear="solicitarConfirmacionEliminacion('firma-operario', user)" />
                            </div>

                            <div class="buttons-container-cards">
                                <UiButton color="create" label="Tiempo y Firma" icon="save"
                                    @click="guardarUsuario(user.codigoPersona)" />
                                <UiButton color="delete" label="Persona" icon="trash"
                                    @click="solicitarConfirmacionEliminacion('operario', user)" />
                            </div>
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
                            <UiSearchSelector v-if="!selectedTipoRepuesto" :items="tipoRepuestosList"
                                :searchFields="['NOMBRE_TIPO_REPUESTO']" itemKey="ID_TIPO_REPUESTO"
                                label="1. Buscar tipo de repuesto" placeholder="Ej: Rodamientos, Motores..."
                                selectLabel="Seleccionar tipo" confirmLabel="Siguiente"
                                :displayFormat="(r) => r.NOMBRE_TIPO_REPUESTO"
                                @select="confirmarSeleccionTipoRepuesto" />

                            <!-- Paso 2: Seleccionar Repuesto Específico -->
                            <div v-else class="flex flex-col gap-2">
                                <div
                                    class="flex justify-between items-center bg-primary/5 p-2 rounded border border-primary/10">
                                    <span class="text-sm font-bold">Tipo: {{ selectedTipoRepuesto.NOMBRE_TIPO_REPUESTO
                                    }}</span>
                                    <UiButton label="Cambiar tipo" size="sm" color="info"
                                        @click="selectedTipoRepuesto = null" />
                                </div>
                                <UiSearchSelector :items="repuestosList" :searchFields="['NOMBRE_REPUESTO']"
                                    itemKey="ID_REPUESTO" label="2. Buscar repuesto específico"
                                    placeholder="Nombre del repuesto..." selectLabel="Seleccionar repuesto"
                                    confirmLabel="Agregar repuesto"
                                    :displayFormat="(r) => `${r.NOMBRE_REPUESTO} (Stock: ${r.INV_ACTUAL})`"
                                    @select="confirmarSeleccionRepuesto" />
                            </div>
                        </div>
                    </Transition>

                    <!-- Lista de Repuestos Agregados -->
                    <div class="repuestos-agregados mt-4">
                        <div v-for="rep in addRepuestosList" :key="rep.ID_REPUESTO" class="repuesto-item-card">
                            <div class="repuesto-item-row">
                                <div class="repuesto-item-info">
                                    <p class="font-bold">{{ rep.NOMBRE_REPUESTO }}</p>
                                    <p class="text-xs text-muted">Unidad de medida: {{ rep.UNIDAD_MEDIDA }}</p>
                                </div>
                                <div class="repuesto-item-controls">
                                    <div class="repuesto-qty">
                                        <label class="text-xs font-bold">Cant:</label>
                                        <input type="number" v-model="rep.UND_REAL"
                                            class="w-16 p-1 border rounded text-center" min="1" />
                                    </div>
                                    <div class="repuesto-actions">
                                        <UiButton color="create" icon="save" size="sm" @click="guardarRepuesto(rep)" />
                                        <UiButton color="delete" icon="trash" size="sm"
                                            @click="solicitarConfirmacionEliminacion('repuesto', rep)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-if="addRepuestosList.length === 0" class="text-center text-muted py-4">No hay repuestos
                            agregados.</p>
                    </div>
                </div>
            </section>

            <section class="section-card">
                <h2 class="section-card-title">Fotos</h2>
                <div class="grid  gap-6 mt-4">
                    <UiImageUpload label="Foto 1" v-model="foto1" placeholder="Capturar o seleccionar foto 1"
                        @save="(img) => guardarFotoOtm(1, img)"
                        @remove="solicitarConfirmacionEliminacion('fotos', 1)" />
                    <UiImageUpload label="Foto 2" v-model="foto2" placeholder="Capturar o seleccionar foto 2"
                        @save="(img) => guardarFotoOtm(2, img)"
                        @remove="solicitarConfirmacionEliminacion('fotos', 2)" />
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
                    <textarea v-model="observacionesEjecucion" placeholder="Escribe aquí tus observaciones..." />
                    <div class="buttons-container-cards">
                        <UiButton color="create" label="Guardar" icon="save"
                            @click="guardarObservacionesEjecucion()" />
                    </div>
                </div>
            </section>

            <section class="section-card data-tiempo-ejecucion">
                <h2 style="margin:0; border:none; padding:0;">Tiempo de ejecución</h2>
                <div class="flex items-center gap-3">
                    <UiInput type="text" :modelValue="tiempoEjecucion" placeholder="0,00" size="sm"
                        minWidth="120px" @update:modelValue="onTiempoEjecucionInput" />
                    <span class="font-bold">Horas</span>
                </div>
            </section>


            <section class="section-card">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="section-card-title">Aprobación OTM</h2>

                    <UiButton :label="isAddingSupervisor ? 'Cancelar' : 'Agregar Supervisor'"
                        :color="isAddingSupervisor ? 'delete' : 'create'" :icon="isAddingSupervisor ? 'x' : 'plus'"
                        iconPosition="end" @click="agregarSupervisor()" />
                </div>

                <Transition name="fade-slide">
                    <div v-if="isAddingSupervisor" class="mb-6">
                        <UiSearchSelector :items="supervisorList" :searchFields="['nombrePersona', 'codigoPersona']"
                            itemKey="codigoPersona" label="Buscar supervisor" placeholder="Ej: Juan Perez o 12345"
                            selectLabel="Seleccionar supervisor" confirmLabel="Confirmar"
                            :displayFormat="(s) => `Id: ${s.codigoPersona}  ${s.nombrePersona}`"
                            @select="confirmarSeleccionSupervisor" />
                    </div>
                </Transition>

                <div class="supervisor-asignado mt-4">
                    <div v-for="sup in addSupervisorList" :key="sup.codigoPersona" class="usuario-item">
                        <div class="usuario-info">
                            <span class="text-muted text-xs">Supervisor</span>
                            <span class="usuario-name text-sm">{{ sup.nombrePersona }}</span>

                            <div class="mt-4">
                                <UiSignature v-model="sup.firma" label="Firma del supervisor" :height="150"
                                    @clear="solicitarConfirmacionEliminacion('firma-supervisor', sup)" />
                            </div>
                        </div>

                        <div class="btn-aprobar">
                            <UiButton label="Supervisor" color="delete" icon="trash"
                                @click="solicitarConfirmacionEliminacion('supervisor', sup)" />
                            <UiButton label="Aprobar" color="create" icon="check" iconPosition="end"
                                @click="aprobarOTM(sup)" />
                        </div>
                    </div>
                    <p v-if="addSupervisorList.length === 0" class="text-muted text-center py-4">
                        No se ha seleccionado un supervisor para la aprobación.
                    </p>
                </div>


            </section>
        </div>

        <!-- Modal de Confirmación -->
        <UiModal v-if="otmData && currentDatosOtm" v-model="showConfirmModal" title="Finalizar Orden de Trabajo"
            :message="`¿Estás seguro de que deseas marcar la OTM #${otmData.ID_OTM} (${currentDatosOtm.NOMBRE_ACTIVIDAD}) como cumplida? Esta acción no se puede deshacer.`"
            confirmLabel="Sí, finalizar" confirmIcon="Check" @confirm="handleConfirmCumplir" />

        <!-- Modal OTM Anterior -->
        <UiModal v-if="otmAnteriorDetalle" v-model="showAnteriorModal" title="OTM Anterior Pendiente"
            :message="`La OTM anterior #${otmAnteriorDetalle.ID_OTM} (${otmAnteriorDetalle.NOMBRE_ACTIVIDAD}) programada para el ${formatDate(otmAnteriorDetalle.FECHA_PROGRAMADA)} no ha sido cumplida. ¿Deseas realizar esta OTM ahora?`"
            confirmLabel="Sí, realizar ahora" confirmIcon="ArrowRight" @confirm="handleIrAAnterior" />

        <UiModal v-model="showDeleteConfirmModal" :title="deleteConfirmConfig.title"
            :message="deleteConfirmConfig.message" confirmLabel="Sí, eliminar" confirmColor="delete" confirmIcon="trash"
            @confirm="ejecutarEliminacionConfirmada" />
    </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { getSelectedOtm, clearSelectedOtm, setSelectedOtm } from '../../utils/dataTransfer.js'
import { resolveUploadUrl } from '../../utils/uploadUrl.js'
import axios from '../../api/axios.js'
import UiButton from '../../components/UiButton.vue'
import UiInput from '../../components/UiInput.vue'
import UiSearchSelector from '../../components/UiSearchSelector.vue'
import UiImageUpload from '../../components/UiImageUpload.vue'
import UiSignature from '../../components/UiSignature.vue'
import UiModal from '../../components/UiModal.vue'
import UiAlert from '../../components/UiAlert.vue'
import { formatDate, formatForDateTimeInput, formatDecimalHours, parseDecimalHours } from '../../utils/formatDate.js'
import { getSessionUser } from '../../utils/authSession.js'

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
const tiempoEjecucion = ref('0,00')
const addUsersList = ref([])
const addSupervisorList = ref([])
const isAddingUser = ref(false)
const isAddingSupervisor = ref(false)
const isAddingRepuesto = ref(false)
const selectedTipoRepuesto = ref(null)
const addRepuestosList = ref([])
const foto1 = ref(null)
const foto2 = ref(null)
const observacionesEjecucion = ref('')
const showConfirmModal = ref(false)
const showAnteriorModal = ref(false)
const showDeleteConfirmModal = ref(false)
const deleteConfirmConfig = ref({
    title: 'Confirmar eliminación',
    message: '¿Está seguro de que desea eliminar este registro?',
    onConfirm: null
})
const otmAnteriorDetalle = ref(null)

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

function solicitarConfirmacionEliminacion(tipo, item) {
    const configs = {
        operario: {
            title: 'Eliminar operario',
            message: `¿Está seguro de eliminar a ${item.nombrePersona} de la OTM?`,
            onConfirm: () => eliminarUsuario(item.codigoPersona)
        },
        'firma-operario': {
            title: 'Eliminar firma del operario',
            message: `¿Está seguro de eliminar la firma de ${item.nombrePersona}?`,
            onConfirm: () => eliminarFirmaPersonal(item, 'operario')
        },
        repuesto: {
            title: 'Eliminar repuesto',
            message: `¿Está seguro de eliminar el repuesto "${item.NOMBRE_REPUESTO}"?`,
            onConfirm: () => eliminarRepuesto(item.ID_REPUESTO)
        },
        supervisor: {
            title: 'Eliminar supervisor',
            message: `¿Está seguro de quitar a ${item.nombrePersona} como supervisor?`,
            onConfirm: () => eliminarSupervisor(item.codigoPersona)
        },
        'firma-supervisor': {
            title: 'Eliminar firma del supervisor',
            message: `¿Está seguro de eliminar la firma de ${item.nombrePersona}?`,
            onConfirm: () => eliminarFirmaPersonal(item, 'supervisor')
        },
        fotos: {
            title: 'Eliminar foto',
            message: `¿Está seguro de eliminar la foto ${item}?`,
            onConfirm: () => eliminarFotoOtm(item)
        }
    }

    const config = configs[tipo]
    if (!config) return

    deleteConfirmConfig.value = config
    showDeleteConfirmModal.value = true
}

async function ejecutarEliminacionConfirmada() {
    const onConfirm = deleteConfirmConfig.value.onConfirm
    if (typeof onConfirm === 'function') {
        await onConfirm()
    }
    deleteConfirmConfig.value.onConfirm = null
}

// Calcular tiempo total automáticamente para cada usuario
watch(() => addUsersList.value, (newList) => {
    newList.forEach(user => {
        if (user.horaInicio && user.horaFin) {
            const start = new Date(user.horaInicio)
            const end = new Date(user.horaFin)

            const diffMs = end - start
            if (diffMs > 0) {
                user.horaTotal = formatDecimalHours(diffMs / (1000 * 60 * 60))
            } else {
                user.horaTotal = '0,00'
            }
        } else {
            user.horaTotal = '0,00'
        }
    })
}, { deep: true })

const currentDatosOtm = computed(() => {
    console.log('currentDatosOtm', itemsList.value[currentIndex.value])
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
    const check = validarRequisitosCumplir()
    if (!check.ok) {
        showAlert('warning', check.title, check.message)
        return
    }
    showConfirmModal.value = true
}

function hasFirma(firma) {
    return typeof firma === 'string' && firma.trim().length > 0
}

function logRutasImagenesOtm(contexto, { idOtm, otm, personasAsignadas, supervisores }) {
    const fotos = {
        FOTO_1: {
            bd: otm?.FOTO_1 ?? null,
            url: otm?.FOTO_1 ? resolveUploadUrl(otm.FOTO_1) : null
        },
        FOTO_2: {
            bd: otm?.FOTO_2 ?? null,
            url: otm?.FOTO_2 ? resolveUploadUrl(otm.FOTO_2) : null
        }
    }

    const firmasOperarios = (Array.isArray(personasAsignadas) ? personasAsignadas : []).map((p) => ({
        codigo: p.codigoPersona ?? p.CODIGO_PERSONA,
        nombre: p.nombrePersona ?? p.NOMBRE_PERSONA,
        bd: p.firma ?? p.FIRMA ?? null,
        url: resolveUploadUrl(p.firma ?? p.FIRMA)
    }))

    const listaSupervisores = Array.isArray(supervisores)
        ? supervisores
        : supervisores
            ? [supervisores]
            : []

    const firmasSupervisores = listaSupervisores.map((s) => ({
        codigo: s.codigoPersona ?? s.CODIGO_PERSONA,
        nombre: s.nombrePersona ?? s.NOMBRE_PERSONA,
        bd: s.firma ?? s.FIRMA ?? null,
        url: resolveUploadUrl(s.firma ?? s.FIRMA)
    }))

    console.log(`[OTM uploads] Rutas ${contexto}`, {
        idOtm,
        fotos,
        firmasOperarios,
        firmasSupervisores
    })
}

function onTiempoEjecucionInput(valor) {
    const limpio = String(valor).replace(/[^\d,]/g, '')
    const partes = limpio.split(',')
    tiempoEjecucion.value = partes.length <= 2
        ? partes.join(',')
        : `${partes[0]},${partes.slice(1).join('')}`
}

function validarRequisitosCumplir() {
    const tiempoReal = parseDecimalHours(tiempoEjecucion.value)
    const tiempoMayorOperario = Math.max(
        0,
        ...addUsersList.value.map(user => parseDecimalHours(user.horaTotal))
    )

    if (!tiempoReal || tiempoReal <= 0 || tiempoReal > 24) {
        return {
            ok: false,
            title: 'Tiempo inválido',
            message: 'Debe ingresar un tiempo de ejecución válido entre 0,01 y 24,00 horas.'
        }
    }

    if (tiempoReal < tiempoMayorOperario) {
        return {
            ok: false,
            title: 'Tiempo inválido',
            message: 'Debe ingresar el tiempo de ejecución mayor o igual al tiempo de la persona que mas tiempo trabajo.'
        }
    }

    if (addUsersList.value.length === 0) {
        return {
            ok: false,
            title: 'Personal requerido',
            message: 'Debe asignar al menos una persona a la OTM.'
        }
    }

    const operariosSinFirma = addUsersList.value.filter(u => !hasFirma(u.firma))
    if (operariosSinFirma.length > 0) {
        const nombres = operariosSinFirma.map(u => u.nombrePersona).join(', ')
        return {
            ok: false,
            title: 'Firmas pendientes',
            message: `Todo el personal asignado debe firmar. Pendientes: ${nombres}.`
        }
    }

    if (addSupervisorList.value.length === 0) {
        return {
            ok: false,
            title: 'Supervisor requerido',
            message: 'Debe asignar al menos un supervisor antes de cumplir la OTM.'
        }
    }

    const supervisoresSinFirma = addSupervisorList.value.filter(s => !hasFirma(s.firma))
    if (supervisoresSinFirma.length > 0) {
        const nombres = supervisoresSinFirma.map(s => s.nombrePersona).join(', ')
        return {
            ok: false,
            title: 'Firmas de supervisión pendientes',
            message: `Todos los supervisores asignados deben firmar. Pendientes: ${nombres}.`
        }
    }

    /*if (!foto1.value) {
        return {
            ok: false,
            title: 'Foto 1 requerida',
            message: 'Debe capturar y guardar la foto 1 antes de cumplir la OTM.'
        }
    }

    if (!foto2.value) {
        return {
            ok: false,
            title: 'Foto 2 requerida',
            message: 'Debe capturar y guardar la foto 2 antes de cumplir la OTM.'
        }
    }*/

    if (!observacionesEjecucion.value || !observacionesEjecucion.value.trim()) {
        return {
            ok: false,
            title: 'Observaciones requeridas',
            message: 'Debe ingresar las observaciones de ejecución.'
        }
    }

    return { ok: true }
}

function validarPayloadCumplimiento(payload) {
    const campos = [
        { key: 'tiempoReal', label: 'Tiempo real de ejecución', numerico: true },
        { key: 'indiceCumplimiento', label: 'Índice de cumplimiento', numerico: true },
        { key: 'efectividadCumplimiento', label: 'Efectividad de cumplimiento', numerico: true },
        { key: 'comentariosCierre', label: 'Observaciones de cierre', numerico: false },
        { key: 'tiempoMod', label: 'Tiempo MOD (suma del personal)', numerico: true },
        { key: 'idOtm', label: 'ID de la OTM', numerico: false },
    ]

    const faltantes = campos
        .filter(({ key, numerico }) => {
            const valor = payload[key]
            if (valor === null || valor === undefined || valor === '') return true
            if (numerico && Number(valor) === 0) return true
            if (!numerico && typeof valor === 'string' && !valor.trim()) return true
            return false
        })
        .map(({ label }) => label)

    if (faltantes.length === 0) return { ok: true }

    return {
        ok: false,
        message: `Faltan campos requeridos: ${faltantes.join(', ')}`
    }
}

async function handleIrAAnterior() {
    if (!otmAnteriorDetalle.value) return

    const user = getSessionUser()
    const codigoPersona = user?.codigoPersona

    if (!codigoPersona) {
        showAlert('error', 'Error', 'No se pudo obtener el usuario en sesión')
        return
    }

    try {
        // 1. Asignar la OTM al usuario si no la tiene (el backend ya verifica si existe)
        await axios.post('otmProgramada/assign-otm-to-user', {
            idOtm: otmAnteriorDetalle.value.ID_OTM,
            codigoPersona: codigoPersona
        })

        // 2. Actualizar los datos en sesión para la nueva OTM
        const idAnterior = otmAnteriorDetalle.value.ID_OTM
        setSelectedOtm({
            ID_OTM: idAnterior,
            FECHA_PROGRAMADA: otmAnteriorDetalle.value.FECHA_PROGRAMADA,
            NOMBRE_ACTIVIDAD: otmAnteriorDetalle.value.NOMBRE_ACTIVIDAD
        })

        // 3. Redirigir a la vista de registro de esa OTM
        showAnteriorModal.value = false

        // Limpiar datos actuales para evitar conflictos al cargar la nueva
        otmData.value = null
        itemsList.value = []

        router.push({
            name: 'otm-programada-register',
            params: { id: idAnterior }
        })

        // Forzar recarga de datos
        setTimeout(() => {
            loadData()
        }, 100)

    } catch (error) {
        console.error('Error al asignar OTM anterior:', error)
        showAlert('error', 'Error', 'No se pudo asignar la OTM anterior: ' + (error.response?.data?.error || error.message))
    }
}

async function handleConfirmCumplir() {
    const check = validarRequisitosCumplir()
    if (!check.ok) {
        showAlert('warning', check.title, check.message)
        showConfirmModal.value = false
        return
    }

    if (!currentDatosOtm.value) {
        showAlert('error', 'Error', 'No se han cargado los datos de la OTM correctamente.')
        showConfirmModal.value = false
        return
    }

    try {
        const result = await axios.post('otmProgramada/validar-otm-anterior', {
            idNumerico: currentDatosOtm.value.ID_NUMERICO,
            idEquipo: currentDatosOtm.value.ID_EQUIPO,
            idActividad: currentDatosOtm.value.ID_ACTIVIDAD
        })

        if (result.data.idOtm) {
            otmAnteriorDetalle.value = result.data.detalle
            showAnteriorModal.value = true
            showConfirmModal.value = false
            return
        }
    } catch (error) {
        console.error('Error al validar OTM anterior:', error)
        showAlert('error', 'Error de validación', 'No se pudo verificar la OTM anterior: ' + (error.response?.data?.error || error.message))
        showConfirmModal.value = false
        return
    }

    // 2. Calcular tiempoMod (suma de horas de personal) en formato decimal
    let totalModHours = 0
    addUsersList.value.forEach(user => {
        totalModHours += parseDecimalHours(user.horaTotal)
    })

    // 3. Preparar datos de cierre usando la función datosCierreOTM
    const datos = datosCierreOTM({
        otm: otmData.value,
        tiempoEstimadoActividad: itemsList.value[0].TIEMPO_ESTIMADO_ACTIVIDAD,
        tiempoMod: totalModHours,
        tiempoReal: parseDecimalHours(tiempoEjecucion.value),
        comentariosCierre: observacionesEjecucion.value,
        idOtm: otmData.value.ID_OTM
    })

    console.log('datos_cierre_otm', datos)

    // 4. Llamar al backend para guardar el cumplimiento
    try {
        const payload = {
            tiempoReal: datos.tiempo_real,
            indiceCumplimiento: datos.indice_cumplimiento,
            efectividadCumplimiento: datos.efectividad_cumplimiento,
            comentariosCierre: datos.comentarios_de_cierre,
            tiempoMod: datos.tiempo_mod,
            idOtm: datos.id_otm
        }

        const checkPayload = validarPayloadCumplimiento(payload)
        if (!checkPayload.ok) {
            showAlert('warning', 'Datos incompletos', checkPayload.message)
            return
        }

        await axios.post('otmProgramada/save-cumplimiento-otm', payload)

        showAlert('success', 'OTM Finalizada', 'La orden de trabajo ha sido finalizada con éxito.')

        // Limpiar datos y redirigir
        setTimeout(() => {
            clearSelectedOtm()
            router.push({ name: 'principal-programadas' })
        }, 1500)
    } catch (error) {
        console.error('Error al finalizar OTM:', error)
        showAlert('error', 'Error', 'No se pudo finalizar la OTM: ' + (error.response?.data?.error || error.message))
    } finally {
        showConfirmModal.value = false
    }
}

async function loadData() {
    const idStr = String(props.id)
    const sessionData = getSelectedOtm()

    if (sessionData && (String(sessionData.ID_OTM) === idStr || String(sessionData.ID_MAQUINA) === idStr)) {
        otmData.value = sessionData
    } else {
        otmData.value = { ID_OTM: idStr }
    }

    itemsList.value = []
    addUsersList.value = []
    addRepuestosList.value = []
    addSupervisorList.value = []
    foto1.value = null
    foto2.value = null
    tiempoEjecucion.value = '0,00'
    currentIndex.value = 0

    try {
        const [otmRes, usersRes, tipoRepuestosRes, supervisoresRes, personasAsignadasRes, repuestosAsignadosRes, supervisorAsignadoRes] = await Promise.all([
            axios.get('otmProgramada/get-datos-otm-programada', { params: { idOtmProgramada: idStr } }),
            axios.get('users/not-suspended').catch(err => {
                console.error('Error al cargar datos de los usuarios:', err)
                return { data: [] }
            }),
            axios.get('otmProgramada/get-tipo-repuestos'),
            axios.get('users/get-supervisores'),
            axios.get('users/personas-asignadas', { params: { idOtm: idStr } }),
            axios.get('otmProgramada/get-repuestos-asignados-otm', { params: { idOtm: idStr } }),
            axios.get('users/supervisor-asignado', { params: { idOtm: idStr } }).catch(err => {
                console.error('Error al cargar supervisor asignado:', err)
                return { data: null }
            }),
        ])

        itemsList.value = Array.isArray(otmRes.data) ? otmRes.data : [otmRes.data]
        usersList.value = Array.isArray(usersRes.data) ? usersRes.data : [usersRes.data]
        tipoRepuestosList.value = Array.isArray(tipoRepuestosRes.data) ? tipoRepuestosRes.data : [tipoRepuestosRes.data]
        supervisorList.value = Array.isArray(supervisoresRes.data) ? supervisoresRes.data : [supervisoresRes.data]

        if (itemsList.value.length > 0) {
            const otm = itemsList.value[0]
            otmData.value = {
                ...otmData.value,
                ID_OTM: otm.ID_OTM ?? idStr,
                FECHA_PROGRAMADA: otm.FECHA_PROGRAMADA,
                TIPO_MANTENIMIENTO: otm.TIPO_MANTENIMIENTO
            }
        }

        if (Array.isArray(personasAsignadasRes.data)) {
            addUsersList.value = personasAsignadasRes.data.map(u => ({
                ...u,
                horaInicio: formatForDateTimeInput(u.horaInicio),
                horaFin: formatForDateTimeInput(u.horaFin),
                horaTotal: u.horaTotal != null ? formatDecimalHours(Number(u.horaTotal)) : '0,00',
                firma: resolveUploadUrl(u.firma)
            }))
        }

        if (Array.isArray(supervisorAsignadoRes.data)) {
            addSupervisorList.value = supervisorAsignadoRes.data.map(sup => ({
                ...sup,
                firma: resolveUploadUrl(sup.firma)
            }))
        } else if (supervisorAsignadoRes.data) {
            const sup = supervisorAsignadoRes.data
            addSupervisorList.value = [{
                ...sup,
                firma: resolveUploadUrl(sup.firma)
            }]
        }

        if (itemsList.value.length > 0) {
            const otm = itemsList.value[0]
            if (otm.FOTO_1) foto1.value = resolveUploadUrl(otm.FOTO_1)
            if (otm.FOTO_2) foto2.value = resolveUploadUrl(otm.FOTO_2)
            observacionesEjecucion.value = otm.COMENTARIOS_DE_CIERRE || ''
            tiempoEjecucion.value = formatDecimalHours(otm.TIEMPO_REAL || 0)
        }

        if (Array.isArray(repuestosAsignadosRes.data)) {
            addRepuestosList.value = repuestosAsignadosRes.data
        }

        logRutasImagenesOtm('al cargar', {
            idOtm: idStr,
            otm: itemsList.value[0],
            personasAsignadas: personasAsignadasRes.data,
            supervisores: supervisorAsignadoRes.data
        })
    } catch (error) {
        console.error('Error al cargar datos de la OTM:', error)
    }
}

watch(() => props.id, () => {
    loadData()
})

onMounted(() => {
    loadData()
})

onActivated(() => {
    loadData()
})

function agregarUsuario() {
    isAddingUser.value = !isAddingUser.value
}

function agregarSupervisor() {
    isAddingSupervisor.value = !isAddingSupervisor.value
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

async function eliminarFirmaPersonal(persona, tipo) {
    if (!persona) return

    if (!persona.firma) {
        return
    }

    try {
        await axios.delete('otmProgramada/delete-firma-personal-otm', {
            params: {
                idOtm: otmData.value.ID_OTM,
                codigoPersona: persona.codigoPersona
            }
        })

        persona.firma = null
        showAlert('success', 'Firma eliminada', `La firma del ${tipo} ha sido eliminada correctamente`)
    } catch (error) {
        console.error('Error al eliminar firma:', error)
        showAlert('error', 'Error', 'No se pudo eliminar la firma: ' + (error.response?.data?.error || error.message))
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


    const inicioMinutos = new Date(inicio).setSeconds(0, 0);
    const fechaProgMinutos = new Date(fechaProgramada).setSeconds(0, 0);
    if (inicioMinutos < fechaProgMinutos) {
        showAlert('error', 'Fecha inválida', `La fecha de inicio no puede ser menor a la fecha programada (${formatDate(otmData.value.FECHA_PROGRAMADA)})`)
        return
    }

    if (!user.firma) {
        showAlert('warning', 'Firma requerida', 'El operario debe firmar para guardar tiempo y firma')
        return
    }

    try {
        const payload = {
            codigoPersona: user.codigoPersona,
            nombrePersona: user.nombrePersona,
            horaInicio: user.horaInicio,
            horaFin: user.horaFin,
            horaTotal: parseDecimalHours(user.horaTotal),
            ano: inicio.getFullYear(),
            mes: inicio.getMonth() + 1,
            firma: user.firma
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

function confirmarSeleccionSupervisor(supervisor) {
    if (!supervisor) return

    const exists = addSupervisorList.value.some(s => s.codigoPersona === supervisor.codigoPersona)

    if (exists) {
        showAlert('info', 'Supervisor ya agregado', `${supervisor.nombrePersona} ya está en la lista de aprobación.`)
        isAddingSupervisor.value = false
        return
    }

    addSupervisorList.value.push({ ...supervisor })
    isAddingSupervisor.value = false

    showAlert('success', 'Supervisor seleccionado', `${supervisor.nombrePersona} ha sido asignado para la aprobación.`)
}

async function eliminarSupervisor(codigoPersona) {
    try {
        await axios.delete('otmProgramada/delete-supervisor-otm', {
            params: {
                idOtm: otmData.value.ID_OTM,
                codigoPersona
            }
        })
        addSupervisorList.value = addSupervisorList.value.filter(s => s.codigoPersona !== codigoPersona)
        showAlert('success', 'Eliminado', 'El supervisor ha sido eliminado correctamente')
    } catch (error) {
        console.error('Error al eliminar supervisor:', error)
        showAlert('error', 'Error', 'No se pudo eliminar el supervisor: ' + (error.response?.data?.error || error.message))
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

async function aprobarOTM(supervisor) {
    if (!supervisor) return

    if (!supervisor.firma) {
        showAlert('warning', 'Firma requerida', 'El supervisor debe firmar para aprobar la OTM')
        return
    }

    try {
        const payload = {
            codigoPersona: supervisor.codigoPersona,
            nombrePersona: supervisor.nombrePersona,
            firma: supervisor.firma
        }

        await axios.post(`otmProgramada/aprobar-otm/${otmData.value.ID_OTM}`, payload)
        showAlert('success', 'Supervisor aprobado', `${supervisor.nombrePersona} ha sido aprobado correctamente.`)
    } catch (error) {
        console.error('Error al aprobar OTM:', error)
        showAlert('error', 'Error de aprobación', 'No se pudo aprobar la OTM: ' + (error.response?.data?.error || error.message))
    }
}

async function guardarObservacionesEjecucion() {
    if (!observacionesEjecucion.value?.trim()) {
        showAlert('warning', 'Observaciones', 'Debe ingresar las observaciones de ejecución.')
        return
    }
    if (!currentDatosOtm.value?.ID_NUMERICO) {
        showAlert('error', 'Error', 'No se encontró el ID_NUMERICO de la OTM.')
        return
    }

    try {
        await axios.post('otmProgramada/save-comentarios-cierre', {
            comentariosCierre: observacionesEjecucion.value.trim(),
            idNumerico: currentDatosOtm.value.ID_NUMERICO
        })
        showAlert('success', 'Guardado', 'Las observaciones se guardaron correctamente.')
    } catch (error) {
        console.error('Error al guardar observaciones:', error)
        showAlert('error', 'Error de guardado',
            'No se pudieron guardar las observaciones: ' + (error.response?.data?.error || error.message))
    }
}

async function guardarFotoOtm(photoNumber, imageBase64) {
    try {
        const payload = {
            photoNumber,
            image: imageBase64
        }
        const res = await axios.post(`otmProgramada/save-otm-photo/${otmData.value.ID_OTM}`, payload)

        const urlResuelta = resolveUploadUrl(res.data.url)
        if (photoNumber === 1) {
            foto1.value = urlResuelta
        } else {
            foto2.value = urlResuelta
        }

        console.log(`[OTM uploads] Foto ${photoNumber} al guardar`, {
            idOtm: otmData.value.ID_OTM,
            bd: res.data.url,
            url: urlResuelta
        })

        showAlert('success', 'Foto guardada', `La foto ${photoNumber} ha sido guardada correctamente`)
    } catch (error) {
        console.error('Error al guardar foto:', error)
        showAlert('error', 'Error', 'No se pudo guardar la foto: ' + (error.response?.data?.error || error.message))
    }
}

async function eliminarFotoOtm(photoNumber) {
    try {
        await axios.delete(`otmProgramada/delete-otm-photo/${otmData.value.ID_OTM}`, {
            params: { photoNumber }
        })
        if (photoNumber === 1) foto1.value = null
        if (photoNumber === 2) foto2.value = null
        showAlert('success', 'Foto eliminada', `La foto ${photoNumber} ha sido eliminada correctamente`)
    } catch (error) {
        console.error('Error al eliminar foto:', error)
        showAlert('error', 'Error', 'No se pudo eliminar la foto: ' + (error.response?.data?.error || error.message))
    }
}



function datosCierreOTM({
    otm,
    tiempoEstimadoActividad,
    tiempoMod,
    tiempoReal,
    comentariosCierre,
    idOtm
}) {
    console.log('datosCierreOTM', {
        otm,
        tiempoEstimadoActividad,
        tiempoMod,
        tiempoReal,
        comentariosCierre,
        idOtm
    })

    const fechaProgramada = new Date(otm.FECHA_PROGRAMADA);
    fechaProgramada.setHours(0, 0, 0, 0);
    const limiteCierre = new Date(otm.LIMITE_CIERRE);
    limiteCierre.setHours(0, 0, 0, 0);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    // INDICE DE CUMPLIMIENTO
    let indiceCumplimiento = 0;
    const diasTranscurridos = fechaHoy.getDate() - fechaProgramada.getDate();
    const indiceProrrateado = (limiteCierre.getDate() - fechaProgramada.getDate()) / (fechaHoy.getDate() - fechaProgramada.getDate()) * 100;
    if (diasTranscurridos === 0) {
        indiceCumplimiento = 100;
    } else if (indiceProrrateado > 0) {
        indiceCumplimiento = 100;
    } else {
        indiceCumplimiento = Math.round((1 / diasTranscurridos) * 100);
    }


    // EFECTIVIDAD DE CUMPLIMIENTO
    let efectividadCumplimiento = 0;
    const tiempoProgramado = Number(tiempoEstimadoActividad || 0);
    if (tiempoReal > 0) {
        if (tiempoReal <= tiempoProgramado) {
            efectividadCumplimiento = 100;
        } else {
            efectividadCumplimiento = Math.round(
                (tiempoProgramado / tiempoReal) * 100
            );
        }
    }

    return {
        id_otm: idOtm,
        tiempo_real: tiempoReal,
        indice_cumplimiento: indiceCumplimiento,
        efectividad_cumplimiento: efectividadCumplimiento,
        comentarios_de_cierre: comentariosCierre,
        tiempo_mod: tiempoMod
    };
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
    max-height: calc(100% - 140px);
    overflow-y: auto;
    padding-bottom: var(--space-sm);
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

.repuesto-item-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    margin-bottom: var(--space-sm);
}

.repuesto-item-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
}

.repuesto-qty,
.repuesto-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
}

.repuesto-actions :deep(.ui-btn) {
    flex-shrink: 0;
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

.tiempo-total-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
}

.tiempo-total-input {
    flex: 1;
    min-width: 120px;
}

.tiempo-total-input :deep(.ui-input) {
    width: 100%;
}

.tiempo-total-unidad {
    font-weight: 700;
    flex-shrink: 0;
}


.supervisor-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.supervisor-item .usuario-info {
    gap: 4px;
}

.buttons-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
    margin-top: var(--space-sm);
    padding-bottom: var(--space-sm);
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

.alert-container-centered>* {
    pointer-events: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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
    height: calc(100vh - 235px);
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

.btn-aprobar {
    width: 100%;
    display: flex;
    gap: 20px;
    justify-content: end;
}

@media (max-width: 768px) {
    .container {
        padding: var(--space-sm);
    }

    .section-card {
        padding: var(--space-md);
    }
}
</style>
