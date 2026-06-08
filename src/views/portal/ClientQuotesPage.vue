<template>
  <div class="p-4 md:p-6 space-y-3 pb-12">
    <p class="text-sm text-zinc-500">Cotizaciones emitidas a tu empresa</p>
    <div class="space-y-2">
      <article
        v-for="q in quotes"
        :key="q.id"
        class="bg-white rounded-2xl border border-zinc-200 p-4"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[10px] font-mono text-zinc-500">{{ q.number }}</p>
            <p class="text-sm font-bold text-zinc-900">{{ itemsCount(q) }} ítems</p>
            <p class="text-[11px] text-zinc-500 mt-0.5">Válida hasta {{ formatDate(q.validUntil) }}</p>
          </div>
          <StatusChip :status="q.status" />
        </div>
        <div class="mt-3 flex items-center justify-between flex-wrap gap-2">
          <CurrencyDisplay :amount="qTotal(q)" :currency="q.currency" size="md" />
          <div class="flex gap-2">
            <ion-button size="small" fill="outline" color="danger" class="!font-semibold" @click="onReject(q.id)" v-if="canAct(q)">
              Rechazar
            </ion-button>
            <ion-button size="small" color="success" class="!font-semibold" @click="onApprove(q.id)" v-if="canAct(q)" :disabled="approving === q.id">
              {{ approving === q.id ? 'Aprobando…' : 'Aprobar' }}
            </ion-button>
          </div>
        </div>
        <p v-if="q.status === 'approved'" class="mt-2 text-[11px] text-green-700 font-semibold">
          ✓ Aprobada · proyecto y OT inicial generados
        </p>
      </article>
    </div>

    <!-- Modal Rechazar -->
    <ConfirmModal
      v-model="showRejectModal"
      title="Rechazar cotización"
      message="¿Seguro que deseas rechazar esta cotización? No podrás aprobarla después."
      confirm-label="Sí, rechazar"
      confirm-color="danger"
      @confirm="confirmReject"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton } from '@ionic/vue';
import { quotesService } from '@/services/db';
import type { Quote } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { formatDate } from '@/composables/useFormat';

const session = useSessionStore();
const notify = useNotificationStore();
const quotes = ref<Quote[]>([]);
const approving = ref<string | null>(null);
const showRejectModal = ref(false);
const rejectingId = ref<string | null>(null);

function itemsCount(q: Quote): number { return q.items.length; }
function qTotal(q: Quote): number {
  return q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * (1 + q.taxPercent / 100);
}
function canAct(q: Quote): boolean {
  return q.status === 'sent' || q.status === 'draft';
}

async function onApprove(id: string) {
  approving.value = id;
  try {
    const result = await quotesService.approve(id, { approvedBy: session.user?.id });
    if (result) {
      // refrescar lista
      quotes.value = await quotesService.list(session.tenantId ?? undefined);
      notify.push(
        `Cotización aprobada · Proyecto ${result.project.code} creado · OT ${result.workOrder.number} generada`,
        'success',
      );
    } else {
      notify.push('No se pudo aprobar', 'danger');
    }
  } finally {
    approving.value = null;
  }
}

function onReject(id: string) {
  rejectingId.value = id;
  showRejectModal.value = true;
}

async function confirmReject() {
  if (!rejectingId.value) return;
  const updated = await quotesService.reject(rejectingId.value);
  if (updated) {
    quotes.value = await quotesService.list(session.tenantId ?? undefined);
    notify.push('Cotización rechazada', 'warning');
  }
  rejectingId.value = null;
}

onMounted(async () => {
  quotes.value = await quotesService.list(session.tenantId ?? undefined);
});
</script>
