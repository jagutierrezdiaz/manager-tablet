<template>
  <button
    type="button"
    :class="[
      'ui-nav-btn',
      { 'ui-nav-btn--active': active }
    ]"
    @click="$emit('click', $event)"
  >
    <component
      v-if="ResolvedIcon"
      :is="ResolvedIcon"
      class="ui-nav-btn__icon"
      :stroke-width="2.5"
    />
    <span class="ui-nav-btn__label">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import * as Icons from 'lucide-vue-next';

const props = defineProps({
  label: { type: String, default: '' },
  active: { type: Boolean, default: false },
  icon: { type: String, default: null }
});

defineEmits(['click']);

const ResolvedIcon = computed(() => {
  if (!props.icon) return null;
  const name = props.icon.charAt(0).toUpperCase() + props.icon.slice(1);
  return Icons[name] || Icons[props.icon] || null;
});
</script>

<style scoped>
.ui-nav-btn {
  background: transparent;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--color-muted);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 16px;
  user-select: none;
  flex: 1;
  min-width: 64px;
  position: relative;
}

.ui-nav-btn__icon {
  width: 24px !important;
  height: 24px !important;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.ui-nav-btn:hover {
  color: var(--color-primary);
  background-color: rgba(37, 99, 235, 0.05);
}

.ui-nav-btn--active {
  color: var(--color-primary);
  background-color: rgba(37, 99, 235, 0.08);
}

.ui-nav-btn--active .ui-nav-btn__icon {
  transform: translateY(-2px);
}

.ui-nav-btn--active .ui-nav-btn__label {
  font-weight: 700;
}

.ui-nav-btn__label {
  white-space: nowrap;
}

.ui-nav-btn:active {
  transform: scale(0.9);
}

@media (min-width: 768px) {
  .ui-nav-btn {
    font-size: 0.85rem;
    padding: 4px 8px;
    gap: 4px;
  }

}
</style>
