interface ErrorBannerProps {
  message: string;
  className?: string;
}

/** Inline rose-toned alert banner for form/load errors. */
export function ErrorBanner({ message, className = '' }: ErrorBannerProps) {
  return (
    <div
      className={`bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl ${className}`}
    >
      ⚠️ {message}
    </div>
  );
}
