<template>
  <div class="container glass-panel">
    <div class="accent-bar"></div>
    <h2>Listado de OTM programadas</h2>

    <section class="filters-block" aria-labelledby="filters-title">
      <div class="filters" role="group" aria-label="Filtrar OTMs programadas por vigencia de fecha">
        <div>
          <button type="button" class="pill pill--todas" :class="{ 'pill--active': isTodasSelected }"
            :aria-pressed="isTodasSelected" @click="selectTodas">
            <span class="pill__dot" aria-hidden="true" />
            Todas
          </button>
          <button v-for="opt in filterOptions" :key="opt.key" type="button" class="pill" :class="[
            `pill--${opt.key}`,
            { 'pill--active': isCategoryActive(opt.key) }
          ]" :aria-pressed="isCategoryActive(opt.key)" :aria-label="filterAriaLabel(opt)" @click="selectCategory(opt.key)">
            <span class="pill__dot" aria-hidden="true" />
            {{ opt.label }}
          </button>
        </div>
      </div>
    </section>

    <UiListFilters
      v-model:search="searchQuery"
      :show-select="false"
      search-label="Buscar OTM"
      search-placeholder="ID o nombre de actividad..."
    />

    <div class="contenedor-card">
      <UiCard v-for="item in filteredData" :key="item.ID_OTM" :nameText="item.CLASE_ACTIVIDAD" :content="{
        idTask: item.ID_OTM,
        nameTask: item.NOMBRE_ACTIVIDAD,
        dateProgrammed: item.FECHA_PROGRAMADA,
        dateLimit: item.LIMITE_CIERRE
      }" @select="(color) => handleClick(item, color)" />

      <p v-if="!filteredData.length && data.length && searchQuery.trim()" class="empty-hint">
        Ninguna OTM programada coincide con la búsqueda.
      </p>
      <p v-else-if="!filteredData.length && data.length" class="empty-hint">
        Ninguna OTM programada coincide con el filtro «{{ activeFilterLabel }}».
      </p>
      <p v-if="!data.length" class="empty-hint">
        No hay OTMs programadas para mostrar.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../../api/axios.js'
import { getSessionUser } from '../../utils/authSession.js'
import { setSelectedOtm } from '../../utils/dataTransfer.js'
import UiListFilters from '../../components/UiListFilters.vue'

const router = useRouter()
const searchQuery = ref('')

const SEARCH_FIELDS = ['ID_OTM', 'NOMBRE_ACTIVIDAD']

const FILTER_ALL = 'all'

/** Alineado con UiCard: rojo=vencida, amarillo=hoy, verde=próxima */
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

function parseLocalDate(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  const str = String(value)
  const onlyDate = str.split('T')[0].trim().split(' ')[0]
  const parts = onlyDate.split('-')
  if (parts.length !== 3) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }
  const [year, month, day] = parts
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function routeDateCategory(fecha_programada, fecha_limite) {
  const programmed = parseLocalDate(fecha_programada)
  if (!programmed) return DATE_CATEGORY.past

  const today = parseLocalDate(new Date())
  const limit = parseLocalDate(fecha_limite)

  if (limit) {
    // Para hoy: fecha actual entre programada y límite (inclusive)
    if (programmed.getTime() <= today.getTime() && today.getTime() <= limit.getTime()) {
      return DATE_CATEGORY.today
    }
    // Vencidas: fecha actual > límite
    if (today.getTime() > limit.getTime()) return DATE_CATEGORY.past
    // Próximas: fecha actual < programada
    if (today.getTime() < programmed.getTime()) return DATE_CATEGORY.future
    return DATE_CATEGORY.past
  }

  if (programmed.getTime() === today.getTime()) return DATE_CATEGORY.today
  if (today.getTime() > programmed.getTime()) return DATE_CATEGORY.past
  return DATE_CATEGORY.future
}

const data = ref([])
const activeDateFilter = ref(FILTER_ALL)

const isTodasSelected = computed(() => activeDateFilter.value === FILTER_ALL)

const activeFilterLabel = computed(() => {
  if (activeDateFilter.value === FILTER_ALL) return 'Todas'
  return filterOptions.find((opt) => opt.key === activeDateFilter.value)?.label ?? 'seleccionado'
})

function selectTodas() {
  activeDateFilter.value = FILTER_ALL
}

function selectCategory(key) {
  activeDateFilter.value = key
}

function isCategoryActive(key) {
  return activeDateFilter.value === FILTER_ALL || activeDateFilter.value === key
}

function filterAriaLabel(opt) {
  const on = isCategoryActive(opt.key)
  return on ? `${opt.label}: visible en el listado` : `${opt.label}: oculta en el listado`
}

const filteredData = computed(() => {
  const byDate = data.value.filter((item) => {
    const category = routeDateCategory(item.FECHA_PROGRAMADA, item.LIMITE_CIERRE)
    if (activeDateFilter.value === FILTER_ALL) return true
    return category === activeDateFilter.value
  })

  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return byDate

  return byDate.filter((item) =>
    SEARCH_FIELDS.some((field) =>
      String(item[field] || '').toLowerCase().includes(query)
    )
  )
})

async function loadOtmProgramadas() {
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
    console.log('otmProgramadas', data.value)
  } catch (e) {
    console.error('otmProgramada', e)
    data.value = []
  }
}

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

onMounted(loadOtmProgramadas)
onActivated(loadOtmProgramadas)
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
  margin-bottom: var(--space-sm);
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

.pill--past .pill__dot {
  background: #ef4444;
}

.pill--today .pill__dot {
  background: #f59e0b;
}

.pill--future .pill__dot {
  background: #10b981;
}

.pill--todas .pill__dot {
  background: var(--color-primary);
}

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


.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  /* Cristal templado premium Fiori Light */
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.40);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: visible;
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

.contenedor-card {
  max-height: calc(100% - 270px);
  overflow-y: auto;
}


@media (max-width: 768px) {
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
