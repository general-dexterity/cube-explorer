const panelTitle = import.meta.env.DEV
  ? 'Cube Explorer (dev)'
  : 'Cube Explorer';

const iconPath = '';

chrome.devtools.panels.create(panelTitle, iconPath, 'src/devtools/panel.html');
