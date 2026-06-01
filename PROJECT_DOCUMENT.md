# Shadow Motion Studio Project Document

Version reviewed: 1.1.2  
Project type: Local creator tool, motion graphics editor, Remotion renderer, Electron desktop app  
Primary audience: Solo creators, YouTubers, Shorts/Reels editors, founder-led content teams

## 1. Executive Summary

Shadow Motion Studio is a local-first motion graphics studio for creators who want high-impact, GTA-inspired video assets without opening After Effects or relying on cloud design tools. It gives a creator a library of animated templates, a live preview editor, project save/load, platform export presets, and direct rendering to video, still image, or transparent overlay formats.

The product is built for fast creator workflows: pick a template, change the text and styling, preview the animation, export it, and drop the rendered asset into a video editor such as Premiere Pro, DaVinci Resolve, CapCut, or Final Cut.

The current implementation is more than a static prototype. It includes a React editor, deterministic Remotion compositions, a local Express API, batch rendering from JSON, project persistence, Electron packaging, and Windows portable build configuration. It is best described as a local creator edition that is ready for serious personal use and beta-level use by other creators.

## 2. What The Project Is For

Shadow Motion Studio exists to help creators produce repeatable cinematic motion graphics quickly.

The project is especially useful for creators who make:

- YouTube intros, chapter cards, transition cards, punchlines, and recap moments.
- Shorts/Reels overlays, countdowns, engagement prompts, and creator-branded HUD elements.
- Founder journey videos, challenge series, productivity vlogs, gaming-style edits, or business storytelling content.
- Repeatable social content where the same visual format needs new text every day or week.
- Transparent overlays that can sit on top of existing footage.

The product does not try to replace a full nonlinear video editor. It focuses on making branded motion assets that can be inserted into a larger editing workflow.

## 3. Creator Problem

Creators often need animated graphics but face several common problems:

- After Effects is powerful but slow for simple repeatable edits.
- Template marketplaces are not tailored to a creator's exact brand language.
- Browser-based design tools may not export transparent video reliably or may depend on subscriptions.
- Making the same asset in multiple aspect ratios is repetitive.
- Batch production of many personalized cards is difficult without automation.

Shadow Motion Studio solves this by turning a fixed creator visual language into editable, exportable templates.

## 4. Product Positioning

Shadow Motion Studio is a local, creator-owned motion asset generator.

It sits between:

- A design tool, because creators edit copy, themes, layout, and export settings visually.
- A motion graphics renderer, because Remotion renders actual video/still outputs.
- A desktop utility, because Electron packages the app into a portable Windows build.
- A lightweight production pipeline, because JSON batch rendering can generate many assets from structured data.

The intended feel is not "generic Canva clone." The product is designed as a focused creative operating system for a specific creator style.

## 5. Core Value For Creators

The main value is speed plus consistency.

A creator can build a recognizable visual language once, then reuse it across many videos and platforms. The templates are not isolated mockups; they are wired into live preview and export. This means the asset a creator sees in the editor is the same composition used by the renderer.

Creator benefits:

- Fast creation of branded cinematic cards and overlays.
- Lower dependency on After Effects for routine motion graphics.
- Consistent style across YouTube, Shorts, Reels, and feed posts.
- Transparent WebM overlays for professional video editing workflows.
- Local ownership of project files and outputs.
- Batch rendering for repeated content formats.

## 6. Current Product Surface

The current app includes four main user-facing areas.

### Template Sidebar

The sidebar lists available templates and groups them by creative purpose:

- Stingers
- HUD
- Cards
- Engagement

Creators can filter templates by target platform:

- All
- YouTube
- Reels
- Feed

Templates also understand recommended formats, so creators can see which templates fit a platform preset best.

### Live Preview

The preview area uses Remotion Player to render the active template in the browser. It supports:

