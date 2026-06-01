# PRD: Shadow Motion Studio (Local Creator Edition)

Version: 2.0

Owner: Neil

Platform: Desktop Browser (Localhost)

Deployment: Local Only

Target User: Single Creator

Primary Goal:
Create GTA-inspired cinematic motion graphics and overlays for YouTube videos without using After Effects.

Visual Source of Truth:
`content_kit_GTA_STYLE.html` in the repo root. Every template, color, font, dimension, and animation in this PRD is derived from that file. When this document and the HTML disagree, the HTML wins for visual fidelity. The app must reproduce those 9 cards pixel-for-pixel and then make them editable + renderable to video.

---

# Product Vision

Shadow Motion Studio is a local desktop web application that allows a creator to:

* Create branded GTA-style motion graphics
* Edit content visually (text, colors, timing)
* Preview animations in real time at 60 FPS
* Export transparent overlays (WebM with alpha) — highest priority
* Export MP4 clips and PNG/JPG stills
* Reuse and theme templates
* Batch-generate content assets from JSON

The application should feel like a dedicated creative operating system rather than a generic design tool.

---

# Success Criteria

The creator can, in **under 60 seconds**:

1. Open localhost
2. Select a template (one of 9)
3. Edit text and colors
4. Preview the animation (replayable)
5. Export a transparent WebM
6. Drop the asset directly into Premiere or DaVinci

---

# Technical Stack

Frontend:

* React 18
* TypeScript
* Vite

Styling:

* Tailwind CSS (utility layout) + CSS variables for the design tokens below
* Per-template CSS modules that mirror `content_kit_GTA_STYLE.html` exactly

Animations (preview):

* Framer Motion for orchestration where helpful
* CSS keyframes mirrored from the HTML for fidelity

Video Rendering (export):

* Remotion (`@remotion/cli`, `@remotion/renderer`)

Export Engine:

* Remotion's bundled renderer (Chromium headless) for MP4/WebM/PNG
* FFmpeg only as a post-step if needed (e.g. format muxing); Remotion ships its own ffmpeg

State:

* Zustand

Storage:

* Local JSON files on disk (`/data`, `/projects`, `/assets`)

Icons:

* Lucide React (for editor UI chrome only — card glyphs use unicode like the HTML: ✓ ✕ ◈ ⬡ ◉ ☎ ⚡ ☰)

Fonts (loaded via Google Fonts, with local fallback for offline):

* Bebas Neue — titles (`--title`)
* Oswald (300/400/600/700) — UI text (`--ui`)
* Share Tech Mono — mono labels (`--mono`)

Constraints:

* No Backend (a tiny local Node dev server is allowed ONLY to run Remotion renders and read/write `/projects`, `/data`, `/assets` — it is not a remote API)
* No Authentication
* No Database
* No Cloud Services
* No API Keys
* No Subscription Dependencies

Everything runs locally and offline after first font cache.

---

# Design System (Design Tokens)

These are copied verbatim from `content_kit_GTA_STYLE.html` `:root` and MUST be the single source of truth. Store them in `src/themes/tokens.css` and mirror them in `src/themes/tokens.ts`.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--gold` | `#e8c84a` | Primary accent, rewards, highlights |
| `--gold-dim` | `#a8902a` | Gradient start for gold bars |
| `--green` | `#3d9140` | Mission Passed base |
| `--green-bright` | `#5cbf60` | Mission Passed accent / checkmark |
| `--red` | `#b02020` | Mission Failed base |
| `--red-bright` | `#d44040` | Mission Failed accent / cross |
| `--dark0` | `#000000` | Pure black |
| `--dark1` | `#080808` | App background |
| `--dark2` | `#0f0f0f` | Panel background |
| `--dark3` | `#161616` | Stage border |
| `--dark4` | `#202020` | Borders, tracks |
| `--dark5` | `#2a2a2a` | Secondary borders |
| `--silver` | `#a0a0a0` | Hover text |
| `--text` | `#eeeeee` | Body text |
| `--dim` | `#666666` | Muted labels |
| `--dimmer` | `#333333` | Faintest text |

## Font tokens

| Token | Stack |
|---|---|
| `--title` | `'Bebas Neue', Impact, condensed, sans-serif` |
| `--ui` | `'Oswald', 'Arial Narrow', sans-serif` |
| `--mono` | `'Share Tech Mono', 'Courier New', monospace` |

## Reusable card-internal animations (CSS keyframe names, mirror exactly)

