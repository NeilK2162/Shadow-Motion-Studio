const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'portfolio-images');
fs.mkdirSync(OUT, { recursive: true });

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function base({ kicker, title, subtitle, body, accent = 'gold', children }) {
  const accentColor = accent === 'green' ? '#57df86' : '#d6b45a';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#050705"/>
      <stop offset="0.52" stop-color="#0b120b"/>
      <stop offset="1" stop-color="#020302"/>
    </linearGradient>
    <radialGradient id="halo" cx="72%" cy="18%" r="76%">
      <stop offset="0" stop-color="${accentColor}" stop-opacity="0.18"/>
      <stop offset="0.34" stop-color="${accentColor}" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#213021" stroke-width="1" opacity="0.22"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000000" flood-opacity="0.52"/>
    </filter>
    <style>
      .font { font-family: "Inter", "Segoe UI", Arial, sans-serif; }
      .kicker { font-size: 18px; letter-spacing: 5px; text-transform: uppercase; fill: #83d996; }
      .title { font-size: 70px; font-weight: 850; letter-spacing: -2px; fill: #f4d77e; }
      .subtitle { font-size: 30px; fill: #d9dfd4; }
      .body { font-size: 22px; fill: #aebdab; }
      .panel { fill: #0b100b; stroke: #2b3d2b; stroke-width: 2; }
      .panelGold { fill: #0b100b; stroke: #d6b45a; stroke-width: 2; stroke-opacity: 0.58; }
      .panelGreen { fill: #0b100b; stroke: #57df86; stroke-width: 2; stroke-opacity: 0.48; }
      .gold { fill: #f4d77e; }
      .green { fill: #57df86; }
      .muted { fill: #93a28f; }
      .strokeGold { stroke: #d6b45a; stroke-width: 2; }
      .strokeGreen { stroke: #57df86; stroke-width: 2; }
    </style>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <rect width="1600" height="900" fill="url(#halo)"/>

  <rect x="56" y="56" width="1488" height="788" rx="34" fill="none" stroke="#273727" stroke-width="2"/>
  <path d="M84 112V84H216M1384 84H1516V112M84 788V816H216M1384 816H1516V788" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
  <path d="M92 158V250M1508 158V250M92 650V742M1508 650V742" stroke="#2d3d2c" stroke-width="2"/>

  <g transform="translate(120 118)">
    <text class="font kicker" x="0" y="0">${escapeXml(kicker)}</text>
    <text class="font title" x="0" y="82">${escapeXml(title)}</text>
    <text class="font subtitle" x="2" y="132">${escapeXml(subtitle)}</text>
    <text class="font body" x="3" y="174">${escapeXml(body)}</text>
  </g>

  ${children}
</svg>`;
}

function write(name, svg) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg, 'utf8');
  console.log(`Wrote ${name}.svg`);
}

write('01-shadow-motion-studio-hero', base({
  kicker: 'Portfolio Case Study',
  title: 'Shadow Motion Studio',
  subtitle: 'Local motion graphics editor with AI-assisted asset generation',
  body: 'A focused desktop creator tool for reusable branded motion assets.',
  accent: 'gold',
  children: `
  <g transform="translate(120 368)" filter="url(#shadow)">
    <rect class="panel" x="0" y="0" width="980" height="238" rx="28"/>
    <path class="strokeGold" d="M42 56H214" opacity="0.75"/>
    <text class="font" x="42" y="106" style="font-size:32px;font-weight:800;fill:#f4d77e">Built for fast, repeatable creator production</text>
    <text class="font body" x="42" y="158">Animated cards, HUD overlays, transparent WebM exports, batch rendering,</text>
    <text class="font body" x="42" y="196">and custom JSON templates rendered by a single DynamicTemplate engine.</text>
  </g>

  <g transform="translate(1160 368)" filter="url(#shadow)">
    <rect class="panelGold" x="0" y="0" width="320" height="238" rx="28"/>
    <text class="font kicker gold" x="34" y="60" style="font-size:16px;letter-spacing:3px">Current Release</text>
    <text class="font" x="34" y="124" style="font-size:56px;font-weight:850;fill:#f4d77e">v1.1.2</text>
    <text class="font body" x="34" y="168" style="font-size:20px">Windows portable app</text>
    <text class="font body muted" x="34" y="200" style="font-size:18px">Electron + Remotion</text>
  </g>

  <g transform="translate(120 690)">
    <rect class="panelGreen" x="0" y="-42" width="300" height="76" rx="38"/>
    <text class="font body green" x="36" y="6">19 built-in templates</text>
    <rect class="panelGold" x="335" y="-42" width="230" height="76" rx="38"/>
    <text class="font body gold" x="375" y="6">AI Director</text>
    <rect class="panelGreen" x="600" y="-42" width="370" height="76" rx="38"/>
    <text class="font body green" x="636" y="6">Custom Template JSON</text>
    <rect class="panelGold" x="1005" y="-42" width="330" height="76" rx="38"/>
    <text class="font body gold" x="1040" y="6">Transparent WebM</text>
  </g>`
}));

write('02-product-capabilities', base({
  kicker: 'Product Capabilities',
  title: 'A focused creator tool',
  subtitle: 'Not a generic editor. A production system for reusable motion assets.',
  body: 'Minimal UI, deterministic Remotion renders, local project ownership.',
  accent: 'green',
  children: `
  <g transform="translate(120 344)" filter="url(#shadow)">
    ${[
      ['Template System', '19 built-in cards, HUDs, stingers, and prompts.', 'Reusable branded visuals with consistent motion.', '#d6b45a'],
      ['Live Preview', 'Remotion Player mirrors the final export pipeline.', 'Preview and render share the same compositions.', '#57df86'],
      ['Export Pipeline', 'MP4, PNG, JPG, and transparent WebM output.', 'YouTube, Shorts, Reels, feed, and overlay presets.', '#d6b45a'],
      ['Local First', 'Projects, packs, exports, and templates stay on disk.', 'Portable Windows desktop build for delivery.', '#57df86']
    ].map((card, i) => `
    <g transform="translate(${i * 356} 0)">
      <rect x="0" y="0" width="320" height="322" rx="28" fill="#0b100b" stroke="${card[3]}" stroke-width="2" stroke-opacity="0.52"/>
      <path d="M38 56H142" stroke="${card[3]}" stroke-width="3" stroke-linecap="round"/>
      <text class="font" x="38" y="118" style="font-size:30px;font-weight:850;fill:#f4d77e">${card[0]}</text>
      <text class="font body" x="38" y="172" style="font-size:20px">${card[1]}</text>
      <text class="font body muted" x="38" y="238" style="font-size:18px">${card[2]}</text>
    </g>`).join('')}
  </g>
  <g transform="translate(120 754)">
    <text class="font body muted" x="0" y="0">Stack: React + TypeScript + Vite · Remotion Renderer · Express API · Electron Desktop</text>
  </g>`
}));

write('03-ai-director-workflow', base({
  kicker: 'AI Director Workflow',
  title: 'From concept to render-ready pack',
  subtitle: 'Plan beats, fill copy, validate templates, and render batches.',
  body: 'Built with robust JSON parsing, local fallbacks, cost metering, and Anthropic prompt caching.',
  accent: 'gold',
  children: `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10Z" fill="#d6b45a"/>
    </marker>
  </defs>
  <g transform="translate(120 354)" filter="url(#shadow)">
    ${[
      ['1', 'Prompt', 'Creator describes the video or asset pack.'],
      ['2', 'Plan', 'Beats choose reuse or create mode.'],
      ['3', 'Create', 'New templates become validated JSON.'],
      ['4', 'Render', 'Pack outputs to organized export folders.']
    ].map((step, i) => `
    <g transform="translate(${i * 356} 0)">
      <rect class="${i % 2 ? 'panelGreen' : 'panelGold'}" x="0" y="0" width="304" height="270" rx="28"/>
      <circle cx="52" cy="58" r="25" fill="${i % 2 ? '#57df86' : '#d6b45a'}"/>
      <text class="font" x="${step[0] === '1' ? 44 : 43}" y="67" style="font-size:22px;font-weight:850;fill:#071007">${step[0]}</text>
      <text class="font" x="36" y="126" style="font-size:34px;font-weight:850;fill:#f4d77e">${step[1]}</text>
      <text class="font body" x="36" y="176" style="font-size:20px">${step[2]}</text>
    </g>
    ${i < 3 ? `<path d="M${320 + i * 356} 134H${348 + i * 356}" stroke="#d6b45a" stroke-width="3" marker-end="url(#arrow)" opacity="0.75"/>` : ''}`).join('')}
  </g>
  <g transform="translate(120 714)">
    <rect class="panel" x="0" y="-42" width="1360" height="92" rx="30"/>
    <text class="font body" x="40" y="10">Engineering focus: LLM repair, deterministic fallback, token budget control, and custom template registry.</text>
  </g>`
}));

write('04-export-and-delivery', base({
  kicker: 'Export And Delivery',
  title: 'Rendered assets, ready for editors',
  subtitle: 'The output is real media, not a mockup.',
  body: 'Use exported clips and transparent overlays in standard creator editing workflows.',
  accent: 'green',
  children: `
  <g transform="translate(120 354)" filter="url(#shadow)">
    <rect class="panel" x="0" y="0" width="1360" height="300" rx="30"/>
    ${[
      ['MP4', 'Standard clips'],
      ['WebM', 'Transparent overlays'],
      ['PNG', 'Still frames'],
      ['JPG', 'Compressed previews']
    ].map((fmt, i) => `
    <g transform="translate(${62 + i * 320} 64)">
      <rect x="0" y="0" width="250" height="172" rx="24" fill="#071007" stroke="${i % 2 ? '#57df86' : '#d6b45a'}" stroke-width="2" stroke-opacity="0.58"/>
      <text class="font" x="38" y="76" style="font-size:40px;font-weight:850;fill:#f4d77e">${fmt[0]}</text>
      <text class="font body muted" x="38" y="124" style="font-size:19px">${fmt[1]}</text>
    </g>`).join('')}
  </g>
  <g transform="translate(120 720)">
    <text class="font body" x="0" y="0">Targets:</text>
    <text class="font body muted" x="120" y="0">YouTube 16:9</text>
    <text class="font body muted" x="360" y="0">Shorts/Reels 9:16</text>
    <text class="font body muted" x="690" y="0">Square feed</text>
    <text class="font body muted" x="910" y="0">Portrait feed</text>
    <text class="font body muted" x="1140" y="0">Batch folders</text>
  </g>
  <g transform="translate(120 792)">
    <path d="M0 0H1360" stroke="#2f3d2d" stroke-width="2"/>
    <text class="font body muted" x="0" y="40" style="font-size:18px">Portable build: release/ShadowMotionStudio-1.1.2-portable.exe</text>
    <text class="font body muted" x="900" y="40" style="font-size:18px">Local data. Local renders. No SaaS dependency.</text>
  </g>`
}));
