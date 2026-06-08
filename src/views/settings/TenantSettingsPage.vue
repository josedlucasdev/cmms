<template>
  <div v-if="settings" class="p-4 md:p-6 max-w-4xl mx-auto pb-12 space-y-4">
    <p class="text-sm text-zinc-500">Configuración específica de tu empresa (Tenant)</p>

    <!-- Identidad del Tenant (código inmutable) -->
    <AppCard
      padding="md"
      class="!bg-gradient-to-br !from-primary-50 !to-primary-100 !border-primary-200"
    >
      <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
        <ion-icon :icon="shieldCheckmarkOutline" class="text-primary-600" />
        Identidad del Tenant
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 items-start">
        <div>
          <span class="block text-xs font-semibold text-zinc-700 mb-1">Código único</span>
          <div
            class="h-10 px-3 rounded-lg border border-primary-300 bg-white text-zinc-900 text-base font-mono font-bold flex items-center tracking-wider"
            :title="`Prefijo ${currentTenant?.code} usado en todos los códigos`"
          >
            {{ currentTenant?.code ?? '—' }}
          </div>
          <p class="mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
            <ion-icon :icon="lockClosedOutline" class="text-[10px]" />
            Inmutable · generado al crear el Tenant
          </p>
        </div>
        <div>
          <span class="block text-xs font-semibold text-zinc-700 mb-1">Nombre de la empresa</span>
          <div
            class="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm flex items-center"
          >
            {{ currentTenant?.name ?? '—' }}
          </div>
          <p class="mt-1 text-[10px] text-zinc-500">
            Este código se antepone a todos los códigos generados:
            <span class="font-mono font-semibold">{{ currentTenant?.code }}-OT-####</span>,
            <span class="font-mono font-semibold">{{ currentTenant?.code }}-COT-####</span>,
            <span class="font-mono font-semibold">{{ currentTenant?.code }}-PRY-####</span>,
            <span class="font-mono font-semibold">{{ currentTenant?.code }}-EQ-…</span>,
            <span class="font-mono font-semibold">{{ currentTenant?.code }}-SKU-####</span>,
            <span class="font-mono font-semibold">{{ currentTenant?.code }}-OC-####</span>.
          </p>
        </div>
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
        <ion-icon :icon="businessOutline" class="text-zinc-500" /> Datos fiscales
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField v-model="form.address" label="Dirección" />
        <FormField v-model="form.phone" label="Teléfono" />
        <FormField v-model="form.email" label="Email" type="email" />
        <FormField v-model="form.timezone" label="Zona horaria" />
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
        <ion-icon :icon="pricetagOutline" class="text-zinc-500" /> Impuestos y moneda
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField v-model="form.defaultCurrency" label="Moneda por defecto" select :options="currencyOptions" />
        <FormField v-model="form.taxPercent" label="IVA (%)" type="number" :step="0.5" />
        <FormField v-model="form.taxName" label="Nombre del impuesto" />
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
        <ion-icon :icon="textOutline" class="text-zinc-500" /> Prefijos de foliado
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField v-model="form.workOrderPrefix" label="Prefijo OT" />
        <FormField v-model="form.projectPrefix" label="Prefijo Proyecto" />
        <FormField v-model="form.quotePrefix" label="Prefijo Cotización" />
      </div>
    </AppCard>

    <div class="flex justify-end gap-2">
      <ion-button fill="outline" color="danger" class="!font-semibold" @click="onResetDemo">
        <ion-icon slot="start" :icon="refreshOutline" /> Restablecer datos demo
      </ion-button>
      <ion-button color="primary" class="!font-semibold" @click="onSave">
        <ion-icon slot="start" :icon="saveOutline" /> Guardar cambios
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  businessOutline, pricetagOutline, textOutline, saveOutline, refreshOutline,
  shieldCheckmarkOutline, lockClosedOutline,
} from 'ionicons/icons';
import { demoService, settingsService } from '@/services/db';
import type { Currency, TenantSettings } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import { useTenantStore } from '@/stores/tenant';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const session = useSessionStore();
const notify = useNotificationStore();
const tenant = useTenantStore();
const settings = ref<TenantSettings | null>(null);
const currentTenant = computed(() => tenant.currentTenant);

const form = reactive({
  address: '',
  phone: '',
  email: '',
  timezone: 'America/Caracas',
  defaultCurrency: 'USD' as Currency,
  taxPercent: 16,
  taxName: 'IVA',
  workOrderPrefix: 'OT',
  projectPrefix: 'PRY',
  quotePrefix: 'COT',
});

const currencyOptions = [
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'EUR', label: 'Euros (EUR)' },
  { value: 'VES', label: 'Bolívares (VES)' },
];

watch(settings, (s) => {
  if (s) Object.assign(form, s);
});

async function onSave() {
  if (!session.tenantId) return;
  await settingsService.updateTenant(session.tenantId, form);
  await tenant.setCurrent(session.tenantId);
  notify.push('Configuración guardada', 'success');
}

async function onResetDemo() {
  await demoService.reset();
  notify.push('Datos demo restablecidos', 'success');
  location.reload();
}

onMounted(async () => {
  if (!session.tenantId) return;
  settings.value = await settingsService.getTenant(session.tenantId);
});
</script>
