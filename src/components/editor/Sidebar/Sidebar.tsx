import { TEMPLATE_BASE_SIZES } from '@/components/templates/shared/cardLayout';
import { TEMPLATE_META, type TemplateGroup } from '@/types';
import { useEditorStore } from '@/store/editorStore';

const GROUP_LABELS: Record<TemplateGroup, string> = {
  stingers: 'Stingers',
  hud: 'HUD',
  cards: 'Cards',
  engagement: 'Engagement',
};

const GROUP_ORDER: TemplateGroup[] = ['stingers', 'hud', 'cards', 'engagement'];

export function Sidebar() {
  const template = useEditorStore((s) => s.project.template);
  const platformFilter = useEditorStore((s) => s.platformFilter);
  const formatId = useEditorStore((s) => s.project.export.formatId ?? 'youtube-landscape');
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const setPlatformFilter = useEditorStore((s) => s.setPlatformFilter);

  const filtered = TEMPLATE_META.filter((meta) => {
    if (platformFilter === 'all') return true;
    const rec = TEMPLATE_BASE_SIZES[meta.id].recommendedFormats;
    if (!rec) return true;
    const formatPlatform =
      platformFilter === 'youtube'
        ? ['youtube-landscape', 'youtube-720']
        : platformFilter === 'reels'
          ? ['shorts-vertical']
          : ['feed-square', 'feed-portrait'];
    return rec.some((f) => formatPlatform.includes(f));
  });

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: filtered.filter((m) => m.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="w-56 shrink-0 border-r border-dark4 bg-dark2 p-3 overflow-y-auto">
      <div className="mb-3 font-mono text-[9px] uppercase tracking-[2px] text-dim">Templates</div>
      <div className="mb-3 flex flex-wrap gap-1">
        {(['all', 'youtube', 'reels', 'feed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setPlatformFilter(f)}
            className={`px-2 py-0.5 font-mono text-[8px] uppercase border ${
              platformFilter === f ? 'border-gold text-gold' : 'border-dark5 text-dim hover:text-silver'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {grouped.map(({ group, items }) => (
          <div key={group}>
            <div className="mb-1 font-mono text-[8px] uppercase tracking-[1px] text-dimmer">{GROUP_LABELS[group]}</div>
            <div className="flex flex-col gap-1">
              {items.map((meta) => {
                const recommended = TEMPLATE_BASE_SIZES[meta.id].recommendedFormats?.includes(formatId);
                return (
                  <button
                    key={meta.id}
                    type="button"
                    onClick={() => setTemplate(meta.id)}
                    className={`text-left font-mono text-[9px] uppercase tracking-[1.5px] px-3 py-2 border transition-colors ${
                      template === meta.id
                        ? 'bg-gold text-black border-gold font-bold'
                        : recommended === false
                          ? 'bg-dark2 text-dimmer border-dark5 hover:border-dim hover:text-dim'
                          : 'bg-dark2 text-dim border-dark5 hover:border-dim hover:text-silver'
                    }`}
                  >
                    {meta.glyph} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