- Auto-playing looping preview.
- Replay button.
- Platform format switching.
- Preview background mode: dark, transparent checkerboard, or custom color.
- Safe area guides for formats where UI overlays matter.
- Resolution-aware scaling so large exports can be previewed inside the editor.

### Property Editor

The property editor lets creators change:

- Template text and numbers.
- Template-specific structured fields such as stats, bars, poll options, and stars.
- Card layout and placement.
- Size multiplier, aspect multiplier, and content scale.
- Glow settings where supported.
- Theme.
- Animation speed.
- Duration in frames.
- Export resolution, FPS, file format, and transparency.
- Whether to strip the card background for cleaner overlays.

### Project And Batch Tools

The editor supports:

- Saving projects as local JSON.
- Loading projects by name.
- Exporting the current project.
- Uploading a batch JSON file to render many assets at once.

## 7. Template Library

The current codebase defines 19 templates.

### Stingers

- Mission Passed: achievement or success moment.
- Mission Failed: failure, retry, or lesson moment.
- Wasted: dramatic loss/failure punchline.
- Countdown: countdown before a reveal, launch, or challenge.

### Cards

- Chapter Card: segment opener or location/title card.
- Loading Screen: loading/tip screen between scenes.
- Side Quest: task, opportunity, or new objective card.
- Enter Location: location reveal or scene transition.
- Phone Call: incoming call or client/opportunity moment.
- Cheat Code: unlock, hack, shortcut, or breakthrough.
- Weekly Stats: recap, progress report, or creator dashboard.

### HUD

- Wanted Level: intensity, heat, risk, or hype meter.
- Cash Pickup: revenue, win, donation, sale, or points gain.
- Status HUD: health/energy/progress style overlay.
- GPS Route: route, next goal, or destination.
- Character Intro: personality, guest, founder, or role reveal.
- Now Playing: music/radio/station style overlay.

### Engagement

- Subscribe Prompt: call-to-action overlay.
- This Or That: poll, choice, or comment prompt.

These templates make the tool suitable for both narrative video edits and creator growth content.

## 8. Export Capabilities

The app supports both visual export controls and programmatic rendering.

Supported output formats:

- WebM, including transparent overlay workflows.
- MP4 for standard video clips.
- PNG for still frames.
- JPG for still frames.

Supported resolutions:

- 1920x1080 for YouTube 16:9.
- 1280x720 for YouTube 720p.
- 1080x1920 for Shorts/Reels 9:16.
- 1080x1080 for square feed posts.
- 1080x1350 for portrait feed posts.

Supported FPS:

- 30 FPS.
- 60 FPS.

Platform export presets include:

- YouTube Clip as MP4.
- YouTube Overlay as WebM.
- Reels/Shorts as MP4.
- Reels Overlay as WebM.
- Square Post as MP4.

The renderer names outputs with template and format suffixes, making exported files easier to identify.

## 9. Creator Use Cases

### YouTube Long-Form Creator

A creator making weekly YouTube videos can use Shadow Motion Studio to generate intro cards, chapter cards, mission-complete moments, status overlays, and end-screen subscribe prompts. The transparent WebM exports are especially useful because they can be layered over existing footage.

### Shorts And Reels Creator

A vertical creator can use the 9:16 presets to create countdowns, poll prompts, character intros, GPS route moments, and high-energy CTA overlays. Safe area preview helps avoid placing key content where platform UI may cover it.

### Founder Or Builder In Public

The default content language is especially aligned with founder journey storytelling: missions, clients, progress, cash pickups, weekly stats, and side quests. This makes it useful for documenting business progress in a more cinematic way.

### Gaming-Style Storytelling

The GTA-inspired aesthetic supports achievement cards, failure cards, wanted levels, HUD bars, route indicators, and location cards. This is useful even for non-gaming content that wants gaming-style pacing and visual energy.

### Agency Or Editor Workflow

An editor can prepare batch JSON files to generate many variations of the same asset: multiple client cards, episode chapters, poll prompts, weekly recaps, or social platform variants.

