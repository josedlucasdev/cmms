<template>
  <ion-card class="m-0 shadow-none border border-slate-200 rounded-xl">
    <ion-card-header class="pb-2">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="isRunning ? 'bg-green-100' : 'bg-slate-100'"
        >
          <ion-icon
            :icon="timerOutline"
            :color="isRunning ? 'success' : 'medium'"
            class="text-xl"
          />
        </div>
        <div class="flex-1 min-w-0">
          <ion-card-title class="text-base font-semibold text-slate-800">
            Time Tracking
          </ion-card-title>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ taskDescription }}
          </p>
        </div>
      </div>
    </ion-card-header>

    <ion-card-content class="pt-0">
      <!-- Cronómetro -->
      <div class="text-center py-4">
        <div
          class="text-5xl font-mono font-bold tracking-wider tabular-nums"
          :class="isRunning ? 'text-green-600' : 'text-slate-400'"
        >
          {{ formattedTime }}
        </div>
        <p
          v-if="isRunning"
          class="text-[11px] text-green-700 mt-1 font-semibold uppercase tracking-wide"
        >
          <ion-icon :icon="recording" class="text-red-500 animate-pulse" />
          En curso
        </p>
        <p
          v-else-if="isPaused"
          class="text-[11px] text-amber-700 mt-1 font-semibold uppercase tracking-wide"
        >
          Pausado
        </p>
        <p
          v-else
          class="text-[11px] text-slate-400 mt-1 font-semibold uppercase tracking-wide"
        >
          Detenido
        </p>
      </div>

      <!-- Botones de control -->
      <div class="grid grid-cols-2 gap-2">
        <ion-button
          v-if="!isRunning"
          expand="block"
          :disabled="!canStart"
          :color="canStart ? 'success' : 'medium'"
          class="font-semibold"
          @click="onStart"
        >
          <ion-icon slot="start" :icon="play" />
          Iniciar
        </ion-button>
        <ion-button
          v-else
          expand="block"
          color="warning"
          class="font-semibold"
          @click="onPause"
        >
          <ion-icon slot="start" :icon="pause" />
          Pausar
        </ion-button>

        <ion-button
          v-if="!isRunning && elapsedSeconds > 0"
          expand="block"
          color="danger"
          fill="outline"
          class="font-semibold"
          @click="onStop"
        >
          <ion-icon slot="start" :icon="stop" />
          Detener
        </ion-button>
        <ion-button
          v-else
          expand="block"
          color="medium"
          fill="outline"
          disabled
          class="font-semibold"
        >
          <ion-icon slot="start" :icon="stop" />
          Detener
        </ion-button>
      </div>

      <!-- Mensaje de bloqueo -->
      <div
        v-if="!canStart && !isRunning"
        class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2"
      >
        <ion-icon
          :icon="lockClosed"
          class="text-amber-600 text-lg shrink-0 mt-0.5"
        />
        <div class="flex-1 text-xs text-amber-800 leading-relaxed">
          <p class="font-semibold mb-0.5">Ingreso bloqueado</p>
          <p>
            {{ blockReason || 'Complete el Checklist HSE obligatorio y firme digitalmente para habilitar el botón de inicio.' }}
          </p>
        </div>
      </div>

      <!-- Resumen al detener -->
      <div
        v-if="lastSummary"
        class="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
      >
        <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
          Resumen del turno
        </p>
        <p class="text-sm text-slate-800">
          <span class="font-semibold">{{ lastSummary.hours }}h</span>
          registradas en la tarea
        </p>
        <p class="text-[11px] text-slate-500 mt-0.5">
          Inicio: {{ lastSummary.startedAt }} — Fin: {{ lastSummary.endedAt }}
        </p>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
} from '@ionic/vue';
import {
  timerOutline,
  play,
  pause,
  stop,
  lockClosed,
  recording,
} from 'ionicons/icons';

const props = withDefaults(
  defineProps<{
    /** El botón "Iniciar" se habilita SOLO si esto es true */
    canStart: boolean;
    /** Motivo del bloqueo (opcional) */
    blockReason?: string;
    /** Descripción de la tarea (opcional) */
    taskDescription?: string;
  }>(),
  {
    blockReason: '',
    taskDescription: 'Tarea de mantenimiento',
  }
);

const emit = defineEmits<{
  (e: 'started', payload: { startedAt: string }): void;
  (e: 'paused', payload: { pausedAt: string; elapsedSeconds: number }): void;
  (e: 'resumed', payload: { resumedAt: string }): void;
  (
    e: 'stopped',
    payload: {
      startedAt: string;
      endedAt: string;
      elapsedSeconds: number;
      hours: number;
    }
  ): void;
}>();

// === Estado del cronómetro ===
const isRunning = ref(false);
const isPaused = ref(false);
const elapsedSeconds = ref(0);
const startedAt = ref<string | null>(null);
const pausedAt = ref<string | null>(null);

const lastSummary = ref<{
  startedAt: string;
  endedAt: string;
  hours: number;
} | null>(null);

let intervalId: number | null = null;

const formattedTime = computed(() => formatHMS(elapsedSeconds.value));

function formatHMS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function startInterval() {
  if (intervalId !== null) return;
  intervalId = window.setInterval(() => {
    elapsedSeconds.value += 1;
  }, 1000);
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function onStart() {
  if (!props.canStart) return; // Doble check por seguridad
  const now = new Date().toISOString();
  if (isPaused.value && pausedAt.value) {
    isPaused.value = false;
    pausedAt.value = null;
    startInterval();
    emit('resumed', { resumedAt: now });
  } else {
    isRunning.value = true;
    isPaused.value = false;
    startedAt.value = now;
    startInterval();
    emit('started', { startedAt: now });
  }
}

function onPause() {
  if (!isRunning.value) return;
  isRunning.value = false;
  isPaused.value = true;
  pausedAt.value = new Date().toISOString();
  stopInterval();
  emit('paused', {
    pausedAt: pausedAt.value,
    elapsedSeconds: elapsedSeconds.value,
  });
}

function onStop() {
  if (elapsedSeconds.value === 0) return;
  const now = new Date().toISOString();
  stopInterval();
  isRunning.value = false;
  isPaused.value = false;
  const summary = {
    startedAt: startedAt.value || now,
    endedAt: now,
    elapsedSeconds: elapsedSeconds.value,
    hours: parseFloat((elapsedSeconds.value / 3600).toFixed(2)),
  };
  lastSummary.value = {
    startedAt: summary.startedAt,
    endedAt: summary.endedAt,
    hours: summary.hours,
  };
  // Reset para próximo turno
  elapsedSeconds.value = 0;
  startedAt.value = null;
  pausedAt.value = null;
  emit('stopped', summary);
}

onBeforeUnmount(() => stopInterval());
</script>
