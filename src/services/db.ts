/**
 * Capa de servicios mock que simulan la API REST del backend Laravel.
 * Todos los métodos retornan `Promise<T>` con un pequeño delay para
 * emular latencia de red. Los datos se persisten en `localStorage`.
 */

import { storage } from '@/mock/storage';
import { bootstrapData, resetSeedData } from '@/mock/seed';
import type {
  AuditLog,
  BcvRate,
  Client,
  ClosureReport,
  Employee,
  Equipment,
  GlobalSettings,
  ID,
  InventoryMovement,
  Material,
  PreventivePlan,
  Project,
  PurchaseOrder,
  Quote,
  SlaConfig,
  Supplier,
  Task,
  Tenant,
  TenantSettings,
  Trip,
  User,
  WorkOrder,
} from '@/types/domain';

// =====================================================================
//  Simulación de latencia
// =====================================================================
const LATENCY_MIN = 120;
const LATENCY_MAX = 320;
function delay(): Promise<void> {
  const ms = LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN);
  return new Promise((r) => setTimeout(r, ms));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// =====================================================================
//  Helpers de código de Tenant (prefijo inmutable único)
// =====================================================================
/** Devuelve el código (prefijo) del Tenant a partir de su id. */
export function tenantCodeOf(tenantId: ID | null | undefined): string {
  if (!tenantId) return 'GEN';
  const t = getTable('tenants').find((x) => x.id === tenantId);
  return t?.code ?? 'GEN';
}

/** Genera un código con formato {TENANT_CODE}-{TYPE_PREFIX}-{RANDOM}. */
export function makeTenantCode(
  tenantId: ID | null | undefined,
  typePrefix: string,
  length = 4,
): string {
  const tc = tenantCodeOf(tenantId);
  const num = Math.floor(Math.random() * Math.pow(10, length)) + Math.pow(10, length - 1);
  return `${tc}-${typePrefix}-${num}`;
}

/** Genera un sufijo alfanumérico corto (para QR de equipos). */
export function makeTenantQrSuffix(tenantId: ID | null | undefined, category = ''): string {
  const cat = (category || '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${cat}${ts}${rand}`;
}

/** Valida formato y unicidad de un código de Tenant. */
export function validateTenantCode(code: string, excludeId?: ID): { ok: boolean; reason?: string } {
  const c = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,4}$/.test(c)) {
    return { ok: false, reason: 'Debe ser 2-4 caracteres alfanuméricos en mayúsculas' };
  }
  const taken = getTable('tenants').find((t) => t.code === c && t.id !== excludeId);
  if (taken) {
    return { ok: false, reason: `El código "${c}" ya está en uso por otro Tenant` };
  }
  return { ok: true };
}

