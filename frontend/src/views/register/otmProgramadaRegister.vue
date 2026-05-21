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

            <section class="section-card data-tiempo-ejecucion">
                <h2 style="margin:0; border:none; padding:0;">Tiempo de ejecución</h2>
                <div class="flex items-center gap-3">    
                    <UiInput type="number" v-model="tiempoEjecucion" min="0" max="24" size="sm" minWidth="120px" />
                    <span class="font-bold">Horas</span>
                </div>
            </section>

            <section class="data-observaciones">
                <div class="section-card obs-box">
                    <h2>Observaciones al crear</h2>
                    <textarea v-model="currentDatosOtm.OBSERVACION_OTM" readonly />
                </div>

                <div class="section-card obs-box">
                    <h2>Observaciones al ejecutar</h2>
                    <textarea placeholder="Escribe aquí tus observaciones..." />
                </div>
            </section>

            <section class="section-card data-usuarios">
                <h2>Usuarios asignados</h2>
                <p class="text-muted">No hay usuarios adicionales asignados.</p>
            </section>


        </div>

        
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import axios from '../../api/axios.js'
import UiButton from '../../components/UiButton.vue'
import { formatDate } from '../../utils/formatDate.js'

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const otmData = ref(null)
const itemsList = ref([])
const currentIndex = ref(0)
const tiempoEjecucion = ref(0)

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
    console.log('Cumplir')
}

onMounted(async () => {
    const data = getSelectedOtm()
    // Verificamos que los datos correspondan al ID de la URL
    if (data && (String(data.ID_OTM) === String(props.id) || String(data.ID_MAQUINA) === String(props.id))) {
        otmData.value = data
        try {
            const response = await axios.get('otmProgramada/get-datos-otm-programada', {
                params: { idOtmProgramada: String(props.id) }
            })
            itemsList.value = Array.isArray(response.data) ? response.data : [response.data]
            currentIndex.value = 0
        } catch (error) {
            console.error('Error al cargar datos de la OTM:', error)
        }
    } else {
        console.warn('Los datos en sesión no coinciden con el ID de la URL o no existen')
    }
    console.log('Datos recibidos en Registro Programado:', otmData.value)
    console.log('Lista de items recibidos:', itemsList.value)
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
    border: 2px solid var(--color-surface);
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

@media (max-width: 768px) {
    .section-card {
        padding: var(--space-md);
    }
}
</style>
