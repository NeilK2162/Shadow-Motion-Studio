# PRD: Shadow Motion Studio — The Director (Agentic Layer)

Version: 3.0 (agentic extension / addendum to `PRD.md` v2.0 + `PRD_TEMPLATE_EXPANSION.md` v2.1)

Owner: Neil

Status: Ready for Composer 2.5 build

Depends on: The existing app (M0–M10 complete — 19 templates, format/placement system, batch renderer, save/load). This document **adds** an agentic layer on top. It does not replace anything. When this document and existing code disagree on conventions, **the existing code wins** — match the patterns already in `src/`.

---

## 0. The One-Line Pitch

> Shadow Motion Studio renders branded motion graphics. **The Director** is an agent that turns a plain-English video concept into a complete, continuity-aware asset pack — and hands it to the renderer you already built.

You type: *"Episode 4 of my Hyderabad arc — I closed my first ₹50K client, but a bigger deal fell through. Recap the week."*

The Director plans the beats, selects the right templates from your 19, writes the copy in your voice, remembers that last episode you had 23 users and RESPECT +250 (so this one shows 31 and +400), validates everything against your schemas locally, and renders the pack — 16:9 for YouTube and 9:16 for Shorts — in one pass.

---

## 1. Why This Extension Exists

The base app is a **manual tool**: pick template → type copy → export. Excellent, but every asset is hand-made.

This extension makes it **agentic**: describe intent → the system reasons, decides, generates, validates, and orchestrates the render pipeline autonomously. It is the difference between a text editor and a writing assistant that can draft a whole document.

Three hard requirements shape every decision in this document:

1. **Optional, never mandatory.** The app must remain 100% functional offline with zero API keys. The Director is an *additive* mode. If no key is set, the app behaves exactly as it does today, plus a free local-only generation mode (§7).
2. **Brutally cheap to run.** The owner has a small token budget. Every architectural choice below is optimized to make a full asset-pack generation cost a *fraction of a cent*. See §4 (Token Economy) — this is a first-class design constraint, not an afterthought.
3. **Genuinely agentic.** Not "an LLM writes JSON." A multi-step loop with planning, tool use, local state/memory, schema validation, and self-correction. See §3.

---

## 2. What "Agentic" Means Here (Scope)

The Director is an agent with four capabilities:

| Capability | Implementation |
|---|---|
| **Plan** | Reasons about narrative structure — which beats a video needs and in what order |
| **Act (tool use)** | Calls local tools: `select_templates`, `generate_copy`, `validate_pack`, `read_series_state`, `write_series_state`, `render_pack` |
| **Remember** | Maintains a local, token-free series memory (continuity across episodes) |
| **Self-correct** | Validates generated JSON against template schemas locally; repairs invalid output before rendering |

The agent loop runs **client-side orchestration** (in the existing local Node dev server) calling an LLM provider for the reasoning/generation steps only. All validation, memory, and rendering are local and free.

### Non-goals (this version)

No autonomous web browsing. No multi-turn open-ended chat. No image generation. No voice. No cloud sync. The Director does exactly one job extremely well: concept → asset pack. (Open-ended chat is a V4 idea, §13.)

---

## 3. The Agentic Loop (Core Architecture)

```
                         ┌─────────────────────────────────────────────┐
   User concept  ───────▶│  DIRECTOR ORCHESTRATOR (local Node)         │
   + format choice       │                                             │
                         │  Step 1  PLAN          (LLM · tiny call)    │
                         │  Step 2  SELECT         (local, free)        │
                         │  Step 3  DRAFT COPY     (LLM · 1 call)       │
                         │  Step 4  VALIDATE       (local, free)        │
                         │  Step 5  REPAIR if bad  (LLM · rare, tiny)   │
                         │  Step 6  RENDER         (existing batch)     │
                         │  Step 7  UPDATE MEMORY  (local, free)        │
                         └─────────────────────────────────────────────┘
                                          │
                                          ▼
                            /exports/director-<timestamp>/
                            (16:9 + 9:16 assets, ready for editing)
```

