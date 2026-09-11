import { BookOpen, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContentItem } from '@/types';
import { contentKey } from '@/utils/storage';
import { ImageWithFallback } from './ImageWithFallback';

interface Props { item: ContentItem; progress?: number; }

export function ContentCard({ item, progress }: Props) {
  const hasProgress = typeof progress === 'number' && progress > 0 && progress < item.pageCount - 1;
  return (
    <article className="content-card">
      <Link to={`/read/${item.type}/${encodeURIComponent(item.slug)}`} state={hasProgress ? { resumeAt: progress } : undefined} aria-label={`${hasProgress ? 'Continuar' : 'Ler'} ${item.title}`}>
        <div className="cover-wrap">
          <ImageWithFallback src={item.cover} alt={`Capa de ${item.title}`} />
          <span className="card-type"><BookOpen />{item.type === 'book' ? 'Amostra · Livro' : 'Amostra · HQ'}</span>
          <span className="read-now">{hasProgress ? <RotateCcw /> : <Play fill="currentColor" />}{hasProgress ? `Continuar na página ${progress + 1}` : 'Ler agora'}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.pageCount} {item.pageCount === 1 ? 'página' : 'páginas'}{item.age ? ` · ${item.age} anos` : ''}</p>
        {hasProgress && <span className="mini-progress"><i style={{ width: `${((progress + 1) / item.pageCount) * 100}%` }} /></span>}
      </Link>
      <span className="sr-only">Chave de progresso: {contentKey(item)}</span>
    </article>
  );
}
