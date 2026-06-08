/**
 * Catálogo de módulos del sistema.
 * El Super Admin define cuáles están habilitados para cada Tenant.
 */

import {
  gridOutline,
  businessOutline,
  documentTextOutline,
  briefcaseOutline,
  constructOutline,
  listOutline,
  peopleOutline,
  cubeOutline,
  swapHorizontalOutline,
  calendarOutline,
  layersOutline,
  storefrontOutline,
  cartOutline,
  walletOutline,
  statsChartOutline,
  ribbonOutline,
  receiptOutline,
  globeOutline,
  micOutline,
  notificationsOutline,
} from 'ionicons/icons';

export const MODULE_KEYS = [
  'dashboard',
  'clients',
  'quotes',
  'projects',
  'work-orders',
  'tasks',
  'employees',
  'equipment',
  'logistics',
  'preventive',
  'inventory',
  'suppliers',
  'purchase-orders',
  'finance',
  'reports',
  'audit',
  'currency',
  'portal',
  'ai',
  'push',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  description: string;
  category: string;
  icon: any;
  required?: boolean;
}

export const ALL_MODULES: ModuleDef[] = [
  // Principal
  { key: 'dashboard', label: 'Dashboard', description: 'Panel de control con KPIs y métricas', category: 'Principal', icon: gridOutline, required: true },

  // Operaciones
  { key: 'clients', label: 'Clientes', description: 'CRM básico y contactos', category: 'Operaciones', icon: businessOutline },
  { key: 'quotes', label: 'Cotizaciones', description: 'Motor de cotización con cálculo automático', category: 'Operaciones', icon: documentTextOutline },
  { key: 'projects', label: 'Proyectos', description: 'Proyectos con vista Gantt y Kanban', category: 'Operaciones', icon: briefcaseOutline },
  { key: 'work-orders', label: 'Órdenes de Trabajo', description: 'OTs correctivas y preventivas', category: 'Operaciones', icon: constructOutline },
  { key: 'tasks', label: 'Mis Tareas', description: 'Vista móvil para técnicos de campo', category: 'Operaciones', icon: listOutline },

  // Recursos
  { key: 'employees', label: 'Empleados', description: 'Trabajadores y tarifas horarias', category: 'Recursos', icon: peopleOutline },
  { key: 'equipment', label: 'Equipos', description: 'Maquinaria y activos con QR', category: 'Recursos', icon: cubeOutline },
  { key: 'logistics', label: 'Logística', description: 'Traslados, combustible y viáticos', category: 'Recursos', icon: swapHorizontalOutline },
  { key: 'preventive', label: 'Mantenimiento Preventivo', description: 'Planes automáticos programados', category: 'Recursos', icon: calendarOutline },

  // Abastecimiento
  { key: 'inventory', label: 'Inventario', description: 'Repuestos y materiales con stock mínimo', category: 'Abastecimiento', icon: layersOutline },
  { key: 'suppliers', label: 'Proveedores', description: 'Talleres externos y subcontratistas', category: 'Abastecimiento', icon: storefrontOutline },
  { key: 'purchase-orders', label: 'Órdenes de Compra', description: 'OC con vínculo contable a proyectos', category: 'Abastecimiento', icon: cartOutline },

  // Finanzas
  { key: 'finance', label: 'Centro de Costos', description: 'Métricas financieras en cascada', category: 'Finanzas', icon: walletOutline },
  { key: 'reports', label: 'Reportes', description: 'Informes PDF de cierre', category: 'Finanzas', icon: statsChartOutline },
  { key: 'currency', label: 'Conversor BCV', description: 'Multimoneda USD/EUR/VES', category: 'Finanzas', icon: receiptOutline },

  // Sistema
  { key: 'audit', label: 'Auditoría', description: 'Log inmutable de acciones', category: 'Sistema', icon: ribbonOutline },
  { key: 'portal', label: 'Portal del Cliente', description: 'Acceso externo para clientes finales', category: 'Sistema', icon: globeOutline },

  // Add-ons premium
  { key: 'ai', label: 'Inteligencia Artificial', description: 'Dictado de reportes por voz', category: 'Add-ons', icon: micOutline },
  { key: 'push', label: 'Notificaciones Push', description: 'FCM a dispositivos móviles', category: 'Add-ons', icon: notificationsOutline },
];

export const MODULES_BY_CATEGORY: Record<string, ModuleDef[]> = ALL_MODULES.reduce(
  (acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  },
  {} as Record<string, ModuleDef[]>,
);

/** Módulos que vienen habilitados por defecto al crear un Tenant. */
export const DEFAULT_ENABLED_MODULES: ModuleKey[] = [
  'dashboard', 'clients', 'quotes', 'projects', 'work-orders', 'tasks',
  'employees', 'equipment', 'logistics', 'preventive',
  'inventory', 'suppliers', 'purchase-orders',
  'finance', 'reports', 'currency', 'portal',
];

/** Módulos que SIEMPRE están activos (no se pueden deshabilitar). */
export const ALWAYS_ENABLED: ModuleKey[] = ['dashboard'];

/** Verifica si un módulo está habilitado para un Tenant. */
export function isModuleEnabled(tenant: { enabledModules?: string[] } | null | undefined, key: ModuleKey): boolean {
  if (!tenant) return true; // sin Tenant => mostrar todo
  if (ALWAYS_ENABLED.includes(key)) return true;
  if (!tenant.enabledModules || tenant.enabledModules.length === 0) return true;
  return tenant.enabledModules.includes(key);
}
