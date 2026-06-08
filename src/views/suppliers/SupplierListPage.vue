<template>
  <div class="p-4 md:p-6 space-y-4">
    <p class="text-sm text-zinc-500">Talleres externos, subcontratistas y proveedores</p>
    <DataTable
      :columns="columns"
      :rows="suppliers"
      :row-key="(s) => s.id"
      @row-click="(s) => $router.push(`/suppliers/${s.id}`)"
    >
      <template #cell-name="{ row }">
        <p class="text-sm font-semibold">{{ row.name }}</p>
      </template>
      <template #cell-rating="{ row }">
        <div class="flex items-center gap-0.5">
          <ion-icon
            v-for="i in 5"
            :key="i"
            :icon="star"
            :class="i <= Math.round(row.rating) ? 'text-amber-500' : 'text-zinc-200'"
            class="text-xs"
          />
        </div>
      </template>
      <template #cell-category="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">{{ row.category }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { star } from 'ionicons/icons';
import { suppliersService } from '@/services/db';
import type { Supplier } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';

const session = useSessionStore();
const suppliers = ref<Supplier[]>([]);

const columns = [
  { key: 'name', label: 'Proveedor' },
  { key: 'category', label: 'Categoría' },
  { key: 'rating', label: 'Rating' },
  { key: 'contactName', label: 'Contacto' },
  { key: 'phone', label: 'Teléfono' },
];

onMounted(async () => {
  suppliers.value = await suppliersService.list(session.tenantId);
});
</script>
