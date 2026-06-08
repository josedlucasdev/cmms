<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto pb-12 space-y-4">
    <!-- Header con preview -->
    <AppCard padding="md">
      <div class="flex items-center gap-4">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm"
          :style="{ backgroundColor: form.avatarColor || defaultAvatarColor }"
        >
          {{ initials(form.fullName || 'NN') }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-bold text-zinc-900">
            {{ isEdit ? 'Editar Empleado' : 'Nuevo Empleado' }}
          </h2>
          <p class="text-sm text-zinc-500">
            {{ isEdit ? `Modifica los datos de ${form.fullName || 'este empleado'}` : 'Registra un nuevo técnico en tu equipo' }}
          </p>
        </div>
        <div class="hidden md:flex flex-col items-end gap-1 text-[11px] text-zinc-500">
          <span v-if="form.active" class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
            ACTIVO
          </span>
          <span v-else class="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-bold">
            INACTIVO
          </span>
        </div>
      </div>
    </AppCard>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- Datos personales -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="personOutline" class="text-zinc-500" />
          Datos personales
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.fullName" label="Nombre completo" placeholder="Ej. Juan Pérez" required />
          <FormField v-model="form.documentId" label="Cédula / Identificación" placeholder="V-12345678" required />
          <FormField v-model="form.position" label="Cargo" placeholder="Ej. Técnico de Mantenimiento" required />
          <FormField v-model="form.hireDate" label="Fecha de ingreso" type="date" required />
        </div>
      </AppCard>

      <!-- Contacto -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="callOutline" class="text-zinc-500" />
          Contacto
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.email" label="Email" type="email" placeholder="empleado@empresa.com" />
          <FormField v-model="form.phone" label="Teléfono" placeholder="+58 414 1234567" />
        </div>
      </AppCard>

      <!-- Tarifa y disponibilidad -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="cashOutline" class="text-zinc-500" />
          Tarifa horaria
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField
            v-model="form.hourlyRate"
            label="Tarifa por hora (USD)"
            type="number"
            :step="0.5"
            :min="0"
            required
            hint="Tarifa estándar por hora laborada"
          />
          <FormField
            v-model="form.overtimeRate"
            label="Tarifa horas extra (USD)"
            type="number"
            :step="0.5"
            :min="0"
            hint="Por defecto 1.5× la tarifa estándar"
          />
          <div class="flex flex-col">
            <span class="block text-xs font-semibold text-zinc-700 mb-1">Estado</span>
            <button
              type="button"
              class="h-10 px-3 rounded-lg border-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              :class="form.active
                ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
                : 'bg-zinc-50 border-zinc-300 text-zinc-500 hover:bg-zinc-100'"
              @click="form.active = !form.active"
            >
              <ion-icon :icon="form.active ? checkmarkCircleOutline : closeCircleOutline" />
              {{ form.active ? 'Activo' : 'Inactivo' }}
            </button>
            <p class="mt-1 text-[11px] text-zinc-500">
              Los empleados inactivos no aparecen en asignaciones
            </p>
          </div>
        </div>
      </AppCard>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-2 pt-1">
        <ion-button
          fill="outline"
          color="medium"
          router-link="/resources/employees"
          class="!font-semibold"
        >
          Cancelar
        </ion-button>
        <ion-button
          v-if="isEdit"
          fill="outline"
          color="danger"
          type="button"
          class="!font-semibold"
          :disabled="deleting"
          @click="onDelete"
        >
          <ion-icon slot="start" :icon="trashOutline" />
          {{ deleting ? 'Eliminando…' : 'Eliminar' }}
        </ion-button>
        <ion-button
          type="submit"
          color="primary"
          class="!font-semibold"
          :disabled="!canSubmit || saving"
        >
          <ion-icon slot="start" :icon="saveOutline" />
          {{ saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear empleado' }}
        </ion-button>
      </div>
    </form>

    <!-- Modal de confirmación Eliminar -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Eliminar empleado"
      message="¿Seguro que deseas eliminar este empleado? Se perderá su historial de asignaciones futuras."
      confirm-label="Sí, eliminar"
      confirm-color="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  personOutline, callOutline, cashOutline, saveOutline, trashOutline,
  checkmarkCircleOutline, closeCircleOutline,
} from 'ionicons/icons';
import { employeesService } from '@/services/db';
import type { Employee } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { colorFromString, initials } from '@/composables/useFormat';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();

const isEdit = computed(() => !!route.params.id);

const form = reactive({
  fullName: '',
  documentId: '',
  position: 'Técnico de Mantenimiento',
  email: '',
  phone: '',
  hourlyRate: 8,
  overtimeRate: 12,
  hireDate: new Date().toISOString().substring(0, 10),
  active: true,
  avatarColor: '' as string | undefined,
});

const saving = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);

const defaultAvatarColor = computed(() => colorFromString(form.fullName || 'NN'));

const canSubmit = computed(() =>
  form.fullName.trim().length > 1 &&
  form.documentId.trim().length > 0 &&
  form.position.trim().length > 0 &&
  form.hireDate.trim().length > 0,
);

// Auto-sincronizar tarifa HE = 1.5× tarifa estándar mientras no se haya editado manualmente
let overtimeTouched = false;
watch(() => form.hourlyRate, (v) => {
  if (!overtimeTouched) form.overtimeRate = Number((v * 1.5).toFixed(2));
});
watch(() => form.overtimeRate, () => {
  overtimeTouched = true;
});
watch(() => form.fullName, (v) => {
  if (!form.avatarColor) {
    // no asignar; el preview usa colorFromString
  }
});

async function onSubmit() {
  if (!canSubmit.value) {
    notify.push('Completa los campos obligatorios', 'warning');
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<Employee> = {
      tenantId: session.tenantId ?? undefined,
      fullName: form.fullName.trim(),
      documentId: form.documentId.trim(),
      position: form.position.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      hourlyRate: Number(form.hourlyRate),
      overtimeRate: Number(form.overtimeRate),
      hireDate: new Date(form.hireDate).toISOString(),
      active: form.active,
      avatarColor: colorFromString(form.fullName),
    };
    if (isEdit.value) {
      const updated = await employeesService.update(route.params.id as string, payload);
      if (updated) {
        notify.push('Empleado actualizado', 'success');
        router.push(`/resources/employees/${updated.id}`);
      }
    } else {
      const created = await employeesService.create(payload);
      notify.push('Empleado creado', 'success');
      router.push(`/resources/employees/${created.id}`);
    }
  } finally {
    saving.value = false;
  }
}

function onDelete() {
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!isEdit.value) return;
  deleting.value = true;
  try {
    await employeesService.remove(route.params.id as string);
    notify.push('Empleado eliminado', 'warning');
    router.push('/resources/employees');
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const emp = await employeesService.get(route.params.id as string);
    if (emp) {
      Object.assign(form, {
        fullName: emp.fullName,
        documentId: emp.documentId,
        position: emp.position,
        email: emp.email ?? '',
        phone: emp.phone ?? '',
        hourlyRate: emp.hourlyRate,
        overtimeRate: emp.overtimeRate,
        hireDate: emp.hireDate.substring(0, 10),
        active: emp.active,
        avatarColor: emp.avatarColor,
      });
      overtimeTouched = true;
    }
  }
});
</script>
