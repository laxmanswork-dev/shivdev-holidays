/**
 * Loads modules from src/ inside Node the way Vite does (extensionless
 * imports, import.meta.env, ...), so the build scripts can reuse the app's
 * own data and SEO code instead of duplicating it.
 *
 *   const { load, close } = await createSrcLoader();
 *   const { site } = await load('/src/data/site.js');
 *   await close();
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function createSrcLoader() {
  const server = await createServer({
    root: ROOT,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  return {
    load: (id) => server.ssrLoadModule(id),
    close: () => server.close(),
  };
}
