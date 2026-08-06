/**
 * Minimal MediaWiki template parser.
 *
 * Liquipedia tournament pages are built from nested templates, so a regex is
 * not enough — parameters contain further templates, and `|` inside a nested
 * template is not a parameter separator at the outer level. This does brace
 * matching and splits only at depth zero.
 *
 * It deliberately does not evaluate anything. `{{#expr:...}}` and `{{#var:...}}`
 * come through as literal text, because guessing at their value is exactly the
 * kind of invention this project forbids.
 */

export interface Template {
  name: string;
  /** Unnamed parameters, in order. */
  positional: string[];
  /** Named parameters. */
  named: Map<string, string>;
  /** The full source, braces included. */
  raw: string;
}

/** Splits on `sep` at brace/bracket depth zero only. */
function splitTopLevel(body: string, sep = '|'): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === '{{' || two === '[[') {
      depth++;
      current += two;
      i++;
      continue;
    }
    if (two === '}}' || two === ']]') {
      depth--;
      current += two;
      i++;
      continue;
    }
    const char = body[i]!;
    if (char === sep && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/** Returns the index just past the `}}` that closes the `{{` at `start`. */
function matchBraces(text: string, start: number): number {
  let depth = 0;
  for (let i = start; i < text.length - 1; i++) {
    const two = text.slice(i, i + 2);
    if (two === '{{') {
      depth++;
      i++;
    } else if (two === '}}') {
      depth--;
      i++;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

export function parseTemplate(raw: string): Template {
  const inner = raw.slice(2, -2);
  const parts = splitTopLevel(inner);
  const name = (parts.shift() ?? '').trim();

  const positional: string[] = [];
  const named = new Map<string, string>();

  for (const part of parts) {
    // A named parameter's `=` must also be at depth zero: `players={{Persons|...}}`
    // is named, but `{{Person|role=1|X}}` inside it is not this template's business.
    const eq = splitTopLevel(part, '=');
    if (eq.length >= 2) {
      const key = eq[0]!.trim();
      // Keys are simple identifiers; anything else is a positional value that
      // happens to contain an equals sign.
      if (/^[A-Za-z0-9_ -]+$/.test(key)) {
        named.set(key, eq.slice(1).join('=').trim());
        continue;
      }
    }
    const value = part.trim();
    if (value) positional.push(value);
  }

  return { name, positional, named, raw };
}

/**
 * Finds every top-level occurrence of a template by name.
 * Matching is case-insensitive on the first character, as MediaWiki is.
 */
export function findTemplates(text: string, templateName: string): Template[] {
  const found: Template[] = [];
  const needle = templateName.toLowerCase();

  for (let i = 0; i < text.length - 1; i++) {
    if (text.slice(i, i + 2) !== '{{') continue;

    const end = matchBraces(text, i);
    if (end === -1) continue;

    const raw = text.slice(i, end);
    const name = raw.slice(2).split(/[|}]/, 1)[0]?.trim().toLowerCase() ?? '';

    if (name === needle) {
      found.push(parseTemplate(raw));
      i = end - 1;
    }
  }
  return found;
}

/** Strips wiki markup from a display string: `[[Foo|Bar]]` -> `Bar`. */
export function plainText(value: string): string {
  return value
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
