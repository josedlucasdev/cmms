/**
 * Tipos del dominio CMMS "ProMaintenance"
 * Todas las entidades tienen `tenantId` para soportar multi-tenancy.
 */

export type ID = string;
export type ISODate = string;

export type Currency = 'USD' | 'EUR' | 'VES';

export type Role =
  | 'super_admin'
  | 'tenant_admin'
  | 'coordinator'
  | 'technician'
  | 'client';

export type WorkOrderStatus = 'pending' | 'in_progress' | 'stopped' | 'completed';
export type WorkOrderType = 'corrective' | 'preventive';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type SlaLevel = 'low' | 'medium' | 'high';
export type FrequencyType = 'time' | 'usage';
export type FrequencyUnit = 'days' | 'weeks' | 'months' | 'hours';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
export type PurchaseOrderStatus = 'draft' | 'sent' | 'received' | 'cancelled';
export type MovementType = 'in' | 'out' | 'adjust';

// ============================================================
// Tenants y Usuarios
// ============================================================
export interface Tenant {
  id: ID;
  /** Código único global del Tenant. Inmutable. Se usa como prefijo en TODOS
   * los códigos generados (OT, COT, PRY, EQ, OC, SKU, etc.). */
  code: string;
  name: string;
  logoUrl?: string;
  createdAt: ISODate;
  active: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  // ---- Datos de contacto y fiscales ----
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  taxId?: string;
  // ---- Contacto principal (representante) ----
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  // ---- Suscripción / Plan ----
  expiresAt?: ISODate;
  notes?: string;
  // ---- Permisos de módulos (Super Admin lo configura) ----
  /** Lista de módulos habilitados. Vacío = todos habilitados. */
  enabledModules?: string[];
  // ---- Límites ----
  maxUsers?: number;
  maxStorageMb?: number;
}

export interface User {
  id: ID;
  tenantId: ID;
  email: string;
  fullName: string;
  role: Role;
  documentId?: string;
  phone?: string;
  active: boolean;
  avatarColor?: string;
  createdAt?: ISODate;
  lastLoginAt?: ISODate;
  /** Permisos extra otorgados al usuario (se suman a los del rol) */
  customPermissions?: string[];
}

