<template>
  <div
    class="w-full bg-white/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 sm:p-8"
    style="max-width: 28rem;"
  >
    <div class="flex flex-col items-center mb-6">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg mb-3">
        <ion-icon :icon="globeOutline" class="text-2xl" />
      </div>
      <h1 class="text-2xl font-bold text-zinc-900">Portal del Cliente</h1>
      <p class="text-xs text-zinc-500 mt-0.5">Acceso seguro a tus proyectos</p>
    </div>

    <form class="space-y-3" @submit.prevent="onLogin">
      <FormField v-model="email" label="Email" type="email" placeholder="cliente@empresa.com" />
      <FormField v-model="token" label="Código de acceso" placeholder="XXXX-XXXX" />
      <ion-button type="submit" expand="block" class="!font-semibold !h-12">
        <ion-icon slot="start" :icon="logInOutline" />
        Acceder
      </ion-button>
    </form>

    <div class="mt-5 text-center">
      <router-link to="/login" class="text-xs text-primary-600 font-semibold">
        ← Volver al login de empresa
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { globeOutline, logInOutline } from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import FormField from '@/components/common/FormField.vue';

const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();
const email = ref('cliente@acme.demo');
const token = ref('');

async function onLogin() {
  // Simulación: en esta fase cualquier email/toke entra como "client"
  await session.login(email.value, 'client', 'T-001');
  notify.push('Bienvenido al portal', 'success');
  router.push('/portal');
}
</script>
