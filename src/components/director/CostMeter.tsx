import type { StepUsage, TokenUsage } from '@/director/types';

interface CostMeterProps {
  sessionUsage: TokenUsage;
  packUsage?: TokenUsage;
  stepUsage?: StepUsage[];
  budget: number;
}

function segmentUsage(usage: TokenUsage) {
  const fresh = Math.max(0, usage.inputTokens - usage.cachedInputTokens - usage.cacheWriteTokens);
  return { fresh, cached: usage.cachedInputTokens, writes: usage.cacheWriteTokens };
}

export function CostMeter({ sessionUsage, packUsage, stepUsage, budget }: CostMeterProps) {
  const totalTokens = sessionUsage.inputTokens + sessionUsage.outputTokens;
  const pct = Math.min(100, (totalTokens / budget) * 100);
  const seg = segmentUsage(sessionUsage);
  const cacheWarm = sessionUsage.cachedInputTokens > 0;
  const cacheCold = sessionUsage.cacheWriteTokens > 0 && sessionUsage.cachedInputTokens === 0;

  return (
    <div className="space-y-2 border border-dark4 bg-dark0 p-3">
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[1px] text-dim">
        <span>Session tokens</span>
        <span className={totalTokens > budget ? 'text-red' : 'text-gold'}>
          {totalTokens.toLocaleString()} / {budget.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden bg-dark4">
        <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-wrap gap-2 font-mono text-[8px] uppercase">
        <span className={cacheWarm ? 'text-greenBright' : cacheCold ? 'text-gold' : 'text-dim'}>
          cache: {cacheWarm ? 'warm ✓' : cacheCold ? 'cold (written)' : 'idle'}
        </span>
        <span className="text-dim">fresh in {seg.fresh.toLocaleString()}</span>
        <span className="text-dim">cache read {seg.cached.toLocaleString()}</span>
        <span className="text-dim">cache write {seg.writes.toLocaleString()}</span>
      </div>

      <div className="font-mono text-[9px] text-dim">
        Est. cost this session: <span className="text-gold">${sessionUsage.estimatedCostUsd.toFixed(4)}</span>
        {packUsage && (
          <>
            {' '}
            · this pack: <span className="text-text">${packUsage.estimatedCostUsd.toFixed(4)}</span>
          </>
        )}
      </div>
      {stepUsage && stepUsage.length > 0 && (
        <details className="font-mono text-[9px] text-dim">
          <summary className="cursor-pointer text-gold-dim hover:text-gold">Per-step breakdown</summary>
          <ul className="mt-1 space-y-0.5 pl-2">
            {stepUsage.map((s, i) => {
              const sSeg = segmentUsage(s.usage);
              return (
                <li key={i}>
                  {s.step}: in {s.usage.inputTokens} (fresh {sSeg.fresh}, read {sSeg.cached}, write {sSeg.writes}) / out{' '}
                  {s.usage.outputTokens}
                  {' · '}${s.usage.estimatedCostUsd.toFixed(4)}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
