import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Search,
  Thermometer,
  List,
  Grid,
  RefreshCw,
  ClipboardList,
  Boxes,
  X,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useInventoryStore } from '../state/useInventoryStore';
import { SparePart } from '../types';

const RACKS = ['Rack A', 'Rack B', 'Rack C', 'Rack D', 'Rack E', 'Rack F'];
const SHELVES = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4'];
const BINS = Array.from({ length: 12 }, (_, i) => `Bin ${String(i + 1).padStart(2, '0')}`);

export const ShelfMapScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { parts } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeRack, setActiveRack] = useState<string>('Rack A');
  const [selectedBinCoord, setSelectedBinCoord] = useState<{
    rack: string;
    shelf: string;
    bin: string;
  } | null>({ rack: 'Rack A', shelf: 'Shelf 1', bin: 'Bin 02' });

  const [heatmapMode, setHeatmapMode] = useState(false);
  const [listViewMode, setListViewMode] = useState(false);
  const [highlightedBin, setHighlightedBin] = useState<string | null>(null);

  const rackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const locateCode = searchParams.get('locate');
    if (locateCode) {
      const match = parts.find(
        p => !p.is_archived && p.part_code.toUpperCase() === locateCode.toUpperCase()
      );
      if (match) {
        setActiveRack(match.location.rack);
        setSelectedBinCoord({
          rack: match.location.rack,
          shelf: match.location.shelf,
          bin: match.location.bin,
        });
        setHighlightedBin(`${match.location.rack}-${match.location.shelf}-${match.location.bin}`);

        setTimeout(() => {
          rackRefs.current[match.location.rack]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    }
  }, [searchParams, parts]);

  const partsInSelectedBin = parts.filter(
    p =>
      !p.is_archived &&
      selectedBinCoord &&
      p.location.rack === selectedBinCoord.rack &&
      p.location.shelf === selectedBinCoord.shelf &&
      p.location.bin === selectedBinCoord.bin
  );

  const handleSearchLocate = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setHighlightedBin(null);
      return;
    }

    const match = parts.find(
      p =>
        !p.is_archived &&
        (p.part_name.toLowerCase().includes(q.toLowerCase()) ||
          p.part_code.toLowerCase().includes(q.toLowerCase()) ||
          p.barcode.includes(q))
    );

    if (match) {
      setActiveRack(match.location.rack);
      setSelectedBinCoord({
        rack: match.location.rack,
        shelf: match.location.shelf,
        bin: match.location.bin,
      });
      const key = `${match.location.rack}-${match.location.shelf}-${match.location.bin}`;
      setHighlightedBin(key);

      rackRefs.current[match.location.rack]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    } else {
      setHighlightedBin(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold text-navy">Shelf Map</h1>
          <p className="text-sm text-dim mt-0.5">
            2D physical warehouse layout: Racks A to F in a 3x2 grid, 4 shelf tiers, 12 bins per tier
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`h-10 px-4 rounded-[8px] border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              heatmapMode
                ? 'bg-orange border-orange text-navy'
                : 'bg-white border-grey text-navy hover:bg-grey'
            }`}
          >
            <Thermometer size={16} strokeWidth={1.5} />
            <span>Heatmap: {heatmapMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setListViewMode(!listViewMode)}
            className={`h-10 px-4 rounded-[8px] border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              listViewMode
                ? 'bg-navy border-navy text-white'
                : 'bg-white border-grey text-navy hover:bg-grey'
            }`}
          >
            {listViewMode ? <Grid size={16} strokeWidth={1.5} /> : <List size={16} strokeWidth={1.5} />}
            <span>{listViewMode ? 'Grid Layout' : 'Accessible List'}</span>
          </button>
        </div>
      </div>

      {/* Locator Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search size={18} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchLocate(e.target.value)}
            placeholder="Type Part Name or Code to Locate... (e.g. SP-077, BP-204, Castrol)"
            className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy text-sm pl-9 pr-4 outline-none focus:border-navy"
          />
          {highlightedBin && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-orange bg-grey-header border border-grey px-2 py-1 rounded-[4px]">
              <MapPin size={13} />
              <span>{highlightedBin.replace(/-/g, ' • ')}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Main Layout: 3x2 Grid of White Cards (Left 8 Cols) + Inspector (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Map Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {listViewMode ? (
            <Card title="Parts Directory by Shelf Allocation">
              <div className="divide-y divide-grey text-sm">
                {parts
                  .filter(p => !p.is_archived)
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() =>
                        setSelectedBinCoord({
                          rack: p.location.rack,
                          shelf: p.location.shelf,
                          bin: p.location.bin,
                        })
                      }
                      className="py-3 flex items-center justify-between cursor-pointer hover:bg-grey-hover px-2 rounded-[4px]"
                    >
                      <div>
                        <span className="code-num font-semibold text-navy">{p.part_code}</span> -{' '}
                        <span>{p.part_name}</span>
                        <span className="text-xs text-dim block">
                          {p.location.rack} • {p.location.shelf} • {p.location.bin}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge
                          status={
                            p.stock_qty <= 0
                              ? 'OUT_OF_STOCK'
                              : p.stock_qty <= p.min_threshold
                              ? 'LOW_STOCK'
                              : 'IN_STOCK'
                          }
                          size="sm"
                        />
                        <span className="code-num font-bold text-xs text-navy block mt-1">
                          {p.stock_qty} Units
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          ) : (
            /* 3 x 2 Grid of White Cards (Section 7, Feature 18) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RACKS.map(rack => (
                <div
                  key={rack}
                  ref={el => (rackRefs.current[rack] = el)}
                  className="bg-white border border-grey rounded-[8px] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-grey">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[4px] bg-navy text-white text-xs font-bold flex items-center justify-center">
                        {rack.replace('Rack ', '')}
                      </div>
                      <h3 className="font-semibold text-base text-navy">{rack}</h3>
                    </div>
                    <span className="text-xs text-dim">
                      {rack === 'Rack A' || rack === 'Rack B'
                        ? 'Zone A'
                        : rack === 'Rack C' || rack === 'Rack D'
                        ? 'Zone B'
                        : 'Zone C'}
                    </span>
                  </div>

                  {/* 4 Shelf Rows x 12 Bins (32px squares, 8px gaps, Section 7) */}
                  <div className="space-y-3">
                    {SHELVES.map(shelf => (
                      <div key={shelf} className="space-y-1">
                        <span className="text-[10px] uppercase font-medium text-dim block">
                          {shelf}
                        </span>

                        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                          {BINS.map(bin => {
                            const binParts = parts.filter(
                              p =>
                                !p.is_archived &&
                                p.location.rack === rack &&
                                p.location.shelf === shelf &&
                                p.location.bin === bin
                            );

                            const hasParts = binParts.length > 0;
                            const hasLow = binParts.some(
                              p => p.stock_qty > 0 && p.stock_qty <= p.min_threshold
                            );
                            const hasDepleted = binParts.some(p => p.stock_qty <= 0);

                            const isSelected =
                              selectedBinCoord?.rack === rack &&
                              selectedBinCoord?.shelf === shelf &&
                              selectedBinCoord?.bin === bin;

                            const isMatch = highlightedBin === `${rack}-${shelf}-${bin}`;

                            // Styling per Section 7:
                            // normal bin = white with grey border, Low = orange fill, Out = black fill with white x
                            let tileClass = 'w-8 h-8 bg-white border border-grey text-navy';
                            if (heatmapMode) {
                              if (hasDepleted) tileClass = 'w-8 h-8 bg-black text-white border-black';
                              else if (hasLow) tileClass = 'w-8 h-8 bg-orange text-navy border-orange font-bold';
                              else if (hasParts) tileClass = 'w-8 h-8 bg-grey-header border-grey text-navy font-bold';
                            } else {
                              if (isSelected) tileClass = 'w-8 h-8 bg-navy text-white border-navy font-bold';
                              else if (hasParts) tileClass = 'w-8 h-8 bg-grey-header border-grey text-navy';
                            }

                            if (isMatch) {
                              tileClass += ' outline outline-2 outline-orange';
                            }

                            return (
                              <button
                                key={bin}
                                type="button"
                                onClick={() =>
                                  setSelectedBinCoord({
                                    rack,
                                    shelf,
                                    bin,
                                  })
                                }
                                className={`rounded-[4px] code-num text-[11px] flex items-center justify-center relative transition-colors ${tileClass}`}
                                title={`${rack} ${shelf} ${bin} (${binParts.length} parts)`}
                              >
                                {bin.replace('Bin ', '')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24">
          <Card
            title="Bin Inspector Panel"
            subtitle={
              selectedBinCoord
                ? `${selectedBinCoord.rack} • ${selectedBinCoord.shelf} • ${selectedBinCoord.bin}`
                : 'Select any bin compartment'
            }
          >
            {selectedBinCoord ? (
              <div className="space-y-4">
                <div className="p-3 bg-grey-header border border-grey rounded-[8px] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-navy block">
                      {selectedBinCoord.rack} - {selectedBinCoord.bin}
                    </span>
                    <span className="text-dim">{selectedBinCoord.shelf}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] bg-white border border-grey code-num font-semibold text-navy">
                    {partsInSelectedBin.length} Allocated Parts
                  </span>
                </div>

                {partsInSelectedBin.length > 0 ? (
                  <div className="space-y-3">
                    {partsInSelectedBin.map(part => (
                      <div
                        key={part.id}
                        className="p-4 bg-white border border-grey border-l-4 border-l-orange rounded-[8px] space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="code-num text-xs font-bold text-orange">
                              {part.part_code}
                            </span>
                            <h4 className="font-semibold text-sm text-navy leading-snug">
                              {part.part_name}
                            </h4>
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
                            size="sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-grey">
                          <div>
                            <span className="text-[10px] uppercase font-medium text-dim block">Stock</span>
                            <span className="code-num font-bold text-navy text-sm">
                              {part.stock_qty} Units
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-medium text-dim block">Price</span>
                            <span className="code-num font-bold text-navy text-sm">
                              Rs. {part.selling_price}
                            </span>
                          </div>
                        </div>

                        {/* Direct Action Buttons (Section 7, Feature 18) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              navigate(`/issue-part?part=${encodeURIComponent(part.part_code)}`)
                            }
                            disabled={part.stock_qty <= 0}
                            className="flex items-center justify-center gap-1.5"
                          >
                            <ClipboardList size={14} />
                            <span>Issue Part</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/inventory?update=${part.id}`)}
                            className="flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={14} strokeWidth={1.5} />
                            <span>Update Stock</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-grey-header border border-grey rounded-[8px] text-center space-y-2">
                    <Boxes size={24} className="mx-auto text-dim" />
                    <p className="text-xs font-semibold text-navy">Empty Bin Slot</p>
                    <p className="text-xs text-dim">
                      No spare parts are assigned to this compartment.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/inventory/add')}
                      className="mt-2"
                    >
                      + Assign Part Here
                    </Button>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                    className="w-full"
                  >
                    Back to Inventory List
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-dim text-center py-6">
                Click any bin square in the racks to inspect stored parts.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
