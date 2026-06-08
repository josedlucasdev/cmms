<template>
  <div v-if="user" class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-center gap-3">
        <div
          class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold"
        >
          {{ initials(user.fullName) }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl font-bold">{{ user.fullName }}</h2>
          <p class="text-sm opacity-90">{{ roleLabel(user.role) }}</p>
          <p class="text-xs opacity-80">{{ user.email }}</p>
        </div>
        <ion-button
          fill="outline"
          color="light"
          size="small"
          :router-link="`/users/${user.id}/edit`"
          class="!font-semibold"
        >
          <ion-icon slot="start" :icon="createOutline" /> Editar
        </ion-button>
      </div>
    </AppCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Datos</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-zinc-500">Cédula</dt><dd class="font-mono font-semibold">{{ user.documentId ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Teléfono</dt><dd class="font-semibold">{{ user.phone ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Estado</dt><dd class="font-semibold">{{ user.active ? 'Activo' : 'Inactivo' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Creado</dt><dd class="font-semibold text-xs">{{ formatDate(user.createdAt) }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Último acceso</dt><dd class="font-semibold text-xs">{{ formatRelative(user.lastLoginAt) }}</dd></div>
        </dl>
      </AppCard>

      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Permisos del rol</h3>
        <p class="text-[11px] text-zinc-500 mb-2">
          Permisos heredados del rol <strong>{{ roleLabel(user.role) }}</strong>:
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="p in rolePermissions"
            :key="p"
            class="text-[10px] font-mono font-semibold px-2 py-1 rounded-md bg-zinc-100 text-zinc-700"
          >{{ p }}</span>
        </div>

        <p v-if="user.customPermissions && user.customPermissions.length" class="text-[11px] text-zinc-500 mt-3 mb-2">
          Permisos extra otorgados:
        </p>
        <div v-if="user.customPermissions && user.customPermissions.length" class="flex flex-wrap gap-1.5">
          <span
            v-for="p in user.customPermissions"
            :key="p"
            class="text-[10px] font-mono font-semibold px-2 py-1 rounded-md bg-primary-100 text-primary-700"
          >+ {{ p }}</span>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { createOutline } from 'ionicons/icons';
import { usersService } from '@/services/db';
import type { Role, User } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import { formatDate, formatRelative, initials } from '@/composables/useFormat';

const route = useRoute();
const user = ref<User | null>(null);

const ROLE_PERMS: Record<Role, string[]> = {
  super_admin: ['* (todos)'],
  tenant_admin: [
    'users.manage', 'clients.manage', 'quotes.manage', 'projects.manage',
    'work-orders.manage', 'employees.manage', 'equipment.manage', 'inventory.manage',
    'suppliers.manage', 'purchase-orders.manage', 'reports.view', 'audit.view',
    'settings.edit',
  ],
  coordinator: [
    'clients.manage', 'quotes.manage', 'projects.manage', 'work-orders.manage',
    'employees.manage', 'equipment.manage', 'inventory.manage', 'suppliers.manage',
    'purchase-orders.manage', 'reports.view',
  ],
  technician: ['work-orders.view', 'tasks.manage', 'time-tracking', 'evidence.upload'],
  client: ['portal.view', 'quotes.approve', 'project.view'],
};

const rolePermissions = computed(() => user.value ? ROLE_PERMS[user.value.role] : []);

function roleLabel(r: Role): string {
  const map: Record<Role, string> = {
    super_admin: 'Super Administrador',
    tenant_admin: 'Administrador del Tenant',
    coordinator: 'Coordinador',
    technician: 'Técnico de Campo',
    client: 'Cliente',
  };
  return map[r] ?? r;
}

onMounted(async () => {
  user.value = await usersService.get(route.params.id as string);
});
</script>
