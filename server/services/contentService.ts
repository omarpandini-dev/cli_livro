import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContentItem, ContentKind, ContentMetadata, ContentPage } from '../types.js';
import { findMatchingAudioName, getNumericPrefix, IMAGE_EXTENSIONS, isInside, isSafeSlug, slugToTitle, sortPageFiles } from '../utils/content.js';

const projectRoot = process.cwd();
export const assetsRoot = path.join(projectRoot, 'assets');
const roots: Record<ContentKind, string> = {
  book: path.join(assetsRoot, 'books'),
  comic: path.join(assetsRoot, 'comics'),
};

function publicAssetPath(absolutePath: string): string {
  return `/${path.relative(projectRoot, absolutePath).split(path.sep).map(encodeURIComponent).join('/')}`;
}

async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

async function readMetadata(contentDir: string): Promise<ContentMetadata> {
  const metadataPath = path.join(contentDir, 'metadata.json');
  if (await exists(metadataPath)) try {
    const parsed: unknown = JSON.parse(await readFile(metadataPath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const source = parsed as Record<string, unknown>;
    return {
      title: typeof source.title === 'string' ? source.title : undefined,
      description: typeof source.description === 'string' ? source.description : undefined,
      age: typeof source.age === 'string' ? source.age : undefined,
      featured: typeof source.featured === 'boolean' ? source.featured : undefined,
    };
  } catch { /* tenta os arquivos legados abaixo */ }

  for (const [fileName, titleKey, descriptionKey] of [
    ['textos_json.json', 'title', 'description'],
    ['ideia_historia_json.json', 'titulo_da_historia', 'resumo_historia'],
  ] as const) {
    const filePath = path.join(contentDir, fileName);
    if (!await exists(filePath)) continue;
    try {
      const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue;
      const source = parsed as Record<string, unknown>;
      const title = source[titleKey];
      const description = source[descriptionKey];
      if (typeof title === 'string') return { title, description: typeof description === 'string' ? description : undefined };
    } catch { /* arquivo auxiliar inválido não impede o acervo */ }
  }
  return {};
}

async function findMediaDirectory(contentDir: string): Promise<string> {
  const candidates = [contentDir, path.join(contentDir, 'output', 'img'), path.join(contentDir, 'img'), path.join(contentDir, 'images')];
  for (const candidate of candidates) {
    if (!isInside(contentDir, candidate) || !await exists(candidate)) continue;
    const entries = await readdir(candidate, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && getNumericPrefix(entry.name) !== null)) return candidate;
  }
  return contentDir;
}

export async function scanContent(kind: ContentKind, slug: string): Promise<ContentItem | null> {
  if (!isSafeSlug(slug)) return null;
  const root = roots[kind];
  const contentDir = path.join(root, slug);
  if (!isInside(root, contentDir) || !await exists(contentDir)) return null;
  const mediaDir = await findMediaDirectory(contentDir);
  const entries = await readdir(mediaDir, { withFileTypes: true });
  const imageFiles = sortPageFiles(entries.filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())).map((entry) => entry.name));
  const coverFile = imageFiles.find((name) => getNumericPrefix(name) === 0) ?? null;
  const fileNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const metadata = await readMetadata(contentDir);
  const pages: ContentPage[] = await Promise.all(imageFiles.map(async (imageName) => {
    const number = getNumericPrefix(imageName) ?? 0;
    const audioName = findMatchingAudioName(number, fileNames);
    const audioPath = audioName ? path.join(mediaDir, audioName) : null;
    return { number, image: publicAssetPath(path.join(mediaDir, imageName)), audio: audioPath ? publicAssetPath(audioPath) : null };
  }));
  return {
    id: slug,
    slug,
    title: metadata.title ?? slugToTitle(slug),
    description: metadata.description ?? (kind === 'book' ? 'Uma história mágica esperando para ser descoberta.' : 'Uma aventura ilustrada cheia de surpresas.'),
    age: metadata.age ?? null,
    featured: metadata.featured ?? false,
    type: kind,
    cover: coverFile ? publicAssetPath(path.join(mediaDir, coverFile)) : null,
    pageCount: pages.length,
    pages,
  };
}

export async function listContent(kind: ContentKind): Promise<ContentItem[]> {
  const root = roots[kind];
  if (!await exists(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const items = await Promise.all(entries.filter((entry) => entry.isDirectory() && isSafeSlug(entry.name)).map((entry) => scanContent(kind, entry.name)));
  return items.filter((item): item is ContentItem => item !== null).map((item) => ({
    id: item.id, slug: item.slug, title: item.title, description: item.description,
    age: item.age, featured: item.featured, type: item.type, cover: item.cover, pageCount: item.pageCount,
  })).sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, 'pt-BR'));
}

export function normalizeKind(value: string): ContentKind | null {
  if (value === 'book' || value === 'books') return 'book';
  if (value === 'comic' || value === 'comics') return 'comic';
  return null;
}
