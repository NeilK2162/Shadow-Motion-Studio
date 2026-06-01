import { Player } from '@remotion/player';
import { ExternalLink } from 'lucide-react';
import { createDefaultProject, projectToInputProps } from '@/remotion/inputProps';
import { TemplateComposition } from '@/remotion/TemplateComposition';
import type { GeneratedAsset } from '@/director/types';
import { getTemplateMeta, RESOLUTION_MAP } from '@/types';
import type { Project } from '@/types';

const THUMB_MAX = 200;

function assetToProject(asset: GeneratedAsset): Project {
  if (asset.templateDef) {
    return { ...createDefaultProject(asset.templateDef.id, asset.templateDef), fields: asset.fields };
  }
  return { ...createDefaultProject(asset.template as import('@/types').TemplateId), fields: asset.fields };
}

interface AssetGridProps {
  assets: GeneratedAsset[];
  onOpenInEditor: (project: Project) => void;
}

export function AssetGrid({ assets, onOpenInEditor }: AssetGridProps) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[9px] uppercase tracking-[2px] text-gold">Generated assets</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset, i) => {
          const project = assetToProject(asset);
          let glyph = '✦';
          let label = asset.template;
          try {
            if (!asset.isCustom) {
              const meta = getTemplateMeta(asset.template as Parameters<typeof getTemplateMeta>[0]);
              glyph = meta.glyph;
              label = meta.label;
            } else {
              glyph = asset.templateDef?.glyph ?? '✦';
              label = asset.templateDef?.name ?? asset.template;
            }
          } catch {
            glyph = asset.templateDef?.glyph ?? '✦';
            label = asset.templateDef?.name ?? asset.template;
          }

          const { width, height } = RESOLUTION_MAP[project.export.resolution];
          const scale = Math.min(THUMB_MAX / width, THUMB_MAX / height, 1);
          const displayW = Math.round(width * scale);
          const displayH = Math.round(height * scale);
          const inputProps = projectToInputProps(project);

          return (
            <div key={i} className="border border-dark4 bg-dark0 p-2">
              <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase text-dim">
                <span>
                  {glyph} {label}
                  {asset.isCustom && (
                    <span className="ml-1 rounded border border-gold/30 px-1 text-[7px] text-gold">custom</span>
                  )}
                </span>
                {!asset.valid && <span className="text-red">invalid</span>}
              </div>
              <div
                className="mx-auto overflow-hidden border border-dark3 bg-black"
                style={{ width: displayW, height: displayH }}
              >
                <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <Player
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
              <button
                type="button"
                onClick={() => onOpenInEditor(project)}
                className="mt-2 flex w-full items-center justify-center gap-1 border border-dark5 py-1 font-mono text-[9px] uppercase tracking-[1px] text-dim hover:border-gold-dim hover:text-gold"
              >
                <ExternalLink size={10} /> Open in editor
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
