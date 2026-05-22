import { telemetryStore } from '../state/Store';
import { BENCHMARKS, isBelowThreshold } from '../logic/Benchmarks';
import type { DailyLog } from '../types';

export class CommandHUD {
  private form = document.getElementById('hud-form') as HTMLFormElement;
  private container = document.getElementById('hud-inputs') as HTMLDivElement;
  private hudAside = document.getElementById('command-hud') as HTMLElement;
  private btnToggle = document.getElementById('btn-toggle-hud') as HTMLButtonElement;
  private btnClose = document.getElementById('btn-close-hud') as HTMLButtonElement;

  constructor() {
    this.renderInputs();
    this.bindEvents();
    this.updateValuesFromState();
    
    // Subscribe to state changes to update the form if the date changes
    telemetryStore.subscribe(() => {
      this.updateValuesFromState();
    });
  }

  private renderInputs() {
    const fields = Object.entries(BENCHMARKS);
    this.container.innerHTML = fields.map(([key, benchmark]) => `
      <div class="flex flex-col gap-1">
        <label class="text-white/70 text-sm font-medium" for="input-${key}">${benchmark.label}</label>
        <input 
          type="number" 
          step="any"
          id="input-${key}" 
          name="${key}" 
          class="glass-input transition-colors duration-300" 
          placeholder="Target: ${benchmark.min}+"
        />
      </div>
    `).join('');
  }

  private bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.commitTelemetry();
    });

    this.container.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.validateField(target.name as keyof typeof BENCHMARKS, parseFloat(target.value));
    });

    this.btnToggle.addEventListener('click', () => {
      this.hudAside.classList.toggle('translate-x-full');
    });

    this.btnClose.addEventListener('click', () => {
      this.hudAside.classList.add('translate-x-full');
    });
  }

  private validateField(name: keyof typeof BENCHMARKS, value: number) {
    const input = document.getElementById(`input-${name}`) as HTMLInputElement;
    if (!input) return;

    if (isBelowThreshold(name, value)) {
      input.classList.add('alert-input');
    } else {
      input.classList.remove('alert-input');
    }
  }

  private updateValuesFromState() {
    const state = telemetryStore.getState();
    const log = telemetryStore.getLogForDate(state.currentDate);
    
    Object.keys(BENCHMARKS).forEach(key => {
      const input = document.getElementById(`input-${key}`) as HTMLInputElement;
      if (input) {
        const val = log[key as keyof DailyLog];
        input.value = val !== undefined && val !== 0 ? val.toString() : ''; // Don't show 0 as string initially if we want placeholder
        this.validateField(key as keyof typeof BENCHMARKS, Number(val) || 0);
      }
    });
  }

  private commitTelemetry() {
    const formData = new FormData(this.form);
    const updates: Partial<DailyLog> = {};
    
    for (const [key, value] of formData.entries()) {
      if (value) {
        (updates as any)[key] = parseFloat(value as string);
      }
    }
    
    const state = telemetryStore.getState();
    telemetryStore.updateLog(state.currentDate, updates);
    
    // Feedback animation
    const submitBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'COMMITTED ✔';
    submitBtn.classList.add('bg-neon-cyan', 'text-background');
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('bg-neon-cyan', 'text-background');
    }, 1500);
  }
}
