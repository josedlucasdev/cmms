/**
 * Catálogo de permisos del sistema CMMS.
 * Cada permiso es una acción atómica. Los roles tienen un set
 * de permisos por defecto; los usuarios pueden recibir extras
 * vía `customPermissions`.
 */

export const PERMISSIONS = {
  // ---- Sistema ----
  'system.tenants.view': 'Ver Tenants (consola del sistema)',
  'system.tenants.manage': 'Crear / editar Tenants',
  'system.tenants.delete': 'Eliminar Tenants',

  // ---- Usuarios (dentro del Tenant) ----
  'users.view': 'Ver usuarios del Tenant',
  'users.manage': 'Crear / editar usuarios del Tenant',
  'users.delete': 'Eliminar usuarios del Tenant',

  // ---- Clientes ----
  'clients.view': 'Ver clientes',
  'clients.manage': 'Crear / editar clientes',
  'clients.delete': 'Eliminar clientes',

  // ---- Cotizaciones ----
  'quotes.view': 'Ver cotizaciones',
  'quotes.manage': 'Crear / editar cotizaciones',
  'quotes.approve': 'Aprobar / rechazar cotizaciones',
  'quotes.send': 'Enviar cotizaciones (PDF / WhatsApp)',

  // ---- Proyectos ----
  'projects.view': 'Ver proyectos',
  'projects.manage': 'Crear / editar proyectos',
  'projects.delete': 'Eliminar proyectos',

  // ---- Órdenes de Trabajo ----
  'work-orders.view': 'Ver OTs',
  'work-orders.manage': 'Crear / editar OTs',
  'work-orders.close': 'Cerrar OTs y generar informe PDF',

  // ---- Tareas (técnico) ----
  'tasks.view': 'Ver mis tareas',
  'tasks.start': 'Iniciar / pausar cronómetro de tareas',
  'tasks.evidence': 'Subir evidencia fotográfica',
  'tasks.consume': 'Registrar consumo de materiales',

  // ---- Empleados ----
  'employees.view': 'Ver empleados',
  'employees.manage': 'Crear / editar empleados',
  'employees.delete': 'Eliminar empleados',

  // ---- Equipos ----
  'equipment.view': 'Ver equipos',
  'equipment.manage': 'Crear / editar equipos (con QR)',

  // ---- Logística ----
  'logistics.view': 'Ver traslados',
  'logistics.manage': 'Registrar traslados (km, combustible, viáticos)',

  // ---- Preventivo ----
  'preventive.view': 'Ver planes preventivos',
  'preventive.manage': 'Crear / editar planes preventivos',

  // ---- Inventario ----
  'inventory.view': 'Ver materiales',
  'inventory.manage': 'Crear / editar materiales',
  'inventory.movements': 'Registrar movimientos de stock',

  // ---- Proveedores ----
  'suppliers.view': 'Ver proveedores',
  'suppliers.manage': 'Crear / editar proveedores',

  // ---- Órdenes de Compra ----
  'purchase-orders.view': 'Ver OCs',
  'purchase-orders.manage': 'Crear / editar OCs',

  // ---- Finanzas ----
  'finance.view': 'Ver Centro de Costos',
  'finance.manage': 'Editar datos financieros',

  // ---- Reportes ----
  'reports.view': 'Ver / descargar reportes PDF',
  'reports.audit': 'Ver log de auditoría',
  'audit.view': 'Ver log de auditoría',

  // ---- Moneda ----
  'currency.view': 'Ver conversor BCV',
  'currency.edit': 'Editar tasas manualmente',

  // ---- Configuración ----
  'settings.view': 'Ver configuración del Tenant',
  'settings.edit': 'Editar configuración del Tenant',

  // ---- Portal Cliente ----
  'portal.view': 'Acceder al portal del cliente',
  'portal.approve': 'Aprobar cotizaciones desde el portal',

  // ---- Add-ons premium ----
  'ai.use': 'Usar dictado de IA',
  'push.send': 'Enviar notificaciones push',

  // ---- Auditoría ----
  'audit.export': 'Exportar log de auditoría',
} as const;

export type Permission = keyof typeof PERMISSIONS;

/** Permisos por defecto asignados a cada rol. */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: Object.keys(PERMISSIONS) as Permission[],

  tenant_admin: [
    'users.view', 'users.manage', 'users.delete',
    'clients.view', 'clients.manage', 'clients.delete',
    'quotes.view', 'quotes.manage', 'quotes.approve', 'quotes.send',
    'projects.view', 'projects.manage', 'projects.delete',
    'work-orders.view', 'work-orders.manage', 'work-orders.close',
    'tasks.view', 'tasks.start', 'tasks.evidence', 'tasks.consume',
    'employees.view', 'employees.manage', 'employees.delete',
    'equipment.view', 'equipment.manage',
    'logistics.view', 'logistics.manage',
    'preventive.view', 'preventive.manage',
    'inventory.view', 'inventory.manage', 'inventory.movements',
    'suppliers.view', 'suppliers.manage',
    'purchase-orders.view', 'purchase-orders.manage',
    'finance.view', 'finance.manage',
    'reports.view', 'reports.audit', 'audit.view', 'audit.export',
    'currency.view', 'currency.edit',
    'settings.view', 'settings.edit',
    'portal.view',
    'ai.use', 'push.send',
  ],

  coordinator: [
    'users.view',
    'clients.view', 'clients.manage',
    'quotes.view', 'quotes.manage', 'quotes.send',
    'projects.view', 'projects.manage',
    'work-orders.view', 'work-orders.manage', 'work-orders.close',
    'tasks.view',
    'employees.view', 'employees.manage',
    'equipment.view', 'equipment.manage',
    'logistics.view', 'logistics.manage',
    'preventive.view', 'preventive.manage',
    'inventory.view', 'inventory.manage', 'inventory.movements',
    'suppliers.view', 'suppliers.manage',
    'purchase-orders.view', 'purchase-orders.manage',
    'finance.view',
    'reports.view',
    'currency.view',
    'settings.view',
    'portal.view',
    'push.send',
  ],

  technician: [
    'tasks.view', 'tasks.start', 'tasks.evidence', 'tasks.consume',
    'work-orders.view',
    'equipment.view',
    'inventory.view', 'inventory.movements',
    'portal.view',
  ],

  client: [
    'portal.view', 'portal.approve',
  ],
};

/** Permisos exclusivos del Tenant Admin que NO se delegan al Coordinador. */
export const TENANT_ADMIN_EXCLUSIVE: Permission[] = [
  'users.manage', 'users.delete',
  'clients.delete', 'projects.delete', 'employees.delete',
  'settings.edit', 'finance.manage', 'audit.view', 'audit.export',
];

/** Etiqueta legible de cada rol. */
export const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Administrador',
  tenant_admin: 'Administrador del Tenant',
  coordinator: 'Coordinador',
  technician: 'Técnico de Campo',
  client: 'Cliente',
};
