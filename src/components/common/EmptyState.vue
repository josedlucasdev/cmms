<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div
      class="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
      :style="{ backgroundColor: iconBg, color: iconColor }"
    >
      <ion-icon :icon="icon" class="text-3xl" />
    </div>
    <h3 class="text-base font-semibold text-zinc-800">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-zinc-500 max-w-sm">{{ description }}</p>
    <slot name="action" class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    description?: string;
    iconColor?: string;
    iconBg?: string;
  }>(),
  {
    description: '',
    iconColor: '#3A5CFF',
    iconBg: 'rgba(58, 92, 255, 0.12)',
  },
);
</script>
