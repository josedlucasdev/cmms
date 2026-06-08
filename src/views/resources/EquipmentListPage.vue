<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Equipos, tarifas de operación y garantías</p>
      <ion-button color="primary" router-link="/resources/equipment/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" /> Nuevo Equipo
      </ion-button>
    </div>
    <DataTable
      :columns="columns"
      :rows="equipment"
      :row-key="(e) => e.id"
      @row-click="(e) => $router.push(`/resources/equipment/${e.id}`)"
    >
      <template #cell-name="{ row }">
        <div>
          <p class="text-sm font-semibold">{{ row.name }}</p>
          <p class="text-[10px] text-zinc-500 font-mono">{{ row.qrCode }}</p>
        </div>
      </template>
      <template #cell-category="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">{{ row.category }}</span>
      </template>
      <template #cell-hourlyRate="{ row }">
        <CurrencyDisplay :amount="row.hourlyRate" currency="USD" size="sm" />
      </template>
      <template #cell-warranty="{ row }">
        <span
          v-if="row.underWarranty"
          class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700"
        >EN GARANTÍA</span>
        <span v-else class="text-[10px] text-zinc-500">—</span>
      </template>
      <template #cell-status="{ row }">
        <StatusChip :status="row.status" :label="row.status" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { equipmentService } from '@/services/db';
import type { Equipment } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';

const session = useSessionStore();
const equipment = ref<Equipment[]>([]);

const columns = [
  { key: 'name', label: 'Equipo' },
  { key: 'category', label: 'Categoría' },
  { key: 'hourlyRate', label: 'Tarifa/h', align: 'right' as const },
  { key: 'usageHours', label: 'Horas uso', align: 'right' as const },
  { key: 'warranty', label: 'Garantía' },
  { key: 'status', label: 'Estado' },
];

onMounted(async () => {
  equipment.value = await equipmentService.list(session.tenantId);
});
</script>
