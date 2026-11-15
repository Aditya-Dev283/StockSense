import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Truck, CheckCircle2, Clock, PackageCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { PurchaseOrder, POStatus } from '../types';

export const OrdersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { orders, sendPurchaseOrder, receivePurchaseOrder } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<POStatus | 'ALL'>('ALL');
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

  // Goods receipt modal state
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveredQtys, setDeliveredQtys] = useState<Record<string, number>>({});
  const [receiving, setReceiving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredOrders = orders.filter(
    o => activeTab === 'ALL' || o.status === activeTab
  );

  const handleOpenReceiveModal = (order: PurchaseOrder) => {
    setReceivingOrder(order);
    setInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    const initQtys: Record<string, number> = {};
    order.items.forEach(item => {
      initQtys[item.part_id] = item.ordered_qty;
    });
    setDeliveredQtys(initQtys);
    setErrorMsg('');
  };

  const handleConfirmReceive = async () => {
    if (!receivingOrder) return;
    if (!invoiceNo.trim()) {
      setErrorMsg('Supplier Invoice / Challan Number is required.');
      return;
    }

    setReceiving(true);
    const res = await receivePurchaseOrder({
      orderId: receivingOrder.id,
      invoiceNo: invoiceNo.trim(),
      invoiceDate,
      deliveredItems: deliveredQtys,
      userName: currentUser?.name || 'Staff User',
      userRole: currentUser?.role || 'storekeeper',
    });

    setReceiving(false);
    if (res.success) {
      setReceivingOrder(null);
    } else {
      setErrorMsg(res.error || 'Failed to process receipt.');
    }
  };

  const handleSendPO = async (orderId: string) => {
    await sendPurchaseOrder(
      orderId,
      currentUser?.name || 'Staff User',
      currentUser?.role || 'purchasing'
    );
  };

  const tabs: { key: POStatus | 'ALL'; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Orders', count: orders.length },
    { key: 'DRAFT', label: 'Draft POs', count: orders.filter(o => o.status === 'DRAFT').length },
    { key: 'ORDERED', label: 'In-Transit / Ordered', count: orders.filter(o => o.status === 'ORDERED').length },
    { key: 'DELIVERED', label: 'Delivered & Verified', count: orders.filter(o => o.status === 'DELIVERED').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Purchase Orders &amp; Supplier Deliveries
          </h1>
          <p className="text-xs text-text-dim mt-1">
            Procurement workflow: Draft PO &rarr; Sent Order &rarr; Goods Receipt &amp; Inventory Stock Restock
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/procurement/reorder')}
          icon={<Plus size={16} />}
        >
          Create Purchase Order
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-grey pb-px overflow-x-auto">
        {tabs.map(t => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`h-12 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-orange text-navy font-bold'
                  : 'border-transparent text-text-dim hover:text-navy'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-orange/20 text-navy font-bold' : 'bg-grey text-text-dim'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const isDelivered = order.status === 'DELIVERED';
            const isOrdered = order.status === 'ORDERED';
            const isDraft = order.status === 'DRAFT';

            return (
              <Card key={order.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-grey">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isDelivered
                          ? 'bg-navy/5 text-navy border border-grey'
                          : isOrdered
                          ? 'bg-orange/10 text-orange border border-orange/30'
                          : 'bg-grey/50 text-text-dim border border-grey'
                      }`}
                    >
                      {isDelivered ? <CheckCircle2 size={18} /> : isOrdered ? <Truck size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="code-num font-bold text-sm text-navy">{order.id}</span>
                        {isDelivered && <Badge status="IN_STOCK" label="Delivered" size="sm" />}
                        {isOrdered && <Badge status="LOW_STOCK" label="Ordered" size="sm" />}
                        {isDraft && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-grey text-text-dim border border-grey">Draft</span>}
                      </div>
                      <p className="text-xs font-medium text-navy mt-0.5">{order.supplier_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDraft && (
                      <Button
                        variant="primary"
                        onClick={() => handleSendPO(order.id)}
                        icon={<Truck size={14} />}
                      >
                        Confirm &amp; Send PO
                      </Button>
                    )}

                    {isOrdered && (
                      <Button
                        variant="primary"
                        onClick={() => handleOpenReceiveModal(order)}
                        icon={<PackageCheck size={14} />}
                      >
                        Receive Delivery &amp; Log Bill
                      </Button>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-bold text-navy flex items-center gap-1.5 bg-grey/50 px-3 py-1.5 rounded-lg border border-grey">
                        <CheckCircle2 size={14} className="text-orange" />
                        <span>Bill #{order.supplier_invoice_no} Verified</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in this PO */}
                <div className="overflow-x-auto rounded-lg border border-grey">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="h-10 bg-[#F2F2F2] text-navy font-semibold border-b border-grey">
                        <th className="py-2 px-3 font-semibold text-[11px] uppercase tracking-wider text-text-dim">Part Code &amp; Item</th>
                        <th className="py-2 px-3 text-center font-semibold text-[11px] uppercase tracking-wider text-text-dim">Ordered Qty</th>
                        {isDelivered && <th className="py-2 px-3 text-center font-semibold text-[11px] uppercase tracking-wider text-text-dim">Delivered Qty</th>}
                        <th className="py-2 px-3 text-right font-semibold text-[11px] uppercase tracking-wider text-text-dim">Unit Cost</th>
                        <th className="py-2 px-3 text-right font-semibold text-[11px] uppercase tracking-wider text-text-dim">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey text-navy bg-white">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="h-12 hover:bg-[#F7F7F7] transition-colors">
                          <td className="py-2 px-3">
                            <span className="code-num font-bold text-navy">{item.part_code}</span>
                            <span className="text-text-dim ml-2 font-normal">{item.part_name}</span>
                          </td>
                          <td className="py-2 px-3 text-center code-num font-bold">
                            {item.ordered_qty}
                          </td>
                          {isDelivered && (
                            <td className="py-2 px-3 text-center code-num font-bold text-orange">
                              {item.delivered_qty ?? item.ordered_qty}
                            </td>
                          )}
                          <td className="py-2 px-3 text-right code-num text-text-dim">
                            Rs. {item.unit_cost.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right code-num font-bold text-navy">
                            Rs. {item.total_cost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#F2F2F2] font-semibold border-t border-grey text-navy">
                        <td colSpan={isDelivered ? 4 : 3} className="py-3 px-3 text-right text-xs">
                          Total Order Valuation:
                        </td>
                        <td className="py-3 px-3 text-right code-num text-navy text-sm font-bold">
                          Rs. {order.total_amount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer Timestamps */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-text-dim">
                  <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                  {order.notes && <span className="italic">{order.notes}</span>}
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center text-text-dim text-xs">
            No purchase orders found under this status tab.
          </Card>
        )}
      </div>

      {/* Goods Receipt & Invoice Modal */}
      <Modal
        isOpen={!!receivingOrder}
        onClose={() => setReceivingOrder(null)}
        title="Receive Delivery &amp; Log Supplier Bill"
        subtitle={`Verify items delivered against Purchase Order ${receivingOrder?.id}`}
      >
        {receivingOrder && (
          <div className="space-y-4 text-xs text-navy">
            {errorMsg && (
              <div className="p-3 bg-white rounded-lg border-l-4 border-l-black border border-grey text-xs font-semibold text-black">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Supplier Invoice / Challan Number"
                placeholder="e.g. BOS-INV-9921"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                required
              />
              <Input
                label="Invoice Date"
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                required
              />
            </div>

            <div>
              <span className="text-xs font-bold text-navy block mb-2">
                Verify Physical Delivered Quantities:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto rounded-lg border border-grey p-2 bg-[#F2F2F2]">
                {receivingOrder.items.map(item => (
                  <div
                    key={item.part_id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-grey"
                  >
                    <div>
                      <span className="code-num font-bold text-navy">{item.part_code}</span>
                      <p className="font-medium text-xs text-navy">{item.part_name}</p>
                      <span className="text-[10px] text-text-dim">
                        Ordered: {item.ordered_qty} units @ Rs. {item.unit_cost}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-dim">Received:</span>
                      <input
                        type="number"
                        min={0}
                        max={item.ordered_qty * 2}
                        value={deliveredQtys[item.part_id] ?? item.ordered_qty}
                        onChange={e =>
                          setDeliveredQtys({
                            ...deliveredQtys,
                            [item.part_id]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20 h-9 bg-white text-center py-1 font-bold code-num text-navy rounded-lg border border-grey outline-none focus:border-navy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#F2F2F2] rounded-lg border border-grey text-[11px] text-text-dim leading-relaxed">
              Upon clicking &quot;Verify &amp; Add to Inventory&quot;, stock quantities will immediately update,
              resolved alerts will clear, and an audit trail entry will be sealed.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-grey">
              <Button
                variant="secondary"
                onClick={() => setReceivingOrder(null)}
                disabled={receiving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReceive}
                disabled={receiving}
              >
                {receiving ? 'Processing...' : 'Verify & Add to Inventory'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
