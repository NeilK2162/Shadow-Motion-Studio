# Shadow Motion Studio — Project Document

**Version:** 1.1.2  
**Last updated:** June 2026  
**Project type:** Local creator tool · motion graphics editor · Remotion renderer · Electron desktop app  
**Primary audience:** Solo creators, YouTubers, Shorts/Reels editors, founder-led content teams

---

## 1. Executive Summary

Shadow Motion Studio is a local-first motion graphics studio for creators who want high-impact, GTA-inspired video assets without opening After Effects or relying on cloud design tools. It provides a library of animated templates, a live preview editor, project save/load, platform export presets, and direct rendering to video, still image, or transparent overlay formats.

As of v1.1.2, the product has grown beyond a static template editor. It now includes:

- **19 built-in Remotion templates** with full preview and export parity.
- **The Director** — an AI-assisted generative pipeline that plans video beats, fills copy, and can **author new custom templates** as declarative JSON.
- **DynamicTemplate** — a runtime interpreter that renders any valid `TemplateDefinition` without new React code.
- **Custom template library** — save, edit, duplicate, import/export, and render user- or AI-created templates.
- **Electron portable packaging** for Windows (`ShadowMotionStudio-1.1.2-portable.exe`, ~83 MB).

The core loop remains: pick a template → edit → preview → export → drop into Premiere, DaVinci, CapCut, or Final Cut. The Director adds a second loop: describe a video concept → get a multi-beat plan → generate assets → review → batch render.

---

## 2. What The Project Is For

Shadow Motion Studio helps creators produce repeatable cinematic motion graphics quickly.

Especially useful for:

- YouTube intros, chapter cards, transition cards, punchlines, and recap moments.
- Shorts/Reels overlays, countdowns, engagement prompts, and creator-branded HUD elements.
- Founder journey videos, challenge series, productivity vlogs, gaming-style edits, or business storytelling.
- Repeatable social content where the same visual format needs new text every day or week.
- Transparent WebM overlays layered on existing footage.
- **Batch generation** of themed asset packs (e.g. “Miami holiday pack with multiple loading screens”) via The Director.

The product does not replace a full nonlinear video editor. It focuses on branded motion assets that slot into a larger editing workflow.

---

## 3. Creator Problem

Creators often need animated graphics but face:

- After Effects is powerful but slow for simple repeatable edits.
- Template marketplaces are not tailored to a creator's exact brand language.
- Browser-based design tools may not export transparent video reliably or depend on subscriptions.
- Making the same asset in multiple aspect ratios is repetitive.
- Batch production of many personalized cards is difficult without automation.
- **Creating new visual formats** (e.g. a custom loading screen style) traditionally requires a developer or motion designer.

Shadow Motion Studio addresses this by turning a fixed creator visual language into editable, exportable templates — and, with The Director, by **generating new template definitions** when built-ins don't fit.

---

## 4. Product Positioning

Shadow Motion Studio is a local, creator-owned motion asset generator.

It sits between:

| Layer | Role |
|-------|------|
| Design tool | Edit copy, themes, layout, export settings visually |
| Motion renderer | Remotion renders actual video/still outputs |
| AI production assistant | The Director plans beats, writes copy, authors templates |
| Desktop utility | Electron packages into a portable Windows build |
| Lightweight pipeline | JSON batch rendering generates many assets from structured data |

The intended feel is not “generic Canva clone.” It is a focused creative operating system for a specific creator style — dark backgrounds, gold/green accents, mono UI labels, GTA-flavored hustle aesthetic.

---

## 5. Core Value For Creators

**Speed plus consistency.**

Build a recognizable visual language once, reuse it across videos and platforms. Templates are wired into live preview and export — what you see in the editor is what Remotion renders.

| Benefit | Detail |
|---------|--------|
| Branded cinematic cards | 19 built-ins + unlimited custom templates |
| Lower AE dependency | Routine motion graphics without timeline editing |
| Platform presets | YouTube 16:9, Shorts/Reels 9:16, square/ portrait feed |
| Transparent WebM | Professional overlay workflow |
| Local ownership | Projects, themes, packs, exports stay on disk |
| Batch rendering | JSON batch + Director pack render |
| AI-assisted packs | Describe a concept; get a multi-asset plan and render folder |