export interface TenantSettings {
  tenantId: ID;
  timezone: string;
  defaultCurrency: Currency;
  taxPercent: number;
  taxName: string;
  workOrderPrefix: string;
  projectPrefix: string;
  quotePrefix: string;
  primaryColor: string;
  logoDataUrl?: string;
  hseChecklistId: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface GlobalSettings {
  maxUsers: number;
  maxStorageMb: number;
  aiEnabled: boolean;
  advancedLogisticsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  allowedCurrencies: Currency[];
  maintenanceWindow: string;
}

// ============================================================
// Clientes y Cotizaciones
// ============================================================
export interface Contact {
  id: ID;
  fullName: string;
  position?: string;
  email?: string;
  phone?: string;
}

export interface Client {
  id: ID;
  tenantId: ID;
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  contacts: Contact[];
  createdAt: ISODate;
}

export interface SlaConfig {
  id: ID;
  tenantId: ID;
  clientId: ID;
  level: SlaLevel;
  responseTimeHours: number;
  resolutionTimeHours: number;
  description?: string;
}

export type QuoteLineType = 'labor' | 'equipment' | 'material' | 'logistics';

export interface QuoteLineItem {
  id: ID;
  type: QuoteLineType;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export interface Quote {
  id: ID;
  tenantId: ID;
  clientId: ID;
  number: string;
  status: QuoteStatus;
  items: QuoteLineItem[];
  taxPercent: number;
  currency: Currency;
  validUntil: ISODate;
  notes?: string;
  createdAt: ISODate;
  createdBy: ID;
  approvedAt?: ISODate;
  approvedBy?: ID;
}

// ============================================================
// Proyectos
// ============================================================
export interface Project {
  id: ID;
  tenantId: ID;
  clientId: ID;
  name: string;
  code: string;
  description?: string;
  budget: number;
  additionalCost: number;
  currency: Currency;
  startDate: ISODate;
  endDate?: ISODate;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  managerId?: ID;
  progress: number; // 0-100
  /** ID de la cotización que originó este proyecto (si aplica) */
  quoteId?: ID;
  /** ID de la OT inicial generada a partir de la cotización */
  initialWorkOrderId?: ID;
}

// ============================================================
// Órdenes de Trabajo
// ============================================================
export interface WorkOrder {
  id: ID;
  tenantId: ID;
  projectId: ID;
  number: string;
  title: string;
  description?: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: Priority;
  fixedCost: number;
  logisticsCost: number;
  additionalCost: number;
  currency: Currency;
  scheduledDate?: ISODate;
  completedAt?: ISODate;
  createdAt: ISODate;
  createdBy: ID;
  assignedUserIds: ID[];
  slaId?: ID;
  clientId: ID;
}

export interface Task {
  id: ID;
  tenantId: ID;
  workOrderId: ID;
  number: string;
  description: string;
  status: WorkOrderStatus;
  additionalCost: number;
  estimatedHours: number;
  assignedUserIds: ID[];
  equipmentIds: ID[];
  startedAt?: ISODate;
  completedAt?: ISODate;
}

export interface TimeLogUser {
  id: ID;
  taskId: ID;
  userId: ID;
  startedAt: ISODate;
  endedAt?: ISODate;
  hours: number;
  hourlyRateSnapshot: number;
}

export interface TimeLogEquipment {
  id: ID;
  taskId: ID;
  equipmentId: ID;
  startedAt: ISODate;
  endedAt?: ISODate;
  hours: number;
  hourlyRateSnapshot: number;
}

export interface MaterialConsumption {
  id: ID;
  taskId: ID;
  materialId: ID;
  quantity: number;
  unitCostSnapshot: number;
  consumedAt: ISODate;
}

export interface EvidencePhoto {
  id: ID;
  taskId: ID;
  stage: 'before' | 'after' | 'other';
  dataUrl: string;
  caption?: string;
  capturedAt: ISODate;
}

export interface ClosureReport {
  id: ID;
  workOrderId: ID;
  generatedAt: ISODate;
  totalCost: number;
  currency: Currency;
  hseLogIds: ID[];
  photoIds: ID[];
  signatureDataUrl?: string;
  notes?: string;
}

// ============================================================
// Recursos
// ============================================================
export interface Employee {
  id: ID;
  tenantId: ID;
  userId?: ID;
  fullName: string;
  documentId: string;
  position: string;
  email?: string;
  phone?: string;
  hourlyRate: number;
  overtimeRate: number;
  active: boolean;
  avatarColor?: string;
  hireDate: ISODate;
}

export interface Equipment {
  id: ID;
  tenantId: ID;
  name: string;
  model?: string;
  serialNumber?: string;
  qrCode: string;
  category: string;
  hourlyRate: number;
  underWarranty: boolean;
  warrantyExpiresAt?: ISODate;
  usageHours: number;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  lastMaintenanceAt?: ISODate;
  clientId?: ID;
}

export interface Trip {
  id: ID;
  tenantId: ID;
  workOrderId: ID;
  vehiclePlate: string;
  driverId: ID;
  startKm: number;
  endKm?: number;
  fuelCost: number;
  tollCost: number;
  mealCost: number;
  totalDistanceKm?: number;
  startedAt: ISODate;
  endedAt?: ISODate;
  notes?: string;
}

// ============================================================
// Mantenimiento Preventivo
// ============================================================
export interface PreventivePlan {
  id: ID;
  tenantId: ID;
  equipmentId: ID;
  name: string;
  description?: string;
  frequencyType: FrequencyType;
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  nextTriggerAt: ISODate;
  lastTriggeredAt?: ISODate;
  active: boolean;
  workOrderTemplate: {
    title: string;
    description?: string;
    priority: Priority;
    estimatedHours: number;
  };
}

// ============================================================
// Inventario
// ============================================================
export interface Material {
  id: ID;
  tenantId: ID;
  sku: string;
  name: string;
  description?: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  unitCost: number;
  currency: Currency;
  location?: string;
  barcode?: string;
  warrantyDays?: number;
  supplierId?: ID;
}

export interface InventoryMovement {
  id: ID;
  tenantId: ID;
  materialId: ID;
  type: MovementType;
  quantity: number;
  reason: string;
  relatedWorkOrderId?: ID;
  relatedPurchaseOrderId?: ID;
  createdAt: ISODate;
  createdBy: ID;
}

// ============================================================
// Proveedores y Órdenes de Compra
// ============================================================
export interface Supplier {
  id: ID;
  tenantId: ID;
  name: string;
  taxId: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  rating: number; // 0-5
  active: boolean;
}

export interface PurchaseOrderLine {
  id: ID;
  materialId: ID;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export interface PurchaseOrder {
  id: ID;
  tenantId: ID;
  number: string;
  supplierId: ID;
  projectId?: ID;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  taxPercent: number;
  currency: Currency;
  totalCost: number;
  expectedDelivery?: ISODate;
  notes?: string;
  createdAt: ISODate;
  createdBy: ID;
}

// ============================================================
// Moneda BCV
// ============================================================
export interface BcvRate {
  date: ISODate;
  usdToVes: number;
  eurToVes: number;
  source: 'BCV' | 'manual';
}

export interface CurrencyConversion {
  from: Currency;
  to: Currency;
  amount: number;
  converted: number;
  rate: number;
  date: ISODate;
}

// ============================================================
// Auditoría
// ============================================================
export interface AuditLog {
  id: ID;
  tenantId: ID;
  userId: ID;
  userName: string;
  action: string;
  entity: string;
  entityId: ID;
  previousValue?: unknown;
  newValue?: unknown;
  geolocation?: { latitude: number; longitude: number; accuracy: number } | null;
  timestamp: ISODate;
}

// ============================================================
// Util
// ============================================================
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
