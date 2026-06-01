# PRD: Shadow Motion Studio — The Generative Director (v4.0)

Version: 4.0 (generative extension / supersedes the template-filling scope of v3.0)

Owner: Neil

Status: Ready for Composer 2.5 build

Depends on: The app from `PRD.md` v2.0 + `PRD_TEMPLATE_EXPANSION.md` v2.1 (19 templates, format/placement system, batch renderer) and the Director foundation from v3.0 (orchestrator, series memory, provider abstraction, cost meter). This document **upgrades the Director** from "fills text into existing templates" to "**creates new templates** from a concept, stores them locally, and uses them in packs." When this document and existing code disagree on conventions, **existing code wins**.

---

## 0. What Changes in v4.0

The v3.0 Director only rewrote the text fields of the 19 hand-built templates. That is a copywriter, not a director. v4.0 makes it a **template author**:

> Given a concept, the Director can **design an entirely new motion-graphics template** — its own canvas, background, elements, colors, layout, and animation timeline — **validate it**, **save it locally**, and immediately use it in the same pack alongside the built-in templates.

Two hard requirements drive every decision below:

1. **Generated templates must be safe and deterministic.** The Director never writes or executes React/JS code. It emits a **declarative `TemplateDefinition` (JSON)** that a single universal interpreter component renders — using the exact same frame-based presets, theme tokens, `<Stage>`, and Remotion pipeline as the built-in templates. This gives generated templates preview==export, transparency, and format-awareness *for free*, and makes malicious or malformed output impossible to turn into code execution.
2. **Prompt caching is implemented, properly.** Template creation sends a large, static "design vocabulary" on every call. That vocabulary is cached via Anthropic prompt caching so repeated generations in a session are ~10× cheaper on the static portion. Caching works identically in the web dev-server build and the Electron build (it is an API-side mechanism). See §6.

---

## 1. The Core Architectural Decision — Declarative Templates

A "new template" is **a new composition of known visual primitives**, not new code. This mirrors how professional motion systems work (After Effects Essential Graphics, Lottie): a template is data describing elements + their styling + their animation. A single renderer interprets that data.

### Two kinds of templates now coexist

| Kind | Source | Rendered by |
|---|---|---|
| **Built-in (19)** | Hand-authored React components (unchanged) | Their own components |
| **Generated / custom** | `TemplateDefinition` JSON authored by the Director (or hand-edited) | One universal `DynamicTemplate` interpreter |

Both kinds:
- Use the same design tokens (`tokens.ts`), the same frame-based presets (`animations/presets.ts`), the same `<Stage>` (format + placement), and the same Remotion `<Composition>` registration path.
- Are selectable in the sidebar, editable in the Properties panel, and renderable through the existing batch pipeline.

The built-in 19 are **never** converted to JSON — they stay as code (visual parity guaranteed). The interpreter is **only** for generated/custom templates.

---

## 2. The `TemplateDefinition` Schema (the thing the Director generates)

This is the contract. The Director emits JSON matching this; the interpreter renders it; the validator guards it.

