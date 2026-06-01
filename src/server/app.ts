import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import type { Project } from '../types';
import { closeRenderer, renderBatch, renderProject, warmupRenderer } from '../renderer/render';
import { builtInThemes } from '../themes/tokens';
import {
  configureRuntime,
  getAssetsDir,
  getDataFilesDir,
  getProjectsDir,
  getExportsDir,
} from '../lib/runtimeConfig';

export interface StartServerOptions {
  /** Port to listen on. 0 = random free port. */
  port?: number;
  /** Base dir for projects/exports/data/assets. */
  dataDir?: string;
  /** Pre-built Remotion bundle dir (production). */
  serveUrl?: string | null;
  /** Remotion compositor/ffmpeg binaries dir (packaged Electron). */
  binariesDirectory?: string | null;
  /** Built frontend dir to serve as static (dist). */
  staticDir?: string | null;
}

export interface RunningServer {
  port: number;
  url: string;
  close: () => Promise<void>;
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(getProjectsDir(), { recursive: true });
  await fs.mkdir(getExportsDir(), { recursive: true });
  await fs.mkdir(getDataFilesDir(), { recursive: true });
  await fs.mkdir(getAssetsDir(), { recursive: true });
}

export async function startServer(options: StartServerOptions = {}): Promise<RunningServer> {
  configureRuntime({
    dataDir: options.dataDir,
    serveUrl: options.serveUrl,
    binariesDirectory: options.binariesDirectory,
  });
  await ensureDirs();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.post('/api/export', async (req, res) => {
    try {
      const { project } = req.body as { project: Project };
      const outputPath = await renderProject(project);
      res.json({ ok: true, path: outputPath });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  app.post('/api/batch', async (req, res) => {
    try {
      const { items } = req.body as { items: Partial<Project>[] };
      const folder = await renderBatch(items);
      res.json({ ok: true, folder });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  app.post('/api/projects/save', async (req, res) => {
    try {
      const { name, project } = req.body as { name: string; project: Project };
      const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
      const filePath = path.join(getProjectsDir(), `${safeName}.json`);
      await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');
      res.json({ ok: true, path: filePath });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  app.get('/api/projects/load', async (req, res) => {
    try {
      const name = String(req.query.name ?? 'my-project').replace(/[^a-zA-Z0-9-_]/g, '-');
      const filePath = path.join(getProjectsDir(), `${name}.json`);
      const raw = await fs.readFile(filePath, 'utf-8');
      res.json(JSON.parse(raw));
    } catch (error) {
      res.status(404).json({ ok: false, error: String(error) });
    }
  });

  app.get('/api/projects/list', async (_req, res) => {
    try {
      const files = await fs.readdir(getProjectsDir());
      res.json(files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')));
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  app.get('/api/themes', async (_req, res) => {
    try {
      const filePath = path.join(getDataFilesDir(), 'themes.json');
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        res.json(JSON.parse(raw));
      } catch {
        res.json(builtInThemes);
      }
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  app.post('/api/themes/save', async (req, res) => {
    try {
      const themes = req.body;
      const filePath = path.join(getDataFilesDir(), 'themes.json');
      await fs.writeFile(filePath, JSON.stringify(themes, null, 2), 'utf-8');
      res.json({ ok: true, path: filePath });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error) });
    }
  });

  // Serve the built frontend (production / packaged app).
  if (options.staticDir && existsSync(options.staticDir)) {
    app.use(express.static(options.staticDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(options.staticDir as string, 'index.html'));
    });
  }

  const port = options.port ?? 3456;

  return new Promise<RunningServer>((resolve) => {
    const server = app.listen(port, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      const url = `http://localhost:${actualPort}`;
      console.log(`Shadow Motion Studio API running on ${url}`);
      // Prepare the renderer in the background so the first export is fast.
      void warmupRenderer();
      resolve({
        port: actualPort,
        url,
        close: () =>
          new Promise<void>((res, rej) => {
            void closeRenderer().finally(() => server.close((err) => (err ? rej(err) : res())));
          }),
      });
    });
  });
}
