<template>
  <div class="p-3 space-y-3 pb-6">
    <h2 class="text-lg font-bold text-zinc-900">Mis Tareas</h2>

    <div class="space-y-2">
      <article
        v-for="t in myTasks"
        :key="t.id"
        class="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
      >
        <div class="h-1" :style="{ backgroundColor: priorityColor(t.estimatedHours > 6 ? 'high' : 'medium') }" />
        <div class="p-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase">{{ t.number }}</span>
            <StatusChip :status="t.status" />
          </div>
          <h3 class="text-sm font-bold text-zinc-900">{{ t.description }}</h3>
          <p class="text-[11px] text-zinc-500 mt-0.5">OT: {{ workOrderNumber(t.workOrderId) }}</p>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-[11px] text-zinc-600 font-semibold">Estimado: {{ t.estimatedHours }}h</span>
            <ion-button
              size="small"
              color="primary"
              :router-link="`/tasks/${t.workOrderId}/${t.id}`"
              class="!font-semibold"
            >
              <ion-icon slot="start" :icon="playOutline" /> Iniciar
            </ion-button>
          </div>
        </div>
      </article>
    </div>

    <EmptyState
      v-if="myTasks.length === 0"
      :icon="checkmarkDoneCircleOutline"
      title="¡Sin tareas pendientes!"
      description="Todas tus tareas están completadas."
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { playOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';
import { tasksService, workOrdersService } from '@/services/db';
import type { Task, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import StatusChip from '@/components/common/StatusChip.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { priorityColor } from '@/composables/useFormat';

const session = useSessionStore();
const myTasks = ref<Task[]>([]);
const workOrders = ref<WorkOrder[]>([]);

function workOrderNumber(id: string): string {
  return workOrders.value.find((w) => w.id === id)?.number ?? '—';
}

onMounted(async () => {
  if (!session.user) return;
  myTasks.value = await tasksService.listByUser(session.user.id);
  workOrders.value = await workOrdersService.list(session.tenantId);
});
</script>
