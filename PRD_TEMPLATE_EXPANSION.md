# PRD: Shadow Motion Studio — Template Expansion Pack (YouTube + Shorts/Reels)

Version: 2.1 (expansion / addendum to `PRD.md` v2.0)

Owner: Neil

Status: Ready for Composer 2.5 build

Depends on: The existing app described in `PRD.md` (M0–M6 complete). This document **adds** to that app. It does not replace it. When this document and the existing code disagree on conventions, the existing code wins (match the patterns already in `src/`).

---

## 0. Why this expansion exists

The base app ships 9 GTA-inspired templates aimed at **YouTube (16:9)**. This expansion does two things:

1. **Adds 10 new original templates** that increase storytelling range and viewer engagement (HUD overlays, full-screen stingers, CTAs, polls).
2. **Adds a Platform / Format system** so every template — old and new — can render for **YouTube (16:9 landscape)** *and* **Instagram Reels / YouTube Shorts / TikTok (9:16 vertical)**, plus **1:1 square** for feed posts.

> Legal note: These are **original designs inspired by the GTA HUD vocabulary** (stars, mission stingers, radar, money counters). No GTA assets, fonts, logos, sounds, exact colors, or copyrighted text are used. All copy, palettes, and proportions are our own (`content_kit_GTA_STYLE.html` remains the visual source of truth for tone/style).

---

## 1. Goals

- Give the creator a richer kit: recurring on-screen HUD elements for long-form YouTube **plus** punchy full-frame stingers built for vertical Shorts/Reels.
- Maximize watch-through and engagement: CTAs, polls, countdowns, and "moment" stingers (WASTED) that are share-friendly.
- Make **format a first-class property**: one project can be exported to 16:9 and 9:16 without re-laying-out by hand.
- Keep the build deterministic: every new animation is a frame-based function (preview == export), consistent with `src/animations/presets.ts`.

### Non-goals (unchanged from v2.0)

No multi-clip timeline, no audio, no cloud, no AI. Single card per render.

---

## 2. Platform / Format System (the core architectural addition)

This is the most important part of the expansion. Build this **before** the new templates so every template (all 19) consumes it.

### 2.1 Format presets

Add a `Format` concept. A format is a named canvas + safe-area profile.

```ts
// src/lib/formats.ts (NEW)
export type FormatId =
  | 'youtube-landscape'   // 1920 x 1080  (16:9)
  | 'youtube-720'         // 1280 x 720   (16:9, lighter export)
  | 'shorts-vertical'     // 1080 x 1920  (9:16) — Reels / Shorts / TikTok
  | 'feed-square'         // 1080 x 1080  (1:1)  — IG/FB feed
  | 'feed-portrait';      //  1080 x 1350 (4:5)  — IG feed portrait

export interface FormatPreset {
  id: FormatId;
  label: string;
  platform: 'youtube' | 'reels' | 'feed';
  width: number;
  height: number;
  /** Fraction of height to keep clear at top/bottom for platform UI (caption, buttons). */
  safeTop: number;     // e.g. 0.06
  safeBottom: number;  // e.g. 0.18 for Reels (right-rail + caption)
  safeSides: number;   // e.g. 0.05
}
```

Required presets (exact values Composer should ship):

| FormatId | Canvas | Platform | safeTop | safeBottom | safeSides |
|---|---|---|---|---|---|
| `youtube-landscape` | 1920×1080 | youtube | 0.05 | 0.08 | 0.05 |
| `youtube-720` | 1280×720 | youtube | 0.05 | 0.08 | 0.05 |
| `shorts-vertical` | 1080×1920 | reels | 0.10 | 0.18 | 0.06 |
| `feed-square` | 1080×1080 | feed | 0.06 | 0.10 | 0.06 |
| `feed-portrait` | 1080×1350 | feed | 0.06 | 0.10 | 0.06 |

> `safeBottom` for `shorts-vertical` is intentionally large (18%) because Reels/TikTok overlay the caption, audio name, and the right-hand action rail there. Anchored/HUD content must avoid that band by default.

### 2.2 Resolution additions

Extend the existing `Resolution` union and `RESOLUTION_MAP` in `src/types/index.ts`:

