<template>
    <div class="register-container">
        <div v-if="otmData && currentDatosOtm" class="data-container">

            <section class="data-otm">
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


            <section class="data-item-referencia-layout">
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

            <section class="data-tiempo-ejecucion items-center">
                <h2 class="text-sm font-semibold">Tiempo de ejecución</h2>
                <div class="flex justify-between items-center gap-2">    
                    <input type="number" class="text-sm font-semibold border-gray-300 p-1" v-model="tiempoEjecucion" min="0" max="24" />
                    <h2 class="text-sm font-semibold">Horas</h2>
                </div>
            </section>

            <nav class="tabs-navigation">
                <UiNavButton
                    label="Observaciones"
                    icon="Eye"
                    :active="currentTab === 'obs'"
                    @click="currentTab = 'obs'"
                />
                <UiNavButton
                    label="Usuarios"
                    icon="User"
                    :active="currentTab === 'users'"
                    @click="currentTab = 'users'"
                />
            </nav>

            <section class="data-observaciones" v-if="currentTab === 'obs'">
                <div>
                    <h2 class="text-md text-center font-semibold">Observaciones al crear la OTM</h2>
                    <textarea v-model="currentDatosOtm.OBSERVACION_OTM" />
                </div>

                <div>
                    <h2 class="text-md text-center font-semibold">Observaciones al ejecutar la OTM</h2>
                    <textarea />
                </div>
            </section>

            <section class="data-usuarios" v-if="currentTab === 'users'">
                <h2 class="text-sm font-semibold">Usuarios</h2>
            </section>


        </div>

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
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { getSelectedOtm, clearSelectedOtm } from '../../utils/dataTransfer.js'
import axios from '../../api/axios.js'
import UiButton from '../../components/UiButton.vue'
import UiNavButton from '../../components/UiNavButton.vue'
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
const currentTab = ref('obs')

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
.data-container{
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.data-preview {
    background: #f4f4f4;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}

.buttons-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}

.buttons-container div {
    display: flex;
    align-items: center;
    gap: 10px;
}

.pagination-info {
    font-weight: bold;
    margin-right: 10px;
}

.data-otm {
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border-radius: 5px;
}

.data-otm h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    text-align: center;
}

.data-otm table {
    width: 100%;
    border-collapse: collapse;
}

.data-otm table th {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
    border: 1px solid #e0e0e0;
    padding: 0px 5px;
}

.data-otm table td {
    font-size: 0.8rem;
    font-weight: 400;
    margin: 0;
    text-align: center;
    border: 1px solid #e0e0e0;
    padding: 0px 5px;
}


.data-item-referencia-layout {
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border-radius: 5px;
}

.data-item-referencia-layout h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    text-align: center;
}

.data-item-referencia-layout table {
    width: 100%;
    border-collapse: collapse;
}

.data-item-referencia-layout table th {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    text-align: left;
    border: 1px solid #e0e0e0;
    padding: 0px 5px;
}

.data-item-referencia-layout table td {
    font-size: 0.8rem;
    font-weight: 400;
    margin: 0;
    text-align: left;
    border: 1px solid #e0e0e0;
    padding: 0px 5px;
}

.data-tiempo-ejecucion{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border-radius: 5px;
}

.data-tiempo-ejecucion input{
    width: 100px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 5px;
}

.tabs-navigation {
    display: flex;
    gap: 5px;
    border-bottom: 1px solid #e2e8f0;
    margin-top: 10px;
}

.data-observaciones{
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 10px;
    padding: 10px;
    border-radius: 5px;
}

.data-observaciones div{
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    padding: 10px;
}

.data-observaciones textarea{
    width: 100%;
    height: 200px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 5px;
}
</style>
