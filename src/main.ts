import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import './theme/tailwind.css';
import './theme/variables.css';

import { bootstrapData } from '@/mock/seed';
import { useSessionStore } from '@/stores/session';
import { useTenantStore } from '@/stores/tenant';
import { useCurrencyStore } from '@/stores/currency';
import { useNetworkStore } from '@/stores/network';

// =====================================================================
//  Pantalla de error visible (para GitHub Pages / hosting estático)
//  Si la app falla al iniciar, mostramos el error en pantalla en vez
//  de dejar la página en blanco.
// =====================================================================
function showFatalError(err: unknown) {
  const root = document.getElementById('app');
  if (!root) return;
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  const stack = err instanceof Error && err.stack ? err.stack : '';
  console.error('[ProMaintenance] Error fatal al iniciar:', err);
  root.innerHTML = `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 24px; max-width: 720px; margin: 40px auto; background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px;">
      <h1 style="color: #9a3412; font-size: 20px; margin: 0 0 8px;">⚠️ ProMaintenance no pudo iniciar</h1>
      <p style="color: #7c2d12; margin: 0 0 12px;">Ocurrió un error durante la inicialización de la app.</p>
      <pre style="background: #fff; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; font-size: 12px; overflow: auto; color: #7c2d12; white-space: pre-wrap; word-break: break-all;">${message}\n\n${stack}</pre>
    </div>
  `;
}

window.addEventListener('error', (e) => {
  // Errores no capturados en tiempo de ejecución
  console.error('[ProMaintenance] Error global:', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[ProMaintenance] Promise rechazada:', e.reason);
});

const app = createApp(App);
const pinia = createPinia();
app.use(IonicVue).use(pinia).use(router);

// Hidratar el seed y stores antes de inicializar router
try {
  bootstrapData();
} catch (e) {
  console.warn('[ProMaintenance] bootstrapData() falló, continuando:', e);
}

router.isReady()
  .then(async () => {
    try {
      // Inicializar stores globales
      const session = useSessionStore();
      const tenant = useTenantStore();
      const currency = useCurrencyStore();
      const network = useNetworkStore();

      await tenant.loadAll();
      await session.restore();
      if (session.tenantId) {
        await tenant.setCurrent(session.tenantId);
      }
      await currency.load();
      await network.init();

      app.mount('#app');
    } catch (e) {
      showFatalError(e);
    }
  })
  .catch((e) => showFatalError(e));
