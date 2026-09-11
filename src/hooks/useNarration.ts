import { useCallback, useEffect, useRef, useState } from 'react';
import { AUDIO_KEY } from '@/utils/storage';

export function useNarration(audioUrl: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem(AUDIO_KEY) === 'true');
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const unlockedRef = useRef(false);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    audioRef.current = null;
  }, []);

  const play = useCallback(async (markUnlocked = false) => {
    if (markUnlocked) unlockedRef.current = true;
    stop();
    if (!audioUrl || muted) return;
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audioRef.current = audio;
    audio.addEventListener('error', () => { stop(); setNeedsInteraction(false); }, { once: true });
    try { await audio.play(); setNeedsInteraction(false); unlockedRef.current = true; }
    catch { setNeedsInteraction(true); }
  }, [audioUrl, muted, stop]);

  useEffect(() => {
    stop();
    if (audioUrl && !muted && unlockedRef.current) void play();
    else if (audioUrl && !muted) setNeedsInteraction(true);
    return stop;
  }, [audioUrl, muted, play, stop]);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      localStorage.setItem(AUDIO_KEY, String(next));
      if (next) stop(); else if (audioUrl) void play(true);
      return next;
    });
  }, [audioUrl, play, stop]);

  return { muted, needsInteraction, toggleMuted, activate: () => play(true) };
}
