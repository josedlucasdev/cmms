<template>
  <div v-if="project" class="p-4 md:p-6 space-y-4 pb-12">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold font-mono">{{ project.code }}</p>
          <h2 class="text-xl font-bold mt-0.5">{{ project.name }}</h2>
          <p class="text-sm opacity-90 mt-1">{{ client?.name ?? '—' }}</p>
          <div
            v-if="project.quoteId"
            class="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/15 backdrop-blur-sm text-[11px] font-semibold"
          >
            <ion-icon :icon="documentTextOutline" class="text-xs" />
            <span>Generado desde cotización</span>
            <router-link
              :to="`/quotes/${project.quoteId}`"
              class="font-mono underline hover:no-underline"
            >{{ sourceQuote?.number ?? '…' }}</router-link>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <StatusChip :status="project.status" />
          <ion-button fill="outline" color="light" size="small" :router-link="`/projects/${project.id}/edit`" class="!font-semibold">
            <ion-icon slot="start" :icon="createOutline" /> Editar
          </ion-button>
        </div>
      </div>
    </AppCard>

    <!-- KPIs del proyecto -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Presupuesto" :icon="walletOutline" hoverable>
        <template #value><CurrencyDisplay :amount="project.budget" :currency="project.currency" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Costo OTs" :icon="constructOutline" icon-color="#F59E0B" icon-bg="rgba(245, 158, 11, 0.12)" hoverable>
        <template #value><CurrencyDisplay :amount="totalOtCost" :currency="project.currency" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Costo Adicional" :icon="addCircleOutline" icon-color="#8B5CF6" icon-bg="rgba(139, 92, 246, 0.12)" hoverable>
        <template #value><CurrencyDisplay :amount="project.additionalCost" :currency="project.currency" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Costo Total" :icon="trendingUpOutline" icon-color="#16A34A" icon-bg="rgba(22, 163, 74, 0.12)" hoverable>
        <template #value><CurrencyDisplay :amount="totalCost" :currency="project.currency" size="lg" /></template>
      </KpiCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <AppCard padding="md" class="lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-bold text-zinc-900">Órdenes de Trabajo</h3>
          <ion-button size="small" fill="outline" :router-link="`/work-orders/new?projectId=${project.id}`" class="!font-semibold">
            <ion-icon slot="start" :icon="addOutline" /> Nueva OT
          </ion-button>
        </div>
        <DataTable
          :columns="woColumns"
          :rows="projectWorkOrders"
          :row-key="(w) => w.id"
          @row-click="(w) => $router.push(`/work-orders/${w.id}`)"
        >
          <template #cell-title="{ row }">
            <div>
              <p class="font-semibold">{{ row.title }}</p>
              <p class="text-[10px] text-zinc-500 font-mono">{{ row.number }}</p>
            </div>
          </template>
          <template #cell-cost="{ row }">
            <CurrencyDisplay :amount="woCost(row)" :currency="row.currency" size="sm" />
          </template>
          <template #cell-status="{ row }"><StatusChip :status="row.status" /></template>
        </DataTable>
      </AppCard>

      <AppCard padding="md">
        <h3 class="text-base font-bold text-zinc-900 mb-3">Información</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-zinc-500">Inicio</dt><dd class="font-semibold">{{ formatDate(project.startDate) }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Fin estimado</dt><dd class="font-semibold">{{ formatDate(project.endDate) }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Progreso</dt><dd class="font-mono font-bold text-primary-700">{{ project.progress }}%</dd></div>
        </dl>
        <div class="mt-3 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700" :style="{ width: project.progress + '%' }" />
        </div>
        <p v-if="project.description" class="mt-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
          {{ project.description }}
        </p>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  createOutline, addOutline, walletOutline, constructOutline,
  addCircleOutline, trendingUpOutline, documentTextOutline,
} from 'ionicons/icons';
import {
  clientsService, projectsService, quotesService, workOrdersService,
} from '@/services/db';
import type { Client, Project, Quote, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import { formatDate } from '@/composables/useFormat';

const route = useRoute();
const session = useSessionStore();
const project = ref<Project | null>(null);
const client = ref<Client | null>(null);
const workOrders = ref<WorkOrder[]>([]);
const sourceQuote = ref<Quote | null>(null);

const projectWorkOrders = computed(() => workOrders.value.filter((w) => w.projectId === project.value?.id));

function woCost(wo: WorkOrder): number {
  return wo.fixedCost + wo.logisticsCost + wo.additionalCost + 250;
}

const totalOtCost = computed(() => projectWorkOrders.value.reduce((s, w) => s + woCost(w), 0));
const totalCost = computed(() => totalOtCost.value + (project.value?.additionalCost ?? 0));

const woColumns = [
  { key: 'title', label: 'OT' },
  { key: 'type', label: 'Tipo' },
  { key: 'priority', label: 'Prioridad' },
  { key: 'cost', label: 'Costo', align: 'right' as const },
  { key: 'status', label: 'Estado' },
];

onMounted(async () => {
  project.value = await projectsService.get(route.params.id as string);
  if (project.value) {
    client.value = await clientsService.get(project.value.clientId);
    workOrders.value = await workOrdersService.list(session.tenantId);
    if (project.value.quoteId) {
      sourceQuote.value = await quotesService.get(project.value.quoteId);
    }
  }
});
</script>
