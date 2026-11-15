import { create } from 'zustand';
import {
  SparePart,
  Supplier,
  StockTransaction,
  MechanicIssue,
  PurchaseOrder,
  AuditEvent,
  TransactionType,
  AuditAction,
  POItem,
} from '../types';
import {
  SEED_PARTS,
  SEED_SUPPLIERS,
  SEED_TRANSACTIONS,
  SEED_ISSUES,
  SEED_ORDERS,
  SEED_AUDIT,
} from '../data/seed';
import { PartSearchIndex } from '../lib/searchIndex';
import { computeAuditChainHash } from '../lib/hash';
import { getStoredData, setStoredData } from '../lib/storage';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface InventoryState {
  parts: SparePart[];
  suppliers: Supplier[];
  transactions: StockTransaction[];
  issues: MechanicIssue[];
  orders: PurchaseOrder[];
  auditTrail: AuditEvent[];
  toasts: ToastItem[];
  searchIndex: PartSearchIndex;

  // Actions
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;

  addPart: (
    part: Omit<SparePart, 'id' | 'is_archived' | 'created_at' | 'updated_at'>,
    userName: string,
    userRole: string
  ) => Promise<{ success: boolean; error?: string; part?: SparePart }>;

  updatePart: (
    id: string,
    updates: Partial<SparePart>,
    userName: string,
    userRole: string
  ) => Promise<{ success: boolean; error?: string }>;

  deletePart: (
    id: string,
    userName: string,
    userRole: string
  ) => Promise<{ success: boolean; error?: string }>;

  updateStock: (params: {
    partId: string;
    type: TransactionType;
    qtyDelta: number;
    referenceNo: string;
    remarks: string;
    userId: string;
    userName: string;
    userRole: string;
  }) => Promise<{ success: boolean; error?: string }>;

  issuePart: (params: {
    partId: string;
    mechanicName: string;
    vehicleJob: string;
    qty: number;
    notes?: string;
    userId: string;
    userName: string;
    userRole: string;
  }) => Promise<{ success: boolean; error?: string; slipId?: string }>;

  returnIssuePart: (params: {
    issueId: string;
    returnedQty: number;
    userId: string;
    userName: string;
    userRole: string;
  }) => Promise<{ success: boolean; error?: string }>;

  createPurchaseOrder: (params: {
    supplierId: string;
    items: POItem[];
    notes?: string;
    autoSend?: boolean;
    userName: string;
    userRole: string;
  }) => Promise<{ success: boolean; orderId?: string }>;

  sendPurchaseOrder: (
    orderId: string,
    userName: string,
    userRole: string
  ) => Promise<{ success: boolean }>;

  receivePurchaseOrder: (params: {
    orderId: string;
    invoiceNo: string;
    invoiceDate: string;
    deliveredItems: Record<string, number>; // partId -> qtyDelivered
    userName: string;
    userRole: string;
  }) => Promise<{ success: boolean; error?: string }>;

  addSupplier: (
    supplier: Omit<Supplier, 'id' | 'past_invoices_count'>,
    userName: string,
    userRole: string
  ) => void;

  generateDemoParts: (targetCount?: number) => void;
  resetToSeed: () => void;
  restoreBackup: (snapshot: {
    parts: SparePart[];
    suppliers: Supplier[];
    transactions: StockTransaction[];
    issues: MechanicIssue[];
    orders: PurchaseOrder[];
    auditTrail: AuditEvent[];
  }) => void;
}

const STORAGE_KEYS = {
  PARTS: 'stocksense_parts_v2',
  SUPPLIERS: 'stocksense_suppliers_v2',
  TXNS: 'stocksense_txns_v2',
  ISSUES: 'stocksense_issues_v2',
  ORDERS: 'stocksense_orders_v2',
  AUDIT: 'stocksense_audit_v2',
};

