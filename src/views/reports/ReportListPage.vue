<template>
  <div class="p-4 md:p-6 space-y-4">
    <p class="text-sm text-zinc-500">Informes generados y exportación de cierre</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <article
        v-for="r in reports"
        :key="r.id"
        class="bg-white rounded-2xl border border-zinc-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="onDownload(r)"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <ion-icon :icon="documentTextOutline" class="text-xl" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-zinc-900 truncate">{{ r.title }}</p>
            <p class="text-[10px] text-zinc-500">{{ r.otNumber }} · {{ formatDate(r.date) }}</p>
            <p class="text-[10px] text-zinc-400 font-mono mt-1">PDF · {{ (r.size / 1024).toFixed(0) }} KB</p>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <CurrencyDisplay :amount="r.total" currency="USD" size="sm" />
          <ion-button size="small" fill="outline" class="!font-semibold">
            <ion-icon slot="start" :icon="downloadOutline" /> Descargar
          </ion-button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { documentTextOutline, downloadOutline } from 'ionicons/icons';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import { useNotificationStore } from '@/stores/notification';
import { formatDate } from '@/composables/useFormat';

const notify = useNotificationStore();
const reports = ref([
  { id: 1, title: 'Informe de cierre — Reparación bomba', otNumber: 'OT-4521', date: '2026-05-30', size: 245000, total: 1850 },
  { id: 2, title: 'Informe de cierre — Mantto. preventivo', otNumber: 'OT-4520', date: '2026-05-29', size: 312000, total: 3200 },
  { id: 3, title: 'Informe de cierre — Inspección caldera', otNumber: 'OT-4518', date: '2026-05-28', size: 198000, total: 950 },
  { id: 4, title: 'Informe de cierre — Cambio rodamientos', otNumber: 'OT-4517', date: '2026-05-27', size: 220000, total: 1500 },
  { id: 5, title: 'Informe de cierre — Calibración', otNumber: 'OT-4516', date: '2026-05-26', size: 178000, total: 800 },
  { id: 6, title: 'Informe de cierre — Reemplazo motor', otNumber: 'OT-4515', date: '2026-05-25', size: 285000, total: 2100 },
]);

function onDownload(r: { title: string }) {
  notify.push(`Descargando ${r.title}`, 'success');
}
</script>
