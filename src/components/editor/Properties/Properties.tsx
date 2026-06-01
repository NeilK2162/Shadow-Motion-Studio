import { useState } from 'react';
import { Download, FolderOpen, Save, Upload } from 'lucide-react';
import { DEFAULT_LAYOUT_FIELDS, getCardLayout, getDefaultPlacement, LAYOUT_FIELD_KEYS } from '@/components/templates/shared/cardLayout';
import { getDynamicCardLayout } from '@/components/templates/shared/primitives/dynamicLayout';
import { PLATFORM_EXPORT_PRESETS } from '@/lib/formats';
import { PLACEMENT_OPTIONS } from '@/lib/placement';
import { TEMPLATE_DEFAULTS } from '@/data/templateDefaults';
import { useEditorStore } from '@/store/editorStore';
import type { Project, PollOption, StatBar, StatBox, StatField, StatusBar, TemplateId } from '@/types';
import { RESOLUTION_MAP } from '@/types';

const LAYOUT_FIELD_KEYS_SET = LAYOUT_FIELD_KEYS;

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
      />
    </label>
  );
}

function FloatField({
  label,
  value,
  onChange,
  step = 0.01,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
      />
    </label>
  );
}
export function Properties() {
  const project = useEditorStore((s) => s.project);
  const setField = useEditorStore((s) => s.setField);
  const setThemeName = useEditorStore((s) => s.setThemeName);
  const setGlobalSpeed = useEditorStore((s) => s.setGlobalSpeed);
  const setDurationInFrames = useEditorStore((s) => s.setDurationInFrames);
  const setExportResolution = useEditorStore((s) => s.setExportResolution);
  const setExportFps = useEditorStore((s) => s.setExportFps);
  const setExportFormat = useEditorStore((s) => s.setExportFormat);
  const setExportTransparent = useEditorStore((s) => s.setExportTransparent);
  const setStripCardBackground = useEditorStore((s) => s.setStripCardBackground);
  const setPlacement = useEditorStore((s) => s.setPlacement);
  const applyPlatformExportPreset = useEditorStore((s) => s.applyPlatformExportPreset);
  const loadProject = useEditorStore((s) => s.loadProject);
  const resetProject = useEditorStore((s) => s.resetProject);

  const [projectName, setProjectName] = useState('my-project');
  const [exportStatus, setExportStatus] = useState('');
  const fields = project.fields;

  const renderTextFields = () => {
    if (project.templateDef) {
      return project.templateDef.fields
        .filter((f) => f.type === 'text' || f.type === 'number' || f.type === 'boolean')
        .map((f) => (
          <TextField
            key={f.key}
            label={f.label}
            value={String(fields[f.key] ?? f.default ?? '')}
            onChange={(v) => setField(f.key, f.type === 'number' ? Number(v) : v)}
          />
        ));
    }

    const defaults = TEMPLATE_DEFAULTS[project.template as TemplateId].fields;
    return Object.entries(defaults)
      .filter(([key, value]) => (typeof value === 'string' || typeof value === 'number') && !LAYOUT_FIELD_KEYS_SET.has(key))
      .map(([key, defaultValue]) => (
        <TextField
          key={key}
          label={key}
          value={String(fields[key] ?? defaultValue)}
          onChange={(v) => setField(key, typeof defaultValue === 'number' ? Number(v) : v)}
        />
      ));
  };

  const renderLayoutFields = () => {
    const d = DEFAULT_LAYOUT_FIELDS;
    const layout = project.templateDef
      ? getDynamicCardLayout(project.templateDef, fields, project.export.formatId, {
          placement: project.placement ?? project.templateDef.defaultPlacement,
          canvasWidth: RESOLUTION_MAP[project.export.resolution].width,
          canvasHeight: RESOLUTION_MAP[project.export.resolution].height,
        })
      : getCardLayout(project.template as TemplateId, fields, project.export.formatId, {
          placement: project.placement ?? getDefaultPlacement(project.template as TemplateId),
          canvasWidth: RESOLUTION_MAP[project.export.resolution].width,
          canvasHeight: RESOLUTION_MAP[project.export.resolution].height,
        });
    const hasGlow = layout.hasGlow;
    const placement =
      project.placement ??
      (project.templateDef ? project.templateDef.defaultPlacement : getDefaultPlacement(project.template as TemplateId));

    return (
      <>
        <div className="font-mono text-[9px] uppercase tracking-[1px] text-gold">Card Size</div>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">Placement</span>
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as typeof placement)}
            className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
          >
            {PLACEMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <FloatField
          label="Size Multiplier"
          value={Number(fields.sizeMultiplier ?? layout.sizeMultiplier)}
          step={0.05}
          min={0.5}
          max={3}
          onChange={(v) => setField('sizeMultiplier', v)}
        />
        <FloatField
          label="Aspect Multiplier"
          value={Number(fields.aspectMultiplier ?? d.aspectMultiplier)}
          step={0.05}
          min={0.5}
          max={2}
          onChange={(v) => setField('aspectMultiplier', v)}
        />
        <FloatField
          label="Content Scale (0 = auto)"
          value={Number(fields.contentScale ?? d.contentScale)}
          step={0.05}
          min={0}
          max={3}
          onChange={(v) => setField('contentScale', v)}
        />
        <div className="font-mono text-[9px] text-dim">
          → {layout.cardWidth} × {layout.cardHeight}px · scale {layout.contentScale.toFixed(2)}
          {layout.isFullscreen ? ' · fullscreen' : ''}
        </div>
        {hasGlow && (
          <>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[1px] text-gold">Glow</div>
            <FloatField label="Glow Intensity" value={Number(fields.glowIntensity ?? d.glowIntensity)} step={0.01} min={0} max={1} onChange={(v) => setField('glowIntensity', v)} />
            <NumberField label="Glow Spread %" value={Number(fields.glowSpread ?? d.glowSpread)} onChange={(v) => setField('glowSpread', v)} />
            <NumberField label="Glow Center Y %" value={Number(fields.glowCenterY ?? d.glowCenterY)} onChange={(v) => setField('glowCenterY', v)} />
          </>
        )}
      </>
    );
  };

  const renderStatsFields = () => {
    if (project.template === 'mission-passed') {
      const stats = (fields.stats as StatField[]) ?? [];
      return stats.map((stat, i) => (
        <div key={i} className="grid grid-cols-2 gap-2">
          <TextField label={`Stat ${i + 1} Value`} value={stat.value} onChange={(v) => {
            const next = [...stats];
            next[i] = { ...next[i], value: v };
            setField('stats', next);
          }} />
          <TextField label={`Stat ${i + 1} Label`} value={stat.label} onChange={(v) => {
            const next = [...stats];
            next[i] = { ...next[i], label: v };
            setField('stats', next);
          }} />
        </div>
      ));
    }
    if (project.template === 'status-hud') {
      const bars = (fields.bars as StatusBar[]) ?? [];
      return (
        <>
          {bars.map((bar, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <TextField label={`Bar ${i + 1} Label`} value={bar.label} onChange={(v) => {
                const next = [...bars]; next[i] = { ...next[i], label: v }; setField('bars', next);
              }} />
              <NumberField label="Pct" value={bar.pct} onChange={(v) => {
                const next = [...bars]; next[i] = { ...next[i], pct: v }; setField('bars', next);
              }} />
              <TextField label="Color" value={bar.color} onChange={(v) => {
                const next = [...bars]; next[i] = { ...next[i], color: v }; setField('bars', next);
              }} />
            </div>
          ))}
        </>
      );
    }
    if (project.template === 'this-or-that') {
      const optionA = (fields.optionA as PollOption) ?? { key: 'A', label: '', pct: 50 };
      const optionB = (fields.optionB as PollOption) ?? { key: 'B', label: '', pct: 50 };
      return (
        <>
          <TextField label="Option A Key" value={optionA.key} onChange={(v) => setField('optionA', { ...optionA, key: v })} />
          <TextField label="Option A Label" value={optionA.label} onChange={(v) => setField('optionA', { ...optionA, label: v })} />
          <NumberField label="Option A Pct" value={optionA.pct} onChange={(v) => setField('optionA', { ...optionA, pct: v })} />
          <TextField label="Option B Key" value={optionB.key} onChange={(v) => setField('optionB', { ...optionB, key: v })} />
          <TextField label="Option B Label" value={optionB.label} onChange={(v) => setField('optionB', { ...optionB, label: v })} />
          <NumberField label="Option B Pct" value={optionB.pct} onChange={(v) => setField('optionB', { ...optionB, pct: v })} />
        </>
      );
    }
    if (project.template === 'weekly-stats') {
      const boxes = (fields.boxes as StatBox[]) ?? [];
      const bars = (fields.bars as StatBar[]) ?? [];
      return (
        <>
          {boxes.map((box, i) => (
            <div key={box.label} className="grid grid-cols-3 gap-2">
              <TextField label={`Box ${i + 1} Label`} value={box.label} onChange={(v) => {
                const next = [...boxes]; next[i] = { ...next[i], label: v }; setField('boxes', next);
              }} />
              <TextField label="Value" value={box.value} onChange={(v) => {
                const next = [...boxes]; next[i] = { ...next[i], value: v }; setField('boxes', next);
              }} />
              <TextField label="Change" value={box.change} onChange={(v) => {
                const next = [...boxes]; next[i] = { ...next[i], change: v }; setField('boxes', next);
              }} />
            </div>
          ))}
          {bars.map((bar, i) => (
            <div key={bar.label} className="grid grid-cols-2 gap-2">
              <TextField label={`Bar ${bar.label}`} value={bar.label} onChange={(v) => {
                const next = [...bars]; next[i] = { ...next[i], label: v }; setField('bars', next);
              }} />
              <NumberField label="Pct" value={bar.pct} onChange={(v) => {
                const next = [...bars]; next[i] = { ...next[i], pct: v }; setField('bars', next);
              }} />
            </div>
          ))}
          <NumberField label="Stars Lit" value={(fields.stars as number) ?? 3} onChange={(v) => setField('stars', v)} />
        </>
      );
    }
    return null;
  };

  const saveProject = async () => {
    const res = await fetch('/api/projects/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName, project }),
    });
    setExportStatus(res.ok ? `Saved ${projectName}.json` : 'Save failed');
  };

  const loadProjectFile = async () => {
    const res = await fetch(`/api/projects/load?name=${encodeURIComponent(projectName)}`);
    if (!res.ok) {
      setExportStatus('Load failed');
      return;
    }
    const data = (await res.json()) as Project;
    loadProject(data);
    setExportStatus(`Loaded ${projectName}.json`);
  };

  const exportAsset = async () => {
    setExportStatus('Rendering...');
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project }),
    });
    const data = await res.json();
    setExportStatus(res.ok ? `Exported: ${data.path}` : `Export failed: ${data.error}`);
  };

  const runBatch = async (file: File) => {
    const text = await file.text();
    const items = JSON.parse(text) as Partial<Project>[];
    setExportStatus('Batch rendering...');
    const res = await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    setExportStatus(res.ok ? `Batch done: ${data.folder}` : `Batch failed: ${data.error}`);
  };

  return (
    <div className="bg-dark2 p-4 pb-10">
      <div className="mb-3 font-mono text-[9px] uppercase tracking-[2px] text-dim">Property Editor</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-[1px] text-gold">Text</div>
          {renderTextFields()}
          {renderStatsFields()}
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-[1px] text-gold">Theme & Animation</div>
          {renderLayoutFields()}
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">Theme</span>
            <select
              onChange={(e) => setThemeName(e.target.value)}
              defaultValue="shadow-owner"
              className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
            >
              <option value="shadow-owner">Shadow Owner</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="luxury">Luxury</option>
              <option value="corporate">Corporate</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          <NumberField label="Animation Speed" value={project.animation.globalSpeed} onChange={setGlobalSpeed} />
          <NumberField label="Duration (frames)" value={project.animation.durationInFrames} onChange={setDurationInFrames} />
          <button type="button" onClick={resetProject} className="border border-dark5 px-3 py-1 font-mono text-[9px] uppercase text-dim hover:text-gold">
            Reset Template
          </button>
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-[1px] text-gold">Export</div>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">Platform Preset</span>
            <select
              defaultValue=""
              onChange={(e) => e.target.value && applyPlatformExportPreset(e.target.value)}
              className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
            >
              <option value="">— Quick preset —</option>
              {PLATFORM_EXPORT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">Resolution</span>
            <select
              value={project.export.resolution}
              onChange={(e) => setExportResolution(e.target.value as Project['export']['resolution'])}
              className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
            >
              <option value="1920x1080">1920x1080</option>
              <option value="1080x1920">1080x1920</option>
              <option value="1080x1350">1080x1350</option>
              <option value="1080x1080">1080x1080</option>
              <option value="1280x720">1280x720</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">FPS</span>
            <select
              value={project.export.fps}
              onChange={(e) => setExportFps(Number(e.target.value) as 30 | 60)}
              className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-dim">Format</span>
            <select
              value={project.export.format}
              onChange={(e) => setExportFormat(e.target.value as Project['export']['format'])}
              className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
            >
              <option value="webm">WebM (transparent)</option>
              <option value="mp4">MP4</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </label>
          <label className="flex items-center gap-2 font-mono text-[9px] uppercase text-dim">
            <input type="checkbox" checked={project.export.transparent} onChange={(e) => setExportTransparent(e.target.checked)} />
            Transparent export
          </label>
          <label className="flex items-center gap-2 font-mono text-[9px] uppercase text-dim">
            <input type="checkbox" checked={project.export.stripCardBackground ?? false} onChange={(e) => setStripCardBackground(e.target.checked)} />
            Strip card background
          </label>
          <button
            type="button"
            onClick={exportAsset}
            className="flex items-center gap-2 bg-gold px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[1px] text-black"
          >
            <Download size={14} /> Export
          </button>
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-[1px] text-gold">Project & Batch</div>
          <TextField label="Project Name" value={projectName} onChange={setProjectName} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveProject} className="flex items-center gap-1 border border-dark5 px-3 py-1 font-mono text-[9px] uppercase text-dim hover:text-gold">
              <Save size={12} /> Save
            </button>
            <button type="button" onClick={loadProjectFile} className="flex items-center gap-1 border border-dark5 px-3 py-1 font-mono text-[9px] uppercase text-dim hover:text-gold">
              <FolderOpen size={12} /> Load
            </button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 border border-dark5 px-3 py-2 font-mono text-[9px] uppercase text-dim hover:text-gold">
            <Upload size={12} /> Batch JSON
            <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && runBatch(e.target.files[0])} />
          </label>
          {exportStatus && <div className="font-mono text-[10px] text-gold">{exportStatus}</div>}
        </div>
      </div>
    </div>
  );
}
