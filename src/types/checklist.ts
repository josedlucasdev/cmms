/**
 * Tipos relacionados con el Checklist Obligatorio de Seguridad HSE
 * (HSE = Health, Safety & Environment)
 */

export type ChecklistItemType = 'boolean' | 'select';

export type ChecklistSeverity = 'low' | 'medium' | 'high';

/**
 * Ítem del checklist HSE. La configuración sale de los Settings del Tenant
 * (ver sección 3.7 del PRD: parametrización de preguntas de los Checklists).
 */
export interface HseChecklistItem {
  /** ID único del ítem dentro del checklist */
  id: string;
  /** Pregunta que verá el técnico (es) */
  question: string;
  /** Tipo de respuesta esperada */
  type: ChecklistItemType;
  /** Si es 'select', las opciones válidas */
  options?: string[];
  /** Si la respuesta es booleana, qué valor se considera "válido" para pasar */
  expectedBoolean?: boolean;
  /** Severidad del ítem (afecta el color de la UI) */
  severity: ChecklistSeverity;
  /** Ítems obligatorios bloquean el inicio del time tracking si no se cumplen */
  mandatory: boolean;
}

export interface HseChecklistResponse {
  itemId: string;
  /** Respuesta del usuario */
  value: boolean | string | null;
  /** Marca de tiempo ISO 8601 */
  answeredAt: string;
}

/**
 * Firma digital trazada por el técnico en el canvas
 */
export interface HseSignature {
  /** Imagen PNG en base64 */
  dataUrl: string;
  /** Nombre del firmante */
  signedBy: string;
  /** Documento de identidad del firmante */
  signedById: string;
  /** Marca de tiempo ISO 8601 */
  signedAt: string;
  /** Geolocalización al momento de firmar (si está disponible) */
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
}

export interface HseChecklistLog {
  /** ID del log (UUID) */
  id: string;
  /** ID de la OT a la que se asocia */
  workOrderId: string;
  /** ID de la tarea a la que se asocia */
  taskId: string;
  /** ID del técnico que completó el checklist */
  userId: string;
  /** Respuestas brindadas */
  responses: HseChecklistResponse[];
  /** Firma digital del técnico */
  signature: HseSignature;
  /** Indica si el checklist pasó todas las validaciones */
  passed: boolean;
  /** Fecha de creación del log */
  createdAt: string;
}
