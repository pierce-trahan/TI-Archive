/**
 * Polite, cached HTTP for the ingest pipeline.
 *
 * Every response is written to disk before use, so re-running a script costs
 * nothing and never re-hits a source. Delete the cache directory to force a
 * refresh.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

/**
 * Node's global fetch ignores HTTPS_PROXY, unlike curl. In a sandboxed
 * environment that routes egress through a proxy, that means every request
 * goes direct and is refused. Wiring the proxy in explicitly fixes it, and is
 * a no-op on a normal machine where the variable is unset.
 */
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

/**
 * Identifies this project to the sources we read. Liquipedia's terms require a
 * descriptive User-Agent; sending a default one gets a 403.
 */
export const USER_AGENT =
  'TI-Archive/0.1 (open-source Dota 2 history archive; +https://github.com/pierce-trahan/TI-Archive)';

export interface FetchOptions {
  /** Path the raw response body is cached at. */
  cachePath: string;
  /** Minimum gap between outbound requests, in ms. */
  minIntervalMs?: number;
  /** How many times to retry on 429 / 5xx / network error. */
  maxRetries?: number;
  /** Skip the cache and re-fetch. */
  force?: boolean;
}

let lastRequestAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function throttle(minIntervalMs: number): Promise<void> {
  const wait = lastRequestAt + minIntervalMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

async function readCache(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

async function writeCache(path: string, body: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, body, 'utf8');
}

export interface FetchResult<T> {
  data: T;
  /** True when the response came from disk rather than the network. */
  cached: boolean;
}

export async function fetchJsonCached<T>(
  url: string,
  options: FetchOptions,
): Promise<FetchResult<T>> {
  const { cachePath, minIntervalMs = 1200, maxRetries = 4, force = false } = options;

  if (!force) {
    const hit = await readCache(cachePath);
    if (hit !== null) {
      try {
        return { data: JSON.parse(hit) as T, cached: true };
      } catch {
        // Corrupt cache entry — fall through and re-fetch.
      }
    }
  }

  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await throttle(minIntervalMs);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      lastError = `network error: ${(error as Error).message}`;
      await sleep(2 ** attempt * 1000);
      continue;
    }

    if (response.status === 429) {
      // Honour Retry-After when the server sends one; back off otherwise.
      const retryAfter = Number(response.headers.get('retry-after'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 2000;
      lastError = `429 rate limited (waiting ${Math.round(delay / 1000)}s)`;
      process.stderr.write(`  rate limited, backing off ${Math.round(delay / 1000)}s\n`);
      await sleep(delay);
      continue;
    }

    if (response.status >= 500) {
      lastError = `${response.status} ${response.statusText}`;
      await sleep(2 ** attempt * 1000);
      continue;
    }

    if (!response.ok) {
      // 4xx other than 429 will not fix itself. A 403 here is usually the
      // network policy or the source rejecting our User-Agent — report it
      // rather than hammering.
      throw new Error(`${url} -> ${response.status} ${response.statusText}`);
    }

    const body = await response.text();
    await writeCache(cachePath, body);
    return { data: JSON.parse(body) as T, cached: false };
  }

  throw new Error(`${url} failed after ${maxRetries + 1} attempts: ${lastError}`);
}
