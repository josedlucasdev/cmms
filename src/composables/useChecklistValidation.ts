import { computed, ref } from 'vue';
import type {
  HseChecklistItem,
  HseChecklistResponse,
  HseSignature,
} from '@/types/checklist';

/**
 * Composable que encapsula toda la lógica de validación del
 * Checklist HSE y expone el estado que la UI necesita para
 * BLOQUEAR o HABILITAR el botón de inicio del Time Tracking.
 *
 * La UI no debería tomar decisiones de bloqueo: este composable
 * es la única fuente de verdad (`canStartTracking`).
 */
export function useChecklistValidation(items: HseChecklistItem[]) {
  // Map de respuestas: { [itemId]: value }
  const responses = ref<Record<string, boolean | string | null>>(
    items.reduce<Record<string, boolean | string | null>>((acc, item) => {
      acc[item.id] = null;
      return acc;
    }, {})
  );

  const signature = ref<HseSignature | null>(null);

  /** Lista derivada de ítems pendientes por responder */
  const pendingItems = computed(() =>
    items.filter((item) => {
      const value = responses.value[item.id];
      if (item.type === 'boolean') {
        return value === null;
      }
      // select
      return value === null || value === '';
    })
  );

  /** Ítems obligatorios respondidos */
  const mandatoryAnswered = computed(() =>
    items
      .filter((i) => i.mandatory)
      .every((item) => {
        const value = responses.value[item.id];
        if (item.type === 'boolean') {
          return typeof value === 'boolean';
        }
        return typeof value === 'string' && value.length > 0;
      })
  );

  /** Ítems obligatorios respondidos de forma "satisfactoria" */
  const mandatoryPassed = computed(() =>
    items
      .filter((i) => i.mandatory)
      .every((item) => isItemValid(item, responses.value[item.id]))
  );

  /** ¿Existe firma capturada? */
  const hasSignature = computed(
    () => signature.value !== null && signature.value.dataUrl.length > 0
  );

  /**
   * `canStartTracking` es el flag principal de la UI.
   * El botón de Time Tracking SOLO se habilita si:
   *   1. Todos los ítems obligatorios están respondidos
   *   2. Todas las respuestas de los ítems obligatorios son válidas
   *   3. La firma digital ha sido capturada
   */
  const canStartTracking = computed(
    () => mandatoryAnswered.value && mandatoryPassed.value && hasSignature.value
  );

  /** Total de ítems obligatorios (para mostrar progreso) */
  const totalMandatory = computed(() => items.filter((i) => i.mandatory).length);

  /** Total de ítems obligatorios respondidos */
  const answeredMandatory = computed(() => {
    return items
      .filter((i) => i.mandatory)
      .filter((item) => {
        const value = responses.value[item.id];
        if (item.type === 'boolean') return typeof value === 'boolean';
        return typeof value === 'string' && value.length > 0;
      }).length;
  });

  /** Porcentaje de progreso (0-100) */
  const progress = computed(() => {
    // mitad checklist + mitad firma
    const checklistPct =
      totalMandatory.value === 0
        ? 100
        : (answeredMandatory.value / totalMandatory.value) * 50;
    const signaturePct = hasSignature.value ? 50 : 0;
    return Math.round(checklistPct + signaturePct);
  });

  function setBooleanResponse(itemId: string, value: boolean) {
    responses.value[itemId] = value;
  }

  function setSelectResponse(itemId: string, value: string) {
    responses.value[itemId] = value;
  }

  function setSignature(sig: HseSignature) {
    signature.value = sig;
  }

  function clearSignature() {
    signature.value = null;
  }

  /** Construye el array de respuestas serializables para enviar al backend */
  function buildResponses(): HseChecklistResponse[] {
    const now = new Date().toISOString();
    return items.map((item) => ({
      itemId: item.id,
      value: responses.value[item.id],
      answeredAt: now,
    }));
  }

  function reset() {
    items.forEach((item) => {
      responses.value[item.id] = null;
    });
    signature.value = null;
  }

  return {
    // Estado
    responses,
    signature,
    // Computados
    pendingItems,
    mandatoryAnswered,
    mandatoryPassed,
    hasSignature,
    canStartTracking,
    totalMandatory,
    answeredMandatory,
    progress,
    // Acciones
    setBooleanResponse,
    setSelectResponse,
    setSignature,
    clearSignature,
    buildResponses,
    reset,
  };
}

/**
 * Determina si la respuesta de un ítem es "válida" según su tipo.
 * Para booleanos se compara contra `expectedBoolean`.
 * Para selects, cualquier valor distinto de vacío/null se considera válido.
 */
function isItemValid(
  item: HseChecklistItem,
  value: boolean | string | null
): boolean {
  if (value === null || value === '') return false;

  if (item.type === 'boolean') {
    if (typeof value !== 'boolean') return false;
    return item.expectedBoolean === undefined ? true : value === item.expectedBoolean;
  }

  // select
  if (typeof value !== 'string') return false;
  if (!item.options || item.options.length === 0) return true;
  return item.options.includes(value);
}
