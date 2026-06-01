import { Player } from '@remotion/player';
import { RotateCcw } from 'lucide-react';
import { TemplateComposition } from '@/remotion/TemplateComposition';
import { projectToInputProps } from '@/remotion/inputProps';
import { useEditorStore } from '@/store/editorStore';
import { RESOLUTION_MAP } from '@/types';
import { getTemplateCardSize } from '@/lib/previewScale';

export function Preview() {
  const project = useEditorStore((s) => s.project);
  const previewBackground = useEditorStore((s) => s.previewBackground);
  const customBackground = useEditorStore((s) => s.customBackground);
  const playerKey = useEditorStore((s) => s.playerKey);
  const replay = useEditorStore((s) => s.replay);
  const setPreviewBackground = useEditorStore((s) => s.setPreviewBackground);
  const setCustomBackground = useEditorStore((s) => s.setCustomBackground);

  const { width, height } = RESOLUTION_MAP[project.export.resolution];
  const cardSize = getTemplateCardSize(project.template, project.fields);
  // Zoom preview so the card fills ~90% of the preview pane (not the full composition canvas).
  const scale = Math.min((760 * 0.9) / cardSize.width, (480 * 0.9) / cardSize.height, 2.5);
  const inputProps = {
    ...projectToInputProps(project),
    backgroundMode: previewBackground,
    customBackground,
    resolution: project.export.resolution,
  };

  return (
    <div className="flex flex-1 flex-col bg-dark0 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[9px] uppercase tracking-[2px] text-dim">Preview</div>
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={replay}
            className="flex items-center gap-1 border border-dark5 px-3 py-1 font-mono text-[9px] uppercase tracking-[2px] text-dim hover:border-gold-dim hover:text-gold"
          >
            <RotateCcw size={12} /> Replay
          </button>
        </div>
      </div>
      <div
        className="relative mx-auto flex flex-1 items-center justify-center overflow-hidden border border-dark3"
        style={{
          background:
            previewBackground === 'transparent'
              ? 'repeating-conic-gradient(#111 0% 25%, #1a1a1a 0% 50%) 50% / 20px 20px'
              : previewBackground === 'custom'
                ? customBackground
                : '#000',
          minHeight: 420,
          width: '100%',
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
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
  );
}