export const useInventoryStore = create<InventoryState>((set, get) => {
  // Initialize from storage or seed
  const initialParts = getStoredData<SparePart[]>(STORAGE_KEYS.PARTS, SEED_PARTS);
  const initialSuppliers = getStoredData<Supplier[]>(STORAGE_KEYS.SUPPLIERS, SEED_SUPPLIERS);
  const initialTxns = getStoredData<StockTransaction[]>(STORAGE_KEYS.TXNS, SEED_TRANSACTIONS);
  const initialIssues = getStoredData<MechanicIssue[]>(STORAGE_KEYS.ISSUES, SEED_ISSUES);
  const initialOrders = getStoredData<PurchaseOrder[]>(STORAGE_KEYS.ORDERS, SEED_ORDERS);
  const initialAudit = getStoredData<AuditEvent[]>(STORAGE_KEYS.AUDIT, SEED_AUDIT);

  const searchIndex = new PartSearchIndex(initialParts);

  const appendAudit = async (
    user: string,
    role: string,
    action: AuditAction,
    details: string,
    partCode = '',
    beforeQty?: number,
    afterQty?: number
  ) => {
    const state = get();
    const lastAudit = state.auditTrail[state.auditTrail.length - 1];
    const prevHash = lastAudit?.chain_hash || '0000000000000000';
    const timestamp = new Date().toISOString();
    const chain_hash = await computeAuditChainHash(prevHash, timestamp, action, partCode, afterQty ?? 0);

    const newAudit: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp,
      user,
      role,
      action,
      part_code: partCode,
      before_qty: beforeQty,
      after_qty: afterQty,
      details,
      device_info: typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 32)}...` : 'Browser Client',
      chain_hash,
    };

    const updated = [newAudit, ...state.auditTrail];
    set({ auditTrail: updated });
    setStoredData(STORAGE_KEYS.AUDIT, updated);
  };

  return {
    parts: initialParts,
    suppliers: initialSuppliers,
    transactions: initialTxns,
    issues: initialIssues,
    orders: initialOrders,
    auditTrail: initialAudit,
    toasts: [],
    searchIndex,

    addToast: (type, message) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      set(s => ({
        toasts: [...s.toasts, { id, type, message, timestamp: Date.now() }],
      }));
      // Auto-dismiss after 4.5 seconds
      setTimeout(() => {
        get().removeToast(id);
      }, 4500);
    },

    removeToast: id => {
      set(s => ({
        toasts: s.toasts.filter(t => t.id !== id),
      }));
    },

    addPart: async (partData, userName, userRole) => {
      const state = get();
      // Validate unique code & barcode
      const existingCode = state.parts.find(
        p => !p.is_archived && p.part_code.toUpperCase() === partData.part_code.trim().toUpperCase()
      );
      if (existingCode) {
        return { success: false, error: `Part Code ${partData.part_code} already exists.` };
      }

      const existingBarcode = state.parts.find(
        p => !p.is_archived && p.barcode.trim() === partData.barcode.trim()
      );
      if (existingBarcode) {
        return { success: false, error: `Barcode ${partData.barcode} is already assigned to ${existingBarcode.part_name}.` };
      }

      const newPart: SparePart = {
        ...partData,
        id: `part-${Date.now()}`,
        part_code: partData.part_code.trim().toUpperCase(),
        part_name: partData.part_name.trim(),
        barcode: partData.barcode.trim(),
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedParts = [newPart, ...state.parts];
      state.searchIndex.rebuild(updatedParts);

      // Create initial stock transaction if stock > 0
      let updatedTxns = state.transactions;
      if (newPart.stock_qty > 0) {
        const initTxn: StockTransaction = {
          id: `TXN-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toISOString(),
          part_id: newPart.id,
          part_code: newPart.part_code,
          part_name: newPart.part_name,
          type: 'INITIAL',
          qty_delta: newPart.stock_qty,
          qty_before: 0,
          qty_after: newPart.stock_qty,
          reference_no: 'INIT-SETUP',
          user_id: 'sys',
          user_name: userName,
          remarks: 'Initial stock register on part creation',
        };
        updatedTxns = [initTxn, ...updatedTxns];
        setStoredData(STORAGE_KEYS.TXNS, updatedTxns);
      }

      set({ parts: updatedParts, transactions: updatedTxns });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);

      await appendAudit(
        userName,
        userRole,
        'PART_ADDED',
        `Added new part: ${newPart.part_name} (${newPart.part_code}) with initial stock ${newPart.stock_qty} units`,
        newPart.part_code,
        0,
        newPart.stock_qty
      );

      get().addToast('success', `Part ${newPart.part_code} added successfully!`);
      return { success: true, part: newPart };
    },

    updatePart: async (id, updates, userName, userRole) => {
      const state = get();
      const existing = state.parts.find(p => p.id === id);
      if (!existing) return { success: false, error: 'Part not found' };

      const updatedParts = state.parts.map(p =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      );

      state.searchIndex.rebuild(updatedParts);
      set({ parts: updatedParts });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);

      await appendAudit(
        userName,
        userRole,
        'PART_EDITED',
        `Updated details for part ${existing.part_code}: ${existing.part_name}`,
        existing.part_code,
        existing.stock_qty,
        existing.stock_qty
      );

      get().addToast('success', `Part ${existing.part_code} updated successfully.`);
      return { success: true };
    },

    deletePart: async (id, userName, userRole) => {
      const state = get();
      const existing = state.parts.find(p => p.id === id);
      if (!existing) return { success: false, error: 'Part not found' };

      const updatedParts = state.parts.map(p =>
        p.id === id ? { ...p, is_archived: true, updated_at: new Date().toISOString() } : p
      );

      state.searchIndex.rebuild(updatedParts);
      set({ parts: updatedParts });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);

      await appendAudit(
        userName,
        userRole,
        'PART_DELETED',
        `Archived spare part ${existing.part_code} - ${existing.part_name} from active inventory`,
        existing.part_code,
        existing.stock_qty,
        0
      );

      get().addToast('info', `Part ${existing.part_code} archived successfully.`);
      return { success: true };
    },

    updateStock: async params => {
      const state = get();
      const part = state.parts.find(p => p.id === params.partId);
      if (!part) return { success: false, error: 'Part not found' };

      const newQty = part.stock_qty + params.qtyDelta;
      if (newQty < 0) {
        return {
          success: false,
          error: `Cannot reduce stock below zero. Current stock is ${part.stock_qty}, attempted deduction is ${Math.abs(params.qtyDelta)}.`,
        };
      }

      const updatedParts = state.parts.map(p =>
        p.id === params.partId
          ? { ...p, stock_qty: newQty, updated_at: new Date().toISOString() }
          : p
      );

      const txn: StockTransaction = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.part_name,
        type: params.type,
        qty_delta: params.qtyDelta,
        qty_before: part.stock_qty,
        qty_after: newQty,
        reference_no: params.referenceNo || 'N/A',
        user_id: params.userId,
        user_name: params.userName,
        remarks: params.remarks,
      };

      const updatedTxns = [txn, ...state.transactions];

      state.searchIndex.rebuild(updatedParts);
      set({ parts: updatedParts, transactions: updatedTxns });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);
      setStoredData(STORAGE_KEYS.TXNS, updatedTxns);

      await appendAudit(
        params.userName,
        params.userRole,
        'UPDATE_STOCK',
        `Stock ${params.qtyDelta >= 0 ? '+' : ''}${params.qtyDelta} units (${params.type}) for ${part.part_code}. Ref: ${params.referenceNo}`,
        part.part_code,
        part.stock_qty,
        newQty
      );

      if (newQty <= part.min_threshold) {
        get().addToast(
          'warning',
          `Low Stock Alert: ${part.part_code} is now at ${newQty} units (Min threshold: ${part.min_threshold})!`
        );
      } else {
        get().addToast('success', `Stock for ${part.part_code} updated to ${newQty} units.`);
      }

      return { success: true };
    },

    issuePart: async params => {
      const state = get();
      const part = state.parts.find(p => p.id === params.partId);
      if (!part) return { success: false, error: 'Part not found' };

      if (part.stock_qty < params.qty) {
        return {
          success: false,
          error: `Insufficient stock. Requested ${params.qty} units, but only ${part.stock_qty} available in ${part.location.rack} - ${part.location.bin}.`,
        };
      }

      const slipId = `ISS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newQty = part.stock_qty - params.qty;

      const issue: MechanicIssue = {
        id: slipId,
        timestamp: new Date().toISOString(),
        mechanic_name: params.mechanicName,
        vehicle_job: params.vehicleJob,
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.part_name,
        rack_bin: `${part.location.rack} - ${part.location.shelf} - ${part.location.bin}`,
        qty: params.qty,
        returned_qty: 0,
        unit_price: part.selling_price,
        total_amount: params.qty * part.selling_price,
        notes: params.notes,
        status: 'ACTIVE',
      };

      const txn: StockTransaction = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.part_name,
        type: 'ISSUE',
        qty_delta: -params.qty,
        qty_before: part.stock_qty,
        qty_after: newQty,
        reference_no: slipId,
        user_id: params.userId,
        user_name: params.userName,
        remarks: `Issued to ${params.mechanicName} for ${params.vehicleJob}`,
      };

      const updatedParts = state.parts.map(p =>
        p.id === part.id ? { ...p, stock_qty: newQty, updated_at: new Date().toISOString() } : p
      );

      const updatedIssues = [issue, ...state.issues];
      const updatedTxns = [txn, ...state.transactions];

      state.searchIndex.rebuild(updatedParts);
      set({ parts: updatedParts, issues: updatedIssues, transactions: updatedTxns });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);
      setStoredData(STORAGE_KEYS.ISSUES, updatedIssues);
      setStoredData(STORAGE_KEYS.TXNS, updatedTxns);

      await appendAudit(
        params.userName,
        params.userRole,
        'ISSUE_PART',
        `Issued ${params.qty} unit(s) of ${part.part_code} to ${params.mechanicName} for Job: ${params.vehicleJob}. Slip: ${slipId}`,
        part.part_code,
        part.stock_qty,
        newQty
      );

      if (newQty <= part.min_threshold) {
        get().addToast('warning', `Low stock on ${part.part_code}: only ${newQty} units remain!`);
      } else {
        get().addToast('success', `Issued ${params.qty} units of ${part.part_code}. Slip ${slipId} generated!`);
      }

      return { success: true, slipId };
    },

    returnIssuePart: async params => {
      const state = get();
      const issue = state.issues.find(i => i.id === params.issueId);
      if (!issue) return { success: false, error: 'Issue record not found' };

      const availableToReturn = issue.qty - issue.returned_qty;
      if (params.returnedQty <= 0 || params.returnedQty > availableToReturn) {
        return {
          success: false,
          error: `Invalid return quantity. Maximum returnable units: ${availableToReturn}.`,
        };
      }

      const part = state.parts.find(p => p.id === issue.part_id);
      if (!part) return { success: false, error: 'Associated spare part not found' };

      const newReturnedTotal = issue.returned_qty + params.returnedQty;
      const newStatus = (newReturnedTotal >= issue.qty ? 'RETURNED_FULL' : 'RETURNED_PARTIAL') as 'RETURNED_FULL' | 'RETURNED_PARTIAL';
      const updatedStock = part.stock_qty + params.returnedQty;

      const updatedIssues = state.issues.map(i =>
        i.id === params.issueId
          ? { ...i, returned_qty: newReturnedTotal, status: newStatus }
          : i
      );

      const updatedParts = state.parts.map(p =>
        p.id === part.id ? { ...p, stock_qty: updatedStock, updated_at: new Date().toISOString() } : p
      );

      const txn: StockTransaction = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.part_name,
        type: 'RETURN',
        qty_delta: params.returnedQty,
        qty_before: part.stock_qty,
        qty_after: updatedStock,
        reference_no: `RET-${issue.id.slice(-4)}`,
        user_id: params.userId,
        user_name: params.userName,
        remarks: `Returned unused part from slip ${issue.id} by ${issue.mechanic_name}`,
      };

      const updatedTxns = [txn, ...state.transactions];

      state.searchIndex.rebuild(updatedParts);
      set({ parts: updatedParts, issues: updatedIssues, transactions: updatedTxns });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);
      setStoredData(STORAGE_KEYS.ISSUES, updatedIssues);
      setStoredData(STORAGE_KEYS.TXNS, updatedTxns);

      await appendAudit(
        params.userName,
        params.userRole,
        'RETURN_PART',
        `Returned ${params.returnedQty} unit(s) of ${part.part_code} from issue slip ${issue.id} back to stock`,
        part.part_code,
        part.stock_qty,
        updatedStock
      );

      get().addToast('success', `${params.returnedQty} unit(s) returned to ${part.location.rack} - ${part.location.bin}!`);
      return { success: true };
    },

    createPurchaseOrder: async params => {
      const state = get();
      const sup = state.suppliers.find(s => s.id === params.supplierId);
      const supplierName = sup ? sup.name : 'Unknown Supplier';

      const totalAmount = params.items.reduce((sum, item) => sum + item.total_cost, 0);
      const orderId = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

      const newOrder: PurchaseOrder = {
        id: orderId,
        supplier_id: params.supplierId,
        supplier_name: supplierName,
        status: params.autoSend ? 'ORDERED' : 'DRAFT',
        created_at: new Date().toISOString(),
        ordered_at: params.autoSend ? new Date().toISOString() : undefined,
        items: params.items,
        total_amount: totalAmount,
        notes: params.notes || 'Auto-generated replenishment purchase order',
      };

      const updatedOrders = [newOrder, ...state.orders];
      set({ orders: updatedOrders });
      setStoredData(STORAGE_KEYS.ORDERS, updatedOrders);

      await appendAudit(
        params.userName,
        params.userRole,
        'PO_CREATED',
        `Created purchase order ${orderId} for ${supplierName} (${params.items.length} items, Rs. ${totalAmount.toLocaleString()})`,
        params.items[0]?.part_code || ''
      );

      get().addToast('success', `Purchase Order ${orderId} created successfully!`);
      return { success: true, orderId };
    },

    sendPurchaseOrder: async (orderId, userName, userRole) => {
      const state = get();
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return { success: false };

      const updatedOrders = state.orders.map(o =>
        o.id === orderId ? { ...o, status: 'ORDERED' as const, ordered_at: new Date().toISOString() } : o
      );

      set({ orders: updatedOrders });
      setStoredData(STORAGE_KEYS.ORDERS, updatedOrders);

      await appendAudit(
        userName,
        userRole,
        'PO_ORDERED',
        `Confirmed and sent purchase order ${orderId} to ${order.supplier_name}`,
        order.items[0]?.part_code || ''
      );

      get().addToast('success', `Purchase order ${orderId} sent to supplier!`);
      return { success: true };
    },

    receivePurchaseOrder: async params => {
      const state = get();
      const order = state.orders.find(o => o.id === params.orderId);
      if (!order) return { success: false, error: 'Order not found' };

      const updatedParts = [...state.parts];
      const newTxns: StockTransaction[] = [];

      const updatedItems = order.items.map(item => {
        const qtyDelivered = params.deliveredItems[item.part_id] ?? item.ordered_qty;
        const partIdx = updatedParts.findIndex(p => p.id === item.part_id);

        if (partIdx !== -1) {
          const currentPart = updatedParts[partIdx];
          const newQty = currentPart.stock_qty + qtyDelivered;
          updatedParts[partIdx] = {
            ...currentPart,
            stock_qty: newQty,
            updated_at: new Date().toISOString(),
          };

          newTxns.push({
            id: `TXN-${Date.now().toString().slice(-6)}-${item.part_id.slice(-3)}`,
            timestamp: new Date().toISOString(),
            part_id: currentPart.id,
            part_code: currentPart.part_code,
            part_name: currentPart.part_name,
            type: 'PURCHASE',
            qty_delta: qtyDelivered,
            qty_before: currentPart.stock_qty,
            qty_after: newQty,
            reference_no: params.invoiceNo || order.id,
            user_id: 'sys',
            user_name: params.userName,
            remarks: `Received against PO ${order.id}. Supplier Inv #${params.invoiceNo}`,
          });
        }

        return {
          ...item,
          delivered_qty: qtyDelivered,
        };
      });

      const updatedOrder: PurchaseOrder = {
        ...order,
        status: 'DELIVERED',
        delivered_at: new Date().toISOString(),
        supplier_invoice_no: params.invoiceNo,
        supplier_invoice_date: params.invoiceDate,
        items: updatedItems,
      };

      const updatedOrders = state.orders.map(o => (o.id === params.orderId ? updatedOrder : o));
      const updatedTxns = [...newTxns, ...state.transactions];

      state.searchIndex.rebuild(updatedParts);
      set({ parts: updatedParts, orders: updatedOrders, transactions: updatedTxns });
      setStoredData(STORAGE_KEYS.PARTS, updatedParts);
      setStoredData(STORAGE_KEYS.ORDERS, updatedOrders);
      setStoredData(STORAGE_KEYS.TXNS, updatedTxns);

      await appendAudit(
        params.userName,
        params.userRole,
        'PO_RECEIVED',
        `Verified delivery for ${order.id}. Invoice ${params.invoiceNo} dated ${params.invoiceDate} processed. Inventory restocked.`,
        order.items[0]?.part_code || ''
      );

      get().addToast('success', `Delivery received & verified! Stock replenished for PO ${order.id}.`);
      return { success: true };
    },

    addSupplier: (supplierData, userName, userRole) => {
      const state = get();
      const newSup: Supplier = {
        ...supplierData,
        id: `sup-${Date.now().toString().slice(-5)}`,
        past_invoices_count: 0,
      };

      const updated = [...state.suppliers, newSup];
      set({ suppliers: updated });
      setStoredData(STORAGE_KEYS.SUPPLIERS, updated);

      appendAudit(
        userName,
        userRole,
        'PART_ADDED',
        `Registered new vendor supplier: ${newSup.name} (${newSup.phone})`
      );

      get().addToast('success', `Supplier ${newSup.name} registered successfully!`);
    },

    generateDemoParts: (targetCount = 2000) => {
      const state = get();
      const existing = state.parts.filter(p => !p.is_archived);
      const needed = Math.max(0, targetCount - existing.length);
      if (needed === 0) {
        get().addToast('info', `Already has ${existing.length} parts in catalog.`);
        return;
      }

      const categories = ['Brake Parts', 'Filters', 'Electricals', 'Lubricants', 'Spark Plugs', 'Belts', 'Bearings', 'Suspension'] as const;
      const racks = ['Rack A', 'Rack B', 'Rack C', 'Rack D', 'Rack E', 'Rack F'];
      const generated: SparePart[] = [];

      for (let i = 0; i < needed; i++) {
        const num = existing.length + i + 1;
        const cat = categories[i % categories.length];
        const rack = racks[i % racks.length];
        const shelf = `Shelf ${(i % 4) + 1}`;
        const bin = `Bin ${String((i % 12) + 1).padStart(2, '0')}`;
        const zone = rack === 'Rack A' || rack === 'Rack B' ? 'Zone A' : rack === 'Rack C' || rack === 'Rack D' ? 'Zone B' : 'Zone C';
        const cost = 100 + ((i * 47) % 2500);
        const sell = Math.round(cost * 1.45);
        const minThresh = 5 + (i % 15);
        const stock = (i % 11 === 0) ? 0 : (i % 7 === 0) ? Math.floor(minThresh * 0.7) : 10 + (i % 60);

        generated.push({
          id: `part-gen-${num}`,
          part_code: `GEN-${String(num).padStart(5, '0')}`,
          part_name: `Performance ${cat.slice(0, -1)} Unit Model #${num}`,
          barcode: `890${String(num).padStart(10, '0')}`,
          category: cat,
          vehicle_model: `Universal Fleet Series V${(i % 8) + 1}`,
          cost_price: cost,
          selling_price: sell,
          stock_qty: stock,
          min_threshold: minThresh,
          max_target: minThresh * 3,
          location: { zone, rack, shelf, bin },
          supplier_id: 'sup-1',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const allParts = [...state.parts, ...generated];
      state.searchIndex.rebuild(allParts);
      set({ parts: allParts });
      setStoredData(STORAGE_KEYS.PARTS, allParts);

      get().addToast('success', `Generated ${needed} demo parts! Catalog now holds ${allParts.length} items. Test search latency!`);
    },

    resetToSeed: () => {
      const parts = SEED_PARTS;
      const suppliers = SEED_SUPPLIERS;
      const transactions = SEED_TRANSACTIONS;
      const issues = SEED_ISSUES;
      const orders = SEED_ORDERS;
      const auditTrail = SEED_AUDIT;

      get().searchIndex.rebuild(parts);
      set({ parts, suppliers, transactions, issues, orders, auditTrail });

      setStoredData(STORAGE_KEYS.PARTS, parts);
      setStoredData(STORAGE_KEYS.SUPPLIERS, suppliers);
      setStoredData(STORAGE_KEYS.TXNS, transactions);
      setStoredData(STORAGE_KEYS.ISSUES, issues);
      setStoredData(STORAGE_KEYS.ORDERS, orders);
      setStoredData(STORAGE_KEYS.AUDIT, auditTrail);

      get().addToast('info', 'System reset to official seed data.');
    },

    restoreBackup: snapshot => {
      if (!snapshot.parts || !Array.isArray(snapshot.parts)) {
        get().addToast('error', 'Invalid backup file format.');
        return;
      }

      get().searchIndex.rebuild(snapshot.parts);
      set({
        parts: snapshot.parts,
        suppliers: snapshot.suppliers || [],
        transactions: snapshot.transactions || [],
        issues: snapshot.issues || [],
        orders: snapshot.orders || [],
        auditTrail: snapshot.auditTrail || [],
      });

      setStoredData(STORAGE_KEYS.PARTS, snapshot.parts);
      setStoredData(STORAGE_KEYS.SUPPLIERS, snapshot.suppliers || []);
      setStoredData(STORAGE_KEYS.TXNS, snapshot.transactions || []);
      setStoredData(STORAGE_KEYS.ISSUES, snapshot.issues || []);
      setStoredData(STORAGE_KEYS.ORDERS, snapshot.orders || []);
      setStoredData(STORAGE_KEYS.AUDIT, snapshot.auditTrail || []);

      get().addToast('success', 'Backup restored successfully!');
    },
  };
});