### Step-by-step

**Step 1 — PLAN (1 small LLM call).**
Input: the user concept + a *compact* template registry (id · group · one-line purpose only — ~300 tokens, see §5.1) + the current series memory summary (~150 tokens) + the creator's voice profile (~80 tokens).
Output: an ordered list of 3–7 *beats*, each naming a template `id` and a one-line `intent` for that beat. Pure JSON. ~150 output tokens.

Example planner output:
```json
{
  "beats": [
    { "template": "chapter-card", "intent": "Open episode 4, entering the grind" },
    { "template": "cash-pickup", "intent": "₹50K first client closed" },
    { "template": "mission-failed", "intent": "Bigger deal fell through" },
    { "template": "weekly-stats", "intent": "Week 4 recap with updated numbers" },
    { "template": "subscribe-prompt", "intent": "CTA to follow the arc" }
  ]
}
```

**Step 2 — SELECT (local, zero tokens).**
The orchestrator looks up the *full field schema + defaults* only for the templates named in the plan (not all 19). This is the key cost lever — we never send 19 schemas, only the 3–7 chosen ones.

**Step 3 — DRAFT COPY (1 LLM call).**
Input: the beats + full schemas for *only* the selected templates + series memory + voice profile.
Output: a complete batch-JSON array — one entry per beat with all fields filled. ~800–1,200 output tokens.
This is the only "expensive" call, and it's still tiny.

**Step 4 — VALIDATE (local, zero tokens).**
A local validator (`src/director/validate.ts`) checks every generated entry against the template's known field set and types. Catches: missing required fields, wrong types, arrays of wrong length, unknown templates. Produces a structured error list.

**Step 5 — REPAIR (LLM, only if validation fails).**
If and only if validation fails, send back *just the broken entries* + the specific errors and ask for a corrected version. Usually 0 calls. When it happens, ~200 tokens. Hard cap: 2 repair attempts, then fall back to template defaults for the broken fields (never block the render).

**Step 6 — RENDER (existing pipeline, zero new tokens).**
Hand the validated batch JSON to the existing batch renderer (`/api/batch` from PRD v2.0 §Batch Generator + the multi-format fan-out from v2.1 §7). Output to `/exports/director-<timestamp>/`.

**Step 7 — UPDATE MEMORY (local, zero tokens).**
Extract continuity facts from this pack (new user count, new RESPECT total, week number, last milestone) and write them to local series memory (§6) so the next episode stays consistent.

### Why this is genuinely agentic and not a wrapper

- It **plans** before acting (decomposition of a goal into beats).
- It **selects tools** (templates) from a library based on reasoning.
- It **maintains state** across invocations (series memory).
- It **validates and self-corrects** its own output against a schema.
- It **orchestrates a downstream system** (the renderer) it doesn't directly control.

That is the textbook definition of a tool-using, stateful, self-correcting agent — and it maps directly onto the "agentic systems / API orchestration" language in the target Upwork jobs.

---

## 4. Token Economy (First-Class Constraint)

This section governs every other section. The goal: **a full asset-pack generation should cost well under one cent.**

### 4.1 Model choice — cheap by default

Default to the cheapest capable model. Structured JSON generation from a constrained schema does **not** need a frontier model.

```ts
// src/director/config.ts
export const MODEL_DEFAULTS = {
  openai: 'gpt-4o-mini',        // ~$0.15 / 1M input, ~$0.60 / 1M output
  anthropic: 'claude-3-5-haiku-20241022', // similar economics
} as const;
```

A "quality" toggle can opt up to `gpt-4o` / `claude-3-5-sonnet` for the planning step only (where reasoning matters most), but **default is mini/haiku everywhere**.

### 4.2 The four cost levers (all mandatory)

1. **Two-stage schema loading.** Stage 1 (plan) sends a ~300-token compact registry. Stage 2 (draft) sends full schemas for *only the 3–7 selected* templates (~150 tokens each), never all 19. This alone cuts input tokens ~80% vs a naive "send everything" design.

