<template>
  <div v-if="plan" class="p-4 md:p-6 max-w-3xl mx-auto pb-12 space-y-4">
    <AppCard padding="md">
      <p class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Plan Preventivo</p>
      <h2 class="text-xl font-bold text-zinc-900">{{ plan.name }}</h2>
      <p class="text-sm text-zinc-600 mt-1">{{ plan.description }}</p>
    </AppCard>
    <div class="grid grid-cols-2 gap-3">
      <AppCard padding="md">
        <p class="text-xs text-zinc-500 uppercase font-semibold">Frecuencia</p>
        <p class="text-2xl font-bold mt-1">cada {{ plan.frequencyValue }} {{ plan.frequencyUnit }}</p>
      </AppCard>
      <AppCard padding="md">
        <p class="text-xs text-zinc-500 uppercase font-semibold">Próximo disparo</p>
        <p class="text-lg font-bold mt-1">{{ formatDate(plan.nextTriggerAt) }}</p>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { preventiveService } from '@/services/db';
import type { PreventivePlan } from '@/types/domain';
import AppCard from '@/components/common/AppCard.vue';
import { formatDate } from '@/composables/useFormat';

const route = useRoute();
const plan = ref<PreventivePlan | null>(null);

onMounted(async () => {
  plan.value = await preventiveService.get(route.params.id as string);
});
</script>
