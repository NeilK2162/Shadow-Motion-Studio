import path from 'path';
import { getDefaultDurationSeconds } from '../data/templateDefaults';
import type { FormatId } from '../lib/formats';
import { getExportsDir } from '../lib/runtimeConfig';
import { renderBatch } from '../renderer/render';
import { createDefaultProject } from '../remotion/inputProps';
import type { Project } from '../types';
import { MAX_BEATS, MAX_REPAIR_ATTEMPTS, MODEL_DEFAULTS, QUALITY_MODELS, TOKEN_LIMITS } from './config';
import { localDraft } from './local/drafter';
import { localPlan } from './local/planner';
import { compressSeriesContext, readSeries, writeSeries } from './memory';
import { emptyUsage, mergeUsage } from './pricing';
import {
  buildDrafterUser,
  buildPlannerUser,
  buildRepairUser,
  DRAFTER_SYSTEM,
  PLANNER_SYSTEM,
} from './prompts';
import { getProvider } from './providers';
import type { LLMProvider } from './providers/types';
import { readDirectorSettings } from './settings';
import { getSchemasForTemplates, serializeSchemasForPrompt } from './schemas';
import {
  applyDefaultFill,
  validateDraftEntries,
  validatePlanBeats,
  type ValidationError,
} from './validate';
import { getVoiceProfile } from './voice';
import type {
  DirectorFormatTarget,
  DirectorPack,
  DirectorPlan,
  GenerateRequest,
  GenerateResult,
  GeneratedAsset,
  SeriesMemory,
  StepUsage,
  TokenUsage,
} from './types';

let sessionUsage: TokenUsage = emptyUsage();

export function getSessionUsage(): TokenUsage {
  return { ...sessionUsage };
}

export function resetSessionUsage(): void {
  sessionUsage = emptyUsage();
}

function formatToFormats(target: DirectorFormatTarget): FormatId[] {
  if (target === 'youtube') return ['youtube-landscape'];
  if (target === 'shorts') return ['shorts-vertical'];
  return ['youtube-landscape', 'shorts-vertical'];
}

function assetToProject(asset: GeneratedAsset, formatTarget: DirectorFormatTarget): Partial<Project> & { formats?: string[] } {
  const base = createDefaultProject(asset.template);
  const durationSeconds = getDefaultDurationSeconds(asset.template, asset.fields);
  return {
    template: asset.template,
    fields: asset.fields,
    theme: base.theme,
    placement: base.placement,
    animation: {
      globalSpeed: 1,
      durationInFrames: Math.ceil((durationSeconds + 1) * (base.export.fps ?? 30)),
    },
    export: {
      ...base.export,
      format: 'webm',
      transparent: true,
      ...asset.export,
      formatId: asset.formatId,
    },
    formats: formatToFormats(formatTarget),
  };
}

export function packToBatchItems(pack: DirectorPack): Array<Partial<Project> & { formats?: string[] }> {
  return pack.assets.map((a) => assetToProject(a, pack.formatTarget));
}

async function runPlan(
  provider: LLMProvider | null,
  concept: string,
  formatTarget: DirectorFormatTarget,
  voice: Awaited<ReturnType<typeof getVoiceProfile>>,
  memory: SeriesMemory,
  qualityMode: boolean,
): Promise<{ plan: DirectorPlan; usage: TokenUsage; step: StepUsage }> {
  const seriesContext = compressSeriesContext(memory);

  if (!provider) {
    const plan = localPlan(concept, formatTarget, memory);
    return { plan, usage: emptyUsage(), step: { step: 'plan', usage: emptyUsage() } };
  }

  const model =
    qualityMode && provider.name === 'openai'
      ? QUALITY_MODELS.openai
      : qualityMode && provider.name === 'anthropic'
        ? QUALITY_MODELS.anthropic
        : undefined;

  const { data, usage } = await provider.complete<{ beats: DirectorPlan['beats']; reasoning?: string }>({
    system: PLANNER_SYSTEM,
    user: buildPlannerUser(concept, voice, seriesContext, formatTarget),
    maxTokens: TOKEN_LIMITS.plan,
    cacheableSystem: true,
    model,
  });

  const plan: DirectorPlan = { beats: data.beats ?? [], reasoning: data.reasoning };
  return { plan, usage, step: { step: 'plan', usage } };
}

async function runDraft(
  provider: LLMProvider | null,
  plan: DirectorPlan,
  voice: Awaited<ReturnType<typeof getVoiceProfile>>,
  memory: SeriesMemory,
): Promise<{ entries: Array<{ template: string; fields: Record<string, unknown> }>; usage: TokenUsage; step: StepUsage }> {
  const seriesContext = compressSeriesContext(memory);
  const templateIds = plan.beats.map((b) => b.template);
  const schemas = getSchemasForTemplates(templateIds);
  const schemasText = serializeSchemasForPrompt(schemas);

  if (!provider) {
    const entries = localDraft(plan.beats, memory, voice);
    return { entries, usage: emptyUsage(), step: { step: 'draft', usage: emptyUsage() } };
  }

  const { data, usage } = await provider.complete<Array<{ template: string; fields: Record<string, unknown> }>>({
    system: DRAFTER_SYSTEM,
    user: buildDrafterUser(plan.beats, voice, seriesContext, schemasText),
    maxTokens: TOKEN_LIMITS.draft,
    cacheableSystem: true,
  });

  const entries: Array<{ template: string; fields: Record<string, unknown> }> = Array.isArray(data)
    ? data
    : ((data as { assets?: Array<{ template: string; fields: Record<string, unknown> }> }).assets ?? []);
  return { entries, usage, step: { step: 'draft', usage } };
}

