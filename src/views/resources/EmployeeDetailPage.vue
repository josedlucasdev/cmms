<template>
  <div v-if="employee" class="p-4 md:p-6 space-y-4 pb-12">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-center gap-3">
        <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
          {{ initials(employee.fullName) }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl font-bold">{{ employee.fullName }}</h2>
          <p class="text-sm opacity-90">{{ employee.position }}</p>
          <p class="text-xs opacity-80 font-mono">{{ employee.documentId }}</p>
        </div>
        <ion-button
          fill="outline"
          color="light"
          size="small"
          :router-link="`/resources/employees/${employee.id}/edit`"
          class="!font-semibold"
        >
          <ion-icon slot="start" :icon="createOutline" /> Editar
        </ion-button>
      </div>
    </AppCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Tarifas</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-zinc-600">Tarifa por hora</span><CurrencyDisplay :amount="employee.hourlyRate" currency="USD" size="md" /></div>
          <div class="flex justify-between"><span class="text-zinc-600">Tarifa horas extra</span><CurrencyDisplay :amount="employee.overtimeRate" currency="USD" size="md" /></div>
        </div>
      </AppCard>
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Contacto</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-zinc-500">Email</dt><dd class="font-semibold">{{ employee.email ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Teléfono</dt><dd class="font-semibold">{{ employee.phone ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Ingreso</dt><dd class="font-semibold">{{ formatDate(employee.hireDate) }}</dd></div>
        </dl>
      </AppCard>
    </div>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Historial de asignaciones</h3>
      <EmptyState
        :icon="clipboardOutline"
        title="Sin asignaciones recientes"
        description="Aquí verás las OTs y tareas en las que ha trabajado este técnico."
      />
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import { clipboardOutline, createOutline } from 'ionicons/icons';
import { employeesService } from '@/services/db';
import type { Employee } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import AppCard from '@/components/common/AppCard.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { formatDate, initials } from '@/composables/useFormat';

const route = useRoute();
const session = useSessionStore();
const employee = ref<Employee | null>(null);

onMounted(async () => {
  employee.value = await employeesService.get(route.params.id as string);
});
</script>