```ts
export type Resolution =
  | '1920x1080' | '1080x1920' | '1080x1350' | '1280x720'
  | '1080x1080'; // NEW (square)
```

Add `'1080x1080': { width: 1080, height: 1080 }` to `RESOLUTION_MAP`.

### 2.3 Placement (anchoring) system

Today every card is **centered** on the canvas. HUD elements (wanted stars top-right, status bars bottom-left, GPS bottom-left) must anchor to edges and stay correct in both 16:9 and 9:16. Add a placement enum and a shared positioning wrapper.

```ts
// src/lib/placement.ts (NEW)
export type Placement =
  | 'center'
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'fullscreen';
```

A shared `<Stage>` component places the card inside the current `FormatPreset`, respecting safe areas:

```tsx
// src/components/templates/shared/Stage.tsx (NEW)
// Wraps each template. Reads format + placement, applies absolute positioning
// with safe-area padding. 'fullscreen' stretches to the whole canvas.
interface StageProps {
  format: FormatPreset;
  placement: Placement;
  children: React.ReactNode;
}
```

Rules:
- `center` / `fullscreen` ignore safe areas (stingers can use the whole frame).
- All edge placements pad by `safeTop/safeBottom/safeSides × canvas dimension`.
- Existing 9 templates default to `center` (visual parity preserved). New HUD templates set their own default placement.

### 2.4 Orientation-aware sizing

Reuse the existing layout engine (`src/components/templates/shared/cardLayout.ts` — `sizeMultiplier`, `aspectMultiplier`, `contentScale`, `spx()`). Add **per-format size defaults** so a card that is 1.0× on YouTube can auto-bump (e.g. 1.5×) on vertical where it has more room and needs to be thumb-readable.

Extend `TemplateBaseSize`:

```ts
export interface TemplateBaseSize {
  width: number;
  height: number;
  defaultSizeMultiplier?: number;
  hasGlow?: boolean;
  autoHeight?: boolean;
  defaultPlacement?: Placement;        // NEW
  recommendedFormats?: FormatId[];     // NEW — drives the platform filter & badges
  /** Optional per-format size multiplier overrides. */
  formatSizeMultiplier?: Partial<Record<FormatId, number>>; // NEW
}
```

`getCardLayout(templateId, fields, formatId?)` gains an optional `formatId`. Resolution order for the effective size multiplier:
1. explicit `fields.sizeMultiplier`
2. `formatSizeMultiplier[formatId]`
3. `defaultSizeMultiplier`
4. global default `1.0`

### 2.5 Default clip duration & hold

HUD overlays (wanted, status, GPS, now-playing) **sit on screen**, so their default duration is longer and they must hold their end-state for the clip. Stingers (WASTED) are short. Each new template declares its own `durationSeconds` (see specs). Add an optional `holdSeconds` notion in the timeline doc only — implementation: animations already clamp to their end state, so "hold" = clip duration minus reveal time. No new code needed beyond longer default durations.

---

## 3. New animation presets

Add these to `src/animations/presets.ts`, all frame-deterministic (same signature style as existing: `(time, delay, duration, globalSpeed, ...) => MotionStyle | number`).

```ts
// slideDown — for top notifications (mirror of slideUp)
slideDown(time, delay=0, duration=0.4, globalSpeed=1, distance=18): MotionStyle
// translateY from -distance → 0, opacity 0 → 1

// slideInRight — HUD enters from right edge (mirror of fadeR but larger travel)
slideInRight(time, delay=0, duration=0.45, globalSpeed=1, distance=40): MotionStyle

// slideInLeft — HUD enters from left edge
slideInLeft(time, delay=0, duration=0.45, globalSpeed=1, distance=40): MotionStyle

// starPop(index) — helper for sequential star reveal; returns popIn with staggered delay
//   delay = baseDelay + index * stepSeconds
// (Compose from existing popIn; no new math needed.)

// impactZoom — the "WASTED" reveal: scale 1.35 → 1.0 with blur clearing + fade in
impactZoom(time, delay=0, duration=0.6, globalSpeed=1): { opacity, transform, filter }
//   opacity 0→1 over first 25%; scale interpolate(easeOut, [1.35, 1.0]);
//   filter blur(px) interpolate(easeOut, [8, 0])

// shake — short horizontal impact wobble for stingers (damped sine, settles to 0)
shake(time, delay=0, duration=0.5, globalSpeed=1, amplitude=10): MotionStyle
//   translateX = amplitude * sin(progress*Nπ) * (1-progress)

// vignettePulse — opacity ramp 0→target→hold for full-screen dark overlays
vignettePulse(time, delay=0, duration=0.3, globalSpeed=1, target=0.85): { opacity }

// radarSweep — rotating angle for the GPS/minimap sweep line (loops over the clip)
radarSweep(time, period=2.0): { transform } // rotate(((time%period)/period)*360deg)

// barCountTo — numeric counter that eases to target (alias of existing counterUp; reuse it)
```