---

## 6. Current Product Surface

### 6.1 Template Sidebar

Lists built-in and **custom** templates, grouped by purpose:

- **Stingers** — achievement, failure, countdown
- **HUD** — wanted level, cash, status, GPS, character intro, now playing
- **Cards** — chapter, loading, side quest, location, phone, cheat code, weekly stats
- **Engagement** — subscribe prompt, this-or-that poll

Platform filters: All · YouTube · Reels · Feed. Each template declares `recommendedFormats`.

Custom templates appear in a **Custom** section (loaded from `data/templates/` via API).

### 6.2 Live Preview

Remotion Player with:

- Auto-playing loop
- Replay
- Platform format switching (16:9, 9:16, 1:1, 4:5)
- Preview background: dark · transparent checkerboard · custom color
- Safe area guides
- Resolution-aware scaling

Custom templates route through `DynamicTemplate` when `project.templateDef` is set.

### 6.3 Property Editor

Editable per project:

- Template text, numbers, stats, bars, poll options, stars
- Card layout and placement (9 positions + fullscreen)
- Size multiplier, aspect multiplier, content scale
- Glow settings (where supported)
- Theme selection
- Animation speed and duration (frames)
- Export resolution, FPS, format, transparency
- Strip card background for cleaner overlays

### 6.4 Project And Batch Tools

- Save / load projects as local JSON (`projects/`)
- Export current project via API
- Upload batch JSON to render many variants (`POST /api/batch`)

### 6.5 The Director (AI Generative Panel)

Opened from the editor header. Full generative workflow:

| UI area | Purpose |
|---------|---------|
| **Concept input** | Describe a video or asset pack in natural language |
| **Plan view** | Shows beats with `reuse` vs `create` mode per beat |
| **Create panel** | Highlights which beats will spawn new custom templates |
| **Asset grid** | Generated assets with template ID, custom badge, field preview |
| **Cost meter** | Token usage, cache reads/writes, fresh input, warm/cold indicator, estimated USD |
| **Template library modal** | Edit, duplicate, export, import, delete custom templates |
| **Series manager** | Continuity facts (users, respect, ₹ amounts) across episodes |
| **Settings** | Provider, API key, quality mode, session token budget, dry run |

**Director pipeline:** Plan → Create (optional) → Draft → Validate/Repair → Pack → Render

- **Plan:** LLM chooses 3–7 beats; each beat is `reuse` (built-in template) or `create` (new custom template).
- **Create:** Anthropic-only; authors a `TemplateDefinition` JSON, validates, repairs once, saves to registry.
- **Draft:** Fills all template fields with on-brand copy.
- **Pack:** Saved to `data/director-packs/`; can batch-render to `exports/director-<timestamp>/`.

**Offline fallback:** With provider `local` or on LLM failure, deterministic local planner/drafter runs without API key.

---

## 7. Template Library

### 7.1 Built-in Templates (19)

| Group | ID | Label |
|-------|-----|-------|
| Stingers | `mission-passed` | Mission Passed |
| Stingers | `mission-failed` | Mission Failed |
| Stingers | `wasted` | Wasted |
| Stingers | `countdown` | Countdown |
| Cards | `chapter-card` | Chapter Card |
| Cards | `loading-screen` | Loading Screen |
| Cards | `side-quest` | Side Quest |
| Cards | `enter-location` | Enter Location |
| Cards | `phone-call` | Phone Call |
| Cards | `cheat-code` | Cheat Code |
| Cards | `weekly-stats` | Weekly Stats |
| HUD | `wanted-level` | Wanted Level |
| HUD | `cash-pickup` | Cash Pickup |
| HUD | `status-hud` | Status HUD |
| HUD | `gps-route` | GPS Route |
| HUD | `character-intro` | Character Intro |
| HUD | `now-playing` | Now Playing |
| Engagement | `subscribe-prompt` | Subscribe Prompt |
| Engagement | `this-or-that` | This or That |

Source: `src/types/index.ts` (`TEMPLATE_META`), React components in `src/components/templates/`.