```ts
// src/director/templateSchema.ts  (NEW)

export type ElementKind =
  | 'text' | 'glyph' | 'line' | 'statRow' | 'bar' | 'statBox'
  | 'glow' | 'scanline' | 'badge' | 'buttonRow' | 'ring' | 'watermark';

export type PresetName =       // must match keys in animations/presets.ts
  | 'slideUp' | 'slideUp2' | 'slideR' | 'fadeL' | 'fadeR' | 'popIn'
  | 'expandLine' | 'scanAnim' | 'flashIn' | 'pulse' | 'lFill'
  | 'slideDown' | 'slideInLeft' | 'slideInRight' | 'impactZoom'
  | 'shake' | 'vignettePulse' | 'radarSweep' | 'starPop' | 'none';

export type ColorToken =       // must match tokens.ts keys
  | 'gold' | 'goldDim' | 'green' | 'greenBright' | 'red' | 'redBright'
  | 'dark0' | 'dark1' | 'dark2' | 'dark3' | 'dark4' | 'dark5'
  | 'silver' | 'text' | 'dim' | 'dimmer';

export type FontToken = 'title' | 'ui' | 'mono';

export interface ColorValue {
  token?: ColorToken;          // preferred — themeable
  hex?: string;                // fallback — validated #rrggbb only
}

export interface BackgroundSpec {
  type: 'solid' | 'gradient' | 'transparent';
  color?: ColorValue;                       // for solid
  gradient?: { angleDeg: number; stops: ColorValue[] }; // for gradient
  grainOpacity?: number;                    // 0..0.1 optional noise
}

export interface FieldSpec {
  key: string;                 // e.g. "titleMain"  (a-zA-Z0-9, <=24 chars)
  label: string;               // UI label
  type: 'string' | 'number' | 'stat[]' | 'bar[]';
  default: unknown;            // type-appropriate default
  max?: number; min?: number;  // for number
}

export interface ElementSpec {
  id: string;                  // unique within template
  kind: ElementKind;
  bind?: string;               // FieldSpec.key this element renders (text/number/arrays)
  static?: string;             // static text if not bound
  // layout (all in design px, interpreter scales via spx + Stage)
  x: number | 'center';
  y: number;
  align: 'left' | 'center' | 'right';
  font?: FontToken;
  fontSize?: number;           // design px, 8..96
  color?: ColorValue;
  letterSpacing?: number;      // px
  width?: number;              // for bars / lines
  // animation
  anim: { preset: PresetName; delaySeconds: number; durationSeconds?: number };
}

export interface TemplateDefinition {
  id: string;                  // slug, generated: "level-up-<8charhash>"
  name: string;                // "Level Up"
  group: 'stinger' | 'hud' | 'card' | 'engagement' | 'custom';
  glyph: string;               // single unicode char
  origin: 'generated' | 'user-edited';
  schemaVersion: 1;
  canvas: { width: number; height: number };   // bounded 320..1080 each
  background: BackgroundSpec;
  defaultPlacement: import('../lib/placement').Placement;
  recommendedFormats: import('../lib/formats').FormatId[];
  hasGlow: boolean;
  durationSeconds: number;     // 1.0 .. 6.0
  fields: FieldSpec[];         // editable fields (1..12)
  elements: ElementSpec[];     // 1..20 elements
  createdAt: string;
}
```

The interpreter and validator both import this single schema. There is no second source of truth.

---

## 3. The Universal Interpreter — `DynamicTemplate.tsx`

One component renders any `TemplateDefinition`. It is frame-deterministic, so it works in both the editor `@remotion/player` preview and the headless Remotion render — identical to built-in templates.

```tsx
// src/components/templates/DynamicTemplate.tsx  (NEW)
// Props: { def: TemplateDefinition; fields: Record<string,unknown>;
//          theme: ThemeTokens; globalSpeed: number; formatId?: FormatId;
//          placement?: Placement; stripCardBackground?: boolean }
//
// Behavior:
// 1. Wrap in <Stage format placement> exactly like built-in templates.
// 2. Render background from def.background (solid/gradient/transparent),
//    honoring stripCardBackground.
// 3. For each element in def.elements (sorted by anim.delaySeconds):
//      - resolve value: fields[bind] ?? element.static ?? field default
//      - resolve color: themeVars(theme) token OR validated hex
//      - resolve font/size via spx(base, sizeMultiplier)
//      - compute style from presets[element.anim.preset](frame, fps, delay, dur)
//      - render the primitive for element.kind (see kind table below)
// 4. Glow/scanline/watermark render behind content; statRow/statBox/bar use
//    the same sub-renderers the built-in templates already use (extract shared
//    sub-components so built-in + dynamic share them).
```

### Element kind → render mapping

| kind | renders | binds to |
|---|---|---|
| `text` | a line of text (font/size/color) | string field or `static` |
| `glyph` | a large unicode symbol | string field or `static` |
| `line` | a horizontal divider (animates width via expandLine) | — |
| `statRow` | a row of value/label pairs | `stat[]` field |
| `bar` | a labeled progress bar (animates fill via lFill) | `bar[]` field (or single) |
| `statBox` | a bordered stat box (value + label + delta) | `stat[]` field |
| `glow` | radial glow background (color, intensity) | — |
| `scanline` | top-to-bottom scan sweep | — |
| `badge` | bordered chip (bottom-corner) | string field or `static` |
| `buttonRow` | accept/decline style buttons | two string fields |
| `ring` | circular progress (for countdowns) | number field |
| `watermark` | huge faint background text | string field or `static` |

