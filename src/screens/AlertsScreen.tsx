import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, XCircle, ShoppingCart, Phone, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useInventoryStore } from '../state/useInventoryStore';

export const AlertsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { parts, suppliers } = useInventoryStore();

  const activeParts = parts.filter(p => !p.is_archived);
  const outOfStockParts = activeParts.filter(p => p.stock_qty <= 0);
  const belowMinParts = activeParts.filter(
    p => p.stock_qty > 0 && p.stock_qty <= p.min_threshold
  );
  const allAlertParts = [...outOfStockParts, ...belowMinParts];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold text-navy">
            Low-Stock Alerts
          </h1>
          <p className="text-sm text-dim mt-0.5">
            Automated threshold triggers requiring replenishment purchase orders
          </p>
        </div>

        {allAlertParts.length > 0 && (
          <Button
            variant="primary"
            onClick={() => navigate('/procurement/reorder?mode=bulk')}
            className="flex items-center gap-1.5"
          >
            <ShoppingCart size={16} />
            <span>Auto-Generate Bulk PO for All Low Items</span>
          </Button>
        )}
      </div>

      {/* Summary KPI Banner (Out of Stock count vs Below Minimum count) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-black flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-dim uppercase tracking-wider">
              Critical Depletions (0 Units)
            </span>
            <p className="text-[32px] leading-[40px] font-bold text-black code-num">
              {outOfStockParts.length} Parts
            </p>
            <p className="text-xs text-dim">Completely depleted items halting repair jobs</p>
          </div>
          <div className="w-12 h-12 rounded-[8px] bg-grey-header border border-grey flex items-center justify-center text-black">
            <XCircle size={24} strokeWidth={1.5} />
          </div>
        </Card>

        <Card className="border-l-4 border-l-orange flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-orange uppercase tracking-wider">
              Below Safety Minimum
            </span>
            <p className="text-[32px] leading-[40px] font-bold text-navy code-num">
              {belowMinParts.length} Parts
            </p>
            <p className="text-xs text-dim">Stock dropped below designated safety buffer</p>
          </div>
          <div className="w-12 h-12 rounded-[8px] bg-grey-header border border-grey flex items-center justify-center text-orange">
            <AlertTriangle size={24} strokeWidth={1.5} />
          </div>
        </Card>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-grey rounded-[8px] overflow-hidden">
        <div className="p-4 border-b border-grey flex items-center justify-between">
          <h3 className="font-semibold text-base text-navy">
            Items Requiring Immediate Reordering ({allAlertParts.length})
          </h3>
          <span className="text-xs text-dim">Calculated replenishment suggested quantities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="h-12 bg-grey-header text-dim text-xs uppercase font-medium border-b border-grey">
                <th className="px-4">Part Code &amp; SKU</th>
                <th className="px-3">Description &amp; Category</th>
                <th className="px-3">Shelf/Bin</th>
                <th className="px-3 text-center">Current Qty</th>
                <th className="px-3 text-center">Min Level</th>
                <th className="px-3 text-center">Recommended Order</th>
                <th className="px-3">Preferred Supplier &amp; Phone</th>
                <th className="px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey text-navy">
              {allAlertParts.length > 0 ? (
                allAlertParts.map(part => {
                  const sup = suppliers.find(s => s.id === part.supplier_id) || suppliers[0];
                  const recommendedOrderQty = Math.max(1, part.max_target - part.stock_qty);
                  const isDepleted = part.stock_qty <= 0;

                  return (
                    <tr key={part.id} className="h-14 hover:bg-grey-hover transition-colors">
                      <td className="px-4">
                        <span className="code-num font-semibold text-navy block text-xs">
                          {part.part_code}
                        </span>
                        <span className="code-num text-[11px] text-dim block">
                          {part.barcode}
                        </span>
                      </td>

                      <td className="px-3">
                        <p className="font-medium text-navy">{part.part_name}</p>
                        <span className="text-xs text-dim block">{part.category}</span>
                      </td>

                      <td className="px-3 code-num text-xs whitespace-nowrap">
                        {part.location.rack} • {part.location.bin}
                      </td>

                      <td className="px-3 text-center">
                        <span
                          className={`code-num font-bold text-sm ${
                            isDepleted ? 'text-black' : 'text-orange'
                          }`}
                        >
                          {part.stock_qty}
                        </span>
                      </td>

                      <td className="px-3 text-center code-num text-xs text-dim">
                        {part.min_threshold}
                      </td>

                      <td className="px-3 text-center code-num font-semibold text-navy">
                        +{recommendedOrderQty} Units
                      </td>

                      <td className="px-3">
                        <p className="font-medium text-navy text-xs truncate">{sup.name}</p>
                        <span className="text-[11px] text-dim code-num flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-orange" />
                          {sup.phone}
                        </span>
                      </td>

                      <td className="px-4 text-right whitespace-nowrap">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/procurement/reorder?part=${part.id}`)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <ShoppingCart size={13} />
                          <span>Generate PO</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-dim text-xs">
                    <CheckCircle2 size={24} className="mx-auto text-orange mb-2" />
                    All spare parts are currently above minimum safety stock thresholds!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
