import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  RefreshCw,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { SparePart, PartCategory } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { BarcodeDisplay } from '../components/common/BarcodeDisplay';
import { Modal } from '../components/common/Modal';
import { UpdateStockDrawer } from './UpdateStockDrawer';
import { downloadCsv } from '../lib/exportCsv';
import { generatePdfReport } from '../lib/exportPdf';

const CATEGORIES: Array<PartCategory | 'ALL'> = [
  'ALL',
  'Brake Parts',
  'Filters',
  'Electricals',
  'Lubricants',
  'Spark Plugs',
  'Belts',
  'Bearings',
  'Suspension',
];

export const InventoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { parts, transactions, deletePart, searchIndex } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const userRole = currentUser?.role || 'owner';
  const canModify = userRole === 'owner' || userRole === 'storekeeper';
  const canDelete = userRole === 'owner';

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [activeDrawerPart, setActiveDrawerPart] = useState<SparePart | null>(null);
  const [partToDelete, setPartToDelete] = useState<SparePart | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const updateId = searchParams.get('update');
    if (updateId) {
      const match = parts.find(p => p.id === updateId);
      if (match) setActiveDrawerPart(match);
    }
  }, [searchParams, parts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { searchResults, searchLatency } = useMemo(() => {
    const res = searchIndex.search(debouncedQuery, selectedCategory, selectedStatus);
    return {
      searchResults: res.results,
      searchLatency: res.latencyMs,
    };
  }, [searchIndex, debouncedQuery, selectedCategory, selectedStatus, parts]);

  const totalPages = Math.ceil(searchResults.length / pageSize) || 1;
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchResults.slice(start, start + pageSize);
  }, [searchResults, currentPage, pageSize]);

  const filteredValuationCost = useMemo(() => {
    return searchResults.reduce((sum, p) => sum + p.stock_qty * p.cost_price, 0);
  }, [searchResults]);

  const filteredValuationSelling = useMemo(() => {
    return searchResults.reduce((sum, p) => sum + p.stock_qty * p.selling_price, 0);
  }, [searchResults]);

  const handleConfirmDelete = async () => {
    if (!partToDelete) return;
    setDeleting(true);
    await deletePart(
      partToDelete.id,
      currentUser?.name || 'Staff User',
      currentUser?.role || 'owner'
    );
    setDeleting(false);
    setPartToDelete(null);
  };

  const handleExportCsv = () => {
    const headers = [
      'Part Code',
      'Part Name',
      'Barcode',
      'Category',
      'Vehicle Model',
      'Zone',
      'Rack',
      'Shelf',
      'Bin',
      'Cost Price (Rs)',
      'Selling Price (Rs)',
      'Stock Qty',
      'Min Level',
      'Stock Status',
    ];
    const rows = searchResults.map(p => [
      p.part_code,
      p.part_name,
      p.barcode,
      p.category,
      p.vehicle_model,
      p.location.zone,
      p.location.rack,
      p.location.shelf,
      p.location.bin,
      p.cost_price,
      p.selling_price,
      p.stock_qty,
      p.min_threshold,
      p.stock_qty <= 0 ? 'Out of Stock' : p.stock_qty <= p.min_threshold ? 'Low Stock' : 'In Stock',
    ]);
    downloadCsv(`StockSense_Catalog_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportPdf = () => {
    const headers = ['Code', 'Part Name', 'Category', 'Rack - Bin', 'Cost', 'Sell', 'Qty', 'Status'];
    const rows = searchResults.map(p => [
      p.part_code,
      p.part_name,
      p.category,
      `${p.location.rack} ${p.location.bin}`,
      `Rs. ${p.cost_price}`,
      `Rs. ${p.selling_price}`,
      p.stock_qty,
      p.stock_qty <= 0 ? 'Out of Stock' : p.stock_qty <= p.min_threshold ? 'Low Stock' : 'In Stock',
    ]);
    generatePdfReport({
      title: 'Master Spare Part Inventory Report',
      subtitle: `Filtered Catalog: ${searchResults.length} parts • Total Stock Value: Rs. ${filteredValuationSelling.toLocaleString()}`,
      filename: `StockSense_Inventory_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
      summaryText: `Total Units in Stock: ${searchResults.reduce((s, p) => s + p.stock_qty, 0)} | Total Cost: Rs. ${filteredValuationCost.toLocaleString()} | Total Value: Rs. ${filteredValuationSelling.toLocaleString()}`,
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const partsArray = text.split(new RegExp(`(${query.trim()})`, 'gi'));
    return (
      <span>
        {partsArray.map((part, i) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <mark key={i} className="bg-orange/40 text-navy font-semibold px-0.5 rounded-[2px]">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Row (Section 9: title left, primary action right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold text-navy">Inventory</h1>
          <p className="text-sm text-dim mt-0.5">
            Master spare parts catalog, pricing valuation &amp; bin location registry
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" onClick={handleExportCsv} className="flex items-center gap-1.5">
            <FileSpreadsheet size={16} strokeWidth={1.5} />
            <span>Export CSV</span>
          </Button>

          <Button variant="secondary" onClick={handleExportPdf} className="flex items-center gap-1.5">
            <FileText size={16} strokeWidth={1.5} />
            <span>Export PDF</span>
          </Button>

          {canModify && (
            <Button
              variant="primary"
              onClick={() => navigate('/inventory/add')}
              className="flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>+ Add New Spare Part</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row (Section 9) */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main Search Bar */}
          <div className="md:col-span-6 relative">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search part name, code, barcode, vehicle or bin..."
              className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy text-sm pl-9 pr-4 outline-none focus:border-navy"
            />
          </div>

          {/* Category Select */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy text-xs px-3 outline-none cursor-pointer focus:border-navy"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Select */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy text-xs px-3 outline-none cursor-pointer focus:border-navy"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (&gt; Min)</option>
              <option value="LOW_STOCK">Low Stock (≤ Min)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0 Units)</option>
            </select>
          </div>
        </div>

        {/* Metadata & Latency Label */}
        <div className="flex items-center justify-between text-xs text-dim pt-3 mt-3 border-t border-grey">
          <div className="flex items-center space-x-2">
            <span>
              Showing <strong className="text-navy">{searchResults.length}</strong> matching spare parts
            </span>
            <span>•</span>
            <span className="code-num text-navy bg-grey-header border border-grey px-2 py-0.5 rounded-[4px] flex items-center gap-1">
              <Clock size={11} className="text-orange" />
              <span>{searchLatency} ms latency</span>
            </span>
          </div>

          <span className="code-num">
            Valuation: <strong className="text-navy">Rs. {filteredValuationSelling.toLocaleString()}</strong>
          </span>
        </div>
      </Card>

      {/* Master Inventory Table: Header 48 high #F2F2F2, Rows 56 high, 1px border #E5E5E5 (Section 2.4) */}
      <div className="bg-white border border-grey rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="h-12 bg-grey-header text-dim text-xs uppercase font-medium tracking-wider border-b border-grey">
                <th className="px-4 w-10"></th>
                <th className="px-3">Part Code &amp; SKU</th>
                <th className="px-3">Description &amp; Vehicle</th>
                <th className="px-3">Category</th>
                <th className="px-3">Shelf/Bin</th>
                <th className="px-3 text-right">Cost</th>
                <th className="px-3 text-right">Sell Price</th>
                <th className="px-3 text-center">Qty</th>
                <th className="px-3 text-center">Status</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey text-navy">
              {paginatedParts.length > 0 ? (
                paginatedParts.map(part => {
                  const isExpanded = expandedPartId === part.id;
                  const status =
                    part.stock_qty <= 0
                      ? 'OUT_OF_STOCK'
                      : part.stock_qty <= part.min_threshold
                      ? 'LOW_STOCK'
                      : 'IN_STOCK';

                  const partTxns = transactions
                    .filter(t => t.part_id === part.id || t.part_code === part.part_code)
                    .slice(0, 5);

                  return (
                    <React.Fragment key={part.id}>
                      <tr className="h-14 hover:bg-grey-hover transition-colors">
                        <td className="px-4 text-center">
                          <button
                            onClick={() => setExpandedPartId(isExpanded ? null : part.id)}
                            className="w-6 h-6 rounded-[4px] border border-grey bg-white text-dim hover:text-navy flex items-center justify-center"
                            title="Expand transaction history"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>

                        {/* Part Code */}
                        <td className="px-3">
                          <span className="code-num font-semibold text-navy block text-xs">
                            {highlightMatch(part.part_code, debouncedQuery)}
                          </span>
                          <span className="code-num text-[11px] text-dim block">
                            {highlightMatch(part.barcode, debouncedQuery)}
                          </span>
                        </td>

                        {/* Part Name & Vehicle */}
                        <td className="px-3 max-w-xs">
                          <p className="font-medium text-navy text-sm leading-snug">
                            {highlightMatch(part.part_name, debouncedQuery)}
                          </p>
                          <span className="text-xs text-dim block truncate mt-0.5">
                            {highlightMatch(part.vehicle_model, debouncedQuery)}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-3">
                          <span className="px-2 py-0.5 rounded-[4px] bg-grey-header border border-grey text-xs text-navy whitespace-nowrap">
                            {part.category}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 code-num text-xs font-medium">
                            <MapPin size={12} className="text-orange shrink-0" />
                            <span>
                              {part.location.rack} • {part.location.bin}
                            </span>
                          </div>
                          <span className="text-[11px] text-dim pl-4 block">
                            {part.location.shelf}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="px-3 text-right code-num text-xs text-dim">
                          Rs. {part.cost_price}
                        </td>

                        {/* Selling Price */}
                        <td className="px-3 text-right code-num text-xs font-semibold text-navy">
                          Rs. {part.selling_price}
                        </td>

                        {/* Available Qty */}
                        <td className="px-3 text-center">
                          <span className="code-num font-bold text-sm block">
                            {part.stock_qty}
                          </span>
                          <span className="text-[10px] text-dim code-num block">
                            min: {part.min_threshold}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-3 text-center whitespace-nowrap">
                          <Badge status={status} size="sm" />
                        </td>

                        {/* Actions: Icon buttons 40x40 (Section 2.4) */}
                        <td className="px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {canModify && (
                              <button
                                onClick={() => setActiveDrawerPart(part)}
                                className="w-8 h-8 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center transition-colors"
                                title="Update Stock (+ / -)"
                                aria-label="Update Stock"
                              >
                                <RefreshCw size={14} strokeWidth={1.5} />
                              </button>
                            )}

                            {canModify && (
                              <button
                                onClick={() => navigate(`/inventory/edit/${part.id}`)}
                                className="w-8 h-8 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center transition-colors"
                                title="Edit Spare Part Details"
                                aria-label="Edit Spare Part"
                              >
                                <Edit2 size={14} strokeWidth={1.5} />
                              </button>
                            )}

                            <button
                              onClick={() => navigate(`/shelf-map?locate=${part.part_code}`)}
                              className="w-8 h-8 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center transition-colors"
                              title="Locate Bin on Shelf Map"
                              aria-label="Locate on Shelf Map"
                            >
                              <MapPin size={14} strokeWidth={1.5} />
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => setPartToDelete(part)}
                                className="w-8 h-8 rounded-[8px] border border-grey bg-white text-black hover:bg-grey flex items-center justify-center transition-colors"
                                title="Archive Part"
                                aria-label="Delete Part"
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Transaction History & Barcode Specimen */}
                      {isExpanded && (
                        <tr className="bg-grey-header border-y border-grey">
                          <td colSpan={10} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Barcode Graphic */}
                              <div className="bg-white border border-grey rounded-[8px] p-4 flex flex-col items-center justify-center space-y-2">
                                <span className="text-[10px] uppercase font-bold text-dim tracking-wider">
                                  Code-128 Barcode
                                </span>
                                <BarcodeDisplay barcode={part.barcode} width={200} height={42} />
                              </div>

                              {/* Physical Warehouse Allocation */}
                              <div className="bg-white border border-grey rounded-[8px] p-4 space-y-1.5 text-xs">
                                <span className="text-[10px] uppercase font-bold text-dim tracking-wider block">
                                  Storage Allocation
                                </span>
                                <p className="code-num">Zone: <strong>{part.location.zone}</strong></p>
                                <p className="code-num">Rack: <strong>{part.location.rack}</strong></p>
                                <p className="code-num">Shelf: <strong>{part.location.shelf}</strong></p>
                                <p className="code-num">Bin: <strong>{part.location.bin}</strong></p>
                                <p className="code-num">Target Stock: <strong>{part.max_target} Units</strong></p>
                              </div>

                              {/* Recent Stock Movements */}
                              <div className="bg-white border border-grey rounded-[8px] p-4 space-y-2 text-xs">
                                <span className="text-[10px] uppercase font-bold text-dim tracking-wider block">
                                  Recent Movements
                                </span>
                                {partTxns.length > 0 ? (
                                  <div className="space-y-1">
                                    {partTxns.map(t => (
                                      <div
                                        key={t.id}
                                        className="flex items-center justify-between text-[11px] py-1 border-b border-grey"
                                      >
                                        <span className="font-medium text-navy">{t.type} ({t.reference_no})</span>
                                        <span className="code-num font-bold text-navy">
                                          {t.qty_delta > 0 ? `+${t.qty_delta}` : t.qty_delta}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-dim italic">No movements recorded yet.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-dim text-xs">
                    No spare parts matched your search query.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer: Total Valuation */}
            <tfoot>
              <tr className="h-12 bg-grey-header font-bold text-navy border-t border-grey text-xs">
                <td colSpan={5} className="px-4">
                  Valuation Summary ({searchResults.length} Items)
                </td>
                <td className="px-3 text-right code-num">
                  Rs. {filteredValuationCost.toLocaleString()}
                </td>
                <td className="px-3 text-right code-num text-navy">
                  Rs. {filteredValuationSelling.toLocaleString()}
                </td>
                <td className="px-3 text-center code-num">
                  {searchResults.reduce((sum, p) => sum + p.stock_qty, 0)} Units
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-grey flex items-center justify-between text-xs text-navy">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({searchResults.length} items)
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-[8px] border border-grey bg-white disabled:opacity-30 flex items-center justify-center hover:bg-grey"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-[8px] text-xs font-semibold code-num transition-colors ${
                      currentPage === pageNum
                        ? 'bg-orange text-navy font-bold'
                        : 'bg-white border border-grey text-navy hover:bg-grey'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-[8px] border border-grey bg-white disabled:opacity-30 flex items-center justify-center hover:bg-grey"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Drawer */}
      <UpdateStockDrawer
        isOpen={!!activeDrawerPart}
        onClose={() => setActiveDrawerPart(null)}
        part={activeDrawerPart}
      />

      {/* Delete / Archive Confirmation Modal */}
      <Modal
        isOpen={!!partToDelete}
        onClose={() => setPartToDelete(null)}
        title="Confirm Part Removal"
        subtitle="Permanent catalog archiving safety control"
      >
        <div className="space-y-4 text-sm text-navy">
          <p>
            Are you sure you want to remove{' '}
            <strong className="text-black font-semibold">
              {partToDelete?.part_name} ({partToDelete?.part_code})
            </strong>
            ?
          </p>
          <div className="p-3 bg-grey-header border border-grey rounded-[8px] text-xs text-dim leading-relaxed">
            Notice: If this part has historical transactions, it will be safely archived rather than deleted
            to preserve audit ledger integrity.
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-grey">
            <Button variant="secondary" onClick={() => setPartToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Archiving...' : 'Confirm Remove'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
