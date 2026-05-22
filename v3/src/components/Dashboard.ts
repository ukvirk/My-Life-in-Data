import { telemetryStore } from '../state/Store';
import { BENCHMARKS, isBelowThreshold } from '../logic/Benchmarks';
import type { DailyLog } from '../types';

export class Dashboard {
  private grid = document.getElementById('metric-grid') as HTMLDivElement;

  constructor() {
    this.render();
    telemetryStore.subscribe(() => {
      this.render();
    });
  }

  private render() {
    const state = telemetryStore.getState();
    const log = telemetryStore.getLogForDate(state.currentDate);
    const fields = Object.entries(BENCHMARKS);

    this.grid.innerHTML = fields.map(([key, benchmark]) => {
      const val = log[key as keyof DailyLog] || 0;
      const isAlert = isBelowThreshold(key as keyof typeof BENCHMARKS, val as number);
      
      return `
        <div class="glass-panel p-4 flex flex-col gap-2 transition-all duration-300 ${isAlert ? 'alert-card' : ''}">
          <div class="text-white/60 text-xs font-medium uppercase tracking-wider">${benchmark.label}</div>
          <div class="text-3xl font-bold ${isAlert ? 'text-neon-pink animate-pulse-subtle' : 'text-white'}">${val}</div>
          <div class="text-[10px] text-white/40 mt-auto">Target: ${benchmark.min}</div>
        </div>
      `;
    }).join('');
  }
}
