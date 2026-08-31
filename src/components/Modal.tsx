import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}

/**
 * Generic centered overlay modal — closes on backdrop click or the close button.
 *
 * Stays mounted (toggled via `hidden`/`flex`, not conditional rendering) so that
 * children owning a live effect — the metronome engine, mic listening — keep
 * running while the modal is closed instead of tearing down with it.
 */
export function Modal({ open, onClose, children, maxWidthClass = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 ${
        open ? 'flex' : 'hidden'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full min-w-0 ${maxWidthClass} animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-2.5 -right-2.5 z-10 p-2 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full shadow-md border border-slate-200 dark:border-slate-700 transition"
        >
          <X size={16} />
        </button>
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