2. **Prompt caching on static content.** The compact registry, the voice profile, and the system instructions are static across calls. Use provider prompt caching (Anthropic `cache_control`; OpenAI automatic prefix caching). Cached input tokens are ~90% cheaper. Mark the static prefix explicitly.

3. **JSON-only output, no prose.** Both calls use structured output / JSON mode. The model never explains itself. Output is pure data. This caps output tokens hard.

4. **Local everything-that-can-be-local.** Validation, memory, schema lookup, and rendering use **zero** tokens. Only planning, drafting, and (rare) repair touch the API.

### 4.3 Cost projection (real numbers)

Typical 5-beat pack with `gpt-4o-mini`, caching active:

| Step | Input tokens | Output tokens | ~Cost |
|---|---|---|---|
| Plan | ~530 (mostly cached) | ~150 | ~$0.0001 |
| Draft | ~1,500 | ~1,100 | ~$0.0009 |
| Validate | 0 | 0 | $0 |
| Repair (rare) | ~250 | ~200 | ~$0.0002 (only when needed) |
| **Total per pack** | | | **~$0.001** (one tenth of a cent) |

**100 full asset packs ≈ $0.10.** A heavy month of daily content (say 60 packs) costs under **$0.07**. This is the reassurance the budget requires — and the in-app cost meter (§8.4) proves it live.

### 4.4 Hard guardrails

- A per-session token budget cap (default 50,000 tokens) with a visible meter. When hit, the Director pauses and asks to continue.
- A `--dry-run` mode (default ON for first use) that runs Plan + Draft + Validate and shows the JSON **without rendering or spending render compute** — the user approves before render.
- Max 7 beats per pack (prevents runaway generations).
- Repair capped at 2 attempts, then graceful fallback to defaults.

---

## 5. Provider Abstraction (Portfolio + Flexibility)

Make the LLM provider swappable. This is both good engineering and a direct match to the "API orchestration / works with OpenAI and Claude" language clients want.

```ts
// src/director/providers/types.ts
export interface LLMProvider {
  readonly name: 'openai' | 'anthropic';
  /** Returns parsed JSON of type T. Must enforce JSON-only output. */
  complete<T>(args: {
    system: string;            // static, cacheable prefix
    user: string;              // dynamic content
    schema?: object;           // optional JSON schema for structured output
    maxTokens: number;
    cacheableSystem?: boolean; // enable prompt caching on `system`
    model?: string;
  }): Promise<{ data: T; usage: TokenUsage }>;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  estimatedCostUsd: number;
}
```

```
src/director/providers/
  types.ts
  openai.ts        // uses gpt-4o-mini, response_format: json_object, prefix caching
  anthropic.ts     // uses claude-3-5-haiku, cache_control on system, tool/json output
  index.ts         // factory: getProvider(settings) -> LLMProvider
  mock.ts          // deterministic fake provider for tests + offline demo
```

The factory reads the active provider + key from local settings (`/data/director.json`, never committed). If no key → provider is `null` → Director UI shows the **local fallback mode** (§7) instead of erroring.

`estimatedCostUsd` is computed from a local price table (`src/director/pricing.ts`) so the cost meter works without any external billing call.

---

## 6. Series Memory (Local, Token-Free Continuity)

The standout feature. A content **series** has continuity: episode numbers increase, user counts grow, RESPECT accumulates, the arc progresses. The Director maintains this in local JSON — costing **zero tokens** to store and ~150 tokens to inject as context.

```ts
// src/director/memory.ts  — persisted to /data/series/<seriesId>.json
export interface SeriesMemory {
  seriesId: string;            // e.g. "hyderabad-arc"
  title: string;               // "Hyderabad Arc"
  episode: number;             // auto-increments
  voiceProfileId: string;
  // rolling continuity facts the agent keeps consistent:
  facts: {
    shadowUsers?: number;      // 23 -> 31 -> ...
    respectTotal?: number;     // running RESPECT score
    cashTotal?: string;        // "₹50,000"
    lastMilestone?: string;    // "First ₹50K client"
    weekNumber?: number;
    location?: string;         // "Banjara Hills, Hyderabad"
    [key: string]: unknown;    // extensible
  };
  history: Array<{             // compact log, last 5 episodes only (keeps context tiny)
    episode: number;
    summary: string;           // one line
    date: string;
  }>;
}
```

