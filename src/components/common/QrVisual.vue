<template>
  <svg
    :viewBox="`0 0 ${size} ${size}`"
    :width="size"
    :height="size"
    xmlns="http://www.w3.org/2000/svg"
    class="block w-full h-full"
    aria-hidden="true"
  >
    <!-- Fondo blanco -->
    <rect :width="size" :height="size" fill="white" />
    <!-- Patrón generado determinísticamente a partir del string -->
    <g fill="black">
      <rect
        v-for="cell in cells"
        :key="cell.k"
        :x="cell.x"
        :y="cell.y"
        :width="cellSize"
        :height="cellSize"
      />
    </g>
    <!-- Esquinas de referencia tipo QR real -->
    <g fill="white">
      <rect :x="0" :y="0" :width="cornerSize" :height="cornerSize" />
      <rect :x="size - cornerSize" :y="0" :width="cornerSize" :height="cornerSize" />
      <rect :x="0" :y="size - cornerSize" :width="cornerSize" :height="cornerSize" />
    </g>
    <g fill="black">
      <rect :x="cornerInset" :y="cornerInset" :width="cornerInner" :height="cornerInner" />
      <rect :x="size - cornerSize + cornerInset" :y="cornerInset" :width="cornerInner" :height="cornerInner" />
      <rect :x="cornerInset" :y="size - cornerSize + cornerInset" :width="cornerInner" :height="cornerInner" />
    </g>
    <g fill="white">
      <rect :x="cornerCenter" :y="cornerCenter" :width="cornerDot" :height="cornerDot" />
      <rect :x="size - cornerSize + cornerCenter" :y="cornerCenter" :width="cornerDot" :height="cornerDot" />
      <rect :x="cornerCenter" :y="size - cornerSize + cornerCenter" :width="cornerDot" :height="cornerDot" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ value: string; size?: number }>(),
  { size: 120 },
);

// 12×12 grid (suficiente para verse como QR sin libs externas)
const GRID = 12;
const cellSize = computed(() => props.size / GRID);
const cornerSize = computed(() => props.size * 0.26);
const cornerInset = computed(() => props.size * 0.04);
const cornerInner = computed(() => cornerSize.value - cornerInset.value * 2);
const cornerCenter = computed(() => props.size * 0.10);
const cornerDot = computed(() => props.size * 0.06);

/** Hash determinístico del string → matriz de bits */
function hashToBits(s: string, count: number): boolean[] {
  const bits: boolean[] = [];
  let h1 = 5381, h2 = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) | 0;
    h2 = ((h2 * 33) ^ c) | 0;
  }
  for (let i = 0; i < count; i++) {
    const mixed = (h1 ^ (h2 * (i + 1))) >>> 0;
    bits.push(((mixed >> (i % 28)) & 1) === 1);
  }
  return bits;
}

const cells = computed(() => {
  const bits = hashToBits(props.value, GRID * GRID);
  // Excluir las 3 esquinas (que se pintan aparte como "finders")
  const excludeZones = [
    { x0: 0, y0: 0, x1: 4, y1: 4 },
    { x0: GRID - 4, y0: 0, x1: GRID, y1: 4 },
    { x0: 0, y0: GRID - 4, x1: 4, y1: GRID },
  ];
  const out: { x: number; y: number; k: string }[] = [];
  let k = 0;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const inExclude = excludeZones.some((z) => x >= z.x0 && x < z.x1 && y >= z.y0 && y < z.y1);
      if (inExclude) continue;
      if (bits[y * GRID + x]) {
        out.push({ x: x * cellSize.value, y: y * cellSize.value, k: `c${k++}` });
      }
    }
  }
  return out;
});
</script>
