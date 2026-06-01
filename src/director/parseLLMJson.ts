/** Best-effort parse of JSON returned by an LLM (fences, trailing commas, truncated salvage).
 * Handles Anthropic assistant prefill (response already starts with `{` or `[`),
 * embedded fences (prefill + model re-outputs ```json wrapper), and truncation. */
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

  // Last resort: salvage individual beat objects via regex.
  const salvaged = salvageBeatsPlan(trimmed);
  if (salvaged) return salvaged as T;

  throw new SyntaxError(`Could not parse LLM JSON (preview: ${trimmed.slice(0, 240).replace(/\s+/g, ' ')})`);
}

/** Build an ordered list of candidate strings to try JSON.parse against. */
function buildCandidates(text: string): string[] {
  const candidates: string[] = [];

  const add = (...strs: (string | null | undefined)[]) => {
    for (const s of strs) if (s) candidates.push(s);
  };

  // 1. Raw text as-is.
  add(text);

  // 2. Strip fences at start/end only.
  const stripped = stripCodeFences(text);
  add(stripped);

  // 3. Strip ALL ``` markers anywhere in the text (handles prefill + re-wrapped fence).
  const clean = removeAllFenceMarkers(text);
  add(clean);

  // 4. Text extracted after the last fence opening (model re-output entire JSON after prefill).
  const afterFence = textAfterLastFence(text);
  add(afterFence);

  // 5. Extract the first balanced JSON block from each base variant.
  for (const base of [stripped, clean, afterFence ?? '']) {
    if (!base) continue;
    const block = extractJsonBlock(base);
    add(block, block && fixTrailingCommas(block), block && closeTruncatedJson(block));
  }

  // 6. Attempt truncation repair on the most promising bases.
  for (const base of [text, stripped, clean, afterFence ?? '']) {
    if (!base) continue;
    add(fixTrailingCommas(base), closeTruncatedJson(base));
    const block = extractJsonBlock(fixTrailingCommas(base));
    add(block);
    const closed = closeTruncatedJson(base);
    add(closed, extractJsonBlock(closed));
  }

  return candidates;
}

/** Strip code fences at the very start and end of the string. */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

/** Remove ALL ``` and ```json markers anywhere in the string. */
function removeAllFenceMarkers(text: string): string {
  return text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/gi, '').trim();
}

/** Return the portion of text that comes after the LAST ```json or ``` fence opener. */
function textAfterLastFence(text: string): string | null {
  // Match the last occurrence of ```json or ``` followed by optional whitespace/newline.
  const match = /```(?:json)?\s*/gi;
  let last: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = match.exec(text)) !== null) last = m;
  if (!last) return null;
  const after = text.slice(last.index + last[0].length).replace(/\s*```\s*$/, '').trim();
  return after || null;
}

function fixTrailingCommas(text: string): string {
  return text.replace(/,\s*([}\]])/g, '$1');
}

/** Close truncated object/array by dropping an open string and balancing brackets. */
function closeTruncatedJson(text: string): string {
  let s = text.trim();
  if (!s) return s;

  // Drop trailing incomplete key/value or string literal.
  s = s.replace(/,\s*"[^"]*"?\s*:?\s*"[^"]*$/s, '');
  s = s.replace(/,\s*\{[^}]*$/s, '');
  s = s.replace(/,\s*$/s, '');

  // Close an un-terminated string.
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

/** Extract the first balanced JSON object or array from text. */
function extractJsonBlock(text: string): string | null {
  const objStart = text.indexOf('{');
  const arrStart = text.indexOf('[');

  let start = -1;
  let open: string;
  let close: string;

  if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) {
    start = objStart; open = '{'; close = '}';
  } else if (arrStart >= 0) {
    start = arrStart; open = '['; close = ']';
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
    if (ch === '"') { inString = true; continue; }
    if (ch === open) depth += 1;
    if (ch === close) depth -= 1;
    if (depth === 0) return text.slice(start, i + 1);
  }

  return null;
}

/** Extract complete beat objects from truncated planner output. */
export function salvageBeatsPlan(text: string): { beats: Array<Record<string, unknown>> } | null {
  const stripped = removeAllFenceMarkers(stripCodeFences(text));
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