These are exactly the primitives already present across the 19 built-ins. **Refactor the built-in templates' internal sub-renderers (stat row, bar, stat box, glow, scanline) into `src/components/templates/shared/primitives/` so both the built-ins and `DynamicTemplate` import the same code.** No new visual vocabulary is invented — generated templates recombine proven primitives.

---

## 4. Generative Flow — How the Director Creates a Template

The Director gains a new tool/step: `create_template`. The full pack-generation loop (from v3.0 §3) now branches:

```
PLAN  ──▶ for each beat:
            is there an existing template (built-in or custom) that fits?
              YES → fill fields (v3.0 path, cheap, can use any provider)
              NO  → CREATE TEMPLATE (Anthropic + caching) → validate → save → fill
          ──▶ assemble batch → RENDER → update memory
```

### Step: CREATE TEMPLATE (Anthropic, cached)

Input (see §6 for exact caching layout):
- **Static, cached prefix:** design vocabulary — the `TemplateDefinition` schema, the element-kind reference, the preset reference, the color/font tokens, 2–3 few-shot example definitions, and one-line summaries of the existing 19 templates (so the model reuses rather than duplicates).
- **Dynamic suffix:** the beat intent + concept + series voice + any palette hint.

Output: one `TemplateDefinition` JSON. ~900–1,500 output tokens.

The orchestrator then:
1. **Validates** the definition (§5). Repairs once if needed (cheap, cached prefix reused).
2. **Saves** it to `/data/templates/custom/<id>.json`.
3. **Registers** it at runtime so the interpreter, sidebar, and Remotion root pick it up.
4. **Fills** its fields (reusing the cheap copy step) and adds it to the pack.

### "Reuse vs. create" decision

To avoid creating near-duplicates (and burning tokens), the planner is given the 19 built-in summaries + the names of existing custom templates. It only requests creation when nothing fits. A local guard also blocks creation if a custom template with a very similar `name`/`group` already exists (offer reuse instead).

---

## 5. Validation & Safety (critical — this is why generated templates are safe)

Generated templates are **data, never code**. A strict validator (`src/director/validateTemplate.ts`) runs before any save or render:

- `schemaVersion === 1`; all required keys present.
- `canvas.width/height` within 320..1080.
- Every `element.kind` ∈ the `ElementKind` union; every `anim.preset` ∈ `PresetName`; every `color.token` ∈ `ColorToken`.
- `color.hex` (if present) matches `^#[0-9a-fA-F]{6}$` exactly — no `url()`, no `expression`, no arbitrary strings.
- `fontSize` 8..96; `letterSpacing` -2..12; `durationSeconds` 1..6; `fields.length` 1..12; `elements.length` 1..20.
- Every `element.bind` references an existing `field.key`.
- `field.key` matches `^[a-zA-Z][a-zA-Z0-9]{0,23}$`.
- No unknown top-level keys (strip/reject extras).

If validation fails: one repair round (send errors + the invalid def back, cached prefix reused). If it still fails: discard the generated template and **fall back to the closest built-in template** for that beat so the pack still renders. The Director never blocks on a bad generation.

Because the interpreter only ever reads known `kind`/`preset`/`token` values and validated hex, **a malformed or adversarial definition can at worst render ugly — it can never execute code, read files, or reach the network.** This is the core safety guarantee; state it plainly in the README.

---

## 6. Prompt Caching Implementation (Anthropic)

Template creation sends a large static "design vocabulary" every call. Cache it. This section is the implementation spec, derived from Anthropic's prompt-caching docs.

### 6.1 What to cache vs. not

