<template>
  <ion-card class="m-0 shadow-none border border-slate-200 rounded-xl">
    <ion-card-header class="pb-2">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="isReady ? 'bg-green-100' : 'bg-amber-100'"
        >
          <ion-icon
            :icon="isReady ? shieldCheckmark : shieldOutline"
            :color="isReady ? 'success' : 'warning'"
            class="text-xl"
          />
        </div>
        <div class="flex-1 min-w-0">
          <ion-card-title class="text-base font-semibold text-slate-800">
            Checklist HSE Obligatorio
          </ion-card-title>
          <p class="text-xs text-slate-500 mt-0.5">
            Análisis de Seguridad en el Trabajo (AST) requerido para iniciar
          </p>
        </div>
        <ion-badge :color="isReady ? 'success' : 'warning'" class="shrink-0">
          {{ progress }}%
        </ion-badge>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          class="h-full transition-all duration-300 ease-out"
          :class="isReady ? 'bg-green-500' : 'bg-amber-500'"
          :style="{ width: progress + '%' }"
        />
      </div>
    </ion-card-header>

    <ion-card-content class="space-y-3 pt-0">
      <!-- Bloqueo de pantalla si NO está listo -->
      <div
        v-if="!isReady"
        class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
      >
        <ion-icon
          :icon="lockClosed"
          class="text-amber-600 text-lg shrink-0 mt-0.5"
        />
        <p class="text-xs text-amber-800 leading-relaxed">
          <strong>Time Tracking bloqueado.</strong> Complete todas las preguntas
          obligatorias y firme digitalmente para poder iniciar el cronómetro.
        </p>
      </div>

      <!-- Preguntas del checklist -->
      <div
        v-for="item in items"
        :key="item.id"
        class="p-3 rounded-lg border transition-colors"
        :class="getItemContainerClass(item)"
      >
        <div class="flex items-start gap-2 mb-2">
          <span
            class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 mt-0.5"
            :class="getSeverityClass(item.severity)"
          >
            {{ getSeverityLabel(item.severity) }}
          </span>
          <span
            v-if="item.mandatory"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-red-100 text-red-700 shrink-0 mt-0.5"
          >
            Obligatorio
          </span>
        </div>

        <p class="text-sm font-medium text-slate-800 leading-snug mb-2">
          {{ item.question }}
        </p>

        <!-- Pregunta tipo boolean (Sí / No) -->
        <div v-if="item.type === 'boolean'" class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all"
            :class="
              getBooleanClass(item, true)
            "
            @click="onBoolean(item.id, true)"
          >
            <ion-icon :icon="checkmarkCircle" class="align-middle mr-1" />
            Sí
          </button>
          <button
            type="button"
            class="flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all"
            :class="getBooleanClass(item, false)"
            @click="onBoolean(item.id, false)"
          >
            <ion-icon :icon="closeCircle" class="align-middle mr-1" />
            No
          </button>
        </div>

        <!-- Pregunta tipo select -->
        <div v-else-if="item.type === 'select'" class="space-y-1.5">
          <button
            v-for="option in item.options || []"
            :key="option"
            type="button"
            class="w-full py-2 px-3 rounded-lg border-2 text-sm font-medium text-left transition-all flex items-center justify-between"
            :class="getSelectClass(item, option)"
            @click="onSelect(item.id, option)"
          >
            <span>{{ option }}</span>
            <ion-icon
              v-if="responses[item.id] === option"
              :icon="checkmarkCircle"
              class="text-base"
            />
          </button>
        </div>
      </div>

      <!-- Sección de firma digital -->
      <div class="pt-2 border-t border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <ion-icon :icon="pencil" class="text-slate-600" />
            Firma Digital del Técnico
          </h3>
          <span
            v-if="hasSignature"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-green-100 text-green-700"
          >
            Firmado
          </span>
        </div>

        <SignaturePad
          ref="signaturePadRef"
          :height="160"
          @change="onSignatureChange"
        />

        <p
          v-if="!hasSignature"
          class="text-[11px] text-slate-500 mt-1.5 text-center"
        >
          Dibuje su firma en el recuadro con el dedo o stylus
        </p>
      </div>

      <!-- Botón de confirmar (sólo se muestra en modo standalone) -->
      <div v-if="showSubmitButton" class="pt-1">
        <ion-button
          expand="block"
          :disabled="!canStartTracking"
          @click="onSubmit"
          class="font-semibold"
        >
          <ion-icon slot="start" :icon="checkmarkDone" />
          {{ submitLabel }}
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonBadge,
} from '@ionic/vue';
import {
  shieldCheckmark,
  shieldOutline,
  lockClosed,
  checkmarkCircle,
  closeCircle,
  pencil,
  checkmarkDone,
} from 'ionicons/icons';
import type {
  HseChecklistItem,
  HseChecklistLog,
} from '@/types/checklist';
import { useChecklistValidation } from '@/composables/useChecklistValidation';
import SignaturePad from '@/components/SignaturePad.vue';

