export const BENCHMARKS = {
  codingHours: { min: 4, max: 12, label: 'Coding (hrs)' },
  sleepHours: { min: 7, max: 10, label: 'Sleep (hrs)' },
  gymHours: { min: 0.5, max: 2, label: 'Gym/Yoga (hrs)' },
  waterLiters: { min: 3.0, max: 5, label: 'Water (L)' },
  proteinGrams: { min: 50, max: 200, label: 'Protein (g)' },
  carbsGrams: { min: 130, max: 400, label: 'Carbs (g)' },
  socialMinutes: { min: 30, max: 300, label: 'Social (mins)' },
};

// Check if a metric is below the WHO or optimal threshold
export function isBelowThreshold(metric: keyof typeof BENCHMARKS, value: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return true;
  return value < BENCHMARKS[metric].min;
}
