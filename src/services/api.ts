import type { ContentItem, ContentKind, PhysicalPriceResult, PublicPricing } from '@/types';

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Não foi possível carregar esta aventura.' })) as { message?: string };
    throw new Error(data.message ?? 'Não foi possível carregar esta aventura.');
  }
  return response.json() as Promise<T>;
}

export const api = {
  list: (kind: ContentKind) => request<ContentItem[]>(`/api/${kind === 'book' ? 'books' : 'comics'}`),
  get: (kind: ContentKind, slug: string) => request<ContentItem>(`/api/content/${kind}/${encodeURIComponent(slug)}`),
  pricing: () => request<PublicPricing>('/api/pricing'),
  physicalPrice: (pages: number) => request<PhysicalPriceResult>(`/api/pricing/physical?pages=${encodeURIComponent(pages)}`),
};
