/** Best-effort parse of JSON returned by an LLM (fences, trailing commas, truncated salvage).
 * Handles Anthropic assistant prefill (response already starts with `{` or `[`). */
export function parseLLMJson<T>(text: string): T {
  const trimmed = text.trim();
  const candidates = buildCandidates(trimmed);

  const seen = new Set<string>();
  for (const attempt of candidates) {
    if (!attempt || seen.has(attempt)) continue;
    seen.add(attempt);
    try {
      return JSON.parse(attempt) as T;
    } catch {
      /* try next strategy */
    }
  }

  const salvaged = salvageBeatsPlan(trimmed);
  if (salvaged) {
    return salvaged as T;
  }

  throw new SyntaxError(`Could not parse LLM JSON (preview: ${trimmed.slice(0, 240).replace(/\s+/g, ' ')})`);
}

function buildCandidates(text: string): string[] {
  const stripped = stripCodeFences(text);
  const block = extractJsonBlock(stripped) ?? extractJsonBlock(text);
  const out = [text, stripped];
  if (block) {
    out.push(block, fixTrailingCommas(block), closeTruncatedJson(block));
  }
  out.push(fixTrailingCommas(stripped), closeTruncatedJson(stripped));
  return out;
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function fixTrailingCommas(text: string): string {
  return text.replace(/,\s*([}\]])/g, '$1');
}

/** Close truncated object/array by dropping an open string and balancing brackets. */
function closeTruncatedJson(text: string): string {
  let s = text.trim();
  if (!s) return s;

  // Drop trailing incomplete key/value or string literal
  s = s.replace(/,\s*"[^"]*"?\s*:?\s*"[^"]*$/s, '');
  s = s.replace(/,\s*\{[^}]*$/s, '');
  s = s.replace(/,\s*$/s, '');

  if (/[^\\]"[^"]*$/.test(s)) {
    s = `${s}"`;
  }

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const ch of s) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{' || ch === '[') stack.push(ch);
    if (ch === '}' && stack[stack.length - 1] === '{') stack.pop();
    if (ch === ']' && stack[stack.length - 1] === '[') stack.pop();
  }

  while (stack.length > 0) {
    const open = stack.pop();
    s += open === '{' ? '}' : ']';
  }

  return fixTrailingCommas(s);
}

function extractJsonBlock(text: string): string | null {
  const objStart = text.indexOf('{');
  const arrStart = text.indexOf('[');

  let start = -1;
  let open: string;
  let close: string;

  if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) {
    start = objStart;
    open = '{';
    close = '}';
  } else if (arrStart >= 0) {
    start = arrStart;
    open = '[';
    close = ']';
  } else {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === open) depth += 1;
    if (ch === close) depth -= 1;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}

/** Extract complete beat objects from truncated planner output. */
export function salvageBeatsPlan(text: string): { beats: Array<Record<string, unknown>> } | null {
  const stripped = stripCodeFences(text);
  const beats: Array<Record<string, unknown>> = [];

  const re =
    /\{\s*"template"\s*:\s*"([a-z0-9-]+)"\s*,\s*"intent"\s*:\s*"((?:\\.|[^"\\])*)"\s*(?:,\s*"mode"\s*:\s*"(reuse|create)"\s*)?(?:,\s*"customName"\s*:\s*"((?:\\.|[^"\\])*)"\s*)?\}/gi;

  let match: RegExpExecArray | null;
  while ((match = re.exec(stripped)) !== null) {
    const beat: Record<string, unknown> = {
      template: match[1],
      intent: match[2].replace(/\\"/g, '"'),
      mode: match[3] ?? 'reuse',
    };
    if (match[4]) beat.customName = match[4].replace(/\\"/g, '"');
    beats.push(beat);
  }

  return beats.length > 0 ? { beats } : null;
}
