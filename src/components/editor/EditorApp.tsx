import { Sidebar } from '@/components/editor/Sidebar/Sidebar';
import { Preview } from '@/components/editor/Preview/Preview';
import { Properties } from '@/components/editor/Properties/Properties';
import { DirectorPanel, DirectorToggle } from '@/components/director/DirectorPanel';

export function EditorApp() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-dark1 text-text">
      <header className="shrink-0 border-b border-dark4 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="font-title text-3xl tracking-[5px] text-gold">SHADOW MOTION STUDIO</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[3px] text-dim">GTA-Inspired Visual Language · Local Creator Edition</p>
          </div>
          <div className="flex flex-1 justify-end">
            <DirectorToggle />
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Preview />
          <Properties />
        </main>
      </div>
      <DirectorPanel />
    </div>
  );
}
