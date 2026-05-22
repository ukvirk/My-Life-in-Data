import './style.css';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DailyTelemetry {
  date: string;
  hoursCoded: number;
  sleepHours: number;
  gymYogaHours: number;
  screenTime: number;
  familyFriendsTime: number;
  waterLiters: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

function generateRawTelemetry(): DailyTelemetry[] {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2026-05-${(i + 1).toString().padStart(2, '0')}`,
    hoursCoded: 2 + Math.random() * 6,
    sleepHours: 5 + Math.random() * 3,
    gymYogaHours: Math.random() * 2,
    screenTime: 4 + Math.random() * 5,
    familyFriendsTime: 1 + Math.random() * 3,
    waterLiters: 1.5 + Math.random() * 2.5,
    proteinGrams: 100 + Math.random() * 60,
    carbsGrams: 180 + Math.random() * 120,
    fatGrams: 45 + Math.random() * 40,
  }));
}

const operationalData = generateRawTelemetry();

function bootstrapAnalytics(data: DailyTelemetry[]) {
  const timeCtx = document.getElementById('timeMatrixChart') as HTMLCanvasElement;
  new Chart(timeCtx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.date),
      datasets: [
        { label: 'Hours Coded', data: data.map(d => d.hoursCoded), backgroundColor: '#FF1A69' },
        { label: 'Sleep Metric', data: data.map(d => d.sleepHours), backgroundColor: '#06B6D4' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

bootstrapAnalytics(operationalData);