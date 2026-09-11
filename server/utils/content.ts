import path from 'node:path';

export const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export function slugToTitle(slug: string): string {
  const spaced = slug
    .replace(/([a-zà-ÿ])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const connectors = new Set(['a', 'as', 'o', 'os', 'e', 'da', 'das', 'de', 'do', 'dos', 'em', 'na', 'nas', 'no', 'nos', 'para', 'por']);
  return spaced.split(' ').map((word, index) => {
    if (word.length > 1 && word === word.toLocaleUpperCase('pt-BR')) return word;
    const lower = word.toLocaleLowerCase('pt-BR');
    if (index > 0 && connectors.has(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  }).join(' ');
}

export function getNumericPrefix(fileName: string): number | null {
  const ext = path.extname(fileName).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return null;
  const match = path.basename(fileName, ext).match(/^(\d+)(?:$|[_-])/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function sortPageFiles(files: string[]): string[] {
  return files
    .filter((file) => getNumericPrefix(file) !== null)
    .sort((a, b) => (getNumericPrefix(a) ?? 0) - (getNumericPrefix(b) ?? 0) || a.localeCompare(b));
}

export function findMatchingAudioName(pageNumber: number, fileNames: string[]): string | null {
  const validNames = new Map(fileNames.filter((name) => path.extname(name).toLowerCase() === '.mp3').map((name) => [name.toLowerCase(), name]));
  const candidates = [`${pageNumber}.mp3`, `${String(pageNumber).padStart(2, '0')}.mp3`];
  const match = candidates.find((name) => validNames.has(name.toLowerCase()));
  return match ? validNames.get(match.toLowerCase()) ?? null : null;
}

export function isSafeSlug(slug: string): boolean {
  return /^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u.test(slug) && slug !== '.' && slug !== '..';
}

export function isInside(parent: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
