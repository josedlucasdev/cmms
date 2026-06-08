import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { bcvService } from '@/services/db';
import type { BcvRate, Currency } from '@/types/domain';
import { storage } from '@/mock/storage';

export const useCurrencyStore = defineStore('currency', () => {
  const preferred = ref<Currency>(storage.get<Currency>('preferredCurrency', 'USD'));
  const rates = ref<BcvRate[]>([]);
  const lastSync = ref<string | null>(null);

  const latest = computed<BcvRate | null>(() => {
    if (rates.value.length === 0) return null;
    return rates.value[rates.value.length - 1] ?? null;
  });

  async function load() {
    rates.value = await bcvService.list();
    lastSync.value = new Date().toISOString();
  }

  function setPreferred(c: Currency) {
    preferred.value = c;
    storage.set('preferredCurrency', c);
  }

  /**
   * Convierte un monto entre monedas usando la tasa BCV más reciente.
   * Tasas base: USD/VES y EUR/VES. USD/EUR = (USD/VES) / (EUR/VES).
   */
  function convert(amount: number, from: Currency, to: Currency, atDate?: string): number {
    if (from === to) return amount;
    const rate = (() => {
      if (atDate) {
        return rates.value.find((r) => r.date === atDate) ?? latest.value;
      }
      return latest.value;
    })();
    if (!rate) return amount;
    const toVes = (v: number, c: Currency) => {
      if (c === 'VES') return v;
      if (c === 'USD') return v * rate.usdToVes;
      return v * rate.eurToVes;
    };
    const fromVes = (v: number, c: Currency) => {
      if (c === 'VES') return v;
      if (c === 'USD') return v / rate.usdToVes;
      return v / rate.eurToVes;
    };
    return fromVes(toVes(amount, from), to);
  }

  function format(amount: number, currency: Currency = preferred.value, fractionDigits = 2): string {
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs.';
    return `${sym} ${amount.toLocaleString('es-VE', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  }

  return { preferred, rates, latest, lastSync, load, setPreferred, convert, format };
});
