import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-6 border-b border-grey h-12 ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`h-12 relative flex items-center gap-2 text-sm font-medium transition-colors outline-none select-none ${
              isActive ? 'text-navy font-semibold' : 'text-dim hover:text-navy'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                  isActive ? 'bg-orange text-navy font-bold' : 'bg-grey text-dim'
                }`}
              >
                {tab.count}
              </span>
            )}
            {/* 2px orange underline for active tab */}
            {isActive && (
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-orange" />
            )}
          </button>
        );
      })}
    </div>
  );
};
