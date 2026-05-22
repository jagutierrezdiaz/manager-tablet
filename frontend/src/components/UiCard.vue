<template>
    <div class="ui-card" @click.stop="onSelect">
        <div class="text-title" :class="[colorCard]">
            <template v-if="nameText">
                {{ nameText.charAt(0).toUpperCase() }}
            </template>
            <template v-else>
                <Icon :icon="getIconForTask(content.nameTask)" class="task-icon" />
            </template>
        </div>
        <div class="content">
            <h3>{{ content.idTask ? content.idTask + ' - ' : '' }} {{ content.nameTask }}</h3>
            <h4 v-if="content.subtitleTask">{{ content.subtitleTask }}</h4>
            <p v-if="content.descriptionTask">{{ content.descriptionTask }}</p>
            <span v-if="content.dateProgrammed">Fecha Programada: {{ formatDate(content.dateProgrammed) }}</span>
            <span v-if="content.dateLimit">Fecha Límite: {{ formatDate(content.dateLimit) || 'No tiene límite' }}</span>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['select'])

const props = defineProps({
    nameText: {
        type: String,
        required: false,
        default: ''
    },
    content: {
        type: Object,
        required: true
    }
})

const onSelect = () => {
    emit('select', colorCard.value)
}

/**
 * Clasificación jerárquica para maquinaria industrial.
 * Prioriza términos específicos de equipo sobre términos de sector.
 */
const getCategory = (name) => {
    if (!name) return 'generic'
    const n = name.toLowerCase()

    // 1. Equipos específicos (Alta prioridad)
    if (n.includes('bascul') || n.includes('pesaj') || n.includes('balanz') || n.includes('pesa')) return 'scale'
    if (n.includes('elevad') || n.includes('cangilon') || n.includes('ascens')) return 'elevator'
    if (n.includes('transporta') || n.includes('cinta') || n.includes('helicoid') || n.includes('banda')) return 'conveyor'
    if (n.includes('bomb') || n.includes('hidrau') || n.includes('succion') || n.includes('inyec')) return 'pump'
    if (n.includes('motor') || n.includes('reduc') || n.includes('turbin') || n.includes('actuador')) return 'motor'
    if (n.includes('tolv') || n.includes('silo') || n.includes('tanq') || n.includes('contened') || n.includes('almac')) return 'storage'
    if (n.includes('calder') || n.includes('vapor') || n.includes('calent') || n.includes('horno')) return 'energy'
    if (n.includes('electr') || n.includes('panel') || n.includes('tabler') || n.includes('volt') || n.includes('transf')) return 'electrical'
    if (n.includes('filtr') || n.includes('purific') || n.includes('separad')) return 'filter'
    if (n.includes('prens') || n.includes('compact') || n.includes('tritur')) return 'press'
    
    // 2. Sectores industriales (Media prioridad)
    if (n.includes('quim') || n.includes('lab') || n.includes('acid') || n.includes('react')) return 'chemical'
    if (n.includes('alim') || n.includes('comid') || n.includes('molin') || n.includes('trill') || n.includes('procesad')) return 'food'
    if (n.includes('metal') || n.includes('mecan') || n.includes('torno') || n.includes('solda') || n.includes('fresad')) return 'metalworking'
    if (n.includes('textil') || n.includes('tela') || n.includes('hila') || n.includes('costu')) return 'textile'
    if (n.includes('camion') || n.includes('logis') || n.includes('vehi') || n.includes('transp')) return 'transport'
    
    // 3. Procesos generales
    if (n.includes('manuf') || n.includes('fabri') || n.includes('produ') || n.includes('indus') || n.includes('linea')) return 'manufacturing'
    
    return 'generic'
}

/**
 * Motor de iconos con pool extendido (+120 iconos industriales).
 * Evita iconos de oficina y usa variaciones de engranajes y procesos para genéricos.
 */
