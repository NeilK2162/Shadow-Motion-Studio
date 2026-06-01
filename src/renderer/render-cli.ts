import { renderProject, mergeProject } from './render';
import type { Project } from '../types';
import fs from 'fs/promises';

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: npm run render -- <project.json>');
    process.exit(1);
  }
  const raw = await fs.readFile(arg, 'utf-8');
  const partial = JSON.parse(raw) as Partial<Project>;
  const project = mergeProject(partial);
  const output = await renderProject(project);
  console.log('Rendered:', output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
