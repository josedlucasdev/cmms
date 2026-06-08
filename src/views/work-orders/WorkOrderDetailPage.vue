<template>
  <div v-if="workOrder" class="p-4 md:p-6 space-y-4 pb-12">
    <AppCard padding="md" class="!bg-gradient-to-br !from-primary-600 !to-primary-800 !text-white !border-0">
      <div class="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p class="text-[10px] uppercase tracking-wider opacity-80 font-bold font-mono">{{ workOrder.number }}</p>
          <h2 class="text-xl font-bold mt-0.5">{{ workOrder.title }}</h2>
          <p class="text-sm opacity-90 mt-1">{{ client?.name }} · {{ project?.name }}</p>
        </div>
        <div class="flex items-center gap-2">
          <StatusChip :status="workOrder.status" />
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
            :style="{ backgroundColor: priorityColor(workOrder.priority) + '30', color: '#fff' }"
          >{{ workOrder.priority }}</span>
        </div>
      </div>
    </AppCard>

    <!-- Tabs -->
    <div class="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
        :class="activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'resumen'">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <AppCard padding="md" class="lg:col-span-2">
          <h3 class="text-sm font-bold text-zinc-800 mb-3">Descripción</h3>
          <p class="text-sm text-zinc-700 leading-relaxed">{{ workOrder.description ?? 'Sin descripción.' }}</p>

          <h3 class="text-sm font-bold text-zinc-800 mt-5 mb-3">Costos</h3>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between"><span class="text-zinc-600">Costo fijo</span><CurrencyDisplay :amount="workOrder.fixedCost" :currency="workOrder.currency" size="sm" /></div>
            <div class="flex justify-between"><span class="text-zinc-600">Logística / Traslado</span><CurrencyDisplay :amount="workOrder.logisticsCost" :currency="workOrder.currency" size="sm" /></div>
            <div class="flex justify-between"><span class="text-zinc-600">Adicional</span><CurrencyDisplay :amount="workOrder.additionalCost" :currency="workOrder.currency" size="sm" /></div>
            <div class="flex justify-between border-t border-zinc-200 pt-1.5 text-base font-bold"><span>Total OT</span><CurrencyDisplay :amount="totalOt" :currency="workOrder.currency" size="md" /></div>
          </div>
        </AppCard>
        <AppCard padding="md">
          <h3 class="text-sm font-bold text-zinc-800 mb-3">Información</h3>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-zinc-500">Tipo</dt><dd class="font-semibold uppercase text-xs">{{ workOrder.type }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-500">Prioridad</dt><dd class="font-semibold uppercase text-xs">{{ workOrder.priority }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-500">Programada</dt><dd class="font-semibold">{{ formatDate(workOrder.scheduledDate) }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-500">Completada</dt><dd class="font-semibold">{{ formatDate(workOrder.completedAt) }}</dd></div>
          </dl>
        </AppCard>
      </div>
    </div>

    <!-- ============== TAREAS ============== -->
    <div v-if="activeTab === 'tareas'" class="space-y-3">
      <!-- Botón + formulario inline -->
      <AppCard padding="md">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-base font-bold text-zinc-900">Tareas de la OT</h3>
            <p class="text-[11px] text-zinc-500">{{ tasks.length }} tarea(s) registrada(s)</p>
          </div>
          <ion-button
            v-if="!showAddTask"
            size="small"
            color="primary"
            class="!font-semibold"
            @click="openAddTask"
          >
            <ion-icon slot="start" :icon="addOutline" /> Nueva Tarea
          </ion-button>
          <ion-button
            v-else
            size="small"
            fill="outline"
            color="medium"
            class="!font-semibold"
            @click="closeAddTask"
          >
            Cancelar
          </ion-button>
        </div>

        <!-- Formulario de creación -->
        <form
          v-if="showAddTask"
          class="border border-primary-200 bg-primary-50/30 rounded-xl p-3 mb-3 space-y-3"
          @submit.prevent="onCreateTask"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              v-model="newTask.description"
              label="Descripción de la tarea"
              placeholder="Ej. Reemplazar rodamientos"
              required
            />
            <FormField
              v-model="newTask.estimatedHours"
              label="Horas estimadas"
              type="number"
              :step="0.5"
              :min="0"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField
              v-model="newTask.status"
              label="Estado inicial"
              select
              :options="taskStatusOptions"
            />
            <FormField
              v-model="newTask.additionalCost"
              label="Costo adicional (USD)"
              type="number"
              :step="10"
              :min="0"
            />
            <FormField
              v-model="newTask.assignedUserIds"
              label="Asignar a (opcional)"
              select
              :options="technicianOptions"
            />
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <ion-button fill="outline" color="medium" size="small" class="!font-semibold" @click="closeAddTask">
              Cancelar
            </ion-button>
            <ion-button
              type="submit"
              color="primary"
              size="small"
              class="!font-semibold"
              :disabled="!newTask.description.trim() || creating"
            >
              <ion-icon slot="start" :icon="checkmarkDoneOutline" />
              {{ creating ? 'Creando…' : 'Crear tarea' }}
            </ion-button>
          </div>
        </form>

        <DataTable
          :columns="taskColumns"
          :rows="tasks"
          :row-key="(t) => t.id"
        >
          <template #cell-actions="{ row }">
            <div class="flex items-center gap-1 justify-end">
              <ion-button
                size="small"
                fill="outline"
                :router-link="`/tasks/${workOrder.id}/${row.id}`"
                class="!font-semibold"
              >
                <ion-icon slot="start" :icon="playOutline" /> Iniciar
              </ion-button>
              <ion-button
                size="small"
                fill="clear"
                color="danger"
                class="!font-semibold"
                @click.stop="onDeleteTask(row.id)"
              >
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </template>
          <template #cell-status="{ row }"><StatusChip :status="row.status" /></template>
          <template #cell-assignedUserIds="{ row }">
            <span v-if="row.assignedUserIds.length === 0" class="text-[11px] text-zinc-400">Sin asignar</span>
            <span v-else class="text-[11px] font-semibold text-zinc-700">
              {{ userNameById(row.assignedUserIds[0]) }}
            </span>
          </template>
        </DataTable>
      </AppCard>
    </div>

    <div v-if="activeTab === 'materiales'">
      <EmptyState
        :icon="layersOutline"
        title="Sin consumos registrados"
        description="El técnico registrará el consumo de materiales durante la ejecución de la OT."
      />
    </div>

    <div v-if="activeTab === 'traslados'">
      <EmptyState
        :icon="carOutline"
        title="Sin traslados"
        description="Registra kilómetros, combustible y viáticos al finalizar la visita."
      />
    </div>

    <div v-if="activeTab === 'informe'">
      <EmptyState
        :icon="documentTextOutline"
        title="Informe de cierre PDF"
        description="Al completar la OT, el sistema generará automáticamente un PDF con costos, evidencia y firmas."
      >
        <template #action>
          <ion-button fill="outline" color="primary" class="!font-semibold mt-3">
            <ion-icon slot="start" :icon="downloadOutline" /> Vista previa PDF
          </ion-button>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  playOutline, layersOutline, carOutline, documentTextOutline, downloadOutline,
  addOutline, trashOutline, checkmarkDoneOutline,
} from 'ionicons/icons';
import {
  clientsService, employeesService, projectsService, tasksService, workOrdersService,
} from '@/services/db';
import type { Client, Employee, Project, Task, WorkOrder, WorkOrderStatus } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import StatusChip from '@/components/common/StatusChip.vue';
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import FormField from '@/components/common/FormField.vue';
import { formatDate, priorityColor } from '@/composables/useFormat';

