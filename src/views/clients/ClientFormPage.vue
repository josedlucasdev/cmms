<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto pb-12">
    <AppCard padding="lg">
      <h2 class="text-lg font-bold text-zinc-900 mb-1">
        {{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}
      </h2>
      <p class="text-sm text-zinc-500 mb-5">Información fiscal y de contacto</p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField v-model="form.name" label="Razón Social" required />
          <FormField v-model="form.taxId" label="RIF / Identificación fiscal" required />
          <FormField v-model="form.email" label="Email" type="email" />
          <FormField v-model="form.phone" label="Teléfono" />
          <FormField v-model="form.industry" label="Industria" />
          <FormField v-model="form.city" label="Ciudad" />
        </div>
        <FormField v-model="form.address" label="Dirección" textarea :rows="2" />

        <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
          <ion-button fill="outline" color="medium" :router-link="`/clients`">Cancelar</ion-button>
          <ion-button type="submit" color="primary" class="!font-semibold">
            {{ isEdit ? 'Guardar cambios' : 'Crear cliente' }}
          </ion-button>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonButton } from '@ionic/vue';
import { clientsService } from '@/services/db';
import { useSessionStore } from '@/stores/session';
import { useNotificationStore } from '@/stores/notification';
import AppCard from '@/components/common/AppCard.vue';
import FormField from '@/components/common/FormField.vue';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const notify = useNotificationStore();

const isEdit = computed(() => !!route.params.id);

const form = reactive({
  name: '',
  taxId: '',
  email: '',
  phone: '',
  industry: '',
  city: '',
  address: '',
  contacts: [] as { id: string; fullName: string; position?: string; email?: string; phone?: string }[],
});

onMounted(async () => {
  if (isEdit.value) {
    const c = await clientsService.get(route.params.id as string);
    if (c) Object.assign(form, c);
  }
});

async function onSubmit() {
  if (isEdit.value) {
    const updated = await clientsService.update(route.params.id as string, form);
    if (updated) {
      notify.push('Cliente actualizado', 'success');
      router.push(`/clients/${updated.id}`);
    }
  } else {
    const created = await clientsService.create({ ...form, tenantId: session.tenantId ?? 'T-001' });
    notify.push('Cliente creado', 'success');
    router.push(`/clients/${created.id}`);
  }
}
</script>