**Injection (cheap):** Only a compressed summary enters the prompt:
```
SERIES CONTEXT (hyderabad-arc, episode 4):
Last episode (3): hit 23 Shadow users, RESPECT +250, week 3.
Maintain continuity: users should grow, RESPECT should increase, this is week 4.
```
~150 tokens. The full memory file stays local.

**Update (free):** After render, the orchestrator parses the generated pack for numeric continuity fields and updates `facts` + appends a one-line `history` entry. History is capped at the last 5 episodes so injected context never grows.

This is what makes the Director *exceptional*: it's not a one-shot generator, it's a **show-runner** that keeps a series coherent over time, and the continuity engine is entirely free.

---

## 7. Local Fallback Mode (Zero-Token Generation)

When no API key is set (or the user chooses "Local" provider), the Director still works — using deterministic, rule-based generation. No tokens, fully offline, consistent with the app's core promise.

```ts
// src/director/local/planner.ts
// Maps concept keywords + a small intent grammar to a beat sequence.
// e.g. detects "recap"/"week" -> weekly-stats; "closed"/"client"/"₹" -> cash-pickup;
//      "failed"/"fell through"/"lost" -> mission-failed; always opens with chapter-card
//      if "episode"/"chapter"/"entering" present; ends with subscribe-prompt if "youtube".
```

The local planner uses a keyword→template rule table + the series memory to fill numbers. Copy is generated from templated phrasings with the user's variables slotted in. It won't be as fluent as the LLM path, but it's instant, free, and good enough for a fast draft. The UI clearly labels output as "Local draft — refine manually or switch to AI for polish."

**Why this matters:** It keeps the agentic UX available to a user with zero budget, preserves the offline-first identity of the product, and is a genuinely thoughtful engineering decision a reviewer will notice.

---

## 8. UI / Editor Changes

### 8.1 The Director panel

A new collapsible panel (toggle in the top bar: `✦ DIRECTOR`). Styled to match the existing GTA tokens (`--gold` accents, `--mono` labels, `--dark2` panel). Layout:

