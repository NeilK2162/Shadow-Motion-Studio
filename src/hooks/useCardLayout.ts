import { createContext, useContext } from 'react';
import type { FormatId } from '@/lib/formats';
import type { Placement } from '@/lib/placement';
import type { TemplateId } from '@/types';
import { getCardLayout, type CardLayout } from '@/components/templates/shared/cardLayout';

export interface TemplateLayoutContextValue {
  placement: Placement;
  canvasWidth: number;
  canvasHeight: number;
  formatId?: FormatId;
}

export const TemplateLayoutContext = createContext<TemplateLayoutContextValue | null>(null);

export function useTemplateLayoutContext(): TemplateLayoutContextValue | null {
  return useContext(TemplateLayoutContext);
}

/** Resolves card layout with canvas + placement from composition context. */
export function useCardLayout(
  templateId: TemplateId,
  fields: Record<string, unknown>,
  formatId?: FormatId,
): CardLayout {
  const ctx = useTemplateLayoutContext();
  return getCardLayout(templateId, fields, formatId ?? ctx?.formatId, {
    placement: ctx?.placement,
    canvasWidth: ctx?.canvasWidth,
    canvasHeight: ctx?.canvasHeight,
  });
}
