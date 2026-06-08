/**
 * Composable simple para mostrar toasts nativos del navegador.
 * Wrapper sobre `useNotificationStore` para llamadas más cortas.
 */

import { useNotificationStore } from '@/stores/notification';

export function useToast() {
  const store = useNotificationStore();
  return {
    show(message: string, color: 'success' | 'warning' | 'danger' | 'primary' | 'medium' = 'primary', duration = 2500) {
      store.push(message, color, duration);
    },
  };
}