`loaderProg`, `lFill`, `popIn`, `slideUp`, `slideUp2`, `slideR`, `fadeL`, `fadeR`, `expandLine`, `scanAnim`, `flashIn`, `pulse`.

Timing/easing reference (from HTML):

* `popIn` — 0.35s ease-out, scale 0.4 → 1.15 → 1
* `slideUp` — 0.4s ease-out, translateY(18px)→0 + fade
* `slideUp2` — 0.5s/0.4s ease-out, translateY(24px)→0 + fade
* `slideR` — 0.4s ease-out, translateX(24px)→0 + fade
* `fadeL` — 0.5s ease-out, translateX(-16px)→0 + fade
* `fadeR` — 0.5s ease-out, translateX(16px)→0 + fade
* `expandLine` — 0.5s ease-out, width 0→64px
* `scanAnim` — 0.8s ease-out, scaleX(0)→1 from left
* `flashIn` — 0.4s ease-out, opacity 0→1→0.5→1
* `pulse` — 1.8s ease-in-out infinite, opacity 1↔0.2

---

# Rendering Architecture (Critical)

This is the most important design decision and the main upgrade over PRD v1.0.

## The single-source-of-truth component pattern

Each template is **one React component** rendered in two environments:

1. **Editor preview** — runs in the browser at 60 FPS for live editing.
2. **Remotion composition** — runs headless to render MP4 / WebM / PNG.

To make this work, animations must be **deterministic functions of the current frame**, not wall-clock CSS time. CSS `@keyframes` (time-based) look fine in the live preview but cannot be seeked/rendered deterministically by Remotion. Therefore:

* The card's **structure and static styling** come from shared CSS that mirrors the HTML.
* The card's **animated properties** (opacity, translate, scale, scaleX, width, color) are computed each frame from a shared timeline module using Remotion-style interpolation.
* In the editor, drive the same timeline with a `requestAnimationFrame` clock (or `@remotion/player`'s `<Player>` so the exact same component is used). **Prefer `@remotion/player` in the editor** — it guarantees preview == export.

### Recommended approach

Use `@remotion/player`'s `<Player>` inside the editor preview. The same `<Composition>` components power both preview and render. This eliminates "looks different when exported" bugs and satisfies the 60 FPS preview requirement.

## Timeline model

Define each template's animation as an ordered list of element reveals with `delaySeconds` and `durationSeconds` (taken directly from the HTML's `animation-delay` values). At render/preview time convert to frames:

```ts
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const t = frame / fps; // seconds
// e.g. an element with delay 0.45s, dur 0.4s, slideUp:
const local = clamp((t - 0.45) / 0.4, 0, 1);
const eased = easeOut(local);
const translateY = interpolate(eased, [0, 1], [18, 0]);
const opacity = eased;
```

A small `src/animations/presets.ts` exports `slideUp`, `slideUp2`, `slideR`, `fadeL`, `fadeR`, `popIn`, `expandLine`, `scanAnim`, `flashIn`, `pulse` as frame-based functions returning style objects, so every template composes them.

## Total clip duration

Each template declares a `durationInFrames`. Default export length per card = last element's (`delay + duration`) + a 1.0s hold, rounded up. Defaults below are given in seconds; multiply by FPS.

## Transparency

For transparent WebM exports, the **canvas/background is transparent** but the card itself keeps its own design (its gradient/border). The creator gets the 540×360 (or template-specific) card floating on transparency, ready to overlay. A per-export "Card background" toggle can additionally strip the card's own background fill for cards where the creator only wants text+glyph.

---

# Templates (9 total)

All dimensions, fonts, sizes, and timings below are pulled from `content_kit_GTA_STYLE.html`. Each template lists: Purpose, Canvas, Fields (with type + default), Layout, and Animation timeline (element → preset @ delay).

> Order matches the content kit tabs.

## Template 1 · Mission Passed

* **Purpose:** Win/achievement stinger.
* **Card size:** 540 × 360. Background `linear-gradient(135deg, #050f05, #030a03)`, border `1px #1a341a`.
* **Fields:**
  * `check` (string, default `✓`)
  * `titleAccent` (string, default `MISSION`) — rendered in `--green-bright`
  * `titleMain` (string, default `PASSED`)
  * `sub` (string, default `SHADOW OWNER · 20 PILOT USERS ONBOARDED`)
  * `resp` (string, default `RESPECT +250`)
  * `stats` (array of `{value,label}`, default `[{14:32,TIME},{₹4,200,EARNED},{★★★★☆,RATING}]`)
