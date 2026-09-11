import { ContentCarousel } from '@/components/ContentCarousel';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CatalogSkeleton } from '@/components/Loading';
import { useContentList } from '@/hooks/useContent';
import type { ContentKind } from '@/types';
import { readProgress } from '@/utils/storage';

export function Catalog({ kind }: { kind: ContentKind }) {
  const { items, loading, error } = useContentList(kind);
  const isBook = kind === 'book';
  return <div className="site-shell"><Header /><main className="catalog-page"><div className="catalog-intro"><span>Amostras do nosso trabalho</span><h1>{isBook ? 'Livros Mágicos' : 'Histórias em Quadrinhos'}</h1><p>{isBook ? 'Explore estas amostras e imagine uma história criada especialmente para alguém importante para você.' : 'Conheça nossas amostras ilustradas e imagine uma aventura personalizada quadro a quadro.'}</p></div>
    {loading ? <CatalogSkeleton /> : error ? <div className="error-banner">{error}</div> : <ContentCarousel title={isBook ? 'Amostras de livros' : 'Amostras de quadrinhos'} items={items} progress={readProgress()} emptyMessage={isBook ? 'Nenhuma amostra de livro chegou por aqui ainda. ✨' : 'Novas amostras em quadrinhos estão chegando! ✨'} />}
  </main><Footer /></div>;
}
