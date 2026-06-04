const { app, BrowserWindow } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'portfolio-images');
const FILES = [
  '01-shadow-motion-studio-hero',
  '02-product-capabilities',
  '03-ai-director-workflow',
  '04-export-and-delivery',
];

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    useContentSize: true,
    show: false,
    webPreferences: {
      offscreen: true,
      backgroundThrottling: false,
    },
  });
  // Ensure the *content* (webpage) is exactly 1600x900.
  win.setContentSize(1600, 900);
  win.webContents.setZoomFactor(1);
  return win;
}

async function renderOne(win, name) {
  const input = path.join(DIR, `${name}.svg`);
  const output = path.join(DIR, `${name}.png`);
  const svg = await fs.readFile(input, 'utf8');

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1600px;height:900px;background:#000;overflow:hidden}svg{display:block;width:1600px;height:900px}</style></head><body>${svg}</body></html>`;
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  // Re-assert sizing after load to avoid DPI/rounding truncation.
  win.setContentSize(1600, 900);
  win.webContents.setZoomFactor(1);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 1600, height: 900 });
  await fs.writeFile(output, image.toPNG());
}

app.whenReady().then(async () => {
  const win = createWindow();
  for (const file of FILES) {
    await renderOne(win, file);
    console.log(`Rendered ${file}.png`);
  }
  win.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
