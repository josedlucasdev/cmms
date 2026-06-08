<template>
  <div v-if="tenant" class="p-4 md:p-6 max-w-5xl mx-auto pb-12 space-y-4">
    <div class="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
      <ion-icon :icon="warningOutline" class="text-amber-700 text-lg" />
      <p class="text-xs text-amber-800">
        <strong>Vista global del Tenant.</strong> Los cambios realizados aquí afectan a TODA la organización.
      </p>
    </div>

    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-start justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shrink-0"
          >
            {{ initials(tenant.name) }}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold font-mono">{{ tenant.code }}</p>
            <h2 class="text-xl font-bold truncate">{{ tenant.name }}</h2>
            <p class="text-sm opacity-90 mt-0.5">{{ tenant.industry ?? 'Sin industria' }} · {{ tenant.city ?? '—' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase">
            {{ tenant.plan }}
          </span>
          <ion-button
            fill="outline"
            color="light"
            size="small"
            :router-link="`/system/tenants/${tenant.id}/edit`"
            class="!font-semibold"
          >
            <ion-icon slot="start" :icon="createOutline" /> Editar
          </ion-button>
        </div>
      </div>
    </AppCard>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Usuarios" :icon="peopleOutline" hoverable>
        <template #value>
          <span class="text-2xl font-bold">{{ userCount }} <span class="text-sm text-zinc-500">/ {{ tenant.maxUsers ?? '—' }}</span></span>
        </template>
      </KpiCard>
      <KpiCard label="Almacenamiento" :icon="layersOutline" icon-color="#F59E0B" icon-bg="rgba(245, 158, 11, 0.12)" hoverable>
        <template #value>
          <span class="text-lg font-bold">{{ ((tenant.maxStorageMb ?? 0) / 1024).toFixed(1) }} GB</span>
        </template>
      </KpiCard>
      <KpiCard label="Módulos activos" :icon="gridOutline" icon-color="#8B5CF6" icon-bg="rgba(139, 92, 246, 0.12)" hoverable>
        <template #value>
          <span class="text-2xl font-bold">{{ enabledCount }} <span class="text-sm text-zinc-500">/ {{ ALL_MODULES.length }}</span></span>
        </template>
      </KpiCard>
      <KpiCard label="Vence" :icon="ribbonOutline" icon-color="#16A34A" icon-bg="rgba(22, 163, 74, 0.12)" hoverable>
        <template #value>
          <span class="text-sm font-bold">{{ formatDate(tenant.expiresAt) }}</span>
        </template>
      </KpiCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <AppCard padding="md" class="lg:col-span-2">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Módulos habilitados</h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="m in enabledModules"
            :key="m.key"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-[11px] font-semibold"
          >
            <ion-icon :icon="m.icon" class="text-xs" />
            {{ m.label }}
          </span>
        </div>
        <p v-if="!tenant.enabledModules || tenant.enabledModules.length === 0" class="text-[11px] text-zinc-500 mt-2">
          Todos los módulos están habilitados.
        </p>
      </AppCard>

      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Contacto</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-zinc-500">RIF</dt><dd class="font-mono font-semibold">{{ tenant.taxId ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Email</dt><dd class="font-semibold text-xs truncate">{{ tenant.email ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Teléfono</dt><dd class="font-semibold">{{ tenant.phone ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Representante</dt><dd class="font-semibold text-xs">{{ tenant.contactName ?? '—' }}</dd></div>
        </dl>
      </AppCard>
    </div>

    <AppCard padding="md">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-zinc-800">Usuarios del Tenant</h3>
        <ion-button
          size="small"
          fill="outline"
          :router-link="`/users?tenant=${tenant.id}`"
          class="!font-semibold"
        >
          Ver todos
        </ion-button>
      </div>
      <DataTable
        :columns="userColumns"
        :rows="tenantUsers"
        :row-key="(u) => u.id"
        :searchable="false"
        @row-click="(u) => $router.push(`/users/${u.id}`)"
      >
        <template #cell-fullName="{ row }">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              :style="{ backgroundColor: row.avatarColor || colorFromString(row.fullName) }"
            >
              {{ initials(row.fullName) }}
            </div>
            <div>
              <p class="text-sm font-semibold text-zinc-900">{{ row.fullName }}</p>
              <p class="text-[10px] text-zinc-500">{{ row.email }}</p>
            </div>
          </div>
        </template>
        <template #cell-role="{ row }">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase">
            {{ roleLabel(row.role) }}
          </span>
        </template>
        <template #cell-active="{ row }">
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="row.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'"
          >{{ row.active ? 'Activo' : 'Inactivo' }}</span>
        </template>
      </DataTable>
    </AppCard>

    <AppCard padding="md" v-if="tenant.notes">
      <h3 class="text-sm font-bold text-zinc-800 mb-2">Notas internas</h3>
      <p class="text-sm text-zinc-700 whitespace-pre-line">{{ tenant.notes }}</p>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  warningOutline, createOutline, peopleOutline, layersOutline, gridOutline, ribbonOutline,
} from 'ionicons/icons';
import { tenantsService, usersService } from '@/services/db';
import type { Role, Tenant, User } from '@/types/domain';
import { ALL_MODULES, type ModuleKey } from '@/constants/modules';
import AppCard from '@/components/common/AppCard.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import { colorFromString, formatDate, initials } from '@/composables/useFormat';

const route = useRoute();
const tenant = ref<Tenant | null>(null);
const tenantUsers = ref<User[]>([]);
const userCount = ref(0);

const enabledCount = computed(() => {
  if (!tenant.value) return 0;
  if (!tenant.value.enabledModules || tenant.value.enabledModules.length === 0) return ALL_MODULES.length;
  return tenant.value.enabledModules.length;
});

const enabledModules = computed(() => {
  if (!tenant.value) return [] as typeof ALL_MODULES;
  const list: ModuleKey[] = tenant.value.enabledModules && tenant.value.enabledModules.length > 0
    ? (tenant.value.enabledModules as ModuleKey[])
    : ALL_MODULES.map((m) => m.key);
  return ALL_MODULES.filter((m) => list.includes(m.key));
});

const userColumns = [
  { key: 'fullName', label: 'Usuario' },
  { key: 'role', label: 'Rol' },
  { key: 'active', label: 'Estado' },
  { key: 'lastLoginAt', label: 'Último acceso' },
];

function roleLabel(r: Role): string {
  const map: Record<Role, string> = {
    super_admin: 'Super',
    tenant_admin: 'Admin',
    coordinator: 'Coord.',
    technician: 'Técnico',
    client: 'Cliente',
  };
  return map[r] ?? r;
}

onMounted(async () => {
  tenant.value = await tenantsService.get(route.params.id as string);
  if (tenant.value) {
    tenantUsers.value = await usersService.listByTenant(tenant.value.id);
    userCount.value = await usersService.countByTenant(tenant.value.id);
  }
});
</script>