### 7.2 Custom Templates (DynamicTemplate)

Custom templates are **declarative JSON** (`TemplateDefinition`, schema v1), not new React files.

**Schema highlights** (`src/director/templateSchema.ts`):

- Canvas 320–1080 px; duration 1–6 s
- Fields: text, number, boolean, color, statRow, statBox, bar, buttonRow
- Elements: text, glyph, line, statRow, bar, statBox, glow, scanline, badge, buttonRow, ring, watermark
- Animations via named presets (fadeIn, slideUp, scaleIn, pulse, typewriter, etc.)
- Colors: theme tokens (gold, green, dim, …) or `#rrggbb` hex
- Background: `solid` | `gradient` | `transparent`
- **`backgroundColors`:** optional `[startHex, endHex]` for context-aware gradients (e.g. sunset `["#ff6b35","#4a0e8f"]`, beach `["#0077b6","#00b4d8"]`)

**Storage:**

- Definitions: `data/templates/custom/<id>.json`
- Index: `data/templates/index.json`
- Gitignored; persisted per machine / Electron user data dir

**Interpreter:** `src/components/templates/DynamicTemplate.tsx` + shared primitives in `src/components/templates/shared/primitives/`.

**Remotion composition:** `dynamic-template` (registered in `src/remotion/Root.tsx`).

**Validation:** Strict server-side rules in `src/director/validateTemplate.ts` (canvas bounds, element kinds, preset names, bind checks, hex colors, etc.).

**Limitation:** Custom templates use **CSS gradients and typography**, not photographic backgrounds. The Director cannot generate palm-tree photos or beach imagery — only color palettes, glyphs, text, and motion primitives suited to the concept.

---

## 8. Export Capabilities

### 8.1 Formats

| Format | Use case |
|--------|----------|
| WebM (VP9, yuva420p) | Transparent overlays |
| MP4 (H.264) | Standard video clips |
| PNG | Still frame |
| JPG | Still frame |

### 8.2 Resolutions

- 1920×1080 — YouTube 16:9
- 1280×720 — YouTube 720p
- 1080×1920 — Shorts/Reels 9:16
- 1080×1080 — Square feed
- 1080×1350 — Portrait feed

FPS: 30 or 60.

### 8.3 Platform Presets

- YouTube Clip (MP4)
- YouTube Overlay (WebM)
- Reels/Shorts (MP4)
- Reels Overlay (WebM)
- Square Post (MP4)

Outputs are named with template and format suffixes under `exports/`.

### 8.4 Render Paths

| Entry | Output |
|-------|--------|
| Editor Export button | `exports/<id>_<format>-<timestamp>.<ext>` |
| Batch JSON | Multiple files per batch config |
| Director pack render | `exports/director-<timestamp>/` |
| CLI `npm run render` | From project JSON path |

Custom templates use composition `dynamic-template` automatically when `templateDef` is present.

---

## 9. The Director — Technical Detail

### 9.1 Orchestrator (`src/director/orchestrator.ts`)

```
generatePack(request)
  ├── runPlan()           → beats (reuse | create)
  ├── createTemplate()    → per create beat (Anthropic + cache)
  ├── fillCustomFields()  → field values for new templates
  ├── runDraft()          → fill built-in template fields
  ├── validate + runRepair()
  └── DirectorPack        → saved + returned to UI
```

Config (`src/director/config.ts`):

| Setting | Value |
|---------|-------|
| Default models | OpenAI `gpt-4o-mini`, Anthropic `claude-haiku-4-5-20251001` |
| Quality models | OpenAI `gpt-4o`, Anthropic `claude-sonnet-4-6` |
| Max beats | 7 |
| Session token budget (default) | 50,000 |
| Token limits | plan 2048, draft 2048, repair 1024, create 4096 |

### 9.2 LLM Providers

| Provider | File | Notes |
|----------|------|-------|
| `openai` | `providers/openai.ts` | JSON mode |
| `anthropic` | `providers/anthropic.ts` | Prompt caching, assistant prefill, required for template **create** |
| `mock` | `providers/mock.ts` | Deterministic tests |
| `local` | `local/planner.ts`, `local/drafter.ts` | No API key; keyword + series-memory rules |