| Segment | Cacheable? | Why |
|---|---|---|
| System instructions (how to author a TemplateDefinition) | ✅ static | identical every call |
| `TemplateDefinition` schema text | ✅ static | identical |
| Element-kind + preset + token reference | ✅ static | identical |
| 2–3 few-shot example definitions | ✅ static | identical |
| 19 built-in one-line summaries + custom template names | ⚠️ semi-static | changes only when a custom template is added — see §6.4 |
| User concept + beat intent + series memory + palette hint | ❌ dynamic | changes every call → must come AFTER the breakpoint |

### 6.2 Request shape (place the breakpoint at the end of the static prefix)

Use the `system` array with an explicit `cache_control` breakpoint on the **last static block**. Put all dynamic content in `messages` (after the cached prefix), never in the cached blocks.

```ts
// src/director/providers/anthropic.ts
const response = await anthropic.messages.create({
  model: settings.model ?? 'claude-haiku-4-5',
  max_tokens: 1600,
  system: [
    { type: 'text', text: TEMPLATE_AUTHOR_INSTRUCTIONS },          // static
    { type: 'text', text: TEMPLATE_SCHEMA_REFERENCE },             // static
    { type: 'text', text: ELEMENT_PRESET_TOKEN_REFERENCE },        // static
    { type: 'text', text: FEWSHOT_EXAMPLE_DEFINITIONS },           // static
    {
      type: 'text',
      text: existingTemplateSummaries,                             // semi-static (§6.4)
      cache_control: { type: 'ephemeral' },                        // ◀ BREAKPOINT
    },
  ],
  messages: [
    { role: 'user', content: dynamicRequest },  // concept + intent + memory — NOT cached
  ],
});
```

