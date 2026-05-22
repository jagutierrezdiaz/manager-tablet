<template>
  <button
    :type="type"
    :class="[
      'ui-btn',
      `ui-btn--${color}`,
      { 'ui-btn--outlined': outlined, 'ui-btn--icon-only': isIconOnly }
    ]"
    :style="buttonStyle"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <!-- icon + label: soporta iconPosition 'start' | 'end' -->
    <template v-if="!isIconOnly">
      <component
        v-if="ResolvedIcon && iconPosition === 'start'"
        :is="ResolvedIcon"
        class="ui-btn__icon"
        :stroke="iconStroke"
        :width="iconSize"
        :height="iconSize"
      />

      <span class="ui-btn__label">
        <slot>{{ label }}</slot>
      </span>

      <component
        v-if="ResolvedIcon && iconPosition === 'end'"
        :is="ResolvedIcon"
        class="ui-btn__icon"
        :stroke="iconStroke"
        :width="iconSize"
        :height="iconSize"
      />
    </template>

    <!-- icon-only: centrar icono -->
    <template v-else>
      <component
        v-if="ResolvedIcon"
        :is="ResolvedIcon"
        class="ui-btn__icon"
        :stroke="iconStroke"
        :width="iconSize"
        :height="iconSize"
      />
    </template>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import * as Icons from 'lucide-vue-next';

const props = defineProps({
  label: { type: String, default: '' },
  // icon puede ser un nombre (string) de lucide o un componente
  icon: { type: [String, Object, Function], default: null },
  // uno de: create, edit, delete, read, info
  color: { type: String, default: 'read' },
  // si true: outlined (fondo transparente, borde coloreado). si false: fondo relleno.
  outlined: { type: Boolean, default: false },
  // sobrescribe color del icono (ej. '#fff' o 'red'); si está vacío usa 'currentColor'
  iconColor: { type: String, default: '' },
  // tamaños: sm, md, lg (afecta visualmente el padding y tamaño del icono)
  size: { type: String, default: 'md' },
  // posición del icono respecto al texto: 'start' | 'end'
  iconPosition: { type: String, default: 'start' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

// Mapa de colores por defecto
const colorMap = {
  create: '#16a34a',
  edit: '#f59e0b',
  delete: '#ef4444',
  read: '#2563eb',
  info: '#c5c5c5'
};

const resolvedButtonColor = computed(() => {
  const c = props.color || 'read';
  return colorMap[c] ?? c ?? colorMap.read;
});

// Definimos --btn-color directamente en el elemento para evitar depender de :root
const buttonStyle = computed(() => ({ '--btn-color': resolvedButtonColor.value }));

// Resuelve el icono soportando varios formatos de nombre (Home, home, home-outline, homeOutline)
const ResolvedIcon = computed(() => {
  if (!props.icon) return null;
  // Si ya es un componente, usarlo directamente
  if (typeof props.icon !== 'string') return props.icon;

  const asIs = props.icon;

  // Convierte cadenas como 'home-outline' o 'home_outline' a PascalCase 'HomeOutline'
  const toPascal = (s) =>
    s
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

  const candidates = [asIs, asIs.charAt(0).toUpperCase() + asIs.slice(1), toPascal(asIs)];

  for (const name of candidates) {
    if (Icons[name]) return Icons[name];
  }

  // último recurso: intentar todas las claves que contengan la parte principal (case-insensitive)
  const lower = asIs.toLowerCase();
  const found = Object.keys(Icons).find((k) => k.toLowerCase().includes(lower));
  if (found) return Icons[found];

  // si no se encontró, avisar en consola para ayudar al developer
  // eslint-disable-next-line no-console
  console.warn(`[UiButton] icon not found: ${props.icon}`);
  return null;
});

const isIconOnly = computed(() => {
  // si hay un icono y no hay contenido en label/slot (slot vacío y label vacío)
  return !!ResolvedIcon.value && !props.label;
});

// Normalizar posición (acepta 'start'|'end', fallback 'start')
const iconPosition = computed(() => {
  const p = (props.iconPosition || 'start').toLowerCase();
  return p === 'end' ? 'end' : 'start';
});

const iconStroke = computed(() => {
  return props.iconColor || 'currentColor';
});

const iconSize = computed(() => {
  return props.size === 'sm' ? 12 : props.size === 'lg' ? 24 : 20;
});
</script>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  font-family: var(--font-stack);
  font-size: var(--fs-base);
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  padding: var(--space-sm) var(--space-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  vertical-align: middle;
  border: none;
}

.ui-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.ui-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.ui-btn__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex: 1;
  text-align: center;
}

/* solo-icono: hacerlo más compacto y cuadrado */
.ui-btn--icon-only {
  padding: var(--space-sm);
  width: 48px;
  height: 48px;
  justify-content: center;
}

/* estilo outlined: fondo transparente, borde y texto coloreado */
.ui-btn--outlined {
  background: transparent;
  color: var(--btn-color);
  border: 2px solid var(--btn-color);
}

/* estilo relleno: fondo coloreado, texto contrastado */
.ui-btn:not(.ui-btn--outlined) {
  color: #ffffff;
  background-color: var(--btn-color);
  box-shadow: var(--shadow-sm);
}

/* Las clases de variante mapean a variables CSS */
.ui-btn--create { --btn-color: var(--btn-create); }
.ui-btn--edit { --btn-color: var(--btn-edit); }
.ui-btn--delete { --btn-color: var(--btn-delete); }
.ui-btn--read { --btn-color: var(--btn-read); }
.ui-btn--info { --btn-color: var(--btn-info); }

/* Estados hover, focus y active (presionado) */
.ui-btn:not(:disabled):hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* foco visual sutil */
.ui-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.3);
  outline-offset: 2px;
}

/* efecto de 'presionar' */
.ui-btn:not(:disabled):active {
  transform: scale(0.96);
  filter: brightness(0.95);
  box-shadow: var(--shadow-sm);
}

/* Ajustes para tamaños pequeño/grande */
.ui-btn[size="sm"] { 
  font-size: var(--fs-sm); 
  padding: var(--space-xs) var(--space-sm); 
  min-height: 36px;
}
.ui-btn[size="lg"] { 
  font-size: var(--fs-lg); 
  padding: var(--space-md) var(--space-xl); 
  min-height: 56px;
}

/* Ajustes específicos para dispositivos táctiles */
@media (pointer: coarse) {
  .ui-btn {
    min-height: 48px;
    padding: var(--space-sm) var(--space-lg);
  }
  .ui-btn--icon-only {
    width: 52px;
    height: 52px;
  }
}

/* Respetar preferencia de reducir movimiento */
@media (prefers-reduced-motion: reduce) {
  .ui-btn {
    transition: none !important;
    will-change: auto !important;
  }
}

</style>
