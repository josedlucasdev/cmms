<template>
  <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
    <div v-if="$slots.toolbar || searchable" class="px-4 py-3 border-b border-zinc-200 flex items-center gap-3 flex-wrap">
      <slot name="toolbar" />
      <div v-if="searchable" class="flex-1 min-w-[200px] max-w-xs relative">
        <ion-icon :icon="searchOutline" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-zinc-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-2.5 text-left whitespace-nowrap"
              :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-sm text-zinc-500">
              <slot name="empty">No hay datos para mostrar</slot>
            </td>
          </tr>
          <tr
            v-for="(row, idx) in filtered"
            :key="getRowKey(row, idx)"
            class="border-t border-zinc-100 hover:bg-zinc-50/60 cursor-pointer transition-colors"
            @click="$emit('rowClick', row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
              :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="getValue(row, col.key)">
                {{ getValue(row, col.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { searchOutline } from 'ionicons/icons';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

const props = withDefaults(
  defineProps<{
    columns: Column[];
    rows: T[];
    searchable?: boolean;
    searchKeys?: string[];
    rowKey?: keyof T | ((row: T) => string | number);
  }>(),
  { searchable: true },
);

defineEmits<{ (e: 'rowClick', row: T): void }>();

const search = ref('');

const filtered = computed(() => {
  if (!search.value.trim()) return props.rows;
  const q = search.value.toLowerCase();
  return props.rows.filter((row) => {
    const keys = props.searchKeys ?? Object.keys(row as object);
    return keys.some((k) => {
      const v = (row as Record<string, unknown>)[k];
      if (v === null || v === undefined) return false;
      return String(v).toLowerCase().includes(q);
    });
  });
});

function getValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function getRowKey(row: T, idx: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row);
  if (props.rowKey) return (row as Record<string, unknown>)[props.rowKey as string] as string | number;
  return idx;
}
</script>
