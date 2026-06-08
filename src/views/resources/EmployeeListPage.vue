<template>
  <div class="p-4 md:p-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Empleados, tarifas horarias y asignaciones</p>
      <ion-button color="primary" router-link="/resources/employees/new" class="!font-semibold">
        <ion-icon slot="start" :icon="addOutline" /> Nuevo Empleado
      </ion-button>
    </div>
    <DataTable
      :columns="columns"
      :rows="employees"
      :row-key="(e) => e.id"
      @row-click="(e) => $router.push(`/resources/employees/${e.id}`)"
    >
      <template #cell-fullName="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            :style="{ backgroundColor: row.avatarColor || colorFromString(row.fullName) }"
          >
            {{ initials(row.fullName) }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ row.fullName }}</p>
            <p class="text-[10px] text-zinc-500">{{ row.position }}</p>
          </div>
        </div>
      </template>
      <template #cell-documentId="{ value }">
        <span class="font-mono text-xs">{{ value }}</span>
      </template>
      <template #cell-hourlyRate="{ row }">
        <CurrencyDisplay :amount="row.hourlyRate" currency="USD" size="sm" />
      </template>
      <template #cell-overtimeRate="{ row }">
        <CurrencyDisplay :amount="row.overtimeRate" currency="USD" size="sm" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { employeesService } from '@/services/db';
import type { Employee } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import { colorFromString, initials } from '@/composables/useFormat';

const session = useSessionStore();
const employees = ref<Employee[]>([]);

const columns = [
  { key: 'fullName', label: 'Empleado' },
  { key: 'documentId', label: 'Cédula' },
  { key: 'position', label: 'Cargo' },
  { key: 'hourlyRate', label: 'Tarifa/h', align: 'right' as const },
  { key: 'overtimeRate', label: 'Tarifa HE', align: 'right' as const },
];

onMounted(async () => {
  employees.value = await employeesService.list(session.tenantId);
});
</script>
