<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-sm text-zinc-500">Gestión de clientes y contactos</p>
      </div>
      <ion-button color="primary" router-link="/clients/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" />
        Nuevo Cliente
      </ion-button>
    </div>

    <DataTable
      :columns="columns"
      :rows="clients"
      :row-key="(c) => c.id"
      @row-click="(c) => $router.push(`/clients/${c.id}`)"
    >
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            :style="{ backgroundColor: colorFromString(row.name) }"
          >
            {{ initials(row.name) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-zinc-900 truncate">{{ row.name }}</p>
            <p class="text-[11px] text-zinc-500 truncate">{{ row.industry }}</p>
          </div>
        </div>
      </template>
      <template #cell-taxId="{ value }">
        <span class="font-mono text-xs">{{ value }}</span>
      </template>
      <template #cell-city="{ value }">
        <span class="text-xs text-zinc-700">{{ value }}</span>
      </template>
      <template #cell-contacts="{ row }">
        <span class="text-xs text-zinc-600">{{ row.contacts.length }} contacto(s)</span>
      </template>
      <template #cell-projects="{ row }">
        <span class="text-xs font-bold text-zinc-700">{{ projectCount(row.id) }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { clientsService, projectsService } from '@/services/db';
import type { Client, Project } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import { colorFromString, initials } from '@/composables/useFormat';

const session = useSessionStore();
const clients = ref<Client[]>([]);
const projects = ref<Project[]>([]);

const columns = [
  { key: 'name', label: 'Cliente' },
  { key: 'taxId', label: 'RIF' },
  { key: 'city', label: 'Ciudad' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'projects', label: 'Proyectos' },
];

function projectCount(clientId: string): number {
  return projects.value.filter((p) => p.clientId === clientId).length;
}

onMounted(async () => {
  clients.value = await clientsService.list(session.tenantId);
  projects.value = await projectsService.list(session.tenantId);
});
</script>
