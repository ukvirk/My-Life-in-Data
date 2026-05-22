import './style.css';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface LifeTelemetry {
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
  focusScore: number;
}

function generateDataStream(): LifeTelemetry[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = (i + 17).toString(); // Centered around mid-May 2026
    return {
      date: `May ${day}`,
      hoursCoded: 5 + Math.random() * 4,
      sleepHours: 6 + Math.random() * 2,
      gymYogaHours: Math.random() > 0.3 ? 1 + Math.random() : 0.5,
      screenTime: 4 + Math.random() * 3,
      familyFriendsTime: 2 + Math.random() * 2,
      waterLiters: 2.2 + Math.random() * 1.8,
      proteinGrams: 130 + Math.random() * 40,
      carbsGrams: 200 + Math.random() * 60,
      fatGrams: 60 + Math.random() * 20,
      focusScore: Math.floor(7 + Math.random() * 3)
    };
  });
}

const operationalLog = generateDataStream();

function bootstrapAnalytics() {
  const commonGrid = {
    grid: { color: 'rgba(51, 53, 74, 0.4)' },
    ticks: { color: '#A6A8B8', font: { family: 'Montserrat', weight: 600 } }
  };

  // --- TIME MATRIX CHART ---
  const timeCtx = document.getElementById('timeMatrixChart') as HTMLCanvasElement;
  if (timeCtx) {
    const ctx = timeCtx.getContext('2d');
    const gradCoded = ctx?.createLinearGradient(0, 0, 0, 300);
    gradCoded?.addColorStop(0, 'rgba(255, 26, 105, 0.4)');
    gradCoded?.addColorStop(1, 'rgba(255, 26, 105, 0.0)');

    new Chart(timeCtx, {
      type: 'line',
      data: {
        labels: operationalLog.map(d => d.date),
        datasets: [
          { label: 'Hours Coded', data: operationalLog.map(d => d.hoursCoded), borderColor: '#FF1A69', backgroundColor: gradCoded || '#FF1A69', fill: true, tension: 0.4, borderWidth: 3 },
          { label: 'Sleep', data: operationalLog.map(d => d.sleepHours), borderColor: '#06B6D4', backgroundColor: 'transparent', tension: 0.4, borderWidth: 3 },
          { label: 'Screen Time', data: operationalLog.map(d => d.screenTime), borderColor: '#F59E0B', borderDash: [6, 6], fill: false, tension: 0.1 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#F4F6FF', font: { family: 'Montserrat', weight: 600 } } } },
        scales: { x: commonGrid, y: commonGrid }
      }
    });
  }

  // --- MACRO BREAKDOWN CHART ---
  const macroCtx = document.getElementById('macrosDoughnutChart') as HTMLCanvasElement;
  if (macroCtx) {
    new Chart(macroCtx, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fats'],
        datasets: [{
          data: [160, 240, 70],
          backgroundColor: ['#10B981', '#3B82F6', '#EC4899'],
          borderWidth: 4,
          borderColor: '#1E2030'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#F4F6FF', font: { family: 'Montserrat', weight: 600 } } } }
      }
    });
  }

  // --- HYDROLOGY LOG CHART ---
  const waterCtx = document.getElementById('hydrologyBarChart') as HTMLCanvasElement;
  if (waterCtx) {
    new Chart(waterCtx, {
      type: 'bar',
      data: {
        labels: operationalLog.map(d => d.date),
        datasets: [{
          label: 'Liters',
          data: operationalLog.map(d => d.waterLiters),
          backgroundColor: '#06B6D4',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: commonGrid, y: commonGrid }
      }
    });
  }

  // --- BIOMETRIC PERFORMANCE INDEX ---
  const perfCtx = document.getElementById('performanceScatterChart') as HTMLCanvasElement;
  if (perfCtx) {
    new Chart(perfCtx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Gym + Family Hours vs Focus Score',
          data: operationalLog.map(d => ({ x: d.gymYogaHours + d.familyFriendsTime, y: d.focusScore })),
          backgroundColor: '#FF1A69',
          pointRadius: 8,
          pointHoverRadius: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#F4F6FF', font: { family: 'Montserrat', weight: 600 } } } },
        scales: {
          x: { ...commonGrid, title: { display: true, text: 'Recovery Output (Hours)', color: '#A6A8B8', font: { family: 'Montserrat', weight: 600 } } },
          y: { ...commonGrid, title: { display: true, text: 'Focus Score (1-10)', color: '#A6A8B8', font: { family: 'Montserrat', weight: 600 } } }
        }
      }
    });
  }
}

// FORCE RUN AFTER ELEMENT TREE MOUNTS
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAnalytics);
} else {
  bootstrapAnalytics();
}