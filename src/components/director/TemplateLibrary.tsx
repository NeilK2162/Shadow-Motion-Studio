import { useEffect, useState } from 'react';
import { Download, Pencil, Trash2, Upload, X } from 'lucide-react';
import type { TemplateDefinition } from '@/director/templateSchema';
import { useCustomTemplateStore } from '@/store/customTemplateStore';
import { useEditorStore } from '@/store/editorStore';

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateLibrary({ open, onClose }: TemplateLibraryProps) {
  const templates = useCustomTemplateStore((s) => s.templates);
  const loadTemplates = useCustomTemplateStore((s) => s.loadTemplates);
  const loadDefinition = useCustomTemplateStore((s) => s.loadDefinition);
  const deleteTemplate = useCustomTemplateStore((s) => s.deleteTemplate);
  const importTemplate = useCustomTemplateStore((s) => s.importTemplate);
  const loadCustomTemplate = useEditorStore((s) => s.loadCustomTemplate);

  const [editJson, setEditJson] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) void loadTemplates();
  }, [open, loadTemplates]);

  if (!open) return null;

  const handleEdit = async (id: string) => {
    const def = await loadDefinition(id);
    if (def) {
      setEditId(id);
      setEditJson(JSON.stringify(def, null, 2));
      setError('');
    }
  };

  const handleDuplicate = async (id: string) => {
    const def = await loadDefinition(id);
    if (!def) return;
    const copy: TemplateDefinition = {
      ...def,
      id: `${def.id}-copy-${Date.now().toString(36).slice(-4)}`,
      name: `${def.name} Copy`,
    };
    setEditId(null);
    setEditJson(JSON.stringify(copy, null, 2));
    setError('');
  };

  const handleExport = async (id: string) => {
    const def = await loadDefinition(id);
    if (!def) return;
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${def.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const result = await importTemplate(raw);
      if (!result.ok) setError(result.errors?.join('\n') ?? 'Import failed');
      else setError('');
    } catch (e) {
      setError(String(e));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const def = JSON.parse(editJson) as TemplateDefinition;
      const result = await useCustomTemplateStore.getState().saveTemplate(def);
      if (!result.ok) {
        setError(result.errors?.join('\n') ?? 'Save failed');
        return;
      }
      setError('');
      setEditId(null);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col border border-dark4 bg-dark2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-dark4 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[2px] text-gold">Custom template library</div>
          <button type="button" onClick={onClose} className="text-dim hover:text-gold">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2 font-mono text-[9px] uppercase text-dim hover:text-gold">
            <Upload size={12} /> Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
              }}
            />
          </label>

          {templates.length === 0 && (
            <p className="font-mono text-[9px] text-dim">No custom templates yet. Author one via Director or import JSON.</p>
          )}

          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between border border-dark4 bg-dark0 px-3 py-2">
              <button
                type="button"
                onClick={async () => {
                  const def = await loadDefinition(t.id);
                  if (def) {
                    loadCustomTemplate(def);
                    onClose();
                  }
                }}
                className="text-left font-mono text-[10px] text-text hover:text-gold"
              >
                {t.glyph} {t.label}
              </button>
              <div className="flex gap-2">
                <button type="button" title="Edit" onClick={() => void handleEdit(t.id)} className="text-dim hover:text-gold">
                  <Pencil size={12} />
                </button>
                <button type="button" title="Duplicate" onClick={() => void handleDuplicate(t.id)} className="text-dim hover:text-gold">
                  <Download size={12} />
                </button>
                <button type="button" title="Export" onClick={() => void handleExport(t.id)} className="text-dim hover:text-gold">
                  <Download size={12} />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => void deleteTemplate(t.id)}
                  className="text-dim hover:text-red"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {editJson && (
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase text-gold">{editId ? 'Edit template' : 'New / duplicate'}</div>
              <textarea
                value={editJson}
                onChange={(e) => setEditJson(e.target.value)}
                rows={12}
                className="w-full border border-dark5 bg-dark0 p-2 font-mono text-[10px] text-text"
              />
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                className="border border-gold px-3 py-1 font-mono text-[9px] uppercase text-gold hover:bg-gold/10"
              >
                Save
              </button>
            </div>
          )}

          {error && <p className="font-mono text-[9px] text-red whitespace-pre-wrap">{error}</p>}
        </div>
      </div>
    </div>
  );
}
