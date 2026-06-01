import { Sidebar } from '@/components/editor/Sidebar/Sidebar';
import { Preview } from '@/components/editor/Preview/Preview';
import { Properties } from '@/components/editor/Properties/Properties';

export function EditorApp() {
  return (
    <div className="flex h-screen flex-col bg-dark1 text-text">
      <header className="border-b border-dark4 px-6 py-4 text-center">
        <h1 className="font-title text-3xl tracking-[5px] text-gold">SHADOW MOTION STUDIO</h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[3px] text-dim">GTA-Inspired Visual Language · Local Creator Edition</p>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <Preview />
      </div>
      <Properties />
    </div>
  );
}
