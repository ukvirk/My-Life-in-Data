import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import { telemetryStore } from '../state/Store';
import { subDays, format, parseISO } from 'date-fns';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

export class ChartEngine {
  private chartInstance: Chart | null = null;
  private canvas = document.getElementById('historical-chart') as HTMLCanvasElement;

  constructor() {
    this.initChart();
    telemetryStore.subscribe(() => {
      this.updateChart();
    });
  }

  private initChart() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: '#ffffff80',
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)' },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: 'rgba(255, 255, 255, 0.8)' }
          }
        },
        elements: {
          line: { tension: 0.4 },
          point: { radius: 4, hitRadius: 10, hoverRadius: 6 }
        }
      }
    });

    this.updateChart();
  }

  private updateChart() {
    if (!this.chartInstance) return;

    const state = telemetryStore.getState();
    const endDate = parseISO(state.currentDate);
    
    // Get last 7 days
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(format(subDays(endDate, i), 'yyyy-MM-dd'));
    }

    const logs = dates.map(d => telemetryStore.getLogForDate(d));

    this.chartInstance.data.labels = dates.map(d => format(parseISO(d), 'MMM dd'));
    
    this.chartInstance.data.datasets = [
      {
        label: 'Coding (hrs)',
        data: logs.map(l => l.codingHours || 0),
        borderColor: '#00FFFF', // Neon Cyan
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Sleep (hrs)',
        data: logs.map(l => l.sleepHours || 0),
        borderColor: '#FF007F', // Neon Pink
        backgroundColor: 'rgba(255, 0, 127, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Gym (hrs)',
        data: logs.map(l => l.gymHours || 0),
        borderColor: '#FFFFFF', 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ];

    this.chartInstance.update();
  }
}
