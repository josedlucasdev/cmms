<template>
  <div class="p-4 md:p-6 space-y-4 pb-12">
    <p class="text-sm text-zinc-500">Resumen de tus proyectos y cotizaciones</p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
        <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold">Proyectos activos</p>
        <p class="text-3xl font-bold mt-1">3</p>
      </AppCard>
      <AppCard padding="md" class="!bg-gradient-to-br !from-green-600 !to-green-800 !text-white !border-0">
        <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold">Cotizaciones aprobadas</p>
        <p class="text-3xl font-bold mt-1">5</p>
      </AppCard>
      <AppCard padding="md" class="!bg-gradient-to-br !from-amber-500 !to-amber-700 !text-white !border-0">
        <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold">Pendientes</p>
        <p class="text-3xl font-bold mt-1">2</p>
      </AppCard>
    </div>

    <h3 class="text-base font-bold text-zinc-900 mt-4">Mis proyectos</h3>
    <div class="space-y-2">
      <article
        v-for="p in projects"
        :key="p.id"
        class="bg-white rounded-2xl border border-zinc-200 p-4 hover:shadow-md cursor-pointer transition-shadow"
        @click="$router.push(`/portal/projects/${p.id}`)"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-bold text-zinc-900">{{ p.name }}</p>
            <p class="text-[10px] text-zinc-500 font-mono">{{ p.code }}</p>
          </div>
          <StatusChip :status="p.status" />
        </div>
        <div class="mt-3 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div class="h-full bg-primary-500" :style="{ width: p.progress + '%' }" />
        </div>
        <p class="text-[10px] text-zinc-500 mt-1">{{ p.progress }}% completado</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { projectsService } from '@/services/db';
import type { Project } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import StatusChip from '@/components/common/StatusChip.vue';

const session = useSessionStore();
const projects = ref<Project[]>([]);

onMounted(async () => {
  projects.value = await projectsService.list(session.tenantId);
});
</script>