### Content System Builder

Because projects are structured JSON and rendering can be automated, Shadow Motion Studio can become part of a larger content system where scripts generate asset data and the renderer outputs finished clips.

## 10. Technical Architecture

The project is built around one important principle: the same React template components power both preview and export.

### Frontend

The editor is built with:

- React 18.
- TypeScript.
- Vite.
- Tailwind CSS.
- Zustand for editor state.
- Remotion Player for live preview.
- Lucide React for editor UI icons.

Key frontend areas:

- `src/components/editor`: editor shell, sidebar, preview, and property controls.
- `src/components/templates`: all template components.
- `src/store/editorStore.ts`: editor project state and user actions.
- `src/types/index.ts`: project, template, export, and metadata types.
- `src/data/templateDefaults.ts`: default fields and durations.

### Rendering

Rendering is powered by Remotion.

Key rendering areas:

- `src/remotion/TemplateComposition.tsx`: shared composition wrapper.
- `src/remotion/inputProps.ts`: conversion between editor projects and Remotion input props.
- `src/renderer/render.ts`: export engine for stills, video, batch rendering, and browser reuse.
- `src/renderer/render-cli.ts`: CLI renderer for project JSON files.

The renderer reuses a single headless Chromium browser where possible. This improves short export performance because browser startup is often the slowest part of rendering small clips.

### Local API

The app includes a local Express server for file access and rendering.

Main API capabilities:

- `POST /api/export`: render the current project.
- `POST /api/batch`: render multiple project variants.
- `POST /api/projects/save`: save a project JSON file.
- `GET /api/projects/load`: load a project JSON file.
- `GET /api/projects/list`: list saved projects.
- `GET /api/themes`: load saved or built-in themes.
- `POST /api/themes/save`: save theme data.

The API is local-only infrastructure. It is not designed as a public multi-user backend.

### Desktop Packaging

Electron wraps the local server and frontend into a desktop app.

Packaging features:

- Portable Windows target via Electron Builder.
- Built frontend served from `dist`.
- Prebuilt Remotion bundle served from `dist-remotion`.
- Electron main process starts the local API on a random free port.
- Packaged app stores user data in the user's Documents folder under `ShadowMotionStudio`.
- Remotion compositor binaries are unpacked for packaged rendering.

## 11. Data And Storage Model

The project intentionally avoids databases and cloud services.

Local folders:

- `projects`: saved project JSON files.
- `exports`: rendered video and image outputs.
- `data`: saved data files such as themes.
- `assets`: reserved for creator assets.

In development, these folders resolve under the working directory by default. In the packaged Electron app, they resolve to a persistent writable user data location.

Project data is structured around:

- Selected template.
- Template fields.
- Theme tokens.
- Animation configuration.
- Export configuration.
- Placement configuration.

This makes saved projects portable, easy to inspect, and suitable for batch generation.

## 12. Build And Run Commands

Development commands:

```bash
npm install
npm run server
npm run dev
```

Rendering from CLI:

```bash
npm run render -- projects/my-project.json
```

Production app build:

```bash
npm run app:build
```

Run Electron locally after building:

```bash
npm run app
```

Create a portable Windows package:

```bash
npm run package
```

## 13. Current Readiness

Shadow Motion Studio is currently ready for personal creator use and controlled beta testing.

### Ready Now

- Local editor UI exists and is usable.
- Live preview is wired to Remotion Player.
- 19 templates are implemented.
- Template fields are editable.
- Layout, placement, theme, animation speed, and duration are configurable.
- Export supports WebM, MP4, PNG, and JPG.
- Transparent WebM workflow is implemented.
- Platform presets exist for YouTube, Reels/Shorts, and feed formats.
- Projects can be saved and loaded locally.
- Batch JSON rendering exists.
- CLI rendering exists.
- Electron desktop packaging exists for Windows portable distribution.
- Runtime config separates dev, server, and packaged paths.

