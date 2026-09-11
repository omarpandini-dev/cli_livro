import { Router } from 'express';
import { getPhysicalPriceByPages, getPublicPricing } from '../services/pricingService.js';

export const pricingRouter = Router();

pricingRouter.get('/pricing', (_request, response, next) => {
  try {
    response.json(getPublicPricing());
  } catch (error) {
    next(error);
  }
});

pricingRouter.get('/pricing/physical', (request, response, next) => {
  try {
    const rawPages = request.query.pages;
    if (typeof rawPages !== 'string' || !/^\d+$/.test(rawPages) || Number(rawPages) < 1) {
      response.status(400).json({ message: 'Informe uma quantidade de páginas válida.' });
      return;
    }
    response.json(getPhysicalPriceByPages(Number(rawPages)));
  } catch (error) {
    next(error);
  }
});

