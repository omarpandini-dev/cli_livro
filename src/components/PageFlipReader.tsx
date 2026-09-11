import { PageFlip, type PageFlipEvent } from 'page-flip';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { ContentPage } from '@/types';

export interface ReaderHandle {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  refresh: () => void;
}

interface Props {
  pages: ContentPage[];
  initialPage: number;
  onPageChange: (index: number) => void;
  onInteraction: () => void;
}

interface ViewportSize { width: number; height: number; }

function getViewportSize(): ViewportSize {
  return {
    width: Math.max(280, window.innerWidth),
    height: Math.max(360, window.innerHeight),
  };
}

function createPageElement(page: ContentPage, eager: boolean): HTMLDivElement {
  const element = document.createElement('div');
  element.className = 'reader-page';
  element.dataset.density = 'soft';

  const image = document.createElement('img');
  image.src = page.image;
  image.alt = `Página ${page.number}`;
  image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';

  const fallback = document.createElement('div');
  fallback.className = 'reader-page-fallback';
  fallback.setAttribute('role', 'img');
  fallback.setAttribute('aria-label', `Imagem indisponível: página ${page.number}`);
  fallback.textContent = 'Esta página se perdeu no caminho ✦';

  image.addEventListener('error', () => {
    image.hidden = true;
    fallback.classList.add('visible');
  }, { once: true });

  const number = document.createElement('span');
  number.className = 'page-number';
  number.textContent = String(page.number);
  element.append(image, fallback, number);
  return element;
}

export const PageFlipReader = forwardRef<ReaderHandle, Props>(({ pages, initialPage, onPageChange, onInteraction }, ref) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const activePageRef = useRef(initialPage);
  const onPageChangeRef = useRef(onPageChange);
  const onInteractionRef = useRef(onInteraction);
  const [viewport, setViewport] = useState<ViewportSize>(getViewportSize);

  onPageChangeRef.current = onPageChange;
  onInteractionRef.current = onInteraction;

  useEffect(() => {
    let frame = 0;
    const resize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setViewport(getViewportSize()));
    };
    window.addEventListener('resize', resize);
    document.addEventListener('fullscreenchange', resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('fullscreenchange', resize);
    };
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const host = document.createElement('div');
    host.className = 'page-flip-root';
    stage.appendChild(host);

    const isSinglePage = viewport.width < 820 || viewport.width / viewport.height < 1.15;
    const pageWidth = Math.max(280, Math.floor(isSinglePage ? viewport.width : viewport.width / 2));
    const startPage = Math.min(activePageRef.current, Math.max(0, pages.length - 1));
    const elements = pages.map((page, index) => createPageElement(page, Math.abs(index - startPage) <= 1));
    const hasCover = pages[0]?.number === 0;

    const pageFlip = new PageFlip(host, {
      width: pageWidth,
      height: viewport.height,
      size: 'stretch',
      minWidth: 400,
      maxWidth: 2000,
      minHeight: 360,
      maxHeight: 2000,
      startPage,
      drawShadow: true,
      flippingTime: 850,
      usePortrait: true,
      startZIndex: 0,
      autoSize: false,
      maxShadowOpacity: 0.45,
      showCover: hasCover,
      mobileScrollSupport: true,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 20,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    const handleFlip = (event: PageFlipEvent<number>) => {
      activePageRef.current = event.data;
      onPageChangeRef.current(event.data);
    };
    pageFlip.on('flip', handleFlip);
    pageFlip.loadFromHTML(elements);
    pageFlipRef.current = pageFlip;

    return () => {
      activePageRef.current = pageFlip.getCurrentPageIndex();
      pageFlip.off('flip');
      pageFlip.destroy();
      if (pageFlipRef.current === pageFlip) pageFlipRef.current = null;
    };
  }, [pages, viewport]);

  useImperativeHandle(ref, () => ({
    next: () => pageFlipRef.current?.flipNext('top'),
    previous: () => pageFlipRef.current?.flipPrev('top'),
    goTo: (index) => {
      activePageRef.current = index;
      pageFlipRef.current?.turnToPage(index);
    },
    refresh: () => pageFlipRef.current?.update(),
  }), []);

  return <div className="book-stage" ref={stageRef} onPointerDown={() => onInteractionRef.current()} />;
});
PageFlipReader.displayName = 'PageFlipReader';
