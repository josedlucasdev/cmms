<template>
  <div v-if="supplier" class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <AppCard padding="md">
      <div class="flex items-center gap-3">
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
          :style="{ backgroundColor: colorFromString(supplier.name) }"
        >
          {{ initials(supplier.name) }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-zinc-900">{{ supplier.name }}</h2>
          <p class="text-sm text-zinc-500">{{ supplier.category }}</p>
        </div>
      </div>
    </AppCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Datos fiscales</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-zinc-500">RIF</dt><dd class="font-mono font-semibold">{{ supplier.taxId }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Email</dt><dd class="font-semibold">{{ supplier.email ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Teléfono</dt><dd class="font-semibold">{{ supplier.phone ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-zinc-500">Dirección</dt><dd class="font-semibold">{{ supplier.address ?? '—' }}</dd></div>
        </dl>
      </AppCard>
      <AppCard padding="md">
        <h3 class="text-sm font-bold text-zinc-800 mb-3">Calificación</h3>
        <div class="flex items-center gap-1 mb-2">
          <ion-icon
            v-for="i in 5"
            :key="i"
            :icon="star"
            :class="i <= Math.round(supplier.rating) ? 'text-amber-500' : 'text-zinc-200'"
            class="text-xl"
          />
        </div>
        <p class="text-xs text-zinc-500">{{ supplier.rating.toFixed(1) }} / 5.0</p>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { star } from 'ionicons/icons';
import { suppliersService } from '@/services/db';
import type { Supplier } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import { colorFromString, initials } from '@/composables/useFormat';

const route = useRoute();
const supplier = ref<Supplier | null>(null);

onMounted(async () => {
  supplier.value = await suppliersService.get(route.params.id as string);
});
</script>
