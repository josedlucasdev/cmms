<template>
  <div class="p-4 md:p-6 max-w-5xl mx-auto pb-12 space-y-4">
    <AppCard padding="md">
      <h2 class="text-lg font-bold text-zinc-900 mb-1">Nueva Cotización</h2>
      <p class="text-sm text-zinc-500 mb-4">Calcula totales con impuestos configurables</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <FormField v-model="form.clientId" label="Cliente" select :options="clientOptions" required />
        <FormField
          v-model="form.number"
          label="Número de cotización"
          readonly
          hint="Se genera automáticamente al guardar"
        />
        <FormField
          v-model="form.taxPercent"
          label="IVA (%)"
          type="number"
          :step="0.5"
          readonly
          :hint="`${tenantSettings?.taxName ?? 'IVA'} configurado en Ajustes del Tenant (${tenantSettings?.taxPercent ?? 16}%)`"
        />
      </div>

      <!-- Tabla de ítems -->
      <div class="border border-zinc-200 rounded-xl overflow-hidden mb-4">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th class="px-3 py-2 text-left">Tipo</th>
              <th class="px-3 py-2 text-left">Descripción</th>
              <th class="px-3 py-2 text-right">Cant.</th>
              <th class="px-3 py-2 text-right">P. Unit.</th>
              <th class="px-3 py-2 text-right">Total</th>
              <th class="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in form.items" :key="item.id" class="border-t border-zinc-100">
              <td class="px-3 py-2">
                <select v-model="item.type" style="color-scheme: light;" class="text-xs border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-900">
                  <option value="labor">Mano de Obra</option>
                  <option value="equipment">Equipo</option>
                  <option value="material">Material</option>
                  <option value="logistics">Logística</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <input v-model="item.description" style="color-scheme: light;" class="w-full text-sm border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-900 placeholder:text-zinc-400" placeholder="Descripción" />
              </td>
              <td class="px-3 py-2 text-right">
                <input v-model.number="item.quantity" type="number" min="0" step="0.5" style="color-scheme: light;" class="w-20 text-right text-sm border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-900" />
              </td>
              <td class="px-3 py-2 text-right">
                <input v-model.number="item.unitPrice" type="number" min="0" step="0.01" style="color-scheme: light;" class="w-24 text-right text-sm border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-900" />
              </td>
              <td class="px-3 py-2 text-right font-mono font-semibold">
                {{ formatMoney(item.quantity * item.unitPrice) }}
              </td>
              <td class="px-3 py-2 text-right">
                <button class="text-zinc-400 hover:text-red-600" @click="removeItem(idx)">
                  <ion-icon :icon="trashOutline" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="p-3 border-t border-zinc-100 bg-zinc-50">
          <button class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1" @click="addItem">
            <ion-icon :icon="addOutline" /> Agregar ítem
          </button>
        </div>
      </div>

      <!-- Totales -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField v-model="form.notes" label="Notas" textarea :rows="3" />
        <div class="bg-zinc-50 rounded-xl p-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-600">Subtotal</span>
            <span class="font-mono font-semibold">{{ formatMoney(subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600">IVA ({{ form.taxPercent }}%)</span>
            <span class="font-mono font-semibold">{{ formatMoney(taxAmount) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold border-t border-zinc-200 pt-2">
            <span>Total</span>
            <span class="font-mono">{{ formatMoney(total) }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-zinc-200 mt-4">
        <ion-button fill="outline" color="medium" router-link="/quotes">Cancelar</ion-button>
        <ion-button color="primary" class="!font-semibold" @click="onSave">
          <ion-icon slot="start" :icon="saveOutline" /> Guardar cotización
        </ion-button>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline, saveOutline, trashOutline } from 'ionicons/icons';
import { clientsService, quotesService } from '@/services/db';
import type { Client, QuoteLineItem } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const router = useRouter();
const session = useSessionStore();
const tenantStore = useTenantStore();
const notify = useNotificationStore();
const clients = ref<Client[]>([]);
const tenantSettings = computed(() => tenantStore.settings);

const clientOptions = computed(() => clients.value.map((c) => ({ value: c.id, label: c.name })));

function uid() { return Math.random().toString(36).slice(2); }

function nextQuoteNumber(): string {
  const prefix = tenantStore.settings?.quotePrefix ?? 'COT';
  return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
}

const form = reactive({
  clientId: '',
  number: nextQuoteNumber(),
  taxPercent: tenantStore.settings?.taxPercent ?? 16,
  currency: 'USD' as const,
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
  items: [
    { id: uid(), type: 'labor' as const, description: 'Mano de obra especializada', quantity: 8, unitPrice: 25 },
  ] as QuoteLineItem[],
  notes: '',
});

const subtotal = computed(() => form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
const taxAmount = computed(() => subtotal.value * (form.taxPercent / 100));
const total = computed(() => subtotal.value + taxAmount.value);

function formatMoney(v: number): string {
  return `US$ ${v.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addItem() {
  form.items.push({ id: uid(), type: 'labor', description: '', quantity: 1, unitPrice: 0 });
}
function removeItem(idx: number) {
  form.items.splice(idx, 1);
}

async function onSave() {
  const created = await quotesService.create({
    tenantId: session.tenantId ?? undefined,
    clientId: form.clientId,
    number: form.number,
    items: form.items,
    taxPercent: form.taxPercent,
    currency: 'USD',
    validUntil: form.validUntil,
    notes: form.notes,
    createdBy: session.user?.id,
  });
  notify.push('Cotización guardada', 'success');
  router.push(`/quotes/${created.id}`);
}

onMounted(async () => {
  clients.value = await clientsService.list(session.tenantId);
  if (clients.value[0]) form.clientId = clients.value[0].id;
  // Refrescar valores autocompletados desde el Tenant
  let settings = tenantStore.settings;
  if (!settings && session.tenantId) {
    await tenantStore.setCurrent(session.tenantId);
    settings = tenantStore.settings;
  }
  if (settings) {
    form.taxPercent = settings.taxPercent;
    form.number = nextQuoteNumber();
  }
});
</script>
