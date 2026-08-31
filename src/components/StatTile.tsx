import type { ReactNode } from 'react';

type StatTileSize = 'sm' | 'lg';

interface StatTileProps {
  icon: ReactNode;
  /** Full class string for the icon's colored wrapper box (bg/text/border colors). */
  iconColorClass: string;
  label: string;
  value: ReactNode;
  unit?: string;
  size?: StatTileSize;
  /** Override the value's text color, e.g. to highlight it (default: slate). */
  valueColorClass?: string;
}

const WRAPPER_CLASSES: Record<StatTileSize, string> = {
  lg: 'bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex items-center gap-4 shadow-sm',
  sm: 'p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3',
};

const ICON_WRAPPER_CLASSES: Record<StatTileSize, string> = {
  lg: 'p-3.5 rounded-2xl border',
  sm: 'p-2.5 rounded-xl',
};

const LABEL_CLASSES: Record<StatTileSize, string> = {
  lg: 'text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-0.5',
  sm: 'text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block',
};

const VALUE_CLASSES: Record<StatTileSize, string> = {
  lg: 'text-2xl font-extrabold font-mono',
  sm: 'text-sm font-extrabold font-mono',
};

const UNIT_CLASSES: Record<StatTileSize, string> = {
  lg: 'text-xs font-medium text-slate-400 dark:text-slate-500',
  sm: 'text-[10px] text-slate-400 font-normal',
};

/** Icon + label + value tile used on stat/summary screens. */
export function StatTile({
  icon,
  iconColorClass,
  label,
  value,
  unit,
  size = 'lg',
  valueColorClass = 'text-slate-900 dark:text-slate-100',
}: StatTileProps) {
  const ValueTag = size === 'lg' ? 'h4' : 'span';

  return (
    <div className={WRAPPER_CLASSES[size]}>
      <div className={`${ICON_WRAPPER_CLASSES[size]} ${iconColorClass}`}>{icon}</div>
      <div>
        <span className={LABEL_CLASSES[size]}>{label}</span>
        <ValueTag className={`${VALUE_CLASSES[size]} ${valueColorClass}`}>
          {value} {unit && <span className={UNIT_CLASSES[size]}>{unit}</span>}
        </ValueTag>
      </div>
    </div>
  );
}
