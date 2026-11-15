import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { useInventoryStore } from '../state/useInventoryStore';
import { downloadCsv } from '../lib/exportCsv';
import { generatePdfReport } from '../lib/exportPdf';
import { StockTransaction, PartCategory } from '../types';

type ReportType =
  | 'VALUATION_SUMMARY'
  | 'PURCHASE_HISTORY'
  | 'MECHANIC_ISSUES'
  | 'COUNTER_SALES'
  | 'LOW_STOCK_FAST_MOVING';

export const ReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { parts, transactions, issues, suppliers } = useInventoryStore();

  const [reportType, setReportType] = useState<ReportType>('VALUATION_SUMMARY');
  const [dateRange, setDateRange] = useState<'TODAY' | '7_DAYS' | '30_DAYS' | 'ALL'>('30_DAYS');

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    return transactions.filter(t => {
      const tTime = new Date(t.timestamp).getTime();
      if (dateRange === 'TODAY') {
        return now - tTime <= 86400000;
      } else if (dateRange === '7_DAYS') {
        return now - tTime <= 7 * 86400000;
      } else if (dateRange === '30_DAYS') {
        return now - tTime <= 30 * 86400000;
      }
      return true;
    });
  }, [transactions, dateRange]);

  // Specific data slice based on report type
  const reportData = useMemo(() => {
    if (reportType === 'PURCHASE_HISTORY') {
      return filteredTransactions.filter(t => t.type === 'PURCHASE');
    }
    if (reportType === 'MECHANIC_ISSUES') {
      return filteredTransactions.filter(t => t.type === 'ISSUE');
    }
    if (reportType === 'COUNTER_SALES') {
      return filteredTransactions.filter(t => t.type === 'SALE');
    }
    if (reportType === 'LOW_STOCK_FAST_MOVING') {
      return filteredTransactions.filter(t => t.type === 'ISSUE' || t.type === 'SALE');
    }
    return filteredTransactions;
  }, [filteredTransactions, reportType]);

  // Aggregate Category breakdown data for chart
  const categoryChartData = useMemo(() => {
    const map: Record<string, { category: string; value: number; units: number }> = {};
    parts.forEach(p => {
      if (p.is_archived) return;
      if (!map[p.category]) {
        map[p.category] = { category: p.category.slice(0, 10), value: 0, units: 0 };
      }
      map[p.category].value += p.stock_qty * p.selling_price;
      map[p.category].units += p.stock_qty;
    });
    return Object.values(map);
  }, [parts]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['Txn ID', 'Timestamp', 'Part Code', 'Part Name', 'Type', 'Delta Qty', 'Reference', 'Staff User', 'Remarks'];
    const rows = reportData.map(t => [
      t.id,
      t.timestamp,
      t.part_code,
      t.part_name,
      t.type,
      t.qty_delta,
      t.reference_no,
      t.user_name,
      t.remarks,
    ]);
    downloadCsv(`StockSense_Report_${reportType}_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  // Export PDF Handler
  const handleExportPdf = () => {
    const headers = ['Txn ID', 'Date & Time', 'Part Code', 'Action', 'Qty', 'Reference', 'Staff User'];
    const rows = reportData.map(t => [
      t.id,
      new Date(t.timestamp).toLocaleDateString(),
      t.part_code,
      t.type,
      t.qty_delta > 0 ? `+${t.qty_delta}` : t.qty_delta,
      t.reference_no,
      t.user_name,
    ]);
    generatePdfReport({
      title: `StockSense Report: ${reportType.replace(/_/g, ' ')}`,
      subtitle: `Date Range Filter: ${dateRange} • Total Records: ${reportData.length}`,
      filename: `StockSense_${reportType}`,
      headers,
      rows,
      summaryText: `Total Transactions Processed: ${reportData.length} | Verified from Ledger`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Inventory &amp; Stock Reports
          </h1>
          <p className="text-xs text-text-dim mt-1">
            Audit-grade stock valuations, consumption rates, and transaction ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            icon={<FileSpreadsheet size={15} />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            onClick={handleExportPdf}
            icon={<FileText size={15} />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Select
            label="Report Type"
            value={reportType}
            onChange={e => setReportType(e.target.value as ReportType)}
            options={[
              { label: 'Current Stock & Valuation Summary', value: 'VALUATION_SUMMARY' },
              { label: 'Purchase & Restock History', value: 'PURCHASE_HISTORY' },
              { label: 'Mechanic Part Issues', value: 'MECHANIC_ISSUES' },
              { label: 'Direct Counter Sales', value: 'COUNTER_SALES' },
              { label: 'Low-Stock & Velocity Analysis', value: 'LOW_STOCK_FAST_MOVING' },
            ]}
          />

          <Select
            label="Date Horizon"
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            options={[
              { label: 'Today (Last 24 Hours)', value: 'TODAY' },
              { label: 'Last 7 Days', value: '7_DAYS' },
              { label: 'This Month (Last 30 Days)', value: '30_DAYS' },
              { label: 'All-Time Historical Ledger', value: 'ALL' },
            ]}
          />

          <div className="flex items-end">
            <div className="h-10 px-3 bg-[#F2F2F2] border border-grey rounded-lg w-full text-xs text-navy font-semibold flex items-center justify-between">
              <span className="text-text-dim">Matching Records:</span>
              <span className="code-num font-bold text-navy text-sm">{reportData.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Analytics Card */}
      <Card className="space-y-2">
        <div>
          <h2 className="text-sm font-bold text-navy">
            Category Stock Valuation Distribution (Rs.)
          </h2>
          <p className="text-xs text-text-dim">
            Current asset capital locked per automotive spare parts category
          </p>
        </div>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#14213D"
                fontSize={11}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                fontFamily="Inter, sans-serif"
              />
              <YAxis
                stroke="#14213D"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E5E5E5' }}
                fontFamily="Inter, sans-serif"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                  boxShadow: 'none',
                  color: '#14213D',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                }}
                formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, 'Stock Value']}
              />
              <Bar dataKey="value" fill="#14213D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-grey flex items-center justify-between bg-white">
          <h2 className="font-bold text-sm text-navy uppercase tracking-wider">
            Transaction Ledger Entries
          </h2>
          <span className="text-xs text-text-dim">Click reference ID to inspect related slip/challan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="h-12 bg-[#F2F2F2] border-b border-grey text-text-dim font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-3">Date &amp; Time</th>
                <th className="py-3 px-3">Part Code &amp; Item</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3 text-center">Qty Delta</th>
                <th className="py-3 px-3 text-center">Stock Before &rarr; After</th>
                <th className="py-3 px-3">Reference / Bill</th>
                <th className="py-3 px-4">Staff User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey text-navy bg-white">
              {reportData.length > 0 ? (
                reportData.map(txn => {
                  const isPositive = txn.qty_delta > 0;
                  const isIssueRef = txn.reference_no.startsWith('ISS-');

                  return (
                    <tr key={txn.id} className="h-14 hover:bg-[#F7F7F7] transition-colors">
                      <td className="py-3 px-4 code-num font-bold text-navy">
                        {txn.id}
                      </td>

                      <td className="py-3 px-3 text-text-dim code-num text-[11px] whitespace-nowrap">
                        {new Date(txn.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <span className="code-num font-bold text-navy block">{txn.part_code}</span>
                        <span className="text-[11px] text-text-dim font-normal">{txn.part_name}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full border border-grey bg-[#F2F2F2] font-semibold text-[10px] text-navy">
                          {txn.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center code-num font-bold">
                        <span className={isPositive ? 'text-navy font-bold' : 'text-navy font-bold'}>
                          {txn.qty_delta > 0 ? `+${txn.qty_delta}` : txn.qty_delta}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center code-num text-[11px] text-text-dim">
                        {txn.qty_before} &rarr; <strong className="text-navy">{txn.qty_after}</strong>
                      </td>

                      <td className="py-3 px-3">
                        {isIssueRef ? (
                          <button
                            onClick={() => navigate(`/issue-slip/${txn.reference_no}`)}
                            className="code-num font-bold text-orange hover:underline flex items-center gap-1"
                            title="Inspect issue slip"
                          >
                            <span>{txn.reference_no}</span>
                            <ExternalLink size={11} />
                          </button>
                        ) : (
                          <span className="code-num text-text-dim">{txn.reference_no}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium">
                        {txn.user_name}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-text-dim text-xs">
                    No transactions match the selected report type and date horizon.
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
