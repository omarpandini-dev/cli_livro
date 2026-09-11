import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { findMatchingAudioName, getNumericPrefix, isInside, isSafeSlug, slugToTitle, sortPageFiles } from './content.js';

describe('utilitários de conteúdo', () => {
  it('ordena páginas numericamente', () => {
    expect(sortPageFiles(['1.png', '11.png', '2.png', '10.png', '3.png'])).toEqual(['1.png', '2.png', '3.png', '10.png', '11.png']);
  });
  it('aceita prefixos numéricos e ignora arquivos estranhos', () => {
    expect(getNumericPrefix('05_pagina_01.png')).toBe(5);
    expect(getNumericPrefix('teste.png')).toBeNull();
  });
  it('transforma slug em título', () => {
    expect(slugToTitle('a-cidade_debaixo-do-lago')).toBe('A Cidade Debaixo do Lago');
    expect(slugToTitle('misterio_do_farol')).toBe('Misterio do Farol');
    expect(slugToTitle('aventura_HQ')).toBe('Aventura HQ');
  });
  it('encontra a narração com o mesmo número da página', () => {
    expect(findMatchingAudioName(1, ['0.png', '1.png', '1.mp3', '2.png'])).toBe('1.mp3');
    expect(findMatchingAudioName(2, ['02.mp3', '2.png'])).toBe('02.mp3');
    expect(findMatchingAudioName(3, ['3.png', '4.mp3'])).toBeNull();
  });
  it('bloqueia path traversal', () => {
    expect(isSafeSlug('../../../segredo')).toBe(false);
    expect(isInside('C:/conteudo/books', path.join('C:/conteudo/books', '..', 'segredo'))).toBe(false);
    expect(isSafeSlug('meu-livro_2')).toBe(true);
  });
});
