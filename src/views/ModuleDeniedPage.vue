<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
    <AppCard padding="lg" class="max-w-md w-full">
      <div class="text-center">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
          <ion-icon :icon="lockClosedOutline" class="text-4xl" />
        </div>
        <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">Módulo no disponible</h1>
        <p class="text-base text-zinc-600 mt-2">
          El módulo <strong>{{ moduleLabel }}</strong> no está habilitado en tu plan actual.
        </p>

        <div class="mt-5 p-4 bg-zinc-50 rounded-lg text-left text-sm space-y-1.5">
          <p class="text-zinc-600">Para activarlo, el administrador del SaaS debe:</p>
          <ol class="list-decimal list-inside text-zinc-700 space-y-1 pl-1">
            <li>Ingresar a la consola del sistema (<span class="font-mono text-xs">/system/tenants</span>)</li>
            <li>Seleccionar tu empresa</li>
            <li>Activar el módulo <strong>{{ moduleLabel }}</strong> en la sección de permisos</li>
          </ol>
        </div>

        <p v-if="from" class="text-[11px] text-zinc-500 mt-4">
          Ruta solicitada: <span class="font-mono">{{ from }}</span>
        </p>

        <div class="flex gap-2 mt-5">
          <ion-button
            expand="block"
            fill="outline"
            color="medium"
            router-link="/dashboard"
            class="!font-semibold flex-1"
          >
            <ion-icon slot="start" :icon="homeOutline" />
            Inicio
          </ion-button>
          <ion-button
            expand="block"
            color="primary"
            class="!font-semibold flex-1"
            @click="onBack"
          >
            <ion-icon slot="start" :icon="arrowBackOutline" />
            Volver
          </ion-button>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { lockClosedOutline, homeOutline, arrowBackOutline } from 'ionicons/icons';
import { ALL_MODULES, type ModuleKey } from '@/constants/modules';
import AppCard from '@/components/common/AppCard.vue';

const route = useRoute();
const router = useRouter();

const moduleKey = computed(() => route.query.module as ModuleKey | undefined);
const from = computed(() => (route.query.from as string) ?? '');

const moduleLabel = computed(() => {
  if (!moduleKey.value) return 'desconocido';
  return ALL_MODULES.find((m) => m.key === moduleKey.value)?.label ?? moduleKey.value;
});

function onBack() {
  if (window.history.length > 1) router.back();
  else router.push('/dashboard');
}
</script>
