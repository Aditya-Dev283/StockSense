import React, { useState } from 'react';
import { Drawer } from '../components/common/Drawer';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Badge } from '../components/common/Badge';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { TransactionType, SparePart } from '../types';
import { ArrowRight, AlertCircle, Plus, Minus } from 'lucide-react';

interface UpdateStockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  part: SparePart | null;
}

export const UpdateStockDrawer: React.FC<UpdateStockDrawerProps> = ({
  isOpen,
  onClose,
  part,
}) => {
  const { updateStock } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const [transactionType, setTransactionType] = useState<TransactionType>('PURCHASE');
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!part) return null;

  const isAddition = transactionType === 'PURCHASE' || transactionType === 'RETURN';
  const qtyDelta = isAddition ? quantity : -quantity;
  const updatedStock = part.stock_qty + qtyDelta;
  const isNegative = updatedStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than 0.');
      return;
    }
    if (isNegative) {
      setErrorMsg(`Stock cannot drop below zero. Maximum deduction possible is ${part.stock_qty} units.`);
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await updateStock({
      partId: part.id,
      type: transactionType,
      qtyDelta,
      referenceNo: referenceNo.trim() || 'N/A',
      remarks: remarks.trim() || `Manual stock update (${transactionType})`,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Staff User',
      userRole: currentUser?.role || 'storekeeper',
    });

    setLoading(false);

    if (res.success) {
      setQuantity(1);
      setReferenceNo('');
      setRemarks('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to update stock');
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Update Stock Quantity"
      subtitle="Record stock movements, adjustments, and physical count corrections"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Read-Only Part Summary Card */}
        <div className="p-4 bg-grey-header border border-grey rounded-[8px] space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="code-num text-xs font-bold text-orange">{part.part_code}</span>
              <h4 className="font-semibold text-sm text-navy">{part.part_name}</h4>
              <p className="text-xs text-dim mt-0.5">{part.vehicle_model}</p>
            </div>
            <Badge
              status={
                part.stock_qty <= 0
                  ? 'OUT_OF_STOCK'
                  : part.stock_qty <= part.min_threshold
                  ? 'LOW_STOCK'
                  : 'IN_STOCK'
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-grey text-xs">
            <div>
              <span className="text-dim text-[10px] uppercase block">Current Stock</span>
              <span className="font-bold text-navy text-sm code-num">{part.stock_qty} Units</span>
            </div>
            <div>
              <span className="text-dim text-[10px] uppercase block">Min Alert Level</span>
              <span className="font-medium text-navy text-sm code-num">{part.min_threshold} Units</span>
            </div>
            <div>
              <span className="text-dim text-[10px] uppercase block">Shelf Location</span>
              <span className="code-num font-semibold text-navy text-xs">
                {part.location.rack} • {part.location.bin}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Type Radio Options */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-navy block">Transaction Type:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'PURCHASE', label: 'Purchase / Restock (+)', desc: 'Supplier delivery' },
              { type: 'SALE', label: 'Counter Sale (-)', desc: 'Direct customer sale' },
              { type: 'RETURN', label: 'Return / Restock (+)', desc: 'Mechanic return' },
              { type: 'WRITEOFF', label: 'Write-off / Scrap (-)', desc: 'Damaged or expired' },
            ].map(item => {
              const isSelected = transactionType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setTransactionType(item.type as TransactionType)}
                  className={`p-3 rounded-[8px] text-left transition-colors border ${
                    isSelected
                      ? 'bg-white border-navy border-l-4 border-l-orange font-semibold'
                      : 'bg-white border-grey hover:bg-grey-hover'
                  }`}
                >
                  <p className="text-xs font-semibold text-navy flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.label.includes('+') ? (
                      <Plus size={13} className="text-orange" />
                    ) : (
                      <Minus size={13} className="text-navy" />
                    )}
                  </p>
                  <span className="text-[10px] text-dim block mt-0.5">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Field */}
        <Input
          label="Adjustment Quantity (Units)"
          type="number"
          min={1}
          value={quantity}
          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          required
        />

        {/* Reference / Invoice / Bill Number */}
        <Input
          label="Reference / Bill / Challan No."
          placeholder="e.g. INV-8821, JOB-1204, PO-089"
          value={referenceNo}
          onChange={e => setReferenceNo(e.target.value)}
        />

        {/* Remarks */}
        <Textarea
          label="Remarks / Audit Reason"
          placeholder="e.g. Received shipment via truck, or damaged part scrapped..."
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />

        {/* Live Calculation Preview Banner */}
        <div
          className={`p-3.5 rounded-[8px] text-xs flex items-center justify-between border ${
            isNegative
              ? 'bg-grey-header border-black text-black'
              : 'bg-white border-grey border-l-4 border-l-orange text-navy'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-dim uppercase tracking-wider block">
              Stock Calculation Preview
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="code-num font-bold text-sm">{part.stock_qty}</span>
              <span className="font-bold text-dim">{isAddition ? '+' : '-'}</span>
              <span className="code-num font-bold text-sm">{quantity}</span>
              <ArrowRight size={14} className="text-orange" />
              <span
                className={`code-num font-bold text-base ${
                  isNegative ? 'text-black underline' : 'text-navy'
                }`}
              >
                {updatedStock} Units
              </span>
            </div>
          </div>
          {updatedStock <= part.min_threshold && !isNegative && (
            <span className="text-[10px] font-bold text-orange flex items-center gap-1">
              <AlertCircle size={12} /> Below Minimum!
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-grey-header border-l-4 border-l-black text-xs font-medium text-black">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-grey">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isNegative || loading}
            className="flex items-center gap-2"
          >
            <span>{loading ? 'Updating...' : 'Confirm Stock Update'}</span>
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
