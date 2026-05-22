export interface DailyLog {
  id: string; // ISO date string e.g., '2026-05-22'
  codingHours: number;
  sleepHours: number;
  gymHours: number;
  waterLiters: number;
  proteinGrams: number;
  carbsGrams: number;
  socialMinutes: number;
}

export interface TelemetryState {
  logs: Record<string, DailyLog>; // Keyed by date
  currentDate: string; // The date currently being viewed/edited
}

export type Listener = () => void;
