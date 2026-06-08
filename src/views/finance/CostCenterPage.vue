<template>
  <div class="p-4 md:p-6 space-y-4 pb-12">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Métricas financieras en cascada · Cliente → Proyecto → OT → Tarea</p>
      <CurrencySwitcher :model-value="preferred" @update:model-value="setPreferred" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Total Gastado" :icon="walletOutline" hoverable :trend="4.2">
        <template #value><CurrencyDisplay :amount="totalSpent" currency="USD" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Pendiente por Pagar" :icon="timeOutline" icon-color="#F59E0B" icon-bg="rgba(245, 158, 11, 0.12)" hoverable :trend="-2.1">
        <template #value><CurrencyDisplay :amount="totalSpent * 0.3" currency="USD" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Total Pagado" :icon="checkmarkDoneCircleOutline" icon-color="#16A34A" icon-bg="rgba(22, 163, 74, 0.12)" hoverable :trend="1.8">
        <template #value><CurrencyDisplay :amount="totalSpent * 0.7" currency="USD" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Margen" :icon="trendingUpOutline" icon-color="#8B5CF6" icon-bg="rgba(139, 92, 246, 0.12)" hoverable :trend="6.4">
        <template #value><CurrencyDisplay :amount="margin" currency="USD" size="lg" /></template>
      </KpiCard>
    </div>

    <!-- Cascada por cliente / proyecto -->
    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Cascada de costos por cliente</h3>
      <div class="space-y-3">
        <div v-for="client in clientBreakdown" :key="client.id" class="border border-zinc-200 rounded-xl overflow-hidden">
          <div class="px-3 py-2.5 bg-zinc-50 flex items-center justify-between">
            <p class="text-sm font-bold text-zinc-900">{{ client.name }}</p>
            <CurrencyDisplay :amount="client.total" currency="USD" size="sm" />
          </div>
          <div class="px-3 py-2 space-y-1">
            <div v-for="p in client.projects" :key="p.id" class="flex items-center justify-between text-xs pl-3 border-l-2 border-primary-200">
              <span class="text-zinc-600">{{ p.name }}</span>
              <span class="font-mono font-semibold text-zinc-700">
                US$ {{ p.total.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { IonIcon } from '@ionic/vue';
import {
  walletOutline, timeOutline, checkmarkDoneCircleOutline, trendingUpOutline,
} from 'ionicons/icons';
import { useCurrencyStore } from '@/stores/currency';
import { useSessionStore } from '@/stores/session';
import {
  clientsService, projectsService, workOrdersService,
} from '@/services/db';
import type { Client, Project, WorkOrder } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import CurrencySwitcher from '@/components/common/CurrencySwitcher.vue';

const session = useSessionStore();
const currency = useCurrencyStore();
const { preferred } = storeToRefs(currency);

const clients = ref<Client[]>([]);
const projects = ref<Project[]>([]);
const workOrders = ref<WorkOrder[]>([]);

const totalSpent = computed(() => workOrders.value.reduce((s, w) => s + woCost(w), 0));
const margin = computed(() => totalSpent.value * 0.22);

function woCost(wo: WorkOrder): number {
  return wo.fixedCost + wo.logisticsCost + wo.additionalCost + 200;
}

const clientBreakdown = computed(() =>
  clients.value.map((c) => {
    const projectsOfClient = projects.value.filter((p) => p.clientId === c.id);
    return {
      ...c,
      total: projectsOfClient.reduce((s, p) => {
        const wos = workOrders.value.filter((w) => w.projectId === p.id);
        return s + wos.reduce((s2, w) => s2 + woCost(w), 0) + p.additionalCost;
      }, 0),
      projects: projectsOfClient.map((p) => ({
        ...p,
        total: workOrders.value
          .filter((w) => w.projectId === p.id)
          .reduce((s, w) => s + woCost(w), 0) + p.additionalCost,
      })),
    };
  }),
);

function setPreferred(c: 'USD' | 'EUR' | 'VES') { currency.setPreferred(c); }

onMounted(async () => {
  clients.value = await clientsService.list(session.tenantId);
  projects.value = await projectsService.list(session.tenantId);
  workOrders.value = await workOrdersService.list(session.tenantId);
});
</script>
