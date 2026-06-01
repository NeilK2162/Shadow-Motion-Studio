import { spawn, type ChildProcess } from 'node:child_process';
import type { Plugin } from 'vite';

const API_PORT = 3456;

async function isApiRunning(port = API_PORT): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/director/settings`, {
      signal: AbortSignal.timeout(800),
    });
    // Any HTTP response from Express means our API (or compatible server) is up.
    return res.ok || res.status === 404 || res.status === 500;
  } catch {
    return false;
  }
}

/** Starts the Express API server alongside Vite so /api/* proxy works in dev. */
export function apiServerPlugin(): Plugin {
  let proc: ChildProcess | null = null;
  let weStarted = false;

  function start() {
    if (proc) return;
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    proc = spawn(npm, ['run', 'server'], {
      stdio: 'inherit',
      shell: false,
      env: process.env,
    });
    weStarted = true;
    proc.on('exit', () => {
      proc = null;
      weStarted = false;
    });
  }

  function stop() {
    if (weStarted && proc && !proc.killed) {
      proc.kill();
      proc = null;
      weStarted = false;
    }
  }

  return {
    name: 'shadow-api-server',
    configureServer(server) {
      void (async () => {
        if (await isApiRunning()) {
          console.log(`[shadow-api] API already running on http://localhost:${API_PORT} — reusing it`);
          return;
        }
        console.log(`[shadow-api] Starting API on http://localhost:${API_PORT}…`);
        start();
      })();

      server.httpServer?.on('close', stop);
      process.on('SIGINT', stop);
      process.on('SIGTERM', stop);
    },
  };
}
