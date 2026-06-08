import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNetworkStore = defineStore('network', () => {
  const online = ref(true);
  /** Forzamos modo offline desde la UI para demo (sin backend) */
  const forcedOffline = ref(false);
  let cleanup: (() => void) | null = null;

  async function init() {
    try {
      const { Network } = await import('@capacitor/network');
      const status = await Network.getStatus();
      online.value = status.connected && !forcedOffline.value;
      const handle = (Network as any).addStatusListener((s: { connected: boolean }) => {
        online.value = s.connected && !forcedOffline.value;
      });
      cleanup = () => handle.remove();
    } catch {
      // Fallback web
      const update = () => {
        online.value = navigator.onLine && !forcedOffline.value;
      };
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      cleanup = () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }
  }

  function destroy() {
    cleanup?.();
  }

  function toggleForced() {
    forcedOffline.value = !forcedOffline.value;
    online.value = !forcedOffline.value && (typeof navigator !== 'undefined' ? navigator.onLine : true);
  }

  function syncNow() {
    // Simulación: marca de tiempo de última sincronización
    return new Date().toISOString();
  }

  return { online, forcedOffline, init, destroy, toggleForced, syncNow };
});
