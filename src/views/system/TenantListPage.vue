<template>
  <div class="p-4 md:p-6 space-y-4">
    <!-- Banner de modo sistema -->
    <div class="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
      <ion-icon :icon="warningOutline" class="text-amber-700 text-lg" />
      <p class="text-xs text-amber-800">
        <strong>Consola del Sistema.</strong> Estás administrando Tenants globales. Las acciones aquí afectan a toda la empresa cliente.
      </p>
    </div>

    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">{{ tenants.length }} empresa(s) registrada(s) en el SaaS</p>
      <ion-button color="primary" router-link="/system/tenants/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" /> Nueva Empresa
      </ion-button>
    </div>

    <DataTable
      :columns="columns"
      :rows="tenants"
      :row-key="(t) => t.id"
      @row-click="(t) => $router.push(`/system/tenants/${t.id}`)"
    >
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            :style="{ backgroundColor: colorFromString(row.name) }"
          >
            {{ initials(row.name) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-zinc-900 truncate">{{ row.name }}</p>
            <p class="text-[10px] text-zinc-500 font-mono">{{ row.code }}</p>
          </div>
        </div>
      </template>
      <template #cell-plan="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
          :class="planBadge(row.plan).class"
        >{{ planBadge(row.plan).label }}</span>
      </template>
      <template #cell-status="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="row.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'"
        >{{ row.active ? 'ACTIVA' : 'SUSPENDIDA' }}</span>
      </template>
      <template #cell-modules="{ row }">
        <span class="text-xs font-semibold">{{ enabledCount(row) }} / {{ ALL_MODULES.length }}</span>
      </template>
      <template #cell-users="{ row }">
        <span class="text-xs font-mono font-semibold">{{ userCounts[row.id] ?? 0 }} / {{ row.maxUsers ?? '—' }}</span>
      </template>
      <template #cell-expiresAt="{ value }">
        <span class="text-xs text-zinc-600">{{ formatDate(String(value)) }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline, warningOutline } from 'ionicons/icons';
import { tenantsService, usersService } from '@/services/db';
import type { Tenant } from '@/types/domain';
import { ALL_MODULES } from '@/constants/modules';
import DataTable from '@/components/common/DataTable.vue';
import { colorFromString, formatDate, initials } from '@/composables/useFormat';

const tenants = ref<Tenant[]>([]);
const userCounts = ref<Record<string, number>>({});

const columns = [
  { key: 'name', label: 'Empresa' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Estado' },
  { key: 'modules', label: 'Módulos' },
  { key: 'users', label: 'Usuarios' },
  { key: 'expiresAt', label: 'Vence' },
];

function planBadge(plan: string): { label: string; class: string } {
  switch (plan) {
    case 'enterprise': return { label: 'ENTERPRISE', class: 'bg-purple-100 text-purple-700' };
    case 'pro': return { label: 'PRO', class: 'bg-blue-100 text-blue-700' };
    default: return { label: 'FREE', class: 'bg-zinc-100 text-zinc-700' };
  }
}

function enabledCount(t: Tenant): number {
  if (!t.enabledModules || t.enabledModules.length === 0) return ALL_MODULES.length;
  return t.enabledModules.length;
}

onMounted(async () => {
  tenants.value = await tenantsService.list();
  for (const t of tenants.value) {
    userCounts.value[t.id] = await usersService.countByTenant(t.id);
  }
});
</script>