Cache breakpoint goes on the **last block that is identical across requests**, not on the user message (the docs' most common mistake). The dynamic user message sits after it and never invalidates the cache.

### 6.3 Minimum-length requirement (important for the chosen model)

Cache only activates above a per-model token floor:
- **Claude Haiku 4.5: 4,096 tokens minimum.**
- Claude Sonnet 4.6 / Opus 4.x: 1,024 tokens minimum.

The static prefix (instructions + schema + element/preset/token reference + few-shot examples) must therefore exceed **4,096 tokens** for caching to engage on Haiku 4.5. It will, comfortably, once the schema + element reference + 2–3 full example definitions are included. If the prefix ever falls short, pad the reference section with additional worked examples — cache reads are far cheaper than uncached input, so reaching the floor pays for itself.

Verify caching engaged by checking `usage.cache_creation_input_tokens` (first call, the write) and `usage.cache_read_input_tokens` (subsequent calls, the read). If both are 0, the prefix was below the floor.

### 6.4 Handling the semi-static summaries block

The "existing template summaries" block changes only when the user adds a custom template. Keep it as the **last** static block (where the breakpoint sits) so that:
- Within a session where no new template is added, every creation call hits the cache fully.
- When a new custom template is saved, that block changes once → next call writes a fresh cache entry → subsequent calls hit it again. This is correct and cheap (one extra write per new template).

Do **not** put per-request data (timestamps, the concept) in this block — that would write a new entry every call and never read.

### 6.5 TTL choice

Default **5-minute ephemeral** cache. It refreshes for free on each use, which fits a creation session (the creator generates several templates/packs in a burst). Expose a setting for the **1-hour TTL** (`cache_control: { type: 'ephemeral', ttl: '1h' }`) for users who work in long, spread-out sessions — at the documented 2× write premium. Default stays 5m.

### 6.6 Optional pre-warming

When the Director "Create" panel opens, optionally fire one pre-warm call to write the cache before the first real generation, removing first-call latency:

```ts
// Pre-warm: max_tokens: 0, breakpoint on the static prefix, placeholder user msg.
// NOTE: max_tokens:0 is rejected with structured outputs / tool_choice:any —
// so the pre-warm call must NOT set an output schema. It only warms the cache.
await anthropic.messages.create({
  model, max_tokens: 0,
  system: [...staticBlocks, { ...lastBlock, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: 'warmup' }],
});
```

Pre-warming is optional and off by default (it incurs one cache-write charge). Enable it only if first-call latency matters during a demo.

### 6.7 Cost tracking (feed the existing cost meter)

Map Anthropic usage fields into the v3.0 `TokenUsage`:

```ts
const u = response.usage;
const usage: TokenUsage = {
  inputTokens: u.input_tokens,                       // after breakpoint (small)
  cachedInputTokens: u.cache_read_input_tokens ?? 0, // reads (cheap)
  cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
  outputTokens: u.output_tokens,
  estimatedCostUsd: estimateAnthropic(u, model),     // see pricing table §8
};
```

The cost meter (v3.0 §8.4) shows reads vs writes vs fresh input separately, so the creator sees caching working live.

### 6.8 Electron parity

Prompt caching is an **API-side mechanism** — it behaves identically whether the request originates from the local web dev-server or the Electron main process. Requirements for parity:
- The static prefix string must be **byte-identical** across calls (it is, since it's built from constants). Do not interpolate anything dynamic into the cached blocks.
- The same API key / workspace must be used (caches are isolated per workspace as of Feb 2026). The Electron build reads the key from `/data/director.json` in the user-data dir exactly as the web build reads it from the project `/data` dir.
- No other code change is needed for Electron; the provider module is shared.

---

## 7. Storage & Reuse of Custom Templates

```
data/templates/
  custom/
    level-up-3f9a2b71.json        // one TemplateDefinition per file
    combo-streak-9c1de40a.json
  index.json                       // { id, name, group, glyph, createdAt }[] for fast listing
```

- **Save:** validated `TemplateDefinition` → `custom/<id>.json`; append to `index.json`.
- **Load at startup:** read `index.json`; lazy-load definitions on selection.
- **Register:** a `customTemplateRegistry` (Zustand) merges built-in `TEMPLATE_META` with custom entries so the sidebar, Properties panel, and Remotion root treat them uniformly.
- **Remotion:** register **one** parametric `<Composition id="dynamic-template">` that takes a `TemplateDefinition` + fields as `inputProps`. Custom templates render through this single composition — no per-template registration needed.
- **Edit:** opening a custom template in the editor lets the user tweak fields, colors, timing, placement; "Save as new" writes a new id (`origin: 'user-edited'`). Built-in 19 remain read-only definitions.
- **Delete / export:** remove from `custom/` + `index.json`; export a `.json` to share. Importing a `.json` runs it through the validator before accepting.

---

## 8. Cost Model With Caching (real numbers)

Default model **`claude-haiku-4-5`** ($1 / MTok input, $5 / MTok output, cache read $0.10 / MTok, 5-min cache write $1.25 / MTok).

Assume a static cached prefix of ~5,000 tokens, a ~400-token dynamic request, and ~1,200 output tokens per template creation.

| Call | Cache write | Cache read | Fresh input | Output | ~Cost |
|---|---|---|---|---|---|
| **1st creation (cold)** | 5,000 @ $1.25/M | 0 | 400 @ $1/M | 1,200 @ $5/M | ~$0.0129 |
| **Each later creation (warm)** | 0 | 5,000 @ $0.10/M | 400 @ $1/M | 1,200 @ $5/M | ~$0.0069 |
| **Text-fill only (no creation)** | 0 | 5,000 @ $0.10/M | ~600 @ $1/M | ~900 @ $5/M | ~$0.0056 |

Without caching, every creation would pay 5,000 @ $1/M fresh = $0.005 extra each. **Caching saves ~70% on the static portion for every call after the first.** A session that creates 5 new templates and fills 10 packs costs roughly **$0.10–$0.15 total**. The hard session budget + cost meter from v3.0 still apply.

For higher-quality template authoring, allow opting the **creation step only** up to `claude-sonnet-4-6` (1,024-token cache floor, $3/$15 per MTok). Text-fill stays on Haiku. Default remains all-Haiku.

---

## 9. UI Changes

### 9.1 Director panel — creation surface

Extend the v3.0 Director panel:
- A toggle per beat in the plan view: **"Reuse"** (pick from built-in/custom) vs **"Create new"**. The Director sets a sensible default; the user can override.
- When a beat will create a template, show a small **"✦ new template"** badge and a one-line description of what it will author.
- After generation, each newly created template appears in the asset grid with a **"Save to library"** confirmation (auto-saved, but shown) and an **"Open in editor"** button.

### 9.2 Template library manager

A modal listing custom templates (from `index.json`): name, glyph, group, created date, with **Edit / Duplicate / Export / Delete**. Built-in 19 shown separately as read-only.

### 9.3 Sidebar

Custom templates appear under a new **"Custom"** section (or within their declared `group`), with their generated glyph. Platform/format filtering (v2.1 §6.4) applies via each definition's `recommendedFormats`.

### 9.4 Cost meter

Already exists (v3.0). Extend the breakdown to show **cache reads / cache writes / fresh input** separately so the creator can see caching working. Add a tiny "cache: warm ✓ / cold" indicator.

---

## 10. Data Models (additions)

```ts
// src/director/types.ts (extend)
export interface TokenUsage {            // extend v3.0
  inputTokens: number;
  cachedInputTokens: number;             // cache_read_input_tokens
  cacheWriteTokens: number;              // cache_creation_input_tokens  (NEW)
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface CustomTemplateIndexEntry {
  id: string; name: string; group: string; glyph: string; createdAt: string;
}

export interface GeneratedAsset {        // extend v3.0
  template: string;                      // TemplateId OR custom id
  isCustom: boolean;                     // NEW
  templateDef?: TemplateDefinition;      // NEW — present when freshly created
  fields: Record<string, unknown>;
  formatId?: FormatId;
  export?: Partial<ExportConfig>;
  valid: boolean;
  errors?: string[];
}
```

---

## 11. New Files

```
src/director/
  templateSchema.ts          // TemplateDefinition + sub-types (single source of truth)
  validateTemplate.ts        // strict validator (§5)
  templateRegistry.ts        // merge built-in + custom; runtime registration
  prompts/
    templateAuthor.ts        // TEMPLATE_AUTHOR_INSTRUCTIONS (static)
    schemaReference.ts       // TEMPLATE_SCHEMA_REFERENCE (static)
    elementReference.ts      // ELEMENT_PRESET_TOKEN_REFERENCE (static)
    fewshot.ts               // FEWSHOT_EXAMPLE_DEFINITIONS (static)
  providers/
    anthropic.ts             // EXTEND: cache_control system blocks, usage mapping (§6)

src/components/templates/
  DynamicTemplate.tsx        // universal interpreter (§3)
  shared/primitives/         // extracted shared sub-renderers:
    StatRow.tsx  Bar.tsx  StatBox.tsx  Glow.tsx  Scanline.tsx
    Badge.tsx  ButtonRow.tsx  Ring.tsx  Watermark.tsx

src/components/director/
  CreatePanel.tsx            // create-vs-reuse controls in the plan
  TemplateLibrary.tsx        // manage custom templates

src/remotion/
  compositions/DynamicComposition.tsx  // single parametric <Composition> for custom templates

data/templates/custom/       // generated TemplateDefinition JSONs
data/templates/index.json    // fast list
```

### Touch points (additive)

- `remotion/Root.tsx` — register one `dynamic-template` composition.
- Built-in template components — extract their stat-row/bar/box/glow/scanline internals into `shared/primitives/` and import them back (no behavior change). This lets `DynamicTemplate` reuse identical sub-renderers.
- Sidebar, Properties panel — read from `templateRegistry` (built-in + custom) instead of `TEMPLATE_META` directly.
- `.gitignore` — `data/templates/custom/` and `data/director.json` stay local.

---

## 12. Build Plan for Composer 2.5 (continues M0–M15)

**M16 — Primitives extraction + interpreter skeleton.**
Extract shared sub-renderers into `shared/primitives/`. Build `DynamicTemplate.tsx` that renders a hard-coded sample `TemplateDefinition` (e.g. a re-creation of "Mission Passed" as data) through `<Stage>` + presets.
*Done when:* the sample definition renders and animates identically to a built-in, in 16:9 and 9:16, in the editor preview.

**M17 — Schema + validator + storage + registry.**
Build `templateSchema.ts`, `validateTemplate.ts`, `templateRegistry.ts`, the `dynamic-template` Remotion composition, and `data/templates/` persistence. Wire custom templates into sidebar/Properties/export.
*Done when:* a hand-written custom `TemplateDefinition` saved to `data/templates/custom/` appears in the sidebar, is editable, and exports a clean transparent WebM.

**M18 — Anthropic provider with prompt caching.**
Build the static prompt blocks (`prompts/*`), extend `providers/anthropic.ts` with the `system`-array `cache_control` layout (§6.2), usage mapping (§6.7), and the 4,096-token-floor check. Add the optional pre-warm.
*Done when:* a creation call returns a valid `TemplateDefinition`; first call shows `cache_creation_input_tokens > 0`, the second shows `cache_read_input_tokens > 0`; cost meter reflects reads vs writes.

**M19 — Generative flow + reuse/create decision + repair.**
Wire `create_template` into the orchestrator branch (§4): reuse-vs-create decision, validate→repair→fallback, save, register, fill, add to pack. Add the dedup guard.
*Done when:* a concept with a beat that no built-in fits causes the Director to author a new template, validate and save it, and render it in the pack alongside built-ins — entirely within the cost meter and budget.

**M20 — UI: create panel + library + cost breakdown.**
Build `CreatePanel.tsx`, `TemplateLibrary.tsx`, the cache warm/cold indicator, and the per-segment cost breakdown.
*Done when:* the creator can, from one panel, describe a video, watch the Director reuse some templates and author others, review every generated card, edit any of them, manage the custom library, and render — with a live, accurate cost meter showing caching engaged.

---

## 13. Definition of Done (v4.0)

The creator can:

- Describe a concept and have the Director **author entirely new templates** (canvas, background, colors, elements, layout, animation) when no existing template fits — not just refill text.
- Have those generated templates **validated, saved locally, registered, and rendered** in the same pack as the built-in 19, through the existing Remotion pipeline (transparent WebM, all formats).
- **Edit, duplicate, export, import, and delete** custom templates; built-in 19 stay read-only.
- Run template creation on **Anthropic with prompt caching active** — verified via `cache_read_input_tokens` on repeat calls — so repeated generations are ~70% cheaper on the static portion, with a live cost meter proving it.
- Trust that generated templates are **data, never code**: the strict validator + interpreter mean a bad definition can only look wrong, never execute anything.
- Get **identical caching behavior in the Electron build** (API-side mechanism; shared provider module; byte-identical prefix).
- Fall back gracefully: if generation/validation fails twice, the closest built-in template is used so the pack always renders.
- Keep the offline-first guarantee: with no key set, the app and its local fallback (v3.0 §7) still work; only *new-template authoring* requires the Anthropic key.

---

## 14. Why This Makes It Exceptional

- **It authors templates, not just text** — a genuine generative design system, the thing that separates a "Director" from a mail-merge. Few portfolio projects demonstrate LLM-authored, schema-constrained, deterministically-rendered design artifacts.
- **Declarative-spec-plus-interpreter** is the correct, professional architecture (the Lottie/Essential-Graphics pattern) — safe, deterministic, and it reuses the entire existing render pipeline for free. Reviewers who know motion tooling will recognize the maturity.
- **Prompt caching done by the book** — explicit breakpoint at the end of a stable prefix, dynamic content after it, model-floor awareness, usage-field verification, TTL choice, optional pre-warm, Electron parity, and a live cost meter that *shows* the savings. This is exactly the "cost-engineered agentic system" competence the target market screens for.
- **Safety story is airtight** — "the LLM creates templates" sounds risky; the data-not-code design makes it provably safe, and that's a great thing to be able to explain in an interview.

The Loom writes itself: *describe a video → watch the Director reuse two built-ins and author a brand-new "Combo Streak" template live → it validates, saves to the library, renders in both formats → and the cost meter reads "cache: warm ✓, $0.007."*

---

## 15. Future V5 (out of scope now)

Director chat refinement of a generated template ("make the title bigger, add a glow") · learning a creator's house style into a reusable theme + element-preference profile · template variation generator (5 takes on one idea) · community template import/export marketplace · MCP server exposing the Director's `create_template` + `render_pack` as tools other apps can call.
