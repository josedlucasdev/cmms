/**
 * Composables auxiliares del proyecto.
 */

import { computed, type Ref } from 'vue';
import type { Currency } from '@/types/domain';
import { useCurrencyStore } from '@/stores/currency';

/** Formatea un número como moneda usando la tienda de moneda. */
export function useFormatCurrency(sourceCurrency: Ref<Currency> | (() => Currency) = () => 'USD') {
  const store = useCurrencyStore();
  const format = (amount: number, fractionDigits = 2) => {
    const c = typeof sourceCurrency === 'function' ? sourceCurrency() : sourceCurrency.value;
    return store.format(amount, c, fractionDigits);
  };
  return { format };
}

/** Convierte un monto a la moneda preferida del store. */
export function useConvertToPreferred() {
  const store = useCurrencyStore();
  return (amount: number, from: Currency) => store.convert(amount, from, store.preferred);
}

/** Da un color hex determinista a partir de un string (avatar). */
export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const palette = ['#3A5CFF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#0EA5E9', '#F97316'];
  return palette[Math.abs(hash) % palette.length];
}

/** Iniciales a partir de un nombre completo. */
export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Etiqueta legible para estados de OT/Tarea. */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Proceso',
    stopped: 'Detenida',
    completed: 'Completada',
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#F59E0B',
    in_progress: '#3A5CFF',
    stopped: '#DC2626',
    completed: '#16A34A',
  };
  return map[status] ?? '#64748B';
}

export function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  };
  return map[priority] ?? priority;
}

export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: '#16A34A',
    medium: '#3A5CFF',
    high: '#F59E0B',
    critical: '#DC2626',
  };
  return map[priority] ?? '#64748B';
}

export function formatDate(iso: string | undefined, withTime = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  if (!withTime) return date;
  const time = d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export function formatRelative(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diff = d.getTime() - Date.now();
  const absMin = Math.abs(diff) / 60000;
  if (absMin < 1) return 'hace un momento';
  if (absMin < 60) return diff < 0 ? `hace ${Math.round(absMin)} min` : `en ${Math.round(absMin)} min`;
  const absH = absMin / 60;
  if (absH < 24) return diff < 0 ? `hace ${Math.round(absH)} h` : `en ${Math.round(absH)} h`;
  const absD = absH / 24;
  if (absD < 30) return diff < 0 ? `hace ${Math.round(absD)} d` : `en ${Math.round(absD)} d`;
  return formatDate(iso);
}

/** Genera color para semáforo SLA según horas restantes vs límite. */
export function slaColor(remainingHours: number, totalHours: number): { color: string; label: string } {
  const ratio = totalHours > 0 ? remainingHours / totalHours : 1;
  if (ratio < 0.1) return { color: '#DC2626', label: 'Crítico' };
  if (ratio < 0.35) return { color: '#F59E0B', label: 'Atención' };
  return { color: '#16A34A', label: 'OK' };
}

/** Devuelve la fecha en formato YYYY-MM-DD. */
export function todayISO(): string {
  return new Date().toISOString().substring(0, 10);
}

/** Calcula costo total de tarea sumando horas, equipos y materiales. */
export function computeTaskCost(args: {
  workerHours: number;
  workerRate: number;
  equipmentHours: number;
  equipmentRate: number;
  materials: { quantity: number; unitCost: number }[];
  additionalCost: number;
}): number {
  const { workerHours, workerRate, equipmentHours, equipmentRate, materials, additionalCost } = args;
  const mat = materials.reduce((s, m) => s + m.quantity * m.unitCost, 0);
  return workerHours * workerRate + equipmentHours * equipmentRate + mat + additionalCost;
}

/** Costo total de OT = tareas + costo fijo + logística + adicionales. */
export function computeWorkOrderCost(args: {
  tasksTotal: number;
  fixedCost: number;
  logisticsCost: number;
  additionalCost: number;
}): number {
  return args.tasksTotal + args.fixedCost + args.logisticsCost + args.additionalCost;
}

/** Costo total de Proyecto = suma de OTs + costos adicionales. */
export function computeProjectCost(args: {
  workOrdersTotal: number;
  additionalCost: number;
}): number {
  return args.workOrdersTotal + args.additionalCost;
}
