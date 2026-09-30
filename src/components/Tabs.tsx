import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'pills' | 'underline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-xs sm:text-sm py-2 px-4',
  }[size];

  if (variant === 'underline') {
    return (
      <div className={`border-b border-border-default overflow-x-auto no-scrollbar ${className}`}>
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all duration-200 select-none cursor-pointer ${
                  isActive
                    ? 'border-brand-teal-light text-text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle text-text-muted">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Segmented Pill
  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg bg-[#0D0D0D]/90 border border-border-default backdrop-blur-md overflow-x-auto no-scrollbar max-w-full ${className}`}
    >
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 rounded-md font-medium transition-all duration-200 ease-smooth cursor-pointer select-none ${sizeClasses} ${
                isActive
                  ? 'bg-[#161616] text-[#F5F5F5] border border-border-hover shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-brand-teal-bg text-brand-teal-light border border-brand-teal-border'
                      : 'bg-white/[0.05] text-text-muted'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
