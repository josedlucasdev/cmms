<template>
  <aside
    class="hidden md:flex flex-col bg-white border-r border-zinc-200 transition-all duration-200"
    :class="collapsed ? 'w-[72px]' : 'w-64'"
  >
    <!-- Brand -->
    <div class="h-16 flex items-center gap-3 px-4 border-b border-zinc-200 shrink-0">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md shrink-0"
        :class="isSystemMode
          ? 'bg-gradient-to-br from-amber-500 to-amber-700'
          : 'bg-gradient-to-br from-primary-500 to-primary-700'"
      >
        <ion-icon :icon="isSystemMode ? globeOutline : settingsOutline" class="text-lg" />
      </div>
      <div v-if="!collapsed" class="min-w-0">
        <p class="text-sm font-bold text-zinc-900 leading-tight truncate">
          {{ isSystemMode ? 'Consola Sistema' : 'ProMaintenance' }}
        </p>
        <p class="text-[10px] text-zinc-500 uppercase tracking-wider truncate">
          {{ isSystemMode ? 'Root · SaaS' : 'CMMS SaaS' }}
        </p>
      </div>
    </div>

    <!-- Tenant switcher (solo si NO estamos en modo sistema) -->
    <div v-if="!collapsed && !isSystemMode && tenants.length > 1" class="px-3 py-2 border-b border-zinc-100">
      <p class="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1 px-1">Tenant</p>
      <button
        v-for="t in tenants"
        :key="t.id"
        class="w-full text-left px-2 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2"
        :class="t.id === currentTenantId ? 'bg-primary-50 text-primary-700' : 'text-zinc-700 hover:bg-zinc-50'"
        @click="switchTenant(t.id)"
      >
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: t.id === currentTenantId ? '#3A5CFF' : '#CBD5E1' }" />
        <span class="truncate flex-1">{{ t.name }}</span>
        <span
          class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
          :class="t.id === currentTenantId ? 'bg-primary-200 text-primary-800' : 'bg-zinc-200 text-zinc-600'"
        >{{ t.code }}</span>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-3">
      <div v-for="group in visibleGroups" :key="group.title" class="mb-4">
        <p
          v-if="!collapsed"
          class="px-4 text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1.5"
        >
          {{ group.title }}
        </p>
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          custom
        >
          <a
            class="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            :class="isActive
              ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'"
            @click="navigate(item.path)"
          >
            <ion-icon :icon="item.icon" :class="isActive ? 'text-primary-600' : 'text-zinc-400'" class="text-lg shrink-0" />
            <span v-if="!collapsed" class="truncate flex-1">{{ item.label }}</span>
            <span
              v-if="!collapsed && item.badge"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700"
            >
              {{ item.badge }}
            </span>
          </a>
        </router-link>
      </div>
    </nav>

    <!-- Footer / Collapse -->
    <div class="p-3 border-t border-zinc-100 shrink-0">
      <button
        class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-50"
        @click="collapsed = !collapsed"
      >
        <ion-icon :icon="collapsed ? chevronForwardOutline : chevronBackOutline" />
        <span v-if="!collapsed">Colapsar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { IonIcon } from '@ionic/vue';
import {
  settingsOutline,
  chevronBackOutline,
  chevronForwardOutline,
  gridOutline,
  businessOutline,
  documentTextOutline,
  briefcaseOutline,
  constructOutline,
  listOutline,
  peopleOutline,
  cubeOutline,
  calendarOutline,
  layersOutline,
  fileTrayFullOutline,
  cartOutline,
  walletOutline,
  statsChartOutline,
  storefrontOutline,
  optionsOutline,
  receiptOutline,
  ribbonOutline,
  homeOutline,
  swapHorizontalOutline,
  globeOutline,
} from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';

const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const tenant = useTenantStore();
const { user, role } = storeToRefs(session);
const { tenants, currentTenant } = storeToRefs(tenant);

const collapsed = ref(false);
const currentTenantId = computed(() => currentTenant.value?.id ?? null);

// ¿Estamos en modo sistema? (rutas /system/*)
const isSystemMode = computed(() => route.path.startsWith('/system'));

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups = computed<NavGroup[]>(() => {
  // Modo Sistema (solo Super Admin): solo ver Tenants y Config Global
  if (isSystemMode.value) {
    return [
      {
        title: 'Consola del Sistema',
        items: [
          { label: 'Empresas (Tenants)', path: '/system/tenants', icon: businessOutline },
        ],
      },
    ];
  }

  // Modo Tenant (cualquier rol logueado)
  return [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: gridOutline },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Clientes', path: '/clients', icon: businessOutline },
      { label: 'Cotizaciones', path: '/quotes', icon: documentTextOutline },
      { label: 'Proyectos', path: '/projects', icon: briefcaseOutline },
      { label: 'Órdenes de Trabajo', path: '/work-orders', icon: constructOutline, badge: 'OT' },
      { label: 'Mis Tareas', path: '/tasks', icon: listOutline, roles: ['technician', 'coordinator', 'tenant_admin'] },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { label: 'Empleados', path: '/resources/employees', icon: peopleOutline },
      { label: 'Equipos', path: '/resources/equipment', icon: cubeOutline },
      { label: 'Logística / Traslados', path: '/logistics/trips', icon: swapHorizontalOutline },
      { label: 'Preventivo', path: '/preventive', icon: calendarOutline },
    ],
  },
  {
    title: 'Abastecimiento',
    items: [
      { label: 'Inventario', path: '/inventory', icon: layersOutline },
      { label: 'Proveedores', path: '/suppliers', icon: storefrontOutline },
      { label: 'Órdenes de Compra', path: '/purchase-orders', icon: cartOutline },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Centro de Costos', path: '/finance', icon: walletOutline, roles: ['tenant_admin', 'coordinator'] },
      { label: 'Reportes', path: '/reports', icon: statsChartOutline },
      { label: 'Conversor BCV', path: '/settings/currency', icon: receiptOutline },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Configuración', path: '/settings', icon: optionsOutline, roles: ['tenant_admin', 'coordinator', 'super_admin'] },
      { label: 'Auditoría', path: '/audit', icon: ribbonOutline, roles: ['tenant_admin'] },
      { label: 'Usuarios', path: '/users', icon: peopleOutline, roles: ['tenant_admin', 'super_admin'] },
      ...(role.value === 'super_admin' ? [{ label: 'Empresas (Sistema)', path: '/system/tenants', icon: businessOutline }] : []),
    ],
  },
];
});

const visibleGroups = computed(() =>
  groups.value
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => !it.roles || it.roles.includes(role.value ?? '')),
    }))
    .filter((g) => g.items.length > 0),
);

function navigate(path: string) {
  router.push(path);
}

function switchTenant(id: string) {
  tenant.setCurrent(id);
}
</script>
