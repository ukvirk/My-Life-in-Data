import React from "react";
import { useTelemetry, evaluateCompliance } from "../context/TelemetryContext";
import { Terminal, ShieldCheck, AlertCircle, FileText, Brain, Heart, Zap } from "lucide-react";

export const DiagnosticsFeed: React.FC = () => {
  const { state } = useTelemetry();
  const { records, selectedRecordId } = state;

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;
  const metrics = selectedRecord ? evaluateCompliance(selectedRecord) : null;

  // Let's calculate some trends
  const calculateTrends = () => {
    if (records.length === 0) return [];
    const trends: { type: "info" | "warn" | "success"; text: string }[] = [];

    const avgSleep = records.reduce((sum, r) => sum + r.sleepHours, 0) / records.length;
    const avgCode = records.reduce((sum, r) => sum + r.codeHours, 0) / records.length;
    const avgWater = records.reduce((sum, r) => sum + r.waterLiters, 0) / records.length;

    // Check Sleep patterns
    if (avgSleep < 7.0) {
      trends.push({
        type: "warn",
        text: `TRENDS: Chronic sleep deficiency detected. Rolling average ${avgSleep.toFixed(1)} hrs degrades high-level neuro-performance.`,
      });
    } else {
      trends.push({
        type: "success",
        text: `TRENDS: High-quality melatonin cycle observed. Rolling average ${avgSleep.toFixed(1)} hrs.`,
      });
    }

    // Check Code intensity
    const burnoutDays = records.filter((r) => r.codeHours > 9.0).length;
    if (burnoutDays > 1) {
      trends.push({
        type: "warn",
        text: `TRENDS: Burnout threat detected. Identified ${burnoutDays} crash-risk coding sessions (>9h). Lower duration to maintain neuroplasticity.`,
      });
    } else if (avgCode >= 4 && avgCode <= 6) {
      trends.push({
        type: "success",
        text: `TRENDS: Deep Work flow alignment secure. Average focus code routine in optimal 4-6 hours threshold.`,
      });
    }

    // Check Hydration trends
    const dryDays = records.filter((r) => r.waterLiters < 2.5).length;
    if (dryDays > 2) {
      trends.push({
        type: "warn",
        text: `TRENDS: Persistent dehydration alert. ${dryDays} days under 2.5L. Cell health compromised.`,
      });
    } else {
      trends.push({
        type: "success",
        text: `TRENDS: Electrolyte balance secure. Hydration consistency optimal.`,
      });
    }

    return trends;
  };

  const trends = calculateTrends();

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-white/5 rounded-xl overflow-hidden shadow-xl">
      <div className="p-3 bg-slate-905 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-widest">
            OPERATIONAL_DIAGNOSTICS
          </h3>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-500/20 rounded animate-pulse">
          AUDIT FEED LIVE
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 font-mono text-xs overflow-y-auto max-h-[400px]">
        {/* Day Analysis */}
        {selectedRecord && metrics ? (
          <div className="space-y-2 border-b border-white/5 pb-4">
            <div className="text-[10px] text-slate-500 uppercase flex justify-between items-center mb-1">
              <span>DAY COMPLIANCE REPORT</span>
              <span className="text-cyan-400">ID: {selectedRecord.date}</span>
            </div>

            {/* Overall Score Banner */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-white/5 rounded-md">
              <span className="text-slate-400 uppercase">Compliance Factor:</span>
              <span className={`font-bold text-sm ${
                metrics.overallScore >= 80 
                  ? "text-[#00ff95] compliance-pass" 
                  : metrics.overallScore >= 60 
                  ? "text-cyan-400" 
                  : "text-amber-400"
              }`}>
                {metrics.overallScore}%
              </span>
            </div>

            {/* Individual Rule Diagnostics */}
            <div className="space-y-1.5 pt-1">
              {/* Deep Code Audit */}
              <div className="flex items-start gap-2 text-slate-300">
                {metrics.code.status === "BURNOUT_RISK" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] compliance-fail flex-shrink-0 mt-0.5 animate-pulse" />
                ) : metrics.code.status === "PASS" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff95] compliance-pass flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-slate-500">[CODE]</span>{" "}
                  {metrics.code.status === "BURNOUT_RISK" ? (
                    <span className="text-[#ef4444] compliance-fail font-bold">BURNOUT ALERT: Code record ({metrics.code.current}h) exceeds burnout safety perimeter of 9h. Brain workload excessive.</span>
                  ) : metrics.code.status === "PASS" ? (
                    <span className="text-[#00ff95] compliance-pass">COMPLIANT: Day coding focus ({metrics.code.current}h) falls beautifully in 4-6h peak productivity target.</span>
                  ) : (
                    <span className="text-slate-400">INFORMATIONAL: Code focus ({metrics.code.current}h) is brief. Optimal flow requires 4-6h deep work.</span>
                  )}
                </div>
              </div>

              {/* Sleep Audit */}
              <div className="flex items-start gap-2 text-slate-300">
                {metrics.sleep.status === "CRITICAL" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] compliance-fail flex-shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff95] compliance-pass flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-slate-500">[SLEEP]</span>{" "}
                  {metrics.sleep.status === "CRITICAL" ? (
                    <span className="text-[#ef4444] compliance-fail font-bold flex-wrap">CRITICAL WARNING: Rest cycle ({metrics.sleep.current}h) fell below human baseline of 7h. Cognitive capacity degraded.</span>
                  ) : (
                    <span className="text-[#00ff95] compliance-pass">COMPLIANT: Restful cycle duration of {metrics.sleep.current} hrs achieved. Melatonin homeostasis secure.</span>
                  )}
                </div>
              </div>

              {/* Water Audit */}
              <div className="flex items-start gap-2 text-slate-300">
                {metrics.water.status === "WARNING" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff95] compliance-pass flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-slate-500">[WATER]</span>{" "}
                  {metrics.water.status === "WARNING" ? (
                    <span className="text-amber-400">WARNING: Hydration levels under target. Registered {metrics.water.current}L (Target is {metrics.water.target}L). Dehydration imminent.</span>
                  ) : (
                    <span className="text-[#00ff95] compliance-pass">COMPLIANT: Cell biology saturated correctly. Registered {metrics.water.current}L.</span>
                  )}
                </div>
              </div>

              {/* Protein Audit */}
              <div className="flex items-start gap-2 text-slate-300">
                {metrics.protein.status === "ALERT" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] compliance-fail flex-shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff95] compliance-pass flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-slate-500">[PROTEIN]</span>{" "}
                  {metrics.protein.status === "ALERT" ? (
                    <span className="text-amber-400">ALERT: Dietary protein intake low ({metrics.protein.current}g total). Dynamic ratio is {(selectedRecord.proteinGrams / selectedRecord.bodyWeightKg).toFixed(2)} g/kg. Target is {metrics.protein.target}g.</span>
                  ) : (
                    <span className="text-[#00ff95] compliance-pass">COMPLIANT: Nitrogen balance optimal. Hypertrophy threshold met at {(selectedRecord.proteinGrams / selectedRecord.bodyWeightKg).toFixed(2)} g/kg.</span>
                  )}
                </div>
              </div>

              {/* Gym Audit */}
              <div className="flex items-start gap-2 text-slate-300">
                {metrics.gym.status === "WARNING" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff95] compliance-pass flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[#E4E7EB]/40">[EXERCISE]</span>{" "}
                  {metrics.gym.status === "WARNING" ? (
                    <span className="text-slate-400">INFORMATIONAL: Recovery protocol or mild session. Duration: {metrics.gym.current}h (Optimal target is 1.0h).</span>
                  ) : (
                    <span className="text-[#00ff95] compliance-pass">COMPLIANT: Solid athletic conditioning output recorded for {metrics.gym.current} hrs. Cardiovascular index stimulated.</span>
                  )}
                </div>
              </div>
            </div>
            {selectedRecord.notes && (
              <div className="mt-3 p-2 bg-slate-900/40 border border-white/5 rounded text-[11px] text-slate-400 leading-relaxed italic flex gap-1.5 items-start">
                <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Operator Notes: "{selectedRecord.notes}"</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-6">
            [AWAITING DATA IDENTITY SELECTION]
          </div>
        )}

        {/* rolling averages and general trends */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] text-slate-500 uppercase">SYS TRACE & MACHINE LEARNING ANALYSIS</div>
          {trends.length > 0 ? (
            trends.map((t, idx) => (
              <div key={idx} className="flex gap-2 items-start mt-2">
                {t.type === "warn" ? (
                  <span className="p-0.5 h-4 w-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[8px] font-bold">!</span>
                ) : (
                  <span className="p-0.5 h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[8px] font-bold">✓</span>
                )}
                <span className={t.type === "warn" ? "text-amber-400" : "text-emerald-400/90"}>
                  {t.text}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-600 italic">No records in the database. Diagnostic array is blank.</div>
          )}
        </div>
      </div>
    </div>
  );
};
