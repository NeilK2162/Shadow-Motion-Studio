import type { DirectorPlan } from '@/director/types';
import { TEMPLATE_META } from '@/types';

interface PlanViewProps {
  plan: DirectorPlan;
}

export function PlanView({ plan }: PlanViewProps) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[9px] uppercase tracking-[2px] text-gold">Plan</div>
      <ol className="space-y-1">
        {plan.beats.map((beat, i) => {
          const meta = TEMPLATE_META.find((t) => t.id === beat.template);
          const glyph = meta?.glyph ?? (beat.mode === 'create' ? '✦' : '◆');
          const label = beat.mode === 'create' ? beat.customName ?? beat.template : meta?.label ?? beat.template;
          return (
            <li key={i} className="flex flex-wrap gap-2 font-mono text-[10px] text-text">
              <span className="text-dim">{i + 1}.</span>
              <span className="text-gold">{glyph}</span>
              <span className="font-semibold">{label}</span>
              {beat.mode === 'create' && (
                <span className="text-[8px] uppercase text-gold-dim">new</span>
              )}
              <span className="text-dim">· {beat.intent}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
