import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import type { Project } from '../types';
import { renderBatch, renderProject } from '../renderer/render';
import { builtInThemes } from '../themes/tokens';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PORT = 3456;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function ensureDirs() {
  await fs.mkdir(path.join(ROOT, 'projects'), { recursive: true });
  await fs.mkdir(path.join(ROOT, 'exports'), { recursive: true });
  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
  await fs.mkdir(path.join(ROOT, 'assets'), { recursive: true });
}

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
    const filePath = path.join(ROOT, 'projects', `${safeName}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');
    res.json({ ok: true, path: filePath });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

app.get('/api/projects/load', async (req, res) => {
  try {
    const name = String(req.query.name ?? 'my-project').replace(/[^a-zA-Z0-9-_]/g, '-');
    const filePath = path.join(ROOT, 'projects', `${name}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (error) {
    res.status(404).json({ ok: false, error: String(error) });
  }
});

app.get('/api/themes', async (_req, res) => {
  try {
    const filePath = path.join(ROOT, 'data', 'themes.json');
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
    const filePath = path.join(ROOT, 'data', 'themes.json');
    await fs.writeFile(filePath, JSON.stringify(themes, null, 2), 'utf-8');
    res.json({ ok: true, path: filePath });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

ensureDirs().then(() => {
  app.listen(PORT, () => {
    console.log(`Shadow Motion Studio API running on http://localhost:${PORT}`);
  });
});
