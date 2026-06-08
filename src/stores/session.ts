import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authService, usersService } from '@/services/db';
import type { ID, Role, User } from '@/types/domain';

export const useSessionStore = defineStore('session', () => {
  const user = ref<User | null>(null);
  const tenantId = ref<ID | null>(null);
  const loggedAt = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const role = computed<Role | null>(() => user.value?.role ?? null);

  async function restore() {
    loading.value = true;
    try {
      const session = await authService.getSession();
      if (session) {
        const u = await usersService.get(session.userId);
        if (u) {
          user.value = u;
          tenantId.value = session.tenantId;
          loggedAt.value = session.loggedAt;
        }
      }
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, role: Role, tenantIdParam: ID) {
    loading.value = true;
    try {
      const u = await authService.login(email, role, tenantIdParam);
      if (u) {
        user.value = u;
        tenantId.value = u.tenantId;
        loggedAt.value = new Date().toISOString();
      }
      return u;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await authService.logout();
    user.value = null;
    tenantId.value = null;
    loggedAt.value = null;
  }

  function hasRole(...roles: Role[]): boolean {
    return role.value !== null && roles.includes(role.value);
  }

  return {
    user,
    tenantId,
    loggedAt,
    loading,
    isAuthenticated,
    role,
    restore,
    login,
    logout,
    hasRole,
  };
});
