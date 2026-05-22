import type { TelemetryState, DailyLog, Listener } from '../types';
import { validateLogEntry } from './Validation';

const STORAGE_KEY = 'apex_telemetry_data';

function getInitialState(): TelemetryState {
  const stored = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toISOString().split('T')[0];
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.currentDate) parsed.currentDate = today;
      return parsed;
    } catch (e) {
      console.error('Failed to parse stored state', e);
    }
  }
  
  return {
    logs: {},
    currentDate: today,
  };
}

class Store {
  private state: TelemetryState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = getInitialState();
  }

  getState() {
    return this.state;
  }

  setCurrentDate(dateStr: string) {
    this.state.currentDate = dateStr;
    this.persist();
    this.notify();
  }

  getLogForDate(dateStr: string): DailyLog {
    return this.state.logs[dateStr] || {
      id: dateStr,
      codingHours: 0,
      sleepHours: 0,
      gymHours: 0,
      waterLiters: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      socialMinutes: 0
    };
  }

  updateLog(dateStr: string, updates: Partial<DailyLog>) {
    const currentLog = this.getLogForDate(dateStr);
    const validUpdates = validateLogEntry(updates);
    
    this.state.logs[dateStr] = { ...currentLog, ...validUpdates };
    this.persist();
    this.notify();
  }

  exportData(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importData(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object' && parsed.logs) {
        this.state = parsed;
        this.persist();
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }

  resetData() {
    this.state = {
      logs: {},
      currentDate: new Date().toISOString().split('T')[0],
    };
    this.persist();
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const telemetryStore = new Store();