// =====================================================================
//  Acceso a la "base de datos" en localStorage
// =====================================================================
type Tables = {
  tenants: Tenant[];
  users: User[];
  employees: Employee[];
  clients: Client[];
  slas: SlaConfig[];
  quotes: Quote[];
  projects: Project[];
  workOrders: WorkOrder[];
  tasks: Task[];
  equipment: Equipment[];
  materials: Material[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  preventivePlans: PreventivePlan[];
  trips: Trip[];
  movements: InventoryMovement[];
  bcvRates: BcvRate[];
  auditLogs: AuditLog[];
  tenantSettings: TenantSettings[];
  globalSettings: GlobalSettings[];
  closureReports: ClosureReport[];
};

type TableKey = keyof Tables;

function getTable<K extends TableKey>(key: K): Tables[K] {
  const seed = bootstrapData();
  return seed[key] as Tables[K];
}

function persistTable<K extends TableKey>(key: K, rows: Tables[K]): void {
  const seed = bootstrapData();
  (seed as unknown as Record<string, unknown>)[key] = rows;
  storage.set('seed', seed);
}

function filterByTenant<T extends { tenantId?: ID }>(rows: T[], tenantId: ID | null): T[] {
  if (!tenantId) return rows;
  return rows.filter((r) => !('tenantId' in r) || r.tenantId === tenantId);
}

// =====================================================================
//  Auth
// =====================================================================
export const authService = {
  async login(email: string, role: User['role'], tenantId: ID): Promise<User | null> {
    await delay();
    const users = getTable('users');
    let user = users.find(
      (u) => u.email === email && u.tenantId === tenantId && u.role === role,
    );
    if (!user) {
      // Fallback: si no existe, usar el primer usuario del rol
      user = users.find((u) => u.tenantId === tenantId && u.role === role);
    }
    if (user) {
      storage.set('session', { userId: user.id, tenantId, loggedAt: new Date().toISOString() });
    }
    return user ?? null;
  },
  async logout(): Promise<void> {
    await delay();
    storage.remove('session');
  },
  async getSession(): Promise<{ userId: ID; tenantId: ID; loggedAt: string } | null> {
    return storage.get('session', null);
  },
};

// =====================================================================
//  Tenants
// =====================================================================
export const tenantsService = {
  async list(): Promise<Tenant[]> {
    await delay();
    return getTable('tenants');
  },
  async get(id: ID): Promise<Tenant | null> {
    await delay();
    return getTable('tenants').find((t) => t.id === id) ?? null;
  },
  async getByCode(code: string): Promise<Tenant | null> {
    await delay();
    const c = code.trim().toUpperCase();
    return getTable('tenants').find((t) => t.code === c) ?? null;
  },
  /**
   * Crea un nuevo Tenant. El `code` es OBLIGATORIO, ÚNICO e INMUTABLE
   * (no puede modificarse posteriormente). Se valida antes de persistir.
   */
  async create(data: { code: string; name: string; plan?: Tenant['plan'] }): Promise<Tenant> {
    await delay();
    const v = validateTenantCode(data.code);
    if (!v.ok) throw new Error(v.reason);
    const rows = getTable('tenants');
    const newRow: Tenant = {
      id: uid('T'),
      code: data.code.trim().toUpperCase(),
      name: data.name,
      plan: data.plan ?? 'free',
      active: true,
      createdAt: new Date().toISOString(),
    };
    persistTable('tenants', [newRow, ...rows]);
    return newRow;
  },
  /**
   * Actualiza un Tenant. El `code` está BLOQUEADO: aunque venga en `data`,
   * se ignora silenciosamente. El resto de campos sí se pueden modificar.
   */
  async update(id: ID, data: Partial<Omit<Tenant, 'code' | 'id'>>): Promise<Tenant | null> {
    await delay();
    const rows = getTable('tenants');
    const idx = rows.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    // code es inmutable — se ignora cualquier intento de cambio
    rows[idx] = { ...rows[idx], ...data, code: rows[idx].code };
    persistTable('tenants', rows);
    return rows[idx];
  },
};

// =====================================================================
//  Users
// =====================================================================
export const usersService = {
  async list(tenantId: ID | null = null): Promise<User[]> {
    await delay();
    return filterByTenant(getTable('users'), tenantId);
  },
  async listByTenant(tenantId: ID): Promise<User[]> {
    await delay();
    return getTable('users').filter((u) => u.tenantId === tenantId);
  },
  async get(id: ID): Promise<User | null> {
    await delay();
    return getTable('users').find((u) => u.id === id) ?? null;
  },
  async create(data: Partial<User>): Promise<User> {
    await delay();
    if (!data.email) throw new Error('El email es obligatorio');
    if (!data.fullName) throw new Error('El nombre completo es obligatorio');
    if (!data.role) throw new Error('El rol es obligatorio');
    if (!data.tenantId) throw new Error('El tenant es obligatorio');
    const rows = getTable('users');
    // Validar email único dentro del Tenant
    const duplicate = rows.find((u) => u.email.toLowerCase() === data.email!.toLowerCase() && u.tenantId === data.tenantId);
    if (duplicate) throw new Error('Ya existe un usuario con ese email en este Tenant');
    const newRow: User = {
      id: uid('U'),
      tenantId: data.tenantId,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      role: data.role,
      documentId: data.documentId,
      phone: data.phone,
      active: data.active ?? true,
      avatarColor: data.avatarColor,
      createdAt: new Date().toISOString(),
      customPermissions: data.customPermissions,
    };
    persistTable('users', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<Omit<User, 'id' | 'tenantId' | 'createdAt'>>): Promise<User | null> {
    await delay();
    const rows = getTable('users');
    const idx = rows.findIndex((u) => u.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data, email: data.email?.trim().toLowerCase() ?? rows[idx].email };
    persistTable('users', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'users',
      getTable('users').filter((u) => u.id !== id),
    );
  },
  async countByTenant(tenantId: ID): Promise<number> {
    await delay();
    return getTable('users').filter((u) => u.tenantId === tenantId).length;
  },
};

// =====================================================================
//  Employees
// =====================================================================
export const employeesService = {
  async list(tenantId: ID | null = null): Promise<Employee[]> {
    await delay();
    return filterByTenant(getTable('employees'), tenantId);
  },
  async get(id: ID): Promise<Employee | null> {
    await delay();
    return getTable('employees').find((e) => e.id === id) ?? null;
  },
  async update(id: ID, data: Partial<Employee>): Promise<Employee | null> {
    await delay();
    const rows = getTable('employees');
    const idx = rows.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('employees', rows);
    return rows[idx];
  },
  async create(data: Partial<Employee>): Promise<Employee> {
    await delay();
    const rows = getTable('employees');
    const newRow: Employee = {
      id: uid('EMP'),
      tenantId: data.tenantId ?? 'T-001',
      userId: data.userId,
      fullName: data.fullName ?? 'Nuevo empleado',
      documentId: data.documentId ?? '',
      position: data.position ?? 'Técnico de Mantenimiento',
      email: data.email,
      phone: data.phone,
      hourlyRate: data.hourlyRate ?? 8,
      overtimeRate: data.overtimeRate ?? (data.hourlyRate ?? 8) * 1.5,
      active: data.active ?? true,
      avatarColor: data.avatarColor,
      hireDate: data.hireDate ?? new Date().toISOString(),
    };
    persistTable('employees', [newRow, ...rows]);
    return newRow;
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'employees',
      getTable('employees').filter((e) => e.id !== id),
    );
  },
};

// =====================================================================
//  Clients
// =====================================================================
export const clientsService = {
  async list(tenantId: ID | null = null): Promise<Client[]> {
    await delay();
    return filterByTenant(getTable('clients'), tenantId);
  },
  async get(id: ID): Promise<Client | null> {
    await delay();
    return getTable('clients').find((c) => c.id === id) ?? null;
  },
  async create(data: Partial<Client>): Promise<Client> {
    await delay();
    const rows = getTable('clients');
    const newRow: Client = {
      id: uid('CLI'),
      tenantId: data.tenantId ?? 'T-001',
      name: data.name ?? 'Nuevo cliente',
      taxId: data.taxId ?? '',
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country ?? 'Venezuela',
      industry: data.industry,
      contacts: data.contacts ?? [],
      createdAt: new Date().toISOString(),
    };
    persistTable('clients', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<Client>): Promise<Client | null> {
    await delay();
    const rows = getTable('clients');
    const idx = rows.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('clients', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'clients',
      getTable('clients').filter((c) => c.id !== id),
    );
  },
};

// =====================================================================
//  SLAs
// =====================================================================
export const slasService = {
  async list(tenantId: ID | null = null): Promise<SlaConfig[]> {
    await delay();
    return filterByTenant(getTable('slas'), tenantId);
  },
  async getByClient(clientId: ID): Promise<SlaConfig | null> {
    await delay();
    return getTable('slas').find((s) => s.clientId === clientId) ?? null;
  },
};

// =====================================================================
//  Quotes
// =====================================================================
export const quotesService = {
  async list(tenantId: ID | null = null): Promise<Quote[]> {
    await delay();
    return filterByTenant(getTable('quotes'), tenantId);
  },
  async get(id: ID): Promise<Quote | null> {
    await delay();
    return getTable('quotes').find((q) => q.id === id) ?? null;
  },
  async create(data: Partial<Quote>): Promise<Quote> {
    await delay();
    const rows = getTable('quotes');
    const tenantId = data.tenantId ?? 'T-001';
    const newRow: Quote = {
      id: uid('Q'),
      tenantId,
      clientId: data.clientId ?? '',
      number: data.number ?? makeTenantCode(tenantId, 'COT'),
      status: data.status ?? 'draft',
      items: data.items ?? [],
      taxPercent: data.taxPercent ?? 16,
      currency: data.currency ?? 'USD',
      validUntil: data.validUntil ?? new Date(Date.now() + 30 * 86400000).toISOString(),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy ?? '',
    };
    persistTable('quotes', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<Quote>): Promise<Quote | null> {
    await delay();
    const rows = getTable('quotes');
    const idx = rows.findIndex((q) => q.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('quotes', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'quotes',
      getTable('quotes').filter((q) => q.id !== id),
    );
  },
  async reject(id: ID, reason?: string): Promise<Quote | null> {
    await delay();
    const rows = getTable('quotes');
    const idx = rows.findIndex((q) => q.id === id);
    if (idx < 0) return null;
    if (rows[idx].status === 'approved') return null; // no se puede rechazar una aprobada
    rows[idx] = {
      ...rows[idx],
      status: 'rejected',
      notes: reason ? `${rows[idx].notes ?? ''}\n[Rechazada: ${reason}]` : rows[idx].notes,
    };
    persistTable('quotes', rows);
    return rows[idx];
  },
  /**
   * Aprueba una cotización y crea atómicamente:
   *  - Un Proyecto (status: planning, con el total como presupuesto)
   *  - Una OT inicial (status: pending, tipo: corrective, prioridad: medium)
   * Si ya estaba aprobada, retorna los IDs existentes sin duplicar.
   */
  async approve(
    id: ID,
    options?: { approvedBy?: ID },
  ): Promise<{ quote: Quote; project: Project; workOrder: WorkOrder } | null> {
    await delay();
    const quotes = getTable('quotes');
    const projects = getTable('projects');
    const workOrders = getTable('workOrders');
    const quoteIdx = quotes.findIndex((q) => q.id === id);
    if (quoteIdx < 0) return null;
    const q = quotes[quoteIdx];
    if (q.status === 'rejected') return null;

    // Si ya estaba aprobada, devolvemos los hijos ya creados
    if (q.status === 'approved') {
      const existingProject = projects.find((p) => p.quoteId === q.id);
      if (existingProject) {
        const existingWO = workOrders.find((w) => w.projectId === existingProject.id);
        if (existingWO) {
          return { quote: q, project: existingProject, workOrder: existingWO };
        }
      }
    }

    // 1) Marcar la cotización como aprobada
    const approvedAt = new Date().toISOString();
    const approvedQuote: Quote = {
      ...q,
      status: 'approved',
      approvedAt,
      approvedBy: options?.approvedBy ?? q.createdBy,
    };
    quotes[quoteIdx] = approvedQuote;

    // 2) Calcular total de la cotización
    const subtotal = q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const total = subtotal * (1 + q.taxPercent / 100);

    // 3) Determinar el nombre del proyecto a partir del primer ítem de MO o de la cotización
    const firstLabor = q.items.find((i) => i.type === 'labor');
    const projectName = firstLabor
      ? `Proyecto: ${firstLabor.description}`
      : q.notes
        ? `Proyecto: ${q.notes.split('\n')[0]?.slice(0, 60)}`
        : `Proyecto: ${q.number}`;

    // 4) Crear Proyecto
    const projectId = uid('PRY');
    const newProject: Project = {
      id: projectId,
      tenantId: q.tenantId,
      clientId: q.clientId,
      name: projectName,
      code: makeTenantCode(q.tenantId, 'PRY'),
      description: q.notes,
      budget: total,
      additionalCost: 0,
      currency: q.currency,
      startDate: approvedAt,
      status: 'planning',
      managerId: q.createdBy,
      progress: 0,
      quoteId: q.id,
    };
    projects.unshift(newProject);

    // 5) Crear OT inicial
    const workOrderId = uid('WO');
    const newWorkOrder: WorkOrder = {
      id: workOrderId,
      tenantId: q.tenantId,
      projectId,
      clientId: q.clientId,
      number: makeTenantCode(q.tenantId, 'OT'),
      title: `OT inicial — ${projectName}`,
      description: q.notes,
      type: 'corrective',
      status: 'pending',
      priority: 'medium',
      fixedCost: 0,
      logisticsCost: 0,
      additionalCost: 0,
      currency: q.currency,
      createdAt: approvedAt,
      createdBy: options?.approvedBy ?? q.createdBy,
      assignedUserIds: [],
    };
    workOrders.unshift(newWorkOrder);

    // 6) Marcar initialWorkOrderId en el proyecto
    newProject.initialWorkOrderId = workOrderId;

    // Persistir todo
    persistTable('quotes', quotes);
    persistTable('projects', projects);
    persistTable('workOrders', workOrders);

    return { quote: approvedQuote, project: newProject, workOrder: newWorkOrder };
  },
};

// =====================================================================
//  Projects
// =====================================================================
export const projectsService = {
  async list(tenantId: ID | null = null): Promise<Project[]> {
    await delay();
    return filterByTenant(getTable('projects'), tenantId);
  },
  async get(id: ID): Promise<Project | null> {
    await delay();
    return getTable('projects').find((p) => p.id === id) ?? null;
  },
  async create(data: Partial<Project>): Promise<Project> {
    await delay();
    const rows = getTable('projects');
    const tenantId = data.tenantId ?? 'T-001';
    const newRow: Project = {
      id: uid('PRY'),
      tenantId,
      clientId: data.clientId ?? '',
      name: data.name ?? 'Nuevo proyecto',
      code: data.code ?? makeTenantCode(tenantId, 'PRY'),
      description: data.description,
      budget: data.budget ?? 0,
      additionalCost: data.additionalCost ?? 0,
      currency: data.currency ?? 'USD',
      startDate: data.startDate ?? new Date().toISOString(),
      endDate: data.endDate,
      status: data.status ?? 'planning',
      managerId: data.managerId,
      progress: data.progress ?? 0,
    };
    persistTable('projects', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<Project>): Promise<Project | null> {
    await delay();
    const rows = getTable('projects');
    const idx = rows.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('projects', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'projects',
      getTable('projects').filter((p) => p.id !== id),
    );
  },
};

// =====================================================================
//  Work Orders
// =====================================================================
export const workOrdersService = {
  async list(tenantId: ID | null = null): Promise<WorkOrder[]> {
    await delay();
    return filterByTenant(getTable('workOrders'), tenantId);
  },
  async get(id: ID): Promise<WorkOrder | null> {
    await delay();
    return getTable('workOrders').find((w) => w.id === id) ?? null;
  },
  async listByProject(projectId: ID): Promise<WorkOrder[]> {
    await delay();
    return getTable('workOrders').filter((w) => w.projectId === projectId);
  },
  async create(data: Partial<WorkOrder>): Promise<WorkOrder> {
    await delay();
    const rows = getTable('workOrders');
    const tenantId = data.tenantId ?? 'T-001';
    const newRow: WorkOrder = {
      id: uid('WO'),
      tenantId,
      projectId: data.projectId ?? '',
      number: data.number ?? makeTenantCode(tenantId, 'OT'),
      title: data.title ?? 'Nueva OT',
      description: data.description,
      type: data.type ?? 'corrective',
      status: data.status ?? 'pending',
      priority: data.priority ?? 'medium',
      fixedCost: data.fixedCost ?? 0,
      logisticsCost: data.logisticsCost ?? 0,
      additionalCost: data.additionalCost ?? 0,
      currency: data.currency ?? 'USD',
      scheduledDate: data.scheduledDate,
      completedAt: data.completedAt,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy ?? '',
      assignedUserIds: data.assignedUserIds ?? [],
      slaId: data.slaId,
      clientId: data.clientId ?? '',
    };
    persistTable('workOrders', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<WorkOrder>): Promise<WorkOrder | null> {
    await delay();
    const rows = getTable('workOrders');
    const idx = rows.findIndex((w) => w.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('workOrders', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'workOrders',
      getTable('workOrders').filter((w) => w.id !== id),
    );
  },
};

// =====================================================================
//  Tasks
// =====================================================================
export const tasksService = {
  async list(tenantId: ID | null = null): Promise<Task[]> {
    await delay();
    return filterByTenant(getTable('tasks'), tenantId);
  },
  async get(id: ID): Promise<Task | null> {
    await delay();
    return getTable('tasks').find((t) => t.id === id) ?? null;
  },
  async listByWorkOrder(workOrderId: ID): Promise<Task[]> {
    await delay();
    return getTable('tasks').filter((t) => t.workOrderId === workOrderId);
  },
  async listByUser(userId: ID): Promise<Task[]> {
    await delay();
    return getTable('tasks').filter((t) => t.assignedUserIds.includes(userId));
  },
  async create(data: Partial<Task>): Promise<Task> {
    await delay();
    const rows = getTable('tasks');
    const woRows = getTable('workOrders');
    const wo = data.workOrderId ? woRows.find((w) => w.id === data.workOrderId) : null;
    const tenantId = data.tenantId ?? wo?.tenantId ?? 'T-001';
    const taskCount = rows.filter((t) => t.workOrderId === data.workOrderId).length;
    const newRow: Task = {
      id: uid('TSK'),
      tenantId,
      workOrderId: data.workOrderId ?? '',
      number: data.number ?? makeTenantCode(tenantId, 'TSK'),
      description: data.description ?? 'Nueva tarea',
      status: data.status ?? 'pending',
      additionalCost: data.additionalCost ?? 0,
      estimatedHours: data.estimatedHours ?? 1,
      assignedUserIds: data.assignedUserIds ?? [],
      equipmentIds: data.equipmentIds ?? [],
      startedAt: data.startedAt,
      completedAt: data.completedAt,
    };
    persistTable('tasks', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<Task>): Promise<Task | null> {
    await delay();
    const rows = getTable('tasks');
    const idx = rows.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('tasks', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'tasks',
      getTable('tasks').filter((t) => t.id !== id),
    );
  },
};

// =====================================================================
//  Equipment
// =====================================================================
export const equipmentService = {
  async list(tenantId: ID | null = null): Promise<Equipment[]> {
    await delay();
    return filterByTenant(getTable('equipment'), tenantId);
  },
  async get(id: ID): Promise<Equipment | null> {
    await delay();
    return getTable('equipment').find((e) => e.id === id) ?? null;
  },
  async listByClient(clientId: ID): Promise<Equipment[]> {
    await delay();
    return getTable('equipment').filter((e) => e.clientId === clientId);
  },
  async update(id: ID, data: Partial<Equipment>): Promise<Equipment | null> {
    await delay();
    const rows = getTable('equipment');
    const idx = rows.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('equipment', rows);
    return rows[idx];
  },
  async create(data: Partial<Equipment>): Promise<Equipment> {
    await delay();
    const rows = getTable('equipment');
    const tenantId = data.tenantId ?? 'T-001';
    const tc = tenantCodeOf(tenantId);
    const qrSuffix = makeTenantQrSuffix(tenantId, data.category);
    const newRow: Equipment = {
      id: uid('EQ'),
      tenantId,
      name: data.name ?? 'Nuevo equipo',
      model: data.model,
      serialNumber: data.serialNumber,
      qrCode: data.qrCode ?? `${tc}-EQ-${qrSuffix}`,
      category: data.category ?? 'General',
      hourlyRate: data.hourlyRate ?? 25,
      underWarranty: data.underWarranty ?? false,
      warrantyExpiresAt: data.warrantyExpiresAt,
      usageHours: data.usageHours ?? 0,
      status: data.status ?? 'available',
      lastMaintenanceAt: data.lastMaintenanceAt,
      clientId: data.clientId,
    };
    persistTable('equipment', [newRow, ...rows]);
    return newRow;
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'equipment',
      getTable('equipment').filter((e) => e.id !== id),
    );
  },
};

// =====================================================================
//  Materials / Inventory
// =====================================================================
export const inventoryService = {
  async list(tenantId: ID | null = null): Promise<Material[]> {
    await delay();
    return filterByTenant(getTable('materials'), tenantId);
  },
  async get(id: ID): Promise<Material | null> {
    await delay();
    return getTable('materials').find((m) => m.id === id) ?? null;
  },
  async create(data: Partial<Material>): Promise<Material> {
    await delay();
    const rows = getTable('materials');
    const tenantId = data.tenantId ?? 'T-001';
    const newRow: Material = {
      id: uid('MAT'),
      tenantId,
      sku: data.sku ?? makeTenantCode(tenantId, 'SKU'),
      name: data.name ?? 'Nuevo material',
      description: data.description,
      category: data.category ?? 'General',
      stock: data.stock ?? 0,
      minStock: data.minStock ?? 0,
      unit: data.unit ?? 'und',
      unitCost: data.unitCost ?? 0,
      currency: data.currency ?? 'USD',
      location: data.location,
      barcode: data.barcode,
      warrantyDays: data.warrantyDays,
      supplierId: data.supplierId,
    };
    persistTable('materials', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<Material>): Promise<Material | null> {
    await delay();
    const rows = getTable('materials');
    const idx = rows.findIndex((m) => m.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('materials', rows);
    return rows[idx];
  },
  async remove(id: ID): Promise<void> {
    await delay();
    persistTable(
      'materials',
      getTable('materials').filter((m) => m.id !== id),
    );
  },
  async listMovements(tenantId: ID | null = null): Promise<InventoryMovement[]> {
    await delay();
    return filterByTenant(getTable('movements'), tenantId);
  },
};

// =====================================================================
//  Suppliers
// =====================================================================
export const suppliersService = {
  async list(tenantId: ID | null = null): Promise<Supplier[]> {
    await delay();
    return filterByTenant(getTable('suppliers'), tenantId);
  },
  async get(id: ID): Promise<Supplier | null> {
    await delay();
    return getTable('suppliers').find((s) => s.id === id) ?? null;
  },
  async create(data: Partial<Supplier>): Promise<Supplier> {
    await delay();
    const rows = getTable('suppliers');
    const newRow: Supplier = {
      id: uid('SUP'),
      tenantId: data.tenantId ?? 'T-001',
      name: data.name ?? 'Nuevo proveedor',
      taxId: data.taxId ?? '',
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      category: data.category ?? 'General',
      rating: data.rating ?? 4,
      active: data.active ?? true,
    };
    persistTable('suppliers', [newRow, ...rows]);
    return newRow;
  },
};

// =====================================================================
//  Purchase Orders
// =====================================================================
export const purchaseOrdersService = {
  async list(tenantId: ID | null = null): Promise<PurchaseOrder[]> {
    await delay();
    return filterByTenant(getTable('purchaseOrders'), tenantId);
  },
  async get(id: ID): Promise<PurchaseOrder | null> {
    await delay();
    return getTable('purchaseOrders').find((p) => p.id === id) ?? null;
  },
  async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    await delay();
    const rows = getTable('purchaseOrders');
    const tenantId = data.tenantId ?? 'T-001';
    const newRow: PurchaseOrder = {
      id: uid('PO'),
      tenantId,
      number: data.number ?? makeTenantCode(tenantId, 'OC'),
      supplierId: data.supplierId ?? '',
      projectId: data.projectId,
      status: data.status ?? 'draft',
      lines: data.lines ?? [],
      taxPercent: data.taxPercent ?? 16,
      currency: data.currency ?? 'USD',
      totalCost: data.totalCost ?? 0,
      expectedDelivery: data.expectedDelivery,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy ?? '',
    };
    persistTable('purchaseOrders', [newRow, ...rows]);
    return newRow;
  },
  async update(id: ID, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    await delay();
    const rows = getTable('purchaseOrders');
    const idx = rows.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('purchaseOrders', rows);
    return rows[idx];
  },
};

// =====================================================================
//  Preventive Plans
// =====================================================================
export const preventiveService = {
  async list(tenantId: ID | null = null): Promise<PreventivePlan[]> {
    await delay();
    return filterByTenant(getTable('preventivePlans'), tenantId);
  },
  async get(id: ID): Promise<PreventivePlan | null> {
    await delay();
    return getTable('preventivePlans').find((p) => p.id === id) ?? null;
  },
};

// =====================================================================
//  Trips
// =====================================================================
export const tripsService = {
  async list(tenantId: ID | null = null): Promise<Trip[]> {
    await delay();
    return filterByTenant(getTable('trips'), tenantId);
  },
  async listByWorkOrder(workOrderId: ID): Promise<Trip[]> {
    await delay();
    return getTable('trips').filter((t) => t.workOrderId === workOrderId);
  },
  async create(data: Partial<Trip>): Promise<Trip> {
    await delay();
    const rows = getTable('trips');
    const newRow: Trip = {
      id: uid('TRIP'),
      tenantId: data.tenantId ?? 'T-001',
      workOrderId: data.workOrderId ?? '',
      vehiclePlate: data.vehiclePlate ?? '',
      driverId: data.driverId ?? '',
      startKm: data.startKm ?? 0,
      endKm: data.endKm,
      fuelCost: data.fuelCost ?? 0,
      tollCost: data.tollCost ?? 0,
      mealCost: data.mealCost ?? 0,
      totalDistanceKm: data.totalDistanceKm,
      startedAt: data.startedAt ?? new Date().toISOString(),
      endedAt: data.endedAt,
      notes: data.notes,
    };
    persistTable('trips', [newRow, ...rows]);
    return newRow;
  },
};

// =====================================================================
//  BCV Rates
// =====================================================================
export const bcvService = {
  async list(): Promise<BcvRate[]> {
    await delay();
    return getTable('bcvRates').sort((a, b) => b.date.localeCompare(a.date));
  },
  async latest(): Promise<BcvRate | null> {
    await delay();
    const rates = getTable('bcvRates');
    return rates[rates.length - 1] ?? null;
  },
  async upsert(rate: BcvRate): Promise<BcvRate> {
    await delay();
    const rows = getTable('bcvRates');
    const idx = rows.findIndex((r) => r.date === rate.date);
    if (idx >= 0) rows[idx] = rate;
    else rows.push(rate);
    persistTable('bcvRates', rows);
    return rate;
  },
};

// =====================================================================
//  Audit
// =====================================================================
export const auditService = {
  async list(tenantId: ID | null = null): Promise<AuditLog[]> {
    await delay();
    return filterByTenant(getTable('auditLogs'), tenantId).sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp),
    );
  },
  async log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    await delay();
    const rows = getTable('auditLogs');
    const newLog: AuditLog = {
      ...entry,
      id: uid('LOG'),
      timestamp: new Date().toISOString(),
    };
    persistTable('auditLogs', [newLog, ...rows]);
    return newLog;
  },
};

// =====================================================================
//  Settings (Tenant + Global)
// =====================================================================
export const settingsService = {
  async getTenant(tenantId: ID): Promise<TenantSettings | null> {
    await delay();
    return getTable('tenantSettings').find((s) => s.tenantId === tenantId) ?? null;
  },
  async updateTenant(tenantId: ID, data: Partial<TenantSettings>): Promise<TenantSettings | null> {
    await delay();
    const rows = getTable('tenantSettings');
    const idx = rows.findIndex((s) => s.tenantId === tenantId);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...data };
    persistTable('tenantSettings', rows);
    return rows[idx];
  },
  async getGlobal(tenantId: ID): Promise<GlobalSettings | null> {
    await delay();
    return getTable('globalSettings').find((g, i) => getTable('tenants')[i]?.id === tenantId) ?? null;
  },
};

// =====================================================================
//  Reset (utilidad)
// =====================================================================
export const demoService = {
  async reset(): Promise<void> {
    await delay();
    resetSeedData();
  },
  async clear(): Promise<void> {
    await delay();
    storage.clearAll();
    bootstrapData();
  },
};
