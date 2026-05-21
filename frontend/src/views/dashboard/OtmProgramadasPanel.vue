<template>
  <div class="container">

    <section class="filters-block" aria-labelledby="filters-title">
      <div class="filters" role="group" aria-label="Filtrar OTMs programadas por vigencia de fecha">
        <div>
          <h3>Filtros por vigencia </h3>
          <button type="button" class="pill pill--todas" :class="{ 'pill--active': isTodasSelected }"
            :aria-pressed="isTodasSelected" @click="selectTodas">
            <span class="pill__dot" aria-hidden="true" />
            Todas las OTMs
          </button>

        </div>
        <div>

          <button v-for="opt in filterOptions" :key="opt.key" type="button" class="pill" :class="[
            `pill--${opt.key}`,
            { 'pill--active': filters[opt.key] }
          ]" :aria-pressed="filters[opt.key]" :aria-label="filterAriaLabel(opt)" @click="toggleCategory(opt.key)">
            <span class="pill__dot" aria-hidden="true" />
            {{ opt.label }}
            <span v-if="filters[opt.key]" class="pill__badge">Visibles</span>
            <span v-else class="pill__badge pill__badge--off">Ocultas</span>
          </button>
        </div>

      </div>
    </section>

    <UiCard v-for="item in filteredData" :key="item.ID_OTM" :nameText="item.CLASE_ACTIVIDAD" :content="{
      idTask: item.ID_OTM,
      nameTask: item.NOMBRE_ACTIVIDAD,
      dateProgrammed: item.FECHA_PROGRAMADA,
      dateLimit: item.LIMITE_CIERRE
    }" @select="(color) => handleClick(item, color)" />

    <p v-if="!filteredData.length && data.length" class="empty-hint">
      Ninguna OTM programada coincide con los filtros seleccionados.
    </p>
    <p v-if="!data.length" class="empty-hint">
      No hay OTMs programadas para mostrar.
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../../api/axios.js'
import { getSessionUser } from '../../utils/authSession.js'
import { setSelectedOtm } from '../../utils/dataTransfer.js'

const router = useRouter()

/** Alineado con RutasPanel / UiCard: rojo=vencida, amarillo=hoy, verde=próxima (según fecha programada) */
const DATE_CATEGORY = {
  past: 'past',
  today: 'today',
  future: 'future'
}

const filterOptions = [
  { key: DATE_CATEGORY.today, label: 'Para hoy' },
  { key: DATE_CATEGORY.future, label: 'Próximas' },
  { key: DATE_CATEGORY.past, label: 'Vencidas' }
]

function routeDateCategory(fecha) {
  if (fecha == null || fecha === '') return DATE_CATEGORY.past
  const today = new Date()
  const programmed = new Date(fecha)
  if (Number.isNaN(programmed.getTime())) return DATE_CATEGORY.past
  if (programmed.toDateString() === today.toDateString()) return DATE_CATEGORY.today
  if (programmed < today) return DATE_CATEGORY.past
  return DATE_CATEGORY.future
}

const data = ref([])

const filters = reactive({
  [DATE_CATEGORY.past]: true,
  [DATE_CATEGORY.today]: true,
  [DATE_CATEGORY.future]: true
})

const isTodasSelected = computed(
  () => filters[DATE_CATEGORY.past] && filters[DATE_CATEGORY.today] && filters[DATE_CATEGORY.future]
)

function selectTodas() {
  filters[DATE_CATEGORY.past] = true
  filters[DATE_CATEGORY.today] = true
  filters[DATE_CATEGORY.future] = true
}

function toggleCategory(key) {
  filters[key] = !filters[key]
  if (!filters[DATE_CATEGORY.past] && !filters[DATE_CATEGORY.today] && !filters[DATE_CATEGORY.future]) {
    selectTodas()
  }
}

function filterAriaLabel(opt) {
  const on = filters[opt.key]
  return on ? `${opt.label}: visibles en el listado` : `${opt.label}: ocultas (no se muestran)`
}

const filteredData = computed(() =>
  data.value.filter((item) => filters[routeDateCategory(item.FECHA_PROGRAMADA)])
)

function handleClick(item, color) {
  setSelectedOtm({ ...item, COLOR_CARD: color })
  // Usamos setTimeout para sacar la navegación del ciclo de actualización actual de Vue
  // Esto evita el error "Cannot set properties of null (setting '__vnode')"
  setTimeout(() => {
    router.push({
      name: 'otm-programada-register',
      params: { id: item.ID_OTM }
    })
  }, 0)
}

onMounted(async () => {
  const user = getSessionUser()
  const codigoPersona = user?.codigoPersona
  if (codigoPersona == null || codigoPersona.trim() === '') {
    console.warn('otmProgramada: no hay codigoPersona en sesión')
    data.value = []
    return
  }
  try {
    const response = await axios.get('otmProgramada/list-otm-programadas', {
      params: { codigoPersona: String(codigoPersona).trim() }
    })
    const list = Array.isArray(response.data) ? response.data : []
    data.value = list
  } catch (e) {
    console.error('otmProgramada', e)
    data.value = []
  }
})
</script>

<style scoped>
.container {
  padding: var(--space-md);
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.filters-block {
  margin-bottom: var(--space-lg);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-sm);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.filters div {
  display: flex;
  flex-direction: row;
  gap: var(--space-sm);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 100px;
  border: 2px solid transparent;
  background: #ffffff;
  color: var(--color-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.pill:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pill:active {
  transform: scale(0.96);
}

.pill__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pill--past .pill__dot { background: #ef4444; }
.pill--today .pill__dot { background: #f59e0b; }
.pill--future .pill__dot { background: #10b981; }
.pill--todas .pill__dot { background: var(--color-primary); }

.pill--active {
  background: var(--color-background);
  border-color: currentColor;
}

.pill--todas.pill--active {
  background: var(--color-primary);
  color: #ffffff;
}

.pill--todas.pill--active .pill__dot {
  background: #ffffff;
}

.pill--past.pill--active {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fca5a5;
}

.pill--today.pill--active {
  background: #fffbeb;
  color: #92400e;
  border-color: #fcd34d;
}

.pill--future.pill--active {
  background: #ecfdf5;
  color: #065f46;
  border-color: #6ee7b7;
}

.pill:not(.pill--active) {
  opacity: 0.7;
  background: #f8fafc;
}

.pill__badge {
  margin-left: 4px;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.05);
  color: inherit;
}

.empty-hint {
  text-align: center;
  color: var(--color-muted);
  margin: var(--space-xl) 0;
  font-size: 1.1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .container {
    padding: var(--space-sm);
  }
  .filters {
    padding: var(--space-sm);
    border-radius: var(--radius);
  }
  .pill {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>
