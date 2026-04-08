import React, { useState, useCallback } from "react";
import { parseRangeText, HandFrequency } from "@/lib/parseRange";
import { RangeGrid } from "@/components/RangeGrid";

const EXAMPLE_INPUT = `Raise
AA,KK,QQ,JJ,TT,99,88,77,66,55:0.06,44:0.1,AK,AQ,AJ,AT,A9s,A9o:0.7,A8s,A7s:0.28,A5s,A4s:0.99,A3s:0.18,KQ,KJs,KJo:0.77,KTs,K9s,K8s:0.03,K8o:0.46,K7s:0.03,K7o:0.38,K6s:0.08,K6o:0.34,K5s:0.01,K5o:0.1,K4o:0.16,K3s:0.01,K3o:0.17,K2s:0.44,QJs,QJo:0.11,QTs,Q9s:0.91,Q9o:0.1,Q8s:0.03,Q8o:0.19,Q7s:0.05,Q7o:0.19,Q6s:0.45,Q6o:0.1,Q5s:0.12,Q4s:0.48,Q3s:0.4,Q2s:0.23,JTs,JTo:0.19,J9s:0.02,J9o:0.23,J8s:0.45,J8o:0.07,J7s:0.87,T9s:0.41,T9o:0.37,T8s:0.74,T8o:0.36,T7s:0.96,T7o:0.28,T6s:0.95,98s:0.97,97s,97o:0.2,96s,96o:0.3,95s:0.21,87s:0.97,86s,86o:0.07,85s:0.81,84s:0.54,76s,76o:0.04,75s,74s:0.07,65s,64s:0.32,63s:0.03,54s,43s:0.3,32s:0.36

Call
55:0.94,44:0.9,33,22,A9o:0.3,A8o,A7s:0.72,A7o,A6,A5o,A4s:0.01,A4o,A3s:0.82,A3o,A2,KJo:0.23,KTo,K9o,K8s:0.97,K8o:0.54,K7s:0.97,K7o:0.62,K6s:0.92,K6o:0.66,K5s:0.99,K5o:0.9,K4s,K4o:0.84,K3s:0.99,K3o:0.83,K2s:0.56,K2o,QJo:0.89,QTo,Q9s:0.09,Q9o:0.9,Q8s:0.97,Q8o:0.81,Q7s:0.95,Q7o:0.81,Q6s:0.55,Q6o:0.9,Q5s:0.88,Q5o,Q4s:0.52,Q4o,Q3s:0.6,Q3o:0.28,Q2s:0.77,JTo:0.81,J9s:0.98,J9o:0.77,J8s:0.55,J8o:0.93,J7s:0.13,J7o,J6,J5s,J4s,J3s,J2s,T9s:0.59,T9o:0.63,T8s:0.26,T8o:0.64,T7s:0.04,T7o:0.72,T6s:0.05,T6o,T5s,T4s,T3s,T2s,98s:0.03,98o,97o:0.8,96o:0.7,95s:0.79,94s,93s,92s,87s:0.03,87o,86o:0.93,85s:0.19,85o:0.44,84s:0.46,83s,82s,76o:0.96,75o,74s:0.93,73s,72s,65o,64s:0.68,64o:0.35,63s:0.97,62s,54o,53s,52s,43s:0.7,42s,32s:0.64`;

