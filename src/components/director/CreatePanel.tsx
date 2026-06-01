import type { Beat, DirectorPlan } from '@/director/types';
import { TEMPLATE_META } from '@/types';

interface CreatePanelProps {
  plan: DirectorPlan;
}

function beatLabel(beat: Beat): string {
  if (beat.mode === 'create') {
    return beat.customName ?? beat.template;
  }
  const meta = TEMPLATE_META.find((t) => t.id === beat.template);
  return meta?.label ?? beat.template;
}

export function CreatePanel({ plan }: CreatePanelProps) {
  return (
    <div className="space-y-2 border border-dark4 bg-dark0 p-3">
      <div className="font-mono text-[9px] uppercase tracking-[2px] text-gold">Create vs reuse</div>
      <ul className="space-y-1">
        {plan.beats.map((beat, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-text">
            <span className="text-dim">{i + 1}.</span>
            <span className="font-semibold">{beatLabel(beat)}</span>
            {beat.mode === 'create' ? (
              <span className="rounded border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[8px] uppercase text-gold">
                new template
              </span>
            ) : (
              <span className="text-[8px] uppercase text-dim">reuse · {beat.template}</span>
            )}
            <span className="text-dim">· {beat.intent}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
