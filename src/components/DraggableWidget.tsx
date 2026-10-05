import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { X, GripHorizontal } from 'lucide-react';

interface DraggableWidgetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
}

export function DraggableWidget({
  open,
  onClose,
  title = 'Pitch Tuner',
  children,
  initialPosition,
}: DraggableWidgetProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  // Calculate default position (top right area of viewport) on mount
  useEffect(() => {
    if (position === null) {
      if (initialPosition) {
        setPosition(initialPosition);
      } else {
        const defaultX = Math.max(16, window.innerWidth - 380);
        const defaultY = 80;
        setPosition({ x: defaultX, y: defaultY });
      }
    }
  }, [position, initialPosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore drags initiated on buttons or inputs
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;

    e.preventDefault();
    setIsDragging(true);
    const currentX = position?.x ?? 0;
    const currentY = position?.y ?? 0;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentX,
      posY: currentY,
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      const dx = moveEv.clientX - dragRef.current.startX;
      const dy = moveEv.clientY - dragRef.current.startY;
      const nextX = Math.max(8, Math.min(window.innerWidth - 100, dragRef.current.posX + dx));
      const nextY = Math.max(8, Math.min(window.innerHeight - 60, dragRef.current.posY + dy));
      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position?.x ?? 20}px`,
        top: `${position?.y ?? 80}px`,
        zIndex: 60,
      }}
      // Stays mounted (toggled via `hidden`, not conditional rendering) so that
      // children owning a live effect - the mic listening in PitchDetector - keep
      // running while the widget is closed instead of tearing down with it.
      hidden={!open}
      className={`w-[360px] max-w-[calc(100vw-24px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden transition-shadow ${
        isDragging ? 'shadow-2xl ring-2 ring-teal-500/50 select-none' : ''
      }`}
    >
      {/* Draggable Title Header Bar */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <GripHorizontal size={16} className="text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            {title}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title="Close Widget"
        >
          <X size={15} />
        </button>
      </div>

      {/* Widget Body */}
      <div className="p-3.5 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  );
}