export default function Home() {
  const [inputText, setInputText] = useState(EXAMPLE_INPUT);
  const [rangeData, setRangeData] = useState<Map<string, HandFrequency>>(
    () => parseRangeText(EXAMPLE_INPUT)
  );
  const [error, setError] = useState<string | null>(null);

  const handleParse = useCallback(() => {
    try {
      const data = parseRangeText(inputText);
      setRangeData(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, [inputText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleParse();
      }
    },
    [handleParse]
  );

  const stats = React.useMemo(() => {
    const TOTAL_COMBOS = 1326;

    function handCombos(hand: string): number {
      if (hand.length === 2) return 6;       // pair: C(4,2) = 6
      if (hand.endsWith("s")) return 4;       // suited: 4 suits
      return 12;                              // offsuit: 4*3 = 12
    }

    function fmt(n: number): string {
      const rounded = Math.round(n * 10) / 10;
      const comboStr = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
      const pct = ((n / TOTAL_COMBOS) * 100).toFixed(1);
      return `${comboStr} (${pct}%)`;
    }

    let raise = 0, call = 0, fold = 0;
    rangeData.forEach((hf, hand) => {
      const c = handCombos(hand);
      raise += c * hf.raise;
      call  += c * hf.call;
      fold  += c * hf.fold;
    });

    return { raise: fmt(raise), call: fmt(call), fold: fmt(fold) };
  }, [rangeData]);

  return (
    <div className="min-h-screen" style={{ background: "#0d0f12", color: "#e8eaed" }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#f0f2f5" }}>
            Poker Range Visualizer
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Paste a range with Raise / Call / Fold sections. Each hand cell is colored proportionally.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-80 flex flex-col gap-3 flex-shrink-0">
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#1e2330" }}>
              <div
                className="px-3 py-2 flex items-center justify-between text-xs font-semibold"
                style={{ background: "#141720", color: "#6b7280", borderBottom: "1px solid #1e2330" }}
              >
                <span>INPUT</span>
                <span style={{ color: "#4b5563" }}>Ctrl+Enter to apply</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                rows={20}
                className="w-full text-xs font-mono resize-y outline-none"
                style={{
                  background: "#0d0f12",
                  color: "#c9d1d9",
                  padding: "10px 12px",
                  border: "none",
                  lineHeight: 1.6,
                  minHeight: "180px",
                }}
                placeholder={`Raise\nAA,KK,QQ\n\nCall\n99,88\n\nFold\n72o`}
              />
            </div>

            <button
              onClick={handleParse}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#2563eb")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
            >
              Visualize Range
            </button>

            {error && (
              <div className="text-xs rounded px-3 py-2" style={{ background: "#1f1010", color: "#f87171", border: "1px solid #3b0f0f" }}>
                {error}
              </div>
            )}

            <div className="rounded-lg p-3 border" style={{ background: "#141720", borderColor: "#1e2330" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#6b7280" }}>LEGEND</div>
              <div className="flex flex-col gap-1.5">
                {[
                  { color: "#c0392b", label: "Raise" },
                  { color: "#27ae60", label: "Call" },
                  { color: "#2980b9", label: "Fold" },
                  { color: "#1a1a1a", label: "No action (black)" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: color,
                        border: "1px solid rgba(255,255,255,0.1)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-xs" style={{ color: "#9ca3af" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-3 border text-xs" style={{ background: "#141720", borderColor: "#1e2330", color: "#9ca3af" }}>
              <div className="font-semibold mb-2" style={{ color: "#6b7280" }}>STATS</div>
              <div className="flex flex-col gap-1">
                <div>Raise combos: <span style={{ color: "#c0392b" }}>{stats.raise}</span></div>
                <div>Call combos: <span style={{ color: "#27ae60" }}>{stats.call}</span></div>
                <div>Fold combos: <span style={{ color: "#2980b9" }}>{stats.fold}</span></div>
              </div>
            </div>

            <div className="rounded-lg p-3 border text-xs" style={{ background: "#141720", borderColor: "#1e2330", color: "#6b7280" }}>
              <div className="font-semibold mb-2">FORMAT GUIDE</div>
              <div className="flex flex-col gap-0.5 font-mono" style={{ lineHeight: 1.8 }}>
                <div><span style={{ color: "#c9d1d9" }}>Raise</span> — section header</div>
                <div><span style={{ color: "#c9d1d9" }}>AA,KK</span> — 100% frequency</div>
                <div><span style={{ color: "#c9d1d9" }}>AKs</span> — suited only</div>
                <div><span style={{ color: "#c9d1d9" }}>AKo</span> — offsuit only</div>
                <div><span style={{ color: "#c9d1d9" }}>AK</span> — both suited+offsuit</div>
                <div><span style={{ color: "#c9d1d9" }}>AK:0.5</span> — 50% frequency</div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-3 flex items-center gap-3 text-xs" style={{ color: "#6b7280" }}>
              <span>Suited above diagonal · Pairs on diagonal · Offsuit below diagonal</span>
            </div>
            <div className="mb-2 flex items-center gap-1">
              {["A","K","Q","J","T","9","8","7","6","5","4","3","2"].map((r) => (
                <div
                  key={r}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "clamp(7px, 1vw, 11px)",
                    color: "#4b5563",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
            <RangeGrid rangeData={rangeData} />
            <div className="mt-2 flex items-center">
              {["A","K","Q","J","T","9","8","7","6","5","4","3","2"].map((r) => (
                <div
                  key={r}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "clamp(7px, 1vw, 11px)",
                    color: "#4b5563",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
