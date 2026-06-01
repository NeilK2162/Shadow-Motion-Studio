import type { TemplateId } from '@/types';

export interface TemplateDefaults {
  fields: Record<string, unknown>;
  durationSeconds: number;
}

/** Shared layout fields included in every template. */
const LAYOUT = {
  sizeMultiplier: 1.0,
  aspectMultiplier: 1.0,
  contentScale: 0,
  glowIntensity: 0.18,
  glowSpread: 85,
  glowCenterY: 60,
};

const MISSION_LAYOUT = { ...LAYOUT, sizeMultiplier: 1.33 };

export const TEMPLATE_DEFAULTS: Record<TemplateId, TemplateDefaults> = {
  'mission-passed': {
    durationSeconds: 1.6,
    fields: {
      ...MISSION_LAYOUT,
      check: '✓',
      titleAccent: 'MISSION',
      titleMain: 'PASSED',
      sub: 'SHADOW OWNER · 20 PILOT USERS ONBOARDED',
      resp: 'RESPECT +250',
      stats: [
        { value: '14:32', label: 'TIME' },
        { value: '₹4,200', label: 'EARNED' },
        { value: '★★★★☆', label: 'RATING' },
      ],
    },
  },
  'mission-failed': {
    durationSeconds: 1.6,
    fields: {
      ...MISSION_LAYOUT,
      cross: '✕',
      titleAccent: 'MISSION',
      titleMain: 'FAILED',
      sub: 'UPWORK PROPOSAL #23 · CLIENT WENT DARK',
      cause: 'YOU WERE WASTED BY: BAD TIMING',
      retry: '→ RETRY: SEND 3 MORE TODAY',
    },
  },
  'chapter-card': {
    durationSeconds: 1.8,
    fields: {
      ...LAYOUT,
      num: 'CHAPTER 01',
      titleLine1: 'ENTERING',
      titleLine2: 'HYDERABAD',
      csub: 'MAIN QUEST: SHADOW OWNER · SIDE QUESTS: UNLIMITED',
      badge: 'BANJARA HILLS, TG',
    },
  },
  'loading-screen': {
    durationSeconds: 2.2,
    fields: {
      ...LAYOUT,
      bigText: 'HYDERABAD',
      barLabel: 'Loading',
      tip: 'In Hyderabad, the best meetings happen over chai. Every NPC you talk to could be your next client.',
      targetPct: 68,
    },
  },
  'side-quest': {
    durationSeconds: 1.4,
    fields: {
      ...LAYOUT,
      qtag: 'New Side Quest Available',
      qtitle: 'THE UPWORK CLIENT',
      qdesc:
        "A US-based startup needs a WhatsApp automation system. They've shortlisted your profile. Deadline: Friday. First ₹50K Upwork win within reach.",
      rewardLabel: 'Reward:',
      rewardValue: '₹45,000 + Testimonial',
      acceptLabel: 'Accept',
      declineLabel: 'Decline',
    },
  },
  'enter-location': {
    durationSeconds: 2.0,
    fields: {
      ...LAYOUT,
      eltag: 'Now Entering',
      lname: 'BANJARA HILLS',
      lsub: 'Hyderabad, Telangana · Hustle Zone Active',
    },
  },
  'phone-call': {
    durationSeconds: 1.6,
    fields: {
      ...LAYOUT,
      ptag: '☎ Incoming Call',
      pname: 'UPWORK CLIENT',
      prole: 'Project Value: ₹45,000 · 2 Missed Calls Before This',
      acceptLabel: 'Accept',
      declineLabel: 'Decline',
    },
  },
  'cheat-code': {
    durationSeconds: 1.4,
    fields: {
      ...LAYOUT,
      ctag: '⚡ Cheat Code Activated',
      code: 'HUSTLEHARD',
      cdesc: 'First Upwork payment received. The system actually works.',
      creward: '+₹50,000 Added To Wallet',
    },
  },
  'weekly-stats': {
    durationSeconds: 2.4,
    fields: {
      ...LAYOUT,
      stitle: 'WEEKLY DEBRIEF',
      ssub: 'Hyderabad Arc · Week 03',
      sweek: 'May 2026\nMain Quest Active',
      boxes: [
        { label: 'Missions Done', value: '4 / 6', change: '↑ +2 from last week' },
        { label: 'Cash Earned', value: '₹82K', change: '↑ First green week' },
        { label: 'Proposals Sent', value: '12', change: '↑ 3 replies' },
        { label: 'Shadow Users', value: '23', change: '↑ +8 new pilots' },
      ],
      bars: [
        { label: 'Coding', pct: 78 },
        { label: 'Hustle', pct: 62 },
        { label: 'Network', pct: 45 },
        { label: 'Content', pct: 33 },
      ],
      stars: 3,
    },
  },
  'wanted-level': {
    durationSeconds: 2.8,
    fields: {
      ...LAYOUT,
      wtag: 'WANTED',
      stars: 3,
      maxStars: 5,
      litChar: '★',
      dimChar: '☆',
      flashOnGain: true,
    },
  },
  'cash-pickup': {
    durationSeconds: 2.2,
    fields: {
      ...LAYOUT,
      amountPrefix: '₹',
      amount: 50000,
      delta: '+₹50,000',
      label: 'WALLET',
      positive: true,
    },
  },
  'status-hud': {
    durationSeconds: 2.6,
    fields: {
      ...LAYOUT,
      showPct: true,
      bars: [
        { label: 'HEALTH', pct: 82, color: '#5cbf60' },
        { label: 'ARMOR', pct: 64, color: '#e8c84a' },
        { label: 'ENERGY', pct: 48, color: '#d44040' },
      ],
    },
  },
  'gps-route': {
    durationSeconds: 3.0,
    fields: {
      ...LAYOUT,
      gtag: 'ROUTE SET',
      dest: 'NEXT: FIRST 1,000 SUBS',
      distance: '2.4 KM · 6 MIN',
      showRadar: true,
    },
  },
  'character-intro': {
    durationSeconds: 2.8,
    fields: {
      ...LAYOUT,
      tag: 'NOW INTRODUCING',
      name: 'THE SHADOW OWNER',
      role: 'Founder · Builder · Operator',
      accentColor: '#e8c84a',
    },
  },
  'now-playing': {
    durationSeconds: 3.2,
    fields: {
      ...LAYOUT,
      station: 'SHADOW FM 101.1',
      track: 'Hustle Theme — Late Nights',
      showEq: true,
    },
  },
  'wasted': {
    durationSeconds: 2.4,
    fields: {
      ...LAYOUT,
      bigText: 'WASTED',
      sub: 'YOU LET THE STREAK DIE',
      overlayOpacity: 0.88,
      desaturate: true,
    },
  },
  'subscribe-prompt': {
    durationSeconds: 3.0,
    fields: {
      ...LAYOUT,
      headline: 'NEW OBJECTIVE',
      action: 'SUBSCRIBE',
      desc: 'Join the crew. New mission every week.',
      reward: '+1 RESPECT',
      cta: 'TAP THE BELL',
      pulseCta: true,
    },
  },
  'countdown': {
    durationSeconds: 4.0,
    fields: {
      ...LAYOUT,
      from: 3,
      goText: 'GO',
      caption: 'MISSION STARTS IN',
      showRing: true,
    },
  },
  'this-or-that': {
    durationSeconds: 3.0,
    fields: {
      ...LAYOUT,
      question: 'WHICH PATH?',
      prompt: 'Comment A or B 👇',
      optionA: { key: 'A', label: 'GO ALL IN', pct: 62 },
      optionB: { key: 'B', label: 'PLAY IT SAFE', pct: 38 },
      showPct: true,
      splitOrientation: 'horizontal',
    },
  },
};

export function getDefaultFields(template: TemplateId): Record<string, unknown> {
  return structuredClone(TEMPLATE_DEFAULTS[template].fields);
}

export function getDefaultDurationSeconds(template: TemplateId, fields?: Record<string, unknown>): number {
  if (template === 'countdown') {
    const from = Number(fields?.from ?? TEMPLATE_DEFAULTS.countdown.fields.from ?? 3);
    return from + 1;
  }
  return TEMPLATE_DEFAULTS[template].durationSeconds;
}
