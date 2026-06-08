/**
 * Guards centralizados del router.
 * Se ejecutan en `router.beforeEach(...)` en este orden:
 *   1) Auth guard
 *   2) Already-logged-in guard
 *   3) System mode guard
 *   4) Role guard
 *   5) Permission guard (meta.permission)
 *   6) Module permission guard (meta.module)
 *   7) Tenant active guard
 *   8) Self-only guard
 */

import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteRecordNormalized,
} from 'vue-router';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { usePermissions } from '@/composables/usePermissions';
import { isModuleEnabled, type ModuleKey } from '@/constants/modules';
import type { Permission } from '@/constants/permissions';
import type { Role } from '@/types/domain';

interface MetaExt {
  requiresAuth?: boolean;
  roles?: Role[];
  module?: ModuleKey;
  permission?: Permission;
  systemMode?: boolean;
  /** Si true, el usuario sólo puede ver/modificar su propio recurso */
  selfOnly?: boolean;
  title?: string;
}

/** Determina la landing page adecuada según el rol del usuario. */
export function landingForRole(role: Role | null | undefined): string {
  switch (role) {
    case 'super_admin': return '/system/tenants';
    case 'client': return '/portal';
    case 'tenant_admin':
    case 'coordinator':
    case 'technician':
    default: return '/dashboard';
  }
}

function metaOf(record: RouteRecordNormalized | RouteLocationNormalized): MetaExt {
  return record.meta as MetaExt;
}

function collectMeta<K extends keyof MetaExt>(
  to: RouteLocationNormalized,
  key: K,
): NonNullable<MetaExt[K]>[] {
  const out: NonNullable<MetaExt[K]>[] = [];
  for (const record of to.matched) {
    const v = metaOf(record)[key];
    if (v !== undefined && v !== null) out.push(v as NonNullable<MetaExt[K]>);
  }
  return out;
}

/** Pipeline de guards. Cada uno decide; si decide algo, los siguientes se saltan. */
export const routerGuards: NavigationGuard = (to, from, next) => {
  const session = useSessionStore();
  const tenant = useTenantStore();
  const { can } = usePermissions();

  // ---- 1) Auth guard ----
  const requiresAuth = to.matched.some((r) => metaOf(r).requiresAuth);
  if (requiresAuth && !session.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } } as any);
  }

  // ---- 2) Already-logged-in guard ----
  if ((to.name === 'login' || to.name === 'portal-login') && session.isAuthenticated) {
    if (!to.query.redirect) {
      return next(landingForRole(session.role) as any);
    }
  }

  // ---- 3) System mode guard ----
  const isSystemRoute = to.matched.some((r) => metaOf(r).systemMode);
  if (isSystemRoute && session.role !== 'super_admin') {
    return next(landingForRole(session.role) as any);
  }

  // ---- 4) Role guard ----
  const allowedRoles = metaOf(to).roles;
  if (allowedRoles && session.role && !allowedRoles.includes(session.role)) {
    return next(landingForRole(session.role) as any);
  }

  // ---- 5) Permission guard (meta.permission) ----
  const requiredPermissions = collectMeta(to, 'permission');
  if (requiredPermissions.length > 0) {
    if (!requiredPermissions.every((p) => can(p as Permission))) {
      return next({
        name: 'module-denied',
        query: { permission: requiredPermissions.join(','), from: to.fullPath },
      } as any);
    }
  }

  // ---- 6) Module permission guard (meta.module) ----
  const requiredModules = collectMeta(to, 'module');
  if (requiredModules.length > 0) {
    // Super Admin ve todo
    if (session.role !== 'super_admin') {
      for (const key of requiredModules) {
        if (!isModuleEnabled(tenant.currentTenant, key)) {
          return next({ name: 'module-denied', query: { module: key, from: to.fullPath } } as any);
        }
      }
    }
  }

  // ---- 7) Tenant active guard ----
  if (session.role !== 'super_admin' && session.role !== 'client') {
    if (session.tenantId && tenant.currentTenant && tenant.currentTenant.active === false) {
      if (to.name !== 'tenant-suspended') {
        return next({ name: 'tenant-suspended' } as any);
      }
    }
  }

  // ---- 8) Self-only guard ----
  const selfOnly = to.matched.some((r) => metaOf(r).selfOnly);
  if (selfOnly) {
    const targetId = to.params.id as string | undefined;
    if (session.role !== 'super_admin' && targetId && targetId !== session.user?.id) {
      return next({ name: 'dashboard' } as any);
    }
  }

  // Todo OK
  next();
};
