import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentRouter } from './routes/contentRoutes.js';
import { pricingRouter } from './routes/pricingRoutes.js';
import { assetsRoot } from './services/contentService.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, '..', '..');
const clientDist = path.join(projectRoot, 'dist');

app.disable('x-powered-by');
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api', contentRouter);
app.use('/api', pricingRouter);
app.use('/assets', express.static(assetsRoot, { fallthrough: false, maxAge: '1h' }));
app.use(express.static(clientDist));
app.get(/^(?!\/api|\/assets).*/, (_request, response) => response.sendFile(path.join(clientDist, 'index.html')));
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Algo inesperado aconteceu. Tente novamente.' });
});

app.listen(port, () => console.log(`Mundo Encantado disponível em http://localhost:${port}`));
