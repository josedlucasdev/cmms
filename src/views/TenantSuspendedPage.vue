<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
    <AppCard padding="lg" class="max-w-md w-full">
      <div class="text-center">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
          <ion-icon :icon="banOutline" class="text-4xl" />
        </div>
        <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">Tenant suspendido</h1>
        <p class="text-base text-zinc-600 mt-2">El acceso a esta empresa está temporalmente deshabilitado.</p>

        <div v-if="tenant" class="mt-5 p-4 bg-zinc-50 rounded-lg text-left space-y-1.5 text-sm">
          <div class="flex justify-between">
            <dt class="text-zinc-500">Empresa</dt>
            <dd class="font-bold">{{ tenant.name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-zinc-500">Código</dt>
            <dd class="font-mono font-bold">{{ tenant.code }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-zinc-500">Plan</dt>
            <dd class="font-semibold uppercase">{{ tenant.plan }}</dd>
          </div>
          <div v-if="tenant.expiresAt" class="flex justify-between">
            <dt class="text-zinc-500">Vence</dt>
            <dd class="font-semibold">{{ formatDate(tenant.expiresAt) }}</dd>
          </div>
        </div>

        <p class="text-xs text-zinc-500 mt-5 leading-relaxed">
          Esta suspensión puede deberse a un impago, mantenimiento programado o una decisión administrativa del proveedor del SaaS.
          Para reactivarla, contacta a tu administrador del sistema o al soporte de ProMaintenance.
        </p>

        <ion-button
          expand="block"
          color="primary"
          class="!font-semibold !mt-5"
          @click="onLogout"
        >
          <ion-icon slot="start" :icon="logOutOutline" />
          Cerrar sesión
        </ion-button>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { banOutline, logOutOutline } from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { tenantsService } from '@/services/db';
import type { Tenant } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import { formatDate } from '@/composables/useFormat';

const router = useRouter();
const session = useSessionStore();
const tenantStore = useTenantStore();
const tenant = ref<Tenant | null>(null);

async function onLogout() {
  await session.logout();
  router.replace('/login');
}

onMounted(async () => {
  if (session.tenantId) {
    tenant.value = await tenantsService.get(session.tenantId);
  } else if (tenantStore.currentTenant) {
    tenant.value = tenantStore.currentTenant;
  }
});
</script>
