import type { DirectorPlan } from '@/director/types';
import { getTemplateMeta } from '@/types';

interface PlanViewProps {
  plan: DirectorPlan;
}

export function PlanView({ plan }: PlanViewProps) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[9px] uppercase tracking-[2px] text-gold">Plan</div>
      <ol className="space-y-1">
        {plan.beats.map((beat, i) => {
          const meta = getTemplateMeta(beat.template);
          return (
            <li key={i} className="flex gap-2 font-mono text-[10px] text-text">
              <span className="text-dim">{i + 1}.</span>
              <span className="text-gold">{meta.glyph}</span>
              <span className="font-semibold">{beat.template}</span>
              <span className="text-dim">· {beat.intent}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
