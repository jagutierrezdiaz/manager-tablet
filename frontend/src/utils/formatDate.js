export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatDecimalHours(hours) {
    const value = Number(hours)
    if (!Number.isFinite(value)) return '0,00'
    return value.toFixed(2).replace('.', ',')
}

export function parseDecimalHours(value) {
    if (value == null || value === '') return 0
    if (typeof value === 'number') return value

    const str = String(value).trim()
    if (str.includes(':')) {
        const parts = str.split(':')
        const h = parseInt(parts[0], 10) || 0
        const m = parseInt(parts[1], 10) || 0
        const s = parseInt(parts[2], 10) || 0
        return h + (m / 60) + (s / 3600)
    }

    return parseFloat(str.replace(',', '.')) || 0
}

export function formatForDateTimeInput(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
}
