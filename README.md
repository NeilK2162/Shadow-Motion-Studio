# Shadow Motion Studio

**Version 1.1.2** · Local GTA-inspired motion graphics editor

Create cinematic cards, HUD overlays, and stingers for YouTube, Shorts, and Reels. Edit in a live preview, export MP4, transparent WebM, PNG, or JPG, and drop assets into Premiere, DaVinci Resolve, CapCut, or Final Cut.

Optional **AI Director** plans multi-beat video packs, writes on-brand copy, and can author **new custom templates** when built-ins are not enough.

---

## Table of contents

- [What you get](#what-you-get)
- [Requirements](#requirements)
- [Install and run (development)](#install-and-run-development)
- [Desktop app (Windows portable)](#desktop-app-windows-portable)
- [Editor walkthrough](#editor-walkthrough)
- [Template library](#template-library)
- [Exporting assets](#exporting-assets)
- [The Director (AI asset packs)](#the-director-ai-asset-packs)
- [Custom templates](#custom-templates)
- [Batch rendering](#batch-rendering)
- [CLI rendering](#cli-rendering)
- [Where files are saved](#where-files-are-saved)
- [Environment variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Scripts reference](#scripts-reference)
- [Further reading](#further-reading)

---

## What you get

| Feature | Description |
|---------|-------------|
| **19 built-in templates** | Mission cards, loading screens, HUD, polls, subscribe CTAs, and more |
| **Live preview** | Remotion Player — what you preview is what exports |
| **Platform presets** | YouTube 16:9, Shorts/Reels 9:16, square and portrait feed |
| **Transparent WebM** | Overlays without a solid background (for NLE compositing) |
| **Projects** | Save and reload edits as JSON |
| **Batch export** | Render many variants from one JSON file |
| **The Director** | Describe a video concept → plan → generate copy → optional auto-render |
| **Custom templates** | AI- or hand-authored layouts rendered by `DynamicTemplate` |
| **Desktop build** | Single portable `.exe` for Windows (no installer) |

Shadow Motion Studio is **local-first**: your projects, exports, and API keys stay on your machine. It is not a cloud SaaS or a full video editor — it makes **motion assets** you import elsewhere.

---

## Requirements

- **Node.js** 18+ (20+ recommended)
- **npm**
- **Windows** for the packaged portable app (dev mode works on macOS/Linux with Node)
- **Disk space** — Remotion renders use Chromium; exports can be large for 1080p/60fps video
- **Optional (Director):** OpenAI or Anthropic API key for AI planning, copy, and custom template creation

---

## Install and run (development)

```bash
git clone <your-repo-url>
cd Shadow-Motion-Studio
npm install
```

### Option A — One command (recommended)

`npm run dev` starts Vite on **http://localhost:5173** and, when port 3456 is free, auto-starts the API server. Source changes under `src/` trigger an API restart after ~600ms.

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Option B — Two terminals

Use this if you prefer separate logs or port 3456 is already in use:

```bash
# Terminal 1 — API (rendering, save/load, Director)
npm run server

# Terminal 2 — Editor UI
npm run dev
```

The editor proxies `/api` to `http://localhost:3456`. **Exports and saves require the API** to be running.

### Template gallery (static frames)

Browse all built-in templates as still previews:

```
http://localhost:5173/?gallery=1
```

---

## Desktop app (Windows portable)

Build and run without a browser tab:

```bash
npm run package
```

**Output:** `release/ShadowMotionStudio-1.1.2-portable.exe` (~83 MB)

Double-click the portable exe. The app:

- Starts an embedded API server on a random local port
- Opens the editor in an Electron window (1440×960)
- Stores your data in **`Documents\ShadowMotionStudio`** (projects, exports, Director settings, custom templates)

To run Electron from source without packaging:

```bash
npm run app:build
npm run app
```

---

## Editor walkthrough

### 1. Pick a template

Use the **left sidebar**. Templates are grouped:

- **Stingers** — wins, fails, wasted, countdown
- **Cards** — chapters, loading, quests, locations, stats
- **HUD** — wanted level, cash, status, GPS, intros, now playing
- **Engagement** — subscribe, polls

Filter by **All · YouTube · Reels · Feed**. Custom templates appear under **Custom** after you create or import them.

### 2. Preview

The **center preview** loops your animation.

| Control | What it does |
|---------|----------------|
| Format dropdown | Preview aspect ratio (16:9, 9:16, 1:1, etc.) |
| Background | Dark, transparent checkerboard, or custom color |
| Safe area | Guides for platforms that cover edges with UI |
| Replay | Restart the animation |

### 3. Edit properties

The **right panel** has four areas:

**Text** — Titles, subtitles, stats, bars, poll options, and other template-specific fields.

**Theme & animation**

- Theme preset (Shadow Owner, Cyberpunk, Luxury, Corporate, Minimal)
- Card placement (9 positions + fullscreen)
- Size / aspect / content scale
- Animation speed and duration (frames)
- **Reset Template** — restore defaults for the current template

**Export**

- **Platform preset** — one-click YouTube clip, YouTube overlay (WebM), Reels, square post, etc.
- Resolution, FPS, format (WebM / MP4 / PNG / JPG)
- **Transparent** — for WebM overlays (strip card background separately if needed)
- **Strip card background** — cleaner overlay on footage

**Project**

- **Project name** — filename for save/load
- **Save** / **Load** — writes `projects/<name>.json`
- **Export** — renders one file to `exports/`
- **Batch** — upload a JSON array of projects (see [Batch rendering](#batch-rendering))

Status text under the buttons shows save/load/export progress and output paths.

### 4. Open The Director

Click **Director** in the header (sparkle icon). A panel slides in from the right for AI-assisted packs. See [The Director](#the-director-ai-asset-packs).

---

## Template library

### Built-in templates (19)

| Group | Templates |
|-------|-----------|
| **Stingers** | Mission Passed, Mission Failed, Wasted, Countdown |
| **Cards** | Chapter Card, Loading Screen, Side Quest, Enter Location, Phone Call, Cheat Code, Weekly Stats |
| **HUD** | Wanted Level, Cash Pickup, Status HUD, GPS Route, Character Intro, Now Playing |
| **Engagement** | Subscribe Prompt, This or That |

Visual reference: `content_kit_GTA_STYLE.html` (original HTML kit the style is based on).

### Custom templates

Created by The Director (`mode: create`) or imported via **Template Library**. They use the same preview and export pipeline as built-ins but are defined as JSON (`TemplateDefinition`), not separate React components.

---

## Exporting assets

### From the editor

1. Set **Export** options (or pick a **Platform preset**).
2. Click **Export**.
3. Wait for `Rendering...` → `Exported: <path>`.

Files land in **`exports/`** with names like:

`mission-passed_youtube-landscape-20260602120000.webm`

### Supported outputs

| Format | Typical use |
|--------|-------------|
| **WebM** (VP9) | Transparent overlays when **Transparent** is checked |
| **MP4** (H.264) | Standard clips for YouTube / Reels |
| **PNG / JPG** | Single still frame |

| Resolution | Aspect |
|------------|--------|
| 1920×1080 | YouTube 16:9 |
| 1280×720 | YouTube 720p |
| 1080×1920 | Shorts / Reels 9:16 |
| 1080×1080 | Square feed |
| 1080×1350 | Portrait feed |

FPS: **30** or **60**.

### Platform presets (quick export)

| Preset | Format | Notes |
|--------|--------|-------|
| YouTube Clip | MP4 | 16:9 video |
| YouTube Overlay | WebM | Transparent overlay |
| Reels / Shorts | MP4 | 9:16 |
| Reels Overlay | WebM | Transparent 9:16 |
| Square Post | MP4 | 1:1 |

### Tips for video editors

- Use **YouTube Overlay** or **Reels Overlay** when you need alpha (transparency).
- Enable **Strip card background** if the card’s solid fill fights your footage.
- If WebM transparency looks wrong in an NLE, try re-importing with alpha interpreted, or export MP4 on a black preview background and use blend modes.

---

## The Director (AI asset packs)

The Director turns a **text concept** into a **pack** of several assets (beats), each mapped to a template with filled copy.

### Setup

1. Open **Director** from the header.
2. Under **Provider**, choose:
   - **Local (free)** — rule-based plan and copy; no API key; good for testing
   - **OpenAI** or **Anthropic** — full LLM planning and drafting
   - **Demo mode** — deterministic mock responses
3. Enter your **API key** (OpenAI or Anthropic) and click save if using a cloud provider.
4. **Anthropic is required** to **create new custom templates** (`mode: create`). OpenAI can plan and fill built-ins but not author new template JSON.

Settings persist in `data/director.json` (gitignored).

### Series continuity

Click your **series name** to open **Series Manager**:

- Episode number
- Facts: shadow users, respect total, currency strings, etc.

These facts feed the planner and copywriter so episode 5 stays consistent with episode 4.

### Generate a pack

1. Write a **concept** (e.g. *“Miami holiday pack: palm-tree vibe, sunset gradients, 4 loading screens with gangster pack names”*).
2. Choose **format target**: YouTube 16:9, Shorts 9:16, or **Both**.
3. **Mode**:
   - **Dry run** — generate plan + assets only; review before rendering
   - **Generate & render** — also runs full pack export to `exports/director-<timestamp>/`
4. Click **Generate**.

### Review the pack

| Section | Meaning |
|---------|---------|
| **Plan** | Each beat: template id, short intent, `reuse` or `create` |
| **Create panel** | Beats that will spawn **new custom templates** |
| **Asset grid** | Filled fields per asset; custom badge if new template |
| **Cost meter** | Tokens, cache hits, estimated USD (cloud providers) |

**Load saved pack** — reopen a previous run from `data/director-packs/`.

**Render all** — export every asset in the current pack (after dry-run review).

**Open in editor** — load a single asset into the main editor for tweaks.

### Example concepts

- *“Episode 12 opener: chapter card, weekly stats recap, subscribe prompt for YouTube”*
- *“Three loading screens for a Miami beach series, gangster pack titles, warm sunset colors”*
- *“Shorts pack: countdown, cash pickup ₹5000, wanted level 3 stars”*

### What The Director can and cannot do

| Can | Cannot |
|-----|--------|
| Pick built-in templates per beat | Generate photo backgrounds (palm trees, beach photos) |
| Write titles, stats, HUD copy | Replace a full NLE timeline |
| Create new JSON templates with **gradient colors** (`backgroundColors`) | Export arbitrary image files from the web |
| Save custom templates to your library | Guarantee perfect LLM JSON every time (falls back to local planner) |

Custom templates use **CSS gradients, glyphs, text, and motion** — e.g. sunset `["#ff6b35","#4a0e8f"]`, beach blues — not stock photography.

### Session budget

Default **50,000 tokens** per session (configurable in Director settings). Generation pauses if exceeded; partial packs may still be saved.

---

## Custom templates

### From The Director

When a beat uses `mode: create`, the Director authors a `TemplateDefinition`, validates it, saves to `data/templates/custom/`, and registers it in the sidebar.

### Template Library (manual management)

In the Director panel, open **Template Library** to:

- **Edit** — load into the editor
- **Duplicate** — copy with a new id
- **Export** — download JSON
- **Import** — paste or upload JSON
- **Delete** — remove from disk and index

Built-in templates are read-only in the library.

### Hand-authored JSON

Advanced users can write `TemplateDefinition` JSON (schema v1) and import it. See `src/director/templateSchema.ts` and `PROJECT_DOCUMENT.md` for element kinds, presets, and validation rules.

---

## Batch rendering

Render many projects in one request.

### From the UI

1. Prepare a JSON **array** of project objects (same shape as a saved project; partial objects are merged with defaults).
2. In the Property Editor, use **Batch** (upload file).
3. Outputs go to a timestamped folder under **`exports/`**.

### Minimal batch item example

```json
[
  {
    "template": "chapter-card",
    "fields": {
      "title": "EPISODE 12",
      "subtitle": "MIAMI HEAT"
    },
    "export": {
      "formatId": "youtube-landscape",
      "format": "mp4",
      "resolution": "1920x1080"
    }
  },
  {
    "template": "loading-screen",
    "fields": {
      "title": "LOADING",
      "tip": "Pack 1: Sunset Run"
    },
    "export": {
      "formatId": "shorts-vertical",
      "format": "mp4"
    }
  }
]
```

For custom templates, include `templateDef` and set `template` to the custom id.

---

## CLI rendering

Render a single saved project without the UI:

```bash
npm run render -- projects/my-project.json
```

Requires the same Node environment; uses `src/renderer/render-cli.ts` and writes to `exports/` via the render engine.

For batch at scale, prefer the API (`POST /api/batch`) or Director pack render while the server is running.

---

## Where files are saved

| Location | Contents |
|----------|----------|
| `projects/` | Saved editor projects (`<name>.json`) |
| `exports/` | Rendered videos and images |
| `data/director.json` | Director provider, API key, budget |
| `data/voices.json` | Voice profiles for copy tone |
| `data/series/` | Per-show continuity JSON |
| `data/director-packs/` | Saved generative packs |
| `data/templates/custom/` | Custom template definitions |
| `data/templates/index.json` | Custom template catalog |
| `data/themes.json` | Saved theme overrides (optional) |
| `assets/` | Reserved for future user assets |

**Development:** paths are under the project folder (repo root).

**Packaged Electron app:** `Documents\ShadowMotionStudio\`.

These folders are gitignored except in-repo examples — your work stays local.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `SMS_DATA_DIR` | Override base directory for projects, exports, and `data/` |
| `REMOTION_SERVE_URL` | Path to prebuilt Remotion bundle (production / Electron) |
| `REMOTION_BINARIES_DIR` | Path to compositor (`remotion.exe`, ffmpeg) |

Usually unset in development.

---

## Troubleshooting

### Export fails or “API error”

- Ensure the API is running (`npm run server` or `npm run dev` with auto-start).
- Check the status line in the Property Editor for the error message.
- First export may be slow while Chromium starts.

### Port 3456 already in use

Free the port (PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 3456 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Or run `npm run server` only after freeing the port. If another app holds the port, Vite dev may warn that the API could not start.

### Director: “Could not parse LLM JSON”

- Retry generation; the app salvages truncated JSON when possible and falls back to **Local** planner on failure.
- Use shorter concepts and fewer beats.
- Ensure you restarted dev after code updates (API hot-reload helps, but a full restart is safest).

### Director: custom templates not created

- Set provider to **Anthropic** and save a valid API key.
- `create` beats require Anthropic; OpenAI cannot author template JSON.

### Transparent WebM looks wrong in my editor

- Confirm **Transparent** was checked before export.
- Some editors need alpha interpreted on import; test in DaVinci or Premiere import settings.

### Packaged app: renders fail

- Run from the built portable exe, not an old copy.
- User data must be writable under `Documents\ShadowMotionStudio`.
- Rebuild with `npm run package` after upgrading the repo.

### Stale API after git pull

Restart `npm run dev` or stop and restart `npm run server`. The Vite plugin restarts the API when `src/` changes, but an orphaned process on 3456 may still serve old code until killed.

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Editor + auto API on :5173 / :3456 |
| `npm run server` | API only on :3456 |
| `npm run build` | Production frontend (`dist/`) |
| `npm run build:remotion` | Bundle compositions (`dist-remotion/`) |
| `npm run build:electron-main` | Build Electron main (`dist-electron/`) |
| `npm run app:build` | All production artifacts for desktop |
| `npm run app` | Run Electron locally |
| `npm run package` | Windows portable exe in `release/` |
| `npm run render -- <file.json>` | CLI single-project render |
| `npm run test:director` | Director unit tests (16 tests) |
| `npm run preview` | Preview production `dist/` in Vite |

---

## Further reading

- **[PROJECT_DOCUMENT.md](./PROJECT_DOCUMENT.md)** — Architecture, API list, readiness, schema details, and version history
- **`content_kit_GTA_STYLE.html`** — Original visual reference for the GTA-style kit

---

## License

Private project (`package.json`: `"private": true`). Use and distribution terms are defined by the repository owner.
