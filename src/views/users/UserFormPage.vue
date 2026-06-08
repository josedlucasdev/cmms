<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- Header con preview -->
      <AppCard padding="md">
        <div class="flex items-center gap-3">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            :style="{ backgroundColor: form.avatarColor || defaultAvatarColor }"
          >
            {{ initials(form.fullName || 'NU') }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-lg font-bold text-zinc-900">
              {{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h2>
            <p class="text-sm text-zinc-500">
              {{ isEdit ? `Modifica los datos de ${form.fullName || 'este usuario'}` : 'Crea un usuario en tu Tenant' }}
            </p>
          </div>
          <span
            v-if="!isEdit"
            class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700"
          >
            {{ currentTenant?.code }}
          </span>
        </div>
      </AppCard>

      <!-- Datos personales -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="personOutline" class="text-zinc-500" /> Datos personales
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.fullName" label="Nombre completo" required />
          <FormField v-model="form.email" label="Email" type="email" required hint="Único dentro del Tenant" />
          <FormField v-model="form.documentId" label="Cédula / Identificación" placeholder="V-12345678" />
          <FormField v-model="form.phone" label="Teléfono" placeholder="+58 414 1234567" />
        </div>
      </AppCard>

      <!-- Rol y permisos -->
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
          <ion-icon :icon="ribbonOutline" class="text-zinc-500" /> Rol y permisos
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.role" label="Rol" select :options="roleOptions" required />
          <div>
            <span class="block text-xs font-semibold text-zinc-700 mb-1">Estado</span>
            <button
              type="button"
              class="w-full h-10 px-3 rounded-lg border-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              :class="form.active
                ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
                : 'bg-zinc-50 border-zinc-300 text-zinc-500 hover:bg-zinc-100'"
              @click="form.active = !form.active"
            >
              <ion-icon :icon="form.active ? checkmarkCircleOutline : closeCircleOutline" />
              {{ form.active ? 'Usuario activo' : 'Usuario inactivo' }}
            </button>
          </div>
        </div>

        <!-- Permisos custom (overrides) -->
        <div class="mt-4">
          <p class="text-xs font-semibold text-zinc-700 mb-1.5">Permisos adicionales (opcional)</p>
          <p class="text-[10px] text-zinc-500 mb-2">
            Otorga permisos extra al usuario, encima de los que ya tiene su rol.
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="perm in AVAILABLE_PERMISSIONS"
              :key="perm"
              type="button"
              class="text-[10px] font-semibold px-2 py-1 rounded-md transition-colors"
              :class="form.customPermissions.includes(perm)
                ? 'bg-primary-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              @click="togglePermission(perm)"
            >
              {{ perm }}
            </button>
          </div>
        </div>
      </AppCard>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-2 pt-1">
        <ion-button
          fill="outline"
          color="medium"
          router-link="/users"
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
          {{ saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario' }}
        </ion-button>
      </div>
    </form>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Eliminar usuario"
      message="¿Seguro que deseas eliminar este usuario? No podrá acceder al sistema."
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
  personOutline, ribbonOutline, saveOutline, trashOutline,
  checkmarkCircleOutline, closeCircleOutline,
} from 'ionicons/icons';
import { usersService } from '@/services/db';
import type { Role, User } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { colorFromString, initials } from '@/composables/useFormat';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const tenant = useTenantStore();
const notify = useNotificationStore();

const isEdit = computed(() => !!route.params.id);
const saving = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const currentTenant = computed(() => tenant.currentTenant);
const defaultAvatarColor = computed(() => colorFromString(form.fullName || 'NU'));

const AVAILABLE_PERMISSIONS = [
  'users.manage', 'clients.manage', 'quotes.manage', 'projects.manage',
  'work-orders.manage', 'employees.manage', 'equipment.manage', 'inventory.manage',
  'suppliers.manage', 'purchase-orders.manage', 'reports.view', 'audit.view',
  'settings.edit', 'ai.use', 'push.send',
];

const roleOptions = [
  { value: 'tenant_admin', label: 'Administrador del Tenant' },
  { value: 'coordinator', label: 'Coordinador / Supervisor' },
  { value: 'technician', label: 'Técnico de Campo' },
  { value: 'client', label: 'Cliente (Portal)' },
];

const form = reactive({
  fullName: '',
  email: '',
  documentId: '',
  phone: '',
  role: 'technician' as Role,
  active: true,
  avatarColor: '',
  customPermissions: [] as string[],
});

const canSubmit = computed(() =>
  form.fullName.trim().length > 1 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
);

function togglePermission(perm: string) {
  const idx = form.customPermissions.indexOf(perm);
  if (idx >= 0) form.customPermissions.splice(idx, 1);
  else form.customPermissions.push(perm);
}

async function onSubmit() {
  if (!canSubmit.value) {
    notify.push('Completa los campos obligatorios', 'warning');
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<User> = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      documentId: form.documentId.trim() || undefined,
      phone: form.phone.trim() || undefined,
      role: form.role,
      active: form.active,
      avatarColor: colorFromString(form.fullName),
      customPermissions: form.customPermissions.length > 0 ? form.customPermissions : undefined,
    };
    if (isEdit.value) {
      const updated = await usersService.update(route.params.id as string, payload);
      if (updated) {
        notify.push('Usuario actualizado', 'success');
        router.push(`/users/${updated.id}`);
      }
    } else {
      const created = await usersService.create({ ...payload, tenantId: session.tenantId ?? '' });
      notify.push('Usuario creado', 'success');
      router.push(`/users/${created.id}`);
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
    await usersService.remove(route.params.id as string);
    notify.push('Usuario eliminado', 'warning');
    router.push('/users');
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const u = await usersService.get(route.params.id as string);
    if (u) {
      Object.assign(form, {
        fullName: u.fullName,
        email: u.email,
        documentId: u.documentId ?? '',
        phone: u.phone ?? '',
        role: u.role,
        active: u.active,
        avatarColor: u.avatarColor ?? '',
        customPermissions: u.customPermissions ?? [],
      });
    }
  }
});
</script>