```
┌────────────────────────── ✦ DIRECTOR ──────────────────────────┐
│ Series: [Hyderabad Arc ▾]   Episode: 4   Voice: [Hustle ▾]      │
│                                                                │
│ ┌────────────────────────────────────────────────────────┐   │
│ │  Describe this video / asset pack...                     │   │
│ │  "Closed first ₹50K client, bigger deal fell through,    │   │
│ │   recap the week"                                        │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                                │
│ Format: ◉ YouTube 16:9  ○ Shorts 9:16  ◉ Both                  │
│ Provider: [OpenAI · gpt-4o-mini ▾]   Mode: ◉ Dry run  ○ Render  │
│                                                                │
│            [ ✦ GENERATE PACK ]                                  │
│                                                                │
│ ── Plan ──────────────────────────────────────────────        │
│  1. chapter-card   · Open episode 4                            │
│  2. cash-pickup    · ₹50K first client closed                 │
│  3. mission-failed · Bigger deal fell through                 │
│  4. weekly-stats   · Week 4 recap                             │
│  5. subscribe      · Follow the arc                           │
│                                                                │
│ ── Generated assets (review before render) ──────────         │
│  [card preview] [card preview] [card preview] ...             │
│  [ Edit any card in the main editor ]  [ ✓ RENDER ALL ]       │
│                                                                │
│ Tokens this session: 3,210 / 50,000   ·   Est. cost: $0.0021  │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Plan → review → render flow

- **Generate** runs Plan + Select + Draft + Validate, then shows the plan and a grid of generated card previews (using the existing `@remotion/player` thumbnails).
- Each generated card has an **"Open in editor"** button → loads that single project into the main editor for manual tweaking (reuses existing store + Properties panel — no new editor needed).
- **Render All** hands the (possibly user-edited) batch to the existing renderer.
- In **Dry run** mode, Render All is the explicit second step — nothing renders or generates further until the user approves.

### 8.3 Series manager

A small modal to create/select/rename series and edit the voice profile. Series + voice profiles persist to `/data/series/` and `/data/voices.json`. Creating a series is optional — a default "Untitled" series exists so the Director works with zero setup.

### 8.4 Cost meter (always visible in the panel)

Live readout: tokens used this session, session budget, estimated cost in USD. Updates after every call from the `TokenUsage` returned by the provider. A small expandable breakdown shows per-step token spend (plan / draft / repair). This directly serves the budget constraint and doubles as a standout portfolio detail ("the agent shows you exactly what it costs in real time").

---

## 9. Voice Profile (Cheap Personalization)

A tiny, local, reusable description of the creator's tone, injected as ~80 tokens.

```ts
// /data/voices.json
export interface VoiceProfile {
  id: string;
  name: string;            // "Hustle"
  description: string;     // <= 280 chars, e.g.:
  // "Confident, slightly witty, GTA-flavored. Short punchy lines.
  //  Indian creator voice. Uses ₹ for money. Never corporate. Never cringe."
  examples?: string[];     // up to 3 short example lines for few-shot (optional)
}
```

The profile is written once and reused across all generations. Few-shot examples are optional and capped at 3 short lines to keep tokens low. This gives consistent, on-brand copy without per-call configuration.

---

## 10. Data Models & Types (additions)

All additions are additive to existing `src/types/index.ts`. Nothing existing changes.

```ts
// src/director/types.ts
export interface Beat {
  template: TemplateId;       // from existing TemplateId union (19 templates)
  intent: string;             // one-line purpose for this beat
}

export interface DirectorPlan {
  beats: Beat[];              // 3..7
  reasoning?: string;         // optional, only in quality mode
}

export interface GeneratedAsset {
  template: TemplateId;
  fields: Record<string, unknown>;   // matches the template's field map
  formatId?: FormatId;               // from v2.1 formats system
  export?: Partial<ExportConfig>;
  valid: boolean;                    // set by local validator
  errors?: string[];                 // validation errors if any
}

export interface DirectorPack {
  seriesId: string;
  episode: number;
  concept: string;
  plan: DirectorPlan;
  assets: GeneratedAsset[];
  usage: TokenUsage;                 // cumulative for this generation
  createdAt: string;
}

export interface DirectorSettings {
  provider: 'openai' | 'anthropic' | 'local';
  apiKeyRef?: string;                // stored in /data/director.json, gitignored
  model?: string;
  qualityMode: boolean;              // upgrades planner model only
  sessionTokenBudget: number;        // default 50000
}
```

Compact registry type (Stage 1 input):

```ts
// src/director/registry.ts
// Generated ONCE from TEMPLATE_META — id, group, and a <=8-word purpose.
export interface RegistryEntry { id: TemplateId; group: string; purpose: string; }
export const COMPACT_REGISTRY: RegistryEntry[];   // ~300 tokens total when serialized
```

---

## 11. Prompt Specifications

### 11.1 Planner — system (static, cached)

```
You are The Director, a motion-graphics show-runner for a creator's video series.
Given a video concept, choose 3 to 7 narrative beats from the template registry.
Each beat = one template id + a one-line intent.
Open with chapter-card if the concept implies a new episode/section.
End with subscribe-prompt only for YouTube concepts.
Maintain series continuity using the provided SERIES CONTEXT.
Match the creator's VOICE.
Output ONLY JSON: { "beats": [{ "template": "<id>", "intent": "<line>" }] }
Use only ids from the registry. No prose. No markdown.

