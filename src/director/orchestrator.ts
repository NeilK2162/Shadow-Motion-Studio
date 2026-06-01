import path from 'path';
import { getDefaultDurationSeconds } from '../data/templateDefaults';
import type { FormatId } from '../lib/formats';
import { getExportsDir } from '../lib/runtimeConfig';
import { renderBatch } from '../renderer/render';
import { createDefaultProject } from '../remotion/inputProps';
import type { Project, TemplateId } from '../types';
import { TEMPLATE_META } from '../types';
import { MAX_BEATS, MAX_REPAIR_ATTEMPTS, MODEL_DEFAULTS, QUALITY_MODELS, TOKEN_LIMITS } from './config';
import { localDraft } from './local/drafter';
import { localPlan } from './local/planner';
import { compressSeriesContext, readSeries, writeSeries } from './memory';
import { emptyUsage, mergeUsage } from './pricing';
import {
  buildAuthorRepairUserMessage,
  buildAuthorSystemBlocks,
  buildAuthorUserMessage,
} from './prompts/templateAuthorBlocks';
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
import type { TemplateDefinition } from './templateSchema';
import { isDuplicateTemplateName, listCustomTemplates, saveCustomTemplate } from './templateRegistry';
import { fieldsFromDef } from './templateUtils';
import { validateTemplate } from './validateTemplate';
import {
  applyDefaultFill,
  validateDraftEntries,
  validatePlanBeats,
  type ValidationError,
} from './validate';
import { getVoiceProfile } from './voice';
import type {
  Beat,
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
}

function closestBuiltIn(intent: string): TemplateId {
  const lower = intent.toLowerCase();
  if (lower.includes('fail') || lower.includes('waste')) return 'mission-failed';
  if (lower.includes('stat') || lower.includes('week')) return 'weekly-stats';
  if (lower.includes('quest') || lower.includes('side')) return 'side-quest';
  if (lower.includes('subscribe') || lower.includes('follow')) return 'subscribe-prompt';
  if (lower.includes('count')) return 'countdown';
  if (lower.includes('cash') || lower.includes('money')) return 'cash-pickup';
  return 'mission-passed';
}

