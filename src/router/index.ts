import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import type { Role } from '@/types/domain';
import { routerGuards } from './guards';

// =====================================================================
//  Definición de rutas
//  Cada ruta puede declarar en `meta`:
//    - requiresAuth: requiere sesión iniciada
//    - roles[]: roles permitidos
//    - module: clave del módulo (ver constants/modules.ts)
//    - systemMode: sólo accesible para super_admin
//    - selfOnly: el :id de la ruta debe coincidir con el usuario actual
// =====================================================================
const routes: RouteRecordRaw[] = [
  // ---------------- AUTH ----------------
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { title: 'Iniciar sesión' },
  },
  {
    path: '/portal/login',
    name: 'portal-login',
    component: () => import('@/views/portal/ClientPortalLogin.vue'),
    meta: { title: 'Portal del Cliente' },
  },

  // ---------------- DENEGACIONES ----------------
  {
    path: '/tenant-suspended',
    name: 'tenant-suspended',
    component: () => import('@/views/TenantSuspendedPage.vue'),
    meta: { title: 'Tenant suspendido' },
  },
  {
    path: '/module-denied',
    name: 'module-denied',
    component: () => import('@/views/ModuleDeniedPage.vue'),
    meta: { title: 'Módulo no disponible' },
  },

  // ---------------- ADMIN (sidebar) ----------------
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'tenant_admin', 'coordinator', 'technician'] as Role[] },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/DashboardPage.vue'), meta: { title: 'Panel de Control', module: 'dashboard' } },

      { path: 'clients', name: 'clients', component: () => import('@/views/clients/ClientListPage.vue'), meta: { title: 'Clientes', module: 'clients' } },
      { path: 'clients/new', name: 'client-new', component: () => import('@/views/clients/ClientFormPage.vue'), meta: { title: 'Nuevo Cliente', module: 'clients', permission: 'clients.manage' } },
      { path: 'clients/:id', name: 'client-detail', component: () => import('@/views/clients/ClientDetailPage.vue'), meta: { title: 'Detalle Cliente', module: 'clients' } },
      { path: 'clients/:id/edit', name: 'client-edit', component: () => import('@/views/clients/ClientFormPage.vue'), meta: { title: 'Editar Cliente', module: 'clients', permission: 'clients.manage' } },

      { path: 'quotes', name: 'quotes', component: () => import('@/views/quotes/QuoteListPage.vue'), meta: { title: 'Cotizaciones', module: 'quotes' } },
      { path: 'quotes/new', name: 'quote-new', component: () => import('@/views/quotes/QuoteEditorPage.vue'), meta: { title: 'Nueva Cotización', module: 'quotes', permission: 'quotes.manage' } },
      { path: 'quotes/:id', name: 'quote-detail', component: () => import('@/views/quotes/QuoteDetailPage.vue'), meta: { title: 'Detalle Cotización', module: 'quotes' } },

      { path: 'projects', name: 'projects', component: () => import('@/views/projects/ProjectListPage.vue'), meta: { title: 'Proyectos', module: 'projects' } },
      { path: 'projects/gantt', name: 'project-gantt', component: () => import('@/views/projects/ProjectGanttPage.vue'), meta: { title: 'Proyectos · Gantt', module: 'projects' } },
      { path: 'projects/kanban', name: 'project-kanban', component: () => import('@/views/projects/ProjectKanbanPage.vue'), meta: { title: 'Proyectos · Kanban', module: 'projects' } },
      { path: 'projects/new', name: 'project-new', component: () => import('@/views/projects/ProjectFormPage.vue'), meta: { title: 'Nuevo Proyecto', module: 'projects', permission: 'projects.manage' } },
      { path: 'projects/:id', name: 'project-detail', component: () => import('@/views/projects/ProjectDetailPage.vue'), meta: { title: 'Detalle Proyecto', module: 'projects' } },
      { path: 'projects/:id/edit', name: 'project-edit', component: () => import('@/views/projects/ProjectFormPage.vue'), meta: { title: 'Editar Proyecto', module: 'projects', permission: 'projects.manage' } },

      { path: 'work-orders', name: 'work-orders', component: () => import('@/views/work-orders/WorkOrderListPage.vue'), meta: { title: 'Órdenes de Trabajo', module: 'work-orders' } },
      { path: 'work-orders/new', name: 'work-order-new', component: () => import('@/views/work-orders/WorkOrderFormPage.vue'), meta: { title: 'Nueva OT', module: 'work-orders', permission: 'work-orders.manage' } },
      { path: 'work-orders/:id', name: 'work-order-detail', component: () => import('@/views/work-orders/WorkOrderDetailPage.vue'), meta: { title: 'Detalle OT', module: 'work-orders' } },

      { path: 'resources/employees', name: 'employees', component: () => import('@/views/resources/EmployeeListPage.vue'), meta: { title: 'Empleados', module: 'employees' } },
      { path: 'resources/employees/new', name: 'employee-new', component: () => import('@/views/resources/EmployeeFormPage.vue'), meta: { title: 'Nuevo Empleado', module: 'employees', permission: 'employees.manage' } },
      { path: 'resources/employees/:id', name: 'employee-detail', component: () => import('@/views/resources/EmployeeDetailPage.vue'), meta: { title: 'Detalle Empleado', module: 'employees' } },
      { path: 'resources/employees/:id/edit', name: 'employee-edit', component: () => import('@/views/resources/EmployeeFormPage.vue'), meta: { title: 'Editar Empleado', module: 'employees', permission: 'employees.manage' } },
      { path: 'resources/equipment', name: 'equipment', component: () => import('@/views/resources/EquipmentListPage.vue'), meta: { title: 'Equipos', module: 'equipment' } },
      { path: 'resources/equipment/new', name: 'equipment-new', component: () => import('@/views/resources/EquipmentFormPage.vue'), meta: { title: 'Nuevo Equipo', module: 'equipment', permission: 'equipment.manage' } },
      { path: 'resources/equipment/:id', name: 'equipment-detail', component: () => import('@/views/resources/EquipmentDetailPage.vue'), meta: { title: 'Detalle Equipo', module: 'equipment' } },
      { path: 'resources/equipment/:id/edit', name: 'equipment-edit', component: () => import('@/views/resources/EquipmentFormPage.vue'), meta: { title: 'Editar Equipo', module: 'equipment', permission: 'equipment.manage' } },

      { path: 'logistics/trips', name: 'trips', component: () => import('@/views/logistics/TripFormPage.vue'), meta: { title: 'Logística y Traslados', module: 'logistics' } },

      { path: 'preventive', name: 'preventive', component: () => import('@/views/preventive/PreventivePlanListPage.vue'), meta: { title: 'Mantenimiento Preventivo', module: 'preventive' } },
      { path: 'preventive/calendar', name: 'preventive-calendar', component: () => import('@/views/preventive/PreventiveCalendarPage.vue'), meta: { title: 'Calendario Preventivo', module: 'preventive' } },
      { path: 'preventive/plans/:id', name: 'preventive-plan-detail', component: () => import('@/views/preventive/PreventivePlanDetailPage.vue'), meta: { title: 'Detalle Plan Preventivo', module: 'preventive' } },

      { path: 'inventory', name: 'inventory', component: () => import('@/views/inventory/MaterialListPage.vue'), meta: { title: 'Inventario', module: 'inventory' } },
      { path: 'inventory/:id', name: 'material-detail', component: () => import('@/views/inventory/MaterialDetailPage.vue'), meta: { title: 'Detalle Material', module: 'inventory' } },

      { path: 'suppliers', name: 'suppliers', component: () => import('@/views/suppliers/SupplierListPage.vue'), meta: { title: 'Proveedores', module: 'suppliers' } },
      { path: 'suppliers/:id', name: 'supplier-detail', component: () => import('@/views/suppliers/SupplierDetailPage.vue'), meta: { title: 'Detalle Proveedor', module: 'suppliers' } },

      { path: 'purchase-orders', name: 'purchase-orders', component: () => import('@/views/purchase-orders/PurchaseOrderListPage.vue'), meta: { title: 'Órdenes de Compra', module: 'purchase-orders' } },
      { path: 'purchase-orders/new', name: 'purchase-order-new', component: () => import('@/views/purchase-orders/PurchaseOrderFormPage.vue'), meta: { title: 'Nueva OC', module: 'purchase-orders', permission: 'purchase-orders.manage' } },
      { path: 'purchase-orders/:id', name: 'purchase-order-detail', component: () => import('@/views/purchase-orders/PurchaseOrderDetailPage.vue'), meta: { title: 'Detalle OC', module: 'purchase-orders' } },

      { path: 'finance', name: 'finance', component: () => import('@/views/finance/CostCenterPage.vue'), meta: { title: 'Centro de Costos', module: 'finance', permission: 'finance.view' } },
      { path: 'reports', name: 'reports', component: () => import('@/views/reports/ReportListPage.vue'), meta: { title: 'Reportes', module: 'reports' } },
      { path: 'audit', name: 'audit', component: () => import('@/views/audit/AuditLogPage.vue'), meta: { title: 'Auditoría', module: 'audit', permission: 'audit.view', roles: ['tenant_admin', 'super_admin'] as Role[] } },

      { path: 'settings', name: 'settings', component: () => import('@/views/settings/TenantSettingsPage.vue'), meta: { title: 'Configuración', module: 'settings', permission: 'settings.view' } },
      { path: 'settings/currency', name: 'settings-currency', component: () => import('@/views/settings/CurrencyBcvPage.vue'), meta: { title: 'Conversor BCV', module: 'currency' } },
      { path: 'settings/global', name: 'settings-global', component: () => import('@/views/settings/GlobalSettingsPage.vue'), meta: { title: 'Configuración Global', systemMode: true, roles: ['super_admin'] as Role[] } },

      // ---- Gestión de Usuarios (Tenant Admin y Super Admin) ----
      { path: 'users', name: 'users', component: () => import('@/views/users/UserListPage.vue'), meta: { title: 'Usuarios', roles: ['tenant_admin', 'super_admin'] as Role[] } },
      { path: 'users/new', name: 'user-new', component: () => import('@/views/users/UserFormPage.vue'), meta: { title: 'Nuevo Usuario', roles: ['tenant_admin', 'super_admin'] as Role[], permission: 'users.manage' } },
      { path: 'users/:id', name: 'user-detail', component: () => import('@/views/users/UserDetailPage.vue'), meta: { title: 'Detalle Usuario', roles: ['tenant_admin', 'super_admin'] as Role[] } },
      { path: 'users/:id/edit', name: 'user-edit', component: () => import('@/views/users/UserFormPage.vue'), meta: { title: 'Editar Usuario', roles: ['tenant_admin', 'super_admin'] as Role[], permission: 'users.manage' } },
    ],
  },

  // ---------------- SISTEMA (Super Admin) ----------------
  {
    path: '/system',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      roles: ['super_admin'] as Role[],
      systemMode: true,
    },
    children: [
      { path: '', redirect: '/system/tenants' },
      { path: 'tenants', name: 'system-tenants', component: () => import('@/views/system/TenantListPage.vue'), meta: { title: 'Empresas (Tenants)', permission: 'system.tenants.view' } },
      { path: 'tenants/new', name: 'system-tenant-new', component: () => import('@/views/system/TenantFormPage.vue'), meta: { title: 'Nueva Empresa', permission: 'system.tenants.manage' } },
      { path: 'tenants/:id', name: 'system-tenant-detail', component: () => import('@/views/system/TenantDetailPage.vue'), meta: { title: 'Detalle Empresa', permission: 'system.tenants.view' } },
      { path: 'tenants/:id/edit', name: 'system-tenant-edit', component: () => import('@/views/system/TenantFormPage.vue'), meta: { title: 'Editar Empresa', permission: 'system.tenants.manage' } },
    ],
  },

  // ---------------- MÓVIL (técnico) ----------------
  {
    path: '/tasks',
    component: () => import('@/layouts/MobileLayout.vue'),
    meta: { requiresAuth: true, roles: ['technician', 'coordinator', 'tenant_admin'] as Role[], module: 'tasks' },
    children: [
      { path: '', name: 'my-tasks', component: () => import('@/views/tasks/MyTasksPage.vue'), meta: { title: 'Mis Tareas' } },
      {
        path: ':workOrderId/:taskId',
        name: 'task-tracking',
        component: () => import('@/views/tasks/TaskTrackingPage.vue'),
        meta: { title: 'Tarea' },
      },
    ],
  },
  {
    path: '/mobile',
    component: () => import('@/layouts/MobileLayout.vue'),
    meta: { requiresAuth: true, roles: ['technician'] as Role[], module: 'tasks' },
    children: [
      { path: 'schedule', name: 'mobile-schedule', component: () => import('@/views/tasks/SchedulePage.vue'), meta: { title: 'Agenda' } },
      { path: 'scan', name: 'mobile-scan', component: () => import('@/views/tasks/QrScanPage.vue'), meta: { title: 'Escanear QR' } },
      { path: 'profile', name: 'mobile-profile', component: () => import('@/views/tasks/ProfilePage.vue'), meta: { title: 'Perfil' } },
    ],
  },

  // ---------------- PORTAL DEL CLIENTE ----------------
  {
    path: '/portal',
    component: () => import('@/layouts/ClientPortalLayout.vue'),
    meta: { requiresAuth: true, roles: ['client'] as Role[], module: 'portal' },
    children: [
      { path: '', name: 'portal-dashboard', component: () => import('@/views/portal/ClientDashboardPage.vue'), meta: { title: 'Mi Portal' } },
      { path: 'projects/:id', name: 'portal-project', component: () => import('@/views/portal/ClientProjectPage.vue'), meta: { title: 'Mi Proyecto' } },
      { path: 'quotes', name: 'portal-quotes', component: () => import('@/views/portal/ClientQuotesPage.vue'), meta: { title: 'Mis Cotizaciones' } },
    ],
  },

  // ---------------- 404 ----------------
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: 'No encontrado' },
  },
];

// =====================================================================
//  Router
// =====================================================================
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// =====================================================================
//  Pipeline de Guards (ver ./guards.ts)
// =====================================================================
router.beforeEach(routerGuards);

router.afterEach((to) => {
  const base = 'ProMaintenance · CMMS';
  const title = (to.meta.title as string) ?? '';
  document.title = title ? `${title} · ${base}` : base;
});

export default router;