### Beta-Level Areas

- The app is local-first and single-user; it does not include accounts, collaboration, cloud sync, or permissions.
- Error reporting is basic and mostly surfaced as status text or API errors.
- Batch JSON requires the creator/editor to know the project shape.
- Theme editing persistence exists at API level, but the UI currently emphasizes built-in theme selection.
- There is no asset library UI yet, even though an assets directory is prepared.
- There is no formal onboarding or template documentation inside the app.
- There is no automated test suite visible in the current package scripts.
- Cross-platform packaging is not configured beyond the Windows portable target.
- Export success depends on local Remotion/Chromium/compositor behavior and available system resources.

### Not Production-SaaS Ready

The app should not be treated as a hosted SaaS or multi-tenant production service. It has no authentication, no database, no queue system, no cloud storage, no job monitoring, and no user isolation. That is consistent with the product direction: this is a local creator tool, not a public rendering platform.

### Practical Readiness Rating

- Solo creator daily use: high readiness.
- Internal editor/agency beta: medium-high readiness.
- Public paid desktop release: medium readiness, pending installer polish, docs, QA, crash handling, and support flow.
- Hosted web app: low readiness without major backend, security, storage, and render queue work.

## 14. Strengths

The strongest parts of the current project are:

- Clear niche and creator audience.
- Strong visual identity.
- Shared preview/export architecture.
- Local-first project ownership.
- Broad template coverage for one creator style.
- Platform-aware export presets.
- Batch generation potential.
- Desktop packaging already started.

The product has a practical path to becoming a reliable creator utility because it is focused and technically coherent.

## 15. Main Gaps And Risks

The largest gaps are not core concept gaps; they are productization and workflow gaps.

Important gaps:

- Documentation needs to catch up with the current 19-template implementation.
- New users need guidance on what each template is for and how to export correctly.
- Batch rendering needs example JSON files.
- Export failures need clearer user-facing recovery messages.
- The packaged Windows flow needs repeatable QA on clean machines.
- Theme customization could become more creator-facing.
- Asset management is not yet exposed as a full workflow.
- There is no visible automated quality gate for builds or renders.

Technical risks:

- Rendering is CPU/GPU/resource intensive and can vary by machine.
- Transparent WebM compatibility varies by editor and playback environment.
- Electron packaging with Remotion binaries can be fragile if paths change.
- The local API is intentionally permissive because it is local, but it should not be exposed to a public network.

## 16. Recommended Next Steps

For creator readiness:

- Add an in-app "template guide" or examples panel.
- Add sample batch JSON files for common workflows.
- Update the README to match the current 19-template product.
- Add a short export troubleshooting section.
- Add a packaged-app smoke test checklist.

For product readiness:

- Add clearer render progress and failure messages.
- Add a theme editor UI that saves custom themes.
- Add asset upload/management if templates need logos, profile images, or backgrounds.
- Add preset project examples for YouTube, Shorts, and weekly recap workflows.
- Add basic automated checks for TypeScript build and representative render paths.

For distribution readiness:

- Test the portable Windows package on a clean Windows machine.
- Confirm transparent WebM imports cleanly into target editing software.
- Decide whether the app remains portable-only or gets a signed installer.
- Add versioned release notes.
- Add a backup/export strategy for saved projects and themes.

## 17. Overall Assessment

Shadow Motion Studio is a focused, useful creator tool with a clear reason to exist. It is strongest as a local motion graphics generator for one creator or a small editing workflow. The core loop is present: select template, edit, preview, export, reuse. The technology choices support that loop well, especially the shared Remotion preview/export model.

The project is not yet a polished commercial desktop product, but it is past the concept stage. With documentation, examples, QA, and a little workflow polish, it can become a dependable tool for creators who want a branded cinematic graphics system without the weight of traditional motion design software.
