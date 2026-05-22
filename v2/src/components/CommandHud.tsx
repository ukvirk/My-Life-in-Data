import React, { useState, useEffect } from "react";
import { useTelemetry } from "../context/TelemetryContext";
import { X, HardDrive, Database, ShieldAlert, Award } from "lucide-react";

export const CommandHud: React.FC = () => {
  const { state, dispatch, addTelemetry, updateTelemetry } = useTelemetry();
  const { isHudOpen, selectedRecordId, records } = state;

  const editingRecord = records.find((r) => r.id === selectedRecordId);

  const [date, setDate] = useState("");
  const [codeHours, setCodeHours] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [waterLiters, setWaterLiters] = useState("");
  const [gymHours, setGymHours] = useState("");
  const [bodyWeightKg, setBodyWeightKg] = useState("78");
  const [proteinGrams, setProteinGrams] = useState("130");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isEditing = !!editingRecord;

  // Handle ESC key to close HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isHudOpen) {
        dispatch({ type: "SET_HUD_OPEN", payload: false });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHudOpen, dispatch]);

  // Set default date to today
  useEffect(() => {
    if (isHudOpen) {
      if (editingRecord) {
        setDate(editingRecord.date);
        setCodeHours(editingRecord.codeHours.toString());
        setSleepHours(editingRecord.sleepHours.toString());
        setWaterLiters(editingRecord.waterLiters.toString());
        setGymHours(editingRecord.gymHours.toString());
        setBodyWeightKg(editingRecord.bodyWeightKg.toString());
        setProteinGrams(editingRecord.proteinGrams.toString());
        setNotes(editingRecord.notes || "");
      } else {
        // Auto-generate date label based on current time
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        const autoDate = today.toLocaleDateString("en-US", options); // e.g., "May 22"
        setDate(autoDate);
        setCodeHours("5.0");
        setSleepHours("7.5");
        setWaterLiters("2.5");
        setGymHours("1.0");
        setBodyWeightKg(state.weightFilter.toString());
        setProteinGrams("130");
        setNotes("");
      }
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isHudOpen, editingRecord, state.weightFilter]);

  if (!isHudOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!date.trim()) {
      setErrorMsg("Error Identity: Date tag must not be empty.");
      return;
    }

    const recData = {
      date: date.trim(),
      codeHours: parseFloat(codeHours) || 0,
      sleepHours: parseFloat(sleepHours) || 0,
      waterLiters: parseFloat(waterLiters) || 0,
      gymHours: parseFloat(gymHours) || 0,
      bodyWeightKg: parseFloat(bodyWeightKg) || 75,
      proteinGrams: parseFloat(proteinGrams) || 0,
      notes: notes.trim(),
    };

    // Logical upper bounds protection
    if (recData.codeHours < 0 || recData.codeHours > 24) {
      setErrorMsg("Data Fault: Code Duration must be in range [0, 24] hours.");
      return;
    }
    if (recData.sleepHours < 0 || recData.sleepHours > 24) {
      setErrorMsg("Data Fault: Rest Cycle must be in range [0, 24] hours.");
      return;
    }
    if (recData.waterLiters < 0 || recData.waterLiters > 15) {
      setErrorMsg("Data Fault: Water volume exceeds safety envelope.");
      return;
    }

    try {
      if (editingRecord) {
        // Update
        await updateTelemetry({
          ...editingRecord,
          ...recData,
        });
        setSuccessMsg("Telemetry Record updated.");
      } else {
        // Create new
        await addTelemetry(recData);
        setSuccessMsg("Telemetry Record committed to database.");
      }

      // Sync active global user weight scale
      dispatch({ type: "SET_WEIGHT", payload: recData.bodyWeightKg });

      // Automatically slide close on success and yield focus
      setTimeout(() => {
        dispatch({ type: "SET_HUD_OPEN", payload: false });
      }, 800);
    } catch (err: any) {
      setErrorMsg(`Persistence Fault: ${err.message || "Failed to commit metrics"}`);
    }
  };

  // Real-time compliance assessment preview in HUD panel
  const pWeight = parseFloat(bodyWeightKg) || 75;
  const pProtein = parseFloat(proteinGrams) || 0;
  const proteinRatio = pWeight > 0 ? pProtein / pWeight : 0;
  const targetProtein = pWeight * 1.6;

  const isCodeCritical = parseFloat(codeHours) > 9;
  const isSleepCritical = parseFloat(sleepHours) < 7;
  const isWaterWarn = parseFloat(waterLiters) < 2.5;
  const isProteinWarn = proteinRatio < 1.6;
  const isWorkoutWarn = parseFloat(gymHours) < 1.0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Click outside to close HUD */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: false })}
      />

      <div 
        className="glass-panel w-full max-w-md h-full flex flex-col justify-between border-l border-[#00ff95]/10 text-slate-100 shadow-2xl relative overflow-hidden"
        style={{ WebkitBackdropFilter: "blur(24px)" }}
      >
        {/* Subtle scanning cyberline at upper border */}
        <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/30 via-[#00ff95] to-indigo-500/30 animate-pulse" />

        {/* HUD Upper Block */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00ff95] animate-pulse" />
            <div>
              <h2 className="font-display font-medium tracking-tight text-lg text-slate-100 uppercase">
                {isEditing ? "AMEND_METRICS" : "DATA_INGESTION_HUD"}
              </h2>
              <p className="text-[10px] font-mono text-[#00ff95] compliance-pass uppercase tracking-widest">
                SYS_STATUS: READY FOR WRITE
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: false })}
            className="p-1 px-2 text-xs font-mono border border-white/10 rounded-md text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            [ESC]
          </button>
        </div>

        {/* HUD Data Form container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 border border-red-500/20 bg-red-950/30 rounded-md text-xs font-mono text-red-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 border border-emerald-500/20 bg-emerald-950/30 rounded-md text-xs font-mono text-emerald-400 flex items-start gap-2">
              <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Date Tag */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Date Segment Identity
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. May 22"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-md p-2.5 px-3 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-500 uppercase">
                  LABEL
                </span>
              </div>
            </div>

            {/* Code Hours and Rest Cycles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Deep Code (Hrs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={codeHours}
                    onChange={(e) => setCodeHours(e.target.value)}
                    placeholder="0.0"
                    className={`w-full bg-slate-950/60 border rounded-md p-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all ${
                      isCodeCritical
                        ? "border-red-500 text-red-300 bg-red-950/10"
                        : "border-white/10 text-slate-100 focus:border-cyan-500"
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-500">
                    HRS
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Rest Cycle (Hrs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="0.0"
                    className={`w-full bg-slate-950/60 border rounded-md p-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all ${
                      isSleepCritical
                        ? "border-amber-500 text-amber-300 bg-amber-950/10"
                        : "border-white/10 text-slate-100 focus:border-cyan-500"
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-500">
                    HRS
                  </span>
                </div>
              </div>
            </div>

            {/* Hydration / Gym Routine */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Hydration (Liters)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    required
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(e.target.value)}
                    placeholder="0.0"
                    className={`w-full bg-slate-950/60 border rounded-md p-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all ${
                      isWaterWarn
                        ? "border-cyan-500/45 text-cyan-200"
                        : "border-white/10 text-slate-100 focus:border-cyan-500"
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-500">
                    L
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Gym Routine (Hrs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={gymHours}
                    onChange={(e) => setGymHours(e.target.value)}
                    placeholder="0.0"
                    className={`w-full bg-slate-950/60 border rounded-md p-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all ${
                      isWorkoutWarn
                        ? "border-white/10 text-slate-100 focus:border-cyan-500"
                        : "border-emerald-500/40 text-emerald-200"
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-500">
                    HRS
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Biological Weight + Protein Assessment values */}
            <div className="bg-slate-950/40 border border-white/5 rounded-md p-3 space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 border-b border-white/5 pb-1">
                Bio-Compliance Parameters (g/kg Protein)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Body Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    required
                    value={bodyWeightKg}
                    onChange={(e) => setBodyWeightKg(e.target.value)}
                    placeholder="75"
                    className="w-full bg-slate-900 border border-white/10 rounded-md p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Protein Intake (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    required
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-900 border border-white/10 rounded-md p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Real-time feedback ticker on protein calculation */}
              <div className="text-[10px] font-mono flex justify-between items-center text-slate-400 pt-1">
                <span>INTAKE: <strong className="text-slate-200">{pProtein}g</strong></span>
                <span>RATIO: <strong className={isProteinWarn ? "text-amber-400" : "text-[#00ff95] compliance-pass"}>{proteinRatio.toFixed(2)} g/kg</strong></span>
                <span>REQ Target: <strong className="text-slate-300">{targetProtein.toFixed(0)}g</strong></span>
              </div>
            </div>

            {/* Notes Descriptor */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Workspace Note / Objective Log
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Diagnostic highlights, accomplishments during code session, muscle groups activated..."
                rows={3}
                className="w-full bg-slate-950/60 border border-white/10 rounded-md p-2.5 px-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
              />
            </div>
          </div>
        </form>

        {/* HUD Bottom Panel Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-white/5 space-y-3">
          {/* Real-time system compliance evaluation readout */}
          <div className="flex items-center justify-between text-xs font-mono bg-slate-900/60 border border-white/5 rounded-md p-2.5">
            <span className="text-slate-400 uppercase">Interactive Threat Estimate:</span>
            {isCodeCritical || isSleepCritical ? (
              <span className="text-[#ef4444] compliance-fail font-bold uppercase animate-pulse flex items-center gap-1">
                ⚠️ HEALTH BURDEN DETECTED
              </span>
            ) : isWaterWarn || isProteinWarn || isWorkoutWarn ? (
               <span className="text-amber-400 uppercase font-semibold">
                ⚠️ SLIGHT DEFICIT
              </span>
            ) : (
              <span className="text-[#00ff95] compliance-pass font-bold uppercase flex items-center gap-1">
                ✓ ALL BASES MET
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: false })}
              className="w-full bg-slate-900 border border-white/10 rounded-md py-3 text-xs font-mono font-medium text-slate-300 hover:bg-slate-800 transition-all cursor-pointer uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full bg-[#00ff95] text-slate-950 border border-[#00ff95]/30 rounded-md py-3 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-lg shadow-[#00ff95]/15 uppercase flex items-center justify-center gap-2 hover:brightness-110"
            >
              <HardDrive className="w-3.5 h-3.5" />
              {isEditing ? "Apply Amend" : "Commit Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
