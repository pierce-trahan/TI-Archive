/**
 * Collect r/DotA2 reaction threads for an event.
 *
 *   npm run research:reddit -- ti08
 *
 * RUN THIS LOCALLY. Reddit blocks Anthropic's crawler by policy, so no Claude
 * tool can reach it regardless of network configuration. It needs your own
 * credentials and your own machine.
 *
 * Setup, once:
 *   1. https://www.reddit.com/prefs/apps -> "create another app"
 *   2. Choose type "script". Redirect URI can be http://localhost:8080
 *   3. Copy the client id (under the app name) and the secret
 *   4. Put them in .env — see .env.example
 *
 * Reddit allows 60 requests per minute for OAuth clients and asks for a
 * descriptive User-Agent. Both are honoured here. Comments and posts belong to
 * the people who wrote them: this stores a short excerpt and a permalink for
 * citation, and caches full text locally without redistributing it.
 */

import 'node:process';
import { cacheFullText, excerpt, writeResearch } from './lib/research.ts';
import type { ResearchItem } from './lib/research.ts';
import { loadEvent } from './lib/events.ts';

const UA = 'TI-Archive/0.1 (Dota 2 history archive; run locally by the repository owner)';
/** Reddit's documented ceiling is 60/min. Stay comfortably under it. */
const MIN_INTERVAL_MS = 1200;
/** How many top comments to keep per thread. */
const COMMENTS_PER_THREAD = 8;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;

async function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  return fn();
}

async function getToken(): Promise<string> {
  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD } = process.env;
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
    throw new Error(
      'Missing Reddit credentials. Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, ' +
        'REDDIT_USERNAME and REDDIT_PASSWORD in .env — see .env.example.',
    );
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    username: REDDIT_USERNAME,
    password: REDDIT_PASSWORD,
  });

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Reddit auth failed: ${response.status} ${response.statusText}. ` +
        'Check the app is type "script" and the credentials match.',
    );
  }
  const data = (await response.json()) as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`Reddit auth returned no token (${data.error ?? 'unknown'})`);
  return data.access_token;
}

async function api<T>(path: string, token: string): Promise<T> {
  return throttled(async () => {
    const response = await fetch(`https://oauth.reddit.com${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 429) {
      const retry = Number(response.headers.get('x-ratelimit-reset') ?? 30);
      console.log(`  rate limited, waiting ${retry}s`);
      await sleep(retry * 1000);
      return api<T>(path, token);
    }
    if (!response.ok) throw new Error(`${path} -> ${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  });
}

interface Listing<T> {
  data: { children: { data: T }[]; after: string | null };
}
interface Post {
  id: string;
  title: string;
  permalink: string;
  created_utc: number;
  score: number;
  num_comments: number;
  selftext: string;
  author: string;
  link_flair_text: string | null;
}
interface Comment {
  id: string;
  body: string;
  score: number;
  author: string;
  permalink: string;
  created_utc: number;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run research:reddit -- <event-key>');
    process.exit(1);
  }

  const event = await loadEvent(key);
  // Search a window around the event so run-up and aftermath are included.
  const first = event.phases[0]?.from ?? `${event.year}-01-01`;
  const last = event.phases.at(-1)?.to ?? `${event.year}-12-31`;
  const from = new Date(`${first}T00:00:00Z`).getTime() / 1000 - 60 * 86_400;
  const to = new Date(`${last}T23:59:59Z`).getTime() / 1000 + 45 * 86_400;

  const queries = process.argv[3]
    ? process.argv[3].split(',')
    : [event.name, `TI${event.ti}`, `The International ${event.year}`];

  console.log(`${event.name}`);
  console.log(`window: ${new Date(from * 1000).toISOString().slice(0, 10)} -> ${new Date(to * 1000).toISOString().slice(0, 10)}`);
  console.log(`queries: ${queries.join(' | ')}\n`);

  const token = await getToken();
  const seen = new Set<string>();
  const items: ResearchItem[] = [];

  for (const query of queries) {
    let after: string | null = null;
    let pages = 0;

    do {
      // Explicit types: `after` is reassigned from the response below, which
      // makes the inferred types circular.
      const path: string =
        `/r/DotA2/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=all&limit=100` +
        (after ? `&after=${after}` : '');
      const listing: Listing<Post> = await api<Listing<Post>>(path, token);
      pages++;

      for (const { data: post } of listing.data.children) {
        if (seen.has(post.id)) continue;
        // Reddit's search cannot filter by date, so the window is applied here.
        if (post.created_utc < from || post.created_utc > to) continue;
        seen.add(post.id);

        const url = `https://www.reddit.com${post.permalink}`;
        let fullText = `# ${post.title}\n\n${post.selftext}\n`;

        // Top comments carry the actual reaction; the post is often just a link.
        const thread = await api<[Listing<Post>, Listing<Comment>]>(
          `${post.permalink.replace(/\/$/, '')}.json?sort=top&limit=${COMMENTS_PER_THREAD}`,
          token,
        ).catch(() => null);

        const comments = (thread?.[1]?.data.children ?? [])
          .map((c) => c.data)
          .filter((c) => c.body && c.body !== '[deleted]' && c.body !== '[removed]')
          .slice(0, COMMENTS_PER_THREAD);

        for (const c of comments) {
          fullText += `\n---\nu/${c.author} (+${c.score})\n${c.body}\n`;
        }

        const cachedPath = await cacheFullText(key, 'reddit', post.id, fullText);

        items.push({
          source: 'reddit',
          title: post.title,
          url,
          published: new Date(post.created_utc * 1000).toISOString(),
          author: `u/${post.author}`,
          excerpt: excerpt(post.selftext || comments[0]?.body || post.title),
          signals: {
            score: post.score,
            comments: post.num_comments,
            flair: post.link_flair_text,
            top_comment_score: comments[0]?.score ?? null,
          },
          retrieved_at: new Date().toISOString(),
          cached_text_path: cachedPath,
        });

        process.stdout.write(`  +${String(post.score).padStart(6)}  ${post.title.slice(0, 68)}\n`);
      }

      after = listing.data.after;
      // Search relevance drops off fast; three pages per query is plenty.
    } while (after && pages < 3);
  }

  items.sort((a, b) => Number(b.signals?.score ?? 0) - Number(a.signals?.score ?? 0));
  const path = await writeResearch(key, 'reddit', items, {
    queries,
    window: { from: new Date(from * 1000).toISOString(), to: new Date(to * 1000).toISOString() },
    comments_per_thread: COMMENTS_PER_THREAD,
  });

  console.log(`\n${items.length} threads collected`);
  console.log(`metadata + excerpts: ${path}`);
  console.log(`full text (gitignored): data/raw/research/${key}/reddit/`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
