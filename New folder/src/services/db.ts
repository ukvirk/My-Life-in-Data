import { TelemetryRecord } from "../types";

const DB_NAME = "ApexTelemetryDB";
const STORE_NAME = "records";
const DB_VERSION = 1;

/**
 * High-performance browser IndexedDB utility wrapper.
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

export async function getAllRecords(): Promise<TelemetryRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB error, falling back to LocalStorage:", err);
    // LocalStorage fallback in case of strict privacy mode / iframe constraints
    const local = localStorage.getItem("apex_telemetry_records");
    return local ? JSON.parse(local) : [];
  }
}

export async function saveRecord(record: TelemetryRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB save error, falling back to LocalStorage:", err);
    const records = await getAllRecords();
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem("apex_telemetry_records", JSON.stringify(records));
  }
}

export async function deleteRecord(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB delete error, falling back to LocalStorage:", err);
    const records = await getAllRecords();
    const filtered = records.filter((r) => r.id !== id);
    localStorage.setItem("apex_telemetry_records", JSON.stringify(filtered));
  }
}

export async function clearAllRecords(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB clear error, falling back to LocalStorage:", err);
    localStorage.removeItem("apex_telemetry_records");
  }
}

/**
 * Seed telemetry records representing a week of elite programmer performance.
 */
export const SEED_RECORDS: TelemetryRecord[] = [
  {
    id: "seed-1",
    date: "May 15",
    codeHours: 5.5,
    sleepHours: 7.5,
    waterLiters: 2.8,
    proteinGrams: 130,
    bodyWeightKg: 78,
    gymHours: 1.5,
    notes: "Perfect deep work flow. Solved heavy DB optimization.",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-2",
    date: "May 16",
    codeHours: 6.0,
    sleepHours: 7.2,
    waterLiters: 2.4, // warning water (target is 2.5)
    proteinGrams: 110, // slightly low protein (110 / 78 = 1.41 < 1.6)
    bodyWeightKg: 78,
    gymHours: 1.2,
    notes: "Shipped the main state controller logic. High focus, forgot to hydrate fully.",
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-3",
    date: "May 17",
    codeHours: 4.5,
    sleepHours: 6.5, // Sleep warning (< 7)
    waterLiters: 3.1,
    proteinGrams: 145,
    bodyWeightKg: 78,
    gymHours: 2.0,
    notes: "Heavy leg day routine. High hydration and protein target achieved.",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-4",
    date: "May 18",
    codeHours: 9.5, // Burnout alarm (> 9)
    sleepHours: 5.8, // Sleep critical (< 7)
    waterLiters: 2.1,
    proteinGrams: 95,
    bodyWeightKg: 78,
    gymHours: 0, // No workout
    notes: "Severe crunch hour resolving memory leak on server proxy. Demanding day.",
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-5",
    date: "May 19",
    codeHours: 3.5,
    sleepHours: 8.5, // Recovered sleep
    waterLiters: 3.2,
    proteinGrams: 150,
    bodyWeightKg: 78,
    gymHours: 1.0,
    notes: "Active restoration day. Cleared inbox, focused on physical therapy.",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-6",
    date: "May 20",
    codeHours: 5.0,
    sleepHours: 7.8,
    waterLiters: 2.9,
    proteinGrams: 135,
    bodyWeightKg: 78,
    gymHours: 1.5,
    notes: "Refactored rendering engine with canvas caches. Flow state achieved.",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-7",
    date: "May 21",
    codeHours: 5.2,
    sleepHours: 7.4,
    waterLiters: 2.7,
    proteinGrams: 140,
    bodyWeightKg: 78,
    gymHours: 1.2,
    notes: "Pre-deployment telemetry check. Full compliance, operational baseline excellent.",
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

export async function checkAndSeedDB(): Promise<TelemetryRecord[]> {
  const records = await getAllRecords();
  if (records.length === 0) {
    console.log("Seeding telemetry database with high-performance records...");
    for (const record of SEED_RECORDS) {
      await saveRecord(record);
    }
    return SEED_RECORDS;
  }
  return records;
}
