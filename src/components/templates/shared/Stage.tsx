import type { ReactNode } from 'react';
import type { FormatPreset } from '@/lib/formats';
import { placementStyle, type Placement } from '@/lib/placement';

interface StageProps {
  format: FormatPreset;
  placement: Placement;
  children: ReactNode;
}

export function Stage({ format, placement, children }: StageProps) {
  return <div style={placementStyle(placement, format)}>{children}</div>;
}
