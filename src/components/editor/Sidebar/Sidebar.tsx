import { TEMPLATE_META } from '@/types';
import { useEditorStore } from '@/store/editorStore';

export function Sidebar() {
  const template = useEditorStore((s) => s.project.template);
  const setTemplate = useEditorStore((s) => s.setTemplate);

  return (
    <aside className="w-56 shrink-0 border-r border-dark4 bg-dark2 p-3 overflow-y-auto">
      <div className="mb-3 font-mono text-[9px] uppercase tracking-[2px] text-dim">Templates</div>
      <div className="flex flex-col gap-1">
        {TEMPLATE_META.map((meta) => (
          <button
            key={meta.id}
            type="button"
            onClick={() => setTemplate(meta.id)}
            className={`text-left font-mono text-[9px] uppercase tracking-[1.5px] px-3 py-2 border transition-colors ${
              template === meta.id
                ? 'bg-gold text-black border-gold font-bold'
                : 'bg-dark2 text-dim border-dark5 hover:border-dim hover:text-silver'
            }`}
          >
            {meta.glyph} {meta.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
