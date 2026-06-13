<template>
  <section class="ui-list-filters">
    <div v-if="showSelect" class="ui-list-filters__field">
      <label :id="`${selectId}-label`" class="ui-list-filters__label">{{ selectLabel }}</label>
      <div ref="selectRoot" class="ui-list-filters__select-root">
        <button
          type="button"
          class="ui-list-filters__wrap ui-list-filters__trigger"
          :class="{ 'ui-list-filters__trigger--open': isOpen, 'ui-list-filters__trigger--placeholder': !selectedLabel }"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          :aria-labelledby="`${selectId}-label`"
          @click.stop="toggleOpen"
        >
          <Filter class="ui-list-filters__icon" :size="iconSize" />
          <span class="ui-list-filters__trigger-text">
            {{ selectedLabel || selectPlaceholder }}
          </span>
          <ChevronDown
            class="ui-list-filters__chevron"
            :class="{ 'ui-list-filters__chevron--open': isOpen }"
            :size="iconSize"
          />
        </button>

        <Transition name="ui-list-filters-drop">
          <ul
            v-if="isOpen"
            class="ui-list-filters__options"
            role="listbox"
            :aria-labelledby="`${selectId}-label`"
          >
            <li
              v-for="option in selectOptions"
              :key="option[selectValueKey]"
              role="option"
              class="ui-list-filters__option"
              :class="{ 'ui-list-filters__option--active': isSelected(option) }"
              :aria-selected="isSelected(option)"
              @click="pickOption(option)"
            >
              {{ option[selectLabelKey] }}
            </li>
            <li v-if="!selectOptions.length" class="ui-list-filters__option ui-list-filters__option--empty">
              Sin opciones disponibles
            </li>
          </ul>
        </Transition>
      </div>
    </div>

    <div v-if="showSearch" class="ui-list-filters__field">
      <UiInput
        v-model="searchQuery"
        :label="searchLabel"
        :placeholder="searchPlaceholder"
        icon="search"
        minWidth="100%"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Filter, ChevronDown } from 'lucide-vue-next'
import UiInput from './UiInput.vue'

const props = defineProps({
  selectLabel: { type: String, default: 'Proceso' },
  searchLabel: { type: String, default: 'Buscar' },
  searchPlaceholder: { type: String, default: 'Escribe para filtrar...' },
  selectPlaceholder: { type: String, default: 'Seleccione una opción' },
  selectOptions: { type: Array, default: () => [] },
  selectValueKey: { type: String, default: 'value' },
  selectLabelKey: { type: String, default: 'label' },
  showSelect: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true },
  maxWidth: { type: String, default: '520px' }
})

const selectedValue = defineModel('select', { type: [String, Number], default: '' })
const searchQuery = defineModel('search', { type: String, default: '' })

const emit = defineEmits(['select-change'])

const selectId = `ui-list-filters-${Math.random().toString(36).slice(2, 9)}`
const iconSize = 20
const isOpen = ref(false)
const selectRoot = ref(null)

const selectedLabel = computed(() => {
  const match = props.selectOptions.find(
    (option) => String(option[props.selectValueKey]) === String(selectedValue.value)
  )
  return match ? match[props.selectLabelKey] : ''
})

function isSelected(option) {
  return String(option[props.selectValueKey]) === String(selectedValue.value)
}

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function pickOption(option) {
  selectedValue.value = option[props.selectValueKey]
  isOpen.value = false
  emit('select-change', selectedValue.value)
}

function onClickOutside(event) {
  if (selectRoot.value && !selectRoot.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.ui-list-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm);
  background-color: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid rgba(15, 23, 42, 0.06);
  margin-bottom: 10px;
}

.ui-list-filters__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.ui-list-filters__label {
  display: block;
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.ui-list-filters__select-root {
  position: relative;
  width: 100%;
}

.ui-list-filters__wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: var(--color-background);
  border: 2px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  padding: var(--space-sm) var(--space-md);
  transition: all 0.2s ease;
}

.ui-list-filters__trigger {
  cursor: pointer;
  font-family: var(--font-stack);
  text-align: left;
}

.ui-list-filters__trigger--open,
.ui-list-filters__trigger:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  outline: none;
}

.ui-list-filters__trigger--placeholder .ui-list-filters__trigger-text {
  color: var(--color-muted);
  opacity: 0.65;
  font-weight: 500;
}

.ui-list-filters__icon {
  color: var(--color-muted);
  opacity: 0.7;
  flex-shrink: 0;
}

.ui-list-filters__trigger-text {
  flex: 1;
  min-width: 0;
  font-size: var(--fs-base);
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ui-list-filters__chevron {
  color: var(--color-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.ui-list-filters__chevron--open {
  transform: rotate(180deg);
}

.ui-list-filters__options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  margin: 0;
  padding: var(--space-xxs);
  list-style: none;
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-background);
  border: 2px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
}

.ui-list-filters__option {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  user-select: none;
}

.ui-list-filters__option:hover {
  background: rgba(37, 99, 235, 0.06);
}

.ui-list-filters__option--active {
  background: var(--color-primary);
  color: #fff;
}

.ui-list-filters__option--active:hover {
  background: #1d4ed8;
}

.ui-list-filters__option--empty {
  color: var(--color-muted);
  font-weight: 500;
  cursor: default;
  justify-content: center;
}

.ui-list-filters__option--empty:hover {
  background: transparent;
}

.ui-list-filters-drop-enter-active,
.ui-list-filters-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ui-list-filters-drop-enter-from,
.ui-list-filters-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (pointer: coarse) {
  .ui-list-filters__wrap {
    min-height: 48px;
  }

  .ui-list-filters__option {
    min-height: 48px;
  }
}
</style>
