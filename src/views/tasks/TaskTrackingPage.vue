<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="max-w-md mx-auto pb-8 px-3 pt-3 space-y-3">
        <!-- Header de la OT -->
        <div
          v-if="workOrder && task"
          class="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-4 shadow-lg"
        >
          <div class="flex items-center justify-between">
            <p class="text-[11px] uppercase tracking-wider opacity-80 font-semibold">
              Orden de Trabajo
            </p>
            <span class="text-[10px] font-mono opacity-80">{{ workOrder.number }}</span>
          </div>
          <h2 class="text-lg font-bold mt-0.5">{{ task.description }}</h2>
          <div class="mt-2 flex items-center gap-2 text-[11px] opacity-90">
            <ion-icon :icon="locationOutline" />
            <span>Cliente: {{ client?.name ?? '—' }}</span>
          </div>
        </div>
        <div v-else class="rounded-2xl bg-zinc-100 p-8 text-center">
          <p class="text-sm text-zinc-500">Cargando tarea…</p>
        </div>

        <!-- Checklist HSE obligatorio -->
        <HseSafetyChecklist
          :items="checklistItems"
          :work-order-id="workOrderId"
          :task-id="taskId"
          :user-id="userId"
          :user-full-name="userFullName"
          :user-document-id="userDocumentId"
          @ready="onChecklistReady"
          @submitted="onChecklistSubmitted"
        />

        <!-- Time Tracking -->
        <TimeTrackingTimer
          v-if="task"
          :can-start="canStartTracking"
          :block-reason="blockReason"
          :task-description="task.description"
          @started="onTrackingStarted"
          @paused="onTrackingPaused"
          @resumed="onTrackingResumed"
          @stopped="onTrackingStopped"
        />

        <!-- Evidencia rápida -->
        <AppCard>
          <h3 class="text-sm font-bold text-zinc-800 mb-2 flex items-center gap-1.5">
            <ion-icon :icon="cameraOutline" class="text-zinc-500" />
            Evidencia
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 hover:border-primary-400 hover:text-primary-600 transition-colors text-xs font-semibold"
            >
              <ion-icon :icon="addOutline" class="text-2xl mb-1" />
              Foto Antes
            </button>
            <button
              class="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 hover:border-primary-400 hover:text-primary-600 transition-colors text-xs font-semibold"
            >
              <ion-icon :icon="addOutline" class="text-2xl mb-1" />
              Foto Después
            </button>
          </div>
        </AppCard>

        <!-- Materiales consumidos -->
        <AppCard>
          <h3 class="text-sm font-bold text-zinc-800 mb-2 flex items-center gap-1.5">
            <ion-icon :icon="layersOutline" class="text-zinc-500" />
            Consumir material
          </h3>
          <button
            class="w-full px-3 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-600 font-semibold hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <ion-icon :icon="addOutline" /> Agregar material de la OT
          </button>
        </AppCard>

        <!-- Estado offline -->
        <div
          v-if="!isOnline"
          class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <ion-icon :icon="cloudOffline" class="text-amber-700 text-lg" />
          <p class="text-xs text-amber-800">
            Modo offline activo: los datos se guardarán localmente y se
            sincronizarán al recuperar la conexión.
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import {
  locationOutline,
  cloudOffline,
  cameraOutline,
  addOutline,
  layersOutline,
} from 'ionicons/icons';

import HseSafetyChecklist from '@/components/HseSafetyChecklist.vue';
import TimeTrackingTimer from '@/components/TimeTrackingTimer.vue';
import AppCard from '@/components/common/AppCard.vue';
import { DEFAULT_HSE_CHECKLIST } from '@/services/checklistDefault';
import type { HseChecklistLog } from '@/types/checklist';
import { clientsService, tasksService, workOrdersService } from '@/services/db';
import type { Client, Task, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import { useNetworkStore } from '@/stores/network';
import { storeToRefs } from 'pinia';

const route = useRoute();
const session = useSessionStore();
const notify = useNotificationStore();
const network = useNetworkStore();
const { online: isOnline } = storeToRefs(network);

const workOrderId = computed(() => route.params.workOrderId as string);
const taskId = computed(() => route.params.taskId as string);

const workOrder = ref<WorkOrder | null>(null);
const task = ref<Task | null>(null);
const client = ref<Client | null>(null);
const userId = computed(() => session.user?.id ?? 'U-001');
const userFullName = computed(() => session.user?.fullName ?? 'Técnico Demo');
const userDocumentId = computed(() => session.user?.documentId ?? 'V-0000000');

const checklistItems = DEFAULT_HSE_CHECKLIST;

const canStartTracking = ref(false);
const blockReason = ref('');

function onChecklistReady(ready: boolean) {
  canStartTracking.value = ready;
  blockReason.value = ready
    ? ''
    : 'Complete el Checklist HSE obligatorio y firme digitalmente para habilitar el botón de inicio.';
}

function onChecklistSubmitted(log: HseChecklistLog) {
  notify.push('Checklist HSE registrado correctamente', 'success');
  console.log('Checklist firmado:', log);
}

function onTrackingStarted(payload: { startedAt: string }) {
  notify.push('Time tracking iniciado', 'success');
  console.log('Tracking started:', payload);
}
function onTrackingPaused(payload: { pausedAt: string; elapsedSeconds: number }) {
  notify.push(`Tracking pausado (${payload.elapsedSeconds}s)`, 'warning');
}
function onTrackingResumed() {
  notify.push('Tracking reanudado', 'success');
}
function onTrackingStopped(payload: { hours: number }) {
  notify.push(`Turno finalizado: ${payload.hours}h registradas`, 'success');
}

onMounted(async () => {
  workOrder.value = await workOrdersService.get(workOrderId.value);
  task.value = await tasksService.get(taskId.value);
  if (workOrder.value) {
    client.value = await clientsService.get(workOrder.value.clientId);
  }
});
onBeforeUnmount(() => {});
</script>