**Anthropic caching:** Static prompt blocks (>4096 tokens) use `cache_control: ephemeral`. Cost meter shows cache writes vs reads.

**JSON robustness:** `parseLLMJson.ts` handles markdown fences, trailing commas, truncation, and beat salvage. Planner uses assistant prefill (`{"beats":[`) to reduce fence/truncation failures.

### 9.3 Series Memory And Voice

- **Series memory** (`data/series/<id>.json`): episode number, shadow users, respect, currency facts — fed into planner/drafter for continuity.
- **Voice profiles** (`data/voices.json`): tone description and examples for copy generation.

### 9.4 Pricing

Estimated USD per step via `src/director/pricing.ts` (input/output/cache token rates per model).

---

## 10. Technical Architecture

**Principle:** The same React template components (or `DynamicTemplate`) power both preview and export.

### 10.1 Frontend Stack

- React 18 · TypeScript · Vite 6 · Tailwind CSS
- Zustand (`editorStore`, `directorStore`, `customTemplateStore`)
- Remotion Player 4.0.272 · Lucide React

| Area | Path |
|------|------|
| Editor shell | `src/components/editor/` |
| Director UI | `src/components/director/` |
| Built-in templates | `src/components/templates/` |
| Dynamic interpreter | `src/components/templates/DynamicTemplate.tsx` |
| Types | `src/types/index.ts` |
| Defaults | `src/data/templateDefaults.ts` |

### 10.2 Rendering

| Module | Role |
|--------|------|
| `src/remotion/TemplateComposition.tsx` | Routes built-in vs DynamicTemplate |
| `src/remotion/inputProps.ts` | Project → Remotion props; `DYNAMIC_TEMPLATE_COMPOSITION_ID` |
| `src/renderer/render.ts` | Stills, video, batch, warm headless Chromium |
| `src/renderer/render-cli.ts` | CLI entry |

Renderer reuses a single headless browser where possible. Concurrency ~half CPU cores (max 8). Packaged Electron uses prebuilt `dist-remotion/` and unpacked `@remotion/compositor-win32-x64-msvc`.

### 10.3 Local API (`src/server/app.ts`)

