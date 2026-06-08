<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">{{ projects.length }} proyectos · Vista: 
        <router-link to="/projects" class="font-semibold text-primary-600">Lista</router-link> ·
        <router-link to="/projects/gantt" class="text-zinc-500 hover:text-primary-600">Gantt</router-link> ·
        <router-link to="/projects/kanban" class="text-zinc-500 hover:text-primary-600">Kanban</router-link>
      </p>
      <ion-button color="primary" router-link="/projects/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" /> Nuevo Proyecto
      </ion-button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <article
        v-for="p in projects"
        :key="p.id"
        class="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        @click="$router.push(`/projects/${p.id}`)"
      >
        <div class="h-2" :style="{ backgroundColor: statusColor(p.status) }" />
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-2">
            <p class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">{{ p.code }}</p>
            <StatusChip :status="p.status" />
          </div>
          <h3 class="text-sm font-bold text-zinc-900 line-clamp-2 mb-1">{{ p.name }}</h3>
          <p class="text-xs text-zinc-500 mb-3">{{ clientName(p.clientId) }}</p>

          <div class="mb-3">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-zinc-500 font-semibold">Progreso</span>
              <span class="font-mono font-bold text-zinc-800">{{ p.progress }}%</span>
            </div>
            <div class="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all" :style="{ width: p.progress + '%' }" />
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-zinc-500">
            <div>
              <p class="font-semibold">Presupuesto</p>
              <CurrencyDisplay :amount="p.budget" :currency="p.currency" size="sm" />
            </div>
            <div class="text-right">
              <p class="font-semibold">Inicio</p>
              <p>{{ formatDate(p.startDate) }}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { clientsService, projectsService } from '@/services/db';
import type { Client, Project } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import StatusChip from '@/components/common/StatusChip.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import { formatDate, statusColor } from '@/composables/useFormat';

const session = useSessionStore();
const projects = ref<Project[]>([]);
const clients = ref<Client[]>([]);

function clientName(id: string): string {
  return clients.value.find((c) => c.id === id)?.name ?? '—';
}

onMounted(async () => {
  projects.value = await projectsService.list(session.tenantId);
  clients.value = await clientsService.list(session.tenantId);
});
</script>