const getIconForTask = (name) => {
    const cat = getCategory(name)
    // Hash robusto para asegurar que nombres similares tengan iconos diferentes
    const hash = name.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 1)), 0)
    const getV = (list) => list[hash % list.length]

    const iconMap = {
        scale: ['flat-color-icons:rules', 'flat-color-icons:calculator', 'flat-color-icons:survey', 'flat-color-icons:fine-print'],
        elevator: ['flat-color-icons:external', 'flat-color-icons:up', 'flat-color-icons:org-unit', 'flat-color-icons:generic-sorting-asc'],
        conveyor: ['flat-color-icons:workflow', 'flat-color-icons:process', 'flat-color-icons:shipped', 'flat-color-icons:generic-sorting-desc'],
        pump: ['flat-color-icons:deployment', 'flat-color-icons:electrical-sensor', 'flat-color-icons:flash-on', 'flat-color-icons:mms'],
        motor: ['flat-color-icons:settings', 'flat-color-icons:services', 'flat-color-icons:automotive', 'flat-color-icons:data-configuration'],
        storage: ['flat-color-icons:database', 'flat-color-icons:factory', 'flat-color-icons:opened-folder', 'flat-color-icons:filing-cabinet'],
        energy: ['flat-color-icons:heat-map', 'flat-color-icons:flash-on', 'flat-color-icons:biomass', 'flat-color-icons:factory'],
        electrical: ['flat-color-icons:flash-on', 'flat-color-icons:integrated-circuit', 'flat-color-icons:electricity', 'flat-color-icons:electronics'],
        filter: ['flat-color-icons:mms', 'flat-color-icons:workflow', 'flat-color-icons:deployment'],
        press: ['flat-color-icons:down', 'flat-color-icons:org-unit', 'flat-color-icons:process'],
        chemical: ['flat-color-icons:biotech', 'flat-color-icons:mms', 'flat-color-icons:pills', 'flat-color-icons:electrical-sensor'],
        food: ['flat-color-icons:shop', 'flat-color-icons:biomass', 'flat-color-icons:org-unit', 'flat-color-icons:landscape'],
        metalworking: ['flat-color-icons:engineering', 'flat-color-icons:settings', 'flat-color-icons:cable-release', 'flat-color-icons:services'],
        textile: ['flat-color-icons:cloth', 'flat-color-icons:template', 'flat-color-icons:parallel-tasks', 'flat-color-icons:gallery'],
        transport: ['flat-color-icons:shipped', 'flat-color-icons:in-transit', 'flat-color-icons:automotive', 'flat-color-icons:delivery-man'],
        manufacturing: ['flat-color-icons:factory', 'flat-color-icons:deployment', 'flat-color-icons:workflow', 'flat-color-icons:process', 'flat-color-icons:factory-breakdown'],
        // Pool genérico industrial masivo (Engranajes, diagramas, fábricas, sensores)
        generic: [
            'flat-color-icons:settings', 'flat-color-icons:services', 'flat-color-icons:engineering',
            'flat-color-icons:factory', 'flat-color-icons:workflow', 'flat-color-icons:process',
            'flat-color-icons:deployment', 'flat-color-icons:org-unit', 'flat-color-icons:data-configuration',
            'flat-color-icons:electronics', 'flat-color-icons:electro-devices', 'flat-color-icons:automatic',
            'flat-color-icons:neutral-trading', 'flat-color-icons:line-chart', 'flat-color-icons:bar-chart',
            'flat-color-icons:pie-chart', 'flat-color-icons:statistics', 'flat-color-icons:combo-chart',
            'flat-color-icons:fine-print', 'flat-color-icons:briefcase', 'flat-color-icons:data-backup',
            'flat-color-icons:data-recovery', 'flat-color-icons:capacitor', 'flat-color-icons:circuit'
        ]
    }
    
    const icons = iconMap[cat] || iconMap.generic
    return getV(icons)
}

const formatDate = (date) => {

    if (!date) return 'No tiene límite'

    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

/**
 * Crea una fecha local sin horas.
 */
const createDateWithoutTime = (dateString) => {

    if (!dateString) return null

    // Obtiene solo la parte YYYY-MM-DD
    const onlyDate = dateString.split('T')[0]
    const [year, month, day] = onlyDate.split('-')
    return new Date(Number(year), Number(month) - 1, Number(day))
}

const colorCard = computed(() => {

    // Fecha actual sin horas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fecha programada sin horas
    const dateProgrammed = createDateWithoutTime(props.content.dateProgrammed)
    // Fecha límite sin horas
    const dateLimit = createDateWithoutTime(props.content.dateLimit)

    if (dateLimit && dateProgrammed) {

        // Hoy está entre fecha programada y fecha límite
        const isBetweenProgrammedAndLimit = today.getTime() >= dateProgrammed.getTime() && today.getTime() <= dateLimit.getTime()

        // Hoy ya pasó la fecha límite
        const isAfterDateLimit = today.getTime() > dateLimit.getTime()

        if (isBetweenProgrammedAndLimit) {
            return 'bg-yellow-500'
        }
        else if (isAfterDateLimit) {
            return 'bg-red-700'
        }
        else {
            return 'bg-green-700'
        }

    }
    else if (dateProgrammed) {

        // La fecha programada es hoy
        const isToday = today.getTime() === dateProgrammed.getTime()

        // La fecha programada ya pasó
        const isPastDate = dateProgrammed.getTime() < today.getTime()

        if (isToday) {
            return 'bg-yellow-500'
        }
        else if (isPastDate) {
            return 'bg-red-700'
        }
        else {
            return 'bg-green-700'
        }
    } else {
        return 'bg-gray-500'
    }
})
</script>

<style scoped>
.ui-card {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    cursor: pointer;
    box-shadow: var(--shadow-md);
    border-radius: var(--radius);
    background-color: var(--color-background);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.ui-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.ui-card:active {
    transform: scale(0.98);
}

.text-title {
    width: 100px;
    padding: var(--space-md);
    color: white;
    font-size: 2rem;
    font-weight: 800;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.task-icon {
    font-size: 3.5rem;
}

.content {
    width: 100%;
    padding: var(--space-sm);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
}

.content h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
}

.content h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-muted);
    margin: 0;
}

.content p {
    font-size: 0.95rem;
    font-weight: 400;
    color: var(--color-muted);
    margin: 4px 0;
    line-height: 1.4;
}

.content span {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-muted);
    margin-top: 4px;
}

@media (max-width: 768px) {
    .ui-card {
        gap: var(--space-sm);
    }
    .text-title {
        width: 80px;
        font-size: 1.5rem;
    }
    .task-icon {
        font-size: 2.5rem;
    }
}
</style>