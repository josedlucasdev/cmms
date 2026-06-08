/**
 * Generador de datos demo para ProMaintenance.
 * Crea un dataset realista para recorrer la app sin backend.
 *
 * Si los datos ya existen en `localStorage` no se sobreescriben.
 */

import type {
  AuditLog,
  BcvRate,
  Client,
  ClosureReport,
  Contact,
  Employee,
  Equipment,
  GlobalSettings,
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
import { storage } from '@/mock/storage';

// =====================================================================
//  Utilidades pseudo-aleatorias (deterministas vía seed)
// =====================================================================
let __seed = 42;
function rand(): number {
  __seed = (__seed * 9301 + 49297) % 233280;
  return __seed / 233280;
}
function resetSeed(s = 42) {
  __seed = s;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function range<T>(n: number, fn: (i: number) => T): T[] {
  return Array.from({ length: n }, (_, i) => fn(i));
}
function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function isoDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (rand() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =====================================================================
//  Catálogos de ejemplo (nombres, modelos, etc.)
// =====================================================================
const COMPANY_NAMES = [
  'Industrias ACME C.A.',
  'Metalúrgica del Caribe S.A.',
  'Servicios Petroleros Andinos',
  'Construcciones Litoral C.A.',
  'Alimentos La Esperanza',
  'Energía Renovable SolarPlus',
  'Logística TransCarga',
  'Clínica San Rafael',
  'Hotel Maremares',
  'Agroindustria El Granero',
];
const INDUSTRIES = [
  'Manufactura',
  'Petróleo y Gas',
  'Construcción',
  'Alimentos',
  'Energía',
  'Logística',
  'Salud',
  'Hotelería',
  'Agroindustria',
];
const CITIES = ['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Maracay', 'Puerto Ordaz'];
const POSITIONS = ['Gerente de Mantenimiento', 'Supervisor', 'Coordinador', 'Jefe de Planta'];
const FIRST_NAMES = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Patricia', 'Pedro', 'Sofía', 'Miguel', 'Laura', 'José', 'Elena', 'Andrés', 'Carmen'];
const LAST_NAMES = ['Pérez', 'Gómez', 'Rodríguez', 'Hernández', 'García', 'Martínez', 'López', 'Sánchez', 'Díaz', 'Torres', 'Ramírez', 'Vargas'];
const EQUIPMENT_MODELS = [
  { name: 'Soldadora Lincoln 350', category: 'Soldadura' },
  { name: 'Cortadora de plasma Hypertherm', category: 'Corte' },
  { name: 'Compresor de aire Atlas Copco GA30', category: 'Neumática' },
  { name: 'Torno CNC Haas ST-10', category: 'Mecanizado' },
  { name: 'Generador eléctrico Cummins C110', category: 'Energía' },
  { name: 'Bomba hidráulica Grundfos CR', category: 'Bombas' },
  { name: 'Montacargas Toyota 8FGCU25', category: 'Logística' },
  { name: 'Caldera Cleaver-Brooks CBLE', category: 'Térmico' },
  { name: 'Soldadora Miller Dimension 652', category: 'Soldadura' },
  { name: 'Fresadora Bridgeport VMC', category: 'Mecanizado' },
];
const MATERIAL_CATEGORIES = [
  { cat: 'Consumibles de Soldadura', unit: 'kg' },
  { cat: 'Discos de Corte', unit: 'und' },
  { cat: 'Lubricantes', unit: 'L' },
  { cat: 'Filtros', unit: 'und' },
  { cat: 'Repuestos Eléctricos', unit: 'und' },
  { cat: 'Repuestos Mecánicos', unit: 'und' },
  { cat: 'Elementos de Sujeción', unit: 'und' },
  { cat: 'Pinturas y Recubrimientos', unit: 'gal' },
];
const SUPPLIER_CATEGORIES = ['Repuestos Industriales', 'Servicios de Soldadura', 'Subcontratos Mecánicos', 'Materiales Eléctricos', 'Lubricantes'];
const HSE_QUESTIONS = [
  { q: '¿Cuenta con todos los EPP necesarios para la tarea (casco, guantes, gafas, botas)?', type: 'boolean' as const, exp: true, sev: 'high' as const, mand: true },
  { q: '¿Tiene careta de soldar en buen estado?', type: 'boolean' as const, exp: true, sev: 'high' as const, mand: true },
  { q: '¿Entorno libre de gases inflamables o materiales combustibles?', type: 'boolean' as const, exp: true, sev: 'high' as const, mand: true },
  { q: '¿Se aplicó el procedimiento LOTO (Lockout/Tagout) al equipo?', type: 'boolean' as const, exp: true, sev: 'high' as const, mand: true },
  { q: '¿Botiquín de primeros auxilios disponible en el área?', type: 'boolean' as const, exp: true, sev: 'medium' as const, mand: true },
  { q: '¿Posee arnés y línea de vida certificada para trabajos en altura?', type: 'boolean' as const, exp: true, sev: 'high' as const, mand: false },
  { q: 'Estado general del área de trabajo', type: 'select' as const, options: ['Óptimo', 'Aceptable', 'Deficiente'], sev: 'medium' as const, mand: true },
];

const AVATAR_COLORS = ['#3A5CFF', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// =====================================================================
//  Generador principal
// =====================================================================
export interface SeedResult {
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
}

export function generateSeed(): SeedResult {
  resetSeed(42);

  // --- Tenants ---
  const tenants: Tenant[] = [
    {
      id: 'T-001', code: 'MIC',
      name: 'Mantenimiento Industrial del Centro C.A.',
      createdAt: isoDaysAgo(420), active: true, plan: 'enterprise',
      email: 'contacto@micc.com.ve',
      phone: '+58 241 123 4567',
      address: 'Av. Principal, Valencia, Carabobo',
      city: 'Valencia',
      country: 'Venezuela',
      industry: 'Manufactura',
      taxId: 'J-12345678-9',
      contactName: 'Ana Martínez',
      contactEmail: 'ana.martinez@micc.com.ve',
      contactPhone: '+58 414 1234567',
      expiresAt: isoDaysAhead(365),
      enabledModules: undefined, // vacío = todos habilitados
      maxUsers: 200,
      maxStorageMb: 51200,
      notes: 'Cliente Enterprise desde 2024. SLA estricto.',
    },
    {
      id: 'T-002', code: 'STO',
      name: 'Servicios Técnicos Oriente S.A.',
      createdAt: isoDaysAgo(180), active: true, plan: 'pro',
      email: 'info@sto.com.ve',
      phone: '+58 281 765 4321',
      address: 'Calle 42, Puerto La Cruz, Anzoátegui',
      city: 'Puerto La Cruz',
      country: 'Venezuela',
      industry: 'Petróleo y Gas',
      taxId: 'J-87654321-0',
      contactName: 'Luis Rodríguez',
      contactEmail: 'luis.rodriguez@sto.com.ve',
      contactPhone: '+58 424 7654321',
      expiresAt: isoDaysAhead(120),
      enabledModules: undefined,
      maxUsers: 50,
      maxStorageMb: 5120,
      notes: 'Plan Pro. Interesados en upgrade a Enterprise.',
    },
  ];

  // --- Global Settings (1 por tenant) ---
  const globalSettings: GlobalSettings[] = tenants.map((t) => ({
    maxUsers: t.plan === 'enterprise' ? 200 : 50,
    maxStorageMb: t.plan === 'enterprise' ? 51200 : 5120,
    aiEnabled: t.plan === 'enterprise',
    advancedLogisticsEnabled: true,
    pushNotificationsEnabled: true,
    allowedCurrencies: ['USD', 'EUR', 'VES'],
    maintenanceWindow: '02:00-04:00',
  }));

  // --- Tenant Settings ---
  const tenantSettings: TenantSettings[] = [
    {
      tenantId: 'T-001',
      timezone: 'America/Caracas',
      defaultCurrency: 'USD',
      taxPercent: 16,
      taxName: 'IVA',
      workOrderPrefix: 'OT',
      projectPrefix: 'PRY',
      quotePrefix: 'COT',
      primaryColor: '#2239F5',
      hseChecklistId: 'HSE-DEFAULT',
      address: 'Av. Principal, Valencia, Carabobo',
      phone: '+58 241 123 4567',
      email: 'contacto@micc.com.ve',
    },
    {
      tenantId: 'T-002',
      timezone: 'America/Caracas',
      defaultCurrency: 'USD',
      taxPercent: 16,
      taxName: 'IVA',
      workOrderPrefix: 'WO',
      projectPrefix: 'PJ',
      quotePrefix: 'QT',
      primaryColor: '#0EA5E9',
      hseChecklistId: 'HSE-DEFAULT',
      address: 'Calle 42, Puerto La Cruz, Anzoátegui',
      phone: '+58 281 765 4321',
      email: 'info@sto.com.ve',
    },
  ];

  // --- Usuarios (5 por tenant: admin, coord, 2 técnicos, 1 cliente) ---
  const users: User[] = [];
  const employees: Employee[] = [];
  for (const t of tenants) {
    users.push({
      id: `U-${t.id}-admin`,
      tenantId: t.id,
      email: 'admin@promaintenance.demo',
      fullName: 'Ana Martínez',
      role: 'tenant_admin',
      active: true,
      avatarColor: pick(AVATAR_COLORS),
    });
    users.push({
      id: `U-${t.id}-coord`,
      tenantId: t.id,
      email: 'coord@promaintenance.demo',
      fullName: 'Luis Rodríguez',
      role: 'coordinator',
      active: true,
      avatarColor: pick(AVATAR_COLORS),
    });
    for (let i = 1; i <= 4; i++) {
      const fn = pick(FIRST_NAMES);
      const ln = pick(LAST_NAMES);
      const fullName = `${fn} ${ln}`;
      const docId = `V-${Math.floor(rand() * 30000000) + 5000000}`;
      users.push({
        id: `U-${t.id}-tec-${i}`,
        tenantId: t.id,
        email: `tecnico${i}@promaintenance.demo`,
        fullName,
        role: 'technician',
        documentId: docId,
        active: true,
        avatarColor: pick(AVATAR_COLORS),
      });
      employees.push({
        id: `EMP-${t.id}-${i}`,
        tenantId: t.id,
        userId: `U-${t.id}-tec-${i}`,
        fullName,
        documentId: docId,
        position: 'Técnico de Mantenimiento',
        email: `tecnico${i}@promaintenance.demo`,
        phone: `+58 414 ${Math.floor(rand() * 9000000) + 1000000}`,
        hourlyRate: 8 + rand() * 8,
        overtimeRate: 12 + rand() * 10,
        active: true,
        avatarColor: pick(AVATAR_COLORS),
        hireDate: isoDaysAgo(Math.floor(rand() * 1000) + 100),
      });
    }
    // Supervisor (también es empleado)
    employees.push({
      id: `EMP-${t.id}-sup`,
      tenantId: t.id,
      userId: `U-${t.id}-coord`,
      fullName: 'Luis Rodríguez',
      documentId: 'V-12345678',
      position: 'Coordinador de Mantenimiento',
      hourlyRate: 18,
      overtimeRate: 25,
      active: true,
      avatarColor: pick(AVATAR_COLORS),
      hireDate: isoDaysAgo(800),
    });
  }
  // Super admin global (no tenant)
  users.push({
    id: 'U-SUPER',
    tenantId: 'T-001',
    email: 'super@promaintenance.demo',
    fullName: 'Root SuperAdmin',
    role: 'super_admin',
    active: true,
    avatarColor: '#000000',
  });

  // --- Clientes (5 por tenant) ---
  const clients: Client[] = [];
  for (const t of tenants) {
    for (let i = 0; i < 5; i++) {
      const name = COMPANY_NAMES[(i + tenants.indexOf(t) * 5) % COMPANY_NAMES.length];
      const contacts: Contact[] = range(2, (j) => ({
        id: `C-${t.id}-${i}-${j}`,
        fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        position: pick(POSITIONS),
        email: `contacto${j}@${name.toLowerCase().split(' ')[0]}.com`,
        phone: `+58 412 ${Math.floor(rand() * 9000000) + 1000000}`,
      }));
      clients.push({
        id: `CLI-${t.id}-${i + 1}`,
        tenantId: t.id,
        name,
        taxId: `J-${Math.floor(rand() * 90000000) + 10000000}-${Math.floor(rand() * 9)}`,
        email: `info@${name.toLowerCase().split(' ')[0]}.com`,
        phone: `+58 ${pick(['241', '212', '261', '281'])} ${Math.floor(rand() * 9000000) + 1000000}`,
        address: `Av. Libertador, ${pick(CITIES)}`,
        city: pick(CITIES),
        country: 'Venezuela',
        industry: pick(INDUSTRIES),
        contacts,
        createdAt: isoDaysAgo(Math.floor(rand() * 300) + 30),
      });
    }
  }

  // --- SLAs (1 por cliente) ---
  const slas: SlaConfig[] = clients.map((c) => ({
    id: `SLA-${c.id}`,
    tenantId: c.tenantId,
    clientId: c.id,
    level: pick(['low', 'medium', 'high'] as const),
    responseTimeHours: pick([2, 4, 8, 24, 48]),
    resolutionTimeHours: pick([24, 48, 72, 168]),
    description: 'SLA contractual estándar',
  }));

  // --- Equipos (3 por cliente) ---
  const equipment: Equipment[] = [];
  for (const c of clients) {
    for (let i = 0; i < 3; i++) {
      const model = EQUIPMENT_MODELS[(clients.indexOf(c) * 3 + i) % EQUIPMENT_MODELS.length];
      equipment.push({
        id: `EQ-${c.id}-${i + 1}`,
        tenantId: c.tenantId,
        name: `${model.name} #${i + 1}`,
        model: model.name,
        serialNumber: `SN-${Math.floor(rand() * 900000) + 100000}`,
        qrCode: `EQ-${c.id}-${i + 1}`,
        category: model.category,
        hourlyRate: 25 + rand() * 50,
        underWarranty: rand() > 0.7,
        warrantyExpiresAt: isoDaysAhead(Math.floor(rand() * 365)),
        usageHours: Math.floor(rand() * 2000),
        status: pick(['available', 'in_use', 'maintenance', 'available', 'available'] as const),
        lastMaintenanceAt: isoDaysAgo(Math.floor(rand() * 90) + 5),
        clientId: c.id,
      });
    }
  }

  // --- Materiales (15 por tenant) ---
  const materials: Material[] = [];
  for (const t of tenants) {
    MATERIAL_CATEGORIES.forEach((cat, idx) => {
      for (let i = 0; i < 2; i++) {
        const id = `MAT-${t.id}-${idx}-${i}`;
        materials.push({
          id,
          tenantId: t.id,
          sku: `SKU-${idx}${i}${Math.floor(rand() * 900) + 100}`,
          name: `${cat.cat} - Variante ${i + 1}`,
          description: `Material de la categoría ${cat.cat}`,
          category: cat.cat,
          stock: Math.floor(rand() * 200),
          minStock: 10 + Math.floor(rand() * 20),
          unit: cat.unit,
          unitCost: 5 + rand() * 95,
          currency: 'USD',
          location: `Almacén ${pick(['A', 'B', 'C'])} - Estante ${Math.floor(rand() * 10) + 1}`,
          barcode: `${Math.floor(rand() * 9000000000000) + 1000000000000}`,
          warrantyDays: 30 + Math.floor(rand() * 180),
        });
      }
    });
  }

  // --- Proveedores (3 por tenant) ---
  const suppliers: Supplier[] = [];
  for (const t of tenants) {
    for (let i = 0; i < 3; i++) {
      suppliers.push({
        id: `SUP-${t.id}-${i + 1}`,
        tenantId: t.id,
        name: `${pick(['Distribuidora', 'Servicios', 'Suministros', 'Industrias'])} ${pick(['Delta', 'Sigma', 'Omega', 'Plus', 'Pro'])} C.A.`,
        taxId: `J-${Math.floor(rand() * 90000000) + 10000000}-${Math.floor(rand() * 9)}`,
        contactName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        email: `ventas@proveedor${i + 1}.com`,
        phone: `+58 ${pick(['241', '212'])} ${Math.floor(rand() * 9000000) + 1000000}`,
        address: 'Zona Industrial',
        category: pick(SUPPLIER_CATEGORIES),
        rating: 3 + rand() * 2,
        active: true,
      });
    }
    // Asignar supplier a los primeros 6 materiales del tenant
    const tenantMats = materials.filter((m) => m.tenantId === t.id);
    const tenantSups = suppliers.filter((s) => s.tenantId === t.id);
    tenantMats.slice(0, 6).forEach((m, idx) => {
      m.supplierId = tenantSups[idx % tenantSups.length]?.id;
    });
  }

  // --- Proyectos (2-3 por cliente) ---
  const projects: Project[] = [];
  for (const c of clients) {
    const numProjects = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < numProjects; i++) {
      projects.push({
        id: `PRY-${c.id}-${i + 1}`,
        tenantId: c.tenantId,
        clientId: c.id,
        name: `Proyecto ${i + 1} - ${c.name.split(' ').slice(0, 2).join(' ')}`,
        code: `PRY-${Math.floor(rand() * 9000) + 1000}`,
        description: `Mantenimiento integral fase ${i + 1}`,
        budget: 10000 + Math.floor(rand() * 90000),
        additionalCost: Math.floor(rand() * 5000),
        currency: 'USD',
        startDate: isoDaysAgo(Math.floor(rand() * 180) + 10),
        endDate: isoDaysAhead(Math.floor(rand() * 90) + 30),
        status: pick(['planning', 'active', 'active', 'active', 'on_hold', 'completed'] as const),
        managerId: `U-${c.tenantId}-coord`,
        progress: Math.floor(rand() * 100),
      });
    }
  }

  // --- Cotizaciones (1-2 por proyecto) ---
  const quotes: Quote[] = [];
  for (const p of projects) {
    const numQuotes = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < numQuotes; i++) {
      const items = range(3 + Math.floor(rand() * 4), (j) => ({
        id: uuid(),
        type: pick(['labor', 'equipment', 'material', 'logistics'] as const),
        description: pick([
          'Mano de obra especializada',
          'Alquiler de equipo',
          'Material consumible',
          'Traslado de cuadrilla',
          'Repuestos',
          'Horas extra',
        ]),
        quantity: 1 + Math.floor(rand() * 20),
        unitPrice: 30 + Math.floor(rand() * 200),
        unit: pick(['h', 'und', 'km', 'gal', 'kg']),
      }));
      const status = pick(['draft', 'sent', 'sent', 'approved', 'rejected', 'expired'] as const);
      quotes.push({
        id: `Q-${p.id}-${i + 1}`,
        tenantId: p.tenantId,
        clientId: p.clientId,
        number: `COT-${Math.floor(rand() * 9000) + 1000}`,
        status,
        items,
        taxPercent: 16,
        currency: 'USD',
        validUntil: isoDaysAhead(30),
        notes: 'Cotización generada automáticamente',
        createdAt: isoDaysAgo(Math.floor(rand() * 90)),
        createdBy: `U-${p.tenantId}-coord`,
        approvedAt: status === 'approved' ? isoDaysAgo(Math.floor(rand() * 30)) : undefined,
      });
    }
  }

  // --- Órdenes de Trabajo (1-3 por proyecto) ---
  const workOrders: WorkOrder[] = [];
  for (const p of projects) {
    const numWOs = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < numWOs; i++) {
      const status = pick(['pending', 'in_progress', 'in_progress', 'completed', 'stopped'] as const);
      workOrders.push({
        id: `WO-${p.id}-${i + 1}`,
        tenantId: p.tenantId,
        projectId: p.id,
        number: `OT-${Math.floor(rand() * 9000) + 1000}`,
        title: pick([
          'Reparación de bomba hidráulica',
          'Mantenimiento preventivo trimestral',
          'Cambio de rodamientos',
          'Inspección de caldera',
          'Calibración de instrumentación',
          'Reemplazo de motor eléctrico',
        ]),
        description: 'Trabajo programado según plan anual',
        type: pick(['corrective', 'preventive'] as const),
        status,
        priority: pick(['low', 'medium', 'high', 'critical'] as const),
        fixedCost: Math.floor(rand() * 500),
        logisticsCost: 50 + Math.floor(rand() * 300),
        additionalCost: Math.floor(rand() * 200),
        currency: 'USD',
        scheduledDate: isoDaysAhead(Math.floor(rand() * 30)),
        completedAt: status === 'completed' ? isoDaysAgo(Math.floor(rand() * 30)) : undefined,
        createdAt: isoDaysAgo(Math.floor(rand() * 60) + 5),
        createdBy: `U-${p.tenantId}-coord`,
        assignedUserIds: range(2, (j) => `U-${p.tenantId}-tec-${(j % 4) + 1}`),
        slaId: `SLA-${p.clientId}`,
        clientId: p.clientId,
      });
    }
  }

  // --- Tareas (2-5 por OT) ---
  const tasks: Task[] = [];
  for (const wo of workOrders) {
    const numTasks = 2 + Math.floor(rand() * 4);
    for (let i = 0; i < numTasks; i++) {
      const status = pick(['pending', 'in_progress', 'completed', 'stopped'] as const);
      tasks.push({
        id: `TSK-${wo.id}-${i + 1}`,
        tenantId: wo.tenantId,
        workOrderId: wo.id,
        number: `TSK-${i + 1}`,
        description: pick([
          'Diagnóstico de falla',
          'Desmontaje de componentes',
          'Reemplazo de piezas',
          'Lubricación y limpieza',
          'Pruebas funcionales',
          'Cierre y entrega',
        ]),
        status,
        additionalCost: Math.floor(rand() * 100),
        estimatedHours: 1 + Math.floor(rand() * 8),
        assignedUserIds: [pick(wo.assignedUserIds)],
        equipmentIds: [],
        startedAt: status !== 'pending' ? isoDaysAgo(Math.floor(rand() * 20)) : undefined,
        completedAt: status === 'completed' ? isoDaysAgo(Math.floor(rand() * 10)) : undefined,
      });
    }
  }

  // --- Traslados (1 por OT) ---
  const trips: Trip[] = workOrders.slice(0, Math.floor(workOrders.length * 0.6)).map((wo) => ({
    id: `TRIP-${wo.id}`,
    tenantId: wo.tenantId,
    workOrderId: wo.id,
    vehiclePlate: `${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}-${100 + Math.floor(rand() * 900)}`,
    driverId: `EMP-${wo.tenantId}-sup`,
    startKm: 10000 + Math.floor(rand() * 90000),
    endKm: 10000 + Math.floor(rand() * 90000) + 50,
    fuelCost: 20 + Math.floor(rand() * 60),
    tollCost: Math.floor(rand() * 20),
    mealCost: 10 + Math.floor(rand() * 30),
    totalDistanceKm: 50 + Math.floor(rand() * 200),
    startedAt: isoDaysAgo(Math.floor(rand() * 20)),
    endedAt: isoDaysAgo(Math.floor(rand() * 19)),
  }));

  // --- Planes Preventivos (1 por equipo) ---
  const preventivePlans: PreventivePlan[] = equipment.slice(0, 15).map((eq, idx) => ({
    id: `PP-${eq.id}`,
    tenantId: eq.tenantId,
    equipmentId: eq.id,
    name: `Plan Preventivo - ${eq.name}`,
    description: 'Lubricación, inspección y calibración',
    frequencyType: pick(['time', 'usage'] as const),
    frequencyValue: pick([30, 60, 90, 100, 200]),
    frequencyUnit: pick(['days', 'hours'] as const),
    nextTriggerAt: isoDaysAhead(Math.floor(rand() * 30) + 5),
    lastTriggeredAt: isoDaysAgo(Math.floor(rand() * 60) + 5),
    active: idx % 5 !== 0,
    workOrderTemplate: {
      title: `Mantenimiento Preventivo - ${eq.name}`,
      description: 'Ejecutar checklist de mantenimiento preventivo',
      priority: 'medium',
      estimatedHours: 2,
    },
  }));

  // --- Órdenes de Compra (3 por tenant) ---
  const purchaseOrders: PurchaseOrder[] = [];
  for (const t of tenants) {
    const tenantMats = materials.filter((m) => m.tenantId === t.id);
    const tenantSups = suppliers.filter((s) => s.tenantId === t.id);
    const tenantWOs = workOrders.filter((w) => w.tenantId === t.id);
    for (let i = 0; i < 3; i++) {
      const lines = range(2 + Math.floor(rand() * 3), (j) => {
        const m = pick(tenantMats);
        return {
          id: uuid(),
          materialId: m.id,
          description: m.name,
          quantity: 1 + Math.floor(rand() * 10),
          unitPrice: m.unitCost,
          unit: m.unit,
        };
      });
      const status = pick(['draft', 'sent', 'received'] as const);
      purchaseOrders.push({
        id: `PO-${t.id}-${i + 1}`,
        tenantId: t.id,
        number: `OC-${Math.floor(rand() * 9000) + 1000}`,
        supplierId: pick(tenantSups).id,
        projectId: pick(tenantWOs).projectId,
        status,
        lines,
        taxPercent: 16,
        currency: 'USD',
        totalCost: lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) * 1.16,
        expectedDelivery: isoDaysAhead(Math.floor(rand() * 14) + 3),
        createdAt: isoDaysAgo(Math.floor(rand() * 30)),
        createdBy: `U-${t.id}-coord`,
      });
    }
  }

  // --- Movimientos de Inventario (algunos) ---
  const movements: InventoryMovement[] = [];
  for (let i = 0; i < 30; i++) {
    const m = pick(materials);
    movements.push({
      id: `MOV-${i + 1}`,
      tenantId: m.tenantId,
      materialId: m.id,
      type: pick(['in', 'out', 'adjust'] as const),
      quantity: 1 + Math.floor(rand() * 10),
      reason: pick(['Compra', 'Consumo OT', 'Ajuste inventario', 'Devolución']),
      createdAt: isoDaysAgo(Math.floor(rand() * 60)),
      createdBy: `U-${m.tenantId}-coord`,
    });
  }

  // --- Tasas BCV (últimos 30 días) ---
  const bcvRates: BcvRate[] = range(30, (i) => {
    const date = isoDaysAgo(29 - i).substring(0, 10);
    const base = 36.5 + i * 0.05;
    return {
      date,
      usdToVes: parseFloat(base.toFixed(4)),
      eurToVes: parseFloat((base * 1.08).toFixed(4)),
      source: 'BCV',
    };
  });

  // --- Audit logs (ejemplos) ---
  const auditLogs: AuditLog[] = range(20, (i) => ({
    id: `LOG-${i + 1}`,
    tenantId: tenants[i % tenants.length].id,
    userId: `U-${tenants[i % tenants.length].id}-coord`,
    userName: 'Luis Rodríguez',
    action: pick(['Crear', 'Actualizar', 'Eliminar', 'Aprobar', 'Cerrar']),
    entity: pick(['Orden de Trabajo', 'Cotización', 'Cliente', 'Proyecto', 'Tarea']),
    entityId: workOrders[i % workOrders.length]?.id ?? 'N/A',
    timestamp: isoDaysAgo(Math.floor(rand() * 30)),
  }));

  // --- Closure Reports (algunos completados) ---
  const closureReports: ClosureReport[] = workOrders
    .filter((w) => w.status === 'completed')
    .slice(0, 10)
    .map((w) => ({
      id: `CR-${w.id}`,
      workOrderId: w.id,
      generatedAt: w.completedAt ?? isoDaysAgo(5),
      totalCost: 500 + Math.floor(rand() * 5000),
      currency: w.currency,
      hseLogIds: [],
      photoIds: [],
      notes: 'Trabajo completado según especificación',
    }));

  return {
    tenants,
    users,
    employees,
    clients,
    slas,
    quotes,
    projects,
    workOrders,
    tasks,
    equipment,
    materials,
    suppliers,
    purchaseOrders,
    preventivePlans,
    trips,
    movements,
    bcvRates,
    auditLogs,
    tenantSettings,
    globalSettings,
    closureReports,
  };
}

