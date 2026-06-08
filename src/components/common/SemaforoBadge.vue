<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
    :style="{ backgroundColor: bgColor, color: '#fff' }"
  >
    <span class="w-2 h-2 rounded-full bg-white/80" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { slaColor } from '@/composables/useFormat';

const props = defineProps<{ remainingHours: number; totalHours: number }>();

const computed_ = computed(() => slaColor(props.remainingHours, props.totalHours));
const bgColor = computed(() => computed_.value.color);
const label = computed(() => computed_.value.label);
</script>