Implementation notes:
- `impactZoom.filter` and `.transform` must be returned and applied; extend `applyMotionStyle` to pass through `filter` if present (add `filter?: string` to `MotionStyle`).
- `shake` must fully settle to `translateX(0)` by `progress=1` so the hold frame is stable for stills/export.
- All new presets clamp at end state (no infinite motion **except** `radarSweep` and the existing `pulse`, which are intentionally looping and fine because they're periodic — they still render deterministically per frame).

---

## 4. New Templates (10)

Conventions for every spec below mirror the existing templates: one React component under `src/components/templates/<Name>/`, a timeline file under `src/animations/`, defaults in `src/data/templateDefaults.ts`, registration in `src/types/index.ts` (`TemplateId`, `TEMPLATE_META`) and `cardLayout.ts` (`TEMPLATE_BASE_SIZES`). Every template includes the universal layout fields (`sizeMultiplier`, `aspectMultiplier`, `contentScale`, and glow fields where relevant) already standardized in `LAYOUT`.

Palette tokens referenced: `--gold #e8c84a`, `--green-bright #5cbf60`, `--red-bright #d44040`, `--dark0..5`, `--text`, `--dim`. Fonts: `--title` (Bebas Neue), `--ui` (Oswald), `--mono` (Share Tech Mono).

### Group A — YouTube-first HUD & cinematic (landscape default, format-adaptable)

---

#### Template 10 · Wanted Level  `wanted-level`  glyph `✪`

- **Purpose:** Rising-stakes indicator. "Things just got serious." Great for tension beats and as a recurring HUD.
- **Recommended formats:** all. **Default placement:** `top-right`.
- **Base size:** 300 × 90 (auto width by star count). **No glow.**
- **Fields:**
  - `wtag` (string, default `WANTED`) — mono, gold, letter-spacing 4px
  - `stars` (number 0–6, default `3`) — lit stars
  - `maxStars` (number, default `5`)
  - `litChar` (string, default `★`), `dimChar` (string, default `☆`)
  - `flashOnGain` (boolean, default `true`) — newly gained stars `flashIn`
- **Layout:** small mono label row on top; below it a row of star glyphs (Bebas/!symbol 26px). Lit stars `--gold`, dim stars `--dimmer`. Optional thin top border.
- **Animation:** label `slideInRight` @ 0s; stars `starPop` staggered (`popIn`, step 0.12s) for indices `0..stars-1`; dim stars fade in @ 0s. Lit stars hold; last gained star may keep a subtle `pulse`.
- **Default duration:** 2.8s (it lingers).

---

#### Template 11 · Cash Pickup  `cash-pickup`  glyph `$`

- **Purpose:** Money/score reveal — revenue, savings, milestone earnings. The "+$$$ counts up" moment.
- **Recommended formats:** all. **Default placement:** `top-right` (HUD) — but reads great `center` on vertical.
- **Base size:** 340 × 110. **No glow** (subtle gold text-shadow only).
- **Fields:**
  - `amountPrefix` (string, default `₹`)
  - `amount` (number, default `50000`) — counts up
  - `delta` (string, default `+₹50,000`) — the green/red change chip; color by sign
  - `label` (string, default `WALLET`) — mono caption above
  - `positive` (boolean, default `true`) — green if true, red if false
- **Layout:** mono label (top, dim); big counter (Bebas 48px, gold) that animates 0 → `amount` via `counterUp`; small delta chip beneath (Oswald 600, green `#5cbf60` / red `#d44040`).
- **Animation:** container `slideDown` @ 0s; counter `counterUp` over 1.2s; delta chip `slideUp` @ 0.3s; brief gold `flashIn` on the counter at completion (optional).
- **Default duration:** 2.2s.

---

#### Template 12 · Status HUD  `status-hud`  glyph `▮`

- **Purpose:** Health/Armor/Energy-style stat bars. Map to anything (Focus, Budget, Momentum). Recurring corner HUD.
- **Recommended formats:** `youtube-landscape`, `youtube-720`, `shorts-vertical`. **Default placement:** `bottom-left`.
- **Base size:** 320 × 140 (auto height by bar count). **No glow.**
- **Fields:**
  - `bars` (array of `{ label, pct, color }`, default:
    `[{label:'HEALTH',pct:82,color:'#5cbf60'},{label:'ARMOR',pct:64,color:'#e8c84a'},{label:'ENERGY',pct:48,color:'#d44040'}]`)
  - `showPct` (boolean, default `true`)
- **Layout:** stacked rows; each row = tiny mono label (left), thin 4px track (`--dark4`) with colored fill, optional `%` (mono, right). GTA-style segmented look optional (small gaps in fill).
- **Animation:** each bar fill animates width 0 → `pct`% via `lFill` (reuse), staggered 0.12s per bar; labels `slideInLeft` @ 0s; `%` numbers `counterUp` in sync.
- **Default duration:** 2.6s.

---

#### Template 13 · GPS Route  `gps-route`  glyph `◎`

- **Purpose:** "Next destination / next step" waypoint banner with a small radar/minimap motif. Use for journey/roadmap beats.
- **Recommended formats:** `youtube-landscape`, `youtube-720`, `shorts-vertical`. **Default placement:** `bottom-left`.
- **Base size:** 380 × 120. **No glow.**
- **Fields:**
  - `gtag` (string, default `ROUTE SET`) — mono gold
  - `dest` (string, default `NEXT: FIRST 1,000 SUBS`) — Bebas 30px
  - `distance` (string, default `2.4 KM · 6 MIN`) — mono dim
  - `showRadar` (boolean, default `true`)
- **Layout:** left = small circular radar (ring + sweeping line + center dot + a waypoint blip); right = tag, destination, distance stacked. Hairline borders top/bottom, translucent dark bg, `backdrop-filter: blur(10px)`.
- **Animation:** banner `slideInLeft` @ 0s; radar `radarSweep` loops; waypoint blip `pulse`; text rows `fadeL` staggered 0.1/0.2/0.3s.
- **Default duration:** 3.0s.

---

#### Template 14 · Character Intro  `character-intro`  glyph `◧`

- **Purpose:** Lower-third name tag to introduce a person/guest/alias (GTA character-card vibe). Great for interviews, intros, "meet the…".
- **Recommended formats:** all. **Default placement:** `bottom-left` (16:9) / `bottom-center` (vertical).
- **Base size:** 460 × 150. **No glow.**
- **Fields:**
  - `name` (string, default `THE SHADOW OWNER`) — Bebas 46px
  - `role` (string, default `Founder · Builder · Operator`) — Oswald, `--text`
  - `tag` (string, default `NOW INTRODUCING`) — mono gold caption
  - `accentColor` (string, default `--gold`) — left accent bar color
- **Layout:** thick left accent bar (`spx(4)`); caption (mono, top), name (Bebas), role (Oswald). Animated underline (`expandLine`) under the name.
- **Animation:** accent bar `scanAnim` (scaleY variant — or reuse scaleX rotated; spec: bar height grows 0→full) @ 0s; caption `fadeL` @ 0.1s; name `slideUp` @ 0.2s; underline `expandLine` @ 0.35s; role `fadeL` @ 0.45s.
- **Default duration:** 2.8s.

---

#### Template 15 · Now Playing  `now-playing`  glyph `♫`

- **Purpose:** Radio "now playing" bar — set the mood, label background music, or brand a recurring segment.
- **Recommended formats:** all. **Default placement:** `bottom-center`.
- **Base size:** 420 × 90. **No glow.**
- **Fields:**
  - `station` (string, default `SHADOW FM 101.1`) — mono gold
  - `track` (string, default `Hustle Theme — Late Nights`) — Oswald, `--text`
  - `showEq` (boolean, default `true`) — animated equalizer bars
- **Layout:** left = small animated EQ (4–5 vertical bars); center = station (small) + track (larger); subtle scrolling marquee optional for long track names. Translucent pill background, hairline border.
- **Animation:** bar `slideUp2` @ 0s; EQ bars animate via per-bar sine on `time` (deterministic: `height = base + amp*abs(sin(time*speed + i))`); track text `fadeL` @ 0.2s.
- **Default duration:** 3.2s.

### Group B — Shorts/Reels-first full-frame stingers & engagement (vertical default)

---

#### Template 16 · Wasted  `wasted`  glyph `☠`

- **Purpose:** The iconic full-screen "you failed / it's over" stinger. Maximum drama, maximum shareability. Our original take.
- **Recommended formats:** all. **Default placement:** `fullscreen`. **(Most-used on vertical.)**
- **Base size:** fills frame (fullscreen). **Has glow** (red radial behind text).
- **Fields:**
  - `bigText` (string, default `WASTED`) — Bebas, huge, `--text` near-white with red glow
  - `sub` (string, default `YOU LET THE STREAK DIE`) — mono, dim
  - `overlayOpacity` (number, default `0.88`) — darkness of full-screen wash
  - `desaturate` (boolean, default `true`) — visual hint for the dark grade
- **Layout:** full-frame dark wash (`vignettePulse` to `overlayOpacity`), centered radial red glow, giant centered title, subtitle below. Vertical: title can be 2 lines / larger.
- **Animation:** wash `vignettePulse` @ 0s; title `impactZoom` @ 0.15s + `shake` @ 0.15s; red glow `flashIn`; subtitle `slideUp` @ 0.6s. Hold to end.
- **Default duration:** 2.4s.

---

#### Template 17 · Subscribe Prompt  `subscribe-prompt`  glyph `➤`

- **Purpose:** Channel-growth CTA styled as a GTA mission-notification. Subscribe / Follow / Like. Built to convert on Shorts.
- **Recommended formats:** all. **Default placement:** `bottom-center` (16:9) / `center` (vertical).
- **Base size:** 480 × 180. **Subtle gold glow.**
- **Fields:**
  - `headline` (string, default `NEW OBJECTIVE`) — mono gold caption
  - `action` (string, default `SUBSCRIBE`) — Bebas 44px
  - `desc` (string, default `Join the crew. New mission every week.`) — Oswald
  - `reward` (string, default `+1 RESPECT`) — gold chip, like a reward line
  - `cta` (string, default `TAP THE BELL`) — pulsing prompt
  - `pulseCta` (boolean, default `true`)
- **Layout:** left gold accent; caption, big action word, description, reward chip; bottom a pulsing `cta` row with a bell/➤ glyph. Gold sheen overlay (reuse cheat-code styling).
- **Animation:** card `slideUp2` @ 0s; action `popIn` @ 0.15s; desc `slideUp` @ 0.3s; reward chip `flashIn` @ 0.5s; `cta` row `pulse` loop.
- **Default duration:** 3.0s.

---

#### Template 18 · Countdown  `countdown`  glyph `◷`

- **Purpose:** "Starts in 3… 2… 1…" / launch / drop countdown. Builds anticipation, boosts retention at the open of a Short.
- **Recommended formats:** all. **Default placement:** `center`.
- **Base size:** 360 × 360 (square-ish). **Has glow** (gold ring glow).
- **Fields:**
  - `from` (number, default `3`) — counts down `from → 1`
  - `goText` (string, default `GO`) — shown after 1
  - `caption` (string, default `MISSION STARTS IN`) — mono gold above
  - `showRing` (boolean, default `true`) — sweeping progress ring per second
- **Layout:** caption on top; giant centered number (Bebas, 140px) inside an animated ring; `goText` replaces the number on the final beat with a `flashIn`/`impactZoom`.
- **Animation:** Number is derived from `time`: `current = max(goText-phase, from - floor(time))`. Each integer change triggers a `popIn` (re-keyed by value) and the ring does one `radarSweep`/`lFill` per second. On reaching 0 → show `goText` with `impactZoom`.
- **Default duration:** `from + 1`s (e.g. 4.0s for `from:3`). Duration must follow `from`.

---

#### Template 19 · This or That  `this-or-that`  glyph `⚖`

- **Purpose:** Engagement poll / decision card. "Comment your pick." Drives comments + watch time on Shorts. Also reusable as the existing decision motif (Accept/Decline) but as a 50/50 split.
- **Recommended formats:** `shorts-vertical`, `feed-square`, `feed-portrait`, `youtube-landscape`. **Default placement:** `center`.
- **Base size:** 520 × 300 (vertical: taller, options stack). **No glow.**
- **Fields:**
  - `question` (string, default `WHICH PATH?`) — Bebas 36px
  - `prompt` (string, default `Comment A or B 👇`) — Oswald dim
  - `optionA` (object `{ key, label, pct }`, default `{key:'A', label:'GO ALL IN', pct:62}`)
  - `optionB` (object `{ key, label, pct }`, default `{key:'B', label:'PLAY IT SAFE', pct:38}`)
  - `showPct` (boolean, default `true`) — show vote bars/percentages
  - `splitOrientation` (`'horizontal' | 'vertical'`, default by format: horizontal for 16:9, vertical stack for 9:16)
- **Layout:** question top; two option panels (A gold-accented, B red/silver-accented) split 50/50 with a center "VS" divider; each panel shows key badge, label, and an optional fill bar to `pct` with `%`.
- **Animation:** question `slideUp` @ 0s; panel A `slideInLeft` @ 0.15s; panel B `slideInRight` @ 0.15s; "VS" `popIn` @ 0.3s; bars `lFill` @ 0.5s with `counterUp` on `%`.
- **Default duration:** 3.0s.

---

## 5. Concrete data-model changes

### 5.1 `src/types/index.ts`

```ts
export type TemplateId =
  // existing 9
  | 'mission-passed' | 'mission-failed' | 'chapter-card' | 'loading-screen'
  | 'side-quest' | 'enter-location' | 'phone-call' | 'cheat-code' | 'weekly-stats'
  // NEW 10
  | 'wanted-level' | 'cash-pickup' | 'status-hud' | 'gps-route'
  | 'character-intro' | 'now-playing' | 'wasted' | 'subscribe-prompt'
  | 'countdown' | 'this-or-that';

export type Resolution =
  | '1920x1080' | '1080x1920' | '1080x1350' | '1280x720' | '1080x1080';
```

Add to `RESOLUTION_MAP`: `'1080x1080': { width: 1080, height: 1080 }`.

Extend `ExportConfig` with the active format (so export knows the canvas):

```ts
export interface ExportConfig {
  resolution: Resolution;
  fps: 30 | 60;
  format: ExportFormat;     // file format (png/jpg/mp4/webm) — keep name
  transparent: boolean;
  stripCardBackground?: boolean;
  formatId?: FormatId;      // NEW — platform/canvas preset (see formats.ts)
}
```

Add new shared field interfaces used by the templates:

```ts
export interface StatusBar { label: string; pct: number; color: string; }
export interface PollOption { key: string; label: string; pct: number; }
```

Add `defaultPlacement`, `recommendedFormats`, `compositionWidth/Height` for each new entry in `TEMPLATE_META` (HUD templates still default `compositionWidth/Height` to 1920×1080; the format system overrides canvas at render time).

### 5.2 `src/components/templates/shared/cardLayout.ts`

- Add the 10 new entries to `TEMPLATE_BASE_SIZES` with the base sizes, `defaultPlacement`, `recommendedFormats`, and `hasGlow` per the specs above (wanted/status/gps/cash/character/now-playing → `hasGlow:false`; wasted/countdown → `hasGlow:true`; subscribe → subtle).
- Add optional `formatId` param to `getCardLayout` and the `formatSizeMultiplier` resolution step (§2.4). Sensible vertical bumps, e.g. `wasted` 1.0 landscape / 1.4 vertical; `countdown` 1.0 / 1.3; `wanted-level` 1.0 / 1.25.

### 5.3 `src/data/templateDefaults.ts`

Add a `TemplateDefaults` entry per new template using the field defaults in §4, each spreading the shared `...LAYOUT` (and `...MISSION_LAYOUT`-style glow where `hasGlow`). Durations per spec.

### 5.4 New files

```
src/lib/formats.ts                         // FormatPreset registry + helpers
src/lib/placement.ts                       // Placement type + anchor math
src/components/templates/shared/Stage.tsx   // format + placement wrapper
src/components/templates/WantedLevel/
src/components/templates/CashPickup/
src/components/templates/StatusHud/
src/components/templates/GpsRoute/
src/components/templates/CharacterIntro/
src/components/templates/NowPlaying/
src/components/templates/Wasted/
src/components/templates/SubscribePrompt/
src/components/templates/Countdown/
src/components/templates/ThisOrThat/
src/animations/{wantedLevel,cashPickup,statusHud,gpsRoute,characterIntro,nowPlaying,wasted,subscribePrompt,countdown,thisOrThat}.ts
```

Each template component follows the exact pattern of `SideQuest.tsx`: `useTemplateTime(globalSpeed)`, `getCardLayout(id, fields, formatId)`, `spx(base, s)` for all pixel values, `themeVars(theme)`, `getField(...)` for every field, `stripCardBackground` support, wrapped in `<Stage>`.

---

## 6. Editor / UI changes

### 6.1 Format switcher (Preview header)

Add a **Format** dropdown next to the existing resolution/background toggles:
`YouTube 16:9` · `Shorts/Reels 9:16` · `Square 1:1` · `Feed 4:5` · `YouTube 720p`.

- Switching format changes the `<Player>` `compositionWidth/Height` (and the scaled display container in `Preview.tsx`) and passes `formatId` to the composition `inputProps`.
- Preview must re-fit (the existing `displayW/displayH` scaling logic) so vertical doesn't overflow the layout.

### 6.2 Safe-area guides

A toggle (default on for non-YouTube formats) overlays translucent guide bands for `safeTop/safeBottom/safeSides` so the creator keeps content clear of platform UI. Guides are preview-only (never rendered to export).

### 6.3 Placement control in Properties

In `renderLayoutFields()` (Properties panel), add a **Placement** dropdown (the `Placement` enum) for every template, defaulting to the template's `defaultPlacement`. Keep the existing Size/Aspect/Content/Glow controls.

### 6.4 Sidebar: platform filtering + sections

- Add the 10 new glyphs/labels to the sidebar.
- Group the picker into sections: **Stingers**, **HUD**, **Cards**, **Engagement** (or filter chips: All / YouTube / Shorts). Filter by `recommendedFormats` vs the active format. Non-recommended templates still selectable (just de-emphasized).

### 6.5 New field editors in Properties

The dynamic property panel must support the new structured fields (it already handles arrays for `stats/boxes/bars`):
- `bars: StatusBar[]` (label, pct, color picker per row) — status-hud
- `optionA/optionB: PollOption` (key, label, pct) — this-or-that
- number fields with min/max for `stars`, `from`, `amount`, `pct`
- boolean toggles for `showRadar`, `showEq`, `pulseCta`, `showRing`, `showPct`, `positive`, `desaturate`

---

## 7. Export changes

- **Square + vertical exports:** export must read `formatId`/`resolution` and render the correct canvas. Add `1080x1080`. Confirm transparent WebM still works at 1080×1920 and 1080×1080.
- **Platform export presets (convenience):** one-click presets that set resolution + fps + format together:
  - *YouTube clip* → 1920×1080, 30fps, mp4
  - *YouTube overlay* → 1920×1080, 30fps, transparent webm
  - *Reels/Shorts* → 1080×1920, 30fps, mp4 (and a transparent-webm variant)
  - *Square post* → 1080×1080, 30fps, mp4
- **Batch generator:** allow each entry to specify `formatId`/`export` so one JSON can fan out the same content to YouTube + Shorts. Output folders stay `/exports/batch-<timestamp>/`, with filename suffixes per format (e.g. `wasted_9x16.webm`, `wasted_16x9.mp4`).
- **HUD-overlay durations:** longer defaults (2.6–3.2s) mean the renderer must respect each template's `durationSeconds` (already does via `getDefaultDurationSeconds`). Verify `durationInFrames` recomputes when format/fps change.

---

## 8. Build plan for Composer 2.5 (continues M0–M6)

Each milestone is independently verifiable. Feed in order.

**M7 — Platform/Format foundation**
Add `src/lib/formats.ts`, `src/lib/placement.ts`, `Stage.tsx`. Extend `Resolution`/`RESOLUTION_MAP` (+`1080x1080`), `ExportConfig.formatId`, `cardLayout` (`formatId` param + `formatSizeMultiplier`, `defaultPlacement`, `recommendedFormats`). Retrofit the **existing 9** templates to render inside `<Stage>` with `placement:'center'`.
*Done when:* all 9 existing templates render correctly in 16:9, 9:16, 1:1 with no layout regressions, switchable from a Format dropdown in Preview.

**M8 — New animation presets**
Add `slideDown`, `slideInLeft/Right`, `impactZoom` (+`filter` passthrough in `applyMotionStyle`), `shake`, `vignettePulse`, `radarSweep`, `starPop` helper. Unit-scrub each.
*Done when:* each preset is frame-deterministic and settles to a stable end-state (except intentional loopers).

**M9 — YouTube HUD templates (Group A: 6)**
Build `wanted-level`, `cash-pickup`, `status-hud`, `gps-route`, `character-intro`, `now-playing` with their timelines, defaults, base sizes, default placements, and Properties editors (incl. `StatusBar[]`).
*Done when:* all 6 render + animate correctly in 16:9 and 9:16, anchored via `<Stage>`, fully editable.

**M10 — Shorts/Reels templates (Group B: 4) + format export presets**
Build `wasted`, `subscribe-prompt`, `countdown`, `this-or-that`. Add the safe-area guide overlay, the platform export presets, and batch multi-format fan-out.
*Done when:* a creator can pick `wasted`, switch to Shorts 9:16, see safe-area guides, and export a clean 1080×1920 mp4 (and transparent webm), plus a 1920×1080 version of the same project.

---

## 9. Definition of Done (expansion)

The creator can:

- Switch any template between **YouTube 16:9, Shorts/Reels 9:16, Square 1:1, Feed 4:5** from one control, with safe-area guides on vertical.
- Use all **19 templates** (9 original + 10 new), each with size/aspect/content-scale/placement controls.
- Build engagement moments: a **WASTED** stinger, a **Subscribe** CTA, a **Countdown**, and a **This or That** poll — designed for vertical.
- Add recurring HUD to long-form: **Wanted Level**, **Cash Pickup**, **Status HUD**, **GPS Route**, **Character Intro**, **Now Playing**.
- Export each to the correct platform canvas (incl. transparent WebM overlays), and batch one JSON into both 16:9 and 9:16 outputs.
- Everything stays offline, frame-deterministic, and preview == export.

---

## 10. Quick reference — new template table

| # | Id | Glyph | Group | Default placement | Default formats | Glow | Dur (s) |
|---|---|---|---|---|---|---|---|
| 10 | `wanted-level` | ✪ | HUD | top-right | all | no | 2.8 |
| 11 | `cash-pickup` | $ | HUD | top-right | all | no | 2.2 |
| 12 | `status-hud` | ▮ | HUD | bottom-left | yt + vertical | no | 2.6 |
| 13 | `gps-route` | ◎ | HUD | bottom-left | yt + vertical | no | 3.0 |
| 14 | `character-intro` | ◧ | Lower-third | bottom-left/center | all | no | 2.8 |
| 15 | `now-playing` | ♫ | HUD | bottom-center | all | no | 3.2 |
| 16 | `wasted` | ☠ | Stinger | fullscreen | all (vertical★) | yes | 2.4 |
| 17 | `subscribe-prompt` | ➤ | CTA | bottom-center/center | all | subtle | 3.0 |
| 18 | `countdown` | ◷ | Stinger | center | all | yes | from+1 |
| 19 | `this-or-that` | ⚖ | Engagement | center | vertical★ + yt | no | 3.0 |

★ = primary platform.
