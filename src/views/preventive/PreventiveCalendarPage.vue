<template>
  <div class="p-4 md:p-6 space-y-4">
    <p class="text-sm text-zinc-500">Calendario de próximos mantenimientos preventivos</p>
    <AppCard padding="md">
      <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-500 mb-2">
        <div v-for="d in ['L', 'M', 'M', 'J', 'V', 'S', 'D']" :key="d">{{ d }}</div>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="cell in calendarCells"
          :key="cell.key"
          class="aspect-square rounded-md border border-zinc-100 p-1 flex flex-col items-center text-xs"
          :class="cell.isToday ? 'bg-primary-50 border-primary-300' : 'bg-white'"
        >
          <span :class="cell.isToday ? 'font-bold text-primary-700' : 'text-zinc-700'">{{ cell.day }}</span>
          <div v-if="cell.plans.length" class="mt-0.5 flex flex-col items-center gap-0.5 w-full">
            <span
              v-for="p in cell.plans"
              :key="p"
              class="w-full truncate text-[8px] font-bold text-white px-1 py-0.5 rounded"
              :style="{ backgroundColor: '#3A5CFF' }"
            >{{ p }}</span>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { preventiveService } from '@/services/db';
import type { PreventivePlan } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';

const session = useSessionStore();
const plans = ref<PreventivePlan[]>([]);

const today = new Date();

const calendarCells = computed(() => {
  const cells: { key: string; day: number; isToday: boolean; plans: string[] }[] = [];
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `b${i}`, day: 0, isToday: false, plans: [] });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    const planNames = plans.value
      .filter((p) => {
        const pd = new Date(p.nextTriggerAt);
        return pd.getDate() === d && pd.getMonth() === today.getMonth();
      })
      .map((p) => p.name.split(' - ')[1]?.slice(0, 6) ?? 'OT');
    cells.push({
      key: `d${d}`,
      day: d,
      isToday: d === today.getDate(),
      plans: planNames,
    });
  }
  return cells;
});

onMounted(async () => {
  plans.value = await preventiveService.list(session.tenantId);
});
</script>
