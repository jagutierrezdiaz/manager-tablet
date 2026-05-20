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
      :width="18"
      :height="18"
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
  border-bottom: 3px solid transparent;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  text-transform: uppercase;
  transition: all 0.2s ease;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .ui-nav-btn {
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    font-size: 0.7rem;
  }
  .ui-nav-btn__icon {
    width: 20px !important;
    height: 20px !important;
  }
}

.ui-nav-btn:hover {
  color: #0d5e94;
  background-color: rgba(0, 0, 0, 0.02);
}

.ui-nav-btn--active {
  color: #0d5e94;
  border-bottom-color: #0d5e94;
}

.ui-nav-btn__icon {
  flex-shrink: 0;
}

.ui-nav-btn__label {
  white-space: nowrap;
}
</style>
