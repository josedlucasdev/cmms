<template>
  <div class="p-4 md:p-6 space-y-5 pb-12">
    <!-- Saludo -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-zinc-900 tracking-tight">
          Hola, {{ firstName }} 👋
        </h2>
        <p class="text-sm text-zinc-500">
          {{ todayString }} — {{ pendingCount }} tareas pendientes, {{ activeOtCount }} OTs activas
        </p>
      </div>
      <div class="flex items-center gap-2">
        <ion-button
          fill="outline"
          size="small"
          router-link="/work-orders"
          class="!font-semibold"
        >
          <ion-icon slot="start" :icon="constructOutline" />
          Ver OTs
        </ion-button>
        <ion-button
          size="small"
          color="primary"
          router-link="/work-orders/new"
          class="!font-semibold"
        >
          <ion-icon slot="start" :icon="addOutline" />
          Nueva OT
        </ion-button>
      </div>
    </div>

    <!-- KPIs financieros -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Total Gastado"
        :icon="walletOutline"
        :trend="4.2"
        hint="Incluye logística e inventario"
        hoverable
      >
        <template #value>
          <CurrencyDisplay :amount="totalSpent" currency="USD" size="lg" />
        </template>
      </KpiCard>
      <KpiCard
        label="Pendiente por Pagar"
        :icon="timeOutline"
        icon-color="#F59E0B"
        icon-bg="rgba(245, 158, 11, 0.12)"
        :trend="-2.1"
        hoverable
      >
        <template #value>
          <CurrencyDisplay :amount="pendingPayment" currency="USD" size="lg" />
        </template>
      </KpiCard>
      <KpiCard
        label="Total Pagado"
        :icon="checkmarkDoneCircleOutline"
        icon-color="#16A34A"
        icon-bg="rgba(22, 163, 74, 0.12)"
        :trend="1.8"
        hoverable
      >
        <template #value>
          <CurrencyDisplay :amount="paid" currency="USD" size="lg" />
        </template>
      </KpiCard>
      <KpiCard
        label="Margen Actual"
        :icon="trendingUpOutline"
        icon-color="#8B5CF6"
        icon-bg="rgba(139, 92, 246, 0.12)"
        :trend="6.4"
        hoverable
      >
        <template #value>
          <CurrencyDisplay :amount="margin" currency="USD" size="lg" />
        </template>
      </KpiCard>
    </div>

    <!-- Gráficos + Semáforo SLAs -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <!-- Gráfico de barras gastos por mes -->
      <AppCard padding="md" class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Gastos por mes</p>
            <h3 class="text-base font-bold text-zinc-900">Tendencia de los últimos 6 meses</h3>
          </div>
          <CurrencySwitcher :model-value="preferred" @update:model-value="setPreferred" />
        </div>
        <div class="flex items-end gap-2 h-44">
          <div
            v-for="m in monthlyData"
            :key="m.month"
            class="flex-1 flex flex-col items-center gap-1.5 group"
          >
            <div class="text-[10px] font-mono font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {{ m.formatted }}
            </div>
            <div
              class="w-full rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500 group-hover:from-primary-700 group-hover:to-primary-500"
              :style="{ height: m.height + '%' }"
            />
            <div class="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {{ m.label }}
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Semáforo SLAs -->
      <AppCard padding="md">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Estado de SLAs
        </p>
        <div class="space-y-2.5">
          <div
            v-for="sla in slaList"
            :key="sla.clientId"
            class="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
            @click="goToClient(sla.clientId)"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-zinc-800 truncate">{{ sla.clientName }}</p>
              <p class="text-[10px] text-zinc-500 font-mono">{{ sla.hoursRemaining }}h restantes</p>
            </div>
            <SemaforoBadge :remaining-hours="sla.hoursRemaining" :total-hours="sla.totalHours" />
          </div>
        </div>
        <router-link
          to="/clients"
          class="block mt-3 text-center text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          Ver todos los SLAs →
        </router-link>
      </AppCard>
    </div>

    <!-- OTs recientes + Actividad reciente -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <AppCard padding="md" class="lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-bold text-zinc-900">Órdenes de Trabajo recientes</h3>
          <router-link to="/work-orders" class="text-xs font-semibold text-primary-600 hover:text-primary-700">
            Ver todas →
          </router-link>
        </div>
        <div class="space-y-1.5">
          <div
            v-for="wo in recentWorkOrders"
            :key="wo.id"
            class="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
            @click="$router.push(`/work-orders/${wo.id}`)"
          >
            <div
              class="w-1 self-stretch rounded-full"
              :style="{ backgroundColor: priorityColor(wo.priority) }"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-zinc-800 truncate">{{ wo.title }}</p>
              <p class="text-[11px] text-zinc-500 font-mono">{{ wo.number }} · {{ clientName(wo.clientId) }}</p>
            </div>
            <StatusChip :status="wo.status" />
            <div class="hidden sm:block">
              <CurrencyDisplay :amount="woCost(wo)" currency="USD" size="sm" />
            </div>
          </div>
        </div>
      </AppCard>

      <AppCard padding="md">
        <h3 class="text-base font-bold text-zinc-900 mb-3">Feed de actividad</h3>
        <div class="space-y-3 relative">
          <div class="absolute left-2 top-1 bottom-1 w-px bg-zinc-200" />
          <div v-for="log in recentLogs" :key="log.id" class="flex items-start gap-2 relative pl-6">
            <div
              class="absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: actionColor(log.action) }"
            >
              <ion-icon :icon="actionIcon(log.action)" class="text-[10px] text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-zinc-700 leading-tight">
                <span class="font-bold">{{ log.userName }}</span> {{ actionVerb(log.action) }}
                <span class="font-semibold">{{ log.entity }}</span>
              </p>
              <p class="text-[10px] text-zinc-400 mt-0.5">{{ formatRelative(log.timestamp) }}</p>
            </div>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Accesos rápidos -->
    <div>
      <h3 class="text-base font-bold text-zinc-900 mb-3">Accesos rápidos</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <button
          v-for="qa in quickActions"
          :key="qa.label"
          class="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-zinc-200 hover:border-primary-300 hover:shadow-md transition-all"
          @click="$router.push(qa.to)"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: qa.bg, color: qa.color }"
          >
            <ion-icon :icon="qa.icon" class="text-xl" />
          </div>
          <p class="text-xs font-semibold text-zinc-700 text-center">{{ qa.label }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { IonIcon, IonButton } from '@ionic/vue';
import {
  walletOutline,
  timeOutline,
  checkmarkDoneCircleOutline,
  trendingUpOutline,
  constructOutline,
  addOutline,
  documentTextOutline,
  businessOutline,
  briefcaseOutline,
  layersOutline,
  peopleOutline,
  cubeOutline,
  storefrontOutline,
  createOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  trashOutline,
  checkmarkDoneOutline,
} from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { useCurrencyStore } from '@/stores/currency';
import { useNetworkStore } from '@/stores/network';
import { useNotificationStore } from '@/stores/notification';
import {
  auditService,
  clientsService,
  slasService,
  tasksService,
  workOrdersService,
} from '@/services/db';
import type { AuditLog, Client, SlaConfig, WorkOrder } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import CurrencySwitcher from '@/components/common/CurrencySwitcher.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import SemaforoBadge from '@/components/common/SemaforoBadge.vue';
import { formatRelative, priorityColor } from '@/composables/useFormat';

const router = useRouter();
const session = useSessionStore();
const tenant = useTenantStore();
const currency = useCurrencyStore();
const network = useNetworkStore();
const notify = useNotificationStore();
const { preferred } = storeToRefs(currency);

const workOrders = ref<WorkOrder[]>([]);
const clients = ref<Client[]>([]);
const slas = ref<SlaConfig[]>([]);
const logs = ref<AuditLog[]>([]);
const taskCounts = ref<Record<string, number>>({});

const firstName = computed(() => session.user?.fullName.split(' ')[0] ?? 'Usuario');
const todayString = new Date().toLocaleDateString('es-VE', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
});

