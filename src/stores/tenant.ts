import { defineStore } from 'pinia';
import { ref } from 'vue';
import { settingsService, tenantsService } from '@/services/db';
import type { ID, Tenant, TenantSettings } from '@/types/domain';

export const useTenantStore = defineStore('tenant', () => {
  const tenants = ref<Tenant[]>([]);
  const currentTenant = ref<Tenant | null>(null);
  const settings = ref<TenantSettings | null>(null);

  async function loadAll() {
    tenants.value = await tenantsService.list();
  }

  async function setCurrent(tenantId: ID | null) {
    if (!tenantId) {
      currentTenant.value = null;
      settings.value = null;
      return;
    }
    const t = await tenantsService.get(tenantId);
    currentTenant.value = t;
    if (t) {
      settings.value = await settingsService.getTenant(tenantId);
    }
  }

  async function updateSettings(data: Partial<TenantSettings>) {
    if (!settings.value) return;
    const updated = await settingsService.updateTenant(settings.value.tenantId, data);
    if (updated) settings.value = updated;
  }

  return { tenants, currentTenant, settings, loadAll, setCurrent, updateSettings };
});
