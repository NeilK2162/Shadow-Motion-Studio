import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { existsSync } from 'fs';
import { startServer, type RunningServer } from '../src/server/app';

// In the packaged app, static assets live in the resources dir; in dev they live in the project root.
const isPackaged = app.isPackaged;
const resourcesDir = isPackaged ? process.resourcesPath : path.resolve(__dirname, '..');

const staticDir = path.join(resourcesDir, 'dist');
const remotionBundleDir = path.join(resourcesDir, 'dist-remotion');
const compositorBinDir = isPackaged
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@remotion', 'compositor-win32-x64-msvc')
  : null;

let server: RunningServer | null = null;
let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  // User data (projects/exports/etc.) goes to a writable, persistent location.
  const dataDir = isPackaged ? path.join(app.getPath('documents'), 'ShadowMotionStudio') : process.cwd();

  server = await startServer({
    port: 0,
    dataDir,
    staticDir: existsSync(staticDir) ? staticDir : null,
    serveUrl: existsSync(remotionBundleDir) ? remotionBundleDir : null,
    binariesDirectory:
      compositorBinDir && existsSync(path.join(compositorBinDir, 'remotion.exe')) ? compositorBinDir : null,
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#080808',
    title: 'Shadow Motion Studio',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Open external links in the system browser, not inside the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(server.url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', async () => {
  if (server) {
    await server.close().catch(() => undefined);
    server = null;
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
