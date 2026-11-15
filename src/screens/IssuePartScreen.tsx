import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Car,
  Plus,
  Minus,
  RotateCcw,
  MapPin,
  FileText,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { MechanicIssue } from '../types';

const MECHANICS = ['Mechanic'];

export const IssuePartScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { parts, issues, issuePart, returnIssuePart } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const preSelectedCode = searchParams.get('part');
  const [selectedPartId, setSelectedPartId] = useState<string>('');

  const [mechanicName, setMechanicName] = useState(MECHANICS[0]);
  const [vehicleJob, setVehicleJob] = useState('MH-12-AB-1234 - Brake & Suspension Service');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [returnTargetIssue, setReturnTargetIssue] = useState<MechanicIssue | null>(null);
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (preSelectedCode) {
      const match = parts.find(
        p => !p.is_archived && p.part_code.toUpperCase() === preSelectedCode.toUpperCase()
      );
      if (match) {
        setSelectedPartId(match.id);
      }
    } else if (parts.length > 0 && !selectedPartId) {
      const firstAvailable = parts.find(p => !p.is_archived && p.stock_qty > 0);
      if (firstAvailable) setSelectedPartId(firstAvailable.id);
    }
  }, [preSelectedCode, parts, selectedPartId]);

  const selectedPart = parts.find(p => p.id === selectedPartId);

  const activeIssuesToday = issues.filter(
    i => i.status === 'ACTIVE' || i.status === 'RETURNED_PARTIAL'
  );

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) {
      setErrorMsg('Please select a spare part to issue.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Quantity must be at least 1 unit.');
      return;
    }
    if (quantity > selectedPart.stock_qty) {
      setErrorMsg(`Insufficient stock. Only ${selectedPart.stock_qty} unit(s) available.`);
      return;
    }
    if (!vehicleJob.trim()) {
      setErrorMsg('Please specify Vehicle Number and Job Card description.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await issuePart({
      partId: selectedPart.id,
      mechanicName,
      vehicleJob: vehicleJob.trim(),
      qty: quantity,
      notes: notes.trim(),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Staff User',
      userRole: currentUser?.role || 'storekeeper',
    });

    setLoading(false);

    if (res.success && res.slipId) {
      navigate(`/issue-slip/${res.slipId}`);
    } else {
      setErrorMsg(res.error || 'Failed to issue part.');
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnTargetIssue) return;
    setReturning(true);

    const res = await returnIssuePart({
      issueId: returnTargetIssue.id,
      returnedQty: returnQty,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Staff User',
      userRole: currentUser?.role || 'storekeeper',
    });

    setReturning(false);
    if (res.success) {
      setReturnTargetIssue(null);
      setReturnQty(1);
    } else {
      setErrorMsg(res.error || 'Failed to return part.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-[28px] leading-[36px] font-bold text-navy">Issue Part</h1>
        <p className="text-sm text-dim mt-0.5">
          Hand over spare parts from physical shelves to workshop mechanics against job cards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Issue Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleIssueSubmit}>
            <Card title="New Part Issuance Slip" className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-grey-header border-l-4 border-l-black text-xs font-medium text-black">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Part Select */}
              <div>
                <label className="text-xs font-medium text-navy block mb-1">
                  Select Spare Part from Shelf *
                </label>
                <select
                  value={selectedPartId}
                  onChange={e => {
                    setSelectedPartId(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy px-3 text-sm outline-none cursor-pointer focus:border-navy"
                  required
                >
                  <option value="" disabled>
                    -- Choose spare part to issue --
                  </option>
                  {parts
                    .filter(p => !p.is_archived)
                    .map(p => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.stock_qty <= 0}
                      >
                        {p.part_code} - {p.part_name} | {p.location.rack} {p.location.bin} (Stock:{' '}
                        {p.stock_qty}) {p.stock_qty <= 0 ? '[OUT OF STOCK]' : ''}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Part Live Preview Tile */}
              {selectedPart && (
                <div className="p-4 bg-grey-header border border-grey border-l-4 border-l-orange rounded-[8px] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="code-num text-xs font-bold text-orange">
                        {selectedPart.part_code}
                      </span>
                      <h4 className="font-semibold text-sm text-navy">
                        {selectedPart.part_name}
                      </h4>
                      <p className="text-xs text-dim mt-0.5">{selectedPart.vehicle_model}</p>
                    </div>
                    <Badge
                      status={
                        selectedPart.stock_qty <= 0
                          ? 'OUT_OF_STOCK'
                          : selectedPart.stock_qty <= selectedPart.min_threshold
                          ? 'LOW_STOCK'
                          : 'IN_STOCK'
                      }
                      size="sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-grey text-xs">
                    <div>
                      <span className="text-dim text-[10px] uppercase block">Shelf Location</span>
                      <span className="code-num font-semibold text-navy flex items-center gap-1">
                        <MapPin size={12} className="text-orange" />
                        {selectedPart.location.rack} - {selectedPart.location.bin}
                      </span>
                    </div>
                    <div>
                      <span className="text-dim text-[10px] uppercase block">Available Stock</span>
                      <span className="font-bold text-navy code-num">
                        {selectedPart.stock_qty} Units
                      </span>
                    </div>
                    <div>
                      <span className="text-dim text-[10px] uppercase block">Selling Price</span>
                      <span className="font-semibold text-navy code-num">
                        Rs. {selectedPart.selling_price}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Mechanic */}
              <Select
                label="Assigned Workshop Mechanic"
                value={mechanicName}
                onChange={e => setMechanicName(e.target.value)}
                options={MECHANICS.map(m => ({ label: m, value: m }))}
                required
              />

              {/* Vehicle & Job Card */}
              <Input
                label="Job Card / Vehicle Registration No."
                placeholder="e.g. MH-12-AB-1234 - Brake Overhaul & Pad Replacement"
                value={vehicleJob}
                onChange={e => setVehicleJob(e.target.value)}
                required
                leftIcon={<Car size={16} />}
              />

              {/* Quantity Stepper */}
              <div>
                <label className="text-xs font-medium text-navy block mb-1">
                  Quantity to Issue (Units)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={selectedPart?.stock_qty || 1}
                    value={quantity}
                    onChange={e =>
                      setQuantity(
                        Math.min(
                          selectedPart?.stock_qty || 1,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-20 h-10 border border-grey rounded-[8px] text-center font-bold code-num text-navy outline-none focus:border-navy"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(q =>
                        Math.min(selectedPart?.stock_qty || 1, q + 1)
                      )
                    }
                    disabled={Boolean(selectedPart && quantity >= selectedPart.stock_qty)}
                    className="w-10 h-10 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>

                  {selectedPart && (
                    <span className="text-xs text-dim code-num ml-2">
                      Total: Rs. {(quantity * selectedPart.selling_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <Textarea
                label="Notes / Specific Instructions (Optional)"
                placeholder="e.g. Customer requested original OEM pads..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !selectedPart || selectedPart.stock_qty <= 0}
                className="w-full flex items-center justify-center gap-2"
              >
                <ClipboardList size={18} />
                <span>{loading ? 'Deducting Stock...' : 'Issue Part & Generate Slip'}</span>
              </Button>
            </Card>
          </form>
        </div>

        {/* Right: Active Issues Today (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Active Mechanic Issues Today"
            subtitle="Parts checked out for ongoing repairs"
          >
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {activeIssuesToday.length > 0 ? (
                activeIssuesToday.map(issue => {
                  const returnable = issue.qty - issue.returned_qty;
                  return (
                    <div
                      key={issue.id}
                      className="p-3.5 bg-white border border-grey rounded-[8px] space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="code-num text-[11px] font-semibold text-orange">
                            {issue.id}
                          </span>
                          <h4 className="font-semibold text-navy text-sm">{issue.part_name}</h4>
                          <span className="text-xs text-dim block mt-0.5">
                            {issue.vehicle_job}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-[4px] bg-grey-header border border-grey font-semibold text-navy code-num">
                          {issue.qty} Issued {issue.returned_qty > 0 ? `(${issue.returned_qty} Ret)` : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-dim pt-1 border-t border-grey">
                        <span>Mechanic: <strong className="text-navy">{issue.mechanic_name}</strong></span>
                        <span className="code-num">{new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => navigate(`/issue-slip/${issue.id}`)}
                          className="text-xs font-semibold text-navy hover:text-orange flex items-center gap-1"
                        >
                          <FileText size={13} />
                          <span>View Slip</span>
                        </button>

                        {returnable > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setReturnTargetIssue(issue);
                              setReturnQty(1);
                            }}
                            className="flex items-center gap-1"
                          >
                            <RotateCcw size={13} />
                            <span>Return Unused ({returnable})</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 bg-grey-header border border-grey rounded-[8px] text-center text-dim text-xs">
                  No active mechanic issues today. All parts returned or closed.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Return Unused Part Modal (Section 4.5: ReturnPartModal overlay) */}
      <Modal
        isOpen={!!returnTargetIssue}
        onClose={() => setReturnTargetIssue(null)}
        title="Return Unused Spare Part"
        subtitle={`Restore unused items from ${returnTargetIssue?.id} back to shelf`}
      >
        {returnTargetIssue && (
          <div className="space-y-4 text-sm text-navy">
            <div className="p-3 bg-grey-header border border-grey rounded-[8px] space-y-1 text-xs">
              <p>
                <strong>Part:</strong> {returnTargetIssue.part_name} ({returnTargetIssue.part_code})
              </p>
              <p>
                <strong>Storage Bin:</strong> {returnTargetIssue.rack_bin}
              </p>
              <p>
                <strong>Mechanic:</strong> {returnTargetIssue.mechanic_name}
              </p>
              <p>
                <strong>Original Issued:</strong> {returnTargetIssue.qty} units (Already returned:{' '}
                {returnTargetIssue.returned_qty})
              </p>
            </div>

            <Input
              label={`Units Returning to Shelf (Max: ${returnTargetIssue.qty - returnTargetIssue.returned_qty})`}
              type="number"
              min={1}
              max={returnTargetIssue.qty - returnTargetIssue.returned_qty}
              value={returnQty}
              onChange={e =>
                setReturnQty(
                  Math.min(
                    returnTargetIssue.qty - returnTargetIssue.returned_qty,
                    Math.max(1, parseInt(e.target.value) || 1)
                  )
                )
              }
              required
            />

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-grey">
              <Button
                variant="secondary"
                onClick={() => setReturnTargetIssue(null)}
                disabled={returning}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReturn}
                disabled={returning}
              >
                {returning ? 'Restoring Stock...' : 'Confirm Return & Add Stock'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
