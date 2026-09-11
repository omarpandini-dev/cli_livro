import { ImageOff } from 'lucide-react';
import { useState } from 'react';

interface Props { src: string | null; alt: string; className?: string; loading?: 'lazy' | 'eager'; }

export function ImageWithFallback({ src, alt, className, loading = 'lazy' }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`image-fallback ${className ?? ''}`} role="img" aria-label={`Imagem indisponível: ${alt}`}><ImageOff /><span>Uma surpresa<br />está chegando</span></div>;
  return <img className={className} src={src} alt={alt} loading={loading} decoding="async" onError={() => setFailed(true)} />;
}
