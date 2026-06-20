<template>
  <div class="ui-image-upload">
    <label v-if="label" class="ui-image-upload__label">{{ label }}</label>

    <input
      type="file"
      ref="galleryInput"
      class="ui-image-upload__input"
      accept="image/*"
      @change="(event) => handleFileChange(event, 'gallery')"
    />
    
    <div 
      class="ui-image-upload__dropzone"
      :class="{ 'ui-image-upload__dropzone--has-image': previewUrl }"
      @click="toggleSourceOptions"
    >
      <div v-if="!previewUrl" class="ui-image-upload__placeholder">
        <component :is="CameraIcon" class="ui-image-upload__icon" />
        <span>{{ placeholder }}</span>
        <small class="ui-image-upload__hint">Toca para elegir camara o galeria</small>
      </div>
      
      <div v-else class="ui-image-upload__preview">
        <img :src="previewUrl" alt="Vista previa" class="ui-image-upload__img" />
      </div>

      <Transition name="image-options-fade">
        <div v-if="showSourceOptions" class="ui-image-upload__source-picker" @click.stop>
          <UiButton 
            label="Camara"
            size="sm" 
            color="read" 
            icon="camera" 
            @click.stop="selectCamera"
          />
          <UiButton 
            label="Galeria"
            size="sm" 
            color="info" 
            icon="image" 
            @click.stop="selectGallery"
          />
        </div>
      </Transition>
    </div>

    <div class="ui-image-upload__footer">
      <UiButton 
        v-if="previewUrl"
        label="Imagen"
        size="sm" 
        color="delete" 
        icon="trash" 
        @click.stop="removeImage"
      />
      <UiButton 
        label="Cambiar"
        size="sm" 
        color="edit" 
        icon="refresh-cw" 
        @click.stop="toggleSourceOptions"
      />
      <UiButton 
        v-if="previewUrl && isNewImage"
        size="sm" 
        color="create" 
        icon="save" 
        label="Imagen"
        @click.stop="saveImage"
      />
    </div>

    <div v-if="cameraError" class="ui-image-upload__error">
      {{ cameraError }}
    </div>

    <div v-if="showCamera" class="ui-image-upload__camera-overlay">
      <div class="ui-image-upload__camera-panel">
        <div class="ui-image-upload__camera-header">
          <span>Camara del dispositivo</span>
        </div>
        <video ref="videoRef" class="ui-image-upload__camera-video" autoplay playsinline muted></video>
        <canvas ref="captureCanvasRef" class="ui-image-upload__capture-canvas"></canvas>
        <div class="ui-image-upload__camera-actions">
          <UiButton label="Cancelar" size="sm" color="info" @click="closeCamera" />
          <UiButton label="Capturar" size="sm" color="create" icon="camera" @click="capturePhoto" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { Camera } from 'lucide-vue-next'
import UiButton from './UiButton.vue'

const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccionar imagen' },
  modelValue: { type: [File, String], default: null }
})

const emit = defineEmits(['update:modelValue', 'change', 'save', 'remove'])

const galleryInput = ref(null)
const videoRef = ref(null)
const captureCanvasRef = ref(null)
const previewUrl = ref(null)
const isNewImage = ref(false)
const showSourceOptions = ref(false)
const showCamera = ref(false)
const cameraError = ref('')
let mediaStream = null

const CameraIcon = Camera

// Manejar cambios en el modelValue (por ejemplo, si viene una URL del backend)
watch(() => props.modelValue, (newVal) => {
  if (typeof newVal === 'string') {
    previewUrl.value = newVal
    isNewImage.value = newVal.startsWith('data:image/')
  } else if (!newVal) {
    previewUrl.value = null
    isNewImage.value = false
  }
}, { immediate: true })

function openCamera() {
  startCamera()
}

function openGallery() {
  cameraError.value = ''
  galleryInput.value?.click()
}

function toggleSourceOptions() {
  showSourceOptions.value = !showSourceOptions.value
}

function selectCamera() {
  showSourceOptions.value = false
  openCamera()
}

function selectGallery() {
  showSourceOptions.value = false
  openGallery()
}

async function startCamera() {
  cameraError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Este dispositivo o navegador no permite acceso directo a la camara.'
    return
  }

  try {
    stopCameraStream()

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }
      },
      audio: false
    })

    showCamera.value = true
    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()
    }
  } catch (error) {
    console.error('No se pudo acceder a la camara:', error)
    cameraError.value = 'No se pudo activar la camara. Verifique los permisos del navegador o use la galeria.'
    stopCameraStream()
  }
}

function closeCamera() {
  showCamera.value = false
  stopCameraStream()
}

function stopCameraStream() {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.srcObject = null
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
}

function capturePhoto() {
  if (!videoRef.value || !captureCanvasRef.value) return

  const video = videoRef.value
  const canvas = captureCanvasRef.value
  const width = video.videoWidth || 1280
  const height = video.videoHeight || 720

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.drawImage(video, 0, 0, width, height)

  const image = canvas.toDataURL('image/png')
  previewUrl.value = image
  isNewImage.value = true
  showSourceOptions.value = false
  emit('update:modelValue', image)
  emit('change', { image, source: 'camera' })
  closeCamera()
}

function handleFileChange(event, source) {
  const file = event.target.files[0]
  if (!file) return

  cameraError.value = ''

  // Crear vista previa
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
    isNewImage.value = true
    showSourceOptions.value = false
    emit('update:modelValue', e.target.result)
    emit('change', { image: e.target.result, source })
  }
  reader.readAsDataURL(file)

  event.target.value = ''
}

function removeImage() {
  emit('remove')
}

function saveImage() {
  if (previewUrl.value && isNewImage.value) {
    emit('save', previewUrl.value)
  }
}

onBeforeUnmount(() => {
  stopCameraStream()
})
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

.ui-image-upload__hint {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.ui-image-upload__preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.ui-image-upload__source-picker {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
  z-index: 2;
  max-width: calc(100% - 24px);
}

.ui-image-upload__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-image-upload__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;
}

.ui-image-upload__error {
  color: #b91c1c;
  font-size: 0.85rem;
}

.ui-image-upload__camera-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.72);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.ui-image-upload__camera-panel {
  width: min(100%, 720px);
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.28);
}

.ui-image-upload__camera-header {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.ui-image-upload__camera-video {
  width: 100%;
  max-height: 70vh;
  object-fit: cover;
  border-radius: 12px;
  background: #000;
}

.ui-image-upload__capture-canvas {
  display: none;
}

.ui-image-upload__camera-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.image-options-fade-enter-active,
.image-options-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.image-options-fade-enter-from,
.image-options-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@media (max-width: 768px) {
  .ui-image-upload__source-picker {
    width: calc(100% - 24px);
    justify-content: center;
    flex-wrap: wrap;
  }

  .ui-image-upload__camera-panel {
    padding: 12px;
  }

  .ui-image-upload__camera-video {
    max-height: 60vh;
  }

  .ui-image-upload__camera-actions {
    flex-wrap: wrap;
  }
}
</style>
