<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Cotizaciones con cálculo automático y compartición omnicanal</p>
      <ion-button color="primary" router-link="/quotes/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" />
        Nueva Cotización
      </ion-button>
    </div>

    <DataTable
      :columns="columns"
      :rows="quotes"
      :row-key="(q) => q.id"
      @row-click="(q) => $router.push(`/quotes/${q.id}`)"
    >
      <template #cell-number="{ value }">
        <span class="font-mono text-xs font-semibold">{{ value }}</span>
      </template>
      <template #cell-clientName="{ row }">
        <span class="text-sm font-semibold">{{ clientName(row.clientId) }}</span>
      </template>
      <template #cell-total="{ row }">
        <CurrencyDisplay :amount="quoteTotal(row)" :currency="row.currency" size="sm" />
      </template>
      <template #cell-status="{ row }">
        <StatusChip :status="row.status" />
      </template>
      <template #cell-validUntil="{ value }">
        <span class="text-xs text-zinc-600">{{ formatDate(String(value)) }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { clientsService, quotesService } from '@/services/db';
import type { Client, Quote } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import { formatDate } from '@/composables/useFormat';

const session = useSessionStore();
const quotes = ref<Quote[]>([]);
const clients = ref<Client[]>([]);

const columns = [
  { key: 'number', label: 'Número' },
  { key: 'clientName', label: 'Cliente' },
  { key: 'total', label: 'Total', align: 'right' as const },
  { key: 'status', label: 'Estado' },
  { key: 'validUntil', label: 'Válida hasta' },
];

function clientName(id: string): string {
  return clients.value.find((c) => c.id === id)?.name ?? '—';
}

function quoteTotal(q: Quote): number {
  const subtotal = q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  return subtotal * (1 + q.taxPercent / 100);
}

onMounted(async () => {
  quotes.value = await quotesService.list(session.tenantId);
  clients.value = await clientsService.list(session.tenantId);
});
</script>
