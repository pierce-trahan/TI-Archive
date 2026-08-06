/**
 * Shared shape and storage rules for research sources.
 *
 * A deliberate split, for copyright reasons:
 *
 *   data/raw/research/   full text, GITIGNORED. Local reading material for
 *                        drafting a narrative. Never redistributed.
 *   data/research/       committed. Metadata plus a SHORT excerpt — enough to
 *                        find the piece again and to quote it with attribution,
 *                        not a republication of someone else's article.
 *
 * News articles and Reddit comments are the copyrighted work of their authors.
 * This project cites and quotes them; it does not host them.
 */

import { mkdir, writeFile } from 'node:fs/promises';

/** Excerpts are for citation, not for reading the piece without visiting it. */
export const MAX_EXCERPT_CHARS = 400;

export interface ResearchItem {
  /** Outlet or platform: "gosugamers", "joindota", "reddit". */
  source: string;
  title: string;
  url: string;
  /** ISO date the piece was published, when the source states one. */
  published: string | null;
  author: string | null;
  /** Short quotation for citation. Never the full body. */
  excerpt: string | null;
  /** Platform-specific signal: upvotes, comment counts, and so on. */
  signals?: Record<string, number | string | null>;
  retrieved_at: string;
  /** Where the full text was cached locally, when it was. */
  cached_text_path?: string;
}

export function excerpt(text: string): string | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= MAX_EXCERPT_CHARS) return clean;
  // Cut at a sentence boundary where one is close to the limit.
  const window = clean.slice(0, MAX_EXCERPT_CHARS);
  const lastStop = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
  return `${(lastStop > MAX_EXCERPT_CHARS * 0.6 ? window.slice(0, lastStop + 1) : window).trim()}…`;
}

export async function writeResearch(
  event: string,
  source: string,
  items: ResearchItem[],
  meta: Record<string, unknown> = {},
): Promise<string> {
  const dir = new URL('../../data/research/', import.meta.url).pathname;
  await mkdir(dir, { recursive: true });
  const path = `${dir}${event}.${source}.json`;

  await writeFile(
    path,
    `${JSON.stringify(
      {
        _note:
          'Research sources for narrative writing. Metadata and short excerpts only — ' +
          'full text is cached locally under data/raw/research/ and is not redistributed. ' +
          'Every claim drawn from these must cite the url alongside it.',
        _generated_at: new Date().toISOString(),
        event,
        source,
        item_count: items.length,
        ...meta,
        items,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  return path;
}

/** Caches full text locally for drafting. Gitignored; never committed. */
export async function cacheFullText(
  event: string,
  source: string,
  id: string,
  text: string,
): Promise<string> {
  const dir = new URL(`../../data/raw/research/${event}/${source}/`, import.meta.url).pathname;
  await mkdir(dir, { recursive: true });
  const path = `${dir}${id.replace(/[^A-Za-z0-9_-]/g, '_')}.txt`;
  await writeFile(path, text, 'utf8');
  return path;
}
