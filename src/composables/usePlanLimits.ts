/**
 * Composable para verificar los límites del plan del Tenant.
 * Útil para deshabilitar botones de creación cuando se alcanza
 * el máximo de usuarios, OTs, etc.
 */

import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useTenantStore } from '@/stores/tenant';
import {
  purchaseOrdersService,
  tasksService,
  usersService,
  workOrdersService,
} from '@/services/db';

export function usePlanLimits() {
  const tenant = useTenantStore();
  const { currentTenant } = storeToRefs(tenant);

  /** Conteos actuales por Tenant (cacheados). */
  const counts = ref({
    users: 0,
    workOrders: 0,
    tasks: 0,
    purchaseOrders: 0,
  });

  async function refreshCounts() {
    if (!currentTenant.value) return;
    counts.value = {
      users: await usersService.countByTenant(currentTenant.value.id),
      workOrders: (await workOrdersService.list(currentTenant.value.id)).length,
      tasks: (await tasksService.list(currentTenant.value.id)).length,
      purchaseOrders: (await purchaseOrdersService.list(currentTenant.value.id)).length,
    };
  }

  const isAtUserLimit = computed(() => {
    const max = currentTenant.value?.maxUsers;
    return max ? counts.value.users >= max : false;
  });

  /** ¿Se puede crear un usuario? */
  const canCreateUser = computed(() => !isAtUserLimit.value);

  /** Helpers para checks rápidos por recurso. */
  function isAtLimit(kind: 'users' | 'work-orders' | 'tasks' | 'purchase-orders'): boolean {
    const t = currentTenant.value;
    if (!t) return false;
    if (kind === 'users') return t.maxUsers ? counts.value.users >= t.maxUsers : false;
    // Otros límites se podrían añadir al modelo de Tenant (maxOt, maxTasks, etc.)
    return false;
  }

  function remaining(kind: 'users' | 'work-orders' | 'tasks' | 'purchase-orders'): number | null {
    const t = currentTenant.value;
    if (!t) return null;
    if (kind === 'users' && t.maxUsers) return Math.max(0, t.maxUsers - counts.value.users);
    return null;
  }

  return {
    counts,
    refreshCounts,
    isAtUserLimit,
    canCreateUser,
    isAtLimit,
    remaining,
  };
}
