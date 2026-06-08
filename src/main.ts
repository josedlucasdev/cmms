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

const app = createApp(App);
const pinia = createPinia();
app.use(IonicVue).use(pinia).use(router);

// Hidratar el seed y stores antes de inicializar router
bootstrapData();

router.isReady().then(async () => {
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
});
