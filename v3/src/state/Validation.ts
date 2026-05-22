import type { DailyLog } from '../types';

export function validateLogEntry(data: Partial<DailyLog>): Partial<DailyLog> {
  const validated: Partial<DailyLog> = {};
  
  if (data.codingHours !== undefined) validated.codingHours = Math.max(0, Number(data.codingHours) || 0);
  if (data.sleepHours !== undefined) validated.sleepHours = Math.max(0, Number(data.sleepHours) || 0);
  if (data.gymHours !== undefined) validated.gymHours = Math.max(0, Number(data.gymHours) || 0);
  if (data.waterLiters !== undefined) validated.waterLiters = Math.max(0, Number(data.waterLiters) || 0);
  if (data.proteinGrams !== undefined) validated.proteinGrams = Math.max(0, Number(data.proteinGrams) || 0);
  if (data.carbsGrams !== undefined) validated.carbsGrams = Math.max(0, Number(data.carbsGrams) || 0);
  if (data.socialMinutes !== undefined) validated.socialMinutes = Math.max(0, Number(data.socialMinutes) || 0);
  
  return validated;
}
