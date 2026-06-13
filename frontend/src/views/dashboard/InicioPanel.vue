<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Pie, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarController,
  LineController,
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
  BarController,
  LineController,
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
        console.log('[FRONT] dataGrafic1 (d1):', d1)
        console.log('[FRONT] dataGrafic1.value:', dataGrafic1.value)
        sessionStorage.setItem(cacheKey1, JSON.stringify(d1))
      }
      if (!cached2) {
        const res2 = responses[idx++]
        if (!res2.ok) { console.error('Error execution-index', res2.statusText); return }
        const d2 = await res2.json()
        dataGrafic2.value = d2
        console.log('[FRONT] dataGrafic2 (d2):', d2)
        console.log('[FRONT] dataGrafic2.value:', dataGrafic2.value)
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
    <div class="glass-panel">
      <div class="accent-bar"></div>
      <h2>Dashboard General</h2>
      
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
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

}

.glass-panel {
  background: rgba(255, 255, 255, 0.85); /* Cristal templado premium Fiori Light */
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.40);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1050px; /* Tamaño máximo optimizado */
  margin: 0 auto;
  padding: 2.25rem 2rem;
  height: calc(100vh - 235px);
  overflow-y: auto;
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

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.chart-card {
  background: rgba(255, 255, 255, 0.6); /* Integración fluida en el cristal superior */
  border-radius: var(--radius-lg);
  padding: 1.5rem; /* Ajuste responsivo de relleno inicial */
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(15, 35, 70, 0.05);
  transition: transform 0.3s ease;
  width: 100%;
  min-width: 0; /* Evita desbordamiento en contenedores flexibles de CSS */
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.chart-card canvas{
    height: 240px !important;
}

.chart-container {
  height: 280px; /* Altura ideal balanceada para vistas de escritorio/tableta */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.actions-footer {
  display: flex;
  justify-content: center;
  padding: var(--space-sm) 0;
}

/* Modificaciones dinámicas según escalado de tabletas y móviles */
@media (max-width: 768px) {
  .glass-panel {
    padding: 1.5rem 1rem; /* Compacta la tarjeta contenedora */
    border-radius: 20px;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }
  .chart-card {
    padding: 1rem; /* Compacta los gráficos */
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 250px; /* Altura segura para smartphones muy compactos */
  }
  .glass-panel h2 {
    font-size: 1.25rem;
    margin-bottom: 0.55rem;
  }
}
</style>
