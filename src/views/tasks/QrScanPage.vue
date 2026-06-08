<template>
  <div class="p-3 space-y-4">
    <h2 class="text-lg font-bold text-zinc-900">Escanear QR</h2>
    <p class="text-xs text-zinc-500">Escanea el código QR de un equipo para abrir su historial o iniciar una OT</p>

    <div class="aspect-square rounded-2xl bg-zinc-900 relative overflow-hidden flex items-center justify-center">
      <div class="absolute inset-8 border-4 border-primary-400 rounded-2xl" />
      <div class="absolute left-0 right-0 top-1/2 h-0.5 bg-primary-400 animate-pulse" />
      <ion-icon :icon="qrCodeOutline" class="text-7xl text-white/30 relative z-10" />
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 p-4 space-y-2">
      <p class="text-xs font-semibold text-zinc-700">Equipos recientes escaneados</p>
      <div
        v-for="eq in recent"
        :key="eq.id"
        class="flex items-center gap-2 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer"
        @click="$router.push('/inventory')"
      >
        <div class="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center">
          <ion-icon :icon="cubeOutline" class="text-zinc-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold truncate">{{ eq.name }}</p>
          <p class="text-[10px] text-zinc-500 font-mono">{{ eq.qrCode }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { qrCodeOutline, cubeOutline } from 'ionicons/icons';
import { equipmentService } from '@/services/db';
import type { Equipment } from '@/types/domain';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const recent = ref<Equipment[]>([]);

onMounted(async () => {
  const all = await equipmentService.list(session.tenantId);
  recent.value = all.slice(0, 4);
});
</script>
