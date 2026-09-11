import type { ContentItem, ProgressMap } from '@/types';

const PROGRESS_KEY = 'mundoEncantado.progress';
export const AUDIO_KEY = 'mundoEncantado.audioMuted';

export function contentKey(content: Pick<ContentItem, 'type' | 'slug'>): string {
  return `${content.type}:${content.slug}`;
}

export function readProgress(): ProgressMap {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value as ProgressMap : {};
  } catch { return {}; }
}

export function saveProgress(key: string, pageIndex: number): void {
  const current = readProgress();
  current[key] = pageIndex;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('mundo-progress')); 
}

export function clearProgress(key: string): void {
  const current = readProgress();
  delete current[key];
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('mundo-progress'));
}
