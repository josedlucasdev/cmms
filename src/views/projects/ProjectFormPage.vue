<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto pb-12">
    <AppCard padding="lg">
      <h2 class="text-lg font-bold text-zinc-900 mb-1">{{ isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h2>
      <p class="text-sm text-zinc-500 mb-5">Crea un proyecto y asígnale un cliente y presupuesto</p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <FormField v-model="form.clientId" label="Cliente" select :options="clientOptions" required />
        <FormField v-model="form.name" label="Nombre del proyecto" required />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField v-model="form.code" label="Código" placeholder="PRY-XXXX" />
          <FormField v-model="form.budget" label="Presupuesto (USD)" type="number" :step="100" />
          <FormField v-model="form.status" label="Estado" select :options="statusOptions" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.startDate" label="Fecha de inicio" type="date" />
          <FormField v-model="form.endDate" label="Fecha de fin" type="date" />
        </div>
        <FormField v-model="form.description" label="Descripción" textarea :rows="3" />

        <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
          <ion-button fill="outline" color="medium" router-link="/projects">Cancelar</ion-button>
          <ion-button type="submit" color="primary" class="!font-semibold">
            {{ isEdit ? 'Guardar cambios' : 'Crear proyecto' }}
          </ion-button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton } from '@ionic/vue';
import { clientsService, projectsService } from '@/services/db';
import type { Client } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();
const clients = ref<Client[]>([]);

const isEdit = computed(() => !!route.params.id);
const clientOptions = computed(() => clients.value.map((c) => ({ value: c.id, label: c.name })));
const statusOptions = [
  { value: 'planning', label: 'Planificación' },
  { value: 'active', label: 'Activo' },
  { value: 'on_hold', label: 'En Pausa' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const form = reactive({
  clientId: '',
  name: '',
  code: `PRY-${Math.floor(Math.random() * 9000) + 1000}`,
  description: '',
  budget: 10000,
  additionalCost: 0,
  currency: 'USD' as const,
  startDate: new Date().toISOString().substring(0, 10),
  endDate: '',
  status: 'planning' as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
  progress: 0,
});

onMounted(async () => {
  clients.value = await clientsService.list(session.tenantId ?? undefined);
  if (isEdit.value) {
    const p = await projectsService.get(route.params.id as string);
    if (p) Object.assign(form, p, { startDate: p.startDate.substring(0, 10), endDate: p.endDate?.substring(0, 10) ?? '' });
  } else if (clients.value[0]) {
    form.clientId = clients.value[0].id;
  }
});

async function onSubmit() {
  if (isEdit.value) {
    await projectsService.update(route.params.id as string, { ...form, endDate: form.endDate || undefined });
    notify.push('Proyecto actualizado', 'success');
    router.push(`/projects/${route.params.id}`);
  } else {
    const created = await projectsService.create({ ...form, tenantId: session.tenantId ?? undefined });
    notify.push('Proyecto creado', 'success');
    router.push(`/projects/${created.id}`);
  }
}
</script>