* **Layout:** centered column: scan line (top), radial green glow, check glyph (44px), title (Bebas 64px), sub (mono 11px), resp (Oswald 600, 17px gold), stat row (gap 36px; values Bebas 20px gold, labels mono 8px).
* **Animation:**
  * `scan` → scanAnim @ 0s
  * `check` → popIn @ 0s
  * `title` → slideUp @ 0.15s
  * `sub` → slideUp @ 0.30s
  * `resp` → slideUp @ 0.45s
  * `stat row` → slideUp @ 0.60s
* **Default duration:** 1.6s.

## Template 2 · Mission Failed

* **Purpose:** Loss/setback stinger.
* **Card size:** 540 × 360. Background `linear-gradient(135deg, #100404, #0a0202)`, border `1px #380e0e`.
* **Fields:**
  * `cross` (string, default `✕`)
  * `titleAccent` (default `MISSION`) — `--red-bright`
  * `titleMain` (default `FAILED`)
  * `sub` (default `UPWORK PROPOSAL #23 · CLIENT WENT DARK`)
  * `cause` (default `YOU WERE WASTED BY: BAD TIMING`)
  * `retry` (default `→ RETRY: SEND 3 MORE TODAY`)
* **Layout:** mirrors Mission Passed with red palette; adds a `cause` mono line and `retry` line (Oswald 600, 14px red).
* **Animation:** scan @ 0s, cross popIn @ 0s, title slideUp @ 0.15s, sub @ 0.30s, cause @ 0.45s, retry @ 0.60s.
* **Default duration:** 1.6s.

## Template 3 · Chapter Card

* **Purpose:** Section/chapter divider.
* **Card size:** 560 × 360. Background `linear-gradient(125deg, #0c0c18, #060608, #000)` + SVG noise grain at 0.04 opacity.
* **Fields:**
  * `num` (default `CHAPTER 01`) — gold mono, letter-spacing 5px
  * `titleLine1` (default `ENTERING`)
  * `titleLine2` (default `HYDERABAD`) — Bebas 56px
  * `csub` (default `MAIN QUEST: SHADOW OWNER · SIDE QUESTS: UNLIMITED`)
  * `badge` (default `BANJARA HILLS, TG`) — bottom-right bordered chip
* **Layout:** left-aligned, padding 44/48; num, then expanding gold line, then big title, then sub; badge bottom-right.
* **Animation:** num fadeL @ 0.1s, line expandLine @ 0.3s, title fadeL @ 0.4s, sub fadeL @ 0.6s, badge fadeR @ 0.7s.
* **Default duration:** 1.8s.

## Template 4 · Loading Screen  *(NEW — was missing in v1.0)*

* **Purpose:** GTA-style loading/transition card with skyline + progress bar + tip.
* **Card size:** 560 × 360. Background `linear-gradient(180deg, #08091a, #040510 60%, #000)`.
* **Fields:**
  * `bigText` (default `HYDERABAD`) — huge faint Bebas watermark (60px, opacity 0.06)
  * `barLabel` (default `Loading`)
  * `tip` (rich string, default `In Hyderabad, the best meetings happen over chai...`) with `<em>TIP:</em>` highlighted gold
  * `targetPct` (number, default `68`) — bar fills to this %
  * `skyline` (preset SVG skyline, editable building set later; default = HTML skyline)
* **Layout:** big watermark text centered; SVG skyline above bottom; bottom panel with bar head (label + animated %), 2px track with gold fill, tip text.
* **Animation:** `fill` width 0 → `targetPct`% over 1.8s (`lFill`); the % counter animates in sync (counter-up). Bottom panel slideUp2 @ 0s.
* **Default duration:** 2.2s.

## Template 5 · Side Quest

* **Purpose:** Offer/decision card.
* **Card size:** 480 wide, auto height. Background `--dark2`, border `1px --dark5`, left border `3px --gold`.
* **Fields:**
  * `qtag` (default `New Side Quest Available`) — prefixed with `◈`
  * `qtitle` (default `THE UPWORK CLIENT`) — Bebas 34px
  * `qdesc` (default multi-line description)
  * `rewardLabel` (default `Reward:`)
  * `rewardValue` (default `₹45,000 + Testimonial`) — Bebas 24px gold
  * `acceptLabel` (default `Accept`), `declineLabel` (default `Decline`)
* **Layout:** tag, title, desc (mono, bottom border), reward row, two buttons (gold filled / outlined).
* **Animation:** whole card slideR @ 0s.
* **Default duration:** 1.4s.

