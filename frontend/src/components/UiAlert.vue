<template>
  <div
    :class="['ui-alert', `ui-alert--${type}`, { 'ui-alert--no-title': !title }]"
    :style="alertStyle"
    role="status"
  >
    <component
      v-if="ResolvedIcon"
      :is="ResolvedIcon"
      class="ui-alert__icon"
      :stroke="iconStroke"
      :width="iconSize"
      :height="iconSize"
      aria-hidden="true"
    />

    <div class="ui-alert__body">
      <div v-if="title" class="ui-alert__title">{{ title }}</div>
      <div class="ui-alert__message"><slot>{{ message }}</slot></div>
    </div>

  <button type="button" class="ui-alert__close" @click="close" aria-label="Cerrar alerta">
      <component v-if="CloseIcon" :is="CloseIcon" :stroke="iconStroke" :width="16" :height="16" />
      <span v-else aria-hidden="true">×</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as Icons from 'lucide-vue-next';

// Props del componente
const props = defineProps({
  type: { type: String, default: 'info' }, // success | warning | info | error
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  icon: { type: [String, Object, Function], default: null },
  // tamaño del icono: sm | md | lg
  size: { type: String, default: 'md' },
  // mostrar botón de cerrar (por defecto true)
  dismissible: { type: Boolean, default: true }
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}

// Mapa de colores por tipo (valores base)
const colorMap = {
  success: '#16a34a',
  warning: '#f59e0b',
  info: '#06b6d4',
  error: '#ef4444'
};

// Resuelve color final (permite pasar color CSS personalizado en props.type)
const resolvedColor = computed(() => colorMap[props.type] ?? props.type ?? colorMap.info);

// Helper: convertir hex a rgba para background ligero
function hexToRgba(hex, alpha = 0.08) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const alertStyle = computed(() => ({
  '--alert-color': resolvedColor.value,
  '--alert-bg': hexToRgba(resolvedColor.value, 0.12)
}));

// Icono por defecto según tipo (nombres de lucide)
const defaultIcons = {
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  error: 'XCircle'
};

// Resolución de icono similar a UiButton (acepta string o componente)
const ResolvedIcon = computed(() => {
  if (!props.icon) {
    const name = defaultIcons[props.type] || defaultIcons.info;
    return Icons[name] ?? null;
  }
  if (typeof props.icon !== 'string') return props.icon;
  const asIs = props.icon;
  const toPascal = (s) =>
    s.replace(/[_-]+/g, ' ').split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  const candidates = [asIs, asIs.charAt(0).toUpperCase() + asIs.slice(1), toPascal(asIs)];
  for (const name of candidates) {
    if (Icons[name]) return Icons[name];
  }
  const lower = asIs.toLowerCase();
  const found = Object.keys(Icons).find(k => k.toLowerCase().includes(lower));
  if (found) return Icons[found];
  // eslint-disable-next-line no-console
  console.warn(`[UiAlert] icon not found: ${props.icon}`);
  return null;
});

const iconStroke = computed(() => props.iconColor || 'currentColor');

const iconSize = computed(() => (props.size === 'sm' ? 14 : props.size === 'lg' ? 22 : 18));

// Icono de cerrar (X)
const CloseIcon = Icons['X'] || Icons['XCircle'] || null;
</script>

<style scoped>
:root {
  --alert-radius: 8px;
}
.ui-alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  background: var(--alert-bg);
  border: 1px solid rgba(0,0,0,0.02);
  color: var(--color-text);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
}
.ui-alert__icon {
  flex: 0 0 auto;
  color: var(--alert-color);
}
.ui-alert__body {
  flex: 1 1 auto;
}
.ui-alert__title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: var(--fs-base);
  color: var(--alert-color);
}
.ui-alert__message {
  color: var(--color-text);
  font-size: var(--fs-sm);
  line-height: 1.5;
  font-weight: 500;
}
.ui-alert__close {
  background: transparent;
  border: none;
  color: var(--alert-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.ui-alert__close:hover {
  background: rgba(0,0,0,0.05);
}

@media (pointer: coarse) {
  .ui-alert {
    padding: var(--space-sm) var(--space-md);
  }
  .ui-alert__close {
    width: 44px;
    height: 44px;
  }
}
</style>
