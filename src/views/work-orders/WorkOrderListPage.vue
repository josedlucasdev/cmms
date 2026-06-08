<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">{{ workOrders.length }} OTs · {{ activeCount }} activas</p>
      <ion-button color="primary" router-link="/work-orders/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" /> Nueva OT
      </ion-button>
    </div>

    <DataTable
      :columns="columns"
      :rows="workOrders"
      :row-key="(w) => w.id"
      @row-click="(w) => $router.push(`/work-orders/${w.id}`)"
    >
      <template #cell-title="{ row }">
        <div>
          <p class="text-sm font-semibold text-zinc-900">{{ row.title }}</p>
          <p class="text-[10px] text-zinc-500 font-mono">{{ row.number }}</p>
        </div>
      </template>
      <template #cell-type="{ row }">
        <span class="text-xs font-semibold uppercase">{{ row.type === 'corrective' ? 'Correctivo' : 'Preventivo' }}</span>
      </template>
      <template #cell-priority="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
          :style="{ backgroundColor: priorityColor(row.priority) + '20', color: priorityColor(row.priority) }"
        >{{ row.priority }}</span>
      </template>
      <template #cell-status="{ row }"><StatusChip :status="row.status" /></template>
      <template #cell-scheduledDate="{ value }">
        <span class="text-xs text-zinc-600">{{ formatDate(String(value)) }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { workOrdersService } from '@/services/db';
import type { WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import { formatDate, priorityColor } from '@/composables/useFormat';

const session = useSessionStore();
const workOrders = ref<WorkOrder[]>([]);

const columns = [
  { key: 'title', label: 'OT' },
  { key: 'type', label: 'Tipo' },
  { key: 'priority', label: 'Prioridad' },
  { key: 'status', label: 'Estado' },
  { key: 'scheduledDate', label: 'Programada' },
];

const activeCount = computed(() => workOrders.value.filter((w) => w.status === 'in_progress').length);

onMounted(async () => {
  workOrders.value = await workOrdersService.list(session.tenantId);
});
</script>
