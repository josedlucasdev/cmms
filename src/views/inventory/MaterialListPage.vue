<template>
  <div class="p-4 md:p-6 space-y-4">
    <p class="text-sm text-zinc-500">Catálogo de repuestos y consumibles</p>

    <!-- Callout de Equipos -->
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-50 !to-primary-100 !border-primary-200">
      <div class="flex items-center gap-3 flex-wrap">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shrink-0"
          style="background: linear-gradient(135deg, #2239F5, #3A5CFF);"
        >
          <ion-icon :icon="qrCodeOutline" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-bold text-zinc-800">Equipos (maquinaria y activos)</h3>
          <p class="text-[11px] text-zinc-600">
            Los equipos también forman parte de tu inventario. Cada uno tiene un QR único para
            identificación rápida desde la app móvil.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <ion-button
            fill="outline"
            size="small"
            router-link="/resources/equipment"
            class="!font-semibold"
          >
            <ion-icon slot="start" :icon="listOutline" /> Ver todos
          </ion-button>
          <ion-button
            size="small"
            color="primary"
            router-link="/resources/equipment/new"
            class="!font-semibold"
          >
            <ion-icon slot="start" :icon="addOutline" /> Nuevo Equipo
          </ion-button>
        </div>
      </div>
    </AppCard>

    <DataTable
      :columns="columns"
      :rows="materials"
      :row-key="(m) => m.id"
      @row-click="(m) => $router.push(`/inventory/${m.id}`)"
    >
      <template #cell-name="{ row }">
        <div>
          <p class="text-sm font-semibold">{{ row.name }}</p>
          <p class="text-[10px] text-zinc-500 font-mono">{{ row.sku }}</p>
        </div>
      </template>
      <template #cell-category="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">{{ row.category }}</span>
      </template>
      <template #cell-stock="{ row }">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold" :class="row.stock <= row.minStock ? 'text-red-600' : 'text-zinc-800'">
            {{ row.stock }}
          </span>
          <span class="text-[10px] text-zinc-500 font-mono">{{ row.unit }}</span>
          <span
            v-if="row.stock <= row.minStock"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700"
          >STOCK BAJO</span>
        </div>
      </template>
      <template #cell-unitCost="{ row }">
        <CurrencyDisplay :amount="row.unitCost" :currency="row.currency" size="sm" />
      </template>
      <template #cell-location="{ value }">
        <span class="text-xs text-zinc-600">{{ value ?? '—' }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { qrCodeOutline, listOutline, addOutline } from 'ionicons/icons';
import { inventoryService } from '@/services/db';
import type { Material } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';

const session = useSessionStore();
const materials = ref<Material[]>([]);

const columns = [
  { key: 'name', label: 'Material' },
  { key: 'category', label: 'Categoría' },
  { key: 'stock', label: 'Stock' },
  { key: 'unitCost', label: 'Costo unit.', align: 'right' as const },
  { key: 'location', label: 'Ubicación' },
];

onMounted(async () => {
  materials.value = await inventoryService.list(session.tenantId);
});
</script>
