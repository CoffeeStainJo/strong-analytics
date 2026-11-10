import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExercisePlateauReport } from '../../types/workout';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- Card ---------- */

export const Card: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  children,
  ...rest
}) => (
  <section
    className={cn('rounded-2xl border border-line bg-surface shadow-card', className)}
    {...rest}
  >
    {children}
  </section>
);

interface CardHeaderProps {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between sm:px-6',
      className
    )}
  >
    <div className="min-w-0">
      <h3 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h3>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
    </div>
    {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
  </div>
);

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90',
  secondary: 'border border-line bg-surface text-fg hover:bg-raised',
  ghost: 'text-muted hover:bg-raised hover:text-fg',
  danger: 'border border-bad/30 text-bad hover:bg-bad/10',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3.5 text-sm',
        buttonVariants[variant],
        className
      )}
      {...rest}
    />
  )
);
Button.displayName = 'Button';

/* ---------- Segmented control ---------- */

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
  'aria-label'?: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  ...rest
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={rest['aria-label']}
      className={cn('inline-flex rounded-lg bg-raised p-0.5', className)}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            opt.value === value
              ? 'bg-surface text-fg shadow-card'
              : 'text-muted hover:text-fg'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Badges ---------- */

export type Tone = 'good' | 'warn' | 'bad' | 'accent' | 'neutral';

const toneClasses: Record<Tone, string> = {
  good: 'bg-good/10 text-good',
  warn: 'bg-warn/10 text-warn',
  bad: 'bg-bad/10 text-bad',
  accent: 'bg-accent/10 text-accent',
  neutral: 'bg-raised text-muted',
};

export const toneDot: Record<Tone, string> = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  accent: 'bg-accent',
  neutral: 'bg-faint',
};

export const toneText: Record<Tone, string> = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  accent: 'text-accent',
  neutral: 'text-muted',
};

export const Badge: React.FC<{
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  title?: string;
}> = ({ tone = 'neutral', className, children, title }) => (
  <span
    title={title}
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium',
      toneClasses[tone],
      className
    )}
  >
    {children}
  </span>
);

/** Display label and tone for an exercise's plateau status. */
export function describeStatus(report: ExercisePlateauReport): { label: string; tone: Tone } {
  if (report.isIgnored) return { label: 'Ignored', tone: 'neutral' };
  if (!report.isActive) return { label: 'Dormant', tone: 'neutral' };
  switch (report.status) {
    case 'plateaued':
      return { label: 'Plateaued', tone: 'warn' };
    case 'regressing':
      return { label: 'Regressing', tone: 'bad' };
    case 'progressing':
      return { label: 'Progressing', tone: 'good' };
    default:
      return { label: 'Baseline', tone: 'neutral' };
  }
}

export const StatusBadge: React.FC<{ report: ExercisePlateauReport }> = ({ report }) => {
  const { label, tone } = describeStatus(report);
  return (
    <Badge tone={tone}>
      <span className={cn('h-1.5 w-1.5 rounded-full', toneDot[tone])} />
      {label}
    </Badge>
  );
};

/* ---------- Misc ---------- */

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ icon, title, children, className }) => (
  <div className={cn('px-6 py-10 text-center', className)}>
    {icon && <div className="mx-auto mb-3 flex justify-center text-faint">{icon}</div>}
    <p className="text-sm font-medium text-fg">{title}</p>
    {children && <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">{children}</p>}
  </div>
);

/** Shared tooltip shell for Recharts custom tooltips. */
export const ChartTooltip: React.FC<{ title: React.ReactNode; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] shadow-pop">
    <div className="mb-1 text-xs text-muted">{title}</div>
    <div className="space-y-0.5 tabular-nums">{children}</div>
  </div>
);

/** Colours for SVG chart attributes, resolved from the active theme tokens. */
export const chartColors = {
  accent: 'rgb(var(--accent))',
  good: 'rgb(var(--good))',
  warn: 'rgb(var(--warn))',
  muted: 'rgb(var(--muted))',
  faint: 'rgb(var(--faint))',
  line: 'rgb(var(--line))',
  surface: 'rgb(var(--surface))',
  raised: 'rgb(var(--raised))',
};