const recentWorkOrders = computed(() => workOrders.value.slice(0, 5));

const recentLogs = computed(() => logs.value.slice(0, 8));

const activeOtCount = computed(() => workOrders.value.filter((w) => w.status === 'in_progress').length);
const pendingCount = computed(() => Object.values(taskCounts.value).reduce((s, n) => s + n, 0));

const totalSpent = computed(() => workOrders.value.reduce((s, w) => s + woCost(w), 0));
const pendingPayment = computed(() => totalSpent.value * 0.3);
const paid = computed(() => totalSpent.value * 0.7);
const margin = computed(() => totalSpent.value * 0.22);

const monthlyData = computed(() => {
  // Simulación: 6 meses decrecientes
  const months = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
  const values = [38000, 42000, 39500, 51000, 48500, 55000];
  const max = Math.max(...values);
  return months.map((m, i) => ({
    month: m,
    label: m,
    value: values[i],
    height: (values[i] / max) * 100,
    formatted: currency.format(values[i]),
  }));
});

const slaList = computed(() =>
  slas.value.slice(0, 6).map((s) => {
    const c = clients.value.find((cl) => cl.id === s.clientId);
    return {
      ...s,
      clientName: c?.name ?? '—',
      hoursRemaining: Math.max(0, Math.floor(s.resolutionTimeHours * (0.1 + Math.random() * 0.8))),
      totalHours: s.resolutionTimeHours,
    };
  }),
);

