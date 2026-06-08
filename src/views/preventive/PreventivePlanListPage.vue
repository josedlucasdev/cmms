<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Planes preventivos automáticos</p>
      <ion-button fill="outline" router-link="/preventive/calendar" class="!font-semibold">
        <ion-icon slot="start" :icon="calendarOutline" /> Ver calendario
      </ion-button>
    </div>

    <DataTable
      :columns="columns"
      :rows="plans"
      :row-key="(p) => p.id"
      @row-click="(p) => $router.push(`/preventive/plans/${p.id}`)"
    >
      <template #cell-name="{ row }">
        <div>
          <p class="text-sm font-semibold">{{ row.name }}</p>
          <p class="text-[10px] text-zinc-500">{{ equipmentName(row.equipmentId) }}</p>
        </div>
      </template>
      <template #cell-frequency="{ row }">
        <span class="text-xs font-semibold">cada {{ row.frequencyValue }} {{ row.frequencyUnit }}</span>
      </template>
      <template #cell-nextTrigger="{ value }">
        <span class="text-xs text-zinc-600">{{ formatDate(String(value)) }}</span>
      </template>
      <template #cell-active="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="row.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'"
        >{{ row.active ? 'ACTIVO' : 'INACTIVO' }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { calendarOutline } from 'ionicons/icons';
import { equipmentService, preventiveService } from '@/services/db';
import type { Equipment, PreventivePlan } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import { formatDate } from '@/composables/useFormat';

const session = useSessionStore();
const plans = ref<PreventivePlan[]>([]);
const equipment = ref<Equipment[]>([]);

const columns = [
  { key: 'name', label: 'Plan' },
  { key: 'frequency', label: 'Frecuencia' },
  { key: 'nextTrigger', label: 'Próximo disparo' },
  { key: 'active', label: 'Estado' },
];

function equipmentName(id: string): string {
  return equipment.value.find((e) => e.id === id)?.name ?? '—';
}

onMounted(async () => {
  plans.value = await preventiveService.list(session.tenantId);
  equipment.value = await equipmentService.list(session.tenantId);
});
</script>
