import { create } from 'zustand';
import type { TemplateDefinition } from '@/director/templateSchema';
import { defToMeta } from '@/director/templateUtils';
import { parseApiJson } from '@/lib/apiFetch';
import type { CustomTemplateMeta } from '@/types';

interface CustomTemplateState {
  loaded: boolean;
  loading: boolean;
  templates: CustomTemplateMeta[];
  defs: Record<string, TemplateDefinition>;
  loadTemplates: () => Promise<void>;
  loadDefinition: (id: string) => Promise<TemplateDefinition | null>;
  saveTemplate: (def: TemplateDefinition) => Promise<{ ok: boolean; errors?: string[] }>;
  deleteTemplate: (id: string) => Promise<boolean>;
  importTemplate: (raw: unknown) => Promise<{ ok: boolean; def?: TemplateDefinition; errors?: string[] }>;
}

export const useCustomTemplateStore = create<CustomTemplateState>((set, get) => ({
  loaded: false,
  loading: false,
  templates: [],
  defs: {},

  loadTemplates: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await fetch('/api/templates');
      const data = await parseApiJson<{ ok: boolean; templates: Array<{ id: string; name: string; glyph: string; group: CustomTemplateMeta['group'] }> }>(res);
      const templates: CustomTemplateMeta[] = (data.templates ?? []).map((t) => ({
        id: t.id,
        glyph: t.glyph,
        label: t.name,
        group: t.group,
        defaultDurationSeconds: 3,
        compositionWidth: 1920,
        compositionHeight: 1080,
        isCustom: true,
        recommendedFormats: ['youtube-landscape', 'shorts-vertical', 'feed-square'],
      }));
      set({ templates, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadDefinition: async (id) => {
    if (get().defs[id]) return get().defs[id];
    try {
      const res = await fetch(`/api/templates/load?id=${encodeURIComponent(id)}`);
      const data = await parseApiJson<{ ok: boolean; def: TemplateDefinition }>(res);
      if (data.def) {
        set((s) => ({ defs: { ...s.defs, [id]: data.def } }));
        return data.def;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  saveTemplate: async (def) => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(def),
    });
    const data = await parseApiJson<{ ok: boolean; errors?: string[] }>(res);
    if (data.ok) {
      const meta = defToMeta(def);
      set((s) => ({
        templates: [...s.templates.filter((t) => t.id !== def.id), meta],
        defs: { ...s.defs, [def.id]: def },
      }));
    }
    return { ok: data.ok, errors: data.errors };
  },

  deleteTemplate: async (id) => {
    const res = await fetch(`/api/templates/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await parseApiJson<{ ok: boolean }>(res);
    if (data.ok) {
      set((s) => {
        const { [id]: _removed, ...defs } = s.defs;
        return { templates: s.templates.filter((t) => t.id !== id), defs };
      });
    }
    return data.ok;
  },

  importTemplate: async (raw) => {
    const res = await fetch('/api/templates/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raw),
    });
    const data = await parseApiJson<{ ok: boolean; def?: TemplateDefinition; errors?: string[] }>(res);
    if (data.ok && data.def) {
      const meta = defToMeta(data.def);
      set((s) => ({
        templates: [...s.templates.filter((t) => t.id !== data.def!.id), meta],
        defs: { ...s.defs, [data.def!.id]: data.def! },
      }));
    }
    return { ok: data.ok, def: data.def, errors: data.errors };
  },
}));
