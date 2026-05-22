import './style.css';
import { Chart, registerables, ChartOptions } from 'chart.js';

Chart.register(...registerables);

// --- 1. BOOT SEQUENCE SIMULATOR ---
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('boot-loader')!.style.opacity = '0';
    setTimeout(() => {
      document.getElementById('boot-loader')!.style.display = 'none';
      document.getElementById('app')!.classList.remove('hidden');
      
      // Trigger animations
      document.querySelectorAll('.animate-in').forEach(el => {
        el.classList.add('active');
      });
      
      initializeCommandCenter();
    }, 800);
  }, 1200); // Simulating system uplink
});

// --- 2. DATA ENGINE ---
interface LifeTelemetry {
  date: string; hoursCoded: number; sleepHours: number; waterLiters: number;
}

const analyticsDataset: LifeTelemetry[] = Array.from({ length: 14 }, (_, i) => ({
  date: `D-0${i + 1}`,
  hoursCoded: 4 + Math.random() * 6,
  sleepHours: 5 + Math.random() * 3,
  waterLiters: 1.5 + Math.random() * 2.5,
}));

// --- 3. PRO GRAPHICS ENGINE ---
function initializeCommandCenter() {
  // Global Chart config for a $1M look
  Chart.defaults.color = '#8A8D9E';
  Chart.defaults.font.family = 'Inter';
  
  const gridConfig = {
    color: 'rgba(255, 255, 255, 0.03)',
    drawBorder: false,
  };

  const commonOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 6, font: { weight: 'bold' } } },
      tooltip: {
        backgroundColor: 'rgba(10, 11, 16, 0.9)', titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' }, padding: 12, cornerRadius: 8,
        borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1
      }
    }
  };

  // CHART 1: TIME MATRIX (WITH CANVAS GRADIENTS)
  const timeCanvas = document.getElementById('timeMatrixChart') as HTMLCanvasElement;
  if (timeCanvas) {
    const ctx = timeCanvas.getContext('2d')!;
    
    // Create glowing gradient for Coded Hours
    const codeGradient = ctx.createLinearGradient(0, 0, 0, 400);
    codeGradient.addColorStop(0, 'rgba(255, 26, 105, 0.5)');
    codeGradient.addColorStop(1, 'rgba(255, 26, 105, 0.0)');

    // Create glowing gradient for Sleep
    const sleepGradient = ctx.createLinearGradient(0, 0, 0, 400);
    sleepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    sleepGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    new Chart(timeCanvas, {
      type: 'line',
      data: {
        labels: analyticsDataset.map(d => d.date),
        datasets: [
          {
            label: 'System Build (Hrs)', data: analyticsDataset.map(d => d.hoursCoded),
            borderColor: '#FF1A69', backgroundColor: codeGradient,
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6
          },
          {
            label: 'Recovery (Hrs)', data: analyticsDataset.map(d => d.sleepHours),
            borderColor: '#00F0FF', backgroundColor: sleepGradient,
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6
          }
        ]
      },
      options: { ...commonOptions, scales: { x: { grid: gridConfig }, y: { grid: gridConfig, beginAtZero: true } } }
    });
  }

  // CHART 2: HYDROLOGY (NEON BARS)
  const waterCanvas = document.getElementById('hydrologyBarChart') as HTMLCanvasElement;
  if (waterCanvas) {
    const ctx = waterCanvas.getContext('2d')!;
    const barGradient = ctx.createLinearGradient(0, 0, 0, 400);
    barGradient.addColorStop(0, '#00F0FF');
    barGradient.addColorStop(1, 'rgba(0, 240, 255, 0.1)');

    new Chart(waterCanvas, {
      type: 'bar',
      data: {
        labels: analyticsDataset.map(d => d.date),
        datasets: [{
          label: 'Volumetric Output (L)', data: analyticsDataset.map(d => d.waterLiters),
          backgroundColor: barGradient, borderRadius: 6, borderSkipped: false
        }]
      },
      options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { x: { grid: gridConfig }, y: { grid: gridConfig } } }
    });
  }

  // CHART 3: MACRO DONUT (GLOWING SEGMENTS)
  const macroCanvas = document.getElementById('macrosDoughnutChart') as HTMLCanvasElement;
  if (macroCanvas) {
    new Chart(macroCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fats'],
        datasets: [{
          data: [180, 220, 65],
          backgroundColor: ['#00F0FF', '#FF1A69', '#8A2BE2'],
          borderWidth: 0, hoverOffset: 10
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, color: '#FFFFFF' } } }
      }
    });
  }
}