const route = useRoute();
const session = useSessionStore();
const notify = useNotificationStore();
const workOrder = ref<WorkOrder | null>(null);
const client = ref<Client | null>(null);
const project = ref<Project | null>(null);
const tasks = ref<Task[]>([]);
const employees = ref<Employee[]>([]);

type TabKey = 'resumen' | 'tareas' | 'materiales' | 'traslados' | 'informe';
const activeTab = ref<TabKey>('resumen');
const tabs: { key: TabKey; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'tareas', label: 'Tareas' },
  { key: 'materiales', label: 'Materiales' },
  { key: 'traslados', label: 'Traslados' },
  { key: 'informe', label: 'Informe Cierre' },
];

// === Crear tarea ===
const showAddTask = ref(false);
const creating = ref(false);
const newTask = reactive({
  description: '',
  estimatedHours: 1,
  status: 'pending' as WorkOrderStatus,
  additionalCost: 0,
  assignedUserIds: '',
});

const taskStatusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'stopped', label: 'Detenida' },
  { value: 'completed', label: 'Completada' },
];

const technicianOptions = computed(() => [
  { value: '', label: '— Sin asignar —' },
  ...employees.value.map((e) => ({ value: e.id, label: e.fullName })),
]);

function openAddTask() {
  newTask.description = '';
  newTask.estimatedHours = 1;
  newTask.status = 'pending';
  newTask.additionalCost = 0;
  newTask.assignedUserIds = '';
  showAddTask.value = true;
}
function closeAddTask() {
  showAddTask.value = false;
}

async function onCreateTask() {
  if (!workOrder.value || !newTask.description.trim()) return;
  creating.value = true;
  try {
    await tasksService.create({
      tenantId: workOrder.value.tenantId,
      workOrderId: workOrder.value.id,
      description: newTask.description.trim(),
      estimatedHours: Number(newTask.estimatedHours) || 1,
      status: newTask.status,
      additionalCost: Number(newTask.additionalCost) || 0,
      assignedUserIds: newTask.assignedUserIds ? [newTask.assignedUserIds] : [],
    });
    notify.push('Tarea creada', 'success');
    showAddTask.value = false;
    tasks.value = await tasksService.listByWorkOrder(workOrder.value.id);
  } finally {
    creating.value = false;
  }
}

async function onDeleteTask(id: string) {
  await tasksService.remove(id);
  if (workOrder.value) {
    tasks.value = await tasksService.listByWorkOrder(workOrder.value.id);
  }
  notify.push('Tarea eliminada', 'warning');
}

function userNameById(id: string): string {
  return employees.value.find((e) => e.id === id)?.fullName ?? '—';
}

const totalOt = computed(() => {
  if (!workOrder.value) return 0;
  const tasksTotal = tasks.value.reduce((s, t) => s + t.additionalCost, 0);
  return workOrder.value.fixedCost + workOrder.value.logisticsCost + workOrder.value.additionalCost + tasksTotal;
});

const taskColumns = [
  { key: 'number', label: '#' },
  { key: 'description', label: 'Tarea' },
  { key: 'estimatedHours', label: 'Horas est.', align: 'right' as const },
  { key: 'assignedUserIds', label: 'Asignado a' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: '' },
];

async function loadAll() {
  if (!workOrder.value) return;
  tasks.value = await tasksService.listByWorkOrder(workOrder.value.id);
}

onMounted(async () => {
  const id = route.params.id as string;
  workOrder.value = await workOrdersService.get(id);
  if (workOrder.value) {
    client.value = await clientsService.get(workOrder.value.clientId);
    project.value = await projectsService.get(workOrder.value.projectId);
    tasks.value = await tasksService.listByWorkOrder(workOrder.value.id);
  }
  employees.value = await employeesService.list(session.tenantId ?? undefined);
});
</script>
