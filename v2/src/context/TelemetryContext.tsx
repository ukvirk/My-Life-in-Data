import React, { createContext, useContext, useReducer, useEffect } from "react";
import { TelemetryRecord, TelemetryState, TelemetryAction, ComplianceMetrics } from "../types";
import { getAllRecords, saveRecord, deleteRecord, clearAllRecords, checkAndSeedDB } from "../services/db";

const INITIAL_STATE: TelemetryState = {
  records: [],
  activeRange: "week",
  selectedRecordId: null,
  weightFilter: 78,
  isHudOpen: false,
};

function telemetryReducer(state: TelemetryState, action: TelemetryAction): TelemetryState {
  switch (action.type) {
    case "SET_RECORDS":
      // Sort records by timestamp
      const sortedRecords = [...action.payload].sort((a, b) => a.timestamp - b.timestamp);
      return {
        ...state,
        records: sortedRecords,
        selectedRecordId: state.selectedRecordId || (sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1].id : null),
      };

    case "ADD_RECORD": {
      const records = [...state.records, action.payload].sort((a, b) => a.timestamp - b.timestamp);
      return {
        ...state,
        records,
        selectedRecordId: action.payload.id,
      };
    }

    case "UPDATE_RECORD": {
      const records = state.records.map((r) => (r.id === action.payload.id ? action.payload : r));
      return {
        ...state,
        records,
      };
    }

    case "DELETE_RECORD": {
      const filtered = state.records.filter((r) => r.id !== action.payload);
      const nextSelected = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
      return {
        ...state,
        records: filtered,
        selectedRecordId: state.selectedRecordId === action.payload ? nextSelected : state.selectedRecordId,
      };
    }

    case "SET_ACTIVE_RANGE":
      return {
        ...state,
        activeRange: action.payload,
      };

    case "SET_SELECTED_RECORD":
      return {
        ...state,
        selectedRecordId: action.payload,
      };

    case "SET_HUD_OPEN":
      return {
        ...state,
        isHudOpen: action.payload,
      };

    case "SET_WEIGHT":
      return {
        ...state,
        weightFilter: action.payload,
      };

    case "PURGE_DATA":
      return {
        ...state,
        records: [],
        selectedRecordId: null,
      };

    default:
      return state;
  }
}

// Evaluate compliance based on Section II: Data Schema & Compliance Logic
export function evaluateCompliance(record: TelemetryRecord): ComplianceMetrics {
  const waterTarget = 2.5;
  const waterStatus = record.waterLiters >= waterTarget ? "PASS" : "WARNING";

  // Protein targets: 1.6g / kg of body weight
  const proteinTarget = record.bodyWeightKg * 1.6;
  const proteinStatus = record.proteinGrams >= proteinTarget ? "PASS" : "ALERT";

  // Sleep: 7 to 9 hours
  const sleepTarget = 7;
  const sleepStatus = record.sleepHours >= sleepTarget ? "PASS" : "CRITICAL";

  // Coding focus: 4 to 6 hours. Current > 9 = Burnout Risk, Current < 4 = Insufficient
  const minCode = 4;
  const maxCode = 6;
  let codeStatus: "PASS" | "BURNOUT_RISK" | "INSUFFICIENT" = "PASS";
  if (record.codeHours > 9) {
    codeStatus = "BURNOUT_RISK";
  } else if (record.codeHours < minCode) {
    codeStatus = "INSUFFICIENT";
  }

  // Gym target (added for the Gym telemetry container)
  const gymTarget = 1.0;
  const gymStatus = record.gymHours >= gymTarget ? "PASS" : "WARNING";

  // Compute Overall Compliance percentage
  let metItems = 0;
  if (waterStatus === "PASS") metItems++;
  if (proteinStatus === "PASS") metItems++;
  if (sleepStatus === "PASS") metItems++;
  if (codeStatus === "PASS" || record.codeHours >= minCode) metItems++; // Active tracking of code targets
  if (gymStatus === "PASS") metItems++;

  const overallScore = Math.round((metItems / 5) * 100);

  return {
    water: { current: record.waterLiters, target: waterTarget, status: waterStatus },
    protein: { current: record.proteinGrams, target: Number(proteinTarget.toFixed(1)), status: proteinStatus },
    sleep: { current: record.sleepHours, target: sleepTarget, status: sleepStatus },
    code: { current: record.codeHours, target: maxCode, minTarget: minCode, maxTarget: maxCode, status: codeStatus },
    gym: { current: record.gymHours, target: gymTarget, status: gymStatus },
    overallScore,
  };
}

interface TelemetryContextProps {
  state: TelemetryState;
  dispatch: React.Dispatch<TelemetryAction>;
  addTelemetry: (record: Omit<TelemetryRecord, "id" | "timestamp">) => Promise<void>;
  updateTelemetry: (record: TelemetryRecord) => Promise<void>;
  removeTelemetry: (id: string) => Promise<void>;
  purgeTelemetry: () => Promise<void>;
  getSelectedRecordDetails: () => { record: TelemetryRecord | null; metrics: ComplianceMetrics | null };
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(telemetryReducer, INITIAL_STATE);

  // Load and seed DB on initialization
  useEffect(() => {
    async function initDB() {
      try {
        const records = await checkAndSeedDB();
        dispatch({ type: "SET_RECORDS", payload: records });
      } catch (err) {
        console.error("Initialization of Telemetry DB seeded records failed:", err);
      }
    }
    initDB();
  }, []);

  const addTelemetry = async (item: Omit<TelemetryRecord, "id" | "timestamp">) => {
    const newRecord: TelemetryRecord = {
      ...item,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    await saveRecord(newRecord);
    dispatch({ type: "ADD_RECORD", payload: newRecord });
  };

  const updateTelemetry = async (record: TelemetryRecord) => {
    await saveRecord(record);
    dispatch({ type: "UPDATE_RECORD", payload: record });
  };

  const removeTelemetry = async (id: string) => {
    await deleteRecord(id);
    dispatch({ type: "DELETE_RECORD", payload: id });
  };

  const purgeTelemetry = async () => {
    await clearAllRecords();
    dispatch({ type: "PURGE_DATA" });
  };

  const getSelectedRecordDetails = () => {
    const record = state.records.find((r) => r.id === state.selectedRecordId) || null;
    const metrics = record ? evaluateCompliance(record) : null;
    return { record, metrics };
  };

  return (
    <TelemetryContext.Provider
      value={{
        state,
        dispatch,
        addTelemetry,
        updateTelemetry,
        removeTelemetry,
        purgeTelemetry,
        getSelectedRecordDetails,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
};
