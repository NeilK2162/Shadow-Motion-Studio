import type { CSSProperties, ReactNode } from 'react';
import type { BackgroundMode } from '@/types';

interface CardStageProps {
  children: ReactNode;
  backgroundMode?: BackgroundMode;
  customBackground?: string;
  width?: number;
  height?: number;
}

export function CardStage({
  children,
  backgroundMode = 'dark',
  customBackground = '#080808',
  width = 1920,
  height = 1080,
}: CardStageProps) {
  const bgStyle: CSSProperties =
    backgroundMode === 'transparent'
      ? { background: 'transparent' }
      : backgroundMode === 'custom'
        ? { background: customBackground }
        : { background: '#000000' };

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...bgStyle,
      }}
    >
      {children}
    </div>
  );
}
