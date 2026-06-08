<template>
  <span class="inline-flex items-center gap-1 font-mono tabular-nums" :class="sizeClass">
    <span class="text-zinc-400 text-[0.7em]">{{ symbol }}</span>
    <span class="font-semibold text-zinc-900">{{ formatted }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCurrencyStore } from '@/stores/currency';
import type { Currency } from '@/types/domain';

const props = withDefaults(
  defineProps<{
    amount: number;
    currency?: Currency;
    /** Si se omite, se muestra en la moneda preferida del store */
    autoConvert?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { currency: 'USD', autoConvert: true, size: 'md' },
);

const store = useCurrencyStore();
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs';
    case 'lg': return 'text-lg';
    default: return 'text-sm';
  }
});

const finalAmount = computed(() => {
  if (!props.autoConvert) return props.amount;
  return store.convert(props.amount, props.currency, store.preferred);
});

const finalCurrency = computed(() => (props.autoConvert ? store.preferred : props.currency));

const symbol = computed(() => {
  switch (finalCurrency.value) {
    case 'USD': return 'US$';
    case 'EUR': return '€';
    case 'VES': return 'Bs.';
  }
});

const formatted = computed(() =>
  finalAmount.value.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
);
</script>
