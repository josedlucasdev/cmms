<template>
  <AppCard padding="md" :hoverable="hoverable" class="relative overflow-hidden">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {{ label }}
        </p>
        <p class="mt-1.5 text-2xl font-bold tabular-nums text-zinc-900 truncate">
          <slot name="value">{{ value }}</slot>
        </p>
        <p v-if="hint || $slots.hint" class="mt-1 text-[11px] text-zinc-500">
          <slot name="hint">{{ hint }}</slot>
        </p>
      </div>
      <div
        v-if="icon"
        class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        :style="{ backgroundColor: iconBg, color: iconColor }"
      >
        <ion-icon :icon="icon" class="text-lg" />
      </div>
    </div>
    <div v-if="trend !== undefined" class="mt-3 flex items-center gap-1 text-[11px] font-semibold">
      <ion-icon
        :icon="trend >= 0 ? trendingUpOutline : trendingDownOutline"
        :class="trend >= 0 ? 'text-green-600' : 'text-red-600'"
      />
      <span :class="trend >= 0 ? 'text-green-700' : 'text-red-700'">
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-zinc-500 font-normal">vs. mes anterior</span>
    </div>
  </AppCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { trendingUpOutline, trendingDownOutline } from 'ionicons/icons';
import AppCard from '@/components/common/AppCard.vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value?: string | number;
    hint?: string;
    icon?: string;
    iconColor?: string;
    iconBg?: string;
    trend?: number;
    hoverable?: boolean;
  }>(),
  {
    value: '',
    hint: '',
    iconColor: '#3A5CFF',
    iconBg: 'rgba(58, 92, 255, 0.12)',
  },
);
</script>
