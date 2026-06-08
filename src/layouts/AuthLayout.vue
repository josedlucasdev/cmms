<template>
  <ion-page class="auth-page">
    <!-- Fondo fijo que cubre todo el viewport -->
    <div class="auth-bg">
      <div class="auth-gradient" />
      <div class="blob blob-1" />
      <div class="blob blob-2" />
      <div class="blob blob-3" />
      <div class="auth-grid" />
      <div class="auth-vignette" />
    </div>

    <!-- Wrapper del contenido centrado -->
    <div class="auth-wrapper">
      <div class="auth-content">
        <router-view />
      </div>
    </div>

    <NotificationToasts />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage } from '@ionic/vue';
import NotificationToasts from '@/components/common/NotificationToasts.vue';
</script>

<style scoped>
/* ===== Sobrescribe el fondo blanco por defecto de Ionic ===== */
:deep(ion-page),
:deep(.ion-page) {
  --background: transparent;
  background: transparent !important;
}

.auth-page {
  position: relative;
  display: block;
  background: transparent;
}

/* ===== Capa de fondo: position: fixed para garantizar cobertura total ===== */
.auth-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ===== Wrapper del contenido ===== */
.auth-wrapper {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  min-height: 100dvh; /* fallback iOS Safari */
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

/* El contenido en sí: caja centrada con max-width */
.auth-content {
  width: 100%;
  max-width: 28rem;
  animation: card-float 8s ease-in-out infinite;
}

/* ===== Capa 1: gradiente base ===== */
.auth-gradient {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 40%, #ddd6fe 75%, #c7d2fe 100%);
}

/* ===== Capa 2: blobs difuminados ===== */
.blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  z-index: 2;
  will-change: transform;
}
.blob-1 {
  top: -10rem;
  left: -10rem;
  width: 28rem;
  height: 28rem;
  background: radial-gradient(circle, rgba(34, 57, 245, 0.40) 0%, rgba(34, 57, 245, 0) 70%);
  animation: blob-drift-1 18s ease-in-out infinite;
}
.blob-2 {
  bottom: -8rem;
  right: -8rem;
  width: 32rem;
  height: 32rem;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0) 70%);
  animation: blob-drift-2 22s ease-in-out infinite;
}
.blob-3 {
  top: 30%;
  right: 15%;
  width: 22rem;
  height: 22rem;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.22) 0%, rgba(236, 72, 153, 0) 70%);
  animation: blob-drift-3 26s ease-in-out infinite;
}

@keyframes blob-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(3rem, 4rem) scale(1.1); }
}
@keyframes blob-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-3rem, -2rem) scale(1.08); }
}
@keyframes blob-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  50% { transform: translate(-2rem, 2rem) scale(0.92); opacity: 0.8; }
}

/* ===== Capa 3: grid sutil ===== */
.auth-grid {
  position: absolute;
  inset: 0;
  z-index: 3;
  background-image:
    linear-gradient(rgba(34, 57, 245, 0.28) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 57, 245, 0.28) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 45%, black 50%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 45%, black 50%, transparent 90%);
}

/* ===== Capa 4: viñeta superior ===== */
.auth-vignette {
  position: absolute;
  inset: 0;
  z-index: 4;
  background:
    radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255, 255, 255, 0.45) 0%, transparent 60%),
    linear-gradient(180deg, transparent 0%, transparent 70%, rgba(0, 0, 0, 0.05) 100%);
}

@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .blob,
  .auth-content {
    animation: none !important;
  }
}
</style>