Port **3456** in dev; random free port in Electron. Vite proxies `/api` via `scripts/vite-api-plugin.ts` (auto-starts API; **watches `src/` and restarts API on `.ts` changes**).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/export` | Render single project |
| POST | `/api/batch` | Render project array |
| POST | `/api/director/generate` | Generate director pack |
| POST | `/api/director/render` | Render pack assets |
| GET/POST | `/api/director/settings` | Director config |
| GET/POST | `/api/director/series` | Series memory |
| GET/POST | `/api/director/voices` | Voice profiles |
| GET | `/api/director/packs` | List saved packs |
| GET | `/api/director/packs/load?id=` | Load pack |
| GET | `/api/director/usage` | Session token usage |
| POST | `/api/director/usage/reset` | Reset usage counter |
| GET | `/api/templates` | List custom templates |
| GET | `/api/templates/load?id=` | Load template def |
| POST | `/api/templates` | Save custom template |
| DELETE | `/api/templates/:id` | Delete custom template |
| POST | `/api/templates/import` | Import template JSON |
| POST | `/api/projects/save` | Save project |
| GET | `/api/projects/load?name=` | Load project |
| GET | `/api/projects/list` | List projects |
| GET | `/api/themes` | Load themes |
| POST | `/api/themes/save` | Save themes |

Local-only; not designed for public multi-user exposure.

### 10.4 Desktop Packaging (Electron)

| Item | Detail |
|------|--------|
| Entry | `electron/main.ts` → `dist-electron/main.cjs` |
| App ID | `com.shadowowner.motionstudio` |
| Product name | Shadow Motion Studio |
| Target | Windows x64 **portable** |
| Output | `release/ShadowMotionStudio-1.1.2-portable.exe` (~83 MB) |
| Unpacked | `release/win-unpacked/Shadow Motion Studio.exe` |
| User data (packaged) | `%USERPROFILE%\Documents\ShadowMotionStudio` |
| Resources | `dist/` (UI), `dist-remotion/` (bundle), compositor unpacked from asar |

Flow: Electron starts embedded Express → serves UI → Remotion render uses packaged binaries.

**Build commands:**

```bash
npm run app:build    # dist + dist-remotion + dist-electron
npm run app          # Run Electron locally
npm run package      # Portable Windows exe
```

**Known packaging notes:** Default Electron icon (no custom icon configured). Code signing skipped (no certificate). `author` / `description` fields absent in `package.json` (electron-builder warnings only).

### 10.5 Runtime Configuration

`src/lib/runtimeConfig.ts` — env overrides:

| Variable | Purpose |
|----------|---------|
| `SMS_DATA_DIR` | Base for projects, exports, data, assets |
| `REMOTION_SERVE_URL` | Prebuilt Remotion bundle path (production) |
| `REMOTION_BINARIES_DIR` | Compositor/ffmpeg directory |

---

## 11. Data And Storage Model

No database or cloud. All persistence is filesystem JSON and rendered media.

| Path | Contents |
|------|----------|
| `projects/` | Saved editor / director project JSON |
| `exports/` | Rendered video and images |
| `data/director.json` | Director settings (API key stored locally) |
| `data/voices.json` | Voice profiles |
| `data/themes.json` | Custom theme overrides |
| `data/series/` | Series memory per show |
| `data/director-packs/` | Saved generative packs |
| `data/templates/index.json` | Custom template index |
| `data/templates/custom/` | Custom `TemplateDefinition` JSON files |
| `assets/` | Reserved for user assets (no full UI yet) |

Dev: paths under repo cwd. Packaged Electron: `%USERPROFILE%\Documents\ShadowMotionStudio`.

Most user data paths are **gitignored**.

**Project shape:** template ID (or custom def), fields, theme, animation, export config, placement, optional `templateDef` for custom templates.

---

## 12. Build And Run Commands

### Development

```bash
npm install
npm run server    # Terminal 1 — API on :3456
npm run dev       # Terminal 2 — Editor on :5173 (auto-starts API if port free)
```

Gallery (static final-frame view): `http://localhost:5173/?gallery=1`

### CLI render

```bash
npm run render -- projects/my-project.json
```

### Tests

```bash
npm run test:director   # 16 tests — parseLLMJson, validation, local planner, foundation
npm run build           # TypeScript + Vite production build
```

### Desktop

```bash
npm run app:build
npm run app
npm run package         # → release/ShadowMotionStudio-1.1.2-portable.exe
```

---

## 13. Test Coverage (v1.1.2)

| File | Covers |
|------|--------|
| `src/director/parseLLMJson.test.ts` | Fence stripping, truncation salvage, prefill+embedded fence scenarios |
| `src/director/foundation.test.ts` | Plan validation, mock provider draft, asset validation |
| `src/director/local.test.ts` | Local planner/drafter, continuity, packToBatchItems |
| `src/director/templateValidation.test.ts` | validateTemplate rules, adversarial defs, sample def round-trip |

**Not covered:** Frontend components, render integration, Electron E2E, LLM live calls.

---

## 14. Current Readiness (v1.1.2)

### Ready Now

- Full editor UI with live Remotion preview
- 19 built-in templates + DynamicTemplate custom templates
- Property editor, themes, placement, animation speed, duration
- Export: WebM (transparent), MP4, PNG, JPG; multi-resolution presets
- Project save/load; batch JSON rendering; CLI render
- **The Director:** plan, draft, create custom templates, pack save, pack render
- Anthropic prompt caching + cost meter
- Custom template CRUD + sidebar integration + Template Library modal
- Local/offline Director fallback (no API key)
- Electron portable Windows build (verified build pipeline)
- Director unit tests (16 passing)
- Dev API auto-restart on source changes

### Beta-Level / Known Limitations

