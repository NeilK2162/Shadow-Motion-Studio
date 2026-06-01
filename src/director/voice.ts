import fs from 'fs/promises';
import { getVoicesPath } from '../lib/runtimeConfig';
import { DEFAULT_VOICE, type VoiceProfile } from './types';

const DEFAULT_VOICES: VoiceProfile[] = [DEFAULT_VOICE];

export async function readVoices(): Promise<VoiceProfile[]> {
  try {
    const raw = await fs.readFile(getVoicesPath(), 'utf-8');
    const data = JSON.parse(raw) as VoiceProfile[];
    return data.length > 0 ? data : DEFAULT_VOICES;
  } catch {
    return DEFAULT_VOICES;
  }
}

export async function writeVoices(voices: VoiceProfile[]): Promise<void> {
  const dir = getVoicesPath().replace(/[^/\\]+$/, '');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(getVoicesPath(), JSON.stringify(voices, null, 2), 'utf-8');
}

export async function getVoiceProfile(id: string): Promise<VoiceProfile> {
  const voices = await readVoices();
  return voices.find((v) => v.id === id) ?? DEFAULT_VOICE;
}
