<template>
  <label class="ui-checkbox" :class="{ 'ui-checkbox--disabled': disabled }">
    <div class="ui-checkbox__input-wrapper">
      <input
        type="checkbox"
        class="ui-checkbox__input"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />
      <div class="ui-checkbox__box" :class="[`ui-checkbox__box--${color}`]">
        <component :is="CheckIcon" class="ui-checkbox__icon" v-if="modelValue" />
      </div>
    </div>
    <span v-if="label" class="ui-checkbox__label">{{ label }}</span>
  </label>
</template>

<script setup>
import { Check } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  // Colores alineados con UiButton: create, edit, delete, read, info
  color: { type: String, default: 'read' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const CheckIcon = Check

function onChange(event) {
  if (props.disabled) return
  const checked = event.target.checked
  emit('update:modelValue', checked)
  emit('change', checked)
}
</script>

<style scoped>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-stack);
  transition: all 0.2s ease;
}

.ui-checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ui-checkbox__input-wrapper {
  position: relative;
  width: 22px;
  height: 22px;
}

.ui-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ui-checkbox__box {
  width: 100%;
  height: 100%;
  background: var(--color-background);
  border: 2px solid rgba(15, 23, 42, 0.15);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Colores de fondo cuando está marcado */
.ui-checkbox__input:checked + .ui-checkbox__box--read {
  background-color: #2563eb;
  border-color: #2563eb;
}

.ui-checkbox__input:checked + .ui-checkbox__box--create {
  background-color: #16a34a;
  border-color: #16a34a;
}

.ui-checkbox__input:checked + .ui-checkbox__box--edit {
  background-color: #f59e0b;
  border-color: #f59e0b;
}

.ui-checkbox__input:checked + .ui-checkbox__box--delete {
  background-color: #ef4444;
  border-color: #ef4444;
}

.ui-checkbox__input:checked + .ui-checkbox__box--info {
  background-color: #06b6d4;
  border-color: #06b6d4;
}

/* Efectos de hover y focus */
.ui-checkbox:not(.ui-checkbox--disabled):hover .ui-checkbox__box {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.ui-checkbox__input:focus-visible + .ui-checkbox__box {
  outline: 3px solid rgba(37, 99, 235, 0.3);
  outline-offset: 2px;
}

.ui-checkbox__icon {
  color: white;
  width: 16px;
  height: 16px;
  stroke-width: 3.5px;
  animation: checkmark-pop 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ui-checkbox__label {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--color-text);
}

@keyframes checkmark-pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (pointer: coarse) {
  .ui-checkbox__input-wrapper {
    width: 26px;
    height: 26px;
  }
  .ui-checkbox {
    gap: 12px;
    padding: 4px 0;
  }
}
</style>
