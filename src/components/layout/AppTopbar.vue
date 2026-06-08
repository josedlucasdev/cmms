<template>
  <header class="h-16 bg-white border-b border-zinc-200 flex items-center px-4 md:px-6 gap-3 shrink-0">
    <button class="md:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-100" @click="mobileMenuOpen = !mobileMenuOpen">
      <ion-icon :icon="menuOutline" class="text-xl text-zinc-700" />
    </button>

    <!-- Badge del código de Tenant (inmutable, identifica la empresa) -->
    <span
      v-if="currentTenant"
      class="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0"
      :title="`Prefijo único del Tenant: ${currentTenant.code}`"
    >
      <ion-icon :icon="shieldCheckmarkOutline" class="text-xs" />
      {{ currentTenant.code }}
    </span>

    <!-- Breadcrumb / título contextual -->
    <div class="min-w-0 flex-1">
      <p class="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 leading-tight">
        {{ sectionTitle }}
      </p>
      <h1 class="text-base font-bold text-zinc-900 truncate leading-tight">
        {{ pageTitle }}
      </h1>
    </div>

    <!-- Quick search (placeholder) -->
    <div class="hidden lg:flex items-center gap-2 px-3 h-9 bg-zinc-50 border border-zinc-200 rounded-lg w-64">
      <ion-icon :icon="searchOutline" class="text-zinc-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar OT, cliente, equipo..."
        class="flex-1 bg-transparent text-sm focus:outline-none"
      />
      <kbd class="hidden xl:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-500">⌘K</kbd>
    </div>

    <!-- Currency switcher -->
    <CurrencySwitcher :model-value="preferred" @update:model-value="onCurrencyChange" />

    <!-- Offline indicator / toggle -->
    <button
      class="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
      :class="online ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'"
      :title="online ? 'Conectado' : 'Modo offline'"
      @click="network.toggleForced"
    >
      <ion-icon :icon="online ? cloudDoneOutline : cloudOfflineOutline" />
    </button>

    <!-- Sync button -->
    <button
      class="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
      @click="onSync"
    >
      <ion-icon :icon="syncOutline" />
      <span>Sincronizar</span>
    </button>

    <!-- User avatar -->
    <div class="relative">
      <button
        class="flex items-center gap-2 pl-1 pr-2 h-9 rounded-full hover:bg-zinc-100 transition-colors"
        @click="userMenuOpen = !userMenuOpen"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          :style="{ backgroundColor: avatarColor }"
        >
          {{ initials }}
        </div>
        <div class="hidden md:block text-left min-w-0">
          <p class="text-xs font-bold text-zinc-900 truncate leading-tight">{{ user?.fullName }}</p>
          <p class="text-[10px] text-zinc-500 truncate leading-tight">{{ roleLabel }}</p>
        </div>
        <ion-icon :icon="chevronDownOutline" class="text-zinc-400 hidden md:block" />
      </button>
      <transition name="dropdown">
        <div
          v-if="userMenuOpen"
          class="absolute right-0 top-full mt-2 w-60 bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 z-50"
          @click.stop
        >
          <div class="px-3 py-2 border-b border-zinc-100">
            <p class="text-sm font-bold text-zinc-900 truncate">{{ user?.fullName }}</p>
            <p class="text-[11px] text-zinc-500 truncate">{{ user?.email }}</p>
            <p class="text-[10px] uppercase tracking-wider text-primary-600 font-bold mt-1">{{ roleLabel }}</p>
          </div>
          <button
            class="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
            @click="goToSettings"
          >
            <ion-icon :icon="optionsOutline" /> Configuración
          </button>
          <button
            class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            @click="logout"
          >
            <ion-icon :icon="logOutOutline" /> Cerrar sesión
          </button>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { IonIcon } from '@ionic/vue';
import {
  menuOutline,
  searchOutline,
  cloudDoneOutline,
  cloudOfflineOutline,
  syncOutline,
  chevronDownOutline,
  optionsOutline,
  logOutOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { useCurrencyStore } from '@/stores/currency';
import { useNetworkStore } from '@/stores/network';
import { useNotificationStore } from '@/stores/notification';
import CurrencySwitcher from '@/components/common/CurrencySwitcher.vue';
import { initials, colorFromString } from '@/composables/useFormat';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const tenant = useTenantStore();
const currency = useCurrencyStore();
const network = useNetworkStore();
const notify = useNotificationStore();

const { user, role } = storeToRefs(session);
const { currentTenant } = storeToRefs(tenant);
const { preferred } = storeToRefs(currency);
const { online } = storeToRefs(network);

const userMenuOpen = ref(false);
const mobileMenuOpen = ref(false);
const searchQuery = ref('');

const avatarColor = computed(() => colorFromString(user.value?.fullName ?? 'U'));
const initialsText = computed(() => initials(user.value?.fullName ?? 'U U'));

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrador',
  tenant_admin: 'Administrador',
  coordinator: 'Coordinador',
  technician: 'Técnico de Campo',
  client: 'Cliente',
};
const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : 'Invitado'));

const sectionTitle = computed(() => {
  const path = route.path;
  if (path.startsWith('/dashboard')) return 'Principal';
  if (path.startsWith('/clients')) return 'Operaciones / Clientes';
  if (path.startsWith('/quotes')) return 'Operaciones / Cotizaciones';
  if (path.startsWith('/projects')) return 'Operaciones / Proyectos';
  if (path.startsWith('/work-orders')) return 'Operaciones / Órdenes de Trabajo';
  if (path.startsWith('/tasks')) return 'Operaciones / Tareas';
  if (path.startsWith('/resources')) return 'Recursos';
  if (path.startsWith('/logistics')) return 'Recursos / Logística';
  if (path.startsWith('/preventive')) return 'Recursos / Preventivo';
  if (path.startsWith('/inventory')) return 'Abastecimiento / Inventario';
  if (path.startsWith('/suppliers')) return 'Abastecimiento / Proveedores';
  if (path.startsWith('/purchase-orders')) return 'Abastecimiento / Compras';
  if (path.startsWith('/finance')) return 'Finanzas / Centro de Costos';
  if (path.startsWith('/reports')) return 'Finanzas / Reportes';
  if (path.startsWith('/settings')) return 'Sistema / Configuración';
  if (path.startsWith('/audit')) return 'Sistema / Auditoría';
  return 'ProMaintenance';
});

const pageTitle = computed(() => {
  return (route.meta.title as string) ?? 'Bienvenido';
});

function onCurrencyChange(c: 'USD' | 'EUR' | 'VES') {
  currency.setPreferred(c);
}

function onSync() {
  const ts = network.syncNow();
  notify.push(`Sincronizado a las ${new Date(ts).toLocaleTimeString('es-VE')}`, 'success');
}

function goToSettings() {
  userMenuOpen.value = false;
  router.push('/settings');
}

async function logout() {
  userMenuOpen.value = false;
  await session.logout();
  router.replace('/login');
}

function handleClickOutside() {
  userMenuOpen.value = false;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
