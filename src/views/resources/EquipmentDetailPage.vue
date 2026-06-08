<template>
  <div v-if="equipment" class="p-4 md:p-6 space-y-4 pb-12">
    <AppCard padding="md">
      <div class="flex items-start justify-between flex-wrap gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{{ equipment.qrCode }}</p>
          <h2 class="text-xl font-bold text-zinc-900">{{ equipment.name }}</h2>
          <p class="text-sm text-zinc-600 mt-1">{{ equipment.model }} · {{ equipment.category }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="equipment.underWarranty"
            class="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700"
          >EN GARANTÍA</span>
          <StatusChip :status="equipment.status" :label="statusLabel(equipment.status)" />
          <ion-button
            fill="outline"
            size="small"
            :router-link="`/resources/equipment/${equipment.id}/edit`"
            class="!font-semibold"
          >
            <ion-icon slot="start" :icon="createOutline" /> Editar
          </ion-button>
        </div>
      </div>
    </AppCard>

    <!-- Tarjeta QR destacada -->
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-50 !to-primary-100 !border-primary-200">
      <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
        <div class="flex items-center justify-center">
          <div
            class="w-36 h-36 bg-white border-4 border-zinc-900 rounded-xl p-2 shadow-md"
            aria-label="Código QR del equipo"
          >
            <QrVisual :value="equipment.qrCode" />
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <ion-icon :icon="qrCodeOutline" class="text-primary-600 text-lg" />
            Código QR de identificación
          </h3>
          <p class="text-xl font-mono font-bold text-zinc-900 tracking-wide break-all">
            {{ equipment.qrCode }}
          </p>
          <p class="text-[11px] text-zinc-600">
            Escanea este código desde la app móvil (<strong>Mis Tareas → Escanear</strong>) para abrir el historial
            del equipo o iniciar una nueva OT sin escribir su nombre.
          </p>
          <div class="flex items-center gap-2 pt-1">
            <ion-button
              size="small"
              fill="outline"
              class="!font-semibold"
              @click="copyQr"
            >
              <ion-icon slot="start" :icon="copyOutline" /> Copiar
            </ion-button>
            <ion-button
              size="small"
              fill="outline"
              class="!font-semibold"
              @click="downloadQr"
            >
              <ion-icon slot="start" :icon="downloadOutline" /> Descargar
            </ion-button>
          </div>
        </div>
      </div>
    </AppCard>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <KpiCard label="Tarifa operación" :icon="cashOutline" hoverable>
        <template #value><CurrencyDisplay :amount="equipment.hourlyRate" currency="USD" size="lg" /></template>
      </KpiCard>
      <KpiCard label="Horas de uso" :icon="timeOutline" icon-color="#F59E0B" icon-bg="rgba(245, 158, 11, 0.12)" hoverable>
        <template #value><span class="text-2xl font-bold">{{ equipment.usageHours }}h</span></template>
      </KpiCard>
      <KpiCard label="Último mantto." :icon="calendarOutline" icon-color="#16A34A" icon-bg="rgba(22, 163, 74, 0.12)" hoverable>
        <template #value><span class="text-sm font-bold">{{ formatDate(equipment.lastMaintenanceAt) }}</span></template>
      </KpiCard>
    </div>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Datos del equipo</h3>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between"><dt class="text-zinc-500">N° de serie</dt><dd class="font-mono font-semibold">{{ equipment.serialNumber ?? '—' }}</dd></div>
        <div class="flex justify-between"><dt class="text-zinc-500">Cliente</dt><dd class="font-semibold">{{ clientName(equipment.clientId) }}</dd></div>
        <div class="flex justify-between"><dt class="text-zinc-500">Garantía hasta</dt><dd class="font-semibold">{{ formatDate(equipment.warrantyExpiresAt) }}</dd></div>
      </dl>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Historial de intervenciones</h3>
      <EmptyState
        :icon="clipboardOutline"
        title="Sin historial"
        description="Las OTs que se ejecuten sobre este equipo aparecerán aquí."
      />
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  cashOutline, timeOutline, calendarOutline, clipboardOutline, createOutline,
  qrCodeOutline, copyOutline, downloadOutline,
} from 'ionicons/icons';
import { clientsService, equipmentService } from '@/services/db';
import type { Client, Equipment } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useToast } from '@/composables/useToast';
import AppCard from '@/components/common/AppCard.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import QrVisual from '@/components/common/QrVisual.vue';
import { formatDate } from '@/composables/useFormat';

const route = useRoute();
const session = useSessionStore();
const equipment = ref<Equipment | null>(null);
const clients = ref<Client[]>([]);
const toast = useToast();

function clientName(id?: string): string {
  if (!id) return '— (propio)';
  return clients.value.find((c) => c.id === id)?.name ?? '—';
}

function statusLabel(s: Equipment['status']): string {
  return ({ available: 'Disponible', in_use: 'En uso', maintenance: 'Mantenimiento', retired: 'Dado de baja' })[s] ?? s;
}

async function copyQr() {
  if (!equipment.value) return;
  try {
    await navigator.clipboard.writeText(equipment.value.qrCode);
    toast.show('QR copiado al portapapeles', 'success');
  } catch {
    toast.show('No se pudo copiar', 'warning');
  }
}

function downloadQr() {
  if (!equipment.value) return;
  const eq = equipment.value;
  const blob = new Blob(
    [`EQUIPMENT QR\n============\n${eq.qrCode}\n\nEquipo: ${eq.name}\nModelo: ${eq.model ?? '—'}\nSerie: ${eq.serialNumber ?? '—'}\nCategoría: ${eq.category}\n`],
    { type: 'text/plain' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eq.qrCode}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.show('QR descargado', 'success');
}

onMounted(async () => {
  equipment.value = await equipmentService.get(route.params.id as string);
  clients.value = await clientsService.list(session.tenantId ?? undefined);
});
</script>
