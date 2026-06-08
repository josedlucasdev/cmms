<template>
  <div v-if="quote" class="p-4 md:p-6 max-w-4xl mx-auto pb-12 space-y-4">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold">Cotización</p>
          <h2 class="text-2xl font-bold font-mono">{{ quote.number }}</h2>
          <p class="text-sm opacity-90 mt-1">{{ client?.name ?? '—' }}</p>
        </div>
        <StatusChip :status="quote.status" />
      </div>
    </AppCard>

    <!-- Banner post-aprobación con accesos directos al proyecto / OT -->
    <AppCard
      v-if="quote.status === 'approved' && generatedProject"
      padding="md"
      class="!bg-gradient-to-br !from-green-50 !to-green-100 !border-green-300"
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
          <ion-icon :icon="checkmarkDoneOutline" class="text-lg" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-green-900">Cotización aprobada</p>
          <p class="text-xs text-green-800 mt-0.5">
            {{ formatDate(quote.approvedAt, true) }} · Se generó el proyecto
            <span class="font-mono font-bold">{{ generatedProject.code }}</span>
            y la OT inicial
            <span class="font-mono font-bold">{{ generatedWorkOrder?.number }}</span>.
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <ion-button size="small" color="success" :router-link="`/projects/${generatedProject.id}`" class="!font-semibold">
              <ion-icon slot="start" :icon="briefcaseOutline" /> Ver proyecto
            </ion-button>
            <ion-button
              v-if="generatedWorkOrder"
              size="small"
              fill="outline"
              color="success"
              :router-link="`/work-orders/${generatedWorkOrder.id}`"
              class="!font-semibold"
            >
              <ion-icon slot="start" :icon="constructOutline" /> Ver OT inicial
            </ion-button>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Acciones Aprobar / Rechazar -->
    <AppCard
      v-if="quote.status === 'draft' || quote.status === 'sent'"
      padding="md"
    >
      <div class="flex items-start gap-3 flex-wrap">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-zinc-800">¿Apruebas esta cotización?</p>
          <p class="text-xs text-zinc-500 mt-0.5">
            Al aprobarla se creará automáticamente un proyecto y una OT inicial con los ítems aquí listados.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <ion-button
            fill="outline"
            color="danger"
            class="!font-semibold"
            @click="openRejectModal"
          >
            <ion-icon slot="start" :icon="closeCircleOutline" /> Rechazar
          </ion-button>
          <ion-button
            color="success"
            class="!font-semibold"
            :disabled="approving"
            @click="onApprove"
          >
            <ion-icon slot="start" :icon="checkmarkDoneOutline" />
            {{ approving ? 'Aprobando…' : 'Aprobar cotización' }}
          </ion-button>
        </div>
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Detalle</h3>
      <div class="border border-zinc-200 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-[11px] uppercase font-semibold">
            <tr>
              <th class="px-3 py-2 text-left">Tipo</th>
              <th class="px-3 py-2 text-left">Descripción</th>
              <th class="px-3 py-2 text-right">Cant.</th>
              <th class="px-3 py-2 text-right">P. Unit.</th>
              <th class="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in quote.items" :key="it.id" class="border-t border-zinc-100">
              <td class="px-3 py-2"><StatusChip :status="it.type" :label="typeLabel(it.type)" /></td>
              <td class="px-3 py-2">{{ it.description }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ it.quantity }} {{ it.unit }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ formatMoney(it.unitPrice) }}</td>
              <td class="px-3 py-2 text-right font-mono font-semibold">{{ formatMoney(it.quantity * it.unitPrice) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 ml-auto max-w-xs space-y-1 text-sm">
        <div class="flex justify-between"><span class="text-zinc-600">Subtotal</span><span class="font-mono font-semibold">{{ formatMoney(subtotal) }}</span></div>
        <div class="flex justify-between"><span class="text-zinc-600">IVA ({{ quote.taxPercent }}%)</span><span class="font-mono font-semibold">{{ formatMoney(tax) }}</span></div>
        <div class="flex justify-between text-lg font-bold border-t border-zinc-200 pt-1"><span>Total</span><span class="font-mono">{{ formatMoney(total) }}</span></div>
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-2">Compartir</h3>
      <p class="text-xs text-zinc-500 mb-3">Esta cotización puede ser enviada por múltiples canales:</p>
      <div class="flex flex-wrap gap-2">
        <ion-button fill="outline" size="small" class="!font-semibold">
          <ion-icon slot="start" :icon="logoWhatsapp" /> WhatsApp
        </ion-button>
        <ion-button fill="outline" size="small" class="!font-semibold">
          <ion-icon slot="start" :icon="mailOutline" /> Email
        </ion-button>
        <ion-button fill="outline" size="small" class="!font-semibold">
          <ion-icon slot="start" :icon="chatbubblesOutline" /> SMS
        </ion-button>
        <ion-button fill="outline" size="small" class="!font-semibold">
          <ion-icon slot="start" :icon="downloadOutline" /> PDF
        </ion-button>
      </div>
    </AppCard>

    <!-- Modal Rechazar -->
    <ConfirmModal
      v-model="showRejectModal"
      title="Rechazar cotización"
      message="¿Seguro que deseas rechazar esta cotización? El cliente no podrá aprobarla posteriormente."
      confirm-label="Sí, rechazar"
      confirm-color="danger"
      @confirm="onReject"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  logoWhatsapp, mailOutline, chatbubblesOutline, downloadOutline,
  checkmarkDoneOutline, closeCircleOutline, briefcaseOutline, constructOutline,
} from 'ionicons/icons';
import { clientsService, projectsService, quotesService, workOrdersService } from '@/services/db';
import type { Client, Project, Quote, QuoteLineType, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { formatDate } from '@/composables/useFormat';

const route = useRoute();
const session = useSessionStore();
const notify = useNotificationStore();
const quote = ref<Quote | null>(null);
const client = ref<Client | null>(null);
const generatedProject = ref<Project | null>(null);
const generatedWorkOrder = ref<WorkOrder | null>(null);

const approving = ref(false);
const showRejectModal = ref(false);

const subtotal = computed(() => quote.value?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0);
const tax = computed(() => subtotal.value * ((quote.value?.taxPercent ?? 0) / 100));
const total = computed(() => subtotal.value + tax.value);

function formatMoney(v: number) { return `US$ ${v.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`; }
function typeLabel(t: QuoteLineType): string {
  return ({ labor: 'Mano de Obra', equipment: 'Equipo', material: 'Material', logistics: 'Logística' })[t];
}

async function onApprove() {
  if (!quote.value) return;
  approving.value = true;
  try {
    const result = await quotesService.approve(quote.value.id, { approvedBy: session.user?.id });
    if (result) {
      quote.value = result.quote;
      generatedProject.value = result.project;
      generatedWorkOrder.value = result.workOrder;
      notify.push(
        `Cotización aprobada · Proyecto ${result.project.code} creado · OT ${result.workOrder.number} generada`,
        'success',
      );
    } else {
      notify.push('No se pudo aprobar la cotización', 'danger');
    }
  } finally {
    approving.value = false;
  }
}

function openRejectModal() {
  showRejectModal.value = true;
}

async function onReject() {
  if (!quote.value) return;
  const updated = await quotesService.reject(quote.value.id);
  if (updated) {
    quote.value = updated;
    notify.push('Cotización rechazada', 'warning');
  }
}

async function loadGenerated() {
  if (!quote.value || quote.value.status !== 'approved') return;
  // Buscar el proyecto generado a partir de esta cotización
  const allProjects = await projectsService.list();
  const proj = allProjects.find((p) => p.quoteId === quote.value!.id);
  if (proj) {
    generatedProject.value = proj;
    if (proj.initialWorkOrderId) {
      generatedWorkOrder.value = await workOrdersService.get(proj.initialWorkOrderId);
    } else {
      // Fallback: buscar la primera OT del proyecto
      const wos = await workOrdersService.listByProject(proj.id);
      generatedWorkOrder.value = wos[0] ?? null;
    }
  }
}

onMounted(async () => {
  quote.value = await quotesService.get(route.params.id as string);
  if (quote.value) {
    client.value = await clientsService.get(quote.value.clientId);
    await loadGenerated();
  }
});
</script>
