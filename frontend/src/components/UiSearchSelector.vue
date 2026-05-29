<template>
  <div class="ui-search-selector">
    <!-- Campo de búsqueda -->
    <UiInput
      v-model="searchQuery"
      :label="label"
      :placeholder="placeholder"
      icon="search"
      minWidth="100%"
    />

    <!-- Resultados: se seleccionan directamente al tocar (más táctil/compacto) -->
    <div v-if="filteredItems.length" class="uss-results">
      <button
        v-for="item in filteredItems"
        :key="item[itemKey]"
        type="button"
        class="uss-result"
        @click="select(item)"
      >
        <span class="uss-result__text">{{ displayFormat(item) }}</span>
        <Plus class="uss-result__icon" :size="18" :stroke-width="2.5" />
      </button>
    </div>
    <p v-else class="uss-empty">{{ noResultsText }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import UiInput from './UiInput.vue'

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
  noResultsText: { type: String, default: 'No se encontraron resultados.' },
  // Compatibilidad hacia atrás (ya no se usan: la selección es directa al tocar)
  selectLabel: { type: String, default: '' },
  emptyOptionText: { type: String, default: '' },
  confirmLabel: { type: String, default: '' },
  // Función para personalizar cómo se ve cada opción
  displayFormat: {
    type: Function,
    default: (item) => item.nombre || item.label || String(item)
  }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')

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

function select(item) {
  emit('select', item)
  searchQuery.value = ''
}
</script>

<style scoped>
.ui-search-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.uss-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}

.uss-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  text-align: left;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background);
  border: 2px solid rgba(15, 23, 42, 0.06);
  border-radius: 10px;
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.uss-result:hover {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.05);
}

.uss-result:active {
  transform: scale(0.99);
}

.uss-result__text {
  flex: 1;
  min-width: 0;
}

.uss-result__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.uss-empty {
  font-size: var(--fs-sm);
  color: var(--color-muted);
  text-align: center;
  padding: var(--space-md);
  margin: 0;
}

@media (pointer: coarse) {
  .uss-result {
    min-height: 48px;
  }
}
</style>