TEMPLATE REGISTRY:
<COMPACT_REGISTRY serialized — ~300 tokens>
```

### 11.2 Planner — user (dynamic)

```
VOICE: <voice.description>
SERIES CONTEXT: <compressed memory summary, ~150 tokens>
CONCEPT: <user concept>
FORMAT TARGET: <youtube|shorts|both>
```

### 11.3 Drafter — system (static, cached)

```
You are The Director's copywriter. For each beat, fill every field of its template
schema with on-brand copy. Respect field types exactly (strings, numbers, arrays).
Keep continuity numbers consistent with SERIES CONTEXT (grow users, increase RESPECT).
Use ₹ for currency. Keep lines short and punchy. Match VOICE.
Output ONLY a JSON array of { template, fields }. No prose. No markdown.
```

### 11.4 Drafter — user (dynamic)

```
VOICE: <voice.description>
SERIES CONTEXT: <compressed memory summary>
BEATS: <plan.beats>
SCHEMAS (only the selected templates):
<for each selected template: id + field list with types + defaults>
```

### 11.5 Repair — user (only on validation failure)

```
The following generated entries failed validation. Fix ONLY these.
ERRORS: <structured error list>
INVALID ENTRIES: <the broken entries>
SCHEMAS: <schemas for just these templates>
Output ONLY the corrected JSON array.
```

All three use `maxTokens` caps: planner 300, drafter 1600, repair 500.

---

## 12. New Files & Touch Points

### New files

```
src/director/
  config.ts            // model defaults, budgets
  pricing.ts           // local price table per model -> cost estimation
  registry.ts          // COMPACT_REGISTRY built from TEMPLATE_META
  types.ts             // Beat, DirectorPlan, GeneratedAsset, DirectorPack, settings
  orchestrator.ts      // the 7-step loop
  validate.ts          // local schema validation against template field maps
  memory.ts            // SeriesMemory read/write + compress + update
  voice.ts             // VoiceProfile read/write
  providers/
    types.ts
    openai.ts
    anthropic.ts
    mock.ts
    index.ts           // factory
  local/
    planner.ts         // keyword->beats rule engine (zero-token fallback)
    drafter.ts         // templated copy generation (zero-token fallback)
  schemas.ts           // builds per-template JSON field schema from existing defaults

src/components/director/
  DirectorPanel.tsx    // the main panel (§8.1)
  PlanView.tsx         // beat list
  AssetGrid.tsx        // generated card previews (reuse @remotion/player thumbs)
  CostMeter.tsx        // token + cost readout
  SeriesManager.tsx    // create/select series + voice modal

data/
  director.json        // settings + apiKeyRef (gitignored)
  voices.json          // voice profiles
  series/              // one json per series
