/**
 * Composable para verificar si el Tenant actual tiene acceso a un módulo.
 * El Super Admin (en modo sistema) siempre tiene acceso.
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { isModuleEnabled, type ModuleKey } from '@/constants/modules';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';

export function useModuleAccess() {
  const session = useSessionStore();
  const tenant = useTenantStore();
  const { role } = storeToRefs(session);
  const { currentTenant } = storeToRefs(tenant);
  const route = useRoute();

  const isSystemMode = computed(() => route.path.startsWith('/system'));

  /** ¿El usuario actual puede acceder a este módulo? */
  function canAccessModule(key: ModuleKey): boolean {
    if (role.value === 'super_admin') return true; // Super Admin ve todo
    return isModuleEnabled(currentTenant.value, key);
  }

  return {
    canAccessModule,
    isModuleEnabled: (key: ModuleKey) => isModuleEnabled(currentTenant.value, key),
    isSystemMode,
  };
}
