import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import { Modal } from '../components/common/Modal';
import { useSettingsStore } from '../state/useSettingsStore';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';

export const SettingsScreen: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    autoDailyBackup,
    toggleAutoDailyBackup,
    lastBackupTime,
    triggerBackup,
  } = useSettingsStore();

  const {
    parts,
    transactions,
    auditTrail,
    generateDemoParts,
    resetToSeed,
    restoreBackup,
  } = useInventoryStore();

  const { currentUser } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [restoreConfirmData, setRestoreConfirmData] = useState<any | null>(null);

  const activeParts = parts.filter(p => !p.is_archived);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setRestoreConfirmData(json);
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid StockSense backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!restoreConfirmData) return;
    restoreBackup(restoreConfirmData);
    setRestoreConfirmData(null);
  };

  const handleConfirmReset = () => {
    resetToSeed();
    setResetModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">
          System Administration &amp; Reliability Settings
        </h1>
        <p className="text-xs text-text-dim mt-1">
          Automated backups, accessibility profiles, workshop readability, and scalability benchmarks
        </p>
      </div>

      {/* System Capacity & Scale Metrics (Feature 22) */}
      <Card className="space-y-3">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
          Warehouse Database Capacity &amp; Resource Footprint
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-[#F2F2F2] border border-grey rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-semibold block">Active Parts Catalog</span>
            <span className="text-xl font-bold text-navy code-num">
              {activeParts.length} SKUs
            </span>
          </div>

          <div className="p-3 bg-[#F2F2F2] border border-grey rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-semibold block">Storage Locations</span>
            <span className="text-xl font-bold text-navy code-num">
              6 Racks &bull; 288 Bins
            </span>
          </div>

          <div className="p-3 bg-[#F2F2F2] border border-grey rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-semibold block">Ledger Records</span>
            <span className="text-xl font-bold text-navy code-num">
              {transactions.length} Txns
            </span>
          </div>

          <div className="p-3 bg-[#F2F2F2] border border-grey rounded-lg">
            <span className="text-[10px] text-text-dim uppercase font-semibold block">Audit Trail Depth</span>
            <span className="text-xl font-bold text-orange code-num">
              {auditTrail.length} Seals
            </span>
          </div>
        </div>
      </Card>

      {/* Automated Backups & Data Reliability (Feature 21) */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
          Automated Data Backup &amp; Disaster Recovery
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F2F2F2] border border-grey rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-orange" />
                <span className="font-bold text-xs text-navy">Automated Daily Snapshot Status</span>
              </div>
              <p className="text-xs text-text-dim mt-0.5 code-num">
                Last Successful State: <strong className="text-navy">{lastBackupTime}</strong>
              </p>
            </div>
            <Toggle
              checked={autoDailyBackup}
              onChange={toggleAutoDailyBackup}
              label="Scheduled Daily Backups"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-grey rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-navy flex items-center gap-1.5">
                  <Download size={14} className="text-orange" />
                  <span>Instant Standalone Backup</span>
                </h3>
                <p className="text-[11px] text-text-dim leading-relaxed mt-1">
                  Generates a complete, unencrypted JSON snapshot containing all parts, suppliers,
                  transactions, mechanic issues, and the cryptographic audit trail for external safekeeping.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() =>
                  triggerBackup(currentUser?.name || 'Administrator', currentUser?.role || 'owner')
                }
                icon={<Download size={14} />}
                className="w-full mt-3"
              >
                Trigger Instant Backup Now
              </Button>
            </div>

            <div className="p-4 bg-white border border-grey rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-navy flex items-center gap-1.5">
                  <Upload size={14} className="text-orange" />
                  <span>Restore from Snapshot File</span>
                </h3>
                <p className="text-[11px] text-text-dim leading-relaxed mt-1">
                  Load a previously exported StockSense JSON backup file to restore complete inventory,
                  catalog metadata, and ledger history.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload size={14} />}
                className="w-full mt-3"
              >
                Select Backup File (.json)
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Accessibility & Ergonomics (Feature 24) */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
          Accessibility &amp; Workshop Ergonomics
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-[#F2F2F2] border border-grey rounded-lg">
            <div>
              <span className="text-xs font-bold text-navy block">High-Contrast Border Mode</span>
              <span className="text-[11px] text-text-dim">
                Applies high-visibility 2px dark borders around cards and buttons for harsh sunlight workshop environments
              </span>
            </div>
            <Toggle checked={highContrast} onChange={toggleHighContrast} />
          </div>

          <div className="p-3.5 bg-[#F2F2F2] border border-grey rounded-lg space-y-2">
            <div>
              <span className="text-xs font-bold text-navy block">Display Typography Scaling</span>
              <span className="text-[11px] text-text-dim">
                Optimized for viewing from a distance on wall-mounted touch counters
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFontSize('standard')}
                className={`h-10 text-xs font-semibold rounded-lg transition-all border ${
                  fontSize === 'standard'
                    ? 'bg-navy text-white border-navy font-bold'
                    : 'bg-white text-text-dim border-grey hover:text-navy'
                }`}
              >
                Standard Display (100%)
              </button>
              <button
                type="button"
                onClick={() => setFontSize('workshop')}
                className={`h-10 text-xs font-semibold rounded-lg transition-all border ${
                  fontSize === 'workshop'
                    ? 'bg-navy text-white border-navy font-bold'
                    : 'bg-white text-text-dim border-grey hover:text-navy'
                }`}
              >
                Workshop Large Readability (125%)
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* High-Performance Scalability Test (Feature 20) */}
      <Card className="space-y-2">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
          Performance &amp; Scale Benchmark
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-navy flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange" />
              <span>Simulate High-Density Parts Catalog (2,000+ Items)</span>
            </h3>
            <p className="text-xs text-text-dim max-w-xl leading-relaxed">
              Generate 2,000 synthetic automotive spare parts distributed across all 6 warehouse racks
              to test sub-50ms token search response times and table pagination.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => generateDemoParts(2000)}
            className="shrink-0"
          >
            Generate 2,000 Demo Parts
          </Button>
        </div>
      </Card>

      {/* Dangerous Action: Reset Database */}
      <Card className="border-l-4 border-l-black">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-black">
              Reset Application to Official Seed Baseline
            </h3>
            <p className="text-xs text-text-dim">
              Clears current local storage state and restores the original 40+ seeded automotive parts,
              users, suppliers, and transactions.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setResetModalOpen(true)}
            icon={<RotateCcw size={14} />}
            className="shrink-0"
          >
            Reset to Seed Data
          </Button>
        </div>
      </Card>

      {/* Confirm Restore Snapshot Modal */}
      <Modal
        isOpen={!!restoreConfirmData}
        onClose={() => setRestoreConfirmData(null)}
        title="Confirm Backup Restoration"
        subtitle="Overwrite existing local inventory state"
      >
        <div className="space-y-4 text-xs text-navy">
          <p className="leading-relaxed">
            You are about to restore a StockSense backup snapshot generated on:{' '}
            <strong className="text-navy">{restoreConfirmData?.exported_at || 'Recent date'}</strong> by{' '}
            <strong>{restoreConfirmData?.exported_by || 'Staff'}</strong>.
          </p>

          <div className="p-3 bg-[#F2F2F2] border border-grey rounded-lg space-y-1 code-num text-[11px]">
            <p>Parts in Snapshot: {restoreConfirmData?.parts?.length || 0}</p>
            <p>Ledger Transactions: {restoreConfirmData?.transactions?.length || 0}</p>
            <p>Audit Events: {restoreConfirmData?.auditTrail?.length || 0}</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-grey">
            <Button variant="secondary" onClick={() => setRestoreConfirmData(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmRestore}>
              Confirm &amp; Overwrite State
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Reset to Seed Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm System Reset"
        subtitle="Reset to default seed data"
      >
        <div className="space-y-4 text-xs text-navy">
          <p>
            Are you sure you want to reset all inventory records, custom parts, and logs back to the
            official Team Invictus seed baseline?
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-grey">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