const quickActions = [
  { label: 'Nueva OT', to: '/work-orders/new', icon: constructOutline, color: '#3A5CFF', bg: 'rgba(58, 92, 255, 0.12)' },
  { label: 'Nueva Cotización', to: '/quotes/new', icon: documentTextOutline, color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' },
  { label: 'Nuevo Proyecto', to: '/projects/new', icon: briefcaseOutline, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  { label: 'Inventario', to: '/inventory', icon: layersOutline, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  { label: 'Clientes', to: '/clients', icon: businessOutline, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  { label: 'Reportes', to: '/reports', icon: trendingUpOutline, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
];

function setPreferred(c: 'USD' | 'EUR' | 'VES') {
  currency.setPreferred(c);
}

function goToClient(id: string) {
  router.push(`/clients/${id}`);
}

function clientName(id: string): string {
  return clients.value.find((c) => c.id === id)?.name ?? '—';
}

function woCost(wo: WorkOrder): number {
  return wo.fixedCost + wo.logisticsCost + wo.additionalCost + 200;
}

function actionColor(action: string): string {
  const map: Record<string, string> = {
    Crear: '#16A34A',
    Actualizar: '#3A5CFF',
    Eliminar: '#DC2626',
    Aprobar: '#8B5CF6',
    Cerrar: '#F59E0B',
  };
  return map[action] ?? '#64748B';
}
function actionIcon(action: string) {
  const map: Record<string, string> = {
    Crear: addOutline,
    Actualizar: createOutline,
    Eliminar: trashOutline,
    Aprobar: checkmarkDoneOutline,
    Cerrar: checkmarkCircleOutline,
  };
  return map[action] ?? closeCircleOutline;
}
function actionVerb(action: string): string {
  const map: Record<string, string> = {
    Crear: 'creó',
    Actualizar: 'actualizó',
    Eliminar: 'eliminó',
    Aprobar: 'aprobó',
    Cerrar: 'cerró',
  };
  return map[action] ?? action.toLowerCase();
}

onMounted(async () => {
  if (!session.tenantId) {
    await tenant.loadAll();
    if (tenant.tenants[0]) await tenant.setCurrent(tenant.tenants[0].id);
  }
  workOrders.value = await workOrdersService.list(session.tenantId);
  clients.value = await clientsService.list(session.tenantId);
  slas.value = await slasService.list(session.tenantId);
  logs.value = await auditService.list(session.tenantId);
  // Contar tareas pendientes por técnico actual
  const tasks = await tasksService.listByUser(session.user?.id ?? '');
  taskCounts.value[session.user?.id ?? ''] = tasks.filter((t) => t.status === 'pending').length;
});
</script>
