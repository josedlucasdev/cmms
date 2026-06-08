<template>
  <div class="p-3 space-y-3">
    <h2 class="text-lg font-bold text-zinc-900">Mi Agenda</h2>
    <p class="text-xs text-zinc-500">Tus próximas OTs y mantenimientos preventivos</p>
    <div class="space-y-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white rounded-xl border border-zinc-200 p-3 flex items-center gap-3"
      >
        <div
          class="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white shrink-0"
          :style="{ backgroundColor: item.color }"
        >
          <span class="text-[10px] uppercase font-bold">{{ item.dayShort }}</span>
          <span class="text-lg font-bold leading-none">{{ item.dayNum }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-zinc-900 truncate">{{ item.title }}</p>
          <p class="text-[11px] text-zinc-500">{{ item.subtitle }}</p>
        </div>
        <ion-button size="small" fill="outline" :router-link="item.to" class="!font-semibold">Ver</ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonButton } from '@ionic/vue';

const items = computed(() => [
  { id: 1, title: 'Reparación de bomba', subtitle: 'OT-4521 · Cliente ACME', dayShort: 'LUN', dayNum: '08', color: '#3A5CFF', to: '/tasks' },
  { id: 2, title: 'Mantto. preventivo', subtitle: 'OT-4520 · Compresor', dayShort: 'MAR', dayNum: '09', color: '#16A34A', to: '/tasks' },
  { id: 3, title: 'Inspección de caldera', subtitle: 'OT-4518 · Hotel Maremares', dayShort: 'JUE', dayNum: '11', color: '#F59E0B', to: '/tasks' },
  { id: 4, title: 'Cambio de rodamientos', subtitle: 'OT-4517 · Metalúrgica', dayShort: 'VIE', dayNum: '12', color: '#8B5CF6', to: '/tasks' },
]);
</script>
