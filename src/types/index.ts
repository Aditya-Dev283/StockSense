export type UserRole = 'owner' | 'storekeeper' | 'mechanic' | 'purchasing';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  passwordHash: string; // SHA-256
}

export type PartCategory =
  | 'Brake Parts'
  | 'Filters'
  | 'Electricals'
  | 'Lubricants'
  | 'Spark Plugs'
  | 'Belts'
  | 'Bearings'
  | 'Suspension';

export interface StorageLocation {
  zone: string; // 'Zone A' | 'Zone B' | 'Zone C'
  rack: string; // 'Rack A' | 'Rack B' | ... | 'Rack F'
  shelf: string; // 'Shelf 1' | 'Shelf 2' | 'Shelf 3' | 'Shelf 4'
  bin: string; // 'Bin 01' ... 'Bin 12'
}

export interface SparePart {
  id: string;
  part_code: string;
  part_name: string;
  barcode: string;
  category: PartCategory;
  vehicle_model: string;
  cost_price: number;
  selling_price: number;
  stock_qty: number;
  min_threshold: number;
  max_target: number;
  location: StorageLocation;
  supplier_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  categories: PartCategory[];
  past_invoices_count: number;
}

export type TransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'ISSUE'
  | 'RETURN'
  | 'WRITEOFF'
  | 'INITIAL';

export interface StockTransaction {
  id: string;
  timestamp: string;
  part_id: string;
  part_code: string;
  part_name: string;
  type: TransactionType;
  qty_delta: number;
  qty_before: number;
  qty_after: number;
  reference_no: string;
  user_id: string;
  user_name: string;
  remarks: string;
}

export interface MechanicIssue {
  id: string; // e.g. ISS-2026-1042
  timestamp: string;
  mechanic_name: string;
  vehicle_job: string;
  part_id: string;
  part_code: string;
  part_name: string;
  rack_bin: string;
  qty: number;
  returned_qty: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
  status: 'ACTIVE' | 'RETURNED_PARTIAL' | 'RETURNED_FULL' | 'CLOSED';
}

export type POStatus = 'DRAFT' | 'ORDERED' | 'DELIVERED';

export interface POItem {
  part_id: string;
  part_code: string;
  part_name: string;
  ordered_qty: number;
  delivered_qty?: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: string; // e.g. PO-2026-089
  supplier_id: string;
  supplier_name: string;
  status: POStatus;
  created_at: string;
  ordered_at?: string;
  delivered_at?: string;
  supplier_invoice_no?: string;
  supplier_invoice_date?: string;
  items: POItem[];
  total_amount: number;
  notes?: string;
}

export type AuditAction =
  | 'PART_ADDED'
  | 'PART_EDITED'
  | 'PART_DELETED'
  | 'UPDATE_STOCK'
  | 'ISSUE_PART'
  | 'RETURN_PART'
  | 'PO_CREATED'
  | 'PO_ORDERED'
  | 'PO_RECEIVED'
  | 'USER_LOGIN'
  | 'SYSTEM_BACKUP'
  | 'SYSTEM_RESTORE';

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: AuditAction;
  part_code?: string;
  before_qty?: number;
  after_qty?: number;
  details: string;
  device_info: string;
  chain_hash: string;
}

export interface AppSettings {
  fontSize: 'standard' | 'workshop';
  highContrast: boolean;
  autoDailyBackup: boolean;
  lastBackupTime: string;
  dismissedCoachMarks: boolean;
}