- **Single-user, local-only** — no accounts, cloud sync, collaboration
- **LLM JSON fragility** — planner output can still fail on truncated/fenced JSON despite prefill and salvage; falls back to local planner
- **Template create requires Anthropic** — OpenAI cannot author new `TemplateDefinition`s
- **No photographic backgrounds** — gradients, glyphs, text, motion only
- **No asset library UI** — `assets/` directory exists but no upload workflow
- **Theme editor** — API persistence exists; UI emphasizes built-in theme pick
- **Batch JSON** — requires knowing project JSON shape; example at `data/batch-example.json`
- **Windows portable only** — no macOS/Linux installer configured
- **No code signing or custom app icon** in current electron-builder config
- **Transparent WebM** — compatibility varies by NLE and player
- **Rendering** — CPU/GPU intensive; behavior varies by machine

### Not Production-SaaS Ready

No authentication, database, queue, cloud storage, job monitoring, or tenant isolation. Consistent with local creator tool positioning.

### Practical Readiness Rating

| Use case | Rating |
|----------|--------|
| Solo creator daily use | **High** |
| Director-assisted pack generation (with API key) | **Medium-high** (beta; occasional LLM parse failures) |
| Internal editor/agency beta | **Medium-high** |
| Public paid desktop release | **Medium** — needs icon, signing, QA checklist, release notes |
| Hosted web SaaS | **Low** — major backend/security/render-queue work required |

---

## 15. Strengths

- Clear niche and creator audience
- Strong, cohesive GTA-inspired visual identity
- Shared preview/export architecture (built-in + dynamic)
- Local-first project and pack ownership
- Broad built-in template coverage
- **Generative extension** without forking React per template
- Platform-aware export presets
- Batch + Director render folders
- Anthropic caching reduces repeat authoring cost
- Portable desktop build already shipping

---

## 16. Main Gaps And Risks

### Product / UX gaps

- In-app template guide and Director onboarding
- Sample Director concepts and batch JSON examples in UI
- Clearer export failure and LLM error messages for non-technical users
- Theme customization UI
- Asset upload for logos/profile images
- Custom app icon and signed installer for distribution

### Technical risks

- LLM output parsing (truncation, markdown fences) — mitigated but not eliminated
- Remotion + Electron binary path fragility on upgrades
- Local API must not be exposed to public networks
- Director `create` quality depends on model + prompt; validation rejects bad defs but UX on failure is basic
- API server reuse in dev (“API already running”) can serve stale code until manual restart — mitigated by file watcher in vite-api-plugin

---

## 17. Recommended Next Steps

### Creator readiness

- In-app template guide and Director “example concepts”
- Export troubleshooting doc (WebM transparency, NLE import)
- Sample batch JSON and Director pack walkthrough

### Product readiness

- Render progress UI and structured error codes
- Theme editor with save
- Asset library for images (if templates need logos/photos)
- Preset project examples per platform

### Distribution readiness (v1.1.x → v1.2)

- Custom application icon
- Windows smoke test checklist on clean machine
- Optional code signing
- Versioned release notes (`CHANGELOG.md`)
- Consider NSIS installer alongside portable
- macOS target (future)

### Director hardening

- Continue improving `parseLLMJson` and planner constraints (shorter intents, fewer beats)
- Integration test with mock provider for full pack → render path
- Optional image/texture element kind (future schema v2) if photographic backgrounds become a requirement

---

## 18. Version History Snapshot

| Version | Highlights |
|---------|------------|
| **1.1.2** (current) | Generative Director v4: DynamicTemplate, custom template registry, Anthropic caching, reuse/create planning, Template Library UI, CostMeter, `backgroundColors` gradients, parseLLMJson hardening, API hot-reload in dev, portable Electron build |
| Prior | 19 built-in templates, editor, export, batch, Electron packaging foundation |

**Latest release artifact:** `release/ShadowMotionStudio-1.1.2-portable.exe`

---

## 19. Overall Assessment

Shadow Motion Studio v1.1.2 is a focused, useful creator tool with a clear reason to exist. The core loop — select template, edit, preview, export — is solid. The Director adds a meaningful second loop for concept-driven multi-asset production and **runtime template authoring**, which is unusual for a local motion tool at this scale.

It is strongest as a local motion graphics generator for one creator or a small editing workflow. It is past the concept stage and into **beta-ready personal use**, with a shippable Windows portable build. Polishing LLM reliability, onboarding, icons, signing, and QA would move it toward a credible public desktop release.
