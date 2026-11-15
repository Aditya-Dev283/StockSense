import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Toggle } from '../components/common/Toggle';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Tabs } from '../components/common/Tabs';
import { KpiCard } from '../components/common/KpiCard';
import { Wrench, Check, AlertTriangle, X, Search, Bell, MapPin } from 'lucide-react';

export const DesignSystemScreen: React.FC = () => {
  const [toggleState, setToggleState] = useState(true);
  const [activeTab, setActiveTab] = useState('tab-1');

  return (
    <div className="max-w-[1136px] mx-auto space-y-8 py-4">
      {/* Title */}
      <div>
        <h1 className="text-[28px] leading-[36px] font-bold text-navy">
          StockSense Design System Specimen
        </h1>
        <p className="text-sm text-dim mt-1">
          Minimalist, flat, Proto.io-friendly component inventory across all interactive states
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <Card title="1. Color Palette Tokens (Section 2.1)">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="border border-grey rounded-[8px] p-3 space-y-2">
            <div className="h-12 bg-white border border-grey rounded-[4px]"></div>
            <div>
              <p className="text-xs font-bold text-navy">--white</p>
              <p className="code-num text-[11px] text-dim">#FFFFFF</p>
              <span className="text-[10px] text-dim">Page &amp; Cards</span>
            </div>
          </div>

          <div className="border border-grey rounded-[8px] p-3 space-y-2">
            <div className="h-12 bg-grey rounded-[4px]"></div>
            <div>
              <p className="text-xs font-bold text-navy">--grey</p>
              <p className="code-num text-[11px] text-dim">#E5E5E5</p>
              <span className="text-[10px] text-dim">Borders &amp; Dividers</span>
            </div>
          </div>

          <div className="border border-grey rounded-[8px] p-3 space-y-2">
            <div className="h-12 bg-grey-header border border-grey rounded-[4px]"></div>
            <div>
              <p className="text-xs font-bold text-navy">--grey-header</p>
              <p className="code-num text-[11px] text-dim">#F2F2F2</p>
              <span className="text-[10px] text-dim">Table Header</span>
            </div>
          </div>

          <div className="border border-grey rounded-[8px] p-3 space-y-2">
            <div className="h-12 bg-orange rounded-[4px]"></div>
            <div>
              <p className="text-xs font-bold text-navy">--orange</p>
              <p className="code-num text-[11px] text-dim">#FCA311</p>
              <span className="text-[10px] text-dim">Single Accent</span>
            </div>
          </div>

          <div className="border border-grey rounded-[8px] p-3 space-y-2">
            <div className="h-12 bg-navy rounded-[4px]"></div>
            <div>
              <p className="text-xs font-bold text-navy">--navy</p>
              <p className="code-num text-[11px] text-dim">#14213D</p>
              <span className="text-[10px] text-dim">Text &amp; Headings</span>
            </div>
          </div>

          <div className="border border-grey rounded-[8px] p-3 space-y-2">
            <div className="h-12 bg-black rounded-[4px]"></div>
            <div>
              <p className="text-xs font-bold text-navy">--black</p>
              <p className="code-num text-[11px] text-dim">#000000</p>
              <span className="text-[10px] text-dim">Out of Stock Badge</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Typography Specimen */}
      <Card title="2. Typography Specimen (Inter Only, Section 2.2)">
        <div className="space-y-4">
          <div className="pb-3 border-b border-grey">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim block">
              Page Title • 28px / 36px line-height • 700 bold
            </span>
            <p className="text-[28px] leading-[36px] font-bold text-navy">
              Spare Part Inventory Management
            </p>
          </div>

          <div className="pb-3 border-b border-grey">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim block">
              Section Title • 20px / 28px line-height • 600 semibold
            </span>
            <p className="text-[20px] leading-[28px] font-semibold text-navy">
              Warehouse Storage Racks &amp; Fast-Moving Components
            </p>
          </div>

          <div className="pb-3 border-b border-grey">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim block">
              Card Title • 16px / 24px line-height • 600 semibold
            </span>
            <p className="text-[16px] leading-[24px] font-semibold text-navy">
              Front Disc Brake Pad Set (Ceramic Premium)
            </p>
          </div>

          <div className="pb-3 border-b border-grey">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim block">
              Body Text • 14px / 20px line-height • 400 regular
            </span>
            <p className="text-[14px] leading-[20px] text-navy">
              Automotive workshop counter replacement for handwritten paper logs. Tracks shelf bin
              locations, supplier order dispatches, and mechanic checkout vouchers.
            </p>
          </div>

          <div className="pb-3 border-b border-grey">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim block">
              Part Codes &amp; Barcodes • Tabular Nums • 0.02em letter spacing
            </span>
            <p className="code-num text-[14px] text-navy font-medium">
              SKU: BP-204 • BARCODE: 8901234500204 • BIN: RACK A - BIN 02
            </p>
          </div>

          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim block">
              KPI Number • 32px / 40px line-height • 700 bold
            </span>
            <p className="text-[32px] leading-[40px] font-bold text-navy code-num">
              Rs. 1,48,250
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Buttons Component Matrix */}
      <Card title="3. Buttons Component Matrix (Section 2.4)">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Primary Button */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-navy block">Primary Button (Fill #FCA311)</span>
            <div className="space-y-2">
              <Button variant="primary">Default State</Button>
              <Button variant="primary" disabled>
                Disabled State
              </Button>
            </div>
          </div>

          {/* Secondary Button */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-navy block">Secondary (White / 1px Navy)</span>
            <div className="space-y-2">
              <Button variant="secondary">Default State</Button>
              <Button variant="secondary" disabled>
                Disabled State
              </Button>
            </div>
          </div>

          {/* Danger Button */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-navy block">Danger (#000000 Fill)</span>
            <div className="space-y-2">
              <Button variant="danger">Remove Part</Button>
              <Button variant="danger" disabled>
                Disabled
              </Button>
            </div>
          </div>

          {/* Icon Button */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-navy block">Icon Button (40x40, Radius 8)</span>
            <div className="flex items-center space-x-2">
              <Button variant="icon">
                <Search size={20} strokeWidth={1.5} />
              </Button>
              <Button variant="icon">
                <Bell size={20} strokeWidth={1.5} />
              </Button>
              <Button variant="icon" disabled>
                <MapPin size={20} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Form Controls Matrix */}
      <Card title="4. Form Inputs &amp; Controls (Height 40, Radius 8, 1px #E5E5E5)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Default Text Input" placeholder="Placeholder text in #5B6478..." />
          <Input
            label="Input with Left Icon"
            placeholder="Search parts catalog..."
            leftIcon={<Search size={16} strokeWidth={1.5} />}
          />
          <Input label="Input with Error State" value="Invalid SKU" error="Part code already exists" />

          <Select
            label="Select Dropdown"
            options={[
              { label: 'Brake Parts', value: 'Brake Parts' },
              { label: 'Filters', value: 'Filters' },
              { label: 'Lubricants', value: 'Lubricants' },
            ]}
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-navy block">Toggle Switch (40x24)</label>
            <Toggle
              checked={toggleState}
              onChange={setToggleState}
              label={toggleState ? 'Automated Backups: Active' : 'Automated Backups: Inactive'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-navy block">Progress Bar (Height 8, Radius 4)</label>
            <ProgressBar percent={65} />
            <span className="text-[11px] code-num text-dim block">Capacity: 65% allocated</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-grey">
          <Textarea label="Textarea (Min Height 96, Radius 8)" placeholder="Remarks or audit reason..." />
        </div>
      </Card>

      {/* 5. Status Badges Specimen */}
      <Card title="5. Status Badges (Pill Shape 999px, Always Icon + Label)">
        <div className="flex items-center space-x-4">
          <div>
            <Badge status="IN_STOCK" label="In Stock" />
            <span className="text-[10px] text-dim block mt-1">1px navy border, white fill</span>
          </div>

          <div>
            <Badge status="LOW_STOCK" label="Low Stock" />
            <span className="text-[10px] text-dim block mt-1">Orange fill, navy text</span>
          </div>

          <div>
            <Badge status="OUT_OF_STOCK" label="Out of Stock" />
            <span className="text-[10px] text-dim block mt-1">Black fill, white text</span>
          </div>
        </div>
      </Card>

      {/* 6. Tabs Specimen */}
      <Card title="6. Text Tabs (Height 48, 2px Orange Underline)">
        <Tabs
          tabs={[
            { id: 'tab-1', label: 'All Purchase Orders', count: 12 },
            { id: 'tab-2', label: 'Draft Orders', count: 3 },
            { id: 'tab-3', label: 'Delivered & Verified', count: 9 },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </Card>

      {/* 7. KPI Cards */}
      <Card title="7. KPI Cards (White Fill, 1px Border, 32px Bold Number)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Total Unique Spare Parts"
            value="42 SKUs"
            percent={70}
            sublabel="Catalog capacity: 70%"
            icon={<Wrench size={20} strokeWidth={1.5} />}
          />
          <KpiCard
            label="Low-Stock Alert Items"
            value="5 Parts"
            percent={12}
            sublabel="Below safety minimum buffer"
            icon={<AlertTriangle size={20} strokeWidth={1.5} className="text-orange" />}
          />
          <KpiCard
            label="Parts Issued Today"
            value="18 Units"
            percent={90}
            sublabel="Dispatched to workshop mechanics"
            icon={<Check size={20} strokeWidth={1.5} />}
          />
        </div>
      </Card>
    </div>
  );
};
