<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary" class="!min-h-[56px]">
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title class="!font-semibold tracking-tight">
          <slot name="title">ProMaintenance</slot>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleOffline">
            <ion-icon :icon="online ? cloudOfflineOutline : cloudDoneOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <div v-if="!online" class="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-2">
        <ion-icon :icon="cloudOfflineOutline" />
        <span>Modo offline — los datos se guardan localmente</span>
      </div>
    </ion-header>

    <ion-content :fullscreen="true">
      <router-view v-slot="{ Component, route }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-tab-bar slot="bottom" class="border-t border-zinc-200">
        <ion-tab-button tab="tasks" href="/tasks">
          <ion-icon :icon="listOutline" />
          <ion-label>Mis Tareas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="schedule" href="/mobile/schedule">
          <ion-icon :icon="calendarOutline" />
          <ion-label>Agenda</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="scan" href="/mobile/scan">
          <ion-icon :icon="qrCodeOutline" />
          <ion-label>Escanear</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/mobile/profile">
          <ion-icon :icon="personCircleOutline" />
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-footer>

    <NotificationToasts />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/vue';
import {
  cloudOfflineOutline,
  cloudDoneOutline,
  listOutline,
  calendarOutline,
  qrCodeOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { useNetworkStore } from '@/stores/network';
import NotificationToasts from '@/components/common/NotificationToasts.vue';

const network = useNetworkStore();
const { online } = storeToRefs(network);
const toggleOffline = () => network.toggleForced();
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
