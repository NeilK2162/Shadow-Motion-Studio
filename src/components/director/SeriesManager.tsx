import { useState } from 'react';
import type { SeriesMemory, VoiceProfile } from '@/director/types';

interface SeriesManagerProps {
  open: boolean;
  onClose: () => void;
  seriesList: SeriesMemory[];
  voices: VoiceProfile[];
  activeSeriesId: string;
  onSelectSeries: (id: string) => void;
  onSaveSeries: (series: SeriesMemory) => Promise<void>;
}

export function SeriesManager({
  open,
  onClose,
  seriesList,
  voices,
  activeSeriesId,
  onSelectSeries,
  onSaveSeries,
}: SeriesManagerProps) {
  const active = seriesList.find((s) => s.seriesId === activeSeriesId) ?? seriesList[0];
  const [draft, setDraft] = useState<SeriesMemory | null>(null);
  const editing = draft ?? active;

  if (!open || !editing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-dark4 bg-dark2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[2px] text-gold">Series manager</h3>
          <button type="button" onClick={onClose} className="font-mono text-[9px] text-dim hover:text-gold">
            Close
          </button>
        </div>

        <label className="mb-3 flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase text-dim">Active series</span>
          <select
            value={activeSeriesId}
            onChange={(e) => {
              onSelectSeries(e.target.value);
              setDraft(null);
            }}
            className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
          >
            {seriesList.map((s) => (
              <option key={s.seriesId} value={s.seriesId}>
                {s.title} (ep {s.episode})
              </option>
            ))}
          </select>
        </label>

        <label className="mb-3 flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase text-dim">Title</span>
          <input
            value={editing.title}
            onChange={(e) => setDraft({ ...editing, title: e.target.value })}
            className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
          />
        </label>

        <label className="mb-3 flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase text-dim">Voice profile</span>
          <select
            value={editing.voiceProfileId}
            onChange={(e) => setDraft({ ...editing, voiceProfileId: e.target.value })}
            className="border border-dark5 bg-dark0 px-2 py-1.5 font-mono text-xs text-text"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-3 font-mono text-[9px] text-dim">
          Episode {editing.episode} · Users {String(editing.facts.shadowUsers ?? '—')} · RESPECT{' '}
          {String(editing.facts.respectTotal ?? '—')}
        </div>

        <button
          type="button"
          onClick={async () => {
            await onSaveSeries(editing);
            setDraft(null);
            onClose();
          }}
          className="w-full border border-gold-dim py-2 font-mono text-[9px] uppercase tracking-[2px] text-gold hover:bg-gold/10"
        >
          Save series
        </button>
      </div>
    </div>
  );
}
