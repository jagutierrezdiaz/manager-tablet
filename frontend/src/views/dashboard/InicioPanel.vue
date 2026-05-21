<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Pie, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'
import UiButton from '@/components/UiButton.vue'

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
)

const buildQuery = (params) => new URLSearchParams(params).toString()

const dataGrafic1 = ref([])
const dataGrafic2 = ref([])

onMounted(async () => {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = firstDay.toISOString().split('T')[0]
    const endDate = lastDay.toISOString().split('T')[0]

    // Try cache first
    const cacheKey1 = 'grafics-general-month'
    const cacheKey2 = 'grafics-execution-index'
    const cached1 = sessionStorage.getItem(cacheKey1)
    const cached2 = sessionStorage.getItem(cacheKey2)
    if (cached1) dataGrafic1.value = JSON.parse(cached1)
    if (cached2) dataGrafic2.value = JSON.parse(cached2)

    const requests = []
    if (!cached1) requests.push(fetch(`/api/grafics/general-month?${buildQuery({ startDate, endDate })}`))
    if (!cached2) requests.push(fetch(`/api/grafics/execution-index?${buildQuery({ ano: year })}`))
    if (requests.length) {
      const responses = await Promise.all(requests)
      let idx = 0
      if (!cached1) {
        const res1 = responses[idx++]
        if (!res1.ok) { console.error('Error general-month', res1.statusText); return }
        const d1 = await res1.json()
        dataGrafic1.value = d1
        sessionStorage.setItem(cacheKey1, JSON.stringify(d1))
      }
      if (!cached2) {
        const res2 = responses[idx++]
        if (!res2.ok) { console.error('Error execution-index', res2.statusText); return }
        const d2 = await res2.json()
        dataGrafic2.value = d2
        sessionStorage.setItem(cacheKey2, JSON.stringify(d2))
      }
    }
  } catch (err) {
    console.error(err)
  }
})

onUnmounted(() => {
  dataGrafic1.value = []
  dataGrafic2.value = []
})

const grouped = computed(() => {
  const rows = dataGrafic1.value || []
  if (!rows.length) return []
  if (rows[0].label !== undefined && rows[0].count !== undefined) {
    return rows.map(r => [r.label, Number(r.count)])
  }
  const map = new Map()
  for (const row of rows) {
    const tipo = row.TIPO_MANTENIMIENTO ?? row.tipo_mantenimiento ?? ''
    const clase = row.CLASE_ACTIVIDAD ?? row.clase_actividad ?? ''
    const key = `${tipo} - ${clase}`.trim()
    const count = Number(row.COUNT ?? row.count ?? 0)
    map.set(key, (map.get(key) || 0) + count)
  }
  return Array.from(map.entries())
})

const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#06b6d4', '#8b5cf6']

const chartData = computed(() => {
  const labels = grouped.value.map((g) => g[0])
  const data = grouped.value.map((g) => g[1])
  const backgroundColor = labels.map((_, i) => palette[i % palette.length])
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  }
})

const chartOptions = {
  animation: { duration: 0 },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
    title: { display: true, text: 'Participación de actividades de mantenimiento' },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.parsed || 0
          return `${label}: ${value}`
        }
      }
    }
  }
}

const barData = computed(() => {
  const rows = dataGrafic2.value || []
  const labels = rows.map(r => r.NOMBRE_MES ?? r.nombre_mes ?? '')
  const programada = rows.map(r => Number(r.NRO_PROGRAMADA ?? r.nro_programada ?? 0))
  const pendiente = rows.map(r => Number(r.NRO_PENDIENTE ?? r.nro_pendiente ?? 0))
  const cumplida = rows.map(r => Number(r.NRO_CUMPLIDA ?? r.nro_cumplida ?? 0))
  const indice = rows.map(r => Number(r.VLR_INDICE ?? r.vlr_indice ?? 0))
  return {
    labels,
    datasets: [
      { label: 'NRO_PROGRAMADA', data: programada, backgroundColor: '#10b981', type: 'bar' },
      { label: 'NRO_PENDIENTE', data: pendiente, backgroundColor: '#2563eb', type: 'bar' },
      { label: 'NRO_CUMPLIDA', data: cumplida, backgroundColor: '#a16207', type: 'bar' },
      { label: 'VLR_INDICE', data: indice, borderColor: '#8b5cf6', backgroundColor: '#8b5cf6', type: 'line', yAxisID: 'y1', fill: false, tension: 0.3, pointRadius: 3 }
    ]
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { mode: 'index', intersect: false },
    title: { display: true, text: 'Ejecución y Representamiento de OTMs' }
  },
  scales: {
    x: { stacked: false },
    y: { type: 'linear', position: 'left', title: { display: true, text: 'Cantidad' } },
    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Índice' } }
  }
}
</script>

<template>
  <div class="container">
    <div class="dashboard-grid">
      <div class="chart-card">
        <div class="chart-container">
          <Pie :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-container">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>

    <div class="actions-footer">
      <UiButton label="Cerrar sesión" color="delete" size="lg" icon="LogOut" @click="$emit('logout')"
        iconPosition="end" />
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: var(--space-md);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.chart-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.chart-container {
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-footer {
  display: flex;
  justify-content: center;
  padding: var(--space-lg) 0;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .chart-card {
    padding: var(--space-md);
  }
  .chart-container {
    height: 320px;
  }
}
</style>
