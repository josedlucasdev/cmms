/**
 * Composable para verificar permisos del usuario actual.
 * Combina los permisos del rol + permisos custom del usuario.
 */

import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSessionStore } from '@/stores/session';
import {
  ROLE_PERMISSIONS,
  type Permission,
} from '@/constants/permissions';

export function usePermissions() {
  const session = useSessionStore();
  const { user, role } = storeToRefs(session);

  /** Conjunto efectivo de permisos del usuario. */
  const userPermissions = computed<Permission[]>(() => {
    if (!user.value) return [];
    const rolePerms = ROLE_PERMISSIONS[user.value.role] ?? [];
    const custom = (user.value.customPermissions ?? []) as Permission[];
    return Array.from(new Set([...rolePerms, ...custom]));
  });

  /** ¿Tiene el permiso? */
  function can(perm: Permission): boolean {
    if (!user.value) return false;
    if (user.value.role === 'super_admin') return true; // bypass total
    return userPermissions.value.includes(perm);
  }

  /** ¿Tiene AL MENOS uno de los permisos? */
  function canAny(...perms: Permission[]): boolean {
    return perms.some((p) => can(p));
  }

  /** ¿Tiene TODOS los permisos? */
  function canAll(...perms: Permission[]): boolean {
    return perms.every((p) => can(p));
  }

  /** ¿Es del rol (o de un rol mayor en jerarquía)? */
  function isAtLeast(targetRole: 'super_admin' | 'tenant_admin' | 'coordinator' | 'technician' | 'client'): boolean {
    const rank: Record<string, number> = {
      super_admin: 5,
      tenant_admin: 4,
      coordinator: 3,
      technician: 2,
      client: 1,
    };
    if (!role.value) return false;
    return (rank[role.value] ?? 0) >= (rank[targetRole] ?? 0);
  }

  return {
    userPermissions,
    can,
    canAny,
    canAll,
    isAtLeast,
  };
}
