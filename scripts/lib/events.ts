import { readFile } from 'node:fs/promises';

export interface EventPhase {
  id: string;
  label: string;
  /** Inclusive local dates, YYYY-MM-DD at the venue. */
  from: string;
  to: string;
  verified: boolean;
  note?: string;
}

export interface EventConfig {
  ti: number;
  year: number;
  name: string;
  leagueid: number;
  venue: string;
  venue_timezone: string;
  source_url: string;
  phases: EventPhase[];
}

export async function loadEvent(key: string): Promise<EventConfig> {
  const raw = await readFile(new URL('../../data/sources/events.json', import.meta.url), 'utf8');
  const parsed = JSON.parse(raw) as { events: Record<string, EventConfig> };
  const event = parsed.events[key];
  if (!event) {
    const known = Object.keys(parsed.events).join(', ');
    throw new Error(`Unknown event "${key}". Configured events: ${known || '(none)'}`);
  }
  return event;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Local calendar date at the venue, as YYYY-MM-DD.
 *
 * Bucketing by UTC splits the last day of every TI in two: the TI8 grand final
 * ran into 2018-08-26 UTC while still being the evening of the 25th in
 * Vancouver.
 */
export function localDate(unixSeconds: number, timeZone: string): string {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter.format(new Date(unixSeconds * 1000));
}

/** Returns the phase id for a match, or null when it falls outside every window. */
export function phaseFor(event: EventConfig, unixSeconds: number): string | null {
  const date = localDate(unixSeconds, event.venue_timezone);
  for (const phase of event.phases) {
    if (date >= phase.from && date <= phase.to) return phase.id;
  }
  return null;
}
