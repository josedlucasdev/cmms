<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Cronograma Gantt · 
        <router-link to="/projects" class="text-zinc-500 hover:text-primary-600">Lista</router-link> ·
        <router-link to="/projects/gantt" class="font-semibold text-primary-600">Gantt</router-link> ·
        <router-link to="/projects/kanban" class="text-zinc-500 hover:text-primary-600">Kanban</router-link>
      </p>
    </div>

    <AppCard padding="md">
      <div class="overflow-x-auto">
        <div class="min-w-[800px]">
          <!-- Encabezado de meses -->
          <div class="grid border-b border-zinc-200 pb-2 mb-3" :style="{ gridTemplateColumns: '200px repeat(6, 1fr)' }">
            <div class="text-xs font-bold text-zinc-700">Proyecto</div>
            <div v-for="m in months" :key="m" class="text-xs font-semibold text-zinc-500 text-center">{{ m }}</div>
          </div>
          <div
            v-for="(p, idx) in projects"
            :key="p.id"
            class="grid items-center py-2 hover:bg-zinc-50/50 cursor-pointer rounded"
            :style="{ gridTemplateColumns: '200px repeat(6, 1fr)' }"
            @click="$router.push(`/projects/${p.id}`)"
          >
            <div class="pr-3 min-w-0">
              <p class="text-sm font-semibold text-zinc-800 truncate">{{ p.name }}</p>
              <p class="text-[10px] text-zinc-500 font-mono">{{ p.code }}</p>
            </div>
            <div
              v-for="(m, mIdx) in months"
              :key="mIdx"
              class="relative h-7 border-l border-zinc-100"
            >
              <div
                v-if="isMonthInRange(idx, mIdx)"
                class="absolute inset-y-1.5 rounded-md shadow-sm flex items-center justify-center text-[10px] font-bold text-white"
                :style="{
                  left: (idx * 8) + '%',
                  right: (5 - idx) * 6 + '%',
                  backgroundColor: statusColor(p.status),
                }"
              >
                {{ p.progress }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clientsService, projectsService } from '@/services/db';
import type { Client, Project } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import { statusColor } from '@/composables/useFormat';

const session = useSessionStore();
const projects = ref<Project[]>([]);
const clients = ref<Client[]>([]);

const months = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];

function isMonthInRange(projIdx: number, monthIdx: number): boolean {
  // Distribución simple basada en hash del proyecto
  const start = (projIdx * 7) % 6;
  const len = 2 + (projIdx % 4);
  return monthIdx >= start && monthIdx < start + len;
}

onMounted(async () => {
  projects.value = await projectsService.list(session.tenantId);
  clients.value = await clientsService.list(session.tenantId);
});
</script>
