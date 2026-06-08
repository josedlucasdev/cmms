<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">
        {{ users.length }} usuario(s) en
        <span class="font-mono font-bold text-primary-600">{{ currentTenant?.code }}</span>
        · Plan {{ currentTenant?.plan }} · Máx. {{ currentTenant?.maxUsers ?? '—' }}
      </p>
      <ion-button
        color="primary"
        router-link="/users/new"
        class="!font-semibold"
        :disabled="atMaxUsers"
      >
        <ion-icon slot="start" :icon="addOutline" /> Nuevo Usuario
      </ion-button>
    </div>

    <div v-if="atMaxUsers" class="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
      Has alcanzado el límite de usuarios del plan ({{ currentTenant?.maxUsers }}). Actualiza el plan para añadir más.
    </div>

    <DataTable
      :columns="columns"
      :rows="users"
      :row-key="(u) => u.id"
      @row-click="(u) => $router.push(`/users/${u.id}`)"
    >
      <template #cell-fullName="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            :style="{ backgroundColor: row.avatarColor || colorFromString(row.fullName) }"
          >
            {{ initials(row.fullName) }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ row.fullName }}</p>
            <p class="text-[10px] text-zinc-500">{{ row.email }}</p>
          </div>
        </div>
      </template>
      <template #cell-role="{ row }">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase">{{ roleLabel(row.role) }}</span>
      </template>
      <template #cell-active="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="row.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'"
        >{{ row.active ? 'Activo' : 'Inactivo' }}</span>
      </template>
      <template #cell-lastLoginAt="{ value }">
        <span class="text-xs text-zinc-600">{{ formatRelative(String(value)) }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { usersService } from '@/services/db';
import type { Role, User } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import DataTable from '@/components/common/DataTable.vue';
import { colorFromString, formatRelative, initials } from '@/composables/useFormat';

const session = useSessionStore();
const tenant = useTenantStore();
const users = ref<User[]>([]);
const currentTenant = computed(() => tenant.currentTenant);
const atMaxUsers = computed(() => {
  const max = currentTenant.value?.maxUsers;
  return max ? users.value.length >= max : false;
});

const columns = [
  { key: 'fullName', label: 'Usuario' },
  { key: 'role', label: 'Rol' },
  { key: 'active', label: 'Estado' },
  { key: 'lastLoginAt', label: 'Último acceso' },
];

function roleLabel(r: Role): string {
  const map: Record<Role, string> = {
    super_admin: 'Super Admin',
    tenant_admin: 'Administrador',
    coordinator: 'Coordinador',
    technician: 'Técnico',
    client: 'Cliente',
  };
  return map[r] ?? r;
}

onMounted(async () => {
  users.value = await usersService.listByTenant(session.tenantId ?? '');
});
</script>
