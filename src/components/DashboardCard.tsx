import React from 'react';
import { StatusBadge, type OperationalStatus } from './StatusBadge';

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  category?: string;
  status?: OperationalStatus;
  statusLabel?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  category,
  status,
  statusLabel,
  actions,
  footer,
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-border-default bg-surface-card backdrop-blur-xl shadow-card overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header Bar */}
      <div className="px-5 sm:px-6 py-4 border-b border-border-default bg-surface-elevated/60 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {category && (
            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-teal-light mb-0.5">
              {category}
            </div>
          )}
          <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {status && <StatusBadge status={status} label={statusLabel} size="sm" />}
          {actions}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 flex-1">{children}</div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="px-5 sm:px-6 py-3 border-t border-border-muted bg-surface-base/40 text-xs text-text-muted flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
