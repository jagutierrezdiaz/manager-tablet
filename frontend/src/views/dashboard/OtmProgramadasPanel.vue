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

    <UiCard v-for="item in paginatedItems" :key="item.ID_OTM" :nameText="item.CLASE_ACTIVIDAD" :content="{
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

    <div v-if="filteredData.length > PAGE_SIZE" class="pagination">
      <button type="button" class="pagination__btn" :disabled="currentPage <= 1" @click="goPrev">
        Anterior
      </button>
      <button type="button" class="pagination__btn" :disabled="currentPage >= totalPages" @click="goNext">
        Siguiente
      </button>
    </div>
    <span class="pagination__info">
      Página {{ currentPage }} de {{ totalPages }}
    </span>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
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

const PAGE_SIZE = 7

const data = ref([])
const currentPage = ref(1)

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

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / PAGE_SIZE))
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredData.value.slice(start, start + PAGE_SIZE)
})

watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

function goPrev() {
  if (currentPage.value > 1) currentPage.value--
}

function goNext() {
  if (currentPage.value < totalPages.value) currentPage.value++
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
    currentPage.value = 1
  } catch (e) {
    console.error('otmProgramada', e)
    data.value = []
    currentPage.value = 1
  }
})
</script>

<style scoped>
.container {
  padding: 0 20px;
  width: 90%;
  margin: 0 auto;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000000;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;
}

.filters div{
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
}


.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease,
    color 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
}

.pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.pill:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.pill__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pill--past .pill__dot {
  background: #b91c1c;
}

.pill--today .pill__dot {
  background: #ca8a04;
}

.pill--future .pill__dot {
  background: #15803d;
}

.pill--todas .pill__dot {
  background: #193379;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.15);
}

.pill--todas:not(.pill--active) .pill__dot {
  opacity: 0.55;
  filter: saturate(0.9);
}

.pill--todas.pill--active .pill__dot {
  opacity: 1;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.5),
    0 0 0 1px rgba(25, 51, 121, 0.25);
}

.pill--todas.pill--active {
  background: #d3dbff;
  border-color: #193379;
  color: #193379;
}

.pill--past.pill--active {
  background: #fee2e2;
  border-color: #b91c1c;
  color: #7f1d1d;
}

.pill--today.pill--active {
  background: #fef9c3;
  border-color: #ca8a04;
  color: #713f12;
}

.pill--future.pill--active {
  background: #dcfce7;
  border-color: #15803d;
  color: #14532d;
}

/* Pastillas de categoría apagadas: se nota que están excluidas */
.pill--past:not(.pill--active),
.pill--today:not(.pill--active),
.pill--future:not(.pill--active) {
  opacity: 0.72;
  border-style: hidden;
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #94a3b8;
}

.pill--past:not(.pill--active) .pill__dot,
.pill--today:not(.pill--active) .pill__dot,
.pill--future:not(.pill--active) .pill__dot {
  opacity: 0.45;
}

.pill__badge {
  margin-left: 2px;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  background: rgba(255, 255, 255, 0.85);
  color: inherit;
}

.pill__badge--off {
  background: #e2e8f0;
  color: #64748b;
}

.pill--past:not(.pill--active) .pill__badge--off,
.pill--today:not(.pill--active) .pill__badge--off,
.pill--future:not(.pill--active) .pill__badge--off {
  background: #e2e8f0;
}

.empty-hint {
  text-align: center;
  color: #64748b;
  margin: 16px 0;
  font-size: 0.95rem;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding: 12px 0;
}

.pagination__btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.pagination__btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.pagination__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination__info {
  display: block;
  text-align: end;
  font-size: 0.95rem;
  color: #334155;
}
</style>
