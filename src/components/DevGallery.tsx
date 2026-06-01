import { Player } from '@remotion/player';
import { createDefaultInputProps } from '@/remotion/inputProps';
import { TemplateComposition } from '@/remotion/TemplateComposition';
import { TEMPLATE_META } from '@/types';
import { getDefaultDurationSeconds } from '@/data/templateDefaults';

export function DevGallery() {
  return (
    <div className="min-h-screen bg-dark1 p-8">
      <h1 className="mb-6 text-center font-title text-3xl tracking-[5px] text-gold">Template Gallery</h1>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {TEMPLATE_META.map((meta) => {
          const durationInFrames = Math.ceil((getDefaultDurationSeconds(meta.id) + 1) * 30);
          const inputProps = createDefaultInputProps(meta.id);
          return (
            <div key={meta.id} className="border border-dark4 bg-dark0 p-4">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[2px] text-dim">{meta.label}</div>
              <div className="flex items-center justify-center overflow-hidden bg-black" style={{ height: 280 }}>
                <Player
                  component={TemplateComposition}
                  inputProps={inputProps}
                  durationInFrames={durationInFrames}
                  fps={30}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{ width: 480, height: 270 }}
                  controls={false}
                  autoPlay={false}
                  initialFrame={durationInFrames - 1}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
