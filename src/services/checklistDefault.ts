import type { HseChecklistItem } from '@/types/checklist';

/**
 * Configuración por defecto del checklist HSE.
 * Esta lista suele venir de los Settings del Tenant (sección 3.7 del PRD),
 * por lo que en producción debería consultarse al backend de Laravel.
 * Aquí se expone para que el componente funcione out-of-the-box.
 */
export const DEFAULT_HSE_CHECKLIST: HseChecklistItem[] = [
  {
    id: 'ppe-1',
    question: '¿Cuenta con todos los EPP necesarios para la tarea (casco, guantes, gafas, botas)?',
    type: 'boolean',
    expectedBoolean: true,
    severity: 'high',
    mandatory: true,
  },
  {
    id: 'welding-mask',
    question: '¿Tiene careta de soldar en buen estado?',
    type: 'boolean',
    expectedBoolean: true,
    severity: 'high',
    mandatory: true,
  },
  {
    id: 'inflammable-gases',
    question: '¿Entorno libre de gases inflamables o materiales combustibles?',
    type: 'boolean',
    expectedBoolean: true,
    severity: 'high',
    mandatory: true,
  },
  {
    id: 'lockout-tagout',
    question: '¿Se aplicó el procedimiento LOTO (Lockout/Tagout) al equipo a intervenir?',
    type: 'boolean',
    expectedBoolean: true,
    severity: 'high',
    mandatory: true,
  },
  {
    id: 'first-aid',
    question: '¿Botiquín de primeros auxilios disponible en el área?',
    type: 'boolean',
    expectedBoolean: true,
    severity: 'medium',
    mandatory: true,
  },
  {
    id: 'fall-protection',
    question: 'Si la tarea es en altura, ¿posee arnés y línea de vida certificada?',
    type: 'boolean',
    expectedBoolean: true,
    severity: 'high',
    mandatory: false,
  },
  {
    id: 'work-condition',
    question: 'Estado general del área de trabajo',
    type: 'select',
    options: ['Óptimo', 'Aceptable', 'Deficiente'],
    severity: 'medium',
    mandatory: true,
  },
];
