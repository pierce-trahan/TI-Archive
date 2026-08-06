/**
 * Minimal robots.txt checker.
 *
 * The research scripts read sites that never invited us. Checking robots.txt
 * before fetching is the baseline courtesy, and it is cheap: one request per
 * host, cached for the run.
 *
 * This is not a substitute for reading a site's terms. It catches the explicit
 * "please don't" and nothing more.
 */

import { USER_AGENT } from './http.ts';

interface Rules {
  disallow: string[];
  allow: string[];
  crawlDelaySeconds: number | null;
}

const cache = new Map<string, Rules | null>();

function parse(text: string, agent: string): Rules {
  const rules: Rules = { disallow: [], allow: [], crawlDelaySeconds: null };
  let applies = false;
  let sawExact = false;

  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [field, ...rest] = line.split(':');
    const key = field?.trim().toLowerCase();
    const value = rest.join(':').trim();

    if (key === 'user-agent') {
      const target = value.toLowerCase();
      const exact = agent.toLowerCase().includes(target) && target !== '*';
      // A block naming us specifically overrides the wildcard block.
      if (exact) {
        sawExact = true;
        applies = true;
        rules.disallow = [];
        rules.allow = [];
      } else if (target === '*' && !sawExact) {
        applies = true;
      } else {
        applies = false;
      }
      continue;
    }
    if (!applies) continue;

    if (key === 'disallow' && value) rules.disallow.push(value);
    if (key === 'allow' && value) rules.allow.push(value);
    if (key === 'crawl-delay') {
      const seconds = Number(value);
      if (Number.isFinite(seconds)) rules.crawlDelaySeconds = seconds;
    }
  }
  return rules;
}

async function load(origin: string): Promise<Rules | null> {
  if (cache.has(origin)) return cache.get(origin) ?? null;

  let rules: Rules | null = null;
  try {
    const response = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });
    // No robots.txt, or an error page, means no stated restrictions.
    rules = response.ok ? parse(await response.text(), USER_AGENT) : null;
  } catch {
    rules = null;
  }

  cache.set(origin, rules);
  return rules;
}

export interface RobotsVerdict {
  allowed: boolean;
  /** Longest matching rule, for reporting. */
  rule: string | null;
  crawlDelaySeconds: number | null;
}

/** Longest-match wins, and an explicit Allow beats an equally specific Disallow. */
export async function checkRobots(url: string): Promise<RobotsVerdict> {
  const parsed = new URL(url);
  const rules = await load(parsed.origin);
  if (!rules) return { allowed: true, rule: null, crawlDelaySeconds: null };

  const path = parsed.pathname + parsed.search;
  const longest = (patterns: string[]): string | null =>
    patterns
      .filter((p) => path.startsWith(p.replace(/\*$/, '')))
      .sort((a, b) => b.length - a.length)[0] ?? null;

  const blocked = longest(rules.disallow);
  const permitted = longest(rules.allow);

  if (blocked && (!permitted || permitted.length < blocked.length)) {
    return { allowed: false, rule: `Disallow: ${blocked}`, crawlDelaySeconds: rules.crawlDelaySeconds };
  }
  return {
    allowed: true,
    rule: permitted ? `Allow: ${permitted}` : null,
    crawlDelaySeconds: rules.crawlDelaySeconds,
  };
}
