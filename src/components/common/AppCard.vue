<template>
  <div
    class="bg-white rounded-2xl border border-zinc-200 shadow-sm"
    :class="[paddingClass, hoverable ? 'transition-shadow hover:shadow-md' : '']"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
  }>(),
  { padding: 'md', hoverable: false },
);

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'none': return '';
    case 'sm': return 'p-3';
    case 'lg': return 'p-6';
    default: return 'p-4';
  }
});
</script>
