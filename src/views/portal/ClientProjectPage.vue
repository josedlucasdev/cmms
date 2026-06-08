<template>
  <div v-if="project" class="p-4 md:p-6 space-y-4 pb-12">
    <AppCard padding="md">
      <p class="text-[10px] font-mono text-zinc-500 uppercase">{{ project.code }}</p>
      <h2 class="text-xl font-bold text-zinc-900">{{ project.name }}</h2>
      <p class="text-sm text-zinc-600 mt-1">{{ project.description }}</p>
      <div class="mt-3 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-primary-500 to-primary-700" :style="{ width: project.progress + '%' }" />
      </div>
      <p class="text-[10px] text-zinc-500 mt-1">{{ project.progress }}% completado</p>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Avance de Órdenes de Trabajo</h3>
      <div class="space-y-1.5">
        <div v-for="wo in workOrders" :key="wo.id" class="flex items-center gap-2 p-2 rounded-lg border border-zinc-100">
          <span class="text-[10px] font-mono text-zinc-500">{{ wo.number }}</span>
          <span class="text-sm font-semibold flex-1 truncate">{{ wo.title }}</span>
          <StatusChip :status="wo.status" />
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { projectsService, workOrdersService } from '@/services/db';
import type { Project, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import StatusChip from '@/components/common/StatusChip.vue';

const route = useRoute();
const session = useSessionStore();
const project = ref<Project | null>(null);
const workOrders = ref<WorkOrder[]>([]);

onMounted(async () => {
  project.value = await projectsService.get(route.params.id as string);
  if (project.value) {
    workOrders.value = await workOrdersService.listByProject(project.value.id);
  }
});
</script>
