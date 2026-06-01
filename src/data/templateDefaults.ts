import type { TemplateId } from '@/types';

export interface TemplateDefaults {
  fields: Record<string, unknown>;
  durationSeconds: number;
}

export const TEMPLATE_DEFAULTS: Record<TemplateId, TemplateDefaults> = {
  'mission-passed': {
    durationSeconds: 1.6,
    fields: {
      cardWidth: 720,
      cardHeight: 480,
      contentScale: 1.33,
      glowIntensity: 0.18,
      glowSpread: 85,
      glowCenterY: 60,
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
      cardWidth: 720,
      cardHeight: 480,
      contentScale: 1.33,
      glowIntensity: 0.18,
      glowSpread: 85,
      glowCenterY: 60,
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
      bigText: 'HYDERABAD',
      barLabel: 'Loading',
      tip: 'In Hyderabad, the best meetings happen over chai. Every NPC you talk to could be your next client.',
      targetPct: 68,
    },
  },
  'side-quest': {
    durationSeconds: 1.4,
    fields: {
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
      eltag: 'Now Entering',
      lname: 'BANJARA HILLS',
      lsub: 'Hyderabad, Telangana · Hustle Zone Active',
    },
  },
  'phone-call': {
    durationSeconds: 1.6,
    fields: {
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
      ctag: '⚡ Cheat Code Activated',
      code: 'HUSTLEHARD',
      cdesc: 'First Upwork payment received. The system actually works.',
      creward: '+₹50,000 Added To Wallet',
    },
  },
  'weekly-stats': {
    durationSeconds: 2.4,
    fields: {
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
};

export function getDefaultFields(template: TemplateId): Record<string, unknown> {
  return structuredClone(TEMPLATE_DEFAULTS[template].fields);
}

export function getDefaultDurationSeconds(template: TemplateId): number {
  return TEMPLATE_DEFAULTS[template].durationSeconds;
}
