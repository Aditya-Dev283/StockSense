import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, MapPin, Barcode } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { PickOnMapModal } from '../components/layout/PickOnMapModal';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { PartCategory, StorageLocation } from '../types';

const CATEGORIES: PartCategory[] = [
  'Brake Parts',
  'Filters',
  'Electricals',
  'Lubricants',
  'Spark Plugs',
  'Belts',
  'Bearings',
  'Suspension',
];

const RACKS = ['Rack A', 'Rack B', 'Rack C', 'Rack D', 'Rack E', 'Rack F'];
const SHELVES = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4'];
const BINS = Array.from({ length: 12 }, (_, i) => `Bin ${String(i + 1).padStart(2, '0')}`);

export const AddEditPartScreen: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { parts, suppliers, addPart, updatePart } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const isEdit = Boolean(id);
  const existingPart = isEdit ? parts.find(p => p.id === id) : null;

  const [partName, setPartName] = useState(existingPart?.part_name || '');
  const [partCode, setPartCode] = useState(existingPart?.part_code || '');
  const [barcode, setBarcode] = useState(
    existingPart?.barcode || searchParams.get('barcode') || ''
  );
  const [category, setCategory] = useState<PartCategory>(
    existingPart?.category || 'Brake Parts'
  );
  const [vehicleModel, setVehicleModel] = useState(existingPart?.vehicle_model || '');
  const [costPrice, setCostPrice] = useState<number>(existingPart?.cost_price || 250);
  const [sellingPrice, setSellingPrice] = useState<number>(existingPart?.selling_price || 380);
  const [stockQty, setStockQty] = useState<number>(existingPart?.stock_qty ?? 10);
  const [minThreshold, setMinThreshold] = useState<number>(existingPart?.min_threshold ?? 5);
  const [maxTarget, setMaxTarget] = useState<number>(existingPart?.max_target ?? 25);
  const [supplierId, setSupplierId] = useState<string>(
    existingPart?.supplier_id || suppliers[0]?.id || 'sup-1'
  );

  const [location, setLocation] = useState<StorageLocation>(
    existingPart?.location || {
      zone: 'Zone A',
      rack: 'Rack A',
      shelf: 'Shelf 1',
      bin: 'Bin 01',
    }
  );

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const marginPct =
    costPrice > 0 ? Math.round(((sellingPrice - costPrice) / costPrice) * 100) : 0;

  const handleAutoGenerateCode = () => {
    const prefixMap: Record<PartCategory, string> = {
      'Brake Parts': 'BP',
      Filters: 'FL',
      Electricals: 'EL',
      Lubricants: 'LU',
      'Spark Plugs': 'SP',
      Belts: 'BL',
      Bearings: 'BR',
      Suspension: 'SU',
    };
    const prefix = prefixMap[category] || 'PRT';
    const randNum = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${randNum}`;
    setPartCode(newCode);

    if (!barcode) {
      setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    }
  };

  const handleRackChange = (rack: string) => {
    const zone =
      rack === 'Rack A' || rack === 'Rack B'
        ? 'Zone A'
        : rack === 'Rack C' || rack === 'Rack D'
        ? 'Zone B'
        : 'Zone C';
    setLocation(prev => ({ ...prev, rack, zone }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !partCode.trim() || !barcode.trim()) {
      setErrorMsg('Part Name, Part Code, and Barcode are strictly required.');
      return;
    }
    if (costPrice < 0 || sellingPrice < 0) {
      setErrorMsg('Prices must be non-negative values.');
      return;
    }
    if (stockQty < 0 || minThreshold < 0) {
      setErrorMsg('Quantities must be non-negative values.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const userName = currentUser?.name || 'Staff User';
    const userRole = currentUser?.role || 'storekeeper';

    if (isEdit && existingPart) {
      const res = await updatePart(
        existingPart.id,
        {
          part_name: partName.trim(),
          part_code: partCode.trim().toUpperCase(),
          barcode: barcode.trim(),
          category,
          vehicle_model: vehicleModel.trim(),
          cost_price: Number(costPrice),
          selling_price: Number(sellingPrice),
          stock_qty: Number(stockQty),
          min_threshold: Number(minThreshold),
          max_target: Number(maxTarget),
          location,
          supplier_id: supplierId,
        },
        userName,
        userRole
      );

      setLoading(false);
      if (res.success) {
        navigate('/inventory');
      } else {
        setErrorMsg(res.error || 'Failed to update part');
      }
    } else {
      const res = await addPart(
        {
          part_name: partName.trim(),
          part_code: partCode.trim().toUpperCase(),
          barcode: barcode.trim(),
          category,
          vehicle_model: vehicleModel.trim(),
          cost_price: Number(costPrice),
          selling_price: Number(sellingPrice),
          stock_qty: Number(stockQty),
          min_threshold: Number(minThreshold),
          max_target: Number(maxTarget),
          location,
          supplier_id: supplierId,
        },
        userName,
        userRole
      );

      setLoading(false);
      if (res.success) {
        navigate('/inventory');
      } else {
        setErrorMsg(res.error || 'Failed to add part');
      }
    }
  };

  return (
    <div className="max-w-[1136px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="icon"
            size="sm"
            onClick={() => navigate('/inventory')}
            aria-label="Back to Inventory"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[28px] leading-[36px] font-bold text-navy">
              {isEdit ? `Edit Part: ${existingPart?.part_code}` : 'Add New Spare Part'}
            </h1>
            <p className="text-sm text-dim mt-0.5">
              Part specifications, automotive compatibility, location, and alert thresholds
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={() => navigate('/inventory')}>
          Cancel
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-grey-header border-l-4 border-l-black text-xs font-medium text-black">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 2-Column Form on a Single Card (Section 7, Feature 1) */}
      <form onSubmit={handleSubmit}>
        <Card title="Part Details &amp; Configuration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Identification & Vehicle */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block pb-1 border-b border-grey">
                1. Identification
              </span>

              <Input
                label="Part Description / Name"
                placeholder="e.g. Front Disc Brake Pad Set (Ceramic)"
                value={partName}
                onChange={e => setPartName(e.target.value)}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-navy">
                    Part Code / SKU <span className="text-orange">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    <span>Auto-Generate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. BP-204"
                  value={partCode}
                  onChange={e => setPartCode(e.target.value.toUpperCase())}
                  className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy px-3 text-sm code-num font-semibold uppercase outline-none focus:border-navy"
                  required
                />
              </div>

              <Input
                label="Barcode / EAN Number"
                placeholder="Scan or enter 13-digit barcode..."
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                required
                rightIcon={<Barcode size={16} />}
              />

              <Select
                label="Component Category"
                value={category}
                onChange={e => setCategory(e.target.value as PartCategory)}
                options={CATEGORIES.map(c => ({ label: c, value: c }))}
                required
              />

              <Input
                label="Compatible Vehicle / Make / Models"
                placeholder="e.g. Maruti Swift, Baleno, Dzire (2018-2022) Petrol"
                value={vehicleModel}
                onChange={e => setVehicleModel(e.target.value)}
              />

              <Select
                label="Preferred Supplier / Vendor"
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                options={suppliers.map(s => ({
                  label: `${s.name} (${s.contact_person})`,
                  value: s.id,
                }))}
              />
            </div>

            {/* Right Column: Pricing, Location, Stock Levels */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block pb-1 border-b border-grey">
                2. Pricing, Storage &amp; Alerts
              </span>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Purchase Cost (Rs.)"
                  type="number"
                  min={0}
                  step="any"
                  value={costPrice}
                  onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                  required
                />

                <Input
                  label="Selling Price (Rs.)"
                  type="number"
                  min={0}
                  step="any"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="p-2.5 bg-grey-header border border-grey rounded-[8px] flex items-center justify-between text-xs">
                <span>Profit Margin: <strong className="code-num text-navy">+{marginPct}%</strong></span>
                <span className="text-dim code-num">Diff: Rs. {(sellingPrice - costPrice).toFixed(0)}</span>
              </div>

              {/* Location Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-navy">
                    Storage Allocation: <strong className="code-num">{location.rack} • {location.shelf} • {location.bin}</strong>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMapModalOpen(true)}
                    className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
                  >
                    <MapPin size={12} />
                    <span>Pick on Map</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Select
                    value={location.zone}
                    onChange={e => setLocation(prev => ({ ...prev, zone: e.target.value }))}
                    options={[
                      { label: 'Zone A', value: 'Zone A' },
                      { label: 'Zone B', value: 'Zone B' },
                      { label: 'Zone C', value: 'Zone C' },
                    ]}
                  />
                  <Select
                    value={location.rack}
                    onChange={e => handleRackChange(e.target.value)}
                    options={RACKS.map(r => ({ label: r, value: r }))}
                  />
                  <Select
                    value={location.shelf}
                    onChange={e => setLocation(prev => ({ ...prev, shelf: e.target.value }))}
                    options={SHELVES.map(s => ({ label: s, value: s }))}
                  />
                  <Select
                    value={location.bin}
                    onChange={e => setLocation(prev => ({ ...prev, bin: e.target.value }))}
                    options={BINS.map(b => ({ label: b, value: b }))}
                  />
                </div>
              </div>

              {/* Quantities & Buffers */}
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Initial Stock Qty"
                  type="number"
                  min={0}
                  value={stockQty}
                  onChange={e => setStockQty(parseInt(e.target.value) || 0)}
                  required
                />
                <Input
                  label="Min Alert Level"
                  type="number"
                  min={0}
                  value={minThreshold}
                  onChange={e => setMinThreshold(parseInt(e.target.value) || 0)}
                  required
                />
                <Input
                  label="Max Target Qty"
                  type="number"
                  min={1}
                  value={maxTarget}
                  onChange={e => setMaxTarget(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-grey">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/inventory')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Spare Part' : 'Save Spare Part'}</span>
            </Button>
          </div>
        </Card>
      </form>

      <PickOnMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        currentLocation={location}
        onSelectLocation={loc => setLocation(loc)}
      />
    </div>
  );
};
