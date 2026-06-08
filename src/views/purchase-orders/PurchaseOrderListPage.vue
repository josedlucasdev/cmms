<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Órdenes de compra con vínculo contable a proyectos</p>
      <ion-button color="primary" router-link="/purchase-orders/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" /> Nueva OC
      </ion-button>
    </div>
    <DataTable
      :columns="columns"
      :rows="orders"
      :row-key="(o) => o.id"
      @row-click="(o) => $router.push(`/purchase-orders/${o.id}`)"
    >
      <template #cell-number="{ value }">
        <span class="font-mono text-xs font-semibold">{{ value }}</span>
      </template>
      <template #cell-supplierName="{ row }">
        <span class="text-sm">{{ supplierName(row.supplierId) }}</span>
      </template>
      <template #cell-totalCost="{ row }">
        <CurrencyDisplay :amount="row.totalCost" :currency="row.currency" size="sm" />
      </template>
      <template #cell-status="{ row }">
        <StatusChip :status="row.status" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { purchaseOrdersService, suppliersService } from '@/services/db';
import type { PurchaseOrder, Supplier } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';

const session = useSessionStore();
const orders = ref<PurchaseOrder[]>([]);
const suppliers = ref<Supplier[]>([]);

const columns = [
  { key: 'number', label: 'Número' },
  { key: 'supplierName', label: 'Proveedor' },
  { key: 'totalCost', label: 'Total', align: 'right' as const },
  { key: 'status', label: 'Estado' },
  { key: 'expectedDelivery', label: 'Entrega' },
];

function supplierName(id: string): string {
  return suppliers.value.find((s) => s.id === id)?.name ?? '—';
}

onMounted(async () => {
  orders.value = await purchaseOrdersService.list(session.tenantId);
  suppliers.value = await suppliersService.list(session.tenantId);
});
</script>
