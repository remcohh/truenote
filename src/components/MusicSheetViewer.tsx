import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { buildBeatStepMap } from '../utils/beatMapGenerator';
import { buildNoteTimeline, type NoteTimelineEntry } from '../utils/noteTimelineGenerator';
import { getCurrentTargetPitch } from '../utils/noteParser';

interface MusicSheetViewerProps {
  xmlData: string;
  zoom: number;
  transpose: number;
  onZoomChange: (zoom: number) => void;
  onTransposeChange: (transpose: number) => void;
  isPlaying: boolean;
  bpm: number;
  stepTrigger?: number;
  onCurrentNoteChange?: (noteName: string | null) => void;
  onExerciseFinished?: () => void;
  onTimeSignatureDetected?: (beatsPerMeasure: number) => void;
  onTotalBeatsDetected?: (totalBeats: number) => void;
  onNoteTimelineBuilt?: (timeline: NoteTimelineEntry[]) => void;
}

export const MusicSheetViewer: React.FC<MusicSheetViewerProps> = ({
  xmlData,
  zoom,
  transpose,
  onZoomChange,
  onTransposeChange,
  isPlaying,
  bpm,
  stepTrigger,
  onCurrentNoteChange,
  onExerciseFinished,
  onTimeSignatureDetected,
  onTotalBeatsDetected,
  onNoteTimelineBuilt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cursorVisible, setCursorVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const sheetWrapperRef = useRef<HTMLDivElement>(null);

  const beatStepMapRef = useRef<number[]>([]);
  const currentStepRef = useRef<number>(0);

  const styleCursorElement = () => {
    const cursor = osmdRef.current?.cursor;
    const el = cursor?.cursorElement;
    if (!cursor || !el) return;

    el.style.position = 'absolute';
    el.style.display = cursor.Hidden ? 'none' : 'block';
    el.style.visibility = 'visible';
    el.style.zIndex = '99999';
    el.style.opacity = '1';

    const height = el.getAttribute('height');
    if (height) el.style.height = `${height}px`;
    const width = el.getAttribute('width');
    if (width) el.style.width = `${width}px`;
  };

  const refreshCursorAndNote = () => {
    if (!osmdRef.current || !osmdRef.current.cursor) return;
    const cursor = osmdRef.current.cursor;
    cursor.update();
    styleCursorElement();

    const pitch = getCurrentTargetPitch(cursor, transpose);
    if (onCurrentNoteChange) {
      onCurrentNoteChange(pitch);
    }
  };

  const initBeatMap = () => {
    if (!osmdRef.current) return [];
    const result = buildBeatStepMap(osmdRef.current);
    beatStepMapRef.current = result.map;

    if (onTimeSignatureDetected && result.beatsPerMeasure) {
      onTimeSignatureDetected(result.beatsPerMeasure);
    }
    if (onTotalBeatsDetected && result.map.length > 0) {
      onTotalBeatsDetected(result.map.length);
    }
    if (onNoteTimelineBuilt) {
      onNoteTimelineBuilt(buildNoteTimeline(osmdRef.current));
    }

    return result.map;
  };


  // Initialize OSMD
  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);
    beatStepMapRef.current = [];
    currentStepRef.current = 0;
    containerRef.current.innerHTML = '';

    try {
      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        backend: 'svg',
        drawTitle: true,
        drawSubtitle: false,
        drawComposer: true,
        drawMetronomeMarks: true,
        renderSingleHorizontalStaffline: false,
        cursorsOptions: [
          {
            type: 0,
            color: '#0d9488',
            alpha: 0.3,
            follow: true,
          },
        ],
      });

      osmdRef.current = osmd;

      osmd
        .load(xmlData)
        .then(() => {
          if (!osmdRef.current) return;

          osmdRef.current.Zoom = zoom;
          osmdRef.current.Sheet.Transpose = transpose;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!osmdRef.current) return;
              osmdRef.current.render();

              osmdRef.current.enableOrDisableCursors(true);
              if (osmdRef.current.cursor) {
                osmdRef.current.cursor.show();
                osmdRef.current.cursor.reset();
                refreshCursorAndNote();
                initBeatMap();
              }

              setLoading(false);
            });
          });
        })
        .catch((err) => {
          console.error('OSMD load error:', err);
          setError('Could not parse MusicXML data.');
          setLoading(false);
        });
    } catch (err: any) {
      console.error('OSMD init error:', err);
      setError(err.message || 'Error initializing OpenSheetMusicDisplay.');
      setLoading(false);
    }
  }, [xmlData]);

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (osmdRef.current && !loading) {
        try {
          osmdRef.current.render();
          if (osmdRef.current.cursor) {
            osmdRef.current.cursor.show();
            refreshCursorAndNote();
          }
        } catch (e) {}
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loading]);

  // Handle Zoom
  useEffect(() => {
    if (osmdRef.current && !loading) {
      osmdRef.current.Zoom = zoom;
      osmdRef.current.render();
      if (osmdRef.current.cursor) {
        osmdRef.current.cursor.show();
        refreshCursorAndNote();
      }
    }
  }, [zoom]);

  // Handle Transpose
  useEffect(() => {
    if (osmdRef.current && !loading) {
      osmdRef.current.Sheet.Transpose = transpose;
      osmdRef.current.updateGraphic();
      osmdRef.current.render();
      if (osmdRef.current.cursor) {
        osmdRef.current.cursor.show();
        refreshCursorAndNote();
      }
    }
  }, [transpose]);

  // Synchronized Master Clock: Map metronome beats directly to beatStepMap note entries
  useEffect(() => {
    if (!osmdRef.current || !osmdRef.current.cursor) return;

    if (stepTrigger === 0) {
      // Beat 0: Reset cursor to start of piece
      const cursor = osmdRef.current.cursor;
      cursor.reset();
      cursor.show();
      currentStepRef.current = 0;
      refreshCursorAndNote();

      if (!beatStepMapRef.current || beatStepMapRef.current.length === 0) {
        initBeatMap();
      }
    } else if (stepTrigger !== undefined && stepTrigger > 0) {
      let map = beatStepMapRef.current;
      if (!map || map.length === 0) {
        map = initBeatMap();
      }

      if (!map || map.length === 0) return;

      if (stepTrigger < map.length) {
        const targetStepIndex = map[stepTrigger];
        const cursor = osmdRef.current.cursor;

        // Advance cursor until currentStepRef matches targetStepIndex
        while (currentStepRef.current < targetStepIndex && !cursor.iterator.EndReached) {
          cursor.next();
          currentStepRef.current += 1;
        }

        refreshCursorAndNote();
      } else {
        // Exercise completed at the end of the beat map
        const cursor = osmdRef.current.cursor;
        cursor.reset();
        currentStepRef.current = 0;
        refreshCursorAndNote();
        if (onExerciseFinished) onExerciseFinished();
      }
    }
  }, [stepTrigger]);

  const handleCursorReset = () => {
    if (osmdRef.current && osmdRef.current.cursor) {
      osmdRef.current.cursor.reset();
      currentStepRef.current = 0;
      refreshCursorAndNote();
    }
  };

  const handleCursorNext = () => {
    if (osmdRef.current && osmdRef.current.cursor) {
      osmdRef.current.cursor.next();
      currentStepRef.current += 1;
      refreshCursorAndNote();
    }
  };

  const handleCursorPrev = () => {
    if (osmdRef.current && osmdRef.current.cursor) {
      osmdRef.current.cursor.previous();
      currentStepRef.current = Math.max(0, currentStepRef.current - 1);
      refreshCursorAndNote();
    }
  };

  const toggleCursorVisibility = () => {
    if (osmdRef.current && osmdRef.current.cursor) {
      if (cursorVisible) {
        osmdRef.current.cursor.hide();
      } else {
        osmdRef.current.cursor.show();
      }
      refreshCursorAndNote();
      setCursorVisible(!cursorVisible);
    }
  };

  const toggleFullscreen = () => {
    if (!sheetWrapperRef.current) return;
    if (!document.fullscreenElement) {
      sheetWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div
      ref={sheetWrapperRef}
      className={`sheet-viewer-container glass-card p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg dark:shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-white dark:bg-slate-950 p-6 overflow-y-auto' : ''
      }`}
    >
      {/* Control Bar */}
      <div className="sheet-controls flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-300 dark:border-slate-800 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800">
            <span className="text-[11px] text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider">Zoom</span>
            <button
              onClick={() => onZoomChange(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-300 transition"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs font-mono w-11 text-center text-teal-700 dark:text-teal-400 font-black">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(2.0, Math.round((zoom + 0.1) * 10) / 10))}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-300 transition"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Key Transpose */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800">
            <span className="text-[11px] text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider">Key</span>
            <button
              onClick={() => onTransposeChange(transpose - 1)}
              className="px-1.5 py-0.5 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-md text-slate-800 dark:text-slate-300 transition text-xs font-extrabold"
              title="Transpose Down 1 Semitone"
            >
              -1
            </button>
            <span className="text-xs font-mono w-12 text-center text-indigo-700 dark:text-indigo-400 font-black">
              {transpose > 0 ? `+${transpose}st` : `${transpose}st`}
            </span>
            <button
              onClick={() => onTransposeChange(transpose + 1)}
              className="px-1.5 py-0.5 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-md text-slate-800 dark:text-slate-300 transition text-xs font-extrabold"
              title="Transpose Up 1 Semitone"
            >
              +1
            </button>
            {transpose !== 0 && (
              <button
                onClick={() => onTransposeChange(0)}
                className="text-[10px] bg-indigo-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-800 dark:text-slate-300 hover:text-indigo-950 dark:hover:text-white font-bold transition"
              >
                Reset
              </button>
            )}
          </div>

          {/* Cursor Steps */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900/80 px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={handleCursorPrev}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-300 transition"
              title="Previous Note"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleCursorReset}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-300 transition"
              title="Reset Cursor to Start"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleCursorNext}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-300 transition"
              title="Next Note"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={toggleCursorVisibility}
              className={`p-1 rounded-lg transition ml-1 ${
                cursorVisible
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-slate-800'
                  : 'text-slate-400'
              }`}
              title="Toggle Cursor Visibility"
            >
              <Eye size={15} />
            </button>
          </div>
        </div>

        {/* Right Side: Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          title="Toggle Fullscreen Sheet View"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Loading & Error Overlays */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-wide">Loading Sheet Music...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-xl text-sm text-center my-4">
          ⚠️ {error}
        </div>
      )}

      {/* Sheet Container Paper Wrapper */}
      <div className="sheet-output-wrapper bg-white dark:bg-slate-950 rounded-xl p-4 sm:p-6 min-h-[340px] shadow-sm border border-slate-200/90 dark:border-slate-800 overflow-x-auto transition-all">
        <div ref={containerRef} className="osmd-output relative w-full min-h-[300px]" />
      </div>
    </div>
  );
};
