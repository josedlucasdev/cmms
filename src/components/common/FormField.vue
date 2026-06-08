<template>
  <label class="block">
    <span v-if="label" class="block text-xs font-semibold text-zinc-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </span>
    <div class="relative">
      <span v-if="$slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm z-10">
        <slot name="prefix" />
      </span>
      <span
        v-if="readonly && lockIcon"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        title="Campo autocompletado por el sistema"
      >
        <ion-icon :icon="lockClosedOutline" class="text-sm" />
      </span>
      <input
        v-if="!textarea && !select"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        style="color-scheme: light;"
        class="w-full rounded-lg border text-sm placeholder:text-zinc-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-500"
        :class="[sizeClass, $slots.prefix ? 'pl-9' : 'pl-3', readonly && lockIcon ? 'pr-9' : 'pr-3', error ? 'border-red-400' : '', readonly ? 'bg-zinc-50 border-zinc-200 text-zinc-700 cursor-not-allowed' : 'bg-white border-zinc-300 text-zinc-900']"
        @input="onInput"
      />
      <textarea
        v-else-if="textarea"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :rows="rows"
        style="color-scheme: light;"
        class="w-full rounded-lg border text-sm placeholder:text-zinc-400 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-500"
        :class="[error ? 'border-red-400' : '', readonly ? 'bg-zinc-50 border-zinc-200 text-zinc-700 cursor-not-allowed' : 'bg-white border-zinc-300 text-zinc-900']"
        @input="onInput"
      />
      <select
        v-else
        :value="modelValue"
        :disabled="disabled || readonly"
        style="color-scheme: light;"
        class="w-full rounded-lg border text-sm pl-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors appearance-none disabled:bg-zinc-100 disabled:text-zinc-500"
        :class="[sizeClass, readonly && lockIcon ? 'pr-9' : 'pr-3', readonly ? 'bg-zinc-50 border-zinc-200 text-zinc-700 cursor-not-allowed' : 'bg-white border-zinc-300 text-zinc-900']"
        @change="onInput($event)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    <p v-if="error" class="mt-1 text-[11px] text-red-600 font-semibold">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-[11px] text-zinc-500">{{ hint }}</p>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { lockClosedOutline } from 'ionicons/icons';

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    label?: string;
    type?: string;
    placeholder?: string;
    helper?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    readonly?: boolean;
    /** Si es true, muestra un candado cuando readonly (campo autocompletado) */
    lockIcon?: boolean;
    disabled?: boolean;
    textarea?: boolean;
    select?: boolean;
    rows?: number;
    options?: { value: string | number; label: string }[];
    min?: string | number;
    max?: string | number;
    step?: string | number;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { type: 'text', label: '', placeholder: '', error: '', hint: '', required: false, readonly: false, lockIcon: true, disabled: false, rows: 3, size: 'md' },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: string | number): void }>();

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-8 py-1';
    case 'lg': return 'h-12 py-2 text-base';
    default: return 'h-10 py-2';
  }
});

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const value = target.value;
  emit('update:modelValue', props.type === 'number' ? Number(value) : value);
}
</script>