function assetToProject(asset: GeneratedAsset, formatTarget: DirectorFormatTarget): Partial<Project> & { formats?: string[] } {
  if (asset.templateDef) {
    const base = createDefaultProject(asset.templateDef.id, asset.templateDef);
    return {
      template: asset.templateDef.id,
      templateDef: asset.templateDef,
      fields: asset.fields,
      theme: base.theme,
      placement: asset.templateDef.defaultPlacement,
      animation: {
        globalSpeed: 1,
        durationInFrames: Math.ceil((asset.templateDef.durationSeconds + 1) * (base.export.fps ?? 30)),
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

  const builtIn = asset.template as TemplateId;
  const base = createDefaultProject(builtIn);
  const durationSeconds = getDefaultDurationSeconds(builtIn, asset.fields);
  return {
    template: builtIn,
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

function normalizeBeats(beats: Beat[]): Beat[] {
  return beats.map((b) => {
    if (b.mode === 'create') return b;
    if (b.mode === 'reuse') return { ...b, mode: 'reuse' as const };
    return { ...b, mode: 'reuse' as const };
  });
}

async function existingTemplateNames(): Promise<string[]> {
  const builtIn = TEMPLATE_META.map((t) => t.label);
  const custom = (await listCustomTemplates()).map((t) => t.name);
  return [...builtIn, ...custom];
}

async function runPlan(
  provider: LLMProvider | null,
  concept: string,
  formatTarget: DirectorFormatTarget,
  voice: Awaited<ReturnType<typeof getVoiceProfile>>,
  memory: SeriesMemory,
  qualityMode: boolean,
  customNames: string[],
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

  const registryNote = customNames.length ? `\nCUSTOM TEMPLATES ALREADY SAVED:\n${customNames.join(', ')}` : '';

  try {
    const { data, usage } = await provider.complete<{ beats: DirectorPlan['beats']; reasoning?: string }>({
      system: PLANNER_SYSTEM + registryNote,
      user: buildPlannerUser(concept, voice, seriesContext, formatTarget),
      maxTokens: TOKEN_LIMITS.plan,
      cacheableSystem: true,
      model,
      prefill: '{"beats":[',
    });

    const plan: DirectorPlan = { beats: normalizeBeats(data.beats ?? []), reasoning: data.reasoning };
    if (plan.beats.length < 3) {
      throw new Error(`Plan returned only ${plan.beats.length} beats`);
    }
    return { plan, usage, step: { step: 'plan', usage } };
  } catch (error) {
    console.warn('[director] Plan LLM failed, using local planner:', error);
    const plan = localPlan(concept, formatTarget, memory);
    return { plan, usage: emptyUsage(), step: { step: 'plan', usage: emptyUsage() } };
  }
}

async function createTemplate(
  provider: LLMProvider,
  beat: Beat,
  concept: string,
  voice: Awaited<ReturnType<typeof getVoiceProfile>>,
  existingNames: string[],
): Promise<{ def: TemplateDefinition; usage: TokenUsage; steps: StepUsage[] } | null> {
  const customName = beat.customName ?? beat.template;
  if (isDuplicateTemplateName(customName, existingNames)) {
    return null;
  }

  const systemBlocks = buildAuthorSystemBlocks();
  const systemFallback = systemBlocks.map((b) => b.text).join('\n\n');
  const user = buildAuthorUserMessage({
    beatIntent: beat.intent,
    concept,
    voiceDescription: voice.description,
    existingNames,
  });

  let cumulative = emptyUsage();
  const steps: StepUsage[] = [];

  const authorModel = provider.name === 'anthropic' ? MODEL_DEFAULTS.anthropic : undefined;

  let rawDef: TemplateDefinition;
  try {
    const created = await provider.complete<TemplateDefinition>({
      system: systemFallback,
      systemBlocks: provider.name === 'anthropic' ? systemBlocks : undefined,
      user,
      maxTokens: TOKEN_LIMITS.create,
      model: authorModel,
    });
    cumulative = mergeUsage(cumulative, created.usage);
    steps.push({ step: 'create', usage: created.usage });
    rawDef = created.data;
  } catch {
    return null;
  }

  let def = rawDef;
  if (!def.id || def.id === 'sample-mission-passed') {
    def = { ...def, id: `${slugify(customName)}-${Date.now().toString(36).slice(-6)}` };
  }
  if (!def.name) def = { ...def, name: customName };

  let validation = validateTemplate(def);
  if (!validation.valid) {
    try {
      const repaired = await provider.complete<TemplateDefinition>({
        system: systemFallback,
        systemBlocks: provider.name === 'anthropic' ? systemBlocks : undefined,
        user: buildAuthorRepairUserMessage({
          errors: validation.errors.map((e) => `${e.path}: ${e.message}`),
          previousJson: def,
          beatIntent: beat.intent,
        }),
        maxTokens: TOKEN_LIMITS.createRepair,
        model: authorModel,
      });
      cumulative = mergeUsage(cumulative, repaired.usage);
      steps.push({ step: 'create_repair', usage: repaired.usage });
      def = repaired.data;
      validation = validateTemplate(def);
    } catch {
      return null;
    }
  }

  if (!validation.valid) return null;

  const saveResult = await saveCustomTemplate(validation.def!);
  if (!saveResult.ok) return null;

  return { def: validation.def!, usage: cumulative, steps };
}

async function fillCustomFields(
  provider: LLMProvider | null,
  def: TemplateDefinition,
  beat: Beat,
  voice: Awaited<ReturnType<typeof getVoiceProfile>>,
  memory: SeriesMemory,
): Promise<{ fields: Record<string, unknown>; usage: TokenUsage; step: StepUsage }> {
  const seriesContext = compressSeriesContext(memory);
  const schemaText = JSON.stringify(
    def.fields.map((f) => ({ key: f.key, label: f.label, type: f.type, default: f.default })),
    null,
    2,
  );

  if (!provider) {
    return { fields: fieldsFromDef(def), usage: emptyUsage(), step: { step: 'draft', usage: emptyUsage() } };
  }

  const { data, usage } = await provider.complete<{ fields: Record<string, unknown> }>({
    system: DRAFTER_SYSTEM,
    user: `VOICE: ${voice.description}
${seriesContext}
BEAT: ${JSON.stringify(beat)}
FIELD SCHEMA (fill every key):
${schemaText}
Template id: ${def.id}
Output ONLY {"fields":{...}}`,
    maxTokens: TOKEN_LIMITS.draft,
    cacheableSystem: true,
    prefill: '{"fields":{',
  });

  const fields =
    data && typeof data === 'object' && 'fields' in data && data.fields && typeof data.fields === 'object'
      ? (data.fields as Record<string, unknown>)
      : data && typeof data === 'object' && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : {};
  return { fields: { ...fieldsFromDef(def), ...fields }, usage, step: { step: 'draft', usage } };
}

async function runDraft(
  provider: LLMProvider | null,
  plan: DirectorPlan,
  voice: Awaited<ReturnType<typeof getVoiceProfile>>,
  memory: SeriesMemory,
): Promise<{ entries: Array<{ template: string; fields: Record<string, unknown> }>; usage: TokenUsage; step: StepUsage }> {
  const reuseBeats = plan.beats.filter((b) => b.mode !== 'create');
  if (reuseBeats.length === 0) {
    return { entries: [], usage: emptyUsage(), step: { step: 'draft', usage: emptyUsage() } };
  }

  const seriesContext = compressSeriesContext(memory);
  const templateIds = reuseBeats.map((b) => b.template) as TemplateId[];
  const schemas = getSchemasForTemplates(templateIds);
  const schemasText = serializeSchemasForPrompt(schemas);

  if (!provider) {
    const entries = localDraft(reuseBeats, memory, voice);
    return { entries, usage: emptyUsage(), step: { step: 'draft', usage: emptyUsage() } };
  }

  try {
    const { data, usage } = await provider.complete<Array<{ template: string; fields: Record<string, unknown> }>>({
      system: DRAFTER_SYSTEM,
      user: buildDrafterUser(reuseBeats, voice, seriesContext, schemasText),
      maxTokens: TOKEN_LIMITS.draft,
      cacheableSystem: true,
      prefill: '[',
    });

    const entries: Array<{ template: string; fields: Record<string, unknown> }> = Array.isArray(data)
      ? data
      : ((data as { assets?: Array<{ template: string; fields: Record<string, unknown> }> }).assets ?? []);
    return { entries, usage, step: { step: 'draft', usage } };
  } catch (error) {
    console.warn('[director] Draft LLM failed, using local drafter:', error);
    const entries = localDraft(reuseBeats, memory, voice);
    return { entries, usage: emptyUsage(), step: { step: 'draft', usage: emptyUsage() } };
  }
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
    prefill: '[',
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
  const existingNames = await existingTemplateNames();

  const totalBefore = sessionUsage.inputTokens + sessionUsage.outputTokens;
  const budget = settings.sessionTokenBudget ?? 50_000;

  let cumulativeUsage = emptyUsage();
  const stepUsage: StepUsage[] = [];
  const customAssets: GeneratedAsset[] = [];
  const customDefs = new Map<string, TemplateDefinition>();

  const { plan, usage: planUsage, step: planStep } = await runPlan(
    provider,
    request.concept,
    request.formatTarget,
    voice,
    memory,
    settings.qualityMode,
    existingNames,
  );
  cumulativeUsage = mergeUsage(cumulativeUsage, planUsage);
  stepUsage.push(planStep);

  if (plan.beats.length > MAX_BEATS) {
    plan.beats = plan.beats.slice(0, MAX_BEATS);
  }
  const planError = validatePlanBeats(plan.beats);
  if (planError) throw new Error(planError);

  for (const beat of plan.beats) {
    if (beat.mode !== 'create') continue;

    if (!provider || provider.name !== 'anthropic') {
      beat.template = closestBuiltIn(beat.intent);
      beat.mode = 'reuse';
      continue;
    }

    const created = await createTemplate(provider, beat, request.concept, voice, existingNames);
    if (!created) {
      beat.template = closestBuiltIn(beat.intent);
      beat.mode = 'reuse';
      continue;
    }

    cumulativeUsage = mergeUsage(cumulativeUsage, created.usage);
    stepUsage.push(...created.steps);
    customDefs.set(created.def.id, created.def);
    existingNames.push(created.def.name);
    beat.template = created.def.id;

    const { fields, usage: fillUsage, step: fillStep } = await fillCustomFields(
      provider,
      created.def,
      beat,
      voice,
      memory,
    );
    cumulativeUsage = mergeUsage(cumulativeUsage, fillUsage);
    stepUsage.push(fillStep);

    customAssets.push({
      template: created.def.id,
      fields,
      isCustom: true,
      templateDef: created.def,
      valid: true,
    });
  }

  const { entries, usage: draftUsage, step: draftStep } = await runDraft(provider, plan, voice, memory);
  cumulativeUsage = mergeUsage(cumulativeUsage, draftUsage);
  stepUsage.push(draftStep);

  let validation = validateDraftEntries(entries);
  let repairAttempts = 0;

  while (!validation.valid && provider && repairAttempts < MAX_REPAIR_ATTEMPTS) {
    const invalidAssets = validation.assets.filter((a) => !a.valid);
    const schemas = getSchemasForTemplates(invalidAssets.map((a) => a.template as TemplateId));
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

  const reuseAssets = validation.assets.filter((a) => !customDefs.has(a.template));
  const assets: GeneratedAsset[] = [...customAssets, ...reuseAssets];

  sessionUsage = mergeUsage(sessionUsage, cumulativeUsage);
  const totalAfter = sessionUsage.inputTokens + sessionUsage.outputTokens;
  const budgetExceeded = totalAfter > budget && totalBefore <= budget;

  const pack: DirectorPack = {
    seriesId: memory.seriesId,
    episode: memory.episode,
    concept: request.concept,
    plan,
    assets,
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
