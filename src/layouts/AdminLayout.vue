<template>
  <ion-page>
    <div class="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
      <AppSidebar />
      <div class="flex-1 flex flex-col min-w-0">
        <AppTopbar />
        <main class="flex-1 overflow-y-auto">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
    <NotificationToasts />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage } from '@ionic/vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppTopbar from '@/components/layout/AppTopbar.vue';
import NotificationToasts from '@/components/common/NotificationToasts.vue';
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
