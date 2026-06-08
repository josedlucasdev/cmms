<template>
  <div v-if="order" class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold font-mono">{{ order.number }}</p>
          <h2 class="text-xl font-bold">{{ supplier?.name ?? '—' }}</h2>
        </div>
        <StatusChip :status="order.status" />
      </div>
    </AppCard>
    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Líneas</h3>
      <EmptyState
        :icon="cartOutline"
        title="Sin líneas"
        description="Agrega los materiales a solicitar a este proveedor."
      >
        <template #action>
          <ion-button color="primary" class="!font-semibold mt-3">
            <ion-icon slot="start" :icon="addOutline" /> Agregar material
          </ion-button>
        </template>
      </EmptyState>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { cartOutline, addOutline } from 'ionicons/icons';
import { purchaseOrdersService, suppliersService } from '@/services/db';
import type { PurchaseOrder, Supplier } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const route = useRoute();
const order = ref<PurchaseOrder | null>(null);
const supplier = ref<Supplier | null>(null);

onMounted(async () => {
  order.value = await purchaseOrdersService.get(route.params.id as string);
  if (order.value) supplier.value = await suppliersService.get(order.value.supplierId);
});
</script>
