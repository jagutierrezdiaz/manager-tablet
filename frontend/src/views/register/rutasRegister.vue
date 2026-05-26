<template>
    <div class="register-container">
        <div class="buttons-container">
            <UiButton label="Regresar" color="info" icon="ArrowLeft" @click="$router.back()" />
            <div class="buttons-container-cards">
                <UiButton label="Cumplir" color="create" icon="Check" @click="cumplirRuta" />
            </div>
        </div>

        <div v-if="rutas" class="data-container">
            <UiTitleView :titleOTM="rutas.ID_NUMERICO" :titleActivity="rutas.NOMBRE_TIPO_RUTA"
                :colorCard="rutas.COLOR_CARD" />
        </div>

        <section class="section-card data-otm">
            <h2>Referencias de la Ruta</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Proceso</th>
                        <td>{{ rutas.NOMBRE_PROCESO }}</td>
                    </tr>
                    <tr>
                        <th>Etapa</th>
                        <td>{{ rutas.NOMBRE_ETAPA }}</td>
                    </tr>
                    <tr>
                        <th>Máquina</th>
                        <td>{{ rutas.NOMBRE_MAQUINA }}</td>
                    </tr>
                    <tr>
                        <th>Equipo</th>
                        <td>{{ rutas.NOMBRE_EQUIPO }}</td>
                    </tr>
                </tbody>
            </table>
        </section>


        <section class="section-card data-tiempo-ejecucion">
            <h2 style="margin:0; border:none; padding:0;">Tiempo Real de Ejecución Ruta</h2>
            <div class="flex items-center gap-3">
                <UiInput type="number" v-model="tiempoEjecucion" min="0" max="24" size="sm" minWidth="120px" />
                <span class="font-bold">Horas</span>
            </div>
        </section>


        <section class="section-card data-tarea">
            <h2 class="section-card-title">Tareas a realizar</h2>

            <textarea placeholder="Escribe aquí tus tareas..." />
        </section>


        <section class="section-card data-observaciones">
            <h2 class="section-card-title">Observaciones</h2>

            <textarea placeholder="Escribe aquí tus observaciones..." />
        </section>


        <section class="section-card">
            <h2 class="section-card-title">Resultados de la inspección</h2>
            <div class="flex flex-col gap-4">
                <h3>¿Cumple con los criterios de aceptación?</h3>
                <div class="flex gap-6">
                    <UiRadio label="Si cumple" v-model="cumpleCriterios" value="si" color="create" name="criterios" />
                    <UiRadio label="No cumple" v-model="cumpleCriterios" value="no" color="delete" name="criterios" />
                </div>
                <div class="flex justify-end mt-2">
                    <UiButton label="Guardar resultados" color="create" icon="Check" iconPosition="end"
                        :disabled="!cumpleCriterios" @click="guardarResultados()" />
                </div>
            </div>
        </section>

    </div>

    <!-- Modal de Confirmación -->
    <UiModal v-if="rutas && rutas.ID_NUMERICO" v-model="showConfirmModal" title="Finalizar Registro de Ruta"
        :message="`¿Estás seguro de que deseas marcar la ruta ${rutas.NOMBRE_TIPO_RUTA} (ID: ${rutas.ID_NUMERICO}) como cumplida? Se guardarán todos los resultados de la inspección.`"
        confirmLabel="Sí, finalizar" confirmIcon="Check" @confirm="handleConfirmCumplir" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UiButton from '../../components/UiButton.vue'
import UiInput from '../../components/UiInput.vue'
import UiRadio from '../../components/UiRadio.vue'
import UiSearchSelector from '../../components/UiSearchSelector.vue'
import UiTitleView from '../../components/UiTitleView.vue'
import UiModal from '../../components/UiModal.vue'
import { getSelectedRuta, clearSelectedRuta } from '../../utils/dataTransfer.js'

const router = useRouter()

const rutas = ref({
    ID_NUMERICO: '',
    NOMBRE_TIPO_RUTA: '',
    COLOR_CARD: '#000000'
})

const tiempoEjecucion = ref(0)
const cumpleCriterios = ref('')
const showConfirmModal = ref(false)

function cumplirRuta() {
    showConfirmModal.value = true
}

function handleConfirmCumplir() {
    console.log('Ruta Cumplida confirmada')
    // Lógica de cumplimiento aquí
    clearSelectedRuta()
    router.push({ name: 'principal-rutas' })
}

function guardarResultados() {
    console.log('Resultados guardados:', cumpleCriterios.value)
}

onMounted(() => {
    const data = getSelectedRuta()
    if (data) {
        rutas.value = data
    }
})
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
</style>