import { useState } from 'react';
import { Columns, Grid, AlignCenter, Disc, Eye, Sliders, X, Check } from 'lucide-react';

export type GridType = '12-column' | 'baseline-8' | 'rule-of-thirds' | 'crosshair' | 'dot-matrix';
export type GridColor = 'amber' | 'cyan' | 'emerald' | 'white';

interface AlignmentGridOverlayProps {
  isVisible: boolean;
  onToggleVisible: () => void;
  gridType?: GridType;
  onChangeGridType?: (type: GridType) => void;
  gridColor?: GridColor;
  onChangeGridColor?: (color: GridColor) => void;
  opacity?: number;
  onChangeOpacity?: (opacity: number) => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
}

export default function AlignmentGridOverlay({
  isVisible,
  onToggleVisible,
  gridType = '12-column',
  onChangeGridType,
  gridColor = 'amber',
  onChangeGridColor,
  opacity = 0.4,
  onChangeOpacity,
  showRulers = true,
  onToggleRulers,
}: AlignmentGridOverlayProps) {
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

  if (!isVisible) {
    return null;
  }

  // Color mapping
  const colorMap = {
    amber: {
      columnBg: 'rgba(245, 158, 11, 0.08)',
      columnBorder: 'rgba(245, 158, 11, 0.35)',
      line: 'rgba(245, 158, 11, 0.4)',
      text: '#f59e0b',
      badgeBg: '#78350f',
      dot: 'rgba(245, 158, 11, 0.4)',
      rulerBg: '#1c1917',
      rulerBorder: '#d97706',
    },
    cyan: {
      columnBg: 'rgba(6, 182, 212, 0.08)',
      columnBorder: 'rgba(6, 182, 212, 0.35)',
      line: 'rgba(6, 182, 212, 0.4)',
      text: '#06b6d4',
      badgeBg: '#164e63',
      dot: 'rgba(6, 182, 212, 0.4)',
      rulerBg: '#083344',
      rulerBorder: '#0891b2',
    },
    emerald: {
      columnBg: 'rgba(16, 185, 129, 0.08)',
      columnBorder: 'rgba(16, 185, 129, 0.35)',
      line: 'rgba(16, 185, 129, 0.4)',
      text: '#10b981',
      badgeBg: '#064e3b',
      dot: 'rgba(16, 185, 129, 0.4)',
      rulerBg: '#022c22',
      rulerBorder: '#059669',
    },
    white: {
      columnBg: 'rgba(255, 255, 255, 0.06)',
      columnBorder: 'rgba(255, 255, 255, 0.3)',
      line: 'rgba(255, 255, 255, 0.35)',
      text: '#ffffff',
      badgeBg: '#27272a',
      dot: 'rgba(255, 255, 255, 0.35)',
      rulerBg: '#18181b',
      rulerBorder: '#71717a',
    },
  };

  const current = colorMap[gridColor] || colorMap.amber;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden select-none" style={{ opacity }}>
      {/* Top & Left Pixel Rulers */}
      {showRulers && (
        <>
          {/* Horizontal Top Ruler */}
          <div
            className="absolute top-0 inset-x-0 h-6 border-b flex items-center text-[9px] font-mono font-bold pointer-events-none z-50 overflow-hidden"
            style={{ backgroundColor: current.rulerBg, borderColor: current.rulerBorder, color: current.text }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center border-r h-full relative"
                style={{ width: '100px', borderColor: current.columnBorder }}
              >
                <span className="pl-1 text-[8px] opacity-80">{i * 100}px</span>
                {/* 50px tick mark */}
                <div
                  className="absolute right-1/2 bottom-0 w-px h-2"
                  style={{ backgroundColor: current.columnBorder }}
                />
              </div>
            ))}
          </div>

          {/* Vertical Left Ruler */}
          <div
            className="absolute top-6 bottom-0 left-0 w-6 border-r flex flex-col text-[8px] font-mono font-bold pointer-events-none z-50 overflow-hidden"
            style={{ backgroundColor: current.rulerBg, borderColor: current.rulerBorder, color: current.text }}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col justify-start border-b w-full relative"
                style={{ height: '100px', borderColor: current.columnBorder }}
              >
                <span className="pt-1 pl-0.5 transform -rotate-90 origin-top-left text-[8px] opacity-80 mt-3">{i * 100}</span>
                {/* 50px tick mark */}
                <div
                  className="absolute right-0 bottom-1/2 h-px w-2"
                  style={{ backgroundColor: current.columnBorder }}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Grid Pattern Renderer */}
      <div className={`w-full h-full relative ${showRulers ? 'pt-6 pl-6' : ''}`}>
        {/* 1. 12-COLUMN RESPONSIVE GRID */}
        {gridType === '12-column' && (
          <div className="w-full h-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-12 gap-3 sm:gap-6 relative">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="h-full relative flex flex-col justify-between border-x"
                style={{
                  backgroundColor: current.columnBg,
                  borderColor: current.columnBorder,
                }}
              >
                {/* Column Top Badge */}
                <div
                  className="px-1 py-0.5 text-[8px] font-mono font-bold text-center tracking-tighter truncate rounded-b"
                  style={{ backgroundColor: current.badgeBg, color: current.text }}
                >
                  C{idx + 1}
                </div>
                {/* Center axis tick in each column */}
                <div
                  className="w-px h-full absolute left-1/2 top-0 bottom-0 opacity-40 border-r border-dashed"
                  style={{ borderColor: current.line }}
                />
                {/* Column Bottom Badge */}
                <div
                  className="px-1 py-0.5 text-[8px] font-mono font-bold text-center tracking-tighter truncate rounded-t"
                  style={{ backgroundColor: current.badgeBg, color: current.text }}
                >
                  C{idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. BASELINE 8PX / 16PX RHYTHM */}
        {gridType === 'baseline-8' && (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${current.line} 1px, transparent 1px), linear-gradient(to bottom, ${current.columnBorder} 1px, transparent 1px)`,
              backgroundSize: '100% 8px, 100% 32px',
            }}
          />
        )}

        {/* 3. RULE OF THIRDS & COMPOSITION */}
        {gridType === 'rule-of-thirds' && (
          <div className="w-full h-full relative">
            {/* Vertical thirds */}
            <div
              className="absolute top-0 bottom-0 border-r-2 border-dashed z-10 flex items-start pt-10 pl-2"
              style={{ left: '33.333%', borderColor: current.line }}
            >
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold" style={{ backgroundColor: current.badgeBg, color: current.text }}>
                1/3 Focal (33.3%)
              </span>
            </div>
            <div
              className="absolute top-0 bottom-0 border-r-2 border-dashed z-10 flex items-start pt-10 pl-2"
              style={{ left: '66.666%', borderColor: current.line }}
            >
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold" style={{ backgroundColor: current.badgeBg, color: current.text }}>
                2/3 Focal (66.7%)
              </span>
            </div>

            {/* Horizontal thirds */}
            <div
              className="absolute inset-x-0 border-b-2 border-dashed z-10 flex items-center pl-10"
              style={{ top: '33.333%', borderColor: current.line }}
            >
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold" style={{ backgroundColor: current.badgeBg, color: current.text }}>
                Upper Golden Third
              </span>
            </div>
            <div
              className="absolute inset-x-0 border-b-2 border-dashed z-10 flex items-center pl-10"
              style={{ top: '66.666%', borderColor: current.line }}
            >
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold" style={{ backgroundColor: current.badgeBg, color: current.text }}>
                Lower Golden Third
              </span>
            </div>

            {/* Intersecting Points Rings */}
            {[
              { top: '33.333%', left: '33.333%' },
              { top: '33.333%', left: '66.666%' },
              { top: '66.666%', left: '33.333%' },
              { top: '66.666%', left: '66.666%' },
            ].map((pt, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse"
                style={{ top: pt.top, left: pt.left, borderColor: current.text, backgroundColor: current.columnBg }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: current.text }} />
              </div>
            ))}
          </div>
        )}

        {/* 4. CROSSHAIR CENTER AXIS */}
        {gridType === 'crosshair' && (
          <div className="w-full h-full relative">
            {/* Center Vertical Axis */}
            <div
              className="absolute top-0 bottom-0 border-r-2 border-dashed z-10 flex items-start pt-12 pl-2"
              style={{ left: '50%', borderColor: current.text }}
            >
              <span className="text-[10px] font-mono px-2.5 py-1 rounded font-black shadow-lg" style={{ backgroundColor: current.badgeBg, color: current.text }}>
                CENTER X (50.0%)
              </span>
            </div>
            {/* Center Horizontal Axis */}
            <div
              className="absolute inset-x-0 border-b-2 border-dashed z-10 flex items-center pl-12"
              style={{ top: '50%', borderColor: current.text }}
            >
              <span className="text-[10px] font-mono px-2.5 py-1 rounded font-black shadow-lg" style={{ backgroundColor: current.badgeBg, color: current.text }}>
                CENTER Y (50.0%)
              </span>
            </div>
            {/* Central Target Ring */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: current.text }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: current.text }} />
            </div>
          </div>
        )}

        {/* 5. DOT MATRIX */}
        {gridType === 'dot-matrix' && (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(${current.dot} 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}
      </div>
    </div>
  );
}
