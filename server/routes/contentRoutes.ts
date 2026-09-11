import { Router } from 'express';
import { listContent, normalizeKind, scanContent } from '../services/contentService.js';

export const contentRouter = Router();

contentRouter.get('/books', async (_request, response, next) => {
  try { response.json(await listContent('book')); } catch (error) { next(error); }
});

contentRouter.get('/comics', async (_request, response, next) => {
  try { response.json(await listContent('comic')); } catch (error) { next(error); }
});

contentRouter.get('/content/:type/:slug', async (request, response, next) => {
  try {
    const kind = normalizeKind(request.params.type);
    if (!kind) { response.status(400).json({ message: 'Tipo de conteúdo inválido.' }); return; }
    const content = await scanContent(kind, request.params.slug);
    if (!content) { response.status(404).json({ message: 'Aventura não encontrada.' }); return; }
    response.json(content);
  } catch (error) { next(error); }
});
