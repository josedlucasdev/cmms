<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto pb-12 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-zinc-500">Conversor multimoneda con tasas BCV</p>
      <CurrencySwitcher :model-value="preferred" @update:model-value="setPreferred" />
    </div>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Conversor rápido</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <FormField v-model="fromAmount" label="Monto" type="number" :step="0.01" />
        <FormField v-model="fromCurrency" label="De" select :options="currencyOptions" />
        <FormField v-model="toCurrency" label="A" select :options="currencyOptions" />
      </div>
      <div class="mt-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
        <p class="text-xs text-zinc-600 mb-1">Resultado</p>
        <p class="text-3xl font-bold font-mono text-primary-700">
          {{ formatCurrency(convertedAmount) }}
        </p>
        <p class="text-[11px] text-zinc-500 mt-1">
          Tasa BCV del {{ latest?.date }}: US$ 1 = Bs. {{ latest?.usdToVes.toFixed(2) }} · € 1 = Bs. {{ latest?.eurToVes.toFixed(2) }}
        </p>
      </div>
    </AppCard>

    <AppCard padding="md">
      <h3 class="text-sm font-bold text-zinc-800 mb-3">Histórico de tasas BCV (últimos 30 días)</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
        <div
          v-for="r in rates"
          :key="r.date"
          class="p-2 border border-zinc-200 rounded-lg"
        >
          <p class="text-[10px] text-zinc-500 font-mono">{{ r.date }}</p>
          <p class="text-xs font-bold mt-1">USD: Bs. {{ r.usdToVes.toFixed(2) }}</p>
          <p class="text-xs font-bold text-zinc-500">EUR: Bs. {{ r.eurToVes.toFixed(2) }}</p>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCurrencyStore } from '@/stores/currency';
import type { Currency } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';
import CurrencySwitcher from '@/components/common/CurrencySwitcher.vue';

const store = useCurrencyStore();
const { preferred, latest, rates } = storeToRefs(store);

const fromAmount = ref(100);
const fromCurrency = ref<Currency>('USD');
const toCurrency = ref<Currency>('VES');

const currencyOptions = [
  { value: 'USD', label: 'USD — Dólar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'VES', label: 'VES — Bolívar' },
];

const convertedAmount = computed(() =>
  store.convert(Number(fromAmount.value), fromCurrency.value, toCurrency.value),
);

function formatCurrency(v: number): string {
  const sym = toCurrency.value === 'USD' ? 'US$' : toCurrency.value === 'EUR' ? '€' : 'Bs.';
  return `${sym} ${v.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function setPreferred(c: Currency) { store.setPreferred(c); }

onMounted(async () => {
  await store.load();
});
</script>
