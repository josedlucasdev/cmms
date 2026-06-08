<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Tablero Kanban · 
        <router-link to="/projects" class="text-zinc-500 hover:text-primary-600">Lista</router-link> ·
        <router-link to="/projects/gantt" class="text-zinc-500 hover:text-primary-600">Gantt</router-link> ·
        <router-link to="/projects/kanban" class="font-semibold text-primary-600">Kanban</router-link>
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div
        v-for="col in columns"
        :key="col.key"
        class="bg-zinc-100/60 rounded-2xl p-3"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: col.color }" />
            <h3 class="text-sm font-bold text-zinc-800">{{ col.label }}</h3>
          </div>
          <span class="text-[11px] font-mono font-bold text-zinc-500">{{ projectsIn(col.key).length }}</span>
        </div>
        <div class="space-y-2">
          <article
            v-for="p in projectsIn(col.key)"
            :key="p.id"
            class="bg-white rounded-xl p-3 border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            @click="$router.push(`/projects/${p.id}`)"
          >
            <p class="text-[10px] font-mono text-zinc-400 mb-1">{{ p.code }}</p>
            <h4 class="text-xs font-bold text-zinc-900 line-clamp-2 mb-2">{{ p.name }}</h4>
            <p class="text-[10px] text-zinc-500 mb-2">{{ clientName(p.clientId) }}</p>
            <div class="flex items-center justify-between text-[10px]">
              <CurrencyDisplay :amount="p.budget" :currency="p.currency" size="sm" />
              <span class="font-mono font-bold text-zinc-600">{{ p.progress }}%</span>
            </div>
            <div class="mt-2 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-500" :style="{ width: p.progress + '%' }" />
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clientsService, projectsService } from '@/services/db';
import type { Client, Project } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';

const session = useSessionStore();
const projects = ref<Project[]>([]);
const clients = ref<Client[]>([]);

const columns = [
  { key: 'planning', label: 'Planificación', color: '#3A5CFF' },
  { key: 'active', label: 'En Ejecución', color: '#16A34A' },
  { key: 'on_hold', label: 'En Pausa', color: '#F59E0B' },
  { key: 'completed', label: 'Completados', color: '#8B5CF6' },
];

function projectsIn(status: string): Project[] {
  return projects.value.filter((p) => p.status === status);
}
function clientName(id: string): string {
  return clients.value.find((c) => c.id === id)?.name ?? '—';
}

onMounted(async () => {
  projects.value = await projectsService.list(session.tenantId);
  clients.value = await clientsService.list(session.tenantId);
});
</script>
