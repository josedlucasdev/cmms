<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto pb-12">
    <AppCard padding="lg">
      <h2 class="text-lg font-bold text-zinc-900 mb-1">Nueva Orden de Trabajo</h2>
      <p class="text-sm text-zinc-500 mb-5">Crea una OT y asígnale técnicos y prioridad</p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <FormField v-model="form.projectId" label="Proyecto" select :options="projectOptions" required />
        <FormField v-model="form.title" label="Título de la OT" required />
        <FormField v-model="form.description" label="Descripción" textarea :rows="2" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField v-model="form.type" label="Tipo" select :options="typeOptions" />
          <FormField v-model="form.priority" label="Prioridad" select :options="priorityOptions" />
          <FormField v-model="form.scheduledDate" label="Programada para" type="date" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField v-model="form.fixedCost" label="Costo fijo (USD)" type="number" :step="10" />
          <FormField v-model="form.logisticsCost" label="Logística (USD)" type="number" :step="10" />
          <FormField v-model="form.additionalCost" label="Adicional (USD)" type="number" :step="10" />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
          <ion-button fill="outline" color="medium" router-link="/work-orders">Cancelar</ion-button>
          <ion-button type="submit" color="primary" class="!font-semibold">Crear OT</ion-button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton } from '@ionic/vue';
import { projectsService, workOrdersService } from '@/services/db';
import type { Project } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();
const projects = ref<Project[]>([]);

const projectOptions = computed(() => projects.value.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })));
const typeOptions = [
  { value: 'corrective', label: 'Correctivo' },
  { value: 'preventive', label: 'Preventivo' },
];
const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

const form = reactive({
  projectId: (route.query.projectId as string) || '',
  title: '',
  description: '',
  type: 'corrective' as 'corrective' | 'preventive',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  status: 'pending' as const,
  fixedCost: 0,
  logisticsCost: 0,
  additionalCost: 0,
  currency: 'USD' as const,
  scheduledDate: new Date().toISOString().substring(0, 10),
  assignedUserIds: [] as string[],
  clientId: '',
});

onMounted(async () => {
  projects.value = await projectsService.list(session.tenantId ?? undefined);
  if (form.projectId) {
    const p = projects.value.find((x) => x.id === form.projectId);
    if (p) form.clientId = p.clientId;
  } else if (projects.value[0]) {
    form.projectId = projects.value[0].id;
    form.clientId = projects.value[0].clientId;
  }
});

async function onSubmit() {
  const project = projects.value.find((p) => p.id === form.projectId);
  const created = await workOrdersService.create({
    tenantId: session.tenantId ?? undefined,
    projectId: form.projectId,
    clientId: project?.clientId ?? '',
    number: `OT-${Math.floor(Math.random() * 9000) + 1000}`,
    title: form.title,
    description: form.description,
    type: form.type,
    priority: form.priority,
    fixedCost: Number(form.fixedCost),
    logisticsCost: Number(form.logisticsCost),
    additionalCost: Number(form.additionalCost),
    currency: 'USD',
    scheduledDate: form.scheduledDate,
    createdBy: session.user?.id,
    assignedUserIds: [],
  });
  notify.push('OT creada', 'success');
  router.push(`/work-orders/${created.id}`);
}
</script>
