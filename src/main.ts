import './style.css';
import { Chart, registerables } from 'chart.js';
import type { ChartOptions } from 'chart.js';

Chart.register(...registerables);

// --- 1. DATA INFRASTRUCTURE ---
interface TelemetryRecord {
  date: string; code: number; sleep: number; water: number; gym: number;
}

const DB_KEY = 'apex_telemetry_db';
let systemData: TelemetryRecord[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');

// Seed baseline if empty
if (systemData.length === 0) {
  systemData = [
    { date: 'Day 1', code: 5.5, sleep: 6.0, water: 2.0, gym: 1.0 },
    { date: 'Day 2', code: 8.0, sleep: 7.5, water: 3.2, gym: 1.5 }
  ];
  saveLedger();
}

function saveLedger() {
  localStorage.setItem(DB_KEY, JSON.stringify(systemData));
}

// --- 2. GLOBAL CHART REFERENCES ---
let timeChart: Chart | null = null;
let waterChart: Chart | null = null;
let gymChart: Chart | null = null;

// --- 3. DIAGNOSTIC EVALUATION ENGINE ---
function evaluateDiagnostics() {
  const feed = document.getElementById('diag-feed')!;
  if (systemData.length === 0) { feed.innerHTML = ''; return; }
  
  const latest = systemData[systemData.length - 1];
  
  // WHO / Biological Baselines
  const waterStatus = latest.water >= 2.7 ? 
    `<span class="status-optimal">OPTIMAL (${latest.water}L)</span>` : 
    `<span class="status-critical">CRITICAL (${latest.water}L)</span>`;
    
  const sleepStatus = latest.sleep >= 7.0 ? 
    `<span class="status-optimal">OPTIMAL (${latest.sleep}H)</span>` : 
    `<span class="status-critical">DEFICIT (${latest.sleep}H)</span>`;

  feed.innerHTML = `
    <div class="diag-row"><span>HYDRATION (WHO: 2.7L)</span> ${waterStatus}</div>
    <div class="diag-row"><span>REST CYCLE (MIN: 7H)</span> ${sleepStatus}</div>
    <div class="diag-row"><span>LATEST LOG</span> <span style="color:#FFF">${latest.date}</span></div>
  `;
}

// --- 4. GRAPHICS RENDER LOOP ---
function renderEngines() {
  const dates = systemData.map(d => d.date);
  const commonOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } },
    plugins: { legend: { labels: { color: '#FFF', font: { family: 'Inter' } } } }
  };

  // TIME MATRIX
  const timeCtx = (document.getElementById('timeMatrixChart') as HTMLCanvasElement).getContext('2d')!;
  if (timeChart) timeChart.destroy();
  timeChart = new Chart(timeCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'Deep Code', data: systemData.map(d => d.code), borderColor: '#FF1A69', tension: 0.3 },
        { label: 'Rest Cycle', data: systemData.map(d => d.sleep), borderColor: '#00F0FF', tension: 0.3 }
      ]
    },
    options: commonOptions
  });

  // HYDROLOGY BAR
  const waterCtx = (document.getElementById('hydrologyBarChart') as HTMLCanvasElement).getContext('2d')!;
  if (waterChart) waterChart.destroy();
  
  // Dynamic coloring based on WHO benchmark
  const waterColors = systemData.map(d => d.water >= 2.7 ? '#00F0FF' : '#FF3333');
  
  waterChart = new Chart(waterCtx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{ label: 'Water (L)', data: systemData.map(d => d.water), backgroundColor: waterColors }]
    },
    options: commonOptions
  });

  // GYM RADAR/LINE
  const gymCtx = (document.getElementById('gymRadarChart') as HTMLCanvasElement).getContext('2d')!;
  if (gymChart) gymChart.destroy();
  gymChart = new Chart(gymCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{ label: 'Gym Output (Hrs)', data: systemData.map(d => d.gym), borderColor: '#8A2BE2', fill: true, backgroundColor: 'rgba(138, 43, 226, 0.2)' }]
    },
    options: commonOptions
  });

  evaluateDiagnostics();
}

// --- 5. EVENT BINDING & HUD CONTROLS ---
window.addEventListener('DOMContentLoaded', () => {
  renderEngines();

  const hud = document.getElementById('command-hud')!;
  document.getElementById('btn-open-hud')!.addEventListener('click', () => hud.classList.add('active'));
  document.getElementById('toggle-hud')!.addEventListener('click', () => hud.classList.remove('active'));
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hud.classList.remove('active'); });

  // Commit New Data
  document.getElementById('btn-commit')!.addEventListener('click', () => {
    const dateVal = (document.getElementById('in-date') as HTMLInputElement).value || `Day ${systemData.length + 1}`;
    const codeVal = parseFloat((document.getElementById('in-code') as HTMLInputElement).value) || 0;
    const sleepVal = parseFloat((document.getElementById('in-sleep') as HTMLInputElement).value) || 0;
    const waterVal = parseFloat((document.getElementById('in-water') as HTMLInputElement).value) || 0;
    const gymVal = parseFloat((document.getElementById('in-gym') as HTMLInputElement).value) || 0;

    systemData.push({ date: dateVal, code: codeVal, sleep: sleepVal, water: waterVal, gym: gymVal });
    saveLedger();
    renderEngines();
    
    // Pulse animation on HUD
    hud.style.borderColor = '#00F0FF';
    setTimeout(() => { hud.style.borderColor = 'rgba(255, 255, 255, 0.05)'; hud.classList.remove('active'); }, 500);
  });

  // Purge System
  document.getElementById('btn-purge')!.addEventListener('click', () => {
    if (confirm('CRITICAL WARNING: This will wipe your historical telemetry ledger. Proceed?')) {
      systemData = [];
      saveLedger();
      renderEngines();
    }
  });
});,