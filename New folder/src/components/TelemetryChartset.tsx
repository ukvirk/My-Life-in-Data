import React from "react";
import { useTelemetry, evaluateCompliance } from "../context/TelemetryContext";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from "recharts";
import { ShieldAlert, Award, AlertCircle, Info, Flame, Bed, Droplet, Dumbbell, Sparkles } from "lucide-react";

export const TelemetryChartset: React.FC = () => {
  const { state, dispatch } = useTelemetry();
  const { records, selectedRecordId, activeRange } = state;

  // Filter records based on active timeframe
  const getFilteredData = () => {
    if (records.length === 0) return [];
    
    // Sort chronological
    const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
    
    if (activeRange === "week") {
      return sorted.slice(-7);
    }
    if (activeRange === "month") {
      return sorted.slice(-15); // Best fit for visual viewport density
    }
    return sorted;
  };

  const visibleData = getFilteredData();

  // Selected Record Stats
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;
  const metrics = selectedRecord ? evaluateCompliance(selectedRecord) : null;

  // Handle data click to select record
  const handleChartNodeClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0] && data.activePayload[0].payload) {
      const clickedId = data.activePayload[0].payload.id;
      dispatch({ type: "SET_SELECTED_RECORD", payload: clickedId });
    }
  };

  // Safe Fallback
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-950/40 border border-dashed border-white/10 rounded-2xl">
        <ShieldAlert className="w-12 h-12 text-slate-600 mb-3 animate-bounce" />
        <h4 className="text-sm font-mono text-slate-400 capitalize">LOG_DATABASE_BLANK</h4>
        <p className="text-xs text-slate-500 mt-1 uppercase">Click "+ LOG NEW DAY" to begin biological array ingestion.</p>
      </div>
    );
  }

  // Pre-process metrics for charts (add calculated properties)
  const chartProcessedData = visibleData.map((record) => {
    const evaluation = evaluateCompliance(record);
    const pRatio = record.bodyWeightKg > 0 ? record.proteinGrams / record.bodyWeightKg : 0;
    
    return {
      ...record,
      proteinRatio: Number(pRatio.toFixed(2)),
      overallScore: evaluation.overallScore,
      isWaterPass: evaluation.water.status === "PASS",
      isProteinPass: evaluation.protein.status === "PASS",
      isSleepPass: evaluation.sleep.status === "PASS",
      isCodePass: evaluation.code.status === "PASS" || record.codeHours >= 4,
      isBurnoutRisk: evaluation.code.status === "BURNOUT_RISK",
      isGymPass: evaluation.gym.status === "PASS",
    };
  });

  return (
    <div className="space-y-6">
      {/* Upper Micro diagnostics bar for Selected day */}
      {selectedRecord && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Code focus KPI */}
          <div 
            onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: true })}
            className={`cursor-pointer p-4 rounded-xl border transition-all glass-panel flex flex-col justify-between ${
              metrics.code.status === "BURNOUT_RISK" 
                ? "border-red-500/20 bg-red-950/10 hover:border-red-400/30" 
                : "border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Deep Code</span>
              <Flame className={`w-4 h-4 ${metrics.code.status === "BURNOUT_RISK" ? "text-red-400 animate-pulse" : "text-purple-400"}`} />
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-display font-medium text-slate-100 flex items-baseline gap-1">
                {selectedRecord.codeHours}
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                {metrics.code.status === "BURNOUT_RISK" ? (
                  <span className="text-red-400">🔥 BURNOUT ACCELERATION</span>
                ) : metrics.code.status === "PASS" ? (
                  <span className="text-emerald-400">✓ OPTIMAL FLOW STATE</span>
                ) : (
                  <span className="text-indigo-400">INSUFFICIENT BASELINE</span>
                )}
              </div>
            </div>
          </div>

          {/* Sleep Score KPI */}
          <div 
            onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: true })}
            className={`cursor-pointer p-4 rounded-xl border transition-all glass-panel flex flex-col justify-between ${
              metrics.sleep.status === "CRITICAL" 
                ? "border-red-500/20 bg-red-950/10 hover:border-red-400/30" 
                : "border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Rest Cycle</span>
              <Bed className={`w-4 h-4 ${metrics.sleep.status === "CRITICAL" ? "text-red-400 animate-pulse" : "text-sky-400"}`} />
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-display font-medium text-slate-100 flex items-baseline gap-1">
                {selectedRecord.sleepHours}
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                {metrics.sleep.status === "CRITICAL" ? (
                  <span className="text-red-400">🚨 BRAIN DEFICIT WARNING</span>
                ) : (
                  <span className="text-emerald-400">✓ BIOME REST COMPLIANT</span>
                )}
              </div>
            </div>
          </div>

          {/* Hydration KPI */}
          <div 
            onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: true })}
            className={`cursor-pointer p-4 rounded-xl border transition-all glass-panel flex flex-col justify-between ${
              metrics.water.status === "WARNING" 
                ? "border-amber-500/20 bg-amber-950/10 hover:border-amber-400/30" 
                : "border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Hydration</span>
              <Droplet className={`w-4 h-4 ${metrics.water.status === "WARNING" ? "text-amber-400 animate-pulse" : "text-cyan-400"}`} />
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-display font-medium text-slate-100 flex items-baseline gap-1">
                {selectedRecord.waterLiters}
                <span className="text-xs text-slate-500 font-mono">liters</span>
              </div>
              <div className="text-[9px] font-mono mt-1 uppercase">
                {metrics.water.status === "WARNING" ? (
                  <span className="text-amber-400">⚠️ BELOW REHYDRATION LIMIT</span>
                ) : (
                  <span className="text-emerald-400">✓ ELECTROLYTE STABLE</span>
                )}
              </div>
            </div>
          </div>

          {/* Protein Ratio KPI */}
          <div 
            onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: true })}
            className={`cursor-pointer p-4 rounded-xl border transition-all glass-panel flex flex-col justify-between ${
              metrics.protein.status === "ALERT" 
                ? "border-amber-500/20 bg-amber-950/10 hover:border-amber-400/30" 
                : "border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Protein Scale</span>
              <Sparkles className={`w-4 h-4 ${metrics.protein.status === "ALERT" ? "text-amber-400" : "text-indigo-400"}`} />
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-display font-medium text-slate-100 flex items-baseline gap-1">
                {(selectedRecord.proteinGrams / selectedRecord.bodyWeightKg).toFixed(1)}
                <span className="text-xs text-slate-500 font-mono">g/kg</span>
              </div>
              <div className="text-[9px] font-mono mt-1 uppercase">
                {metrics.protein.status === "ALERT" ? (
                  <span className="text-amber-400">⚠️ INTENSITY RATIO LOW</span>
                ) : (
                  <span className="text-emerald-400">✓ MUSCLE PERIMETER PASS</span>
                )}
              </div>
            </div>
          </div>

          {/* Gym Duration KPI */}
          <div 
            onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: true })}
            className="cursor-pointer p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all glass-panel flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Conditioning</span>
              <Dumbbell className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-display font-medium text-slate-100 flex items-baseline gap-1">
                {selectedRecord.gymHours}
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <div className="text-[9px] font-mono mt-1 uppercase">
                {metrics.gym.status === "WARNING" ? (
                  <span className="text-slate-500">RECOVERY LAB PROTOCOL</span>
                ) : (
                  <span className="text-emerald-400">✓ CARDIO ATHLETIC PASS</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of the 4 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Time Allocation Timeline (Double Grid Span or prominent width) */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 bg-slate-950/50 flex flex-col justify-between col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-display font-medium tracking-tight text-slate-200 uppercase">
                Time Allocation Matrix [Deep Code vs Rest Cycle]
              </h3>
              <p className="text-[11px] font-mono text-slate-500 uppercase">
                Target Ranges: Coding (4-6 hrs optimal) | Deep Sleep (7-9 hrs optimal)
              </p>
            </div>
            <div className="flex gap-4 text-[10px] font-mono uppercase bg-slate-900/60 p-2 rounded-md border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 block" />
                <span className="text-slate-300">Deep Code</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 block" />
                <span className="text-slate-300">Sleep Space</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartProcessedData}
                onClick={handleChartNodeClick}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradientCode" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  domain={[0, 16]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 15, 30, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                    backdropFilter: "blur(5px)"
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                  labelStyle={{ fontWeight: "bold", color: "#38bdf8" }}
                />

                {/* Highlight targets via reference baselines */}
                <ReferenceLine 
                  y={4} 
                  stroke="#a855f7" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.4}
                  label={{ value: "CODE FLOW (4h)", fill: "rgba(168, 85, 247, 0.7)", fontSize: 8, position: "left", fontFamily: "JetBrains Mono" }} 
                />
                <ReferenceLine 
                  y={7} 
                  stroke="#0ea5e9" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.4}
                  label={{ value: "REST BASELINE (7h)", fill: "rgba(14, 165, 233, 0.7)", fontSize: 8, position: "left", fontFamily: "JetBrains Mono" }} 
                />

                <Area
                  type="monotone"
                  dataKey="codeHours"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientCode)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#e9d5ff" }}
                />
                <Area
                  type="monotone"
                  dataKey="sleepHours"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientSleep)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#bae6fd" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Hydration Telemetry Bar Chart */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 bg-slate-950/50 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-display font-medium tracking-tight text-slate-200 uppercase flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-cyan-400" />
              Hydration Volumetrics & Target Safety
            </h3>
            <p className="text-[11px] font-mono text-slate-500 uppercase">
              WHO Baseline Limit: 2.5 Liters. Sub-target bars turn alert-gold.
            </p>
          </div>

          <div className="h-60 w-full mt-4 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartProcessedData}
                onClick={handleChartNodeClick}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 15, 30, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                  labelStyle={{ color: "#22d3ee" }}
                />

                <ReferenceLine 
                  y={2.5} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.6}
                  label={{ value: "WHO BASELINE (2.5L)", fill: "rgba(239, 68, 68, 0.7)", fontSize: 8, position: "top", fontFamily: "JetBrains Mono" }} 
                />

                <Bar dataKey="waterLiters" radius={[4, 4, 0, 0]}>
                  {chartProcessedData.map((entry, index) => {
                    // Golden warning colors if water is below 2.5L WHO baseline limit
                    const isDeficit = entry.waterLiters < 2.5;
                    const isSelected = entry.id === selectedRecordId;
                    
                    let fill = isDeficit ? "#f59e0b" : "#06b6d4";
                    if (isSelected) {
                      fill = isDeficit ? "#fca5a5" : "#22d3ee";
                    }

                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill}
                        stroke={isSelected ? "#ffffff" : "none"}
                        strokeWidth={isSelected ? 1.5 : 0}
                        style={{ filter: isSelected ? "drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))" : "none" }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Protein Assessment (g/kg Body weight) */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 bg-slate-950/50 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-display font-medium tracking-tight text-slate-200 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Dynamic Dietary Protein Coefficient
            </h3>
            <p className="text-[11px] font-mono text-slate-500 uppercase">
              Target Baseline: 1.6 g/kg of weight. High intensity load alignment.
            </p>
          </div>

          <div className="h-60 w-full mt-4 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartProcessedData}
                onClick={handleChartNodeClick}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 15, 30, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                  labelStyle={{ color: "#818cf8" }}
                />

                <ReferenceLine 
                  y={1.6} 
                  stroke="#818cf8" 
                  strokeDasharray="4 4" 
                  label={{ value: "1.6 g/kg TARGET", fill: "rgba(129, 140, 248, 0.7)", fontSize: 8, position: "top", fontFamily: "JetBrains Mono" }} 
                />

                <Bar dataKey="proteinRatio" radius={[4, 4, 0, 0]}>
                  {chartProcessedData.map((entry, index) => {
                    const isDeficit = entry.proteinRatio < 1.6;
                    const isSelected = entry.id === selectedRecordId;
                    
                    let fill = isDeficit ? "#ea580c" : "#6366f1";
                    if (isSelected) {
                      fill = isDeficit ? "#f97316" : "#818cf8";
                    }

                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill}
                        stroke={isSelected ? "#ffffff" : "none"}
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Physical Conditioning Workout Matrix */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 bg-slate-950/50 flex flex-col justify-between col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-display font-medium tracking-tight text-slate-200 uppercase flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Physical Conditioning Logs & Gym Output
              </h3>
              <p className="text-[11px] font-mono text-slate-500 uppercase">
                Active gym protocol (target &gt;= 1.0 hr). Standard workout pacing index.
              </p>
            </div>
          </div>

          <div className="h-48 w-full mt-2 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartProcessedData}
                onClick={handleChartNodeClick}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradientGym" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  domain={[0, Math.max(3, ...chartProcessedData.map(d => d.gymHours))]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 15, 30, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                  labelStyle={{ color: "#10b981" }}
                />

                <ReferenceLine 
                  y={1.0} 
                  stroke="#10b981" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5}
                  label={{ value: "1.0h ATHLETIC MINIMUM", fill: "rgba(16, 185, 129, 0.6)", fontSize: 8, position: "top", fontFamily: "JetBrains Mono" }} 
                />

                <Area
                  type="monotone"
                  dataKey="gymHours"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientGym)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#a7f3d0" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
