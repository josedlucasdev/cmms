<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto pb-12 space-y-4">
    <!-- Header -->
    <AppCard padding="md">
      <div class="flex items-start gap-4">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm"
          :style="{ backgroundColor: 'linear-gradient(135deg, #2239F5, #3A5CFF)' }"
        >
          <ion-icon :icon="cubeOutline" class="text-2xl" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-bold text-zinc-900">
            {{ isEdit ? 'Editar Equipo' : 'Nuevo Equipo' }}
          </h2>
          <p class="text-sm text-zinc-500">
            {{ isEdit ? `Modifica los datos de ${form.name || 'este equipo'}` : 'Registra un nuevo activo en tu inventario' }}
          </p>
        </div>
        <div class="hidden md:flex flex-col items-end gap-1">
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            :class="statusBadge.class"
          >{{ statusBadge.label }}</span>
        </div>
      </div>
    </AppCard>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- Datos básicos -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="informationCircleOutline" class="text-zinc-500" />
          Datos básicos
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.name" label="Nombre del equipo" placeholder="Ej. Soldadora Lincoln 350" required />
          <FormField v-model="form.category" label="Categoría" select :options="categoryOptions" required />
          <FormField v-model="form.model" label="Modelo" placeholder="Ej. Lincoln 350" />
          <FormField v-model="form.serialNumber" label="N° de serie" placeholder="SN-000000" />
        </div>
      </AppCard>

      <!-- Código QR -->
      <AppCard padding="md" class="!bg-gradient-to-br !from-primary-50 !to-primary-100 !border-primary-200">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 class="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <ion-icon :icon="qrCodeOutline" class="text-primary-600 text-lg" />
            Código QR de identificación
          </h3>
          <button
            type="button"
            class="text-[11px] font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1"
            @click="regenerateQr"
          >
            <ion-icon :icon="refreshOutline" /> Regenerar
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-center">
          <!-- Mini visual del QR (representación esquemática) -->
          <div class="flex items-center justify-center">
            <div
              class="w-32 h-32 bg-white border-4 border-zinc-900 rounded-lg p-2 shadow-sm relative"
              aria-label="Código QR"
            >
              <QrVisual :value="form.qrCode" />
            </div>
          </div>

          <div class="space-y-2">
            <FormField
              v-model="form.qrCode"
              label="Código QR"
              :readonly="false"
              :lock-icon="false"
              hint="Se autogenera, pero puedes reemplazarlo por el QR físico"
            />
            <div class="flex items-center gap-2">
              <ion-button
                size="small"
                fill="outline"
                class="!font-semibold"
                @click="copyQr"
              >
                <ion-icon slot="start" :icon="copyOutline" /> Copiar
              </ion-button>
              <ion-button
                size="small"
                fill="outline"
                class="!font-semibold"
                @click="downloadQr"
              >
                <ion-icon slot="start" :icon="downloadOutline" /> Descargar
              </ion-button>
            </div>
            <p class="text-[11px] text-zinc-500 mt-1">
              Este código identifica el equipo de forma única. Imprímelo y pégalo en la máquina para escaneo desde la app móvil.
            </p>
          </div>
        </div>
      </AppCard>

      <!-- Asignación y operación -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="businessOutline" class="text-zinc-500" />
          Asignación y operación
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            v-model="form.clientId"
            label="Cliente asignado"
            select
            :options="clientOptions"
            hint="Opcional — sin asignar si es propio de la empresa"
          />
          <FormField
            v-model="form.hourlyRate"
            label="Tarifa de operación (USD/h)"
            type="number"
            :step="0.5"
            :min="0"
            required
            hint="Costo por hora de uso del equipo"
          />
          <FormField
            v-model="form.status"
            label="Estado"
            select
            :options="statusOptions"
          />
          <FormField
            v-model="form.usageHours"
            label="Horas de uso acumuladas"
            type="number"
            :step="1"
            :min="0"
          />
        </div>
      </AppCard>

      <!-- Garantía -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="shieldCheckmarkOutline" class="text-zinc-500" />
          Garantía
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div>
            <span class="block text-xs font-semibold text-zinc-700 mb-1">¿Bajo garantía de proveedor?</span>
            <button
              type="button"
              class="w-full h-10 px-3 rounded-lg border-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              :class="form.underWarranty
                ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
                : 'bg-zinc-50 border-zinc-300 text-zinc-500 hover:bg-zinc-100'"
              @click="form.underWarranty = !form.underWarranty"
            >
              <ion-icon :icon="form.underWarranty ? shieldCheckmark : shieldOutline" />
              {{ form.underWarranty ? 'En garantía' : 'Sin garantía' }}
            </button>
            <p v-if="form.underWarranty" class="mt-1 text-[11px] text-green-700">
              Los costos de reparación se bloquean mientras la garantía esté activa.
            </p>
          </div>
          <FormField
            v-if="form.underWarranty"
            v-model="form.warrantyExpiresAt"
            label="Vence el"
            type="date"
          />
          <div v-else>
            <span class="block text-xs font-semibold text-zinc-700 mb-1">Vence el</span>
            <div class="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 text-sm flex items-center">
              No aplica (sin garantía)
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-2 pt-1">
        <ion-button
          fill="outline"
          color="medium"
          router-link="/resources/equipment"
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
          {{ saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear equipo' }}
        </ion-button>
      </div>
    </form>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Eliminar equipo"
      message="¿Seguro que deseas eliminar este equipo? Se perderá su historial de uso."
      confirm-label="Sí, eliminar"
      confirm-color="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton, IonIcon, IonToast } from '@ionic/vue';
import {
  cubeOutline, qrCodeOutline, refreshOutline, copyOutline, downloadOutline,
  informationCircleOutline, businessOutline, shieldCheckmarkOutline, shieldCheckmark, shieldOutline,
  saveOutline, trashOutline,
} from 'ionicons/icons';
import { clientsService, equipmentService, tenantCodeOf } from '@/services/db';
import type { Client, Equipment } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import QrVisual from '@/components/common/QrVisual.vue';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();
const toast = useToast();

const isEdit = computed(() => !!route.params.id);
const clients = ref<Client[]>([]);

const form = reactive({
  name: '',
  model: '',
  serialNumber: '',
  qrCode: '',
  category: 'General',
  clientId: '' as string,
  hourlyRate: 25,
  status: 'available' as Equipment['status'],
  usageHours: 0,
  underWarranty: false,
  warrantyExpiresAt: '' as string,
});

const saving = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);

const clientOptions = computed(() => [
  { value: '', label: '— Sin asignar (propio) —' },
  ...clients.value.map((c) => ({ value: c.id, label: c.name })),
]);

const categoryOptions = [
  { value: 'Soldadura', label: 'Soldadura' },
  { value: 'Corte', label: 'Corte' },
  { value: 'Neumática', label: 'Neumática' },
  { value: 'Mecanizado', label: 'Mecanizado' },
  { value: 'Energía', label: 'Energía' },
  { value: 'Bombas', label: 'Bombas' },
  { value: 'Logística', label: 'Logística' },
  { value: 'Térmico', label: 'Térmico' },
  { value: 'General', label: 'General' },
];

const statusOptions = [
  { value: 'available', label: 'Disponible' },
  { value: 'in_use', label: 'En uso' },
  { value: 'maintenance', label: 'En mantenimiento' },
  { value: 'retired', label: 'Dado de baja' },
];

const statusBadge = computed(() => {
  switch (form.status) {
    case 'available': return { label: 'DISPONIBLE', class: 'bg-green-100 text-green-700' };
    case 'in_use': return { label: 'EN USO', class: 'bg-blue-100 text-blue-700' };
    case 'maintenance': return { label: 'MANTENIMIENTO', class: 'bg-amber-100 text-amber-700' };
    case 'retired': return { label: 'BAJA', class: 'bg-zinc-200 text-zinc-600' };
    default: return { label: '—', class: 'bg-zinc-100 text-zinc-500' };
  }
});

const canSubmit = computed(() =>
  form.name.trim().length > 1 &&
  form.category.trim().length > 0 &&
  form.qrCode.trim().length > 2,
);

function generateQr(category: string): string {
  // Formato: {TENANT_CODE}-EQ-{CATEGORY}{TS}{RAND} — ej: MIC-EQ-SLDA1B2C3789
  const tc = tenantCodeOf(session.tenantId ?? 'T-001');
  const cat = (category || '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${tc}-EQ-${cat}${ts}${rand}`;
}

function regenerateQr() {
  form.qrCode = generateQr(form.category);
  toast.show('QR regenerado', 'success');
}

async function copyQr() {
  try {
    await navigator.clipboard.writeText(form.qrCode);
    toast.show('QR copiado al portapapeles', 'success');
  } catch {
    toast.show('No se pudo copiar', 'warning');
  }
}

function downloadQr() {
  const blob = new Blob(
    [`EQUIPMENT QR\n============\n${form.qrCode}\n\nEquipo: ${form.name}\nModelo: ${form.model || '—'}\nSerie: ${form.serialNumber || '—'}\n`],
    { type: 'text/plain' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${form.qrCode}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.show('QR descargado', 'success');
}

async function onSubmit() {
  if (!canSubmit.value) {
    notify.push('Completa los campos obligatorios', 'warning');
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<Equipment> = {
      tenantId: session.tenantId ?? undefined,
      name: form.name.trim(),
      model: form.model.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
      qrCode: form.qrCode.trim(),
      category: form.category.trim(),
      clientId: form.clientId || undefined,
      hourlyRate: Number(form.hourlyRate),
      status: form.status,
      usageHours: Number(form.usageHours),
      underWarranty: form.underWarranty,
      warrantyExpiresAt: form.underWarranty && form.warrantyExpiresAt
        ? new Date(form.warrantyExpiresAt).toISOString()
        : undefined,
    };
    if (isEdit.value) {
      const updated = await equipmentService.update(route.params.id as string, payload);
      if (updated) {
        notify.push('Equipo actualizado', 'success');
        router.push(`/resources/equipment/${updated.id}`);
      }
    } else {
      const created = await equipmentService.create(payload);
      notify.push('Equipo creado', 'success');
      router.push(`/resources/equipment/${created.id}`);
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
    await equipmentService.remove(route.params.id as string);
    notify.push('Equipo eliminado', 'warning');
    router.push('/resources/equipment');
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  clients.value = await clientsService.list(session.tenantId ?? undefined);
  if (isEdit.value) {
    const eq = await equipmentService.get(route.params.id as string);
    if (eq) {
      Object.assign(form, {
        name: eq.name,
        model: eq.model ?? '',
        serialNumber: eq.serialNumber ?? '',
        qrCode: eq.qrCode,
        category: eq.category,
        clientId: eq.clientId ?? '',
        hourlyRate: eq.hourlyRate,
        status: eq.status,
        usageHours: eq.usageHours,
        underWarranty: eq.underWarranty,
        warrantyExpiresAt: eq.warrantyExpiresAt ? eq.warrantyExpiresAt.substring(0, 10) : '',
      });
    }
  } else {
    // Generar QR inicial
    form.qrCode = generateQr(form.category);
  }
});
</script>
