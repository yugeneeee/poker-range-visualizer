import React from "react";
import { HandFrequency, RANKS, getHandKey, getHandLabel } from "@/lib/parseRange";

interface RangeGridProps {
  rangeData: Map<string, HandFrequency>;
}

interface Segment {
  color: string;
  pct: number;
}

function getSegments(hf: HandFrequency | undefined): Segment[] {
  if (!hf) return [];
  const { raise, call, fold } = hf;
  const total = raise + call + fold;
  if (total === 0) return [];

  const segs: Segment[] = [];
  if (raise > 0) segs.push({ color: "#c0392b", pct: raise * 100 });
  if (call > 0) segs.push({ color: "#27ae60", pct: call * 100 });
  if (fold > 0) segs.push({ color: "#2980b9", pct: fold * 100 });

  const remainder = 100 - raise * 100 - call * 100 - fold * 100;
  if (remainder > 0.001) segs.push({ color: "#1a1a1a", pct: remainder });

  return segs;
}

function getTextColor(hf: HandFrequency | undefined): string {
  if (!hf) return "rgba(255,255,255,0.3)";
  const total = hf.raise + hf.call + hf.fold;
  if (total === 0) return "rgba(255,255,255,0.3)";
  return "#fff";
}

function CellTooltip({ hand, hf }: { hand: string; hf: HandFrequency | undefined }) {
  if (!hf) return <span className="font-mono text-xs opacity-40">{hand}</span>;
  const total = hf.raise + hf.call + hf.fold;
  if (total === 0) return <span className="font-mono text-xs opacity-40">{hand}</span>;

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-bold font-mono">{hand}</span>
      {hf.raise > 0 && (
        <span className="text-red-300">Raise: {(hf.raise * 100).toFixed(0)}%</span>
      )}
      {hf.call > 0 && (
        <span className="text-green-300">Call: {(hf.call * 100).toFixed(0)}%</span>
      )}
      {hf.fold > 0 && (
        <span className="text-blue-300">Fold: {(hf.fold * 100).toFixed(0)}%</span>
      )}
    </div>
  );
}

interface TooltipState {
  hand: string;
  hf: HandFrequency | undefined;
  x: number;
  y: number;
}

export function RangeGrid({ rangeData }: RangeGridProps) {
  const [tooltip, setTooltip] = React.useState<TooltipState | null>(null);

  return (
    <div className="relative select-none">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(13, 1fr)`,
          gap: "2px",
          width: "100%",
          maxWidth: "min(780px, 100vw - 2rem)",
          margin: "0 auto",
        }}
      >
        {RANKS.map((_, row) =>
          RANKS.map((_, col) => {
            const hand = getHandKey(row, col);
            const label = getHandLabel(row, col);
            const hf = rangeData.get(hand);
            const segments = getSegments(hf);
            const textColor = getTextColor(hf);
            const isSuited = row < col;
            const isPair = row === col;
            const hasAction = (hf?.raise ?? 0) + (hf?.call ?? 0) + (hf?.fold ?? 0) > 0;

            return (
              <div
                key={hand}
                style={{
                  aspectRatio: "1",
                  borderRadius: "3px",
                  cursor: "pointer",
                  position: "relative",
                  border: isPair
                    ? "1px solid rgba(255,255,255,0.25)"
                    : isSuited
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(255,255,255,0.05)",
                  overflow: "hidden",
                  backgroundColor: "#1a1a1a",
                }}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltip({ hand, hf, x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {hasAction && (() => {
                  let top = 0;
                  return segments.map((seg, i) => {
                    const div = (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: `${top}%`,
                          height: `${seg.pct}%`,
                          backgroundColor: seg.color,
                        }}
                      />
                    );
                    top += seg.pct;
                    return div;
                  });
                })()}

                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    color: textColor,
                    fontSize: "clamp(7px, 1.3vw, 12px)",
                    fontWeight: isPair ? 700 : 500,
                    fontFamily: "monospace",
                    userSelect: "none",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl"
        >
          <CellTooltip hand={tooltip.hand} hf={tooltip.hf} />
        </div>
      )}
    </div>
  );
}