// =====================================================================
//  Bootstrap: solo siembra si no hay datos en `localStorage`
// =====================================================================
/** Genera un código de Tenant a partir del nombre (primeras letras de cada palabra). */
function autoTenantCode(name: string): string {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'TEN';
  return initials;
}

function migrateSeed(seed: SeedResult): boolean {
  let mutated = false;
  // Asegurar que todos los Tenants tengan un `code` (para datos pre-existentes)
  for (const t of seed.tenants) {
    if (!t.code) {
      // Generar uno único basado en el nombre
      let candidate = autoTenantCode(t.name);
      let suffix = 1;
      const existing = new Set(seed.tenants.map((x) => x.code).filter(Boolean));
      while (existing.has(candidate)) {
        candidate = `${autoTenantCode(t.name)}${suffix++}`.slice(0, 4);
      }
      t.code = candidate;
      mutated = true;
    }
  }
  return mutated;
}

export function bootstrapData(): SeedResult {
  const existing = storage.get<SeedResult | null>('seed', null);
  if (existing && existing.tenants?.length) {
    if (migrateSeed(existing)) {
      storage.set('seed', existing);
    }
    return existing;
  }
  const seed = generateSeed();
  storage.set('seed', seed);
  return seed;
}

export function resetSeedData(): SeedResult {
  const seed = generateSeed();
  storage.set('seed', seed);
  return seed;
}
