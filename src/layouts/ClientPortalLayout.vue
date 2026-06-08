<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary" class="!min-h-[56px]">
        <ion-title class="!font-semibold tracking-tight flex items-center gap-2">
          <span class="text-lg">Portal Cliente</span>
          <span class="text-xs opacity-80">{{ clientName }}</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="bg-zinc-50">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </ion-content>

    <NotificationToasts />
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { useSessionStore } from '@/stores/session';
import NotificationToasts from '@/components/common/NotificationToasts.vue';

const router = useRouter();
const session = useSessionStore();
const clientName = ref('Industrias ACME C.A.');

async function logout() {
  await session.logout();
  router.replace('/portal/login');
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
