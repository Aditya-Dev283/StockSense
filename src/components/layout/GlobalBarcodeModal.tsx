import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, Camera, ArrowRight, Plus, MapPin, ClipboardCheck, Sparkles, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { BarcodeDisplay } from '../common/BarcodeDisplay';
import { useInventoryStore } from '../../state/useInventoryStore';
import { useAuthStore } from '../../state/useAuthStore';
import { SparePart } from '../../types';

interface GlobalBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateDrawer?: (partId: string) => void;
}

export const GlobalBarcodeModal: React.FC<GlobalBarcodeModalProps> = ({
  isOpen,
  onClose,
  onOpenUpdateDrawer,
}) => {
  const { parts, issuePart } = useInventoryStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [scannedCode, setScannedCode] = useState('');
  const [matchedPart, setMatchedPart] = useState<SparePart | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [quickIssueDone, setQuickIssueDone] = useState(false);

  const seededSamples = parts.filter(p => !p.is_archived).slice(0, 8);

  const handleLookup = (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    setScannedCode(clean);
    setHasSearched(true);
    setQuickIssueDone(false);

    const match = parts.find(
      p => !p.is_archived && (p.barcode === clean || p.part_code.toUpperCase() === clean.toUpperCase())
    );
    setMatchedPart(match || null);
  };

  const handleSimulateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (code) {
      handleLookup(code);
    }
  };

  // Keyboard wedge listener (<35ms key stroke speed)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 4 && (!isInput || diff < 35)) {
          handleLookup(buffer);
          buffer = '';
        } else {
          buffer = '';
        }
        return;
      }

      if (e.key.length === 1) {
        if (diff > 50 && buffer.length > 0 && !isInput) {
          buffer = '';
        }
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parts]);

  const handleQuickIssue = async () => {
    if (!matchedPart) return;
    const res = await issuePart({
      partId: matchedPart.id,
      mechanicName: 'Mechanic',
      vehicleJob: 'Quick Counter Issue',
      qty: 1,
      notes: 'Quick barcode issued unit',
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Shopkeeper',
      userRole: currentUser?.role || 'storekeeper',
    });

    if (res.success) {
      setQuickIssueDone(true);
      const updated = parts.find(p => p.id === matchedPart.id);
      if (updated) setMatchedPart({ ...updated, stock_qty: updated.stock_qty - 1 });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode &amp; SKU Scanner"
      subtitle="Point physical barcode wedge, use mobile camera, or simulate demo parts"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Input & Demo Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Manual Code Entry"
            placeholder="Scan or enter barcode / SKU..."
            value={scannedCode}
            onChange={e => setScannedCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup(scannedCode)}
            rightIcon={
              <button
                type="button"
                onClick={() => handleLookup(scannedCode)}
                className="hover:text-orange transition-colors"
                title="Lookup code"
              >
                <ArrowRight size={16} />
              </button>
            }
          />

          <div>
            <label className="text-xs font-medium text-navy block mb-1 flex items-center justify-between">
              <span>Simulate Scan (Demo)</span>
              <Sparkles size={13} className="text-orange" />
            </label>
            <select
              onChange={handleSimulateSelect}
              className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy px-3 text-xs outline-none cursor-pointer focus:border-navy"
              defaultValue=""
            >
              <option value="" disabled>
                -- Pick a seeded demo barcode --
              </option>
              {seededSamples.map(p => (
                <option key={p.id} value={p.barcode}>
                  {p.part_code} - {p.part_name} ({p.barcode})
                </option>
              ))}
              <option value="999000111222">Unrecognized Barcode (New Part Flow)</option>
            </select>
          </div>
        </div>

        {/* Camera Viewfinder Toggle */}
        <div className="p-3 bg-grey-header border border-grey rounded-[8px] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-navy">
            <Camera size={16} className="text-orange" />
            <span>Camera Optical Scanner</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCameraActive(!cameraActive)}
          >
            {cameraActive ? 'Stop Camera' : 'Start Camera Viewfinder'}
          </Button>
        </div>

        {cameraActive && (
          <div className="p-4 bg-white border border-grey rounded-[8px] text-center relative overflow-hidden">
            <div className="h-32 border border-dashed border-orange rounded-[8px] flex flex-col items-center justify-center space-y-2">
              <Scan size={32} className="text-orange animate-pulse" />
              <p className="text-xs text-navy font-semibold">Align barcode within the target frame</p>
              <span className="text-[10px] text-dim">Simulating optical feed (BarcodeDetector ready)</span>
            </div>
          </div>
        )}

        {/* Lookup Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            {matchedPart ? (
              <div className="p-4 bg-white border border-grey rounded-[8px] border-l-4 border-l-orange space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="code-num text-xs font-bold text-orange uppercase block">
                      {matchedPart.part_code}
                    </span>
                    <h4 className="font-semibold text-base text-navy mt-0.5">
                      {matchedPart.part_name}
                    </h4>
                    <p className="text-xs text-dim mt-0.5">{matchedPart.vehicle_model}</p>
                  </div>
                  <Badge
                    status={
                      matchedPart.stock_qty <= 0
                        ? 'OUT_OF_STOCK'
                        : matchedPart.stock_qty <= matchedPart.min_threshold
                        ? 'LOW_STOCK'
                        : 'IN_STOCK'
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-grey text-xs text-navy">
                  <div>
                    <span className="text-dim block text-[10px] uppercase">Current Stock</span>
                    <span className="font-bold text-sm code-num">{matchedPart.stock_qty} Units</span>
                  </div>
                  <div>
                    <span className="text-dim block text-[10px] uppercase">Selling Price</span>
                    <span className="font-bold text-sm code-num">Rs. {matchedPart.selling_price}</span>
                  </div>
                  <div>
                    <span className="text-dim block text-[10px] uppercase">Shelf Location</span>
                    <span className="font-bold text-sm code-num">
                      {matchedPart.location.rack} • {matchedPart.location.bin}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center py-1">
                  <BarcodeDisplay barcode={matchedPart.barcode} width={180} height={36} />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleQuickIssue}
                    disabled={matchedPart.stock_qty <= 0 || quickIssueDone}
                    className="flex items-center justify-center gap-1.5"
                  >
                    {quickIssueDone ? (
                      <>
                        <Check size={14} />
                        <span>Issued 1 Unit!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={14} />
                        <span>Issue 1 Unit</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      if (onOpenUpdateDrawer) {
                        onOpenUpdateDrawer(matchedPart.id);
                      } else {
                        navigate(`/inventory?update=${matchedPart.id}`);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>+ Add Received Stock</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      navigate(`/shelf-map?locate=${matchedPart.part_code}`);
                    }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={14} className="text-orange" />
                    <span>Show on Shelf Map</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-grey-header border border-grey rounded-[8px] text-center space-y-3">
                <p className="text-xs text-navy font-medium">
                  Unrecognized Barcode <code className="code-num font-bold text-orange">"{scannedCode}"</code>.
                  Would you like to register this as a new spare part?
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate(`/inventory/add?barcode=${encodeURIComponent(scannedCode)}`);
                  }}
                  className="flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus size={15} />
                  <span>Register New Part</span>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Modal>
  );
};
