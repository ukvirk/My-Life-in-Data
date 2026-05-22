import './style.css';
import { telemetryStore } from './state/Store';
import { CommandHUD } from './components/CommandHUD';
import { Dashboard } from './components/Dashboard';
import { ChartEngine } from './components/ChartEngine';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI components
  new CommandHUD();
  new Dashboard();
  new ChartEngine();

  // Setup Date Picker
  const datePicker = document.getElementById('date-picker') as HTMLInputElement;
  datePicker.value = telemetryStore.getState().currentDate;
  
  datePicker.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      telemetryStore.setCurrentDate(target.value);
    }
  });

  telemetryStore.subscribe(() => {
    datePicker.value = telemetryStore.getState().currentDate;
  });

  // Setup Export/Import
  const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
  const btnImport = document.getElementById('btn-import') as HTMLButtonElement;
  const fileImport = document.getElementById('file-import') as HTMLInputElement;

  btnExport.addEventListener('click', () => {
    const dataStr = telemetryStore.exportData();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `apex-telemetry-${telemetryStore.getState().currentDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  });

  btnImport.addEventListener('click', () => {
    fileImport.click();
  });

  fileImport.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (telemetryStore.importData(content)) {
          alert('Telemetry data imported successfully.');
        } else {
          alert('Failed to import telemetry data. Invalid format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    target.value = '';
  });
});
