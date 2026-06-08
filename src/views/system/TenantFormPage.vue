<template>
  <div class="p-4 md:p-6 max-w-5xl mx-auto pb-12 space-y-4">
    <div class="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
      <ion-icon :icon="warningOutline" class="text-amber-700 text-lg" />
      <p class="text-xs text-amber-800">
        <strong>Consola del Sistema.</strong> Estás creando o editando un Tenant a nivel global.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- Identidad -->
      <AppCard padding="md" class="!bg-gradient-to-br !from-primary-50 !to-primary-100 !border-primary-200">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="shieldCheckmarkOutline" class="text-primary-600" /> Identidad
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField
            v-model="form.code"
            label="Código único (prefijo)"
            placeholder="MIC"
            required
            :readonly="isEdit"
            :lock-icon="isEdit"
            hint="2-4 chars. Mayúsculas. Inmutable después de crear."
          />
          <FormField
            v-model="form.name"
            label="Razón Social"
            placeholder="Mantenimiento Industrial del Centro C.A."
            required
          />
          <FormField
            v-model="form.plan"
            label="Plan"
            select
            :options="planOptions"
          />
        </div>
      </AppCard>

      <!-- Datos fiscales -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="businessOutline" class="text-zinc-500" /> Datos fiscales
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.taxId" label="RIF / Identificación fiscal" placeholder="J-12345678-9" />
          <FormField v-model="form.industry" label="Industria" placeholder="Manufactura" />
          <FormField v-model="form.email" label="Email" type="email" />
          <FormField v-model="form.phone" label="Teléfono" />
          <FormField v-model="form.address" label="Dirección" />
          <div class="grid grid-cols-2 gap-3">
            <FormField v-model="form.city" label="Ciudad" />
            <FormField v-model="form.country" label="País" />
          </div>
        </div>
      </AppCard>

      <!-- Contacto principal -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="personCircleOutline" class="text-zinc-500" /> Contacto principal
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField v-model="form.contactName" label="Nombre" placeholder="Ana Martínez" />
          <FormField v-model="form.contactEmail" label="Email" type="email" />
          <FormField v-model="form.contactPhone" label="Teléfono" />
        </div>
      </AppCard>

      <!-- Suscripción -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="ribbonOutline" class="text-zinc-500" /> Suscripción y límites
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField v-model="form.expiresAt" label="Vence el" type="date" />
          <FormField v-model="form.maxUsers" label="Máx. usuarios" type="number" :min="1" :step="1" />
          <FormField v-model="form.maxStorageMb" label="Almacenamiento (MB)" type="number" :min="100" :step="100" />
        </div>
        <FormField v-model="form.notes" label="Notas internas" textarea :rows="2" class="mt-3" />
        <div class="mt-3">
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
            {{ form.active ? 'Tenant activo' : 'Tenant suspendido' }}
          </button>
        </div>
      </AppCard>

      <!-- Módulos habilitados -->
      <AppCard padding="md">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 class="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <ion-icon :icon="gridOutline" class="text-zinc-500" /> Módulos habilitados
          </h3>
          <div class="flex items-center gap-2 text-[11px]">
            <button type="button" class="font-semibold text-primary-600 hover:text-primary-700" @click="enableAll">
              Habilitar todos
            </button>
            <span class="text-zinc-300">·</span>
            <button type="button" class="font-semibold text-zinc-500 hover:text-zinc-700" @click="disableAll">
              Solo esenciales
            </button>
            <span class="ml-2 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-bold">
              {{ form.enabledModules.length === 0 ? ALL_MODULES.length : form.enabledModules.length }} / {{ ALL_MODULES.length }}
            </span>
          </div>
        </div>

        <p class="text-[11px] text-zinc-500 mb-3">
          Define a qué módulos tendrá acceso este Tenant. Vacío = todos habilitados. Los cambios se reflejan en el sidebar y las rutas.
        </p>

        <div v-for="(mods, category) in MODULES_BY_CATEGORY" :key="category" class="mb-3">
          <p class="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1.5">{{ category }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <label
              v-for="m in mods"
              :key="m.key"
              class="flex items-start gap-2 p-2.5 rounded-lg border border-zinc-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
              :class="isModuleOn(m.key) ? 'bg-primary-50/40 border-primary-300' : ''"
            >
              <input
                type="checkbox"
                :checked="isModuleOn(m.key)"
                :disabled="m.required"
                class="mt-0.5 w-4 h-4"
                @change="toggleModule(m.key)"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-zinc-800 flex items-center gap-1">
                  <ion-icon :icon="m.icon" class="text-zinc-500" />
                  {{ m.label }}
                </p>
                <p class="text-[10px] text-zinc-500">{{ m.description }}</p>
                <span v-if="m.required" class="text-[9px] font-bold uppercase text-amber-600">Obligatorio</span>
              </div>
            </label>
          </div>
        </div>
      </AppCard>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-2 pt-1">
        <ion-button
          fill="outline"
          color="medium"
          router-link="/system/tenants"
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
          {{ deleting ? 'Eliminando…' : 'Eliminar Tenant' }}
        </ion-button>
        <ion-button
          type="submit"
          color="primary"
          class="!font-semibold"
          :disabled="!canSubmit || saving"
        >
          <ion-icon slot="start" :icon="saveOutline" />
          {{ saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear Tenant' }}
        </ion-button>
      </div>
    </form>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Eliminar Tenant"
      message="¿Seguro? Esta acción eliminará TODOS los datos del Tenant (clientes, OTs, usuarios, etc.) y no se puede deshacer."
      confirm-label="Sí, eliminar"
      confirm-color="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton, IonIcon } from '@ionic/vue';
import {
  addOutline, warningOutline, shieldCheckmarkOutline, businessOutline, personCircleOutline,
  ribbonOutline, gridOutline, saveOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline,
} from 'ionicons/icons';
import { tenantsService } from '@/services/db';
import type { Tenant } from '@/types/domain';
import { ALL_MODULES, MODULES_BY_CATEGORY, ALWAYS_ENABLED, DEFAULT_ENABLED_MODULES } from '@/constants/modules';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const notify = useNotificationStore();

const isEdit = computed(() => !!route.params.id);
const saving = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);

const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const form = reactive({
  code: '',
  name: '',
  plan: 'pro' as Tenant['plan'],
  active: true,
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Venezuela',
  industry: '',
  taxId: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  expiresAt: '',
  notes: '',
  enabledModules: [] as string[],
  maxUsers: 50,
  maxStorageMb: 5120,
});

const canSubmit = computed(() =>
  form.code.trim().length > 0 &&
  form.name.trim().length > 0 &&
  /^[A-Z0-9]{2,4}$/.test(form.code.trim().toUpperCase()),
);

function isModuleOn(key: string): boolean {
  if (ALWAYS_ENABLED.includes(key as any)) return true;
  if (form.enabledModules.length === 0) return true; // empty = all
  return form.enabledModules.includes(key);
}

function toggleModule(key: string) {
  if (ALWAYS_ENABLED.includes(key as any)) return;
  // Si enabledModules está vacío, primero hay que poblarlo con todos los actuales
  if (form.enabledModules.length === 0) {
    form.enabledModules = ALL_MODULES.map((m) => m.key);
  }
  const idx = form.enabledModules.indexOf(key);
  if (idx >= 0) form.enabledModules.splice(idx, 1);
  else form.enabledModules.push(key);
}

function enableAll() {
  form.enabledModules = [];
}

function disableAll() {
  form.enabledModules = [...ALWAYS_ENABLED, ...DEFAULT_ENABLED_MODULES];
}

async function onSubmit() {
  if (!canSubmit.value) {
    notify.push('Completa los campos obligatorios', 'warning');
    return;
  }
  saving.value = true;
  try {
    const payload: any = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      plan: form.plan,
      active: form.active,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      industry: form.industry.trim() || undefined,
      taxId: form.taxId.trim() || undefined,
      contactName: form.contactName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      notes: form.notes.trim() || undefined,
      enabledModules: form.enabledModules.length === ALL_MODULES.length ? undefined : form.enabledModules,
      maxUsers: Number(form.maxUsers) || 50,
      maxStorageMb: Number(form.maxStorageMb) || 5120,
    };
    if (isEdit.value) {
      const updated = await tenantsService.update(route.params.id as string, payload);
      if (updated) {
        notify.push('Tenant actualizado', 'success');
        router.push(`/system/tenants/${updated.id}`);
      }
    } else {
      const created = await tenantsService.create(payload);
      notify.push('Tenant creado', 'success');
      router.push(`/system/tenants/${created.id}`);
    }
  } catch (e: any) {
    notify.push(e?.message ?? 'Error al guardar', 'danger');
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
    // No hay delete en tenantsService — habría que añadir uno. Para esta demo, lo dejamos pendiente.
    notify.push('Eliminación de Tenant pendiente de implementar (afecta a múltiples entidades)', 'warning');
    router.push('/system/tenants');
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const t = await tenantsService.get(route.params.id as string);
    if (t) {
      Object.assign(form, {
        code: t.code,
        name: t.name,
        plan: t.plan,
        active: t.active,
        email: t.email ?? '',
        phone: t.phone ?? '',
        address: t.address ?? '',
        city: t.city ?? '',
        country: t.country ?? 'Venezuela',
        industry: t.industry ?? '',
        taxId: t.taxId ?? '',
        contactName: t.contactName ?? '',
        contactEmail: t.contactEmail ?? '',
        contactPhone: t.contactPhone ?? '',
        expiresAt: t.expiresAt ? t.expiresAt.substring(0, 10) : '',
        notes: t.notes ?? '',
        enabledModules: t.enabledModules ?? [],
        maxUsers: t.maxUsers ?? 50,
        maxStorageMb: t.maxStorageMb ?? 5120,
      });
    }
  } else {
    // Generar código sugerido basado en el nombre
  }
});
</script>
