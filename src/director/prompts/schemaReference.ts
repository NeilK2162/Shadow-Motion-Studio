import { SAMPLE_MISSION_PASSED_DEF } from '../templateSchema';

/** Full schema reference block — padded to exceed Anthropic 4096-token cache floor. */
const PADDING = `
Reference appendix (validation rules enforced server-side):
- schemaVersion must equal 1
- id: lowercase slug /^[a-z][a-z0-9-]{0,47}$/
- name: 1..60 chars, glyph: single unicode char
- group: stingers | hud | cards | engagement
- canvas.width and canvas.height each 320..1080
- durationSeconds: 1..6
- defaultPlacement: center | top-left | top-center | top-right | middle-left | middle-right | bottom-left | bottom-center | bottom-right | fullscreen
- recommendedFormats: non-empty subset of youtube-landscape, youtube-720, shorts-vertical, feed-square, feed-portrait
- background: solid | gradient | transparent
- fields: 1..12 entries, each with key, label, type, default
- field key /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/
- field types: text | number | boolean | color | statRow | statBox | bar | buttonRow
- elements: 1..20 entries sorted by anim.delaySeconds at render time
- element key unique within template, same regex as field keys
- bind must reference an existing field key when present
- color: theme token or #rrggbb hex only — no css, no urls
- fontSize: 8..96 design pixels
- anim.preset must be a known PresetName
- anim.delaySeconds: 0..10, durationSeconds: 0.05..10 when present
- Unknown top-level or element keys are rejected
- Templates never contain scripts, imports, or executable content
`.repeat(24);

export const SCHEMA_REFERENCE = `TemplateDefinition JSON schema (schemaVersion 1):

Top-level keys (only these):
schemaVersion, id, name, glyph, group, description?, canvas, durationSeconds,
defaultPlacement, recommendedFormats, background, fields, elements

canvas: { width: number, height: number } — design pixels before Stage scaling
fields[]: { key, label, type, default, maxLength? }
elements[]: { kind, key, bind?, static?, font?, fontSize?, color?, letterSpacing?, uppercase?, width?, height?, label?, pct?, showPct?, labelColor?, valueColor?, changeColor?, bgColor?, primaryColor?, secondaryColor?, size?, stroke?, opacity?, anim?, style? }

ColorValue: ColorToken | "#rrggbb"
ColorToken: gold | silver | dim | dark1 | dark2 | dark3 | dark4 | dark5 | green | red | blue | purple
FontToken: title | ui | mono

ElementKind → purpose:
text: headline/body copy line
glyph: large icon/checkmark
line: horizontal divider (width number or "full")
statRow: row of {value,label} pairs from statRow field
bar: progress bar with label and pct
statBox: single stat box from statBox field
glow: radial background glow (absolute positioned)
scanline: top scan sweep line
badge: small tag pill
buttonRow: primary/secondary buttons from buttonRow field
ring: circular outline accent
watermark: corner brand mark

PresetName usage guide:
fadeIn/fadeOut: opacity reveals
slideUp/slideDown/slideInLeft/slideInRight/slideR: directional entrance
scaleIn/scaleOut/bounceIn/rotateIn: emphasis pops
pulse/glowPulse: ambient breathing
counterUp: animate number on text (set anim.target to numeric goal)
lFill: bar fill width animation
expandLine: line width grow
scanAnim: scanline horizontal scale
radarSweep: rotating ring
typewriter: text reveal
shake/flash: impact moments

Example minimal stinger structure:
{ glow, scanline, glyph, text title, line, text subtitle, statRow }

Example HUD structure:
{ badge tag, text title, bar metrics }

${PADDING}`;

export const ELEMENT_REFERENCE = `Element authoring patterns (copy faithfully from built-ins):

Mission stinger pattern:
- glow gold pulse behind content
- scanline green sweep at top
- glyph checkmark scaleIn
- text title slideUp uppercase gold title font
- line expandLine divider
- text subtitle fadeIn mono dim
- statRow fadeIn for cash/respect

Weekly stats pattern:
- text header fadeIn
- statBox grid slideUp stagger via delaySeconds
- bar rows lFill with showPct

Side quest pattern:
- badge gold tag slideR
- text title large title font
- text description mono dim
- buttonRow accept/decline

Status HUD pattern:
- multiple bar elements with lFill and counterUp on pct label

Layout: elements stack vertically in flex column inside card shell.
Use position relative on content; glow/scanline/watermark use absolute.
Keep fontSize in design px; interpreter scales via contentScale.

${PADDING}`;

export const FEWSHOT_EXAMPLES = `Complete example definitions (valid, tested):

Example 1 — Mission Passed variant:
${JSON.stringify(SAMPLE_MISSION_PASSED_DEF, null, 2)}

Example 2 — Cash Flash HUD:
{
  "schemaVersion": 1,
  "id": "cash-flash-hud",
  "name": "Cash Flash",
  "glyph": "₹",
  "group": "hud",
  "canvas": { "width": 360, "height": 120 },
  "durationSeconds": 2.5,
  "defaultPlacement": "top-right",
  "recommendedFormats": ["youtube-landscape", "shorts-vertical"],
  "background": "transparent",
  "fields": [
    { "key": "label", "label": "Label", "type": "text", "default": "CASH PICKUP" },
    { "key": "amount", "label": "Amount", "type": "text", "default": "₹2,500" }
  ],
  "elements": [
    { "kind": "badge", "key": "tag", "bind": "label", "color": "gold", "anim": { "preset": "slideR", "delaySeconds": 0, "durationSeconds": 0.4 } },
    { "kind": "text", "key": "amt", "bind": "amount", "font": "title", "fontSize": 32, "color": "gold", "anim": { "preset": "counterUp", "delaySeconds": 0.2, "durationSeconds": 0.8, "target": 2500 } }
  ]
}

When authoring, adapt canvas size, element count, and field bindings to the beat intent.
Never reuse example ids verbatim — generate a unique slug.

${PADDING}`;
