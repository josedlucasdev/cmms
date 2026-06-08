<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
    :class="containerClass"
  >
    <span
      class="w-1.5 h-1.5 rounded-full"
      :style="{ backgroundColor: dotColor }"
    />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { statusColor, statusLabel } from '@/composables/useFormat';

const props = withDefaults(
  defineProps<{ status: string; label?: string }>(),
  { label: '' },
);

const dotColor = computed(() => statusColor(props.status));
const label = computed(() => props.label || statusLabel(props.status));

const containerClass = computed(() => {
  switch (props.status) {
    case 'pending': return 'bg-amber-50 text-amber-700';
    case 'in_progress': return 'bg-blue-50 text-blue-700';
    case 'stopped': return 'bg-red-50 text-red-700';
    case 'completed': return 'bg-green-50 text-green-700';
    case 'draft': return 'bg-zinc-100 text-zinc-700';
    case 'sent': return 'bg-blue-50 text-blue-700';
    case 'approved': return 'bg-green-50 text-green-700';
    case 'rejected': return 'bg-red-50 text-red-700';
    case 'expired': return 'bg-zinc-100 text-zinc-700';
    case 'received': return 'bg-green-50 text-green-700';
    case 'cancelled': return 'bg-red-50 text-red-700';
    case 'active': return 'bg-green-50 text-green-700';
    case 'planning': return 'bg-blue-50 text-blue-700';
    case 'on_hold': return 'bg-amber-50 text-amber-700';
    default: return 'bg-zinc-100 text-zinc-700';
  }
});
</script>
