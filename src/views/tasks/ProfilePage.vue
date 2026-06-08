<template>
  <div v-if="user" class="p-3 space-y-3">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-center gap-3">
        <div
          class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold"
        >
          {{ initials(user.fullName) }}
        </div>
        <div>
          <h2 class="text-lg font-bold">{{ user.fullName }}</h2>
          <p class="text-xs opacity-80">{{ user.email }}</p>
        </div>
      </div>
    </AppCard>

    <div class="grid grid-cols-3 gap-2">
      <AppCard padding="sm" class="text-center">
        <p class="text-2xl font-bold text-zinc-900 tabular-nums">{{ stats.completed }}</p>
        <p class="text-[10px] uppercase font-semibold text-zinc-500 mt-0.5">Completadas</p>
      </AppCard>
      <AppCard padding="sm" class="text-center">
        <p class="text-2xl font-bold text-amber-600 tabular-nums">{{ stats.pending }}</p>
        <p class="text-[10px] uppercase font-semibold text-zinc-500 mt-0.5">Pendientes</p>
      </AppCard>
      <AppCard padding="sm" class="text-center">
        <p class="text-2xl font-bold text-primary-600 tabular-nums">{{ stats.hours }}h</p>
        <p class="text-[10px] uppercase font-semibold text-zinc-500 mt-0.5">Este mes</p>
      </AppCard>
    </div>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Acciones</h3>
      <div class="space-y-1">
        <button class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 text-left text-sm font-medium text-zinc-700">
          <ion-icon :icon="personOutline" class="text-zinc-400" /> Mi perfil
        </button>
        <button class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 text-left text-sm font-medium text-zinc-700">
          <ion-icon :icon="notificationsOutline" class="text-zinc-400" /> Notificaciones
        </button>
        <button class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 text-left text-sm font-medium text-zinc-700">
          <ion-icon :icon="settingsOutline" class="text-zinc-400" /> Preferencias
        </button>
        <button class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 text-left text-sm font-medium text-red-600" @click="logout">
          <ion-icon :icon="logOutOutline" /> Cerrar sesión
        </button>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { personOutline, notificationsOutline, settingsOutline, logOutOutline } from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { initials } from '@/composables/useFormat';
import AppCard from '@/components/common/AppCard.vue';

const session = useSessionStore();
const router = useRouter();
const user = session.user;
const stats = ref({ completed: 12, pending: 4, hours: 68 });

async function logout() {
  await session.logout();
  router.replace('/login');
}
</script>
