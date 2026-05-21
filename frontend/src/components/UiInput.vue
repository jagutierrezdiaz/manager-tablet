<template>
  <div class="ui-input" :style="{ minWidth: minWidth }">
    <label v-if="label" :for="id" class="ui-input__label">{{ label }}</label>

    <div
      class="ui-input__wrap"
      :class="[`ui-input__wrap--${size}`, { 'ui-input__wrap--disabled': disabled }]"
    >
      <component
        v-if="ResolvedIcon && iconPositionComputed === 'start'"
        :is="ResolvedIcon"
        class="ui-input__icon"
        :stroke="iconStroke"
        :width="iconSize"
        :height="iconSize"
      />

      <input
        :id="id"
        class="ui-input__field"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readOnly"
        @input="onInput"
      />

      <component
        v-if="ResolvedIcon && iconPositionComputed === 'end'"
        :is="ResolvedIcon"
        class="ui-input__icon"
        :stroke="iconStroke"
        :width="iconSize"
        :height="iconSize"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import * as Icons from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  icon: { type: [String, Object, Function], default: null },
  iconPosition: { type: String, default: 'start' },
  size: { type: String, default: 'md' }, // sm | md | lg
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false },
  // modo solo lectura (no editable, pero seleccionable)
  readOnly: { type: Boolean, default: false },
  // color explícito para el icono (opcional)
  iconColor: { type: String, default: '' },
  minWidth: { type: String, default: '300px' }
});

const emit = defineEmits(['update:modelValue']);

// generar id simple (no crypto necesario)
  const id = `ui-input-${Math.random().toString(36).slice(2, 9)}`;

// Reusar la lógica de resolución de iconos del botón
const ResolvedIcon = computed(() => {
  if (!props.icon) return null;
  if (typeof props.icon !== 'string') return props.icon;

  const asIs = props.icon;
  const toPascal = (s) =>
    s
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');

  const candidates = [asIs, asIs.charAt(0).toUpperCase() + asIs.slice(1), toPascal(asIs)];
  for (const name of candidates) {
    if (Icons[name]) return Icons[name];
  }
  const lower = asIs.toLowerCase();
  const found = Object.keys(Icons).find((k) => k.toLowerCase().includes(lower));
  if (found) return Icons[found];
  // eslint-disable-next-line no-console
  console.warn(`[UiInput] icon not found: ${props.icon}`);
  return null;
});

const iconPositionComputed = computed(() => {
  const p = (props.iconPosition || 'start').toLowerCase();
  return p === 'end' ? 'end' : 'start';
});

const iconStroke = computed(() => props.disabled ? 'currentColor' : (props.iconColor || 'currentColor'));

// Tamaños de icono coherentes con UiButton
const iconSize = computed(() => (props.size === 'sm' ? 12 : props.size === 'lg' ? 24 : 20));

function onInput(e) {
  if (props.readOnly) return;
  emit('update:modelValue', e.target.value);
}
</script>

<style scoped>
.ui-input {
  font-family: var(--font-stack);
}

.ui-input__label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.ui-input__wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-background);
  border: 2px solid rgba(15,23,42,0.08);
  border-radius: 8px;
  padding: var(--space-sm) var(--space-md);
  transition: all 0.2s ease;
}

.ui-input__wrap--sm { padding: var(--space-xs) var(--space-sm); }
.ui-input__wrap--lg { padding: var(--space-md) var(--space-xl); }
.ui-input__wrap--disabled { opacity: 0.5; pointer-events: none; background: var(--color-surface); }
.ui-input__wrap--readonly {
  background: var(--color-surface);
  border-color: rgba(15,23,42,0.04);
  cursor: text;
}

.ui-input__icon {
  color: var(--color-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.ui-input__field {
  border: none;
  background: transparent;
  outline: none;
  font-size: var(--fs-base);
  color: var(--color-text);
  width: 100%;
  min-width: 0;
  padding: 0;
  font-weight: 500;
}

.ui-input__field::placeholder {
  color: var(--color-muted);
  opacity: 0.5;
}

/* focus */
.ui-input__wrap:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  background: var(--color-background);
}

@media (pointer: coarse) {
  .ui-input__wrap {
    min-height: 48px;
  }
}

/* No aplicar efecto de 'press' — debe comportarse como un input normal.
   El feedback se hace con :focus-within (sombra sutil) */

</style>
