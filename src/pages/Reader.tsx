import { Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageFlipReader, type ReaderHandle } from '@/components/PageFlipReader';
import { ReaderControls } from '@/components/ReaderControls';
import { ReaderLoading } from '@/components/Loading';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useNarration } from '@/hooks/useNarration';
import { api } from '@/services/api';
import type { ContentItem, ContentKind } from '@/types';
import { clearProgress, contentKey, readProgress, saveProgress } from '@/utils/storage';

export function Reader({ kind }: { kind: ContentKind }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const readerRef = useRef<ReaderHandle>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const currentPage = content?.pages?.[pageIndex];
  const narration = useNarration(currentPage?.audio ?? null);
  const fullscreen = useFullscreen(shellRef);

  useEffect(() => {
    if (!slug) { setError('Endereço de aventura inválido.'); return; }
    api.get(kind, slug).then((item) => {
      const saved = readProgress()[contentKey(item)] ?? 0;
      const requested = (location.state as { resumeAt?: number } | null)?.resumeAt;
      const start = Math.min(Math.max(requested ?? saved, 0), Math.max(item.pageCount - 1, 0));
      setPageIndex(start); setContent(item);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Aventura não encontrada.'));
  }, [kind, slug, location.state]);

  useEffect(() => {
    if (!content || !currentPage) return;
    saveProgress(contentKey(content), pageIndex);
    [content.pages?.[pageIndex - 1]?.image, content.pages?.[pageIndex + 1]?.image].filter(Boolean).forEach((src) => { const image = new Image(); image.src = src as string; });
  }, [content, currentPage, pageIndex]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (fullscreen.isFullscreen) hideTimer.current = window.setTimeout(() => setControlsVisible(false), 1000);
  }, [fullscreen.isFullscreen]);

  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); }, []);
  const next = useCallback(() => readerRef.current?.next(), []);
  const previous = useCallback(() => readerRef.current?.previous(), []);
  const restart = useCallback(() => { if (content) clearProgress(contentKey(content)); setPageIndex(0); readerRef.current?.goTo(0); }, [content]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
      if (event.key.toLowerCase() === 'm') narration.toggleMuted();
      if (event.key.toLowerCase() === 'f') void fullscreen.toggle();
      showControls();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, narration, next, previous, showControls]);

  if (error) return <main className="reader-error"><span>✦</span><h1>Essa aventura se perdeu no caminho</h1><p>{error}</p><button onClick={() => navigate('/')}>Voltar para a biblioteca</button></main>;
  if (!content) return <ReaderLoading />;
  if (!content.pages?.length) return <main className="reader-error"><span>✦</span><h1>As páginas ainda não chegaram</h1><p>Encontramos a história, mas ela ainda não tem páginas para ler.</p><button onClick={() => navigate('/')}>Voltar para a biblioteca</button></main>;

  return <div ref={shellRef} className={`reader-shell ${fullscreen.isFullscreen ? 'is-fullscreen' : ''} ${controlsVisible ? 'controls-visible' : 'controls-hidden'}`} onPointerMove={showControls} onPointerDown={showControls}>
    <div className="reader-ambience" aria-hidden="true" />
    <header className="reader-header"><div><span>{content.type === 'book' ? 'Amostra de livro personalizado' : 'Amostra de quadrinho personalizado'}</span><h1>{content.title}</h1></div></header>
    {narration.needsInteraction && !narration.muted && <button className="enable-narration" onClick={narration.activate}><Volume2 />Ativar narração</button>}
    <PageFlipReader ref={readerRef} pages={content.pages} initialPage={pageIndex} onPageChange={(index) => { setPageIndex(index); showControls(); }} onInteraction={() => { showControls(); if (narration.needsInteraction) void narration.activate(); }} />
    <ReaderControls page={pageIndex} total={content.pages.length} muted={narration.muted} fullscreen={fullscreen.isFullscreen} fullscreenSupported={fullscreen.supported} onPrevious={previous} onNext={next} onToggleMuted={narration.toggleMuted} onToggleFullscreen={() => void fullscreen.toggle()} onRestart={restart} />
  </div>;
}
