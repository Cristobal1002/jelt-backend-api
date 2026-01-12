import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cache = new Map();

/**
 * Carga un template HTML desde disco (con cache).
 */
export async function loadHtmlTemplate(relativePath) {
  const absPath = path.resolve(__dirname, '..', relativePath);

  if (cache.has(absPath)) return cache.get(absPath);

  const html = await fs.readFile(absPath, 'utf8');
  cache.set(absPath, html);
  return html;
}

/**
 * Renderiza un template reemplazando {{key}} por values[key]
 */
export function renderTemplate(template, values = {}) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    const v = values[key];
    return v === undefined || v === null ? '' : String(v);
  });
}
