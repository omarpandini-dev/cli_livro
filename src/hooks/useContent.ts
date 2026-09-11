import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { ContentItem, ContentKind } from '@/types';

export function useContentList(kind: ContentKind) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.list(kind)
      .then((data) => { if (active) { setItems(data); setError(null); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Erro ao abrir o acervo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind]);

  return { items, loading, error };
}
