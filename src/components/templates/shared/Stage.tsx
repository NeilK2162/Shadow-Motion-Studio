import type { ReactNode } from 'react';
import type { FormatPreset } from '@/lib/formats';
import { placementStyle, type Placement } from '@/lib/placement';

interface StageProps {
  format: FormatPreset;
  placement: Placement;
  children: ReactNode;
}

export function Stage({ format, placement, children }: StageProps) {
  const style = placementStyle(placement, format);

  if (placement === 'fullscreen') {
    return (
      <div style={style}>
        <div
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return <div style={style}>{children}</div>;
}
