<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <AppCard padding="md">
      <h2 class="text-lg font-bold text-zinc-900 mb-1">Logística y Traslados</h2>
      <p class="text-sm text-zinc-500 mb-5">Registra kilómetros, combustible y viáticos de cada visita</p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <FormField v-model="form.workOrderId" label="Orden de Trabajo" select :options="woOptions" required />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.vehiclePlate" label="Placa del vehículo" placeholder="ABC-123" required />
          <FormField v-model="form.driverId" label="Conductor" select :options="employeeOptions" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.startKm" label="Km inicial" type="number" />
          <FormField v-model="form.endKm" label="Km final" type="number" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField v-model="form.fuelCost" label="Combustible (USD)" type="number" :step="0.01" />
          <FormField v-model="form.tollCost" label="Peajes (USD)" type="number" :step="0.01" />
          <FormField v-model="form.mealCost" label="Viáticos (USD)" type="number" :step="0.01" />
        </div>
        <div v-if="distance > 0" class="bg-zinc-50 rounded-lg p-3 text-sm flex justify-between">
          <span class="text-zinc-600">Distancia total</span>
          <span class="font-mono font-bold">{{ distance }} km</span>
        </div>
        <FormField v-model="form.notes" label="Notas" textarea :rows="2" />

        <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
          <ion-button type="submit" color="primary" class="!font-semibold">Registrar traslado</ion-button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { IonButton } from '@ionic/vue';
import {
  employeesService, tripsService, workOrdersService,
} from '@/services/db';
import type { Employee, WorkOrder } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const session = useSessionStore();
const notify = useNotificationStore();
const workOrders = ref<WorkOrder[]>([]);
const employees = ref<Employee[]>([]);

const woOptions = computed(() => workOrders.value.map((w) => ({ value: w.id, label: `${w.number} — ${w.title}` })));
const employeeOptions = computed(() => employees.value.map((e) => ({ value: e.id, label: e.fullName })));

const form = reactive({
  workOrderId: '',
  vehiclePlate: '',
  driverId: '',
  startKm: 0,
  endKm: 0,
  fuelCost: 0,
  tollCost: 0,
  mealCost: 0,
  notes: '',
});

const distance = computed(() => Math.max(0, Number(form.endKm) - Number(form.startKm)));

async function onSubmit() {
  await tripsService.create({
    tenantId: session.tenantId ?? undefined,
    workOrderId: form.workOrderId,
    vehiclePlate: form.vehiclePlate,
    driverId: form.driverId,
    startKm: Number(form.startKm),
    endKm: Number(form.endKm),
    fuelCost: Number(form.fuelCost),
    tollCost: Number(form.tollCost),
    mealCost: Number(form.mealCost),
    totalDistanceKm: distance.value,
    notes: form.notes,
  });
  notify.push('Traslado registrado', 'success');
  Object.assign(form, { startKm: 0, endKm: 0, fuelCost: 0, tollCost: 0, mealCost: 0, notes: '' });
}

onMounted(async () => {
  workOrders.value = await workOrdersService.list(session.tenantId);
  employees.value = await employeesService.list(session.tenantId);
  if (workOrders.value[0]) form.workOrderId = workOrders.value[0].id;
  if (employees.value[0]) form.driverId = employees.value[0].id;
});
</script>
