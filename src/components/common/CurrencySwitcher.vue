<template>
  <div
    class="inline-flex items-center gap-0.5 bg-zinc-100 rounded-lg p-0.5 text-xs font-semibold"
  >
    <button
      v-for="c in currencies"
      :key="c"
      class="px-2.5 py-1 rounded-md transition-all"
      :class="c === modelValue ? 'bg-white text-primary-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
      @click="$emit('update:modelValue', c)"
    >
      {{ c }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Currency } from '@/types/domain';

defineProps<{ modelValue: Currency }>();
defineEmits<{ (e: 'update:modelValue', c: Currency): void }>();

const currencies: Currency[] = ['USD', 'EUR', 'VES'];
</script>
