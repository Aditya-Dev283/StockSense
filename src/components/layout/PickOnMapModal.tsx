import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StorageLocation } from '../../types';
import { MapPin, Check } from 'lucide-react';

interface PickOnMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: StorageLocation;
  onSelectLocation: (location: StorageLocation) => void;
}

const RACKS = ['Rack A', 'Rack B', 'Rack C', 'Rack D', 'Rack E', 'Rack F'];
const SHELVES = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4'];
const BINS = Array.from({ length: 12 }, (_, i) => `Bin ${String(i + 1).padStart(2, '0')}`);

export const PickOnMapModal: React.FC<PickOnMapModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [selectedRack, setSelectedRack] = useState<string>(currentLocation?.rack || 'Rack A');
  const [selectedShelf, setSelectedShelf] = useState<string>(currentLocation?.shelf || 'Shelf 1');
  const [selectedBin, setSelectedBin] = useState<string>(currentLocation?.bin || 'Bin 01');

  const zone =
    selectedRack === 'Rack A' || selectedRack === 'Rack B'
      ? 'Zone A'
      : selectedRack === 'Rack C' || selectedRack === 'Rack D'
      ? 'Zone B'
      : 'Zone C';

  const handleConfirm = () => {
    onSelectLocation({
      zone,
      rack: selectedRack,
      shelf: selectedShelf,
      bin: selectedBin,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pick Bin on 2D Store Map"
      subtitle="Click to assign storage zone, rack unit, shelf level and bin tile"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Rack Selector Tabs */}
        <div>
          <span className="text-xs font-semibold text-navy block mb-1.5">Select Storage Rack:</span>
          <div className="grid grid-cols-6 gap-2">
            {RACKS.map(rack => (
              <button
                key={rack}
                type="button"
                onClick={() => setSelectedRack(rack)}
                className={`py-2 text-xs font-semibold rounded-[8px] border transition-colors ${
                  selectedRack === rack
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white border-grey text-navy hover:bg-grey'
                }`}
              >
                {rack}
              </button>
            ))}
          </div>
        </div>

        {/* Shelf Selector */}
        <div>
          <span className="text-xs font-semibold text-navy block mb-1.5">Shelf Level (Vertical Tier):</span>
          <div className="grid grid-cols-4 gap-2">
            {SHELVES.map(shelf => (
              <button
                key={shelf}
                type="button"
                onClick={() => setSelectedShelf(shelf)}
                className={`py-1.5 text-xs font-medium rounded-[8px] border transition-colors ${
                  selectedShelf === shelf
                    ? 'bg-orange text-navy border-orange font-bold'
                    : 'bg-white border-grey text-navy hover:bg-grey'
                }`}
              >
                {shelf}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Bins Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-navy">
              Bin Slots ({selectedRack} • {selectedShelf}):
            </span>
            <span className="text-[11px] code-num text-dim">12 Compartments</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-grey-header p-3 rounded-[8px] border border-grey">
            {BINS.map(bin => {
              const isSelected = selectedBin === bin;
              return (
                <button
                  key={bin}
                  type="button"
                  onClick={() => setSelectedBin(bin)}
                  className={`h-10 rounded-[8px] text-xs code-num font-semibold flex items-center justify-center gap-1 border transition-colors ${
                    isSelected
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white border-grey text-navy hover:border-navy'
                  }`}
                >
                  <span>{bin.replace('Bin ', 'B-')}</span>
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Summary & Confirm */}
        <div className="p-3 bg-white border border-grey rounded-[8px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-orange" />
            <div>
              <p className="text-xs font-bold text-navy">
                Selected: {zone} • {selectedRack} • {selectedShelf} • {selectedBin}
              </p>
              <span className="text-[10px] text-dim">Optimal physical picking location</span>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Confirm Location
          </Button>
        </div>
      </div>
    </Modal>
  );
};
