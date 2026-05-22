import React from "react";
import { useTelemetry, evaluateCompliance } from "../context/TelemetryContext";
import { Calendar, ChevronLeft, ChevronRight, Sliders, Activity } from "lucide-react";

export const TimelineSlider: React.FC = () => {
  const { state, dispatch } = useTelemetry();
  const { records, selectedRecordId, activeRange } = state;

  const selectedIndex = records.findIndex((r) => r.id === selectedRecordId);
  const selectedRecord = records[selectedIndex] || null;
  const metrics = selectedRecord ? evaluateCompliance(selectedRecord) : null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    if (records[idx]) {
      dispatch({ type: "SET_SELECTED_RECORD", payload: records[idx].id });
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      dispatch({ type: "SET_SELECTED_RECORD", payload: records[selectedIndex - 1].id });
    }
  };

  const handleNext = () => {
    if (selectedIndex < records.length - 1) {
      dispatch({ type: "SET_SELECTED_RECORD", payload: records[selectedIndex + 1].id });
    }
  };

  if (records.length === 0) return null;

  return (
    <div className="glass-panel border border-white/5 bg-slate-950/80 rounded-xl p-5 space-y-4">
      {/* Slider Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              CHRONOLOGY_MATRIX_SCRUBBER
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Scrub or toggle records chronologically to inspect bio-stability states.
            </p>
          </div>
        </div>

        {/* Range Filters */}
        <div className="flex bg-slate-900/60 p-1 border border-white/5 rounded-lg text-[10px] font-mono uppercase">
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_RANGE", payload: "week" })}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeRange === "week"
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            Past Week [7d]
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_RANGE", payload: "month" })}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeRange === "month"
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            Past Month [15d]
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_RANGE", payload: "all" })}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeRange === "all"
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            All Array Data
          </button>
        </div>
      </div>

      {/* Actual Slider Scrubbing Deck */}
      <div className="flex items-center gap-4 py-1">
        <button
          onClick={handlePrev}
          disabled={selectedIndex <= 0}
          className="p-1 px-2 border border-white/5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 rounded-md text-slate-300 cursor-pointer transition-all flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 relative group">
          <input
            type="range"
            min={0}
            max={records.length - 1}
            value={selectedIndex >= 0 ? selectedIndex : 0}
            onChange={handleSliderChange}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          
          {/* Timeline markers */}
          <div className="absolute top-[10px] inset-x-0 flex justify-between px-1 text-[8px] font-mono text-slate-600 pointer-events-none">
            {records.map((rec, i) => (
              <span 
                key={rec.id} 
                className={`${i === selectedIndex ? "text-cyan-400 font-bold" : ""} hidden sm:inline`}
              >
                {rec.date}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={selectedIndex >= records.length - 1}
          className="p-1 px-2 border border-white/5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 rounded-md text-slate-300 cursor-pointer transition-all flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scrubbed Record Detail Capsule Overlay */}
      {selectedRecord && metrics && (
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 uppercase font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Focused Day Index Node</div>
              <div className="text-slate-100 font-bold flex items-center gap-2">
                {selectedRecord.date}
                {metrics.overallScore >= 80 ? (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-[#00ff95]/10 text-[#00ff95] border border-[#00ff95]/20 animate-pulse font-bold">
                    HIGH PERFORMANCE
                  </span>
                ) : metrics.overallScore <= 40 ? (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/25">
                    CRITICAL LIMITS DETECTED
                  </span>
                ) : (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-white/5">
                    STABLE METRICS
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
            <div>
              <span className="text-slate-500">Code:</span> <strong className="text-slate-200">{selectedRecord.codeHours}h</strong>
            </div>
            <div>
              <span className="text-slate-500">Sleep:</span> <strong className="text-slate-200">{selectedRecord.sleepHours}h</strong>
            </div>
            <div>
              <span className="text-slate-500">Water:</span> <strong className="text-slate-200">{selectedRecord.waterLiters}L</strong>
            </div>
            <div>
              <span className="text-slate-500">Protein:</span> <strong className="text-slate-200">{(selectedRecord.proteinGrams / selectedRecord.bodyWeightKg).toFixed(1)}g/kg</strong>
            </div>
            <div>
              <span className="text-slate-500">Gym:</span> <strong className="text-slate-200">{selectedRecord.gymHours}h</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-slate-500">ARRAY INDEX:</span>
            <span className="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded font-bold text-slate-300">
              {selectedIndex + 1} / {records.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
