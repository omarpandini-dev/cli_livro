import { describe, expect, it } from 'vitest';
import { listContent, scanContent } from './contentService.js';

describe('descoberta do acervo', () => {
  it('monta páginas ordenadas a partir de um quadrinho disponível', async () => {
    const comic = (await listContent('comic'))[0];
    if (!comic) return;

    const content = await scanContent('comic', comic.slug);
    expect(content?.cover).toMatch(/\/0\.(png|jpe?g|webp)$/i);
    expect(content?.pages?.length).toBeGreaterThan(0);
    expect(content?.pages?.[0]).toMatchObject({ number: 0, image: content.cover });
    expect(content?.pages?.map((page) => page.number)).toEqual([...content!.pages!].map((page) => page.number).sort((a, b) => a - b));
    expect(content?.pages?.every((page) => page.audio === null || page.audio.endsWith('.mp3'))).toBe(true);
  });

  it('gera títulos para conteúdos encontrados sem exigir metadata.json', async () => {
    const book = (await listContent('book'))[0];
    if (!book) return;
    expect(book.title.trim().length).toBeGreaterThan(0);
  });

  it('recusa slug malicioso', async () => {
    expect(await scanContent('book', '../../../')).toBeNull();
  });
});
