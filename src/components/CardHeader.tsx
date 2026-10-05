import type { ReactNode } from 'react';

interface CardHeaderProps {
  icon: ReactNode;
  /** Full class string for the icon's wrapper box (bg/text/border colors). */
  iconColorClass?: string;
  title: string;
  subtitle: string;
}

/** Icon-badge + title/subtitle heading used at the top of feature cards. */
export function CardHeader({
  icon,
  iconColorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  title,
  subtitle,
}: CardHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`p-2.5 rounded-xl ${iconColorClass}`}>{icon}</div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
