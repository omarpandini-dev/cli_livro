import { useEffect, useMemo, useState } from 'react';
import { ContentCarousel } from '@/components/ContentCarousel';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CatalogSkeleton } from '@/components/Loading';
import { PricingSection } from '@/components/PricingSection';
import { useContentList } from '@/hooks/useContent';
import type { ProgressMap } from '@/types';
import { contentKey, readProgress } from '@/utils/storage';

export function Home() {
  const books = useContentList('book');
  const comics = useContentList('comic');
  const [progress, setProgress] = useState<ProgressMap>(() => readProgress());
  useEffect(() => {
    const update = () => setProgress(readProgress());
    window.addEventListener('storage', update); window.addEventListener('mundo-progress', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('mundo-progress', update); };
  }, []);
  const all = useMemo(() => [...books.items, ...comics.items], [books.items, comics.items]);
  const continuing = all.filter((item) => { const value = progress[contentKey(item)]; return value > 0 && value < item.pageCount - 1; });
  return <div className="site-shell"><Header /><main><Hero /><div id="acervo" className="catalog-wrap">
    {continuing.length > 0 && <ContentCarousel title="Continue sua aventura" items={continuing} progress={progress} emptyMessage="" />}
    {books.loading ? <CatalogLoading title="Amostras de Livros Mágicos" /> : <ContentCarousel title="Amostras de Livros Mágicos" eyebrow="Conheça nosso trabalho" items={books.items} progress={progress} emptyMessage="Nenhuma amostra de livro chegou por aqui ainda. ✨" />}
    {comics.loading ? <CatalogLoading title="Amostras de Histórias em Quadrinhos" /> : <ContentCarousel title="Amostras de Histórias em Quadrinhos" eyebrow="Conheça nosso trabalho" items={comics.items} progress={progress} emptyMessage="Novas amostras em quadrinhos estão chegando! ✨" />}
    {(books.error || comics.error) && <p className="error-banner">Uma parte do acervo não pôde ser carregada. Atualize a página para tentar novamente.</p>}
    <PricingSection />
  </div></main><Footer /></div>;
}

function CatalogLoading({ title }: { title: string }) { return <section className="catalog-section"><div className="section-heading"><span>Organizando a estante</span><h2>{title}</h2></div><CatalogSkeleton /></section>; }
