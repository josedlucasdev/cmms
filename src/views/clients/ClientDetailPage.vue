<template>
  <div v-if="client" class="p-4 md:p-6 space-y-4 pb-12">
    <!-- Header -->
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-start justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shrink-0"
          >
            {{ initials(client.name) }}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold">Cliente</p>
            <h2 class="text-xl font-bold truncate">{{ client.name }}</h2>
            <p class="text-sm opacity-90 mt-0.5">{{ client.industry }} · {{ client.city }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <ion-button fill="outline" color="light" :router-link="`/clients/${client.id}/edit`" class="!font-semibold">
            <ion-icon slot="start" :icon="createOutline" /> Editar
          </ion-button>
          <ion-button color="light" :router-link="`/quotes/new?clientId=${client.id}`" class="!font-semibold">
            <ion-icon slot="start" :icon="documentTextOutline" /> Nueva Cotización
          </ion-button>
        </div>
      </div>
    </AppCard>

    <!-- Tabs -->
    <div class="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
        :class="activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <div v-if="activeTab === 'info'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AppCard padding="md">
          <h3 class="text-sm font-bold text-zinc-800 mb-3">Datos fiscales</h3>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-zinc-500">RIF</dt><dd class="font-mono font-semibold">{{ client.taxId }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-500">Email</dt><dd class="font-semibold">{{ client.email ?? '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-500">Teléfono</dt><dd class="font-semibold">{{ client.phone ?? '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-500">Dirección</dt><dd class="font-semibold text-right max-w-[60%]">{{ client.address ?? '—' }}</dd></div>
          </dl>
        </AppCard>
        <AppCard padding="md">
          <h3 class="text-sm font-bold text-zinc-800 mb-3">SLA Contractual</h3>
          <div v-if="sla" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-zinc-600">Nivel</span>
              <span class="text-sm font-bold uppercase tracking-wider">{{ sla.level }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-zinc-600">Tiempo de respuesta</span>
              <span class="text-sm font-mono font-bold">{{ sla.responseTimeHours }}h</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-zinc-600">Tiempo de resolución</span>
              <span class="text-sm font-mono font-bold">{{ sla.resolutionTimeHours }}h</span>
            </div>
          </div>
          <p v-else class="text-sm text-zinc-500">Sin SLA configurado.</p>
        </AppCard>
      </div>
    </div>

    <div v-if="activeTab === 'contacts'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AppCard v-for="c in client.contacts" :key="c.id" padding="md">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
            {{ initials(c.fullName) }}
          </div>
          <div>
            <p class="text-sm font-bold text-zinc-900">{{ c.fullName }}</p>
            <p class="text-xs text-zinc-500">{{ c.position }}</p>
            <p class="text-xs text-zinc-600 mt-1">{{ c.email }}</p>
            <p class="text-xs text-zinc-600">{{ c.phone }}</p>
          </div>
        </div>
      </AppCard>
    </div>

    <div v-if="activeTab === 'projects'">
      <DataTable
        :columns="projectColumns"
        :rows="clientProjects"
        :row-key="(p) => p.id"
        @row-click="(p) => $router.push(`/projects/${p.id}`)"
      >
        <template #cell-budget="{ row }">
          <CurrencyDisplay :amount="row.budget" currency="USD" size="sm" />
        </template>
        <template #cell-status="{ row }">
          <StatusChip :status="row.status" />
        </template>
      </DataTable>
    </div>

    <div v-if="activeTab === 'work-orders'">
      <DataTable
        :columns="woColumns"
        :rows="clientWorkOrders"
        :row-key="(w) => w.id"
        @row-click="(w) => $router.push(`/work-orders/${w.id}`)"
      >
        <template #cell-title="{ row }">
          <div>
            <p class="font-semibold">{{ row.title }}</p>
            <p class="text-[10px] text-zinc-500 font-mono">{{ row.number }}</p>
          </div>
        </template>
        <template #cell-priority="{ row }">
          <StatusChip :status="row.priority" :label="row.priority" />
        </template>
        <template #cell-status="{ row }">
          <StatusChip :status="row.status" />
        </template>
      </DataTable>
    </div>
  </div>
  <div v-else class="p-12 text-center text-zinc-500">
    <ion-spinner name="crescent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { createOutline, documentTextOutline } from 'ionicons/icons';
import {
  clientsService,
  projectsService,
  slasService,
  workOrdersService,
} from '@/services/db';
import type { Client, Project, SlaConfig, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import { initials } from '@/composables/useFormat';

const route = useRoute();
const session = useSessionStore();
const client = ref<Client | null>(null);
const sla = ref<SlaConfig | null>(null);
const projects = ref<Project[]>([]);
const workOrders = ref<WorkOrder[]>([]);

type TabKey = 'info' | 'contacts' | 'projects' | 'work-orders';
const activeTab = ref<TabKey>('info');

const tabs: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Información' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'projects', label: 'Proyectos' },
  { key: 'work-orders', label: 'Órdenes de Trabajo' },
];

const clientProjects = computed(() => projects.value.filter((p) => p.clientId === client.value?.id));
const clientWorkOrders = computed(() => workOrders.value.filter((w) => w.clientId === client.value?.id));

const projectColumns = [
  { key: 'name', label: 'Proyecto' },
  { key: 'code', label: 'Código' },
  { key: 'budget', label: 'Presupuesto', align: 'right' as const },
  { key: 'progress', label: 'Avance' },
  { key: 'status', label: 'Estado' },
];

const woColumns = [
  { key: 'title', label: 'OT' },
  { key: 'type', label: 'Tipo' },
  { key: 'priority', label: 'Prioridad' },
  { key: 'status', label: 'Estado' },
];

onMounted(async () => {
  const id = route.params.id as string;
  client.value = await clientsService.get(id);
  sla.value = await slasService.getByClient(id);
  projects.value = await projectsService.list(session.tenantId);
  workOrders.value = await workOrdersService.list(session.tenantId);
});
</script>
