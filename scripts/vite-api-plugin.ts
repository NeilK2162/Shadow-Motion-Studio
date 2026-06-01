import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const API_PORT = 3456;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const TSX_CLI = require.resolve('tsx/cli');
const SERVER_ENTRY = path.join(ROOT, 'src', 'server', 'index.ts');

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const done = (open: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.setTimeout(500, () => done(false));
  });
}

async function probeApi(port = API_PORT): Promise<'running' | 'blocked' | 'free'> {
  if (!(await isPortOpen(port))) return 'free';
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/director/settings`, {
      signal: AbortSignal.timeout(800),
    });
    if (res.ok || res.status === 404 || res.status === 500) return 'running';
    return 'blocked';
  } catch {
    return 'blocked';
  }
}

/** Starts the Express API server alongside Vite so /api/* proxy works in dev. */
export function apiServerPlugin(): Plugin {
  let proc: ChildProcess | null = null;
  let weStarted = false;

  function start() {
    if (proc) return;
    // Spawn node + tsx directly — avoids Windows EINVAL from npm.cmd without shell.
    proc = spawn(process.execPath, [TSX_CLI, SERVER_ENTRY], {
      cwd: ROOT,
      stdio: 'inherit',
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
        const state = await probeApi();
        if (state === 'running') {
          console.log(`[shadow-api] API already running on http://localhost:${API_PORT} — reusing it`);
        } else if (state === 'blocked') {
          console.warn(
            `[shadow-api] Port ${API_PORT} is in use by another process. Free it, then restart dev:\n` +
              `  Get-NetTCPConnection -LocalPort ${API_PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
          );
          return;
        } else {
          console.log(`[shadow-api] Starting API on http://localhost:${API_PORT}…`);
          start();
        }

        // Watch src/ for changes and restart the API server automatically.
        const SRC = path.join(ROOT, 'src');
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const watcher = fs.watch(SRC, { recursive: true }, (_event, filename) => {
          if (!filename?.endsWith('.ts') && !filename?.endsWith('.tsx')) return;
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            console.log(`[shadow-api] ${filename} changed — restarting API server…`);
            stop();
            start();
          }, 600);
        });

        const cleanup = () => { stop(); watcher.close(); };
        server.httpServer?.on('close', cleanup);
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
      })();
    },
  };
}