```

### Touch points in existing code (minimal, additive)

- `src/store/` — add a `director` slice (settings, current plan, current pack, usage). Do not alter existing project slice.
- Top bar — add the `✦ DIRECTOR` toggle.
- `/api/batch` (existing) — Director reuses it as-is. If it doesn't already accept per-entry `formatId`/`export`, extend per v2.1 §7 (that work may already be done in M10).
- `.gitignore` — add `data/director.json` and any `*.key` files.
- The validator and schemas read from the **existing** `templateDefaults.ts` and `TEMPLATE_META` — single source of truth, no duplication.

---

## 13. Build Plan for Composer 2.5 (continues M0–M10)

Each milestone is independently verifiable. Feed in order. Every milestone must preserve the offline-first guarantee (app fully works with Director disabled).

**M11 — Director foundation (local-only, zero API).**
Build `src/director/types.ts`, `registry.ts` (from `TEMPLATE_META`), `schemas.ts` (per-template field schema from `templateDefaults.ts`), `validate.ts`, `pricing.ts`, `config.ts`. Build `providers/mock.ts` + `providers/index.ts` factory. Build the `director` store slice.
*Done when:* a unit test feeds a hard-coded plan through Select → mock Draft → Validate → produces a valid batch JSON that the existing renderer accepts. No network calls.

**M12 — Series memory + voice + local fallback.**
Build `memory.ts`, `voice.ts`, `local/planner.ts`, `local/drafter.ts`. Wire the zero-token local generation path end to end.
*Done when:* with provider set to `local`, typing a concept produces a valid, continuity-aware pack (episode increments, numbers grow) and renders — entirely offline, zero tokens.

**M13 — Real providers + cost accounting.**
Build `providers/openai.ts` and `providers/anthropic.ts` with JSON-mode/structured output, prompt caching on the static system prefix, and accurate `TokenUsage` (including cached tokens) → `estimatedCostUsd` via `pricing.ts`. Implement the session budget cap.
*Done when:* with a key set, a 5-beat pack generates for both providers, the reported token usage matches the provider's actual usage within ±5%, and the cost meter shows a realistic sub-cent figure.

**M14 — Director panel UI + dry-run/review flow.**
Build `DirectorPanel`, `PlanView`, `AssetGrid`, `CostMeter`, `SeriesManager`. Wire the Plan → review → (approve) → Render flow. "Open in editor" loads a generated asset into the existing editor. Dry-run is default.
*Done when:* a user types a concept, sees the plan and generated previews without rendering, can open any card in the editor, then renders all — for "Both" formats in one action.

**M15 — Self-correction + guardrails + polish.**
Wire the validate→repair loop (max 2 attempts, then default-fill). Enforce the 7-beat cap and token budget pause. Add the per-step cost breakdown. Add the `mock` provider as a one-click "Demo mode" for recording without spending tokens.
*Done when:* a deliberately tricky concept that produces one invalid field gets auto-repaired and renders successfully; exceeding the budget pauses gracefully; Demo mode runs the full flow with zero spend.

---

## 14. Definition of Done (agentic extension)

The creator can:

- Type a plain-English video concept and receive a planned, on-voice, continuity-aware asset pack.
- Review the plan and generated cards **before** anything renders (dry-run), and open any card in the existing editor to tweak it.
- Render the whole pack to YouTube 16:9 **and** Shorts 9:16 in one action, via the existing renderer.
- Maintain a series across episodes — numbers and milestones stay consistent automatically, at zero token cost.
- Run the entire agentic flow **with no API key** via the local fallback (free, offline), or switch to OpenAI/Claude for higher-quality copy.
- See exactly how many tokens and how much money each generation costs, live.
- Trust that a typical generation costs ~$0.001 and that a hard session budget prevents surprises.

And critically: **with the Director disabled or no key set, the app behaves exactly as it does today.** The agent is pure addition.

---

## 15. Why This Makes the Project Exceptional (for the portfolio)

- **It's a real agent, not a wrapper:** plans, uses tools, keeps state, self-corrects, orchestrates a pipeline. Maps 1:1 to "agentic systems / API orchestration" job language.
- **Provider-agnostic:** OpenAI ⇄ Claude with one config change — demonstrates orchestration maturity.
- **Cost-engineered:** two-stage schema loading, prompt caching, JSON-only output, local-everything-else, a live cost meter, and a hard budget. Shows senior-level cost awareness most candidates never demonstrate.
- **Stateful continuity (Series Memory):** a genuinely novel, useful feature that's nearly free — the kind of detail that makes a reviewer stop scrolling.
- **Graceful degradation:** full local fallback preserves the offline-first product identity. Thoughtful, not bolted-on.
- **Demo-ready:** "Demo mode" (mock provider) lets the Loom be recorded end-to-end with zero spend, and the live cost meter makes the cheapness undeniable on camera.

The Loom demo writes itself: *type one sentence → watch it plan → watch it generate on-brand cards → watch it remember last episode's numbers → render to both formats → and the cost meter reads $0.001.* That single clip sells the exact skill the target market is buying.

---

## 16. Future V4 (out of scope now)

Open-ended Director chat ("make this punchier", "add a countdown before the reveal") · auto-suggest beats from a pasted video script · local embeddings for "find a past card like this" · auto-generate a full series arc plan · voice-profile learning from the creator's existing posts · MCP server exposing the Director as a tool other apps can call.
