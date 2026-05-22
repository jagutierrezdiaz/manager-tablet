<template>
  <div class="ui-image-upload">
    <label v-if="label" class="ui-image-upload__label">{{ label }}</label>
    
    <div 
      class="ui-image-upload__dropzone"
      :class="{ 'ui-image-upload__dropzone--has-image': previewUrl }"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        class="ui-image-upload__input"
        accept="image/*"
        @change="handleFileChange"
      />
      
      <div v-if="!previewUrl" class="ui-image-upload__placeholder">
        <component :is="CameraIcon" class="ui-image-upload__icon" />
        <span>{{ placeholder }}</span>
      </div>
      
      <div v-else class="ui-image-upload__preview">
        <img :src="previewUrl" alt="Vista previa" class="ui-image-upload__img" />
        <div class="ui-image-upload__overlay">
          <UiButton 
            size="sm" 
            color="delete" 
            icon="trash" 
            @click.stop="removeImage"
          />
          <UiButton 
            size="sm" 
            color="edit" 
            icon="refresh-cw" 
            @click.stop="triggerFileInput"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Camera, Trash, RefreshCw } from 'lucide-vue-next'
import UiButton from './UiButton.vue'

const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccionar imagen' },
  modelValue: { type: [File, String], default: null }
})

const emit = defineEmits(['update:modelValue', 'change'])

const fileInput = ref(null)
const previewUrl = ref(null)

const CameraIcon = Camera
const TrashIcon = Trash
const RefreshIcon = RefreshCw

// Manejar cambios en el modelValue (por ejemplo, si viene una URL del backend)
watch(() => props.modelValue, (newVal) => {
  if (typeof newVal === 'string') {
    previewUrl.value = newVal
  } else if (!newVal) {
    previewUrl.value = null
  }
}, { immediate: true })

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  // Crear vista previa
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)

  emit('update:modelValue', file)
  emit('change', file)
}

function removeImage() {
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
  emit('update:modelValue', null)
  emit('change', null)
}
</script>

<style scoped>
.ui-image-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.ui-image-upload__label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-text);
}

.ui-image-upload__dropzone {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--color-surface);
  border: 2px dashed rgba(15, 23, 42, 0.1);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.ui-image-upload__dropzone:hover {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.02);
}

.ui-image-upload__dropzone--has-image {
  border-style: solid;
  border-color: rgba(15, 23, 42, 0.05);
}

.ui-image-upload__input {
  display: none;
}

.ui-image-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-muted);
  font-size: var(--fs-sm);
  font-weight: 500;
}

.ui-image-upload__icon {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.ui-image-upload__preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.ui-image-upload__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-image-upload__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.ui-image-upload__preview:hover .ui-image-upload__overlay {
  opacity: 1;
}
</style>
