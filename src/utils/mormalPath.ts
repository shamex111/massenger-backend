export function normalizePath(path: string): string {
  let normalizedPath = path.replace(/\\/g, '/');

  normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');
  normalizedPath = '/' + normalizedPath
  return normalizedPath;
}
