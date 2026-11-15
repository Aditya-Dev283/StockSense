import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Send, Save, Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { POItem, SparePart } from '../types';

export const ReorderScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { parts, suppliers, createPurchaseOrder } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const partIdParam = searchParams.get('part');
  const modeParam = searchParams.get('mode'); // 'bulk' or single

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');
  const [orderItems, setOrderItems] = useState<POItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('Standard replenishment purchase order');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize items based on parameters
  useEffect(() => {
    if (modeParam === 'bulk') {
      const lowParts = parts.filter(
        p => !p.is_archived && p.stock_qty <= p.min_threshold
      );

      if (lowParts.length > 0) {
        const firstSupplier = lowParts[0].supplier_id || suppliers[0]?.id;
        setSelectedSupplierId(firstSupplier);

        const items: POItem[] = lowParts.map(p => {
          const orderQty = Math.max(1, p.max_target - p.stock_qty);
          return {
            part_id: p.id,
            part_code: p.part_code,
            part_name: p.part_name,
            ordered_qty: orderQty,
            unit_cost: p.cost_price,
            total_cost: orderQty * p.cost_price,
          };
        });
        setOrderItems(items);
        setOrderNotes('Automated bulk replenishment purchase order for all low-stock items');
      }
    } else if (partIdParam) {
      const target = parts.find(p => p.id === partIdParam || p.part_code === partIdParam);
      if (target) {
        setSelectedSupplierId(target.supplier_id || suppliers[0]?.id);
        const orderQty = Math.max(1, target.max_target - target.stock_qty);
        setOrderItems([
          {
            part_id: target.id,
            part_code: target.part_code,
            part_name: target.part_name,
            ordered_qty: orderQty,
            unit_cost: target.cost_price,
            total_cost: orderQty * target.cost_price,
          },
        ]);
        setOrderNotes(`Replenishment purchase order for ${target.part_code}`);
      }
    } else if (parts.length > 0 && orderItems.length === 0) {
      const firstPart = parts[0];
      setOrderItems([
        {
          part_id: firstPart.id,
          part_code: firstPart.part_code,
          part_name: firstPart.part_name,
          ordered_qty: 10,
          unit_cost: firstPart.cost_price,
          total_cost: 10 * firstPart.cost_price,
        },
      ]);
    }
  }, [partIdParam, modeParam, parts, suppliers]);

  const updateItemQty = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    setOrderItems(prev =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              ordered_qty: qty,
              total_cost: qty * item.unit_cost,
            }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const addItem = (part: SparePart) => {
    if (orderItems.some(item => item.part_id === part.id)) return;
    const qty = Math.max(1, part.max_target - part.stock_qty);
    setOrderItems(prev => [
      ...prev,
      {
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.part_name,
        ordered_qty: qty,
        unit_cost: part.cost_price,
        total_cost: qty * part.cost_price,
      },
    ]);
  };

  const totalOrderAmount = orderItems.reduce((sum, item) => sum + item.total_cost, 0);

  const handleSubmitOrder = async (autoSend: boolean) => {
    if (orderItems.length === 0) {
      setErrorMsg('Please add at least one item to the purchase order.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await createPurchaseOrder({
      supplierId: selectedSupplierId,
      items: orderItems,
      notes: orderNotes,
      autoSend,
      userName: currentUser?.name || 'Staff User',
      userRole: currentUser?.role || 'purchasing',
    });

    setLoading(false);

    if (res.success) {
      navigate('/procurement/orders');
    } else {
      setErrorMsg('Failed to create purchase order.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="icon"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">
              {modeParam === 'bulk' ? 'Bulk Replenishment Purchase Order' : 'Create Purchase Order'}
            </h1>
            <p className="text-xs text-text-dim mt-0.5">
              Generate vendor order with suggested replenishment quantities
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={() => navigate('/procurement/orders')}>
          Cancel
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-white rounded-lg border-l-4 border-l-black border border-grey text-xs font-semibold text-black">
          {errorMsg}
        </div>
      )}

      {/* Supplier Selection */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
          1. Select Vendor / Supplier
        </h2>
        <div className="space-y-3">
          <Select
            label="Designated Component Supplier"
            value={selectedSupplierId}
            onChange={e => setSelectedSupplierId(e.target.value)}
            options={suppliers.map(s => ({
              label: `${s.name} (${s.contact_person} • ${s.phone})`,
              value: s.id,
            }))}
            required
          />
          <Input
            label="Order Notes / Delivery Terms"
            placeholder="e.g. Standard dispatch via transport. Delivery required within 48 hours."
            value={orderNotes}
            onChange={e => setOrderNotes(e.target.value)}
          />
        </div>
      </Card>

      {/* Order Items Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
            2. Line Items ({orderItems.length})
          </h2>
          <span className="text-xs text-text-dim">
            Adjust quantities to match delivery capacity
          </span>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-grey">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="h-10 bg-[#F2F2F2] border-b border-grey text-navy font-semibold">
                  <th className="py-2.5 px-3 text-[11px] uppercase tracking-wider text-text-dim">Part Code &amp; Item</th>
                  <th className="py-2.5 px-3 text-center text-[11px] uppercase tracking-wider text-text-dim">Unit Cost</th>
                  <th className="py-2.5 px-3 text-center w-32 text-[11px] uppercase tracking-wider text-text-dim">Order Qty</th>
                  <th className="py-2.5 px-3 text-right text-[11px] uppercase tracking-wider text-text-dim">Line Total</th>
                  <th className="py-2.5 px-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey text-navy bg-white">
                {orderItems.map((item, idx) => (
                  <tr key={item.part_id} className="h-14 hover:bg-[#F7F7F7] transition-colors">
                    <td className="py-2 px-3">
                      <span className="code-num font-bold text-navy block">{item.part_code}</span>
                      <span className="text-text-dim text-xs font-normal">{item.part_name}</span>
                    </td>
                    <td className="py-2 px-3 text-center code-num text-text-dim">
                      Rs. {item.unit_cost.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.ordered_qty}
                        onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                        className="w-20 h-9 bg-white text-center py-1 font-bold code-num text-navy rounded-lg border border-grey outline-none focus:border-navy"
                      />
                    </td>
                    <td className="py-2 px-3 text-right code-num font-bold text-navy">
                      Rs. {item.total_cost.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="w-8 h-8 rounded-lg hover:bg-grey/50 text-text-dim hover:text-black flex items-center justify-center transition-colors mx-auto"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F2F2F2] border-t border-grey font-bold text-navy">
                  <td colSpan={3} className="py-3 px-3 text-right text-xs">
                    Grand Total Order Valuation:
                  </td>
                  <td className="py-3 px-3 text-right code-num text-navy text-sm font-bold">
                    Rs. {totalOrderAmount.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Quick Add other parts */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-text-dim">Add more parts from catalog to this order:</span>
            <select
              onChange={e => {
                const p = parts.find(part => part.id === e.target.value);
                if (p) addItem(p);
                e.target.value = '';
              }}
              className="h-10 px-3 bg-white border border-grey rounded-lg text-xs text-navy outline-none cursor-pointer focus:border-navy"
              defaultValue=""
            >
              <option value="" disabled>
                + Append another spare part...
              </option>
              {parts
                .filter(p => !p.is_archived && !orderItems.some(i => i.part_id === p.id))
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.part_code} - {p.part_name} (Cost: Rs. {p.cost_price})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmitOrder(false)}
          disabled={loading}
          icon={<Save size={15} />}
        >
          Save as Draft PO
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={() => handleSubmitOrder(true)}
          disabled={loading}
          icon={<Send size={15} />}
        >
          Confirm &amp; Send PO Immediately
        </Button>
      </div>
    </div>
  );
};
