import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ToastItem {
  id: number;
  message: string;
  color: 'success' | 'warning' | 'danger' | 'primary' | 'medium';
  duration: number;
}

export const useNotificationStore = defineStore('notification', () => {
  const toasts = ref<ToastItem[]>([]);
  let nextId = 1;

  function push(message: string, color: ToastItem['color'] = 'primary', duration = 2500) {
    const id = nextId++;
    toasts.value.push({ id, message, color, duration });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  return { toasts, push };
});
