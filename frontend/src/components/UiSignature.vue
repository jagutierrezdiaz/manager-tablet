<template>
  <div class="signature-container">
    <div v-if="label" class="signature-label">
      <label>{{ label }}</label>
      <UiButton label="Firma" color="delete" icon="trash" size="sm" :disabled="disabled"
        @click="handleClearClick" />
    </div>
    <canvas
      ref="canvasRef"
      class="signature-canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopDrawing"
    ></canvas>
   
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import UiButton from './UiButton.vue'

const props = defineProps({
  modelValue: String,
  label: String,
  width: { type: Number, default: 400 },
  height: { type: Number, default: 200 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'clear'])

const canvasRef = ref(null)
const isDrawing = ref(false)
let ctx = null

onMounted(() => {
  initCanvas()
})

watch(() => props.modelValue, () => {
  drawStoredSignature()
})

function drawStoredSignature() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  if (!props.modelValue) return

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvasRef.value.width, canvasRef.value.height)
  }
  img.onerror = () => {
    console.error('No se pudo cargar la firma:', props.modelValue)
  }
  img.src = props.modelValue
}

function initCanvas() {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  // Ajustar tamaño del canvas al contenedor
  const container = canvas.parentElement
  canvas.width = container.clientWidth || props.width
  canvas.height = props.height
  
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  drawStoredSignature()
}

function startDrawing(e) {
  isDrawing.value = true
  const { x, y } = getCoordinates(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

function draw(e) {
  if (!isDrawing.value) return
  const { x, y } = getCoordinates(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

function stopDrawing() {
  if (!isDrawing.value) return
  isDrawing.value = false
  saveSignature()
}

function handleTouchStart(e) {
  e.preventDefault()
  const touch = e.touches[0]
  startDrawing(touch)
}

function handleTouchMove(e) {
  e.preventDefault()
  const touch = e.touches[0]
  draw(touch)
}

function getCoordinates(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: (e.clientX || e.pageX) - rect.left,
    y: (e.clientY || e.pageY) - rect.top
  }
}

function clear() {
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  emit('update:modelValue', null)
}

function handleClearClick() {
  emit('clear')
}

function saveSignature() {
  const dataUrl = canvasRef.value.toDataURL('image/png')
  emit('update:modelValue', dataUrl)
}

// Re-inicializar si el contenedor cambia de tamaño (opcional)
window.addEventListener('resize', () => {
  if (canvasRef.value) {
    try {
      const temp = canvasRef.value.toDataURL()
      initCanvas()
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = temp
    } catch (e) {
      console.error('Error during canvas resize:', e)
    }
  }
})
</script>

<style scoped>
.signature-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signature-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signature-label label {

  font-size: 1rem;
  font-weight: 800;
  color: var(--color-muted);
}

.signature-canvas {
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #fff;
  cursor: crosshair;
  touch-action: none;
  width: 100%;
}
</style>
