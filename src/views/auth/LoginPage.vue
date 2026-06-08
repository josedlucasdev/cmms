<template>
  <div
    class="w-full bg-white/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 sm:p-8"
    style="max-width: 28rem;"
  >
    <!-- Logo -->
    <div class="flex flex-col items-center mb-6">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg mb-3">
        <ion-icon :icon="settingsOutline" class="text-2xl" />
      </div>
      <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">ProMaintenance</h1>
      <p class="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">CMMS SaaS · Multi-Tenant</p>
    </div>

    <!-- Tenant selector -->
    <div class="mb-4">
      <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Empresa (Tenant)</label>
      <div class="grid grid-cols-1 gap-2">
        <button
          v-for="t in tenants"
          :key="t.id"
          class="text-left px-3 py-2.5 rounded-lg border-2 transition-all"
          :class="t.id === selectedTenantId ? 'border-primary-500 bg-primary-50/50' : 'border-zinc-200 hover:border-zinc-300'"
          @click="selectedTenantId = t.id"
        >
          <p class="text-sm font-semibold text-zinc-900 truncate">{{ t.name }}</p>
          <p class="text-[11px] text-zinc-500">Plan {{ t.plan }} · {{ t.id }}</p>
        </button>
      </div>
    </div>

    <!-- Role selector -->
    <div class="mb-4">
      <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Rol</label>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="r in availableRoles"
          :key="r.value"
          class="px-2.5 py-2 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5"
          :class="r.value === selectedRole ? 'border-primary-500 bg-primary-50/50' : 'border-zinc-200 hover:border-zinc-300'"
          @click="selectedRole = r.value"
        >
          <ion-icon :icon="r.icon" :class="r.value === selectedRole ? 'text-primary-600' : 'text-zinc-400'" class="text-lg" />
          <span class="text-[11px] font-semibold text-zinc-800">{{ r.label }}</span>
        </button>
      </div>
    </div>

    <!-- Email -->
    <div class="mb-4">
      <FormField
        v-model="email"
        label="Correo electrónico"
        type="email"
        placeholder="usuario@empresa.com"
        :prefix-icon="mailOutline"
      >
        <template #prefix>
          <ion-icon :icon="mailOutline" />
        </template>
      </FormField>
    </div>

    <!-- Login button -->
    <ion-button
      expand="block"
      :disabled="loading || !canLogin"
      class="font-semibold !h-12"
      @click="onLogin"
    >
      <ion-icon slot="start" :icon="logInOutline" />
      {{ loading ? 'Ingresando...' : 'Ingresar' }}
    </ion-button>

    <!-- Divider -->
    <div class="my-5 flex items-center gap-3">
      <div class="flex-1 h-px bg-zinc-200" />
      <span class="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">o</span>
      <div class="flex-1 h-px bg-zinc-200" />
    </div>

    <!-- Portal del cliente -->
    <button
      class="w-full px-4 py-2.5 rounded-lg border-2 border-zinc-200 text-sm font-semibold text-zinc-700 hover:border-primary-300 hover:bg-primary-50/30 transition-colors flex items-center justify-center gap-2"
      @click="router.push('/portal/login')"
    >
      <ion-icon :icon="globeOutline" />
      Acceder al Portal del Cliente
    </button>

    <p class="text-[11px] text-zinc-400 text-center mt-5">
      Demo · sin backend real · datos mock en localStorage
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  IonButton,
  IonIcon,
} from '@ionic/vue';
import {
  settingsOutline,
  mailOutline,
  logInOutline,
  globeOutline,
  personOutline,
  shieldCheckmarkOutline,
  constructOutline,
  ribbonOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { useNotificationStore } from '@/stores/notification';
import FormField from '@/components/common/FormField.vue';
import type { Role } from '@/types/domain';

const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const tenant = useTenantStore();
const notify = useNotificationStore();

const { tenants } = storeToRefs(tenant);

const selectedTenantId = ref<string>('T-001');
const selectedRole = ref<Role>('tenant_admin');
const email = ref('admin@promaintenance.demo');
const loading = ref(false);

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: 'tenant_admin', label: 'Admin', icon: shieldCheckmarkOutline },
  { value: 'coordinator', label: 'Coordinador', icon: ribbonOutline },
  { value: 'technician', label: 'Técnico', icon: constructOutline },
  { value: 'super_admin', label: 'Super', icon: personOutline },
];

const availableRoles = computed(() => ROLES);

const canLogin = computed(() => !!selectedTenantId.value && !!selectedRole.value && !!email.value);

async function onLogin() {
  if (!canLogin.value) return;
  loading.value = true;
  try {
    const u = await session.login(email.value, selectedRole.value, selectedTenantId.value);
    if (!u) {
      notify.push('Credenciales no válidas', 'danger');
      return;
    }
    await tenant.setCurrent(selectedTenantId.value);
    notify.push(`Bienvenido, ${u.fullName.split(' ')[0]}`, 'success');
    const redirect = (route.query.redirect as string) || (u.role === 'technician' ? '/tasks' : '/dashboard');
    router.replace(redirect);
  } catch (e) {
    notify.push('Error al iniciar sesión', 'danger');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (tenants.value.length === 0) {
    await tenant.loadAll();
  }
  if (tenants.value[0]) selectedTenantId.value = tenants.value[0].id;
  // Actualizar email por defecto según rol
  watchRoleEmail();
});

function watchRoleEmail() {
  // En esta demo el email es fijo
}
</script>
