<template>
  <div class="ui-search-selector">
    <div class="flex flex-col gap-4">
      <!-- Campo de búsqueda -->
      <UiInput
        v-model="searchQuery"
        :label="label"
        :placeholder="placeholder"
        icon="search"
      />

      <!-- Selector de resultados -->
      <div class="flex flex-col gap-2">
        <label v-if="selectLabel" class="text-sm font-bold text-muted">{{ selectLabel }}</label>
        <select v-model="selectedItem" class="ui-select">
          <option :value="null" disabled>{{ emptyOptionText }}</option>
          <option v-for="item in filteredItems" :key="item[itemKey]" :value="item">
            {{ displayFormat(item) }}
          </option>
        </select>
        <p v-if="filteredItems.length === 0" class="text-xs text-error mt-1">
          {{ noResultsText }}
        </p>
      </div>

      <!-- Botón de acción -->
      <UiButton
        :label="confirmLabel"
        color="create"
        icon="check"
        :disabled="!selectedItem"
        @click="confirm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UiInput from './UiInput.vue'
import UiButton from './UiButton.vue'

const props = defineProps({
  // Lista total de elementos
  items: { type: Array, default: () => [] },
  // Campos por los que se puede buscar (ej: ['nombre', 'id'])
  searchFields: { type: Array, default: () => [] },
  // Clave única para el :key del v-for
  itemKey: { type: String, required: true },
  // Etiquetas y textos personalizables
  label: { type: String, default: 'Buscar...' },
  placeholder: { type: String, default: 'Escribe para filtrar...' },
  selectLabel: { type: String, default: 'Resultados' },
  emptyOptionText: { type: String, default: 'Selecciona una opción...' },
  noResultsText: { type: String, default: 'No se encontraron resultados.' },
  confirmLabel: { type: String, default: 'Confirmar' },
  // Función para personalizar cómo se ve cada opción en el select
  displayFormat: { 
    type: Function, 
    default: (item) => item.nombre || item.label || String(item) 
  }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')
const selectedItem = ref(null)

// Filtrado reactivo basado en los campos especificados
const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return props.items
  
  return props.items.filter(item => {
    return props.searchFields.some(field => {
      const value = String(item[field] || '').toLowerCase()
      return value.includes(query)
    })
  })
})

function confirm() {
  if (selectedItem.value) {
    emit('select', selectedItem.value)
    // Limpiar selección después de emitir
    selectedItem.value = null
    searchQuery.value = ''
  }
}
</script>

<style scoped>
.ui-select {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    border: 2px solid rgba(0, 0, 0, 0.05);
    background: var(--color-background);
    font-size: 1rem;
    font-family: inherit;
    color: var(--color-text);
    outline: none;
    transition: border-color 0.2s ease;
}

.ui-select:focus {
    border-color: var(--color-primary);
}

.ui-search-selector {
    padding: var(--space-md);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 2px solid rgba(37, 99, 235, 0.1);
}
</style>
