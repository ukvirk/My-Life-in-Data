export interface TelemetryRecord {
  id: string;
  date: string; // e.g. "May 22"
  codeHours: number;
  sleepHours: number;
  waterLiters: number;
  proteinGrams: number;
  bodyWeightKg: number;
  gymHours: number;
  notes?: string;
  timestamp: number;
}

export interface TelemetryState {
  records: TelemetryRecord[];
  activeRange: "day" | "week" | "month" | "all";
  selectedRecordId: string | null;
  weightFilter: number; // User default weight to apply if custom is missing
  isHudOpen: boolean;
}

export type TelemetryAction =
  | { type: "SET_RECORDS"; payload: TelemetryRecord[] }
  | { type: "ADD_RECORD"; payload: TelemetryRecord }
  | { type: "UPDATE_RECORD"; payload: TelemetryRecord }
  | { type: "DELETE_RECORD"; payload: string }
  | { type: "SET_ACTIVE_RANGE"; payload: "day" | "week" | "month" | "all" }
  | { type: "SET_SELECTED_RECORD"; payload: string | null }
  | { type: "SET_HUD_OPEN"; payload: boolean }
  | { type: "SET_WEIGHT"; payload: number }
  | { type: "PURGE_DATA" };

export interface ComplianceMetrics {
  water: { current: number; target: number; status: "PASS" | "WARNING" };
  protein: { current: number; target: number; status: "PASS" | "ALERT" };
  sleep: { current: number; target: number; status: "PASS" | "CRITICAL" };
  code: { current: number; target: number; minTarget: number; maxTarget: number; status: "PASS" | "BURNOUT_RISK" | "INSUFFICIENT" };
  gym: { current: number; target: number; status: "PASS" | "WARNING" };
  overallScore: number; // percentage of elements met
}
