<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="ui-modal-overlay" @click.self="close">
      <div class="ui-modal-container" role="dialog" aria-modal="true">
        <!-- Header -->
        <header class="ui-modal-header">
          <h2 class="ui-modal-title">{{ title }}</h2>
          <button type="button" class="ui-modal-close" @click="close" aria-label="Cerrar modal">
            <component :is="XIcon" />
          </button>
        </header>

        <!-- Body -->
        <div class="ui-modal-body">
          <slot>{{ message }}</slot>
        </div>

        <!-- Footer -->
        <footer class="ui-modal-footer">
          <UiButton 
            :label="cancelLabel" 
            color="info" 
            outlined 
            @click="close" 
          />
          <UiButton 
            :label="confirmLabel" 
            :color="confirmColor" 
            :icon="confirmIcon"
            @click="confirm" 
          />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import UiButton from './UiButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Estás seguro de que deseas realizar esta operación?' },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  confirmColor: { type: String, default: 'create' },
  confirmIcon: { type: String, default: 'Check' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const XIcon = X

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.ui-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--space-md);
}

.ui-modal-container {
  background: var(--color-background);
  width: 100%;
  max-width: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ui-modal-header {
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
}

.ui-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.ui-modal-close {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: all 0.2s ease;
}

.ui-modal-close:hover {
  background: rgba(15, 23, 42, 0.05);
  color: var(--color-text);
}

.ui-modal-body {
  padding: var(--space-lg);
  font-size: var(--fs-base);
  color: var(--color-text);
  line-height: 1.6;
}

.ui-modal-footer {
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  border-top: 1px solid rgba(15, 23, 42, 0.05);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .ui-modal-container {
    max-width: 100%;
    margin-top: auto;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>
