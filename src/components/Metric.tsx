import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  badge?: React.ReactNode;
  variant?: 'default' | 'compact' | 'highlight';
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  subtext,
  trend,
  badge,
  variant = 'default',
  className = '',
}) => {
  const trendColor = {
    up: 'text-brand-emerald-light',
    down: 'text-brand-rose-light',
    neutral: 'text-text-muted',
  }[trend?.direction || 'neutral'];

  const TrendIcon = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
  }[trend?.direction || 'neutral'];

  if (variant === 'compact') {
    return (
      <div className={`flex items-baseline justify-between py-2 border-b border-border-muted ${className}`}>
        <span className="text-xs text-text-secondary">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-sm font-semibold text-text-primary">{value}</span>
          {unit && <span className="font-mono text-[10px] text-text-muted">{unit}</span>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-5 border border-border-default bg-surface-elevated/80 shadow-subtle ${
        variant === 'highlight' ? 'border-brand-teal-border bg-brand-teal-bg/30' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-medium text-text-muted tracking-wide uppercase">
          {label}
        </span>
        {badge}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold font-mono text-text-primary tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-text-secondary">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-muted/60 text-xs">
        {subtext && <span className="text-text-muted truncate">{subtext}</span>}
        {trend && (
          <div className={`flex items-center gap-0.5 font-mono text-[11px] font-medium ml-auto ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};
