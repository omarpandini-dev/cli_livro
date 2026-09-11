import { describe, expect, it } from 'vitest';
import { getPhysicalPriceByPages, getProductById, getPublicPricing } from './pricingService.js';

describe('configuração comercial', () => {
  it('retorna somente produtos ativos na ordem configurada', () => {
    expect(getPublicPricing().products.map((product) => product.id)).toEqual([
      'BOOK_DIGITAL',
      'BOOK_DIGITAL_AUDIO',
      'BOOK_PRINTED',
    ]);
  });

  it('localiza um produto ativo pelo ID estável', () => {
    expect(getProductById('BOOK_DIGITAL_AUDIO')?.featured).toBe(true);
    expect(getProductById('UNKNOWN')).toBeUndefined();
  });

  it('expõe a experiência digital por propriedades estáveis, sem depender dos labels', () => {
    const pricing = getPublicPricing();
    const digital = pricing.products.find((product) => product.id === 'BOOK_DIGITAL');
    const narrated = pricing.products.find((product) => product.id === 'BOOK_DIGITAL_AUDIO');
    const printed = pricing.products.find((product) => product.id === 'BOOK_PRINTED');

    expect(digital?.delivery).toMatchObject({ interactiveBook: true, pageTurning: true, audioNarration: false });
    expect(narrated?.delivery.audioNarration).toBe(true);
    expect(printed?.delivery).toMatchObject({ readerAccess: false, physicalBook: true });
    expect(pricing.section.comparison.items.map((item) => item.id)).not.toContain('PDF');
  });

  it('usa o preço de referência conhecido para 16 páginas', () => {
    expect(getPhysicalPriceByPages(16)).toMatchObject({ available: true, price: 125.02 });
  });

  it('não inventa preço para uma faixa ainda não configurada', () => {
    expect(getPhysicalPriceByPages(24)).toEqual({
      available: false,
      price: null,
      message: 'Preço do livro físico disponível sob consulta.',
    });
  });
});
