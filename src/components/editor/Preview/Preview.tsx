import { Player } from '@remotion/player';
import { RotateCcw } from 'lucide-react';
import { TemplateComposition } from '@/remotion/TemplateComposition';
import { projectToInputProps } from '@/remotion/inputProps';
import { FORMAT_PRESETS } from '@/lib/formats';
import { useEditorStore } from '@/store/editorStore';
import { RESOLUTION_MAP } from '@/types';

const PREVIEW_MAX_W = 880;
const PREVIEW_MAX_H = 480;

export function Preview() {
  const project = useEditorStore((s) => s.project);
  const previewBackground = useEditorStore((s) => s.previewBackground);
  const customBackground = useEditorStore((s) => s.customBackground);
  const playerKey = useEditorStore((s) => s.playerKey);
  const showSafeAreaGuides = useEditorStore((s) => s.showSafeAreaGuides);
  const replay = useEditorStore((s) => s.replay);
  const setPreviewBackground = useEditorStore((s) => s.setPreviewBackground);
  const setCustomBackground = useEditorStore((s) => s.setCustomBackground);
  const setFormat = useEditorStore((s) => s.setFormat);
  const setShowSafeAreaGuides = useEditorStore((s) => s.setShowSafeAreaGuides);

  const { width, height } = RESOLUTION_MAP[project.export.resolution];
  const layoutScale = Math.min(PREVIEW_MAX_W / width, PREVIEW_MAX_H / height, 1);
  const displayW = Math.round(width * layoutScale);
  const displayH = Math.round(height * layoutScale);

  const inputProps = {
    ...projectToInputProps(project),
    backgroundMode: previewBackground,
    customBackground,
    resolution: project.export.resolution,
    showSafeAreaGuides,
  };

  const stageBackground =
    previewBackground === 'transparent'
      ? 'repeating-conic-gradient(#111 0% 25%, #1a1a1a 0% 50%) 50% / 20px 20px'
      : previewBackground === 'custom'
        ? customBackground
        : '#000';

  return (
    <section className="shrink-0 border-b border-dark4 bg-dark0 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[2px] text-dim">Preview</div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={project.export.formatId ?? 'youtube-landscape'}
            onChange={(e) => setFormat(e.target.value as (typeof FORMAT_PRESETS)[number]['id'])}
            className="border border-dark5 bg-dark2 px-2 py-1 font-mono text-[9px] uppercase text-dim"
          >
            {FORMAT_PRESETS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={previewBackground}
            onChange={(e) => setPreviewBackground(e.target.value as 'dark' | 'transparent' | 'custom')}
            className="border border-dark5 bg-dark2 px-2 py-1 font-mono text-[9px] uppercase text-dim"
          >
            <option value="dark">Dark</option>
            <option value="transparent">Transparent</option>
            <option value="custom">Custom</option>
          </select>
          {previewBackground === 'custom' && (
            <input
              type="color"
              value={customBackground}
              onChange={(e) => setCustomBackground(e.target.value)}
              className="h-7 w-10 border border-dark5 bg-dark2"
            />
          )}
          <label className="flex items-center gap-1 font-mono text-[9px] uppercase text-dim">
            <input type="checkbox" checked={showSafeAreaGuides} onChange={(e) => setShowSafeAreaGuides(e.target.checked)} />
            Safe area
          </label>
          <button
            type="button"
            onClick={replay}
            className="flex items-center gap-1 border border-dark5 px-3 py-1 font-mono text-[9px] uppercase tracking-[2px] text-dim hover:border-gold-dim hover:text-gold"
          >
            <RotateCcw size={12} /> Replay
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div
          className="relative overflow-hidden border border-dark3"
          style={{
            width: displayW,
            height: displayH,
            maxWidth: '100%',
            background: stageBackground,
          }}
        >
          <div
            style={{
              width,
              height,
              transform: `scale(${layoutScale})`,
              transformOrigin: 'top left',
            }}
          >
            <Player
              key={playerKey}
              component={TemplateComposition}
              inputProps={inputProps}
              durationInFrames={project.animation.durationInFrames}
              fps={project.export.fps}
              compositionWidth={width}
              compositionHeight={height}
              style={{ width, height }}
              controls={false}
              loop
              autoPlay
            />
          </div>
        </div>
      </div>
    </section>
  );
}
