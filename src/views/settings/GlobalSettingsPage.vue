<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto pb-12 space-y-4">
    <p class="text-sm text-zinc-500">Configuración restringida del SaaS (solo Super Admin)</p>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Parámetros del Tenant actual</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-3 rounded-lg bg-zinc-50">
          <p class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Máx. usuarios</p>
          <p class="text-2xl font-bold font-mono mt-1">{{ global?.maxUsers ?? '—' }}</p>
        </div>
        <div class="p-3 rounded-lg bg-zinc-50">
          <p class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Almacenamiento</p>
          <p class="text-2xl font-bold font-mono mt-1">{{ (global?.maxStorageMb ?? 0) / 1024 }} GB</p>
        </div>
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Módulos habilitados</h3>
      <div class="space-y-2">
        <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50">
          <input v-model="aiEnabled" type="checkbox" class="w-4 h-4" />
          <span class="text-sm font-medium">Inteligencia Artificial (dictado de reportes)</span>
        </label>
        <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50">
          <input v-model="logisticsEnabled" type="checkbox" class="w-4 h-4" />
          <span class="text-sm font-medium">Logística avanzada</span>
        </label>
        <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50">
          <input v-model="pushEnabled" type="checkbox" class="w-4 h-4" />
          <span class="text-sm font-medium">Notificaciones push (FCM)</span>
        </label>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { settingsService } from '@/services/db';
import type { GlobalSettings } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';

const session = useSessionStore();
const global = ref<GlobalSettings | null>(null);
const aiEnabled = ref(false);
const logisticsEnabled = ref(false);
const pushEnabled = ref(false);

onMounted(async () => {
  if (!session.tenantId) return;
  global.value = await settingsService.getGlobal(session.tenantId);
  if (global.value) {
    aiEnabled.value = global.value.aiEnabled;
    logisticsEnabled.value = global.value.advancedLogisticsEnabled;
    pushEnabled.value = global.value.pushNotificationsEnabled;
  }
});
</script>
