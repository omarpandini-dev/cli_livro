import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { ContentItem, ProgressMap } from '@/types';
import { contentKey } from '@/utils/storage';
import { ContentCard } from './ContentCard';
import { EmptyState } from './EmptyState';

interface Props { title: string; eyebrow?: string; items: ContentItem[]; progress?: ProgressMap; emptyMessage: string; }

export function ContentCarousel({ title, eyebrow, items, progress, emptyMessage }: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * Math.min(900, window.innerWidth * .75), behavior: 'smooth' });
  if (!items.length) return <section className="catalog-section"><SectionHeading title={title} eyebrow={eyebrow} /><EmptyState message={emptyMessage} /></section>;
  return (
    <section className="catalog-section">
      <div className="section-heading-row"><SectionHeading title={title} eyebrow={eyebrow} /><div className="rail-buttons"><button onClick={() => scroll(-1)} aria-label={`Voltar em ${title}`}><ChevronLeft /></button><button onClick={() => scroll(1)} aria-label={`Avançar em ${title}`}><ChevronRight /></button></div></div>
      <div className="content-rail" ref={rail}>{items.map((item) => <ContentCard key={`${item.type}:${item.slug}`} item={item} progress={progress?.[contentKey(item)]} />)}</div>
    </section>
  );
}

function SectionHeading({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return <div className="section-heading">{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>;
}
