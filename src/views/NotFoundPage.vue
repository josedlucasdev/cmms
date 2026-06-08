<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
        <ion-icon :icon="alertCircleOutline" class="text-4xl" />
      </div>
      <h1 class="text-3xl font-bold text-zinc-900 tracking-tight">404</h1>
      <p class="text-base text-zinc-600 mt-2">Página no encontrada</p>
      <p class="text-sm text-zinc-500 mt-1">La ruta que buscas no existe o fue movida.</p>
      <ion-button router-link="/dashboard" class="!mt-5 !font-semibold" color="primary">
        <ion-icon slot="start" :icon="homeOutline" />
        Volver al inicio
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { alertCircleOutline, homeOutline } from 'ionicons/icons';
</script>
