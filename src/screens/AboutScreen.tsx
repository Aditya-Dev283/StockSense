import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle2, Shield, Wrench, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../state/useAuthStore';

export const AboutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const teamMembers = [
    {
      name: 'Yadnesh Sadavarte',
      prn: '202501100006',
      role: 'Project Lead & Architecture',
    },
    {
      name: 'Aditya Bhosale',
      prn: '202501100010',
      role: 'Core Systems & Inventory State',
    },
    {
      name: 'Aditya Ghongde',
      prn: '202501100013',
      role: 'Procurement & Minimalist UI Design',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header Card */}
      <Card className="relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-navy text-orange flex items-center justify-center shrink-0">
              <div className="w-4 h-4 bg-orange rounded-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-navy tracking-tight">
                  StockSense
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-orange/20 text-navy text-[11px] font-bold border border-orange/40">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-text-dim mt-0.5">
                Mechanic Spare Part Inventory &amp; Stock Management System
              </p>
              <p className="text-xs text-navy font-semibold mt-1">
                Software Prototyping &bull; Group 6 &bull; <span className="text-navy font-bold">Team Invictus</span>
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            icon={<ArrowLeft size={15} />}
            className="shrink-0"
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
          </Button>
        </div>
      </Card>

      {/* Purpose & Scope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
            Project Purpose &amp; Problem Solved
          </h2>
          <div className="space-y-3 text-xs text-navy leading-relaxed">
            <p>
              Replaces the traditional, error-prone <strong>handwritten stock register</strong> in
              automotive repair garages and spare parts depots with an elegant, touch-friendly digital
              system.
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-orange shrink-0 mt-0.5" />
                <span>
                  <strong>Eliminates missed manual ledger entries</strong> and transcription mistakes.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-orange shrink-0 mt-0.5" />
                <span>
                  <strong>Fast shelf &amp; bin location tracking:</strong> Instant Zone &rarr; Rack &rarr;
                  Shelf &rarr; Bin lookup.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-orange shrink-0 mt-0.5" />
                <span>
                  <strong>Automated low-stock threshold triggers</strong> that prevent unexpected part stockouts.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-orange shrink-0 mt-0.5" />
                <span>
                  <strong>Cryptographic tamper-evident audit trail</strong> ensuring strict accountability.
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
            Minimalist Proto.io Design System
          </h2>
          <div className="space-y-3 text-xs text-navy leading-relaxed">
            <p>
              Built following an ultra-clean, flat minimalist design spec easily recreatable in Proto.io:
            </p>
            <div className="p-3 bg-[#F2F2F2] border border-grey rounded-lg space-y-1.5 code-num text-[11px]">
              <div className="flex justify-between">
                <span>Card Surface:</span>
                <span className="font-bold">#FFFFFF (1px #E5E5E5 border)</span>
              </div>
              <div className="flex justify-between">
                <span>Primary Accent:</span>
                <span className="font-bold text-navy">#FCA311 (Hover: #E8950F)</span>
              </div>
              <div className="flex justify-between">
                <span>Deep Navy Text / Buttons:</span>
                <span className="font-bold text-navy">#14213D</span>
              </div>
              <div className="flex justify-between">
                <span>Table Header / Row Hover:</span>
                <span className="font-bold">#F2F2F2 / #F7F7F7</span>
              </div>
            </div>
            <p className="text-[11px] text-text-dim">
              Strictly zero neumorphism, 3D, or heavy drop shadows. Standard 8px grid, Inter font alone,
              and tabular numerals for codes and quantities.
            </p>
          </div>
        </Card>
      </div>

      {/* Team Invictus Credits */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
          Team Invictus Credits (Software Prototyping Group 6)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.prn}
              className="p-4 rounded-lg border border-grey bg-[#F2F2F2] text-center space-y-1"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-navy text-orange flex items-center justify-center font-bold text-sm mb-2">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-bold text-sm text-navy">{member.name}</h3>
              <p className="code-num text-xs font-semibold text-text-dim">PRN: {member.prn}</p>
              <span className="text-[11px] text-text-dim block pt-1">{member.role}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Role Access Matrix Summary */}
      <Card className="space-y-3 p-0 overflow-hidden">
        <div className="p-4 border-b border-grey bg-white">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
            Role-Based Security Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="h-10 bg-[#F2F2F2] border-b border-grey text-text-dim font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-3">Access Level</th>
                <th className="py-2.5 px-4">Primary Functions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey text-navy bg-white">
              <tr className="h-12 hover:bg-[#F7F7F7] transition-colors">
                <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                  <Shield size={14} className="text-orange" /> Owner
                </td>
                <td className="py-2.5 px-3 font-medium">Full Administrative</td>
                <td className="py-2.5 px-4 text-text-dim">All 25 modules, Stock valuation, Audit seals, Daily backups</td>
              </tr>
              <tr className="h-12 hover:bg-[#F7F7F7] transition-colors">
                <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                  <Users size={14} className="text-orange" /> Shopkeeper
                </td>
                <td className="py-2.5 px-3 font-medium">Operations &amp; Stock</td>
                <td className="py-2.5 px-4 text-text-dim">Catalog management, Issue parts, Stock updates, Goods receipt</td>
              </tr>
              <tr className="h-12 hover:bg-[#F7F7F7] transition-colors">
                <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                  <Wrench size={14} className="text-orange" /> Mechanic
                </td>
                <td className="py-2.5 px-3 font-medium">Workshop Floor</td>
                <td className="py-2.5 px-4 text-text-dim">Part catalog lookup, Shelf bin locator, Part issuance request</td>
              </tr>
              <tr className="h-12 hover:bg-[#F7F7F7] transition-colors">
                <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                  <Sparkles size={14} className="text-orange" /> Supplier
                </td>
                <td className="py-2.5 px-3 font-medium">Procurement &amp; Orders</td>
                <td className="py-2.5 px-4 text-text-dim">Low-stock alerts, Bulk PO generation, Vendor invoices</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
