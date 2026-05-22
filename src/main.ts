import './style.css';
import { Chart, registerables } from 'chart.js';
import type { ChartOptions } from 'chart.js';

Chart.register(...registerables);

// --- 1. DATA ARCHITECTURE & LOCAL STORAGE ---
interface DailyMetrics {
  date: string;
  coding: number;
  sleep: number;
  gym: number;
  water: number;
  protein: number;
  carbs: number;
  family: number;
}

// Generate a 7-day trailing log. The last item is TODAY (live data).
function initializeState(): DailyMetrics[] {
  const savedData = localStorage.getItem('eliteTelemetry');
  if (savedData) return JSON.parse(savedData);

  return Array.from({ length: 7 }, (_, i) => ({
    date: `Day -${6 - i}`,
    coding: i === 6 ? 0 : 4 + Math.random() * 4,
    sleep: i === 6 ? 0 : 5 + Math.random() * 3,
    gym: i === 6 ? 0 : Math.random() * 2,
    water: i === 6 ? 0 : 1.5 + Math.random() * 2,
    protein: i === 6 ? 0 : 120 + Math.random() * 50,
    carbs: i === 6 ? 0 : 180 + Math.random() * 80,
    family: i === 6 ? 0 : 30 + Math.random() * 120,
  }));
}

let metricsState = initializeState();
let currentOperator = localStorage.getItem('operatorName') || '';

// --- 2. GLOBAL CHART INSTANCES ---
let timeChart: Chart;
let waterChart: Chart;
let macroChart: Chart;

// --- 3. SYSTEM BOOTSTRAP & DOM BINDING ---
window.addEventListener('DOMContentLoaded', () => {
  const gate = document.getElementById('identity-gate');
  const app = document.getElementById('app');
  const operatorInput = document.getElementById('operator-name-input') as HTMLInputElement;
  const initBtn = document.getElementById('init-system-btn');
  const displayOperator = document.getElementById('display-operator');

  if (currentOperator) {
    if (gate) gate.style.display = 'none';
    if (app) app.classList.remove('hidden');
    if (displayOperator) displayOperator.innerText = currentOperator;
    mountEngine();
  }

  initBtn?.addEventListener('click', () => {
    const val = operatorInput.value.trim();
    if (val) {
      currentOperator = val;
      localStorage.setItem('operatorName', val);
      if (displayOperator) displayOperator.innerText = currentOperator;
      if (gate) {
        gate.style.opacity = '0';
        setTimeout(() => { gate.style.display = 'none'; app?.classList.remove('hidden'); mountEngine(); }, 600);
      }
    }
  });

  setupHUDControls();
});

// --- 4. THE COMMAND HUD LOGIC ---
function setupHUDControls() {
  const hud = document.getElementById('command-hud');
  document.getElementById('open-hud-btn')?.addEventListener('click', () => hud?.classList.remove('hidden'));
  document.getElementById('close-hud-btn')?.addEventListener('click', () => hud?.classList.add('hidden'));

  const today = metricsState[6]; // Live mutating index

  // Bind inputs to state variables
  const inputs = [
    { id: 'input-coding', valId: 'val-coding', key: 'coding' },
    { id: 'input-sleep', valId: 'val-sleep', key: 'sleep' },
    { id: 'input-gym', valId: 'val-gym', key: 'gym' },
    { id: 'input-water', valId: 'val-water', key: 'water' },
    { id: 'input-protein', valId: null, key: 'protein' },
    { id: 'input-carbs', valId: null, key: 'carbs' },
    { id: 'input-family', valId: null, key: 'family' }
  ];

  inputs.forEach(binding => {
    const el = document.getElementById(binding.id) as HTMLInputElement;
    if (el) {
      el.value = today[binding.key as keyof DailyMetrics].toString();
      if (binding.valId) {
        document.getElementById(binding.valId)!.innerText = el.value;
      }
      
      // ZERO-LATENCY EVENT LISTENER
      el.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const numVal = parseFloat(target.value) || 0;
        
        // Mutate State
        (metricsState[6] as any)[binding.key] = numVal;
        if (binding.valId) document.getElementById(binding.valId)!.innerText = numVal.toString();
        
        // Save & Redraw Graphics Instantly
        localStorage.setItem('eliteTelemetry', JSON.stringify(metricsState));
        updateGraphicsEngine();
      });
    }
  });
}

// --- 5. CHART COMPILATION CORE ---
function mountEngine() {
  const gridLines = { color: 'rgba(255, 255, 255, 0.05)', drawTicks: false };
  const globalOpts: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#FFF', font: { family: 'Inter' } } } },
    scales: { x: { grid: gridLines }, y: { grid: gridLines, beginAtZero: true } }
  };

  const timeCtx = document.getElementById('timeMatrixChart') as HTMLCanvasElement;
  timeChart = new Chart(timeCtx, {
    type: 'line',
    data: {
      labels: metricsState.map(d => d.date),
      datasets: [
        { label: 'Coding (Hrs)', data: metricsState.map(d => d.coding), borderColor: '#FF1A69', tension: 0.4, borderWidth: 3 },
        { label: 'Sleep (Hrs)', data: metricsState.map(d => d.sleep), borderColor: '#00F0FF', tension: 0.4, borderWidth: 3 },
        { label: 'Gym (Hrs)', data: metricsState.map(d => d.gym), borderColor: '#10B981', tension: 0.4, borderDash: [5, 5] }
      ]
    },
    options: globalOpts
  });

  const waterCtx = document.getElementById('hydrologyBarChart') as HTMLCanvasElement;
  waterChart = new Chart(waterCtx, {
    type: 'bar',
    data: {
      labels: metricsState.map(d => d.date),
      datasets: [{ label: 'Water (Liters)', data: metricsState.map(d => d.water), backgroundColor: '#00F0FF', borderRadius: 6 }]
    },
    options: globalOpts
  });

  const macroCtx = document.getElementById('macrosDoughnutChart') as HTMLCanvasElement;
  macroChart = new Chart(macroCtx, {
    type: 'doughnut',
    data: {
      labels: ['Protein', 'Carbs', 'Family Time (Scale Mins)'],
      datasets: [{
        data: [metricsState[6].protein, metricsState[6].carbs, metricsState[6].family],
        backgroundColor: ['#FF1A69', '#00F0FF', '#8A2BE2'], borderWidth: 0
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#FFF' } } } }
  });
}

// --- 6. HOT RELOAD VECTOR ENGINE ---
function updateGraphicsEngine() {
  if (timeChart) {
    timeChart.data.datasets[0].data = metricsState.map(d => d.coding);
    timeChart.data.datasets[1].data = metricsState.map(d => d.sleep);
    timeChart.data.datasets[2].data = metricsState.map(d => d.gym);
    timeChart.update('active');
  }
  if (waterChart) {
    waterChart.data.datasets[0].data = metricsState.map(d => d.water);
    waterChart.update('active');
  }
  if (macroChart) {
    macroChart.data.datasets[0].data = [metricsState[6].protein, metricsState[6].carbs, metricsState[6].family];
    macroChart.update('active');
  }
}