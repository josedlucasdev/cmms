<template>
  <div class="p-4 md:p-6 space-y-4">
    <p class="text-sm text-zinc-500">Registro inmutable de acciones críticas</p>
    <DataTable
      :columns="columns"
      :rows="logs"
      :search-keys="['userName', 'action', 'entity', 'entityId']"
      :row-key="(l) => l.id"
    >
      <template #cell-timestamp="{ value }">
        <div>
          <p class="text-xs font-semibold">{{ formatDate(String(value), true) }}</p>
          <p class="text-[10px] text-zinc-500">{{ formatRelative(String(value)) }}</p>
        </div>
      </template>
      <template #cell-userName="{ row }">
        <span class="text-sm font-semibold">{{ row.userName }}</span>
      </template>
      <template #cell-action="{ row }">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
          :style="{ backgroundColor: actionColor(row.action) + '20', color: actionColor(row.action) }"
        >{{ row.action }}</span>
      </template>
      <template #cell-entity="{ row }">
        <div>
          <p class="text-sm">{{ row.entity }}</p>
          <p class="text-[10px] text-zinc-500 font-mono">{{ row.entityId }}</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { auditService } from '@/services/db';
import type { AuditLog } from '@/types/domain';
import { useSessionStore } from '@/stores/session';
import DataTable from '@/components/common/DataTable.vue';
import { formatDate, formatRelative } from '@/composables/useFormat';

const session = useSessionStore();
const logs = ref<AuditLog[]>([]);

const columns = [
  { key: 'timestamp', label: 'Fecha' },
  { key: 'userName', label: 'Usuario' },
  { key: 'action', label: 'Acción' },
  { key: 'entity', label: 'Entidad' },
];

function actionColor(a: string): string {
  const map: Record<string, string> = {
    Crear: '#16A34A',
    Actualizar: '#3A5CFF',
    Eliminar: '#DC2626',
    Aprobar: '#8B5CF6',
    Cerrar: '#F59E0B',
  };
  return map[a] ?? '#64748B';
}

onMounted(async () => {
  logs.value = await auditService.list(session.tenantId);
});
</script>