## Template 6 · Enter Location

* **Purpose:** Bottom overlay for travel/scene transitions.
* **Card size:** 480 wide. Background `rgba(5,5,5,0.92)`, top/bottom hairline borders, `backdrop-filter: blur(12px)`.
* **Fields:**
  * `eltag` (default `Now Entering`) — preceded by pulsing gold dot
  * `lname` (default `BANJARA HILLS`) — Bebas 44px
  * `lsub` (default `Hyderabad, Telangana · Hustle Zone Active`)
* **Layout:** tag with `pulse-dot`, location name, subtitle.
* **Animation:** card slideUp2 @ 0s; dot `pulse` loops infinitely (for video, loop for the clip duration).
* **Default duration:** 2.0s (so at least one full pulse cycle shows).

## Template 7 · Phone Call

* **Purpose:** Incoming-call reveal overlay.
* **Card size:** 420 wide. Background `rgba(8,8,8,0.96)`, border `1px --dark4`.
* **Fields:**
  * `ptag` (default `☎ Incoming Call`)
  * `pname` (default `UPWORK CLIENT`) — Bebas 38px
  * `prole` (default `Project Value: ₹45,000 · 2 Missed Calls Before This`)
  * `acceptLabel` (default `Accept`), `declineLabel` (default `Decline`) with green/red circular icons (✓ / ✕)
* **Layout:** centered tag, name, role (bottom border), two circular call buttons.
* **Animation:** card slideUp2 @ 0s.
* **Default duration:** 1.6s.

## Template 8 · Cheat Code

* **Purpose:** Reward/unlock flash.
* **Card size:** 440 wide. Background `--dark0`, border `1px --dark4`, gold sheen overlay.
* **Fields:**
  * `ctag` (default `⚡ Cheat Code Activated`)
  * `code` (default `HUSTLEHARD`) — Bebas 30px gold, letter-spacing 5px
  * `cdesc` (default `First Upwork payment received. The system actually works.`)
  * `creward` (default `+₹50,000 Added To Wallet`)
* **Layout:** tag, code, description, reward.
* **Animation:** card flashIn @ 0s (opacity 0→1→0.5→1).
* **Default duration:** 1.4s.

## Template 9 · Weekly Stats (Weekly Debrief)

* **Purpose:** Periodic stats recap.
* **Card size:** 540 wide. Background `#060606`, border `1px --dark4`.
* **Fields:**
  * `stitle` (default `WEEKLY DEBRIEF`), `ssub` (default `Hyderabad Arc · Week 03`)
  * `sweek` (default `May 2026 / Main Quest Active`)
  * `boxes` (array of `{label,value,change}`, default 4 boxes: Missions Done `4/6`, Cash Earned `₹82K`, Proposals Sent `12`, Shadow Users `23`)
  * `bars` (array of `{label,pct}`, default Coding 78, Hustle 62, Network 45, Content 33)
  * `stars` (number lit out of 5, default 3)
* **Layout:** header row (title block + right-aligned week), 2×2 stat box grid, labeled progress bars, star row.
* **Animation:**
  * header fadeL @ 0s
  * stat boxes stagger slideUp @ 0.1s, 0.2s, 0.3s, 0.4s
  * each bar fill animates width 0 → `pct`% (stagger 0.5s+)
  * stat box values counter-up
  * stars light sequentially
* **Default duration:** 2.4s.

---

# Editor Interface

Three-zone layout, full viewport (100% × 100vh):

```
┌─────────────┬───────────────────────────────┐
│  Templates  │        Preview Window         │
│  (sidebar)  │   (Remotion Player, replay)   │
│             │                               │
├─────────────┴───────────────────────────────┤
│              Property Editor                 │
└──────────────────────────────────────────────┘
```

## Left Sidebar — Template Picker

Lists all 9 templates with their unicode glyphs (✓ ✗ ◈ ▓ ⬡ ◉ ☎ ⚡ ☰). Clicking loads the template instantly into the preview. Styled like the HTML `.tabs` (mono 9px, gold active state).

## Center — Preview

* Uses `@remotion/player` `<Player>` → preview == export.
* Live update on every property change.
* 60 FPS playback.
* `↺ REPLAY` button (top-right, like the HTML) re-triggers the animation from frame 0.
* Resolution presets: `1920×1080`, `1080×1920`, `1080×1350`, `1280×720`.
* Background toggle: **Dark** / **Transparent** (checkerboard) / **Custom color**.

## Bottom — Property Panel

