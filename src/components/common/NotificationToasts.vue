<template>
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] space-y-2 pointer-events-none">
    <transition-group name="toast" tag="div" class="space-y-2">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 min-w-[260px] max-w-md"
        :class="colorClass(t.color)"
      >
        <ion-icon :icon="iconFor(t.color)" />
        <span class="flex-1">{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { IonIcon } from '@ionic/vue';
import {
  checkmarkCircle,
  informationCircle,
  warningOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useNotificationStore, type ToastItem } from '@/stores/notification';

const store = useNotificationStore();
const { toasts } = storeToRefs(store);

function colorClass(c: ToastItem['color']) {
  switch (c) {
    case 'success': return 'bg-green-600';
    case 'warning': return 'bg-amber-500';
    case 'danger': return 'bg-red-600';
    case 'medium': return 'bg-zinc-700';
    default: return 'bg-primary-600';
  }
}
function iconFor(c: ToastItem['color']) {
  switch (c) {
    case 'success': return checkmarkCircle;
    case 'warning': return warningOutline;
    case 'danger': return alertCircleOutline;
    default: return informationCircle;
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
