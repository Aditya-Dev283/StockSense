import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { BarcodeDisplay } from '../components/common/BarcodeDisplay';
import { useInventoryStore } from '../state/useInventoryStore';

export const IssueSlipScreen: React.FC = () => {
  const { slipId } = useParams<{ slipId: string }>();
  const navigate = useNavigate();
  const { issues, parts } = useInventoryStore();

  const issue = issues.find(i => i.id === slipId) || issues[0];
  const part = parts.find(p => p.id === issue?.part_id || p.part_code === issue?.part_code);

  const handlePrint = () => {
    window.print();
  };

  if (!issue) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-navy font-bold">Issue slip not found.</p>
        <Button variant="primary" onClick={() => navigate('/issue-part')}>
          Back to Issue Part
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Top Action Buttons (Hidden on Print) */}
      <div className="flex items-center justify-between no-print">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/issue-part')}
            className="flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>+ Issue Another Part</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer size={16} />
            <span>Print Issue Slip</span>
          </Button>
        </div>
      </div>

      {/* Printable Issue Slip Area: Clean black on white border */}
      <div className="print-area bg-white border border-grey rounded-[8px] p-8 space-y-6">
        {/* Slip Header */}
        <div className="flex items-start justify-between pb-4 border-b border-grey">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[8px] bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
              SS
            </div>
            <div>
              <h1 className="font-bold text-lg text-navy leading-none">
                StockSense Workshop
              </h1>
              <p className="text-xs text-dim mt-1">
                Spare Part Issue Voucher / Dispatch Slip
              </p>
              <p className="text-[11px] text-dim">MIDC Industrial Area, Pune</p>
            </div>
          </div>

          <div className="text-right">
            <span className="code-num font-bold text-base text-navy block">
              {issue.id}
            </span>
            <span className="text-xs text-dim block mt-0.5 code-num">
              {new Date(issue.timestamp).toLocaleString()}
            </span>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-[4px] bg-grey-header border border-grey text-navy text-[10px] font-bold">
              STATUS: {issue.status}
            </span>
          </div>
        </div>

        {/* Dispatch Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-grey-header border border-grey rounded-[8px] space-y-1">
            <span className="text-[10px] uppercase font-bold text-dim block">
              Mechanic Assigned
            </span>
            <p className="font-bold text-navy text-sm">{issue.mechanic_name}</p>
            <p className="text-dim text-[11px]">Authorized Workshop Technician</p>
          </div>

          <div className="p-3 bg-grey-header border border-grey rounded-[8px] space-y-1">
            <span className="text-[10px] uppercase font-bold text-dim block">
              Vehicle &amp; Job Card Reference
            </span>
            <p className="font-bold text-navy text-sm">{issue.vehicle_job}</p>
            <p className="text-dim text-[11px]">Garage Job Card Tracking</p>
          </div>
        </div>

        {/* Issued Item Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-grey rounded-[8px]">
            <thead>
              <tr className="bg-grey-header text-navy font-bold border-b border-grey">
                <th className="py-2.5 px-3">Part Code &amp; Description</th>
                <th className="py-2.5 px-3">Bin Allocation</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey text-navy">
              <tr>
                <td className="py-3 px-3">
                  <span className="code-num font-bold block">{issue.part_code}</span>
                  <span>{issue.part_name}</span>
                </td>
                <td className="py-3 px-3 code-num">{issue.rack_bin}</td>
                <td className="py-3 px-3 text-center code-num font-bold text-sm">
                  {issue.qty}
                </td>
                <td className="py-3 px-3 text-right code-num">
                  Rs. {issue.unit_price}
                </td>
                <td className="py-3 px-3 text-right font-bold code-num text-sm">
                  Rs. {issue.total_amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-grey-header font-bold border-t border-grey">
                <td colSpan={4} className="py-2.5 px-3 text-right">
                  Net Dispatch Total:
                </td>
                <td className="py-2.5 px-3 text-right code-num text-navy text-sm font-bold">
                  Rs. {issue.total_amount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {issue.notes && (
          <div className="p-3 bg-grey-header border border-grey rounded-[8px] text-xs text-navy">
            <span className="font-bold block text-[10px] text-dim uppercase">
              Job Remarks:
            </span>
            <p className="mt-0.5">{issue.notes}</p>
          </div>
        )}

        {part && (
          <div className="flex flex-col items-center justify-center pt-2">
            <BarcodeDisplay barcode={part.barcode} width={180} height={38} />
            <span className="text-[10px] text-dim mt-1">Scan barcode to verify issue return</span>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-grey text-xs text-navy text-center">
          <div>
            <div className="border-b border-navy/40 w-36 mx-auto mb-1"></div>
            <span className="text-dim text-[11px]">Storekeeper Signature</span>
          </div>
          <div>
            <div className="border-b border-navy/40 w-36 mx-auto mb-1"></div>
            <span className="text-dim text-[11px]">Mechanic Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};
