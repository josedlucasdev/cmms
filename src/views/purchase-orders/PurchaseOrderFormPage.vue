<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto pb-12">
    <AppCard padding="lg">
      <h2 class="text-lg font-bold text-zinc-900 mb-1">Nueva Orden de Compra</h2>
      <p class="text-sm text-zinc-500 mb-5">Emite una OC a un proveedor</p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.supplierId" label="Proveedor" select :options="supplierOptions" required />
          <FormField v-model="form.number" label="Número" placeholder="OC-XXXX" />
        </div>
        <FormField v-model="form.notes" label="Notas" textarea :rows="2" />

        <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
          <ion-button fill="outline" color="medium" router-link="/purchase-orders">Cancelar</ion-button>
          <ion-button type="submit" color="primary" class="!font-semibold">Crear OC</ion-button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton } from '@ionic/vue';
import { purchaseOrdersService, suppliersService } from '@/services/db';
import type { Supplier } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();
const suppliers = ref<Supplier[]>([]);

const supplierOptions = computed(() => suppliers.value.map((s) => ({ value: s.id, label: s.name })));

const form = reactive({
  supplierId: '',
  number: `OC-${Math.floor(Math.random() * 9000) + 1000}`,
  notes: '',
});

async function onSubmit() {
  const created = await purchaseOrdersService.create({
    tenantId: session.tenantId ?? undefined,
    supplierId: form.supplierId,
    number: form.number,
    notes: form.notes,
    createdBy: session.user?.id,
    lines: [],
    status: 'draft',
    taxPercent: 16,
    currency: 'USD',
    totalCost: 0,
  });
  notify.push('OC creada', 'success');
  router.push(`/purchase-orders/${created.id}`);
}

onMounted(async () => {
  suppliers.value = await suppliersService.list(session.tenantId);
  if (suppliers.value[0]) form.supplierId = suppliers.value[0].id;
});
</script>
