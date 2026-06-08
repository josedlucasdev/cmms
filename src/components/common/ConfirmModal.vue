<template>
  <ion-modal :is-open="modelValue" @did-dismiss="$emit('update:modelValue', false)">
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('update:modelValue', false)">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="text-sm text-zinc-700 leading-relaxed">
        <slot name="message">{{ message }}</slot>
      </p>
      <slot />
    </ion-content>
    <ion-footer class="ion-no-border">
      <div class="px-4 py-3 bg-white border-t border-zinc-200 flex gap-2">
        <ion-button expand="block" fill="outline" color="medium" @click="$emit('update:modelValue', false)">
          Cancelar
        </ion-button>
        <ion-button expand="block" :color="confirmColor" @click="onConfirm">
          {{ confirmLabel }}
        </ion-button>
      </div>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    confirmColor?: 'primary' | 'danger' | 'success' | 'warning';
  }>(),
  { confirmLabel: 'Confirmar', confirmColor: 'primary' },
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'confirm'): void;
}>();

function onConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}
</script>
