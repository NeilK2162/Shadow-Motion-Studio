import { useCallback, useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { mergeUsage } from '@/director/pricing';
import type { DirectorPack, DirectorSettings, SavedPackMeta, SeriesMemory } from '@/director/types';
import { parseApiJson } from '@/lib/apiFetch';
import { useDirectorStore } from '@/store/directorStore';
import { useEditorStore } from '@/store/editorStore';
import { AssetGrid } from './AssetGrid';
import { CostMeter } from './CostMeter';
import { PlanView } from './PlanView';
import { SeriesManager } from './SeriesManager';

export function DirectorPanel() {
  const panelOpen = useDirectorStore((s) => s.panelOpen);
  const setPanelOpen = useDirectorStore((s) => s.setPanelOpen);
  const concept = useDirectorStore((s) => s.concept);
  const setConcept = useDirectorStore((s) => s.setConcept);
  const formatTarget = useDirectorStore((s) => s.formatTarget);
  const setFormatTarget = useDirectorStore((s) => s.setFormatTarget);
  const dryRun = useDirectorStore((s) => s.dryRun);
  const setDryRun = useDirectorStore((s) => s.setDryRun);
  const seriesId = useDirectorStore((s) => s.seriesId);
  const setSeriesId = useDirectorStore((s) => s.setSeriesId);
  const settings = useDirectorStore((s) => s.settings);
  const setSettings = useDirectorStore((s) => s.setSettings);
  const seriesList = useDirectorStore((s) => s.seriesList);
  const setSeriesList = useDirectorStore((s) => s.setSeriesList);
  const voices = useDirectorStore((s) => s.voices);
  const setVoices = useDirectorStore((s) => s.setVoices);
  const currentPack = useDirectorStore((s) => s.currentPack);
  const setCurrentPack = useDirectorStore((s) => s.setCurrentPack);
  const sessionUsage = useDirectorStore((s) => s.sessionUsage);
  const setSessionUsage = useDirectorStore((s) => s.setSessionUsage);
  const status = useDirectorStore((s) => s.status);
  const statusMessage = useDirectorStore((s) => s.statusMessage);
  const setStatus = useDirectorStore((s) => s.setStatus);
  const loadProject = useEditorStore((s) => s.loadProject);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [savedPacks, setSavedPacks] = useState<SavedPackMeta[]>([]);

  const loadMeta = useCallback(async () => {
    try {
      const [settingsRes, seriesRes, voicesRes, usageRes, packsRes] = await Promise.all([
        fetch('/api/director/settings'),
        fetch('/api/director/series'),
        fetch('/api/director/voices'),
        fetch('/api/director/usage'),
        fetch('/api/director/packs'),
      ]);
      if (settingsRes.ok) {
        const s = await parseApiJson<Partial<DirectorSettings> & { hasKey?: boolean }>(settingsRes);
        setSettings(s);
        setDryRun(s.dryRunDefault ?? true);
      }
      if (seriesRes.ok) setSeriesList(await parseApiJson(seriesRes));
      if (voicesRes.ok) setVoices(await parseApiJson(voicesRes));
      if (usageRes.ok) setSessionUsage(await parseApiJson(usageRes));
      if (packsRes.ok) setSavedPacks(await parseApiJson(packsRes));
    } catch {
      /* server not ready yet */
    }
  }, [setSettings, setDryRun, setSeriesList, setVoices, setSessionUsage]);

  useEffect(() => {
    if (panelOpen) void loadMeta();
  }, [panelOpen, loadMeta]);

  const saveSettings = async (patch: Partial<DirectorSettings> & { apiKey?: string }) => {
    const res = await fetch('/api/director/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await parseApiJson<{ settings: Partial<DirectorSettings> & { hasKey?: boolean } }>(res);
      setSettings(data.settings);
    }
  };

  const loadSavedPack = async (packId: string) => {
    try {
      const res = await fetch(`/api/director/packs/load?id=${encodeURIComponent(packId)}`);
      const data = await parseApiJson<{ ok: boolean; pack?: DirectorPack; error?: string }>(res);
      if (!res.ok || !data.pack) {
        setStatus('error', data.error ?? 'Could not load pack');
        return;
      }
      setCurrentPack(data.pack);
      setStatus('review', `Loaded saved pack (ep ${data.pack.episode})`);
    } catch (e) {
      setStatus('error', String(e));
    }
  };

  const generate = async () => {
    if (!concept.trim()) {
      setStatus('error', 'Enter a concept first');
      return;
    }
    setStatus('generating', 'Planning and drafting…');
    try {
      const res = await fetch('/api/director/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, formatTarget, seriesId, dryRun }),
      });
      const data = await parseApiJson<{
        ok: boolean;
        pack?: DirectorPack;
        budgetExceeded?: boolean;
        sessionUsage?: typeof sessionUsage;
        saved?: { projectNames: string[] };
        error?: string;
      }>(res);
      if (!res.ok) {
        setStatus('error', data.error ?? 'Generate failed');
        return;
      }
      const savedMsg =
        data.saved?.projectNames?.length ?
          ` Saved to projects/: ${data.saved.projectNames.join(', ')}`
        : '';
      if (data.budgetExceeded) {
        setStatus('budget_paused', `Session token budget reached.${savedMsg}`);
      } else {
        setStatus('review', `Review your pack before rendering.${savedMsg}`);
      }
      setCurrentPack(data.pack as DirectorPack);
      if (data.sessionUsage) setSessionUsage(data.sessionUsage);
      else if (data.pack?.usage) {
        setSessionUsage(mergeUsage(sessionUsage, data.pack.usage));
      }

      if (!dryRun && data.pack) {
        setStatus('rendering', 'Rendering all assets…');
        const renderRes = await fetch('/api/director/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack: data.pack }),
        });
        const renderData = await parseApiJson<{ ok: boolean; folder?: string; error?: string }>(renderRes);
        if (!renderRes.ok) {
          setStatus('error', renderData.error ?? 'Render failed');
          return;
        }
        setStatus('done', `Rendered to ${renderData.folder}`);
        void loadMeta();
      }
    } catch (e) {
      setStatus('error', String(e));
    }
  };

  const renderAll = async () => {
    if (!currentPack) return;
    setStatus('rendering', 'Rendering all assets…');
    try {
      const res = await fetch('/api/director/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: currentPack }),
      });
      const data = await parseApiJson<{ ok: boolean; folder?: string; error?: string }>(res);
      if (!res.ok) {
        setStatus('error', data.error ?? 'Render failed');
        return;
      }
      setStatus('done', `Rendered to ${data.folder}`);
      void loadMeta();
    } catch (e) {
      setStatus('error', String(e));
    }
  };

  const saveSeries = async (series: SeriesMemory) => {
    await fetch('/api/director/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(series),
    });
    void loadMeta();
  };

  if (!panelOpen) return null;

  const activeSeries = seriesList.find((s) => s.seriesId === seriesId);
  const budget = settings.sessionTokenBudget ?? 50_000;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-dark4 bg-dark2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-dark4 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-gold">
            <Sparkles size={14} /> Director
          </div>
          <button type="button" onClick={() => setPanelOpen(false)} className="text-dim hover:text-gold">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2 font-mono text-[9px] text-dim">
            <span>
              Series:{' '}
              <button type="button" onClick={() => setSeriesModalOpen(true)} className="text-gold hover:underline">
                {activeSeries?.title ?? seriesId}
              </button>
            </span>
            <span>· Ep {activeSeries?.episode ?? 1}</span>
          </div>

          {savedPacks.length > 0 && (
            <label className="flex flex-col gap-1 font-mono text-[9px] uppercase text-dim">
              Load saved pack
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) void loadSavedPack(e.target.value);
                  e.target.value = '';
                }}
                className="border border-dark5 bg-dark0 px-2 py-1 font-mono text-[10px] normal-case text-text"
              >
                <option value="">Select a previous pack…</option>
                {savedPacks.map((p) => (
                  <option key={p.id} value={p.id}>
                    Ep {p.episode} · {p.concept.slice(0, 40)}…
                  </option>
                ))}
              </select>
            </label>
          )}

          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Describe this video / asset pack…"
            rows={4}
            className="w-full resize-none border border-dark5 bg-dark0 p-3 font-mono text-xs text-text placeholder:text-dim"
          />

          <div className="space-y-2 font-mono text-[9px] uppercase text-dim">
            <div className="flex flex-wrap gap-3">
              {(['youtube', 'shorts', 'both'] as const).map((f) => (
                <label key={f} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="formatTarget"
                    checked={formatTarget === f}
                    onChange={() => setFormatTarget(f)}
                  />
                  {f === 'youtube' ? 'YouTube 16:9' : f === 'shorts' ? 'Shorts 9:16' : 'Both'}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                Provider
                <select
                  value={settings.provider ?? 'local'}
                  onChange={(e) => void saveSettings({ provider: e.target.value as DirectorSettings['provider'] })}
                  className="border border-dark5 bg-dark0 px-2 py-1 font-mono text-[10px] normal-case text-text"
                >
                  <option value="local">Local (free)</option>
                  <option value="mock">Demo mode</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Mode
                <select
                  value={dryRun ? 'dry' : 'render'}
                  onChange={(e) => setDryRun(e.target.value === 'dry')}
                  className="border border-dark5 bg-dark0 px-2 py-1 font-mono text-[10px] normal-case text-text"
                >
                  <option value="dry">Dry run (review first)</option>
                  <option value="render">Auto-render after generate</option>
                </select>
              </label>
            </div>

            {(settings.provider === 'openai' || settings.provider === 'anthropic') && (
              <label className="flex flex-col gap-1 normal-case">
                API key {settings.hasKey ? '(saved)' : ''}
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onBlur={() => {
                    if (apiKeyInput) void saveSettings({ apiKey: apiKeyInput });
                  }}
                  placeholder="sk-…"
                  className="border border-dark5 bg-dark0 px-2 py-1 font-mono text-[10px] text-text"
                />
              </label>
            )}

            <label className="flex items-center gap-2 normal-case">
              <input
                type="checkbox"
                checked={settings.qualityMode ?? false}
                onChange={(e) => void saveSettings({ qualityMode: e.target.checked })}
              />
              Quality mode (upgrades planner model)
            </label>
          </div>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={status === 'generating' || status === 'rendering'}
            className="w-full border border-gold-dim py-2.5 font-mono text-[10px] uppercase tracking-[2px] text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            ✦ Generate pack
          </button>

          {statusMessage && (
            <p
              className={`font-mono text-[9px] ${status === 'error' || status === 'budget_paused' ? 'text-red' : 'text-dim'}`}
            >
              {statusMessage}
            </p>
          )}

          {status === 'budget_paused' && (
            <button
              type="button"
              onClick={() => void fetch('/api/director/usage/reset', { method: 'POST' }).then(() => loadMeta())}
              className="w-full border border-dark5 py-1 font-mono text-[9px] uppercase text-dim hover:text-gold"
            >
              Reset session usage
            </button>
          )}

          <CostMeter
            sessionUsage={sessionUsage}
            packUsage={currentPack?.usage}
            stepUsage={currentPack?.stepUsage}
            budget={budget}
          />

          {currentPack && (
            <>
              <PlanView plan={currentPack.plan} />
              <AssetGrid assets={currentPack.assets} onOpenInEditor={(p) => loadProject(p)} />
              {!dryRun && status === 'review' && (
                <button
                  type="button"
                  onClick={() => void renderAll()}
                  className="w-full border border-gold py-2 font-mono text-[10px] uppercase tracking-[2px] text-gold hover:bg-gold/10"
                >
                  ✓ Render all
                </button>
              )}
              {dryRun && (
                <button
                  type="button"
                  onClick={() => void renderAll()}
                  disabled={status === 'rendering'}
                  className="w-full border border-gold py-2 font-mono text-[10px] uppercase tracking-[2px] text-gold hover:bg-gold/10 disabled:opacity-50"
                >
                  ✓ Approve & render all
                </button>
              )}
            </>
          )}

          {settings.provider === 'local' && (
            <p className="font-mono text-[9px] text-dim italic">
              Local draft — refine manually or switch to AI for polish.
            </p>
          )}
        </div>
      </div>

      <SeriesManager
        open={seriesModalOpen}
        onClose={() => setSeriesModalOpen(false)}
        seriesList={seriesList}
        voices={voices}
        activeSeriesId={seriesId}
        onSelectSeries={setSeriesId}
        onSaveSeries={saveSeries}
      />
    </>
  );
}

export function DirectorToggle() {
  const panelOpen = useDirectorStore((s) => s.panelOpen);
  const setPanelOpen = useDirectorStore((s) => s.setPanelOpen);

  return (
    <button
      type="button"
      onClick={() => setPanelOpen(!panelOpen)}
      className={`font-mono text-[9px] uppercase tracking-[2px] ${panelOpen ? 'text-gold' : 'text-dim hover:text-gold'}`}
    >
      ✦ Director
    </button>
  );
}
