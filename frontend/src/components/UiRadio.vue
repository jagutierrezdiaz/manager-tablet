<template>
  <label class="ui-radio" :class="{ 'ui-radio--disabled': disabled, 'ui-radio--selected': isSelected }">
    <div class="ui-radio__input-wrapper">
      <input
        type="radio"
        class="ui-radio__input"
        :name="name"
        :value="value"
        :checked="isSelected"
        :disabled="disabled"
        @change="handleChange"
      />
      <div class="ui-radio__circle" :class="[`ui-radio__circle--${color}`]">
        <div class="ui-radio__dot" />
      </div>
    </div>
    <span v-if="label" class="ui-radio__label">{{ label }}</span>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, null], default: null },
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  // Colores alineados con UiButton: create, edit, delete, read, info
  color: { type: String, default: 'read' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isSelected = computed(() => props.modelValue === props.value)

function handleChange() {
  if (props.disabled) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<style scoped>
.ui-radio {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-stack);
  transition: all 0.2s ease;
  padding: 6px 12px;
  border-radius: 12px;
}

.ui-radio:hover:not(.ui-radio--disabled) {
  background: rgba(15, 23, 42, 0.05);
}

.ui-radio--selected:not(.ui-radio--disabled) {
  background: rgba(15, 23, 42, 0.03);
}

.ui-radio--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ui-radio__input-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
}

.ui-radio__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}

.ui-radio__circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-background);
  border: 2px solid rgba(15, 23, 42, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;
}

/* Estado seleccionado - Borde más grueso y color */
.ui-radio__input:checked + .ui-radio__circle {
  border-width: 3px;
  transform: scale(1.1);
  background: white;
}

.ui-radio__input:checked + .ui-radio__circle--read { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }
.ui-radio__input:checked + .ui-radio__circle--create { border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15); }
.ui-radio__input:checked + .ui-radio__circle--edit { border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15); }
.ui-radio__input:checked + .ui-radio__circle--delete { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); }
.ui-radio__input:checked + .ui-radio__circle--info { border-color: #06b6d4; box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15); }

/* Punto central - Más grande y siempre visible cuando está marcado */
.ui-radio__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ui-radio__input:checked + .ui-radio__circle .ui-radio__dot {
  opacity: 1;
  transform: scale(1);
}

/* Colores del punto central */
.ui-radio__input:checked + .ui-radio__circle--read .ui-radio__dot { background-color: #2563eb; }
.ui-radio__input:checked + .ui-radio__circle--create .ui-radio__dot { background-color: #16a34a; }
.ui-radio__input:checked + .ui-radio__circle--edit .ui-radio__dot { background-color: #f59e0b; }
.ui-radio__input:checked + .ui-radio__circle--delete .ui-radio__dot { background-color: #ef4444; }
.ui-radio__input:checked + .ui-radio__circle--info .ui-radio__dot { background-color: #06b6d4; }

/* Efectos de foco */
.ui-radio__input:focus-visible + .ui-radio__circle {
  outline: 3px solid rgba(37, 99, 235, 0.3);
  outline-offset: 2px;
}

.ui-radio__label {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--color-text);
  transition: all 0.2s ease;
}

/* Resaltar etiqueta cuando está seleccionado */
.ui-radio--selected .ui-radio__label {
  color: var(--color-text);
  font-weight: 800;
}

@media (pointer: coarse) {
  .ui-radio__input-wrapper {
    width: 28px;
    height: 28px;
  }
  .ui-radio {
    gap: 14px;
    padding: 10px;
  }
}
</style>