async function runRepair(
  provider: LLMProvider,
  invalidAssets: GeneratedAsset[],
  errors: ValidationError[],
  schemasText: string,
): Promise<{ entries: Array<{ template: string; fields: Record<string, unknown> }>; usage: TokenUsage; step: StepUsage }> {
  const invalidEntries = invalidAssets.map((a) => ({ template: a.template, fields: a.fields }));
  const { data, usage } = await provider.complete<Array<{ template: string; fields: Record<string, unknown> }>>({
    system: DRAFTER_SYSTEM,
    user: buildRepairUser(errors, invalidEntries, schemasText),
    maxTokens: TOKEN_LIMITS.repair,
    cacheableSystem: true,
  });
  const entries = Array.isArray(data) ? data : [];
  return { entries, usage, step: { step: 'repair', usage } };
}

export async function generatePack(request: GenerateRequest): Promise<GenerateResult> {
  const settings = await readDirectorSettings();
  const seriesId = request.seriesId ?? 'untitled';
  const memory = await readSeries(seriesId);
  const voice = await getVoiceProfile(memory.voiceProfileId);
  const provider = getProvider(settings);

  const totalBefore = sessionUsage.inputTokens + sessionUsage.outputTokens;
  const budget = settings.sessionTokenBudget ?? 50_000;

  let cumulativeUsage = emptyUsage();
  const stepUsage: StepUsage[] = [];

  const { plan, usage: planUsage, step: planStep } = await runPlan(
    provider,
    request.concept,
    request.formatTarget,
    voice,
    memory,
    settings.qualityMode,
  );
  cumulativeUsage = mergeUsage(cumulativeUsage, planUsage);
  stepUsage.push(planStep);

  if (plan.beats.length > MAX_BEATS) {
    plan.beats = plan.beats.slice(0, MAX_BEATS);
  }
  const planError = validatePlanBeats(plan.beats);
  if (planError) throw new Error(planError);

  const { entries, usage: draftUsage, step: draftStep } = await runDraft(provider, plan, voice, memory);
  cumulativeUsage = mergeUsage(cumulativeUsage, draftUsage);
  stepUsage.push(draftStep);

  let validation = validateDraftEntries(entries);
  let repairAttempts = 0;

  while (!validation.valid && provider && repairAttempts < MAX_REPAIR_ATTEMPTS) {
    const invalidAssets = validation.assets.filter((a) => !a.valid);
    const schemas = getSchemasForTemplates(invalidAssets.map((a) => a.template));
    const { entries: repaired, usage: repairUsage, step: repairStep } = await runRepair(
      provider,
      invalidAssets,
      validation.errors,
      serializeSchemasForPrompt(schemas),
    );
    cumulativeUsage = mergeUsage(cumulativeUsage, repairUsage);
    stepUsage.push(repairStep);
    validation = validateDraftEntries(repaired);
    repairAttempts += 1;
  }

  if (!validation.valid) {
    validation.assets = applyDefaultFill(validation.assets);
    validation.valid = true;
  }

  sessionUsage = mergeUsage(sessionUsage, cumulativeUsage);
  const totalAfter = sessionUsage.inputTokens + sessionUsage.outputTokens;
  const budgetExceeded = totalAfter > budget && totalBefore <= budget;

  const pack: DirectorPack = {
    seriesId: memory.seriesId,
    episode: memory.episode,
    concept: request.concept,
    plan,
    assets: validation.assets,
    usage: cumulativeUsage,
    stepUsage,
    formatTarget: request.formatTarget,
    createdAt: new Date().toISOString(),
  };

  return { pack, budgetExceeded };
}

export async function updateMemoryFromPack(pack: DirectorPack): Promise<SeriesMemory> {
  const memory = await readSeries(pack.seriesId);
  const facts = { ...memory.facts };

  for (const asset of pack.assets) {
    if (asset.template === 'weekly-stats') {
      const boxes = asset.fields.boxes as Array<{ label: string; value: string }> | undefined;
      const usersBox = boxes?.find((b) => b.label.toLowerCase().includes('user'));
      if (usersBox) {
        const n = parseInt(usersBox.value.replace(/\D/g, ''), 10);
        if (!Number.isNaN(n)) facts.shadowUsers = n;
      }
    }
    if (asset.template === 'cash-pickup') {
      const amount = asset.fields.amount as number | undefined;
      if (amount) facts.cashTotal = `₹${amount.toLocaleString('en-IN')}`;
      facts.lastMilestone = pack.concept.slice(0, 80);
    }
    if (asset.template === 'mission-passed' || asset.template === 'mission-failed') {
      const resp = String(asset.fields.resp ?? asset.fields.sub ?? '');
      const match = resp.match(/\+(\d+)/);
      if (match) facts.respectTotal = (facts.respectTotal ?? 0) + Number(match[1]);
    }
  }

  facts.weekNumber = (facts.weekNumber ?? memory.episode) + 1;

  const summary = pack.plan.beats.map((b) => b.template).join(', ');
  const history = [
    ...memory.history,
    { episode: memory.episode, summary, date: new Date().toISOString().slice(0, 10) },
  ].slice(-5);

  const updated: SeriesMemory = {
    ...memory,
    episode: memory.episode + 1,
    facts,
    history,
  };
  await writeSeries(updated);
  return updated;
}

export async function renderDirectorPack(pack: DirectorPack): Promise<string> {
  const folder = path.join(getExportsDir(), `director-${Date.now()}`);
  const items = packToBatchItems(pack);
  const resultFolder = await renderBatch(items, folder);
  await updateMemoryFromPack(pack);
  return resultFolder;
}

export { MODEL_DEFAULTS };
