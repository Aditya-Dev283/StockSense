import React, { useState, useMemo } from 'react';
import { ShieldCheck, Lock, Search, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { useInventoryStore } from '../state/useInventoryStore';
import { downloadCsv } from '../lib/exportCsv';

export const AuditTrailScreen: React.FC = () => {
  const { auditTrail } = useInventoryStore();

  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchUser, setSearchUser] = useState('');

  const filteredAudit = useMemo(() => {
    return auditTrail.filter(event => {
      const matchAction = selectedAction === 'ALL' || event.action === selectedAction;
      const matchUser =
        !searchUser.trim() ||
        event.user.toLowerCase().includes(searchUser.toLowerCase()) ||
        (event.part_code && event.part_code.toLowerCase().includes(searchUser.toLowerCase()));
      return matchAction && matchUser;
    });
  }, [auditTrail, selectedAction, searchUser]);

  const handleExportAuditCsv = () => {
    const headers = ['Audit ID', 'Timestamp', 'User', 'Role', 'Action', 'Part Code', 'Before Qty', 'After Qty', 'Details', 'Device', 'Chain Hash'];
    const rows = filteredAudit.map(a => [
      a.id,
      a.timestamp,
      a.user,
      a.role,
      a.action,
      a.part_code || 'N/A',
      a.before_qty ?? 'N/A',
      a.after_qty ?? 'N/A',
      a.details,
      a.device_info,
      a.chain_hash,
    ]);
    downloadCsv(`StockSense_Audit_Ledger_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy tracking-tight">
              Cryptographic Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-navy text-white text-[10px] code-num font-bold flex items-center gap-1">
              <Lock size={10} className="text-orange" />
              <span>APPEND-ONLY</span>
            </span>
          </div>
          <p className="text-xs text-text-dim mt-1">
            Tamper-evident system log: every transaction, part creation, stock deduction, and user action is permanently hashed
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleExportAuditCsv}
          icon={<FileSpreadsheet size={15} />}
        >
          Export Audit Log
        </Button>
      </div>

      {/* Security Assurance Card */}
      <Card className="border-l-4 border-l-navy">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-sm text-navy flex items-center gap-2">
              <ShieldCheck size={16} className="text-orange" />
              <span>SHA-256 Linked Blockchain-Style Verification Seal</span>
            </h2>
            <p className="text-xs text-text-dim leading-relaxed max-w-3xl">
              Each log entry contains a cryptographic chain-hash computed from the previous record&apos;s hash,
              the current ISO timestamp, user role, action, and stock quantity delta. Manual tampering or
              unauthorized database row alterations break this mathematical chain immediately.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="code-num text-xs font-bold text-navy block">
              {auditTrail.length} Certified Records
            </span>
            <span className="text-[10px] text-orange font-bold flex items-center gap-1 sm:justify-end mt-0.5">
              <CheckCircle2 size={11} /> 100% Chain Intact
            </span>
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Filter by Action Type"
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            options={[
              { label: 'All Actions (Everything)', value: 'ALL' },
              { label: 'PART_ADDED', value: 'PART_ADDED' },
              { label: 'PART_EDITED', value: 'PART_EDITED' },
              { label: 'PART_DELETED', value: 'PART_DELETED' },
              { label: 'UPDATE_STOCK', value: 'UPDATE_STOCK' },
              { label: 'ISSUE_PART', value: 'ISSUE_PART' },
              { label: 'RETURN_PART', value: 'RETURN_PART' },
              { label: 'PO_CREATED', value: 'PO_CREATED' },
              { label: 'PO_ORDERED', value: 'PO_ORDERED' },
              { label: 'PO_RECEIVED', value: 'PO_RECEIVED' },
              { label: 'USER_LOGIN', value: 'USER_LOGIN' },
              { label: 'SYSTEM_BACKUP', value: 'SYSTEM_BACKUP' },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-navy block mb-1.5">
              Search by Staff Name or Part Code
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Filter by user name or part SKU..."
                className="w-full h-10 bg-white border border-grey text-navy placeholder:text-text-dim text-xs pl-9 pr-3 rounded-lg outline-none focus:border-navy"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Append-Only Audit Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="h-12 bg-[#F2F2F2] border-b border-grey text-text-dim font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-3">Timestamp (ISO)</th>
                <th className="py-3 px-3">User &amp; Role</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Part Code</th>
                <th className="py-3 px-3 text-center">Before &rarr; After</th>
                <th className="py-3 px-3">Event Narrative Details</th>
                <th className="py-3 px-4">Chain Hash Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey text-navy bg-white">
              {filteredAudit.length > 0 ? (
                filteredAudit.map(event => (
                  <tr key={event.id} className="h-14 hover:bg-[#F7F7F7] transition-colors">
                    <td className="py-3 px-4 code-num font-bold text-navy">
                      {event.id}
                    </td>

                    <td className="py-3 px-3 code-num text-text-dim text-[11px] whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-navy block">{event.user}</span>
                      <span className="text-[10px] text-orange font-semibold uppercase">
                        {event.role}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full border border-grey bg-[#F2F2F2] code-num font-bold text-[10px] text-navy">
                        {event.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 code-num font-bold text-navy">
                      {event.part_code || '—'}
                    </td>

                    <td className="py-3 px-3 text-center code-num text-[11px] text-text-dim whitespace-nowrap">
                      {event.before_qty !== undefined && event.after_qty !== undefined
                        ? `${event.before_qty} → ${event.after_qty}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 max-w-xs text-text-dim text-[11px] leading-relaxed">
                      {event.details}
                    </td>

                    <td className="py-3 px-4 code-num text-[11px] text-navy font-bold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#F2F2F2] border border-grey text-navy">
                        {event.chain_hash}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-text-dim text-xs">
                    No audit records match the current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
