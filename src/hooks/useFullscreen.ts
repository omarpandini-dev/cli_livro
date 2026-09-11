import { useCallback, useEffect, useState, type RefObject } from 'react';

export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [supported] = useState(Boolean(document.fullscreenEnabled));

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = useCallback(async () => {
    if (!supported) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (target.current) await target.current.requestFullscreen();
  }, [supported, target]);

  return { isFullscreen, supported, toggle };
}
