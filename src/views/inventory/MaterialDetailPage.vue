<template>
  <div v-if="material" class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <AppCard padding="md">
      <p class="text-[10px] font-mono text-zinc-500 uppercase">{{ material.sku }}</p>
      <h2 class="text-xl font-bold text-zinc-900">{{ material.name }}</h2>
      <p class="text-sm text-zinc-600">{{ material.category }}</p>
    </AppCard>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KpiCard label="Stock actual" :icon="layersOutline" hoverable>
        <template #value><span class="text-2xl font-bold">{{ material.stock }} {{ material.unit }}</span></template>
      </KpiCard>
      <KpiCard label="Stock mínimo" :icon="alertCircleOutline" icon-color="#F59E0B" icon-bg="rgba(245, 158, 11, 0.12)" hoverable>
        <template #value><span class="text-2xl font-bold">{{ material.minStock }} {{ material.unit }}</span></template>
      </KpiCard>
      <KpiCard label="Costo unitario" :icon="cashOutline" hoverable>
        <template #value><CurrencyDisplay :amount="material.unitCost" :currency="material.currency" size="md" /></template>
      </KpiCard>
      <KpiCard label="Ubicación" :icon="locationOutline" icon-color="#8B5CF6" icon-bg="rgba(139, 92, 246, 0.12)" hoverable>
        <template #value><span class="text-sm font-bold">{{ material.location ?? '—' }}</span></template>
      </KpiCard>
    </div>
    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Información</h3>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between"><dt class="text-zinc-500">Código de barras</dt><dd class="font-mono font-semibold">{{ material.barcode ?? '—' }}</dd></div>
        <div class="flex justify-between"><dt class="text-zinc-500">Garantía de fábrica</dt><dd class="font-semibold">{{ material.warrantyDays ?? '—' }} días</dd></div>
      </dl>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { layersOutline, alertCircleOutline, cashOutline, locationOutline } from 'ionicons/icons';
import { inventoryService } from '@/services/db';
import type { Material } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';

const route = useRoute();
const material = ref<Material | null>(null);

onMounted(async () => {
  material.value = await inventoryService.get(route.params.id as string);
});
</script>
