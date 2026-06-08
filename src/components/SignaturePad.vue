<template>
  <div
    class="relative w-full rounded-lg overflow-hidden border-2 border-dashed transition-colors"
    :class="hasContent ? 'border-green-400 bg-white' : 'border-slate-300 bg-slate-50'"
  >
    <canvas
      ref="canvasRef"
      class="signature-canvas block w-full"
      :height="height"
      :width="canvasWidth"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <!-- Overlay de placeholder -->
    <div
      v-if="!hasContent"
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center text-slate-400">
        <ion-icon :icon="createOutline" class="text-3xl mb-1" />
        <p class="text-xs">Firme aquí</p>
      </div>
    </div>

    <!-- Botón limpiar -->
    <button
      v-if="hasContent"
      type="button"
      class="absolute top-1 right-1 px-2 py-1 text-[11px] font-semibold rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      @click="clear"
    >
      Limpiar
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { createOutline } from 'ionicons/icons';

const props = withDefaults(
  defineProps<{
    /** Altura del canvas en píxeles lógicos */
    height?: number;
  }>(),
  { height: 160 }
);

const emit = defineEmits<{
  (e: 'change', hasContent: boolean): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(0);
const hasContent = ref(false);

let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  // Ajustar el ancho físico al ancho CSS para nitidez en pantallas HiDPI
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(props.height * dpr);
  canvasWidth.value = rect.width;
  ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
  }
}

function getPos(evt: PointerEvent) {
  const canvas = canvasRef.value!;
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function onPointerDown(evt: PointerEvent) {
  if (!ctx) return;
  drawing = true;
  const { x, y } = getPos(evt);
  lastX = x;
  lastY = y;
  // Punto inicial
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 0.1, y + 0.1);
  ctx.stroke();
  // Capturar pointer para no perder el trazo fuera del canvas
  (evt.target as Element).setPointerCapture?.(evt.pointerId);
  evt.preventDefault();
}

function onPointerMove(evt: PointerEvent) {
  if (!drawing || !ctx) return;
  const { x, y } = getPos(evt);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
  if (!hasContent.value) {
    hasContent.value = true;
    emit('change', true);
  }
}

function onPointerUp() {
  if (!drawing) return;
  drawing = false;
}

function clear() {
  if (!ctx || !canvasRef.value) return;
  const canvas = canvasRef.value;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  hasContent.value = false;
  emit('change', false);
}

function toDataURL(): string {
  return canvasRef.value?.toDataURL('image/png') || '';
}

defineExpose({ toDataURL, clear });

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  resizeCanvas();
  resizeObserver = new ResizeObserver(() => resizeCanvas());
  if (canvasRef.value) {
    resizeObserver.observe(canvasRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>