const props = withDefaults(
  defineProps<{
    items: HseChecklistItem[];
    /** ID de la OT (para construir el log) */
    workOrderId: string;
    /** ID de la tarea (para construir el log) */
    taskId: string;
    /** ID del usuario que está completando el checklist */
    userId: string;
    /** Nombre del técnico (mostrado en la firma) */
    userFullName?: string;
    /** Documento del técnico */
    userDocumentId?: string;
    /** Mostrar botón interno de submit */
    showSubmitButton?: boolean;
    /** Texto del botón submit */
    submitLabel?: string;
  }>(),
  {
    userFullName: '',
    userDocumentId: '',
    showSubmitButton: false,
    submitLabel: 'Confirmar y habilitar Time Tracking',
  }
);

const emit = defineEmits<{
  /** Emitido cada vez que cambia el estado de validez (true/false) */
  (e: 'ready', value: boolean): void;
  /** Emitido al confirmar el checklist. Devuelve el log completo */
  (e: 'submitted', log: HseChecklistLog): void;
  /** Errores de validación */
  (e: 'error', message: string): void;
}>();

const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null);

const {
  responses,
  signature,
  hasSignature,
  canStartTracking,
  progress,
  setBooleanResponse,
  setSelectResponse,
  setSignature,
  buildResponses,
} = useChecklistValidation(props.items);

// Computado: ¿está listo para iniciar tracking?
const isReady = computed(() => canStartTracking.value);

// Re-emitir el flag `ready` cada vez que cambia
function emitReady() {
  emit('ready', isReady.value);
}
watch(isReady, emitReady, { immediate: true });

function onBoolean(itemId: string, value: boolean) {
  setBooleanResponse(itemId, value);
}

function onSelect(itemId: string, value: string) {
  setSelectResponse(itemId, value);
}

async function onSignatureChange(hasContent: boolean) {
  if (!hasContent) {
    setSignature(null as any);
    return;
  }
  const dataUrl = signaturePadRef.value?.toDataURL() || '';

  // Capturar geolocalización (best-effort) usando Capacitor Geolocation
  let geolocation: HseChecklistLog['signature']['geolocation'] = null;
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const perm = await Geolocation.checkPermissions();
    if (perm.location === 'granted' || perm.coarseLocation === 'granted') {
      const pos = await Geolocation.getCurrentPosition();
      geolocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    }
  } catch {
    // No es crítico: la firma se registra aunque falle la geolocalización
    geolocation = null;
  }

  setSignature({
    dataUrl,
    signedBy: props.userFullName,
    signedById: props.userDocumentId,
    signedAt: new Date().toISOString(),
    geolocation,
  });
}

function onSubmit() {
  if (!canStartTracking.value) {
    emit(
      'error',
      'No se puede confirmar: complete todas las preguntas obligatorias y firme.'
    );
    return;
  }
  if (!signature.value) {
    emit('error', 'La firma digital es obligatoria.');
    return;
  }

  const log: HseChecklistLog = {
    id: crypto.randomUUID(),
    workOrderId: props.workOrderId,
    taskId: props.taskId,
    userId: props.userId,
    responses: buildResponses(),
    signature: signature.value,
    passed: true,
    createdAt: new Date().toISOString(),
  };

  emit('submitted', log);
}

// === Estilos dinámicos por pregunta ===
function getSeverityClass(severity: HseChecklistItem['severity']) {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function getSeverityLabel(severity: HseChecklistItem['severity']) {
  switch (severity) {
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Medio';
    default:
      return 'Bajo';
  }
}

function getItemContainerClass(item: HseChecklistItem) {
  const value = responses.value[item.id];
  const answered =
    value !== null && value !== '' && (item.type !== 'boolean' || typeof value === 'boolean');
  const valid = isItemAnsweredValid(item);

  if (answered && !valid && item.mandatory) {
    return 'border-red-300 bg-red-50/40';
  }
  if (answered && valid) {
    return 'border-green-300 bg-green-50/40';
  }
  return 'border-slate-200 bg-white';
}

function isItemAnsweredValid(item: HseChecklistItem) {
  const value = responses.value[item.id];
  if (value === null || value === '') return false;
  if (item.type === 'boolean') {
    if (typeof value !== 'boolean') return false;
    return item.expectedBoolean === undefined ? true : value === item.expectedBoolean;
  }
  return typeof value === 'string' && value.length > 0;
}

function getBooleanClass(item: HseChecklistItem, value: boolean) {
  const selected = responses.value[item.id] === value;
  if (!selected) {
    return 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
  }
  if (value === item.expectedBoolean) {
    return 'border-green-500 bg-green-50 text-green-700';
  }
  return 'border-red-500 bg-red-50 text-red-700';
}

function getSelectClass(item: HseChecklistItem, option: string) {
  const selected = responses.value[item.id] === option;
  if (!selected) {
    return 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
  }
  return 'border-primary-500 bg-primary-50 text-primary-700';
}
</script>
