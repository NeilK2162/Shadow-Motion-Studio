import { spawn, type ChildProcess } from 'node:child_process';
import type { Plugin } from 'vite';

/** Starts the Express API server alongside Vite so /api/* proxy works in dev. */
export function apiServerPlugin(): Plugin {
  let proc: ChildProcess | null = null;

  function start() {
    if (proc) return;
    proc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'server'], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });
    proc.on('exit', () => {
      proc = null;
    });
  }

  function stop() {
    if (proc && !proc.killed) {
      proc.kill();
      proc = null;
    }
  }

  return {
    name: 'shadow-api-server',
    configureServer(server) {
      start();
      server.httpServer?.on('close', stop);
      process.on('SIGINT', stop);
      process.on('SIGTERM', stop);
    },
  };
}
