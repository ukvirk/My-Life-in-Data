import './style.css';
import { Chart, registerables } from 'chart.js';
import type { ChartOptions } from 'chart.js';

Chart.register(...registerables);

// --- 1. SYSTEM BOOT SEQUENCER ---
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('boot-loader');
  const appContainer = document.getElementById('app');

  setTimeout(() => {
    if (loader) loader.style.opacity = '0';
    
    setTimeout(() => {
      if (loader) loader.style.display = 'none';
      if (appContainer) {
        appContainer.classList.remove('hidden');
        appContainer.style.opacity = '1';
      }
      
      // Activate animations sequentially
      document.querySelectorAll('.animate-in').forEach(el => {
        el.classList.add('active');
      });
      
      initializeCommandCenter();
    }, 600);
  }, 1000);
});

// --- 2. EXPERT TELEMETRY DATA GENERATION ---
interface LifeTelemetry {
  date: string;
  hoursCoded: number;
  sleepHours: number;
  waterLiters: number;
}

const analyticsDataset: LifeTelemetry[] = Array.from({ length: 12 }, (_, i) => ({
  date: `D-${String(i + 1).padStart(2, '0')}`,
  hoursCoded: 4 + Math.random() * 5,
  sleepHours: 6 + Math.random() * 2,
  waterLiters: 2 + Math.random() * 2,
}));

// --- 3. CORE DISPLAY CONTROL ARCHITECTURE ---
function initializeCommandCenter() {
  Chart.defaults.color = '#8A8D9E';
  Chart.defaults.font.family = "'Inter', sans-serif";
  
  const targetGridLines = {
    color: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'transparent',
    drawTicks: false
  };

  const sharedConfigOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, font: { size: 11, weight: '500' } }
      },
      tooltip: {
        backgroundColor: '#0A0B10',
        titleFont: { size: 12, family: 'Inter', weight: 'bold' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        displayColors: true
      }
    },
    scales: {
      x: { grid: targetGridLines },
      y: { grid: targetGridLines, beginAtZero: true }
    }
  };

  // --- RENDERING CONFIGURATION 1: GRAPHING LINE LINES ---
  const timeCanvas = document.getElementById('timeMatrixChart') as HTMLCanvasElement;
  if (timeCanvas) {
    const ctx = timeCanvas.getContext('2d')!;
    const codingFill = ctx.createLinearGradient(0, 0, 0, 300);
    codingFill.addColorStop(0, 'rgba(255, 26, 105, 0.35)');
    codingFill.addColorStop(1, 'rgba(255, 26, 105, 0.0)');

    const sleepFill = ctx.createLinearGradient(0, 0, 0, 300);
    sleepFill.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    sleepFill.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    new Chart(timeCanvas, {
      type: 'line',
      data: {
        labels: analyticsDataset.map(d => d.date),
        datasets: [
          {
            label: 'Deep Coding (Hrs)',
            data: analyticsDataset.map(d => d.hoursCoded),
            borderColor: '#FF1A69',
            backgroundColor: codingFill,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#FF1A69'
          },
          {
            label: 'Sleep Rest Cycle (Hrs)',
            data: analyticsDataset.map(d => d.sleepHours),
            borderColor: '#00F0FF',
            backgroundColor: sleepFill,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#00F0FF'
          }
        ]
      },
      options: sharedConfigOptions
    });
  }

  // --- RENDERING CONFIGURATION 2: BAR TRACKS ---
  const waterCanvas = document.getElementById('hydrologyBarChart') as HTMLCanvasElement;
  if (waterCanvas) {
    const ctx = waterCanvas.getContext('2d')!;
    const barFill = ctx.createLinearGradient(0, 0, 0, 300);
    barFill.addColorStop(0, '#00F0FF');
    barFill.addColorStop(1, 'rgba(0, 240, 255, 0.05)');

    new Chart(waterCanvas, {
      type: 'bar',
      data: {
        labels: analyticsDataset.map(d => d.date),
        datasets: [{
          label: 'Fluid Consumption (Liters)',
          data: analyticsDataset.map(d => d.waterLiters),
          backgroundColor: barFill,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: sharedConfigOptions
    });
  }

  // --- RENDERING CONFIGURATION 3: MACRO DONUT ---
  const macroCanvas = document.getElementById('macrosDoughnutChart') as HTMLCanvasElement;
  if (macroCanvas) {
    new Chart(macroCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbohydrates', 'Essential Fats'],
        datasets: [{
          data: [175, 240, 70],
          backgroundColor: ['#FF1A69', '#00F0FF', '#8A2BE2'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8, padding: 20, color: '#FFFFFF' }
          }
        }
      }
    });
  }
}