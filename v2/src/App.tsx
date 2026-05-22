import { useState } from "react";
import { TelemetryProvider, useTelemetry } from "./context/TelemetryContext";
import { CommandHud } from "./components/CommandHud";
import { DiagnosticsFeed } from "./components/DiagnosticsFeed";
import { TelemetryChartset } from "./components/TelemetryChartset";
import { TimelineSlider } from "./components/TimelineSlider";
import { 
  Plus, 
  Trash2, 
  Activity, 
  User, 
  Settings, 
  Cpu, 
  HelpCircle,
  Database,
  Grid
} from "lucide-react";

function MainDashboardContent() {
  const { state, dispatch, purgeTelemetry } = useTelemetry();
  const { records, weightFilter } = state;

  const handlePurge = async () => {
    if (window.confirm("CRITICAL PROTOCOL: Are you sure you want to purge all telemetry logs from local IndexedDB storage? This cannot be undone.")) {
      await purgeTelemetry();
    }
  };

  const activeDaysCount = records.length;

  return (
    <div className="min-h-screen bg-slate-950 neo-grid-bg flex flex-col lg:flex-row text-slate-100">
      
      {/* SIDEBAR DECK */}
      <aside className="w-full lg:w-80 bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between p-6 flex-shrink-0 z-10 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        
        {/* Profile Card Block */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center border border-white/10 shadow-lg shadow-cyan-950/20">
              <User className="w-6 h-6 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display font-bold tracking-tight text-md text-slate-100 uppercase">
                  OPERATOR_DECK
                </h2>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff95] animate-ping inline-block" />
              </div>
              <p className="text-[10px] font-mono text-[#00ff95] compliance-pass font-medium uppercase tracking-widest">
                OS V_3.1.20_C
              </p>
            </div>
          </div>

          {/* Quick Stats / Parameters Form */}
          <div className="space-y-4">
            <div>
              <button
                id="btn-open-hud"
                onClick={() => dispatch({ type: "SET_HUD_OPEN", payload: true })}
                className="w-full bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/20 text-white rounded-lg py-3 text-xs font-mono font-bold tracking-wider hover:shadow-cyan-950/50 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase"
              >
                <Plus className="w-4 h-4" />
                Log New Metrics
              </button>
            </div>

            {/* Operator Global Thresholds Settings slider */}
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Operator Parameters
                </span>
              </div>
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 flex justify-between">
                  <span>Standard Weight Limit:</span>
                  <span className="text-cyan-400 font-bold">{weightFilter} kg</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="150"
                  value={weightFilter}
                  onChange={(e) => dispatch({ type: "SET_WEIGHT", payload: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 py-1 cursor-ew-resize bg-slate-800 rounded h-1 appearance-none"
                />
                <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase text-right leading-none">
                  Calibrates Nitrogen (g/kg) scale targets
                </p>
              </div>
            </div>

            {/* General Log Integrity indicators */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-2.5 border border-white/5 rounded-lg text-[10px] font-mono uppercase">
              <div className="border-r border-white/5 text-center">
                <span className="block text-[8px] text-slate-500">Telemetry Array</span>
                <span className="text-slate-200 font-bold mt-1 block">{activeDaysCount} Days</span>
              </div>
              <div className="text-center">
                <span className="block text-[8px] text-slate-500">Hardware Buffer</span>
                <span className="text-[#00ff95] compliance-pass font-bold mt-1 block flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-[#00ff95]" />
                  CYB_ON
                </span>
              </div>
            </div>
          </div>

          {/* LATEST DIAGNOSTICS DECK */}
          <div className="pt-2 flex-1">
            <DiagnosticsFeed />
          </div>
        </div>

        {/* System Administration bottom triggers */}
        <div className="space-y-3 pt-6 lg:pt-0 mt-6 lg:mt-0 border-t lg:border-t-0 border-light/5">
          <button
            id="btn-purge"
            onClick={handlePurge}
            className="w-full bg-red-950/20 hover:bg-red-900/20 border border-red-900/15 text-red-400 rounded-lg py-2.5 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase hover:border-red-500/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Storage Cache
          </button>
          
          <div className="text-[10px] font-mono text-slate-600 uppercase flex items-center justify-between px-1">
            <span>Security protocol code:</span>
            <span>SEC_ERR_0</span>
          </div>
        </div>
      </aside>

      {/* DASHBOARD WORKSPACE GRID */}
      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        
        {/* Workspace Title deck */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse animate-duration-3000" />
              <h1 className="font-display font-medium tracking-tight text-2xl text-slate-100 uppercase">
                BIOLOGICAL_TELEMETRY_DASHBOARD
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wide mt-1">
              Apex Biological Performance Matrix • Dynamic Compliance Shading & Diagnostics
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase">
            <span className="px-2.5 py-1.5 bg-slate-900 border border-white/5 rounded text-indigo-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              IndexedDB local storage active
            </span>
            <span className="px-2.5 py-1.5 bg-slate-900 border border-white/5 rounded text-[#00ff95] compliance-pass flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff95] block animate-pulse" />
              SYS_OPERATIONAL
            </span>
          </div>
        </header>

        {/* 4 Core Charts Bento Grid Section */}
        <section className="space-y-6">
          <TelemetryChartset />
        </section>

        {/* Interactive Scrubbing Navigation History Frame */}
        <section className="pt-2">
          <TimelineSlider />
        </section>
        
        {/* Humble small footer with developer help tip */}
        <footer className="pt-2 text-center text-[9px] font-mono text-slate-500 uppercase flex items-center justify-center gap-2">
          <span>APEX COMMAND CENTER PLATFORM</span>
          <span>•</span>
          <span>PRESS [ESC] TO CLOSE MULTI-INPUT HUD</span>
          <span>•</span>
          <span>CLICK CHART BARS TO JUMP DIRECT TO DATE DENSITY</span>
        </footer>
      </main>

      {/* Slideout HUD Dialog */}
      <CommandHud />
    </div>
  );
}

export default function App() {
  return (
    <TelemetryProvider>
      <MainDashboardContent />
    </TelemetryProvider>
  );
}