Updates instantly. Sections (dynamic per active template):

* **Text fields** — all template text fields above.
* **Color fields** — Primary, Accent, Background (default to the template's palette tokens).
* **Animation fields** — Duration, per-element Delay, global Animation Speed multiplier.
* **Export fields** — Resolution, FPS (30/60), Format (PNG/JPG/MP4/WebM), Transparency toggle.

---

# Theme System

Built-in themes (each overrides the color/font/glow tokens):

* Shadow Owner (default — the HTML gold/green/red palette)
* Cyberpunk
* Luxury
* Corporate
* Minimal

Each theme controls: Colors, Fonts, Glow intensity, Borders, Animation presets. Users can save custom themes to `/data/themes.json`.

---

# Data Model (TypeScript)

Store in `src/store` and persist as JSON. Core types:

```ts
type TemplateId =
  | 'mission-passed' | 'mission-failed' | 'chapter-card'
  | 'loading-screen' | 'side-quest' | 'enter-location'
  | 'phone-call' | 'cheat-code' | 'weekly-stats';

interface AnimationConfig {
  globalSpeed: number;            // multiplier, default 1
  durationInFrames: number;       // computed from defaults, editable
  overrides?: Record<string, { delaySeconds?: number; durationSeconds?: number }>;
}

interface ThemeTokens {
  gold: string; goldDim: string;
  green: string; greenBright: string;
  red: string; redBright: string;
  dark0: string; dark1: string; dark2: string; dark3: string; dark4: string; dark5: string;
  silver: string; text: string; dim: string; dimmer: string;
  titleFont: string; uiFont: string; monoFont: string;
}

interface Project {
  template: TemplateId;
  fields: Record<string, unknown>; // per-template field map (see Templates)
  theme: ThemeTokens;
  animation: AnimationConfig;
  export: {
    resolution: '1920x1080' | '1080x1920' | '1080x1350' | '1280x720';
    fps: 30 | 60;
    format: 'png' | 'jpg' | 'mp4' | 'webm';
    transparent: boolean;
  };
}
```

Example project JSON (`/projects/first-client.json`):

```json
{
  "template": "mission-passed",
  "fields": {
    "titleAccent": "MISSION",
    "titleMain": "PASSED",
    "sub": "FIRST AI CLIENT CLOSED",
    "resp": "RESPECT +500",
    "stats": [
      { "value": "12:04", "label": "TIME" },
      { "value": "₹50,000", "label": "EARNED" },
      { "value": "★★★★★", "label": "RATING" }
    ]
  },
  "export": { "resolution": "1920x1080", "fps": 30, "format": "webm", "transparent": true }
}
```

---

# Export System

All exports go through Remotion's renderer so output matches the preview exactly.

## Export PNG

* Single frame (default = last frame, configurable).
* Transparent background option (alpha PNG).

## Export JPG

* Single frame, opaque. For thumbnails.

## Export MP4

* Codec: H.264 (`libx264`).
* FPS: 30 or 60.
* Resolutions: 720p / 1080p / 1440p / 4K.
* Background must be opaque (use Dark or Custom color, not Transparent).

## Export Transparent WebM — HIGHEST PRIORITY

* Codec: VP9 with alpha (`yuva420p` / Remotion `codec: 'vp8'|'vp9'` with `pixelFormat: 'yuva420p'`).
* Alpha channel enabled — the canvas around the card is transparent.
* Optional "strip card background" toggle for text-only overlays.
* Validated against: Premiere Pro, DaVinci Resolve, Final Cut, OBS.

### Render mechanics

A small local Node script (invoked from the editor via the dev server) runs `@remotion/renderer` `renderMedia()` with the current `Project` JSON as `inputProps`. Output lands in `/exports`. The 1080p target is < 15s (see performance).

---

# Batch Generator

User uploads/points to a JSON array of partial `Project` objects:

```json
[
  { "template": "mission-passed", "fields": { "titleMain": "PASSED", "sub": "FIRST CLIENT" } },
  { "template": "chapter-card",  "fields": { "titleLine2": "MOVING TO PUNE" } }
]
```

System merges each entry with template defaults and renders all. Output:

* `/exports/batch-<timestamp>/` containing one video (and optional PNG) per entry.

---

# Animation Engine

Every template component exposes a frame-deterministic timeline (no wall-clock CSS for exportable motion). Logical API:

* `enterAnimation()` — frames `[0 .. lastReveal]`
* `holdAnimation()` — steady state
* `exitAnimation()` — optional fade/slide out (V1: simple fade, optional)
* `replayAnimation()` — editor seeks player back to frame 0

Animation presets live in `src/animations/presets.ts` (the frame-based `slideUp`, `popIn`, etc.). Per-template timelines live next to each template:

```
src/animations/
  presets.ts          // shared frame-based easing/style helpers
  missionPassed.ts
  missionFailed.ts
  chapterCard.ts
  loadingScreen.ts
  sideQuest.ts
  enterLocation.ts
  phoneCall.ts
  cheatCode.ts
  weeklyStats.ts
```

---

# Folder Structure

```
src/
  components/
    templates/
      MissionPassed/
      MissionFailed/
      ChapterCard/
      LoadingScreen/
      SideQuest/
      EnterLocation/
      PhoneCall/
      CheatCode/
      WeeklyStats/
    editor/
      Sidebar/
      Preview/        // wraps @remotion/player
      Properties/
  remotion/
    Root.tsx          // registers <Composition> for each template
    compositions/     // thin wrappers around the shared template components
  animations/         // presets.ts + per-template timelines
  themes/             // tokens.css, tokens.ts, built-in themes
  hooks/
  store/              // zustand
  renderer/           // local render script using @remotion/renderer
  lib/
data/                 // themes.json, settings
assets/               // logos, icons, backgrounds, sounds
projects/             // saved project JSON
exports/              // rendered output
content_kit_GTA_STYLE.html   // visual source of truth (reference)
```

---

# Performance Requirements

* Preview: 60 FPS.
* Render: 1080p export under 15 seconds.
* Memory: under 1 GB.
* Cold start: under 3 seconds.

---

# V1 Non-Goals

No Multi User · No Cloud Storage · No Team Features · No Marketplace · No AI Features · No Payments · No Authentication · No Mobile Support · No timeline/multi-clip sequencing (single card per render in V1).

---

# Future V2

AI-generated cards · Voice-synchronized animations · Multi-clip timeline editor · Story sequence builder · Auto-generated weekly reports · Motion graphic packs · Template marketplace · Editable SVG skyline builder.

---

# Build Plan for Composer 2.5 (Milestones)

Sequenced so each milestone is independently verifiable. This is the recommended order to feed Composer.

**M0 — Scaffold (foundation)**
Vite + React + TS + Tailwind + Zustand. Add Remotion + `@remotion/player`. Load the 3 fonts. Create `src/themes/tokens.css` + `tokens.ts` from the Design System table. *Done when:* blank app boots on localhost in <3s with tokens available.

**M1 — Port the 9 cards as static React components**
Translate each card from `content_kit_GTA_STYLE.html` into a component under `components/templates/*`, pixel-matching layout/colors/fonts. No animation yet (final frame state). *Done when:* a dev gallery shows all 9 cards identical to the HTML at rest.

**M2 — Frame-based animation presets + timelines**
Build `animations/presets.ts` (frame versions of slideUp, popIn, scanAnim, expandLine, flashIn, pulse, lFill, counter-up). Wire each template's timeline. *Done when:* each card animates identically to the HTML when scrubbed.

**M3 — Remotion compositions + Player preview**
Register a `<Composition>` per template in `remotion/Root.tsx`. Build the editor `Preview` around `@remotion/player` with a Replay button and resolution/background toggles. *Done when:* preview is driven by the same components that will render.

**M4 — Editor shell (sidebar + property panel + store)**
Zustand store holding the `Project`. Sidebar template picker. Dynamic property panel (text/color/animation/export fields) with instant live update. *Done when:* editing any field updates the preview in real time.

**M5 — Export pipeline**
Local render script using `@remotion/renderer`. PNG, JPG, MP4 (H.264), and **transparent WebM (VP9 alpha)**. Wire export buttons → script → `/exports`. *Done when:* a transparent WebM drops cleanly into DaVinci/Premiere with working alpha.

**M6 — Save/Load + Themes + Batch**
Save/load `Project` JSON to `/projects`. Built-in + custom themes to `/data/themes.json`. Batch generator reads a JSON array and renders all to `/exports/batch-*`. *Done when:* the full Definition of Done passes.

---

# Definition of Done

Creator can:

* Create a card (any of the 9)
* Edit all content (text + colors + timing)
* Preview the animation (replayable, 60 FPS, matches the HTML)
* Save and load a project
* Export PNG, JPG, MP4, and transparent WebM
* Generate assets in bulk from a JSON array
* Run entirely offline with no external dependencies after installation
