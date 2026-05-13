import * as React from 'react';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`ef-card ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--color-border)]">
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'success' | 'warn' | 'danger' | 'info';
}) {
  const tones = {
    default: 'text-[var(--color-text)]',
    success: 'text-[var(--color-success)]',
    warn: 'text-[var(--color-warn)]',
    danger: 'text-[var(--color-danger)]',
    info: 'text-[var(--color-info)]',
  };
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-subtle)]">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${tones[tone]}`}>{value}</div>
      {hint && <div className="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</div>}
    </Card>
  );
}
