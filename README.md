# Shadow Motion Studio

Local GTA-inspired motion graphics editor. Edit templates, preview with Remotion Player, export PNG/JPG/MP4/transparent WebM.

## Quick start

```bash
npm install
npm run server   # Terminal 1 - API on :3456
npm run dev      # Terminal 2 - Editor on :5173
```

## Gallery (static final-frame view)

Open `http://localhost:5173/?gallery=1`

## Export

Use the Export button in the editor (requires the API server), or CLI:

```bash
npm run render -- projects/my-project.json
```

## Templates

9 cards from `content_kit_GTA_STYLE.html`: Mission Passed, Mission Failed, Chapter Card, Loading Screen, Side Quest, Enter Location, Phone Call, Cheat Code, Weekly Stats.
