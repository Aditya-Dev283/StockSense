import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  AlertTriangle,
  ClipboardList,
  Truck,
  Plus,
  ScanLine,
  MapPin,
  ChevronRight,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { KpiCard } from '../components/common/KpiCard';
import { CoachMark } from '../components/layout/CoachMark';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { parts, issues, orders, transactions } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const userRole = currentUser?.role || 'owner';

  const activeParts = parts.filter(p => !p.is_archived);
  const totalUniqueParts = activeParts.length;

  const lowStockParts = activeParts.filter(p => p.stock_qty <= p.min_threshold);
  const outOfStockParts = activeParts.filter(p => p.stock_qty <= 0);
  const lowStockCount = lowStockParts.length;

  // Issues today
  const todayStr = new Date().toISOString().split('T')[0];
  const issuesToday = issues.filter(i => i.timestamp.startsWith(todayStr));
  const partsIssuedTodayCount = issuesToday.reduce((sum, i) => sum + i.qty, 0);

  // Pending deliveries
  const pendingOrders = orders.filter(o => o.status === 'ORDERED' || o.status === 'DRAFT');
  const pendingDeliveriesCount = pendingOrders.length;

  // Total valuation (for Owner)
  const totalValuationSelling = activeParts.reduce((sum, p) => sum + p.stock_qty * p.selling_price, 0);
  const totalValuationCost = activeParts.reduce((sum, p) => sum + p.stock_qty * p.cost_price, 0);
  const potentialProfit = totalValuationSelling - totalValuationCost;

  // 7-day chart data (Issues vs Purchases)
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayKey = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });

    const dayIssues = transactions
      .filter(t => t.timestamp.startsWith(dayKey) && (t.type === 'ISSUE' || t.type === 'SALE'))
      .reduce((sum, t) => sum + Math.abs(t.qty_delta), 0);

    const dayPurchases = transactions
      .filter(t => t.timestamp.startsWith(dayKey) && t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Math.abs(t.qty_delta), 0);

    return {
      day: dayLabel,
      Issued: dayIssues,
      Purchased: dayPurchases,
    };
  });

  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page Title Row (Section 2.5: Title left, primary action right, 32px below top bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold text-navy">
            Store Operations Dashboard
          </h1>
          <p className="text-sm text-dim mt-0.5">
            Signed in as <strong className="text-navy">{currentUser?.name}</strong> • Role:{' '}
            <span className="font-semibold text-orange capitalize">{userRole}</span>
          </p>
        </div>

        {userRole !== 'mechanic' && (
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/add')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>+ Add Spare Part</span>
          </Button>
        )}
      </div>

      <CoachMark
        title="Proto.io Ready Minimalist UI"
        message="Built strictly on an 8px grid with flat cards, 1px grey borders, and standard component sizes for seamless Proto.io scene authoring."
      />

      {/* Row 1: Four KPI Cards (3 columns each of the 12, Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label="Total Unique Spare Parts"
          value={totalUniqueParts}
          percent={Math.min(100, Math.round((totalUniqueParts / 100) * 100))}
          sublabel="Master catalog SKUs"
          icon={<Boxes size={20} strokeWidth={1.5} />}
          onClick={() => navigate('/inventory')}
        />

        <KpiCard
          label="Low-Stock Alert Items"
          value={lowStockCount}
          percent={totalUniqueParts > 0 ? Math.round((lowStockCount / totalUniqueParts) * 100) : 0}
          sublabel={`${outOfStockParts.length} completely depleted`}
          icon={<AlertTriangle size={20} strokeWidth={1.5} className="text-orange" />}
          onClick={() => navigate('/alerts')}
        />

        <KpiCard
          label="Parts Issued Today"
          value={partsIssuedTodayCount}
          percent={Math.min(100, partsIssuedTodayCount * 10)}
          sublabel={`${issuesToday.length} job slips generated`}
          icon={<ClipboardList size={20} strokeWidth={1.5} />}
          onClick={() => navigate('/issue-part')}
        />

        <KpiCard
          label="Pending Deliveries"
          value={pendingDeliveriesCount}
          percent={Math.min(100, pendingDeliveriesCount * 25)}
          sublabel="POs in pipeline / ordered"
          icon={<Truck size={20} strokeWidth={1.5} />}
          onClick={() => navigate('/procurement/orders')}
        />
      </div>

      {/* Owner Financial Valuation Card */}
      {userRole === 'owner' && (
        <Card className="border-l-4 border-l-navy bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dim block">
                Executive Inventory Valuation
              </span>
              <p className="text-2xl font-bold text-navy code-num mt-1">
                Rs. {totalValuationSelling.toLocaleString()}
              </p>
              <p className="text-xs text-dim mt-0.5 code-num">
                Cost Basis: Rs. {totalValuationCost.toLocaleString()} • Margin: Rs.{' '}
                {potentialProfit.toLocaleString()} ({totalValuationCost > 0 ? Math.round((potentialProfit / totalValuationCost) * 100) : 0}%)
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/reports')}>
              <span>Detailed Valuation Report</span>
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Mechanic Quick Search Bar */}
      {userRole === 'mechanic' && (
        <Card title="Quick Part &amp; Bin Finder">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
              <input
                type="text"
                placeholder="Type part name (e.g. Brake pad, Spark plug, 5W-30) to see shelf bin..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    navigate(`/inventory?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                  }
                }}
                className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy text-sm pl-9 pr-4 outline-none focus:border-navy"
              />
            </div>
            <Button variant="primary" onClick={() => navigate('/issue-part')}>
              Request Part Issue
            </Button>
          </div>
        </Card>
      )}

      {/* Row 2: Quick Action Buttons (Section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/inventory/add')}
          className="h-12 flex items-center justify-center gap-2"
        >
          <Plus size={18} className="text-orange" />
          <span>+ Add Spare Part</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/issue-part')}
          className="h-12 flex items-center justify-center gap-2"
        >
          <ClipboardList size={18} className="text-navy" />
          <span>Issue Part to Mechanic</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/shelf-map')}
          className="h-12 flex items-center justify-center gap-2"
        >
          <MapPin size={18} className="text-orange" />
          <span>Open Shelf Map</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/procurement/orders')}
          className="h-12 flex items-center justify-center gap-2"
        >
          <Truck size={18} className="text-navy" />
          <span>Purchase Orders</span>
        </Button>
      </div>

      {/* Row 3: Left 8 cols Recent Activity (10 items), Right 4 cols Flat Bar Chart (Section 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 cols: Recent Activity */}
        <div className="lg:col-span-8">
          <Card
            title="Recent Activity"
            subtitle="Last 10 stock transactions recorded"
            action={
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-navy hover:text-orange"
              >
                View Full Catalog
              </button>
            }
          >
            <div className="divide-y divide-grey">
              {recentTransactions.map(txn => {
                const isPositive = txn.qty_delta > 0;
                return (
                  <div
                    key={txn.id}
                    className="py-3 flex items-center justify-between text-sm hover:bg-grey-hover px-2 rounded-[4px] transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 rounded-[8px] bg-grey-header border border-grey flex items-center justify-center shrink-0">
                        {isPositive ? (
                          <ArrowDownRight size={16} className="text-orange" />
                        ) : (
                          <ArrowUpRight size={16} className="text-navy" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-navy text-sm truncate">{txn.part_name}</p>
                        <span className="text-xs text-dim code-num">
                          {txn.part_code} • {txn.type} • {txn.reference_no}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="code-num font-bold text-sm text-navy">
                        {txn.qty_delta > 0 ? `+${txn.qty_delta}` : txn.qty_delta}
                      </span>
                      <span className="text-[10px] text-dim block code-num">
                        {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right 4 cols: Flat Bar Chart (Navy & Orange Only, Section 4.6 & Section 9) */}
        <div className="lg:col-span-4">
          <Card
            title="7-Day Velocity"
            subtitle="Issued vs Restocked"
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDays} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis
                    dataKey="day"
                    stroke="#5B6478"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <YAxis
                    stroke="#5B6478"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E5E5E5',
                      boxShadow: '0 8px 24px rgba(20,33,61,0.12)',
                      color: '#14213D',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Issued" fill="#14213D" name="Units Issued" />
                  <Bar dataKey="Purchased" fill="#FCA311" name="Units Restocked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-grey text-xs text-dim">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-navy rounded-[2px]" /> Issued
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-orange rounded-[2px]" /> Restocked
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
