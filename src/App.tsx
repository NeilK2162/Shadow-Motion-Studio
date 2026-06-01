import { EditorApp } from '@/components/editor/EditorApp';
import { DevGallery } from '@/components/DevGallery';

const showGallery = new URLSearchParams(window.location.search).get('gallery') === '1';

export default function App() {
  if (showGallery) return <DevGallery />;
  return <EditorApp />;
}
