import {captureDamageBuffs} from './castDamageBuffs';
import { clearPhaseStacks } from './phaseStacks';
import { recalcFulProbability, rollFulHit } from './ful';
import { isAreaAttack, prepareChainCast } from './castTargets';
import { handleWenBuffConsumption } from './effects';
import { prepareReaperStacks, gainReaperStack } from '../necklace';
import { prepareAdrenalineTick, enterCombat, startCrystalChannel, interruptCrystalChannel } from './adrenalineEvents';
import { applyAccuracyEvent } from './tickEvents';
import { QUIVER_SLOT_1, QUIVER_SLOT_2, selectQuiverSlot, applyActionAmmo } from './quiver';
import { finishMalachiCast, tickProcProbabilities } from './effects/enchanted_bolts';
import { weaponSelectionUpdates } from '$lib/data/equipmentSlots';
import { abils, ABILITIES } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { targetCountAt } from './targets';
import { WEAPONS, weapons } from '$lib/data/weapons';
import { style_specific_unification, calc_base_ad } from '../damage_calc_rb';
import { get_hit_sequence, addAdrenaline } from './calculation_utils';
import { handleBuffs, get_user_value, handleDracolichInfusion, handleChanneledAsphyx, handleChannellers, getConjureDamageMultiplier } from './rotation_damage_helper';
import { SETTINGS } from '../settings_rb';
import { resolveBolgImpact, applyActivationEffects, on_stall, on_cast, on_hit, on_damage, COOLDOWN_PREFIX } from './damage_calc_new.js';
import { create_damage_object } from './rota_object_helper';
import { buffs } from './rotation_consts';
import { gearSwaps, allExtraActions as specialAbils, CONSUMABLES } from '../../special/abilities';
import { isExtraAction, normalizeLegacy, type ExtraAction } from './extra-action';
import { gearSets, GEAR_SET } from '$lib/data/gear-sets';
import { countSetPieces } from './gear-registry';
import { getSettingsKeyForItem } from './gear-registry';
import { CombatStyle, DamageObject, RotationInput } from '../types';
import { familiars, dreadnipData, calculateFamiliarHitChance } from '$lib/data/familiars';
import { getBossPresetWithEnrage, type BossPhase, type BossPreset } from '$lib/data/bosses/boss_presets';
import { Logger, LogCategory } from '$lib/utils/Logger';
import { attachGearPerks } from '$lib/data/perks';
import { rotationStore } from '$lib/stores/rotationStore.svelte.js';
import { settingsStore } from '$lib/stores/settingsStore.svelte.js';
import { uiStore } from '$lib/stores/uiStore.svelte';
import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
const logger = Logger.getInstance();

type OnTickCallback = (tick: number, settings: any, timers: Record<string, number>, rotation?: RotationInput, state?: RotationState) => void;

/** Swap asphyxiate for Tumeken's variant if 4+ pieces equipped */
export function resolveTumekensAsphyxiate(abilityKey: string, settings: Record<string, any>): string {
    if (abilityKey === ABILITIES.ASPHYXIATE && countSetPieces(settings, gearSets[GEAR_SET.TUMEKENS_RESPLENDENCE]) >= 4) {
        return ABILITIES.TUMEKEN_ASPHYXIATE;
    }
    return abilityKey;
}

/** Get the vulnerability/curse damage multiplier from settings */
function getVulnMultiplier(settings: Record<string, any>): number {
    if ((settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.VULNERABILITY || settings._teamDebuffs?.vulnerability === true)) return 1.1;
    if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.CURSE) return 1.05;
    return 1.0;
}

interface RotationState {
    phaseDamagePerTick?: number[];
    phaseEvents?: RotationInput["tickEvents"];
    activeTarget?: string;
    flameboundTargets?: Record<string, boolean>;
    teamDebuffs?: Record<string, Record<string, boolean>>;
    dmgs: number[];
    damageQueue: Record<number, any[]>;
    timers: Record<string, number>;
    tick: number;
    hit_delay: number;
    start_tick: number;
    channelBuffSnapshot?: {damageBuffs: Record<string, boolean>; wenDamage: boolean; wenAccuracy: boolean; locate: boolean};
    cinderHitCount: number;
    poisonDamage: number; // Accumulated poison damage (calculated per-hit for Bik stack scaling)
    poisonPerTick: number[]; // Cumulative poison damage at each tick
    lastAftershockProc: number; // Track damage at last proc
    distributionStats: DamageDistributionStat[]; // Track distribution statistics for Gaussian modeling
    combatStyle: CombatStyle;
    fulProcHistory: number[]; // fulProcHistory[t] = probability mass that procced at tick t
    scrollDamage: number; // Accumulated familiar scroll damage
    familiarPerTick: number[]; // Cumulative familiar damage at each tick
    familiarVariance: number; // Accumulated familiar damage variance
    familiarVariancePerTick: number[]; // Cumulative familiar variance at each tick
    dreadnipDamage: number; // Accumulated dreadnip damage
    dreadnipPerTick: number[]; // Cumulative dreadnip damage at each tick
    dreadnipVariance: number; // Accumulated dreadnip damage variance
    dreadnipVariancePerTick: number[]; // Cumulative dreadnip variance at each tick
    dreadnipActiveTick: number; // Tick when dreadnip was deployed (-1 = inactive)
    dreadnipAttacks: number; // Number of attacks made by current dreadnip
    lastAbilityTick: number; // Last tick with an ability — familiar/dreadnip stop after this
    firstAbilityTick: number; // First tick with a non-nulled ability — familiar/dreadnip start here
    activeConjures: Record<string, { tickSummoned: number; duration: number }>; // Active conjure spirits
    conjureDamage: number; // Accumulated conjure damage
    conjurePerTick: number[]; // Cumulative conjure damage at each tick
    conjureVariance: number; // Accumulated conjure damage variance
    conjureVariancePerTick: number[]; // Cumulative conjure variance at each tick
    // Boss phase tracking
    bossPhases: BossPhase[] | null;
    currentPhaseIdx: number;
    pauseTicksRemaining: number;
    phaseTransitions: PhaseTransitionRecord[];
    // Per-tick resolved ability info
    tickMetadata: Record<number, TickMeta>;
    secondaryDamage?: Record<number, number>;
    secondaryHits?: {tick: number; ability: string; targetIndex: number; expected: number}[];
    targetCounts?: (number | null)[];
    secondaryBik?: Record<number, number>;
    preparedTick?: number;
}

interface DamageDistributionStat {
    tick: number;
    likelihood: number;
    minDamage: number;
    maxDamage: number;
    ability: string;
    distributionType: 'crit' | 'non_crit' | 'combined';
    /** Secondary damage source type. Absent for regular ability hits. */
    source?: 'familiar' | 'dreadnip' | 'conjure' | 'poison' | 'perk';
    // For combined distributions, store the mixture components
    critProbability?: number;
    critMean?: number;
    critVariance?: number;
    critMin?: number;
    critMax?: number;
    nonCritProbability?: number;
    nonCritMean?: number;
    nonCritVariance?: number;
    nonCritMin?: number;
    nonCritMax?: number;
}

interface PhaseTransitionRecord {
    tick: number;
    phaseIdx: number;
    label: string;
    hp: number;
    pause: number;
}

interface TickMeta {
    cooldownRemaining: number;
    resolvedAbility: string;
    duration: number;
}

interface DamageResult {
    phaseDamagePerTick?: number[];
    phaseEvents?: RotationInput["tickEvents"];
    activeTarget?: string;
    flameboundTargets?: Record<string, boolean>;
    teamDebuffs?: Record<string, Record<string, boolean>>;
    regularDamage: number;
    poisonDamage: number;
    familiarDamage: number;
    dreadnipDamage: number;
    conjureDamage: number;
    distributionStats: DamageDistributionStat[];
    poisonPerTick: number[];
    familiarPerTick: number[];
    familiarVariancePerTick: number[];
    dreadnipPerTick: number[];
    dreadnipVariancePerTick: number[];
    conjurePerTick: number[];
    conjureVariancePerTick: number[];
    phaseTransitions: PhaseTransitionRecord[];
    /** Per-tick metadata: resolved ability key and effective duration */
    tickMetadata: Record<number, TickMeta>;
    secondaryDamage?: Record<number, number>;
    secondaryHits?: {tick: number; ability: string; targetIndex: number; expected: number}[];
    /** Captured final state for ability suggestions (only when requested) */
    _finalState?: any;
    _finalSettings?: any;
}

/**
 * Forward-fill a cumulative per-tick array so that ticks without new damage
 * carry forward the last non-zero cumulative value.
 */
function forwardFillCumulative(arr: number[]) {
    let prev = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) {
            prev = arr[i];
        } else {
            arr[i] = prev;
        }
    }
}

/**
 * Calculates the total damage for a given rotation over a specified number of ticks.
 *
 * The calculation process:
 * 1. Processes each tick of the rotation sequentially
 * 2. For each tick:
 *    - Handles any stalled abilities that should activate
 *    - Processes the current ability if one exists
 *    - Performs channelled hit if channelling
 *    - Manages damage queues and timers
 *    - Handles extra actions and buffs
 * 3. Approximates poison damage
 * 4. Approximates familiar damage
 *
 * @param BAR_SIZE - The number of ticks to process in the rotation
 * @returns DamageResult containing regularDamage, poisonDamage, familiarDamage, distributionStats
 */
export function calculateTotalDamage(BAR_SIZE: number): DamageResult {
    // Snapshot rotation data from stores
    const rotation: RotationInput = {
        abilityBar: [...rotationStore.abilityBar],
        extraActionBar: [...rotationStore.extraActionBar],
        nulledTicks: [...rotationStore.nulledTicks],
        stalledAbilities: [...rotationStore.stalledAbilities],
        releasedAbilities: [...rotationStore.releasedAbilities],
        targetCounts: [...rotationStore.targetCounts],
        tickEvents: rotationStore.tickEvents.map(event => event ? {...event} : null),
    };

    // Get settings from the store
    const adaptedSettings = Object.fromEntries(
        Object.entries(settingsStore.settings).map(([key, value]: [string, { value: any }]) => [key, value.value])
    );

    // Pocket and ammo are now resolved per-ability in style_specific_unification

    // Attach gear perks if "use owned gear" mode is enabled
    attachGearPerks(adaptedSettings, ownedItemsStore.ownedGear);

    // Nested loadouts and gear instances are Svelte proxies too. Settings use
    // the same JSON-safe value format as saved rotations; snapshot all of them.
    const settingsCopy = JSON.parse(JSON.stringify(adaptedSettings));
    settingsCopy[SETTINGS.CALC_TYPE] = SETTINGS.CALC_TYPE_VALUES.ROTATION;
    settingsCopy['_combatStyle'] = uiStore.activeTab ?? 'melee';

    logger.log(LogCategory.SETTINGS, 'Damage calculation settings', {
        abilityDamage: settingsCopy[SETTINGS.ABILITY_DAMAGE],
        hitChance: settingsCopy[SETTINGS.HIT_CHANCE],
        rangedLevel: settingsCopy[SETTINGS.RANGED_LEVEL],
        magicLevel: settingsCopy[SETTINGS.MAGIC_LEVEL],
        strengthLevel: settingsCopy[SETTINGS.STRENGTH_LEVEL]
    });

    // Capture state at the next ability placement tick for suggestions
    const captureTick = uiStore.bar?.index ?? BAR_SIZE;
    let capturedSuggestState: any = undefined;
    let capturedSuggestSettings: any = undefined;

    // UI callback: write per-tick buff/stack/cooldown state to stores for timeline rendering
    const onTick: OnTickCallback = (tick, settings, timers) => {
        copyStacks(tick, settings, timers);
        // Keep capturing until we pass the placement tick (only when suggestions enabled)
        if (uiStore.showSuggestions?.value && tick <= captureTick) {
            capturedSuggestState = {
                dmgs: [],
                damageQueue: {},
                timers: JSON.parse(JSON.stringify(timers)),
                tick: 0,
                hit_delay: 1,
                start_tick: 0,
                cinderHitCount: 0,
                poisonDamage: 0,
                poisonPerTick: new Array(30).fill(0),
                lastAftershockProc: 0,
                distributionStats: [],
                combatStyle: settings['_combatStyle'] || 'melee',
                fulProcHistory: [],
                scrollDamage: 0,
                familiarPerTick: new Array(30).fill(0),
                familiarVariance: 0,
                familiarVariancePerTick: new Array(30).fill(0),
                dreadnipDamage: 0,
                dreadnipPerTick: new Array(30).fill(0),
                dreadnipVariance: 0,
                dreadnipVariancePerTick: new Array(30).fill(0),
                dreadnipActiveTick: -1,
                dreadnipAttacks: 0,
                lastAbilityTick: 29,
                firstAbilityTick: 0,
                activeConjures: {},
                conjureDamage: 0,
                conjurePerTick: new Array(30).fill(0),
                conjureVariance: 0,
                conjureVariancePerTick: new Array(30).fill(0),
                bossPhases: null,
                currentPhaseIdx: 0,
                pauseTicksRemaining: 0,
                phaseTransitions: [],
                tickMetadata: {}
            };
            capturedSuggestSettings = JSON.parse(JSON.stringify(settings));
        }
    };

    const result = calculateRotationDamageCore(settingsCopy, rotation, BAR_SIZE, onTick);
    // Finalize once, after delayed hits too, rather than at a separate UI bar size.
    let buffIndex = 0;
    for (const buff of Object.values(rotationStore.buffs) as any[]) {
        buff.activeRows = buff.buffTicks.flatMap((value: any, tick: number) =>
            value && value !== 'none' ? [tick] : []);
        buff.idx = buff.activeRows.length ? buffIndex++ : -1;
    }
    result._finalState = capturedSuggestState;
    result._finalSettings = capturedSuggestSettings;
    return result;
}

/**
 * Core damage calculation function - decoupled from stores.
 * Can be called directly for single-ability calculations or testing.
 *
 * @param settings - Flat settings object (key -> value)
 * @param rotation - Rotation data (ability bar, extra actions, nulled ticks, stalled abilities)
 * @param barSize - The number of ticks to process
 * @returns DamageResult containing regularDamage, poisonDamage, familiarDamage, distributionStats
 */
export function calculateRotationDamageCore(
    settings: Record<string, any>,
    rotation: RotationInput,
    barSize: number,
    onTick?: OnTickCallback
): DamageResult {
    const state: RotationState = {
        dmgs: [],
        damageQueue: {},
        timers: {},
        tick: 0,
        hit_delay: 1,
        start_tick: 0,
        cinderHitCount: 0,
        poisonDamage: 0,
        poisonPerTick: new Array(barSize).fill(0),
        lastAftershockProc: 0,
        distributionStats: [],
        combatStyle: settings['_combatStyle'] || "melee",
        fulProcHistory: [],
        scrollDamage: 0,
        familiarPerTick: new Array(barSize).fill(0),
        familiarVariance: 0,
        familiarVariancePerTick: new Array(barSize).fill(0),
        dreadnipDamage: 0,
        dreadnipPerTick: new Array(barSize).fill(0),
        dreadnipVariance: 0,
        dreadnipVariancePerTick: new Array(barSize).fill(0),
        dreadnipActiveTick: -1,
        dreadnipAttacks: 0,
        lastAbilityTick: -1,
        firstAbilityTick: -1,
        activeConjures: {},
        conjureDamage: 0,
        conjurePerTick: new Array(barSize).fill(0),
        conjureVariance: 0,
        conjureVariancePerTick: new Array(barSize).fill(0),
        bossPhases: null,
        currentPhaseIdx: 0,
        pauseTicksRemaining: 0,
        phaseTransitions: [],
        phaseEvents: rotation.tickEvents,
        tickMetadata: {}
    };

    // Find the last tick that has an ability (familiar/dreadnip stop after this)
    for (let i = rotation.abilityBar.length - 1; i >= 0; i--) {
        if (rotation.abilityBar[i] != null || rotation.releasedAbilities?.[i]) {
            state.lastAbilityTick = i;
            break;
        }
    }

    // Find the first tick with a non-nulled ability (familiar/dreadnip start here)
    for (let i = 0; i < rotation.abilityBar.length; i++) {
        if ((rotation.abilityBar[i] != null || rotation.releasedAbilities?.[i]) && !(rotation.nulledTicks[i] ?? false)) {
            state.firstAbilityTick = i;
            break;
        }
    }

    const settingsCopy = structuredClone(settings);
    settingsCopy._gearPerks ??= {};

    // Resolve boss preset for soft cap and phase tracking (if not already set by caller)
    if (!settingsCopy['_softCap']) {
        const bossKey = settingsCopy[SETTINGS.BOSS_PRESET];
        const bossEnrage = settingsCopy[SETTINGS.BOSS_ENRAGE] ?? 0;
        if (bossKey && bossKey !== 'none') {
            const boss = getBossPresetWithEnrage(bossKey, bossEnrage);
            if (boss?.softCap) {
                settingsCopy['_softCap'] = boss.softCap;
            }
            if (boss?.phases?.length) {
                state.bossPhases = boss.phases;
            }
            if (boss?.health) {
                settingsCopy['_bossHealth'] = boss.health;
            }
        } else if (settingsCopy[SETTINGS.BOSS_HP] > 0) {
            // Custom boss: single phase at the user-specified HP
            state.bossPhases = [{ hp: settingsCopy[SETTINGS.BOSS_HP] }];
        }
    }

    // Resolve starting equipment before applying its adrenaline cap.
    const firstCast = rotation.abilityBar.find(key => key && abils[key]?.mainStyle !== 'defence');
    style_specific_unification(settingsCopy, firstCast ? abils[firstCast].mainStyle : settingsCopy._combatStyle ?? 'ranged');

    // Reconcile a saved starting value after changing maximum-adrenaline relics.
    addAdrenaline(settingsCopy, 0, false);

    // Initialize familiar spec points and regen accumulator
    settingsCopy[SETTINGS.FAMILIAR_SPEC_POINTS] = 60;
    settingsCopy[SETTINGS.FAMILIAR_SPEC_REGEN_ACCUMULATOR] = 0;
    settingsCopy[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS] = 0;

    logger.log(LogCategory.SETTINGS, 'Core damage calculation settings', {
        abilityDamage: settingsCopy[SETTINGS.ABILITY_DAMAGE],
        hitChance: settingsCopy[SETTINGS.HIT_CHANCE]
    });

    // Process through each tick until we reach the end, +20 to finish handling bleeds
    const extraTicks = 20;
    while (state.tick < barSize + extraTicks) {
        processCurrentTickCore(state, settingsCopy, barSize, rotation, onTick);
    }

    // Forward-fill cumulative per-tick arrays so ticks without new damage carry the previous cumulative value
    forwardFillCumulative(state.poisonPerTick);
    forwardFillCumulative(state.familiarPerTick);
    forwardFillCumulative(state.familiarVariancePerTick);
    forwardFillCumulative(state.dreadnipPerTick);
    forwardFillCumulative(state.dreadnipVariancePerTick);
    forwardFillCumulative(state.conjurePerTick);
    forwardFillCumulative(state.conjureVariancePerTick);

    const totalDamage = state.dmgs.reduce((acc, current) => acc + current, 0);

    return {
        regularDamage: totalDamage,
        phaseDamagePerTick: state.phaseDamagePerTick ?? [],
        secondaryDamage: state.secondaryDamage ?? {},
        secondaryHits: state.secondaryHits ?? [],
        poisonDamage: state.poisonDamage,
        familiarDamage: state.scrollDamage,
        dreadnipDamage: state.dreadnipDamage,
        conjureDamage: state.conjureDamage,
        distributionStats: state.distributionStats,
        poisonPerTick: state.poisonPerTick,
        familiarPerTick: state.familiarPerTick,
        familiarVariancePerTick: state.familiarVariancePerTick,
        dreadnipPerTick: state.dreadnipPerTick,
        dreadnipVariancePerTick: state.dreadnipVariancePerTick,
        conjurePerTick: state.conjurePerTick,
        conjureVariancePerTick: state.conjureVariancePerTick,
        phaseTransitions: state.phaseTransitions,
        tickMetadata: state.tickMetadata
    };
}

export interface AbilitySuggestion {
    key: string;
    title: string;
    icon: string;
    damage: number;
    style: string;
}

/**
 * Given the final state from a rotation calc, trial each candidate ability
 * and return them ranked by damage contribution.
 *
 * @param finalState - Captured RotationState from calculateRotationDamageCore
 * @param finalSettings - Captured settingsCopy
 * @param candidateAbilities - Ability keys to try (pre-filtered by style etc.)
 * @param simTicks - How many ticks to simulate after placing the ability (default 30)
 * @returns Sorted array of suggestions, highest damage first
 */
export function suggestNextAbility(
    finalState: any,
    finalSettings: any,
    candidateAbilities: string[],
    simTicks: number = 30
): AbilitySuggestion[] {
    const suggestions: AbilitySuggestion[] = [];

    for (const abilKey of candidateAbilities) {
        const abilData = abils[abilKey];
        if (!abilData?.title) continue;

        // Skip if on cooldown
        if (finalState.timers[COOLDOWN_PREFIX + abilKey] > 0) continue;

        // Skip if not enough adrenaline
        const adrenalineCost = abilData.adrenaline ?? 0;
        if (adrenalineCost > 0 && (finalSettings[SETTINGS.ADRENALINE] ?? 0) < adrenalineCost) continue;

        // Skip self-cast, conjure, proc, perk abilities
        const classification = abilData.abilityClassification;
        if (classification === 'self cast' || classification === 'conjure' || classification === 'proc' || classification === 'perk') continue;

        // Clone state and settings for trial (JSON clone to strip Svelte Proxies)
        const trialState = JSON.parse(JSON.stringify(finalState));
        const trialSettings = JSON.parse(JSON.stringify(finalSettings));
        const abil_duration = typeof abilData.duration === 'number' ? abilData.duration : 3;

        // Reset tick to 0 for the mini rotation, clear stale damage queue
        trialState.tick = 0;
        trialState.start_tick = 0;
        trialState.damageQueue = {};

        // Build a mini rotation with just this ability
        const miniBarSize = simTicks;
        const miniRotation: RotationInput = {
            abilityBar: Array(miniBarSize).fill(null),
            extraActionBar: Array(miniBarSize).fill(null),
            nulledTicks: Array(miniBarSize).fill(false),
            stalledAbilities: Array(miniBarSize).fill(null)
        };
        miniRotation.abilityBar[0] = abilKey;

        // Resolve Tumeken's asphyxiate swap
        const resolvedKey = resolveTumekensAsphyxiate(abilKey, trialSettings);

        // Run the ability through the pipeline
        try {
            processAbilityCore(trialState, trialSettings, resolvedKey as ABILITIES, abil_duration, miniRotation);

            // Run remaining ticks to resolve queued damage
            while (trialState.tick < miniBarSize) {
                processTickOperations(trialState.tick, trialState, trialSettings, miniRotation);
            }

            const trialDamage = trialState.dmgs.reduce((a: number, b: number) => a + b, 0);

            suggestions.push({
                key: abilKey,
                title: abilData.title,
                icon: abilData.icon ?? '',
                damage: trialDamage,
                style: abilData.mainStyle ?? 'unknown'
            });
        } catch (e) {
            console.warn(`[suggest] Error simulating ${abilKey}:`, e);
        }
    }

    // Sort by damage, highest first
    suggestions.sort((a, b) => b.damage - a.damage);
    return suggestions;
}

/**
 * Processes a tick of the rotation, handling both stalled and regular abilities.
 *
 * The processing order:
 * 1. Check if the current tick is nulled (no damage)
 * 2. Process any stalled ability that should activate on this tick
 * 3. If no ability is queued for this tick:
 *    - Handle extra actions (like potions or gear swaps)
 *    - Update buff timers and stacks
 * 4. If an ability is queued:
 *    - Process the ability and its effects
 *    - Handle ability-specific mechanics
 *    - Queue the resulting damage for future ticks
 *
 * @param state - The current rotation state tracking damage, queues, and timers
 * @param settingsCopy - A copy of the game settings that can be modified during processing
 * @param BAR_SIZE - The total size of the ability bar
 */
/**
 * Processes a tick of the rotation. Handles stalled abilities, regular abilities,
 * channelled hits, damage queues, timers, and extra actions.
 * When onTick is provided, it fires per-tick for UI state updates (e.g. copyStacks).
 */
function prepareTick(state: RotationState, settings: any, rotation: RotationInput) {
    if (state.preparedTick === state.tick) return;
    state.preparedTick = state.tick;
    const event = rotation.tickEvents?.[state.tick];
    if (event?.targetId && event.targetId !== state.activeTarget) {
        const previous = state.activeTarget ?? 'Initial target';
        const targets = state.flameboundTargets ??= {};
        targets[previous] = settings[SETTINGS.FLAMEBOUND_RIVAL] === true;
        // Starting buffs belong to the named starting target.
        settings[SETTINGS.FLAMEBOUND_RIVAL] = targets[event.targetId] ?? (state.tick === 0 ? targets[previous] : false);
        state.activeTarget = event.targetId;
    }
    const teamTargets = state.teamDebuffs ??= {};
    const targetId = state.activeTarget ?? 'Initial target';
    if (event?.teamDebuffs) Object.assign(teamTargets[targetId] ??= {}, event.teamDebuffs);
    settings._teamDebuffs = teamTargets[targetId] ?? {};
    settings._rotationTick = state.tick;
    settings._malachiResetOverride = event?.malachiReset;
    applyAccuracyEvent(settings, event);
    prepareAdrenalineTick(settings, state.tick, event);
    if (event?.phase) {
        clearPhaseStacks(settings, event.clearStacks);
        if (event.clearStacks?.includes(SETTINGS.BIK_STACKS)) state.secondaryBik = {};
        const pause = Math.max(0, Math.min(300, Math.floor(event.downtime ?? 0)));
        state.pauseTicksRemaining = Math.max(state.pauseTicksRemaining, pause);
        state.phaseTransitions.push({tick: state.tick, phaseIdx: state.currentPhaseIdx, label: event.phase, hp: 0, pause});
    }
    handleExtraActionsCore(settings, state.timers, state.tick, rotation);
    addAdrenaline(settings, 0, false);
    prepareReaperStacks(settings, state.tick);
    recalcFulProbability(state, settings);
    if (settings._chainPending && state.tick >= settings._chainPending.expires) {
        settings._chainPending = null;
        settings[SETTINGS.GREATER_CHAIN] = false;
    }
}

function processCurrentTickCore(
    state: RotationState,
    settingsCopy: any,
    barSize: number,
    rotation: RotationInput,
    onTick?: OnTickCallback
) {
    state.targetCounts = rotation.targetCounts;
    prepareTick(state, settingsCopy, rotation);
    // Store nulled state at the start
    const isNulledTick = rotation.nulledTicks[state.tick] ?? false;
    settingsCopy.isNulledTick = isNulledTick;

    // Stalling pays/generates adrenaline now; it never enters the hit pipeline.
    const stalledAbility = rotation.stalledAbilities[state.tick];
    if (stalledAbility && abils[stalledAbility] && !['channel', 'self cast', 'proc', 'perk'].includes(abils[stalledAbility].abilityClassification)) {
        interruptCrystalChannel(settingsCopy);
        style_specific_unification(settingsCopy, abils[stalledAbility].mainStyle);
        addAdrenaline(settingsCopy, 0, false);
        settingsCopy['ability'] = stalledAbility;
        on_stall(settingsCopy, stalledAbility, state.timers, true);
        settingsCopy._pendingStall = stalledAbility;
    }
    const releasedAbility = rotation.releasedAbilities?.[state.tick];
    if (releasedAbility && settingsCopy._pendingStall === releasedAbility) {
        applyActionAmmo(settingsCopy, rotation.tickEvents?.[state.tick]?.releaseAmmo);
        enterCombat(settingsCopy);
        delete settingsCopy._pendingStall;
        style_specific_unification(settingsCopy, abils[releasedAbility].mainStyle);
    addAdrenaline(settingsCopy, 0, false);
        state.combatStyle = abils[releasedAbility].mainStyle;
        prepareChainCast(settingsCopy, releasedAbility, state.tick, targetCountAt(state.targetCounts, state.tick));
        settingsCopy['ability'] = releasedAbility;
        if (!settingsCopy[SETTINGS.USE_RAW_ABILITY_DAMAGE]) settingsCopy[SETTINGS.ABILITY_DAMAGE] = calc_base_ad(settingsCopy);
        state.start_tick = state.tick;
        const hitTick = state.tick + state.hit_delay;
        state.damageQueue[hitTick] ??= [];
        applyActivationEffects(settingsCopy, releasedAbility, state.timers);
        settingsCopy._salvoCastKey = releasedAbility;
        settingsCopy._salvoCastBonus = settingsCopy[SETTINGS.CRIMSON_SALVO] ? 1 : (settingsCopy._salvoProbability ?? 0);
        handleBuffs(settingsCopy, state.timers, releasedAbility);
        processStalledAbility(state, settingsCopy, releasedAbility, hitTick);
        finishMalachiCast(settingsCopy, releasedAbility, state.timers);
    }

    // Let callback set the next ability before we read it
    if (onTick && state.tick < barSize) {
        onTick(state.tick, settingsCopy, state.timers, rotation, state);
    }

    // handle either afking or channelling if no ability on this tick
    let abilityKey = rotation.abilityBar[state.tick];
    if (abilityKey == null) {
        handleNullAbilityTickCore(state, settingsCopy, rotation, onTick);
        return;
    }

    applyActionAmmo(settingsCopy, rotation.tickEvents?.[state.tick]?.castAmmo);

    // A crystal started alongside a self-cast buff begins charging on the next tick.
    if (settingsCopy._crystalStartedTick !== state.tick) interruptCrystalChannel(settingsCopy);
    if (abils[abilityKey]?.abilityClassification !== 'self cast') enterCombat(settingsCopy);
    delete settingsCopy._pendingStall; // A new cast replaces an unreleased ability.

    // The explicit flank choice uses Snipe's cast rules, cooldown and channel.
    settingsCopy._nightmareFlankCast = abilityKey === ABILITIES.SNIPE_FLANK;
    if (settingsCopy._nightmareFlankCast) abilityKey = ABILITIES.SNIPE;

    // Swap asphyxiate for Tumeken's variant if wearing 4+ pieces
    abilityKey = resolveTumekensAsphyxiate(abilityKey, settingsCopy);

    // Endless Assault: convert melee channels to multihit when Greater Barge buff is active
    if (settingsCopy[SETTINGS.ENDLESS_ASSAULT] === true) {
        if (abilityKey === ABILITIES.ASSAULT) {
            abilityKey = ABILITIES.ASSAULT_BARGE;
            settingsCopy[SETTINGS.ENDLESS_ASSAULT] = false;
            delete state.timers[SETTINGS.ENDLESS_ASSAULT];
        } else if (abilityKey === ABILITIES.GREATER_FLURRY) {
            abilityKey = ABILITIES.GREATER_FLURRY_BARGE;
            settingsCopy[SETTINGS.ENDLESS_ASSAULT] = false;
            delete state.timers[SETTINGS.ENDLESS_ASSAULT];
        } else if (abilityKey === ABILITIES.FLURRY) {
            abilityKey = ABILITIES.FLURRY_BARGE;
            settingsCopy[SETTINGS.ENDLESS_ASSAULT] = false;
            delete state.timers[SETTINGS.ENDLESS_ASSAULT];
        }
    }

    const abil_duration = typeof abils[abilityKey]['duration'] === 'number' ? abils[abilityKey]['duration'] : 3;
    state.tickMetadata[state.tick] = { resolvedAbility: abilityKey, duration: abil_duration,
        // Timers include the current tick, which is decremented during processing.
        cooldownRemaining: Math.max(0, (state.timers[COOLDOWN_PREFIX + abilityKey] ?? 0) - 1) };
    settingsCopy['ability'] = abilityKey;

    processAbilityCore(state, settingsCopy, abilityKey as ABILITIES, abil_duration, rotation, onTick);

}

/**
 * Core version - handles null ability tick (no ability on this tick) without store access
 */
function handleNullAbilityTickCore(state: RotationState, settingsCopy: any, rotation: RotationInput, onTick?: OnTickCallback) {
    processTickOperations(state.tick, state, settingsCopy, rotation, onTick);
}

/**
 * Processes tick operations (without store access for UI updates)
 */
function processTickOperations(
    tickToProcess: number,
    state: RotationState,
    settingsCopy: any,
    rotation: RotationInput,
    onTick?: OnTickCallback
) {
    settingsCopy[SETTINGS.TIME_SINCE_ATTACK] = (settingsCopy[SETTINGS.TIME_SINCE_ATTACK] ?? 0) + 1;
    // During boss phase pause (invulnerable): still tick down buffs/timers, but skip damage
    if (state.pauseTicksRemaining > 0) {
        state.pauseTicksRemaining--;
        delete state.damageQueue[tickToProcess];
        handleTimers(state.timers, settingsCopy);
        onTick?.(state.tick, settingsCopy, state.timers);
        state.tick += 1;
        return;
    }

    prepareTick(state, settingsCopy, rotation);
    onTick?.(state.tick, settingsCopy, state.timers);
    recalcFulProbability(state, settingsCopy);
    handleTimers(state.timers, settingsCopy);
    // Pre-fight actions still advance buffs, gear and cooldowns. Discard hits
    // landing before Start Tick and keep all damage sources out of boss HP.
    if (tickToProcess < (settingsCopy[SETTINGS.BOSS_PATTERN_START] ?? -1)) {
        delete state.damageQueue[tickToProcess];
        state.tick += 1;
        return;
    }
    const firstHit = state.dmgs.length;
    const otherDamage = () => state.poisonDamage + state.scrollDamage + state.dreadnipDamage + state.conjureDamage
        + Object.values(state.secondaryDamage ?? {}).reduce((sum: number, damage: number) => sum + damage, 0);
    const otherBefore = otherDamage();
    processQueuedDamage(tickToProcess, state, settingsCopy);
    if (!settingsCopy.aftershockDisabled) handleAftershock(state, settingsCopy);
    handleCrackling(state, settingsCopy);
    processSecondaryDamageWithBudget(state, settingsCopy);
    updateBossHpPercent(state, settingsCopy);
    (state.phaseDamagePerTick ??= [])[tickToProcess] = (state.phaseDamagePerTick[tickToProcess] ?? 0) + state.dmgs.slice(firstHit).reduce((sum, damage) => sum + damage, 0)
        + otherDamage() - otherBefore;

    state.tick += 1;
}

// ===================== Familiar Tick Processing =====================

// Base regen: 15 points per 30 seconds = 15 points per 50 ticks = 0.3 per tick
const FAMILIAR_BASE_REGEN_RATE = 15 / 50; // 0.3 points per tick
// Summoning renewal: 60 points over 6 minutes (600 ticks) = 0.1 per tick
const SUMMONING_RENEWAL_REGEN_RATE = 60 / 600; // 0.1 points per tick
// Prism of Restoration: 1 point per 3 ticks
const PRISM_REGEN_RATE = 1 / 3;
// Prism scroll save chance
const PRISM_SCROLL_SAVE_CHANCE = 0.1;

/**
 * Process secondary damage sources (familiar, dreadnip, conjure) with phase budget awareness.
 * Snapshots damage before and after each source, and clamps any excess if a capped phase is active.
 */
function processSecondaryDamageWithBudget(state: RotationState, settingsCopy: any) {
    const sources: Array<{ process: () => void, field: 'scrollDamage' | 'dreadnipDamage' | 'conjureDamage' }> = [
        { process: () => processFamiliarTick(state, settingsCopy), field: 'scrollDamage' },
        { process: () => processDreadnipTick(state, settingsCopy), field: 'dreadnipDamage' },
        { process: () => processConjureTick(state, settingsCopy), field: 'conjureDamage' },
    ];

    for (const source of sources) {
        const budget = getPhaseDamageBudget(state);
        const before = state[source.field];
        source.process();
        const added = state[source.field] - before;

        if (budget !== null && added > 0) {
            const allowed = Math.max(0, Math.min(added, budget));
            state[source.field] = before + allowed;
            // Update per-tick array to reflect clamped value
            if (source.field === 'scrollDamage' && state.tick < state.familiarPerTick.length) {
                state.familiarPerTick[state.tick] = state[source.field];
            } else if (source.field === 'dreadnipDamage' && state.tick < state.dreadnipPerTick.length) {
                state.dreadnipPerTick[state.tick] = state[source.field];
            } else if (source.field === 'conjureDamage' && state.tick < state.conjurePerTick.length) {
                state.conjurePerTick[state.tick] = state[source.field];
            }
        }

        checkPhaseTransition(state, settingsCopy);
    }

    updateBossHpPercent(state, settingsCopy);
}

/**
 * Process familiar actions for a single tick:
 * - Spec point regeneration (base + renewal + incense + prism)
 * - Auto-attack or scroll use on attack ticks
 */
function processFamiliarTick(state: RotationState, settings: any) {
    const familiar = settings[SETTINGS.FAMILIAR];
    if (!familiar || familiar === SETTINGS.FAMILIAR_VALUES.NONE) return;
    // Familiar doesn't attack before the first non-nulled ability or after the last ability
    if (state.firstAbilityTick < 0 || state.tick < state.firstAbilityTick) return;
    if (state.lastAbilityTick < 0 || state.tick > state.lastAbilityTick) return;

    const familiarData = familiars[familiar];
    if (!familiarData) return;

    // --- Spec point regeneration ---
    const incensePotency = settings[SETTINGS.SPIRIT_WEED_INCENSE] || 0;
    const incenseMultiplier = 1 + incensePotency * 0.1;

    let regenRate = FAMILIAR_BASE_REGEN_RATE * incenseMultiplier;

    if (settings[SETTINGS.SUMMONING_RENEWAL]) {
        regenRate += SUMMONING_RENEWAL_REGEN_RATE;
    }

    if (settings[SETTINGS.PRISM_OF_RESTORATION]) {
        regenRate += PRISM_REGEN_RATE;
    }

    // Accumulate fractional regen
    const accumulator = (settings[SETTINGS.FAMILIAR_SPEC_REGEN_ACCUMULATOR] || 0) + regenRate;
    const wholePoints = Math.floor(accumulator);
    settings[SETTINGS.FAMILIAR_SPEC_REGEN_ACCUMULATOR] = accumulator - wholePoints;
    settings[SETTINGS.FAMILIAR_SPEC_POINTS] = Math.min(60, (settings[SETTINGS.FAMILIAR_SPEC_POINTS] || 0) + wholePoints);

    // --- Familiar attack on attack ticks ---
    if (state.tick > 0 && state.tick % familiarData.attack_rate === 0) {
        const accuracy = Math.min(settings[SETTINGS.FAMILIAR_ACCURACY] / 100, 1);
        const useScrolls = settings[SETTINGS.USE_FAMILIAR_SCROLLS];

        // Try scroll use if enabled and familiar has a DPS spec
        if (useScrolls && familiarData.has_dps_spec && familiarData.spec_cost > 0) {
            let effectiveCost = familiarData.spec_cost;
            if (settings[SETTINGS.SPIRIT_CAPE]) {
                effectiveCost = Math.floor(effectiveCost * 0.8);
            }

            const specPoints = settings[SETTINGS.FAMILIAR_SPEC_POINTS] || 0;
            if (specPoints >= effectiveCost) {
                // Prism of Restoration: 10% chance to save scroll (use expected cost for deterministic calc)
                let expectedCost = effectiveCost;
                if (settings[SETTINGS.PRISM_OF_RESTORATION]) {
                    expectedCost = effectiveCost * (1 - PRISM_SCROLL_SAVE_CHANCE);
                }
                settings[SETTINGS.FAMILIAR_SPEC_POINTS] = specPoints - expectedCost;

                const minRoll = familiarData.spec_min_roll ?? 0.2;
                const vuln = getVulnMultiplier(settings);
                const specMin = Math.floor(familiarData.spec_damage * minRoll * accuracy * vuln);
                const specMax = Math.floor(familiarData.spec_damage * accuracy * vuln);
                const expectedDamage = (specMin + specMax) / 2;
                state.scrollDamage += Math.floor(expectedDamage);
                state.familiarVariance += Math.pow(specMax - specMin, 2) / 12;
                if (state.tick < state.familiarPerTick.length) {
                    state.familiarPerTick[state.tick] = state.scrollDamage;
                    state.familiarVariancePerTick[state.tick] = state.familiarVariance;
                }
                state.distributionStats.push({
                    tick: state.tick,
                    likelihood: 1,
                    minDamage: specMin,
                    maxDamage: specMax,
                    ability: familiarData.name + ' scroll',
                    distributionType: 'non_crit',
                    source: 'familiar'
                });
                return; // Used scroll instead of auto-attack
            }
        }

        // Normal auto-attack (rolls 20-100% of max_hit)
        const vuln = getVulnMultiplier(settings);
        const minAutoHit = Math.floor(accuracy * familiarData.max_hit * 0.2 * vuln);
        const maxAutoHit = Math.floor(accuracy * familiarData.max_hit * vuln);
        const expAutoHit = (minAutoHit + maxAutoHit) / 2;
        state.scrollDamage += Math.floor(expAutoHit);
        state.familiarVariance += Math.pow(maxAutoHit - minAutoHit, 2) / 12;
        if (state.tick < state.familiarPerTick.length) {
            state.familiarPerTick[state.tick] = state.scrollDamage;
            state.familiarVariancePerTick[state.tick] = state.familiarVariance;
        }
        state.distributionStats.push({
            tick: state.tick,
            likelihood: 1,
            minDamage: minAutoHit,
            maxDamage: maxAutoHit,
            ability: familiarData.name + ' auto',
            distributionType: 'non_crit',
            source: 'familiar'
        });
    }
}

// ===================== Dreadnip Tick Processing =====================

/**
 * Process dreadnip for a single tick.
 * Dreadnip is activated via the extra action bar (off-GCD).
 * Once active, it attacks every 4 ticks for up to 18 attacks over 75 ticks.
 */
function processDreadnipTick(state: RotationState, settings: any) {
    // Check for deploy signal from handleExtraActions
    if (state.timers['_dreadnip_deploy']) {
        state.dreadnipActiveTick = state.tick;
        state.dreadnipAttacks = 0;
        delete state.timers['_dreadnip_deploy'];
    }

    if (state.dreadnipActiveTick < 0) return; // Not deployed
    // Dreadnip stops attacking after the last ability tick
    if (state.lastAbilityTick < 0 || state.tick > state.lastAbilityTick) return;

    const ticksSinceDeployed = state.tick - state.dreadnipActiveTick;

    // Check if dreadnip expired
    if (ticksSinceDeployed > dreadnipData.duration || state.dreadnipAttacks >= dreadnipData.max_attacks) {
        state.dreadnipActiveTick = -1; // Expired
        return;
    }

    // Attack every attack_rate ticks after deployment
    if (ticksSinceDeployed > 0 && ticksSinceDeployed % dreadnipData.attack_rate === 0) {
        // Calculate hit chance from boss preset affinities
        const bossKey = settings[SETTINGS.BOSS_PRESET];
        const enrage = settings[SETTINGS.BOSS_ENRAGE] ?? 0;
        let accuracy = 1; // Default 100% if no boss set
        if (bossKey && bossKey !== 'none') {
            const boss = getBossPresetWithEnrage(bossKey, enrage);
            if (boss) {
                const armourStat = boss.armour < 100
                    ? Math.round(0.002 * boss.armour ** 3 + 10 * boss.armour + 100)
                    : boss.armour;
                // Use calculateFamiliarHitChance with dreadnip accuracy data
                const dreadnipAsFamiliar = {
                    melee_accuracy: dreadnipData.melee_accuracy,
                    ranged_accuracy: dreadnipData.ranged_accuracy,
                    magic_accuracy: dreadnipData.magic_accuracy,
                } as any;
                accuracy = calculateFamiliarHitChance(
                    dreadnipAsFamiliar,
                    armourStat,
                    { melee: boss.affinities.melee, ranged: boss.affinities.ranged, magic: boss.affinities.magic }
                );
            }
        }

        const vuln = getVulnMultiplier(settings);
        const dnMin = Math.floor(1 * accuracy * vuln);
        const dnMax = Math.floor(900 * accuracy * vuln);
        const expectedDamage = Math.floor((dnMin + dnMax) / 2);
        state.dreadnipDamage += expectedDamage;
        state.dreadnipVariance += Math.pow(dnMax - dnMin, 2) / 12;
        state.dreadnipAttacks++;
        if (state.tick < state.dreadnipPerTick.length) {
            state.dreadnipPerTick[state.tick] = state.dreadnipDamage;
            state.dreadnipVariancePerTick[state.tick] = state.dreadnipVariance;
        }
        state.distributionStats.push({
            tick: state.tick,
            likelihood: 1,
            minDamage: dnMin,
            maxDamage: dnMax,
            ability: 'Dreadnip',
            distributionType: 'non_crit',
            source: 'dreadnip'
        });
    }
}

// Conjure spirit definitions: which auto-attack ability each conjure uses and its attack rate
const CONJURE_DEFINITIONS: Record<string, {
    autoAbility: ABILITIES;
    attackRate: number;
    poisonAbility?: ABILITIES;
    poisonRate?: number;
}> = {
    'conjure_skeleton_warrior': { autoAbility: ABILITIES.SKELETON_WARRIOR_AUTO, attackRate: 5 }, // 3s = 5 ticks
    'conjure_vengeful_ghost': { autoAbility: ABILITIES.VENGEFUL_GHOST_AUTO, attackRate: 7 },     // 4.2s = 7 ticks
    'conjure_putrid_zombie': {
        autoAbility: ABILITIES.PUTRID_ZOMBIE_AUTO, attackRate: 6,       // 3.6s = 6 ticks
        poisonAbility: ABILITIES.PUTRID_ZOMBIE_POISON, poisonRate: 3    // 1.8s = 3 ticks
    },
    // Phantom Guardian: purely defensive (damage reduction), no auto-attacks to process
};

function processConjureTick(state: RotationState, settings: any) {
    // Conjures stop attacking after the last ability tick
    if (state.lastAbilityTick < 0 || state.tick > state.lastAbilityTick) return;

    const damageMultiplier = getConjureDamageMultiplier(settings);

    for (const [conjureKey, def] of Object.entries(CONJURE_DEFINITIONS)) {
        const remaining = state.timers[conjureKey];
        if (!remaining || remaining <= 0) continue;

        // Attack on every attackRate tick (offset by 1 so first attack isn't instant)
        if (state.tick > 0 && state.tick % def.attackRate === 0) {
            const abilData = abils[def.autoAbility];
            if (!abilData) continue;

            const minHit = abilData.minHit;
            const varHit = abilData.varHit;
            const avgPercent = minHit + varHit / 2;
            const baseDamage = avgPercent * settings[SETTINGS.ABILITY_DAMAGE];

            // Apply rage stacks for skeleton warrior
            let rageMult = 1;
            if (conjureKey === 'conjure_skeleton_warrior') {
                const rageStacks = settings[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS] || 0;
                rageMult = 1 + 0.03 * rageStacks;
                settings[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS] = rageStacks + 1;
            }

            // Apply haunted for vengeful ghost
            if (conjureKey === 'conjure_vengeful_ghost' && state.timers["command_vengeful_ghost"] >= 0) {
                settings[SETTINGS.HAUNTED] = true;
                settings[SETTINGS.HAUNTED_AD] = settings[SETTINGS.ABILITY_DAMAGE];
                state.timers[SETTINGS.HAUNTED] = 8; // 4.8s = 8 ticks
            }

            const vuln = getVulnMultiplier(settings);
            const cjMin = Math.floor(minHit * settings[SETTINGS.ABILITY_DAMAGE] * rageMult * damageMultiplier * vuln);
            const cjMax = Math.floor((minHit + varHit) * settings[SETTINGS.ABILITY_DAMAGE] * rageMult * damageMultiplier * vuln);
            const expectedDamage = Math.floor((cjMin + cjMax) / 2);
            state.conjureDamage += expectedDamage;
            state.conjureVariance += Math.pow(cjMax - cjMin, 2) / 12;
            if (state.tick < state.conjurePerTick.length) {
                state.conjurePerTick[state.tick] = state.conjureDamage;
                state.conjureVariancePerTick[state.tick] = state.conjureVariance;
            }
            state.distributionStats.push({
                tick: state.tick,
                likelihood: 1,
                minDamage: cjMin,
                maxDamage: cjMax,
                ability: abilData.title || def.autoAbility,
                distributionType: 'non_crit',
                source: 'conjure'
            });
        }

        // Command burst hits
        const commandKey = 'command_' + conjureKey.replace('conjure_', '');
        if (state.timers[commandKey] && state.timers[commandKey] > 0) {
            const cmdVuln = getVulnMultiplier(settings);
            if (conjureKey === 'conjure_putrid_zombie') {
                // Command Putrid Zombie: single 360-440% explosion using its own ability data
                const cmdAbilData = abils[ABILITIES.COMMAND_PUTRID_ZOMBIE];
                if (cmdAbilData) {
                    const czMin = Math.floor(cmdAbilData.minHit * settings[SETTINGS.ABILITY_DAMAGE] * damageMultiplier * cmdVuln);
                    const czMax = Math.floor((cmdAbilData.minHit + cmdAbilData.varHit) * settings[SETTINGS.ABILITY_DAMAGE] * damageMultiplier * cmdVuln);
                    state.conjureDamage += Math.floor((czMin + czMax) / 2);
                    state.conjureVariance += Math.pow(czMax - czMin, 2) / 12;
                    if (state.tick < state.conjurePerTick.length) {
                        state.conjurePerTick[state.tick] = state.conjureDamage;
                        state.conjureVariancePerTick[state.tick] = state.conjureVariance;
                    }
                    state.distributionStats.push({
                        tick: state.tick, likelihood: 1,
                        minDamage: czMin, maxDamage: czMax,
                        ability: cmdAbilData.title || 'Command Putrid Zombie',
                        distributionType: 'non_crit',
                        source: 'conjure'
                    });
                }
            }
            else {
                // Command Skeleton Warrior: 1 hit per tick during command (10 hits over 10 ticks)
                const cmdAbilData = abils[def.autoAbility];
                if (cmdAbilData) {
                    let cmdRageMult = 1;
                    if (conjureKey === 'conjure_skeleton_warrior') {
                        const rageStacks = settings[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS] || 0;
                        cmdRageMult = 1 + 0.03 * rageStacks;
                        settings[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS] = rageStacks + 1;
                    }
                    const csMin = Math.floor(cmdAbilData.minHit * settings[SETTINGS.ABILITY_DAMAGE] * cmdRageMult * damageMultiplier * cmdVuln);
                    const csMax = Math.floor((cmdAbilData.minHit + cmdAbilData.varHit) * settings[SETTINGS.ABILITY_DAMAGE] * cmdRageMult * damageMultiplier * cmdVuln);
                    state.conjureDamage += Math.floor((csMin + csMax) / 2);
                    state.conjureVariance += Math.pow(csMax - csMin, 2) / 12;
                    if (state.tick < state.conjurePerTick.length) {
                        state.conjurePerTick[state.tick] = state.conjureDamage;
                        state.conjureVariancePerTick[state.tick] = state.conjureVariance;
                    }
                    state.distributionStats.push({
                        tick: state.tick, likelihood: 1,
                        minDamage: csMin, maxDamage: csMax,
                        ability: cmdAbilData.title || 'Command Skeleton Warrior',
                        distributionType: 'non_crit',
                        source: 'conjure'
                    });
                }
            }
        }

        // Poison aura (Putrid Zombie fetid stench)
        if (def.poisonAbility && def.poisonRate && state.tick > 0 && state.tick % def.poisonRate === 0) {
            const poisonData = abils[def.poisonAbility];
            if (poisonData) {
                const poisonAvg = poisonData.minHit + poisonData.varHit / 2;
                const poisonDamage = Math.floor(poisonAvg * settings[SETTINGS.ABILITY_DAMAGE] * damageMultiplier);
                state.conjureDamage += poisonDamage;
                if (state.tick < state.conjurePerTick.length) {
                    state.conjurePerTick[state.tick] = state.conjureDamage;
                }
            }
        }
    }
}

function handleExtraActionsCore(settings: any, timers: Record<string, number>, tick: number, rotation: RotationInput) {
    if (timers["Adrenaline renewal potion"] >= 0) {
        addAdrenaline(settings, 4);
    }
    // Essence corruption adrenaline buff: +1% per tick while active
    if (timers[SETTINGS.ESS_CORRUPTION_ADREN] > 0) {
        settings[SETTINGS.ADRENALINE] += 1;
    }
    if (!rotation.extraActionBar[tick]) return;

    rotation.extraActionBar[tick].forEach(element => {
        if (!element) return;
        processExtraAction(element, settings, timers);
    });
}

/**
 * Core version of processAbility - uses rotation parameter
 */
function processAbilityCore(
    rotationState: RotationState,
    settingsCopy: any,
    abilityKey: ABILITIES,
    abil_duration: number,
    rotation: RotationInput,
    onTick?: OnTickCallback
) {
    style_specific_unification(settingsCopy, abils[abilityKey].mainStyle);
    addAdrenaline(settingsCopy, 0, false);
    rotationState.combatStyle = abils[abilityKey].mainStyle;
    settingsCopy['ability'] = abilityKey;

    on_stall(settingsCopy, abilityKey, rotationState.timers);
    prepareChainCast(settingsCopy, abilityKey, rotationState.tick, targetCountAt(rotationState.targetCounts, rotationState.tick));
    if (!settingsCopy[SETTINGS.USE_RAW_ABILITY_DAMAGE]) {
        settingsCopy[SETTINGS.ABILITY_DAMAGE] = calc_base_ad(settingsCopy);
    }

    rotationState.start_tick = rotationState.tick;
    const hit_tick = rotationState.tick + rotationState.hit_delay;
    rotationState.damageQueue[hit_tick] ??= [];

    settingsCopy._salvoCastKey = abilityKey;
    settingsCopy._salvoCastBonus = settingsCopy[SETTINGS.CRIMSON_SALVO] ? 1 : (settingsCopy._salvoProbability ?? 0);
    handleBuffs(settingsCopy, rotationState.timers, abilityKey);

    // Cooldowns are now tracked via timers in on_stall (damage_calc_new.ts)

    if (abilityKey in abils) {
        const classification = abils[abilityKey]?.abilityClassification;
        if (isChannelled(settingsCopy, abilityKey)) {
            const wenAccuracy = settingsCopy[SETTINGS.AMMO] === ARMOUR.WEN_ARROWS && settingsCopy[SETTINGS.ICY_PRECISION] > 0;
            handleWenBuffConsumption(settingsCopy, rotationState.timers, abilityKey);
            rotationState.channelBuffSnapshot = {
                damageBuffs: captureDamageBuffs(settingsCopy),
                wenAccuracy,
                wenDamage: settingsCopy[SETTINGS.AMMO] === ARMOUR.WEN_ARROWS && settingsCopy[SETTINGS.ICY_PRECISION] > 0,
                locate: settingsCopy[SETTINGS.LOCATE] === true && rotationState.timers[SETTINGS.LOCATE] > 0,
            };
        } else if (classification === 'multihit') {
            processMultiHitAbility(rotationState, settingsCopy, abilityKey, hit_tick);
        } else if (classification === 'bleed' || classification === 'burn' || classification === 'dot') {
            processBleedAbility(rotationState, settingsCopy, abilityKey, hit_tick);
        } else {
            processSingleHitAbility(rotationState, settingsCopy, abilityKey, hit_tick);
        }
    }

    // Apply pending flamebound rival after hits are processed
    if (settingsCopy['_pendingFlamebound']) {
        settingsCopy[SETTINGS.FLAMEBOUND_RIVAL] = true;
        delete settingsCopy['_pendingFlamebound'];
    }

    finishMalachiCast(settingsCopy, abilityKey, rotationState.timers);
    processAbilityTicksCore(rotationState, settingsCopy, abilityKey, abil_duration, rotation, onTick);
}

/**
 * Core version of processAbilityTicks - uses rotation parameter
 */
function processAbilityTicksCore(
    state: RotationState,
    settingsCopy: any,
    abilityKey: ABILITIES,
    abil_duration: number,
    rotation: RotationInput,
    onTick?: OnTickCallback
) {
    let rota;
    const isChannel = isChannelled(settingsCopy, abilityKey);
    const hasHits = abils[abilityKey]?.['hits'] !== undefined;
    if (isChannel && hasHits) {
        rota = get_hit_sequence(settingsCopy);
    }

    const end_tick = state.start_tick + abil_duration;
    for (let i = state.start_tick; i < end_tick; i++) {
        prepareTick(state, settingsCopy, rotation);
        if (isChannel && hasHits) {
            processChannelledTickCore(state, settingsCopy, abilityKey, i, rota, rotation);
        }
        processTickOperations(i, state, settingsCopy, rotation, onTick);
        if (rotation.abilityBar[i+1] || rotation.stalledAbilities[i+1] || rotation.releasedAbilities?.[i+1]) {
            break;
        }
    }
}

/**
 * Core version of processChannelledTick - uses rotation parameter
 */
function processChannelledTickCore(
    state: RotationState,
    settingsCopy: any,
    abilityKey: ABILITIES,
    currentTick: number,
    hitSequence: ABILITIES[][],
    rotation: RotationInput
) {
    if (currentTick > state.start_tick && rotation.abilityBar[state.tick]) {
        return; // Cancel channel if new ability
    }
    style_specific_unification(settingsCopy, abils[abilityKey].mainStyle);
    addAdrenaline(settingsCopy, 0, false);
    if (!settingsCopy[SETTINGS.USE_RAW_ABILITY_DAMAGE]) settingsCopy[SETTINGS.ABILITY_DAMAGE] = calc_base_ad(settingsCopy);
    let hit_index = 1 + currentTick - state.start_tick;
    let dmgObjects: DamageObject[] = [];

    // Only this channel inherits its cast buffs; expiry still affects new casts and procs.
    settingsCopy._castBuffSnapshot = state.channelBuffSnapshot;
    if (hitSequence[hit_index].length > 0) {
        for (let hitKey of hitSequence[hit_index]) {
            let dmgObject = create_damage_object(settingsCopy, hitKey);
            let dmgObjs = on_cast(settingsCopy, dmgObject, state.timers, hitKey);
            dmgObjs.forEach(dmgObj => {
                let o = hitTargets(state, settingsCopy, dmgObj, dmgObj.ability);
                for (let hit of o) {
                    dmgObjects.push(hit);
                }
            });
            handleDracolichInfusion(settingsCopy, state.timers, hitKey);
            handleChanneledAsphyx(settingsCopy, state.timers, hitKey);
            handleChannellers(settingsCopy, state.timers, hitKey);
        }
    }
    delete settingsCopy._castBuffSnapshot;
    dmgObjects.forEach(dmgObject => {
        if (settingsCopy.isNulledTick) {
            dmgObject = zeroDamageObject(dmgObject);
        }

        // Deferred BOLG procs receive their damage rolls at impact.
        if ((dmgObject as any)._bolgImpact || dmgObject.distributions['non_crit']['damage list'].length > 0) {
            let hit_tick = currentTick + state.hit_delay;
            (state.damageQueue[hit_tick] ??= []).push(dmgObject);
        }
    });
}

/**
 * Processes a single tick's worth of common operations that happen every tick.
 * This includes handling extra actions, copying stacks, managing timers,
 * processing queued damage, and advancing the tick counter.
 *
 * @param tickToProcess - The specific tick number to process (may differ from state.tick for channeled abilities)
 * @param state - The rotation state tracking damage, queues, and timers
 * @param settingsCopy - A copy of the game settings that can be modified during processing
 */
function processStalledAbility(
    state: RotationState,
    settingsCopy: any,
    abilityKey: string,
    hit_tick: number
) {
    const classification = abils[abilityKey]?.abilityClassification;
    if (isChannelled(settingsCopy, abilityKey)) {
        // Handled in processAbilityTicks
    } else if (classification === 'multihit') {
        processMultiHitAbility(state, settingsCopy, abilityKey, hit_tick);
    } else if (classification === 'bleed' || classification === 'burn' || classification === 'dot') {
        processBleedAbility(state, settingsCopy, abilityKey, hit_tick);
    } else {
        processSingleHitAbility(state, settingsCopy, abilityKey, hit_tick);
    }
}

function zeroDamageObject(dmgObject: DamageObject) {
    (dmgObject as any)._nulled = true;
    // Zero out all damage values while preserving the object structure
    Object.values(dmgObject.distributions).forEach(distribution => {
        if (distribution) {
            if (distribution['damage list']) {
                distribution['damage list'] = distribution['damage list'].map(() => 0);
            }
            distribution.minHit = 0;
            distribution.varHit = 0;
        }
    });
    return dmgObject;
}

function processSingleHitAbility(
    state: RotationState,
    settingsCopy: any,
    abilityKey: string,
    hit_tick: number
) {
    let dmgObject = create_damage_object(settingsCopy, abilityKey);
    let dmgObjects = on_cast(settingsCopy, dmgObject, state.timers, abilityKey);
    dmgObjects.forEach(element => {
        let hitKey = element.ability;
        settingsCopy['ability'] = hitKey;
        let namedDmgObjects = hitTargets(state, settingsCopy, element, hitKey);
        namedDmgObjects.forEach(namedDmgObject => {
            if (settingsCopy.isNulledTick) {
                namedDmgObject = zeroDamageObject(namedDmgObject);
            }
            state.damageQueue[hit_tick] ??= [];
            state.damageQueue[hit_tick].push(namedDmgObject);
        });
    });
}

function processMultiHitAbility(
    state: RotationState,
    settingsCopy: any,
    abilityKey: string,
    hit_tick: number
) {
    const hitTimings: number[] = abils[abilityKey as ABILITIES]?.hitTimings ?? [];
    let subHitIndex = 0;

    let dmgObject = create_damage_object(settingsCopy, abilityKey);
    let dmgObjects = on_cast(settingsCopy, dmgObject, state.timers, abilityKey);
    dmgObjects.forEach(element => {
        // Determine tick offset: sub-hits of the parent ability use hitTimings, procs land with the previous sub-hit
        const parentAbil = abils[abilityKey as ABILITIES]?.parent;
        const hitParent = abils[element.ability as ABILITIES]?.parent;
        const isSubHit = hitParent === abilityKey || hitParent === parentAbil || element.ability === abilityKey;
        const tickOffset = hitTimings[isSubHit ? subHitIndex : Math.max(0, subHitIndex - 1)] ?? 0;
        if (isSubHit) subHitIndex++;

        const targetTick = hit_tick + tickOffset;
        let namedDmgObjects = hitTargets(state, settingsCopy, element, element.ability);
        namedDmgObjects.forEach(namedDmgObject => {
            namedDmgObject = settingsCopy.isNulledTick ? zeroDamageObject(namedDmgObject) : namedDmgObject;
            state.damageQueue[targetTick] ??= [];
            state.damageQueue[targetTick].push(namedDmgObject);
        });
    });
}

function processBleedAbility(
    state: RotationState,
    settingsCopy: any,
    abilityKey: string,
    hit_tick: number
) {
    let dmgObject = create_damage_object(settingsCopy, abilityKey);
    let dmgObjects = on_cast(settingsCopy, dmgObject, state.timers, abilityKey);

    // Kerapac's wristwraps: Combust hits land instantly when buff is active
    const instantBleed = abilityKey === ABILITIES.COMBUST && settingsCopy[SETTINGS.KERAPACS_WRIST_WRAPS] === true;

    let i = 0;
    dmgObjects.forEach(element => {
        let hits = hitTargets(state, settingsCopy, element, element.ability);
        hits.forEach(hit => {
            if (settingsCopy.isNulledTick) {
                hit = zeroDamageObject(hit);
            }
            let htick = instantBleed ? hit_tick : hit_tick + (abils[abilityKey].hitTimings?.[i] ?? 0);
            state.damageQueue[htick] ??= [];
            state.damageQueue[htick].push(hit);
        });
        i++;
    });
}

/** Apply boss soft cap: damage above threshold is reduced by reduction % */
function applySoftCap(dmg: number, softCap?: { threshold: number; reduction: number }): number {
    if (!softCap || dmg <= softCap.threshold) return dmg;
    return softCap.threshold + (dmg - softCap.threshold) * (1 - softCap.reduction);
}

/**
 * Updates TARGET_HP_PERCENT based on cumulative damage dealt vs boss total health.
 * This makes HP-scaling effects (Spectral Scythe, Ripper Demon, Punish, etc.) dynamic.
 */
function updateBossHpPercent(state: RotationState, settingsCopy: any) {
    const totalHealth = settingsCopy['_bossHealth'];
    if (!totalHealth) return;

    const cumulativeDamage = state.dmgs.reduce((a, b) => a + b, 0)
        + state.poisonDamage + state.scrollDamage + state.dreadnipDamage + state.conjureDamage;

    settingsCopy[SETTINGS.TARGET_HP_PERCENT] = Math.max(0, (1 - cumulativeDamage / totalHealth) * 100);
}

/**
 * Check if cumulative damage has crossed the current phase's HP threshold.
 * If so, apply the next phase's stat overrides and set pause ticks.
 *
 * Currently applies: soft cap changes, pause ticks.
 * Automatic accuracy uses the current phase defence, armour and affinities.
 */
/**
 * Returns the remaining damage budget before the current phase's HP cap.
 * Returns null if there's no capped phase (unlimited damage allowed).
 */
function getPhaseDamageBudget(state: RotationState): number | null {
    if (!state.bossPhases || state.currentPhaseIdx >= state.bossPhases.length) return null;
    const currentPhase = state.bossPhases[state.currentPhaseIdx];
    if (!currentPhase.capped) return null;

    const cumulativeDamage = state.dmgs.reduce((a, b) => a + b, 0)
        + state.poisonDamage + state.scrollDamage + state.dreadnipDamage + state.conjureDamage;
    return Math.max(0, currentPhase.hp - cumulativeDamage);
}

/**
 * Check if cumulative damage has crossed the current phase's HP threshold.
 * If so, apply the next phase's stat overrides and set pause ticks.
 *
 * Damage capping is handled upstream via getPhaseDamageBudget.
 * Automatic accuracy uses the current phase defence, armour and affinities.
 */
function checkPhaseTransition(state: RotationState, settingsCopy: any) {
    if (!state.bossPhases || state.currentPhaseIdx >= state.bossPhases.length) return;

    const cumulativeDamage = state.dmgs.reduce((a, b) => a + b, 0)
        + state.poisonDamage + state.scrollDamage + state.dreadnipDamage + state.conjureDamage;

    const currentPhase = state.bossPhases[state.currentPhaseIdx];
    if (cumulativeDamage < currentPhase.hp) return;

    // Phase transition triggered
    const pause = currentPhase.pause || 0;
    if (pause) {
        state.pauseTicksRemaining = pause;
    }

    const isLast = state.currentPhaseIdx === state.bossPhases.length - 1;
    const label = currentPhase.stats?.name
        ? currentPhase.stats.name
        : (isLast ? 'Kill' : `P${state.currentPhaseIdx + 2}`);

    state.phaseTransitions.push({
        tick: state.tick,
        phaseIdx: state.currentPhaseIdx,
        label,
        hp: currentPhase.hp,
        pause
    });

    // Apply stat overrides from this phase
    if (currentPhase.stats) {
        const stats = currentPhase.stats;
        settingsCopy._targetPhaseStats = {...settingsCopy._targetPhaseStats, ...stats};
        // Update soft cap (may be null to remove it, or a new value)
        if ('softCap' in stats) {
            settingsCopy['_softCap'] = stats.softCap ?? undefined;
        }
    }

    state.currentPhaseIdx++;
}

/** Essence corruption: +1 stack per hitsplat from specific DOT abilities with RoA/OtD equipped */
const ESSENCE_CORRUPTION_ABILITIES = new Set([
    ABILITIES.COMBUST_HIT,
    ABILITIES.CORRUPTION_BLAST, ABILITIES.CORRUPTION_BLAST_HIT_1, ABILITIES.CORRUPTION_BLAST_HIT_2,
    ABILITIES.CORRUPTION_BLAST_HIT_3, ABILITIES.CORRUPTION_BLAST_HIT_4, ABILITIES.CORRUPTION_BLAST_HIT_5,
    ABILITIES.SOULFIRE_INITIAL, ABILITIES.SOULFIRE_BURN,
]);

function handleEssenceCorruptionStack(abilityKey: string, settings: Record<string, any>) {
    if (!ESSENCE_CORRUPTION_ABILITIES.has(abilityKey as ABILITIES)) return;
    const mh = settings[SETTINGS.MH];
    const oh = settings[SETTINGS.OH];
    const hasRoA = mh === WEAPONS.ROAR_OF_AWAKENING || mh === WEAPONS.ROAR_OF_AWAKENING_IM;
    const hasOtD = oh === WEAPONS.ODE_TO_DECEIT || oh === WEAPONS.ODE_TO_DECEIT_IM;
    if (hasRoA || hasOtD) {
        settings[SETTINGS.ESSENCE_CORRUPTION] = Math.min(
            (settings[SETTINGS.ESSENCE_CORRUPTION] || 0) + 1,
            100
        );
    }
}

/**
 * Processes all damage hits queued for a specific tick.
 *
 * For each queued hit:
 * 1. Sets the current ability context
 * 2. Gets user-selected damage metric
 * 3. Calculates the final damage value by:
 *    - Applying on damage effects
 *    - Applying boss soft cap (if configured)
 * 4. Scales damage by likelihood of hit occuring
 *
 * @param tick - The current game tick being processed
 * @param state - The rotation state containing damage queue and tracking arrays
 * @param settingsCopy - The current game settings used for damage calculation
 */
/** Cast once, then resolve each target's hit in order so player stacks/procs are shared. */
function hitTargets(state: RotationState, settings: any, object: DamageObject, key: ABILITIES): DamageObject[] {
    const weapon = [settings[SETTINGS.WEAPON], settings[SETTINGS.TH], settings[SETTINGS.MH], settings[SETTINGS.OH]].join('|');
    if (settings[SETTINGS.LOCATE] && settings._locateWeapon !== weapon) {
        settings[SETTINGS.LOCATE] = false;
        state.timers[SETTINGS.LOCATE] = 0;
    }
    const ability = abils[key];
    const excluded = isAreaAttack(key);
    const locateAtCast = settings._castBuffSnapshot?.locate ?? (settings[SETTINGS.LOCATE] && state.timers[SETTINGS.LOCATE] > 0);
    const eligible = locateAtCast
        && ability.mainStyle === 'ranged' && ability.abilityClassification !== 'self cast'
        && ability.abilityType !== 'proc' && !excluded;
    const inRange = targetCountAt(state.targetCounts, state.tick);
    const chain = ability.mainStyle === 'magic' && ability.abilityType !== 'proc' ? settings._chainCast : null;
    const areaCap = key === ABILITIES.POWERSTAB ? 25
        : [ABILITIES.METEOR_STRIKE, ABILITIES.SUNFALL_SLAM, ABILITIES.SWEEP, ABILITIES.SWEEP_HIT].includes(key) ? 9 : 0;
    const count = chain?.targets ?? (areaCap ? Math.min(areaCap, inRange)
        : eligible ? Math.min(6, inRange) : 1);
    const results: DamageObject[] = [];
    state.secondaryBik ??= {};
    for (let target = 0; target < count; target++) {
        const primaryBik = settings[SETTINGS.BIK_STACKS];
        if (target) settings[SETTINGS.BIK_STACKS] = state.secondaryBik[target] ?? 0;
        const previousDefer = settings._deferBolgProcs;
        settings._deferBolgProcs = true;
        const targetObject = structuredClone(object);
        if (target > 0 && chain) {
            for (const distribution of Object.values(targetObject.distributions)) if (distribution) {
                distribution.minHit = Math.floor(distribution.minHit * chain.factor);
                distribution.varHit = Math.floor(distribution.varHit * chain.factor);
            }
        }
        const hits = on_hit(settings, targetObject, state.timers, key);
        // Roll after calculating this hit: the triggering hit does not receive the buff.
        rollFulHit(state, settings, key, object.likelihood);
        settings._deferBolgProcs = previousDefer;
        for (const hit of hits) {
            (hit as any).targetIndex = target;
            (hit as any)._originTick = state.start_tick;
            results.push(hit);
        }
        if (target) {
            state.secondaryBik[target] = settings[SETTINGS.BIK_STACKS];
            settings[SETTINGS.BIK_STACKS] = primaryBik;
        }
    }
    if (key === ABILITIES.SUNFALL_SLAM) settings._lesserPurifyingUntil = state.tick + 50;
    const castToken = `${state.start_tick}:${settings._castBuffSnapshot ? state.tick : 'cast'}`;
    if (key !== ABILITIES.SUNFALL_SLAM && settings._lesserPurifyingUntil > state.tick
        && ability.mainStyle === 'melee' && ability.onHitEffects && ability.abilityType !== 'proc'
        && !['self cast', 'perk', 'proc'].includes(ability.abilityClassification)
        && ![ABILITIES.LESSER_PURIFYING_LIGHT, ABILITIES.PURIFYING_LIGHT].includes(key)
        && settings._lesserPurifyingCast !== castToken && inRange > 1) {
        settings._lesserPurifyingCast = castToken;
        const savedAbility = settings.ability;
        for (let target = 1; target < Math.min(3, inRange); target++) {
            const light = create_damage_object(settings, ABILITIES.LESSER_PURIFYING_LIGHT);
            for (const cast of on_cast(settings, light, state.timers, ABILITIES.LESSER_PURIFYING_LIGHT)) {
                for (const hit of on_hit(settings, cast, state.timers, ABILITIES.LESSER_PURIFYING_LIGHT)) {
                    (hit as any).targetIndex = target;
                    results.push(hit);
                }
            }
        }
        settings.ability = savedAbility;
    }
    return results;
}

function selectedTarget(state: RotationState, tick: number): string {
    for (let i = tick; i >= 0; i--) if (state.phaseEvents?.[i]?.targetId) return state.phaseEvents[i]!.targetId!;
    return 'Initial target';
}

/** Reassign reporting only: actual impact times and damage calculation stay intact. */
function creditCastPhase(state: RotationState, settings: any, source: DamageObject, hit: DamageObject, tick: number, damage: number) {
    if (hit.ability === ABILITIES.SPLIT_SOUL_ECB) return;
    const origin = Math.max((source as any)._originTick ?? tick, settings[SETTINGS.BOSS_PATTERN_START] ?? 0, 0);
    if (origin >= tick || !state.phaseEvents?.some((event, index) => event?.phase && index > origin && index <= tick)) return;
    const totals = state.phaseDamagePerTick ??= [];
    totals[origin] = (totals[origin] ?? 0) + damage;
    totals[tick] = (totals[tick] ?? 0) - damage;
}

function processQueuedDamage(tick: number, state: RotationState, settingsCopy: any) {
    if (!state.damageQueue[tick]) return;

    // Track whether a capped phase transitioned on this tick — all subsequent hits are nullified
    let cappedOnThisTick = false;

    const impactQueue = [...state.damageQueue[tick]];
    for (let impactIndex = 0; impactIndex < impactQueue.length; impactIndex++) {
        const namedDmgObject = impactQueue[impactIndex];
        if ((namedDmgObject as any)._bolgImpact) {
            if ((namedDmgObject as any)._nulled) continue;
            const equippedStyle = settingsCopy._equippedWeaponStyle;
            const equippedArmour = Object.fromEntries([SETTINGS.HELMET, SETTINGS.BODY, SETTINGS.LEGS, SETTINGS.BOOTS].map(key => [key, settingsCopy[key]]));
            style_specific_unification(settingsCopy, 'ranged');
            if (!settingsCopy[SETTINGS.USE_RAW_ABILITY_DAMAGE]) settingsCopy[SETTINGS.ABILITY_DAMAGE] = calc_base_ad(settingsCopy);
            const target = namedDmgObject.targetIndex ?? 0;
            const primaryBik = settingsCopy[SETTINGS.BIK_STACKS];
            if (target) settingsCopy[SETTINGS.BIK_STACKS] = state.secondaryBik?.[target] ?? 0;
            const hits = resolveBolgImpact(settingsCopy, namedDmgObject, state.timers);
            rollFulHit(state, settingsCopy, ABILITIES.BOLG_PROC, namedDmgObject.likelihood);
            settingsCopy._equippedWeaponStyle = equippedStyle;
            Object.assign(settingsCopy, equippedArmour);
            if (target) {
                state.secondaryBik ??= {};
                state.secondaryBik[target] = settingsCopy[SETTINGS.BIK_STACKS];
                settingsCopy[SETTINGS.BIK_STACKS] = primaryBik;
            }
            for (const hit of hits) {
                (hit as any).targetIndex = namedDmgObject.targetIndex ?? 0;
                (hit as any)._originTick = (namedDmgObject as any)._originTick;

            }
            impactQueue.splice(impactIndex, 1, ...hits);
            impactIndex--;
            continue;
        }
        const originTick = (namedDmgObject as any)._originTick ?? tick;
        // Target identity survives any number of intervening selections.
        if (namedDmgObject.ability === ABILITIES.SPLIT_SOUL_ECB &&
            selectedTarget(state, originTick) !== selectedTarget(state, tick)) continue;
        settingsCopy['ability'] = namedDmgObject.ability;
        const scale = namedDmgObject.likelihood;

        // Essence corruption: +1 stack per hitsplat from Combust, Corruption Blast, Soulfire
        // when Roar of Awakening or Ode to Deceit equipped
        handleEssenceCorruptionStack(namedDmgObject.ability, settingsCopy);

        const targetIndex = namedDmgObject.targetIndex ?? 0;
        const savedTeamDebuffs = settingsCopy._teamDebuffs;
        settingsCopy._teamDebuffs = state.teamDebuffs?.[selectedTarget(state, originTick)] ?? {};
        const savedSplitSoul = settingsCopy[SETTINGS.SPLIT_SOUL];
        if (selectedTarget(state, originTick) !== selectedTarget(state, tick)) settingsCopy[SETTINGS.SPLIT_SOUL] = false;
        const { results: damageObjects, delayed } = on_damage(settingsCopy, namedDmgObject);
        settingsCopy[SETTINGS.SPLIT_SOUL] = savedSplitSoul;
        settingsCopy._teamDebuffs = savedTeamDebuffs;
        // One stack per landed hit, weighted for mutually exclusive proc branches.
        // Split Soul is derived damage, not another weapon hit.
        if (!(namedDmgObject as any)._nulled && !cappedOnThisTick
            && abils[namedDmgObject.ability]?.damageType !== 'split soul'
            && damageObjects.some(hit => get_user_value(settingsCopy, hit) > 0)) {
            gainReaperStack(settingsCopy, tick, scale);
        }
        // Queue delayed hits (e.g. Split Soul) for the next tick
        for (const delayedObj of delayed) {
            (delayedObj as any).targetIndex = targetIndex;
            (delayedObj as any)._originTick = (namedDmgObject as any)._originTick;
            (state.damageQueue[tick + 1] ??= []).push(delayedObj);
        }
        for (const dmgObj of damageObjects) {
            if (targetIndex > 0) {
                const damage = Math.floor(applySoftCap(get_user_value(settingsCopy, dmgObj), settingsCopy['_softCap']) * scale);
                state.secondaryDamage ??= {};
                creditCastPhase(state, settingsCopy, namedDmgObject, dmgObj, tick, Number.isFinite(damage) ? damage : 0);
                state.secondaryDamage[targetIndex] = (state.secondaryDamage[targetIndex] ?? 0) + (Number.isFinite(damage) ? damage : 0);
                (state.secondaryHits ??= []).push({tick, ability: namedDmgObject.ability, targetIndex, expected: Number.isFinite(damage) ? damage : 0});
                continue; // Secondary targets do not consume the primary boss's HP or phase budget.
            }
            const softCap = settingsCopy['_softCap'];
            let dmg = cappedOnThisTick ? 0 : applySoftCap(get_user_value(settingsCopy, dmgObj), softCap);

            // Cap damage to phase budget (capped phases nullify excess)
            let budget: number | null = null;
            if (!cappedOnThisTick) {
                budget = getPhaseDamageBudget(state);
                if (budget !== null) {
                    dmg = Math.min(dmg, budget / scale);
                }
            }

            const dmgValue = Math.floor(dmg * scale);
            if (Number.isNaN(dmgValue)) {
                const crit = dmgObj.distributions?.crit;
                const nonCrit = dmgObj.distributions?.non_crit;
                console.warn('NaN damage detected', {
                    ability: namedDmgObject.ability, tick,
                    crit: crit ? { minHit: crit.minHit, varHit: crit.varHit, boostedAD: crit['boosted AD'], listLen: crit['damage list']?.length, prob: crit.probability } : 'missing',
                    nonCrit: nonCrit ? { minHit: nonCrit.minHit, varHit: nonCrit.varHit, boostedAD: nonCrit['boosted AD'], listLen: nonCrit['damage list']?.length, prob: nonCrit.probability } : 'missing',
                    abilityDamage: settingsCopy[SETTINGS.ABILITY_DAMAGE],
                });
                // Only log first occurrence
                break;
            }
            state.dmgs.push(dmgValue);
            creditCastPhase(state, settingsCopy, namedDmgObject, dmgObj, tick, dmgValue);
            state.cinderHitCount += scale;

            // Accumulate poison damage per-hit (scales with current Bik stacks)
            if (!cappedOnThisTick) {
                const poisonDamage = calcPoisonDamagePerHit(scale, settingsCopy);
                state.poisonDamage += poisonDamage;
                creditCastPhase(state, settingsCopy, namedDmgObject, dmgObj, tick, poisonDamage);
            }
            if (tick < state.poisonPerTick.length) {
                state.poisonPerTick[tick] = state.poisonDamage;
            }

            if (!cappedOnThisTick) {
                const phaseIdxBefore = state.currentPhaseIdx;
                checkPhaseTransition(state, settingsCopy);
                if (state.currentPhaseIdx > phaseIdxBefore &&
                    state.bossPhases?.[phaseIdxBefore]?.capped) {
                    cappedOnThisTick = true;
                }
            }

            // Skip distribution stats for zero-damage hits (capped out)
            if (cappedOnThisTick && dmg === 0) continue;

            // Treat crit and non-crit as a single combined distribution per ability
            const critDist = dmgObj.distributions['crit'];
            const nonCritDist = dmgObj.distributions['non_crit'];

            if (critDist && critDist['damage list'].length > 0 &&
                nonCritDist && nonCritDist['damage list'].length > 0) {

                // Calculate crit and non-crit components for mixture
                const critDamageList = critDist['damage list'];
                const nonCritDamageList = nonCritDist['damage list'];

                // Crit stats
                let critMin = Math.min(...critDamageList);
                let critMax = Math.max(...critDamageList);
                let critMean = (critMin + critMax) / 2;
                let critVariance = Math.pow((critMax - critMin) / 2, 2) / 3;

                // Non-crit stats
                let nonCritMin = Math.min(...nonCritDamageList);
                let nonCritMax = Math.max(...nonCritDamageList);
                let nonCritMean = (nonCritMin + nonCritMax) / 2;
                let nonCritVariance = Math.pow((nonCritMax - nonCritMin) / 2, 2) / 3;

                // Calculate combined min/max for display (includes both crit and non-crit)
                const allDamage = [...critDamageList, ...nonCritDamageList];
                let minDamage = Math.min(...allDamage);
                let maxDamage = Math.max(...allDamage);

                // Scale distribution stats to match capped damage
                if (budget !== null && maxDamage > 0) {
                    const uncappedDmg = applySoftCap(get_user_value(settingsCopy, dmgObj), softCap);
                    if (uncappedDmg > 0 && dmg < uncappedDmg) {
                        const capScale = dmg / uncappedDmg;
                        critMin *= capScale; critMax *= capScale; critMean *= capScale;
                        critVariance *= capScale * capScale;
                        nonCritMin *= capScale; nonCritMax *= capScale; nonCritMean *= capScale;
                        nonCritVariance *= capScale * capScale;
                        minDamage *= capScale; maxDamage *= capScale;
                    }
                }

                // Store as a single distribution with mixture components
                state.distributionStats.push({
                    tick: tick,
                    likelihood: scale, // Total likelihood (crit + non-crit = 1)
                    minDamage: minDamage,
                    maxDamage: maxDamage,
                    ability: dmgObj.ability,
                    distributionType: 'combined',
                    critProbability: critDist['probability'],
                    critMean: critMean,
                    critVariance: critVariance,
                    critMin: critMin,
                    critMax: critMax,
                    nonCritProbability: nonCritDist['probability'],
                    nonCritMean: nonCritMean,
                    nonCritVariance: nonCritVariance,
                    nonCritMin: nonCritMin,
                    nonCritMax: nonCritMax
                });
            } else if (critDist && critDist['damage list'].length > 0) {
                // Only crit distribution exists
                const damageList = critDist['damage list'];
                state.distributionStats.push({
                    tick: tick,
                    likelihood: scale * critDist['probability'],
                    minDamage: Math.min(...damageList),
                    maxDamage: Math.max(...damageList),
                    ability: dmgObj.ability,
                    distributionType: 'crit'
                });
            } else if (nonCritDist && nonCritDist['damage list'].length > 0) {
                // Only non-crit distribution exists
                const damageList = nonCritDist['damage list'];
                state.distributionStats.push({
                    tick: tick,
                    likelihood: scale * nonCritDist['probability'],
                    minDamage: Math.min(...damageList),
                    maxDamage: Math.max(...damageList),
                    ability: dmgObj.ability,
                    distributionType: 'non_crit'
                });
            }
        }
    }
}

/**
 * Calculates poison damage for a single hit, accounting for current Bik stack count.
 * Bik arrows' Evolving Toxin increases poison damage by 3% per stack (up to 150 stacks).
 * 1/8 Chance to proc on hit
 * 15% + 5% per tier damage, then rolls 65-130% (avg 97.5%)
 * @param hitScale - The likelihood/scale of this hit (for probabilistic hits)
 * @param settingsCopy - The settings copy with current Bik stack state
 * @returns The expected poison damage for this hit
 */
function calcPoisonDamagePerHit(hitScale: number, settingsCopy: any): number {
    if (settingsCopy[SETTINGS.POISON_IMMUNE]) return 0;
    let poison_tier = Object.values(SETTINGS.POISON_VALUES).indexOf(settingsCopy[SETTINGS.POISON]);
    const cinders = settingsCopy[SETTINGS.GLOVES] === ARMOUR.CINDERBANE_GLOVES
    if (cinders) {
        poison_tier = Math.max(2, poison_tier + 1);
    }
    if (poison_tier === 0) {
        return 0;
    }
    const abilDmg = settingsCopy[SETTINGS.ABILITY_DAMAGE];
    let basePoisonDmg = Math.floor(abilDmg * (0.15 + 0.05 * poison_tier) * 0.975 / (cinders ? 7 : 8));

    // Bik arrows Evolving Toxin: +3% poison damage per stack
    const bikStacks = settingsCopy[SETTINGS.BIK_STACKS] || 0;
    if (bikStacks > 0 && settingsCopy[SETTINGS.AMMO] === ARMOUR.BIK_ARROWS) {
        basePoisonDmg = Math.floor(basePoisonDmg * (1 + 0.03 * bikStacks));
    }

    return Math.floor(basePoisonDmg * hitScale * (1+.025*Math.max(0,Math.min(4,settingsCopy[SETTINGS.KWUARM] ?? 0))));
}

/*
 * Copies stacks from the settings to the rotationStore.
 * @param tick - The current tick being processed
 * @param settings - The current settings used for rotation damage calculation.
*/
function copyStacks(tick: number, settings: any, timers?: Record<string, number>) {
    // Write cooldown-ready abilities for this tick (cooldowns stored as timers with 'cd_' prefix)
    // Check for remaining === 1 because handleTimers runs after copyStacks and will decrement to 0 and delete
    if (timers) {
        const readyAbilities: string[] = [];
        for (const [key, remaining] of Object.entries(timers)) {
            if (key.startsWith(COOLDOWN_PREFIX) && remaining === 1) {
                readyAbilities.push(key.slice(COOLDOWN_PREFIX.length));
            }
        }
        rotationStore.cooldownReady[tick] = readyAbilities.length > 0 ? readyAbilities : null;
    }

    for(let key in rotationStore.stacks) {
        // Convert to number before storing
        const value = typeof settings[key] === 'number' ? settings[key] : Number(settings[key]) || 0;
        rotationStore.stacks[key].stackTicks[tick] = value;
    }
    const justActivated = settings['_channelBuffJustActivated'];
    buffs.forEach(buffTitle => {
        // Skip writing on the activation tick for channel-activated buffs
        // (they fire on the last hit but shouldn't visually appear until next tick)
        if (justActivated === buffTitle) return;
        rotationStore.buffs[buffTitle].buffTicks[tick] = settings[buffTitle];
    });
    delete settings['_channelBuffJustActivated'];

}

/** Process a single extra action entry — handles both new ExtraAction and legacy formats */
function trackEquippedWeaponStyle(settings: any, slot: string, value: any) {
    // Off-hand changes alone do not change the main-hand weapon's combat style.
    const slots = [SETTINGS.TH, SETTINGS.MH, SETTINGS.MELEE_TH, SETTINGS.MELEE_MH,
        SETTINGS.RANGED_TH, SETTINGS.RANGED_MH, SETTINGS.MAGIC_TH, SETTINGS.MAGIC_MH,
        SETTINGS.NECRO_TH, SETTINGS.NECRO_MH];
    if (!slots.includes(slot)) return;
    const inferredStyle = slot.startsWith('melee') ? 'melee' : slot.startsWith('ranged') ? 'ranged'
        : slot.startsWith('magic') ? 'magic' : slot.startsWith('necro') ? 'necromancy' : settings['_equippedWeaponStyle'];
    settings['_equippedWeaponStyle'] = value && value !== 'none' ? (weapons[value]?.style && weapons[value].style !== 'hybrid' ? weapons[value].style : inferredStyle) : null;
}

function cancelLocateForWeaponSwap(settings: any, timers: Record<string, number>, slot: string, value: unknown) {
    const weaponSlots = [SETTINGS.TH, SETTINGS.MH, SETTINGS.OH, SETTINGS.WEAPON,
        SETTINGS.RANGED_TH, SETTINGS.RANGED_MH, SETTINGS.RANGED_OH, SETTINGS.WEAPON_TYPE_RANGED,
        SETTINGS.MELEE_TH, SETTINGS.MELEE_MH, SETTINGS.MELEE_OH,
        SETTINGS.MAGIC_TH, SETTINGS.MAGIC_MH, SETTINGS.MAGIC_OH,
        SETTINGS.NECRO_MH, SETTINGS.NECRO_OH];
    const mainHandChange = weaponSlots.includes(slot) && !String(slot).includes('off-hand') && settings[slot] !== value;
    if (settings[SETTINGS.GRAVITATE_ACTIVE] && weaponSlots.includes(slot) && settings[slot] !== value) {
        settings[SETTINGS.GRAVITATE_ACTIVE] = false; settings[SETTINGS.GRAVITATE] = 0; timers[SETTINGS.GRAVITATE_ACTIVE] = 0;
    }
    if (settings[SETTINGS.SPLIT_SOUL] && mainHandChange) {
        settings[SETTINGS.SPLIT_SOUL] = false; timers[SETTINGS.SPLIT_SOUL] = 0;
    }
    if (settings[SETTINGS.LOCATE] && weaponSlots.includes(slot) && settings[slot] !== value) {
        settings[SETTINGS.LOCATE] = false;
        timers[SETTINGS.LOCATE] = 0;
    }
}

function processExtraAction(element: any, settings: any, timers: Record<string, number>) {
    // New ExtraAction format
    if (isExtraAction(element)) {
        if (element.type === 'gear' && element.slot) {
            trackEquippedWeaponStyle(settings, element.slot, element.value);
            cancelLocateForWeaponSwap(settings, timers, element.slot, element.value);
            settings[element.slot] = element.value;
            Object.assign(settings, weaponSelectionUpdates(element.slot, element.value));
            for (const slot of [SETTINGS.HELMET, SETTINGS.BODY, SETTINGS.LEGS, SETTINGS.BOOTS]) {
                if (element.slot === slot || element.slot.endsWith(' ' + slot)) settings[slot] = element.value;
            }
            addAdrenaline(settings, 0, false);
            // Ammo/pocket swaps: also update the generic key so the calc engine sees it
            if (element.slot.includes('ammo')) settings[SETTINGS.AMMO] = element.value;
            if (element.slot.includes('pocket')) settings[SETTINGS.POCKET] = element.value;
            if (element.slot.includes('necklace')) settings[SETTINGS.NECKLACE] = element.value;
            settings._gearInstances ??= {};
            settings._gearInstances[element.slot] = {itemKey: element.value, instanceId: element.instanceId,
                instanceIndex: element.instanceIndex ?? 0, perks: element.perks ?? [], label: element.label};
            for (const key of Object.keys(weaponSelectionUpdates(element.slot, element.value))) {
                if (key.endsWith('weapon')) settings._gearInstances[key] = {...settings._gearInstances[element.slot]};
            }

        } else {
            // Ability/prayer/consumable/spell — process by value
            processExtraActionByValue(element.value, settings, timers);
        }
        return;
    }

    // Legacy format: string key (abilities, consumables, etc.)
    if (typeof element === 'string' && specialAbils[element]) {
        processExtraActionByValue(element, settings, timers);
        return;
    }

    // Legacy format: { title, icon } object (gear swaps)
    if (typeof element === 'object' && element.title) {
        const slot = getSettingsKeyForItem(element.title) || gearSwaps[element.title];
        if (slot) {
            trackEquippedWeaponStyle(settings, slot, element.title);
            cancelLocateForWeaponSwap(settings, timers, slot, element.title);
            settings[slot] = element.title;
            if (slot.includes('ammo')) settings[SETTINGS.AMMO] = element.title;
            if (slot.includes('pocket')) settings[SETTINGS.POCKET] = element.title;
            if (slot.includes('necklace')) settings[SETTINGS.NECKLACE] = element.title;
        }
        return;
    }
}

/** Process an extra action by its string value key */
function processExtraActionByValue(value: string, settings: any, timers: Record<string, number>) {
    if (value === QUIVER_SLOT_1 || value === QUIVER_SLOT_2) {
        selectQuiverSlot(settings, value === QUIVER_SLOT_2 ? 1 : 0);
    }
    else if (['divine rage on','divine rage off','eclipsed soul on','eclipsed soul off'].includes(value)) {
        const key = value.startsWith('divine') ? SETTINGS.DIVINE_RAGE : SETTINGS.ECLIPSED_SOUL;
        settings[key] = value.endsWith(' on');
    }
    else if (value === CONSUMABLES.ADRENALINE_CRYSTAL) {
        startCrystalChannel(settings, settings._rotationTick);
    }
    else if (value === CONSUMABLES.ADRENALINE_RENEWAL) {
        timers[value] = 10;
    }
    else if (value === CONSUMABLES.SPIRITUAL_PRAYER) {
        settings[SETTINGS.FAMILIAR_SPEC_POINTS] = Math.min(60, (settings[SETTINGS.FAMILIAR_SPEC_POINTS] || 0) + 15);
    }
    else if (value.includes("Adrenaline")) {
        const amount = parseInt(value.split(" ")[1]);
        settings[SETTINGS.ADRENALINE] += amount;
    }
    else if ([ABILITIES.UNDEAD_SLAYER_ABILITY, ABILITIES.DRAGON_SLAYER_ABILITY,
        ABILITIES.DEMON_SLAYER_ABILITY, ABILITIES.VAMPYRE_SLAYER_ABILITY].includes(value as ABILITIES)) {
        if (timers[COOLDOWN_PREFIX + value] > 0) return;
        settings[value] = true;
        timers[value] = 17;
    }
    else if (value === 'sanguine offering') {
        delete timers[COOLDOWN_PREFIX + ABILITIES.RUNIC_CHARGE];
    }
    else if (value === ABILITIES.RUNIC_CHARGE) {
        settings[SETTINGS.ANIMA_CHARGED] = true;
        timers[SETTINGS.ANIMA_CHARGED] = 25;
    }
    else if (value === ABILITIES.EXSANGUINATE) {
        settings[SETTINGS.AUTO_CAST] = SETTINGS.AUTO_CAST_VALUES.EXSANGUINATE;
    }
    else if (value === ABILITIES.INCITE_FEAR) {
        settings[SETTINGS.AUTO_CAST] = SETTINGS.AUTO_CAST_VALUES.INCITE_FEAR;
    }
    else if (value === ABILITIES.DREADNIP) {
        timers['_dreadnip_deploy'] = 1;
        timers[COOLDOWN_PREFIX + ABILITIES.DREADNIP] = dreadnipData.duration;
    }
    // Start cooldowns for off-GCD abilities that have them
    const cd = abils[value as ABILITIES]?.['cooldown'];
    if (cd && cd > 0) {
        timers[COOLDOWN_PREFIX + value] = Math.ceil(cd / 0.6);
    }
}

function handleTimers(timers: Record<string, number>, settings: any) {
    tickProcProbabilities(settings);
    // Vestments of Havoc: 0.5% adrenaline per tick while regen is active
    if (settings[SETTINGS.VESTMENTS_REGEN] === true && timers[SETTINGS.VESTMENTS_REGEN] > 0) {
        addAdrenaline(settings, 0.5);
    }

    // Meteor Strike buff: 4.5% adrenaline per tick while active
    if (settings[SETTINGS.METEOR_STRIKE_BUFF] === true && timers[SETTINGS.METEOR_STRIKE_BUFF] > 0
        && settings['_equippedWeaponStyle'] === 'melee') {
        addAdrenaline(settings, 4.5, false);
    }

    if (Object.keys(timers).length > 0) {
        for (let key in timers) {
            timers[key] -= 1;
            if (timers[key] <= 0) {
                if (key === SETTINGS.GRAVITATE_ACTIVE) settings[SETTINGS.GRAVITATE] = 0;
                if (key === '_glacial_embrace_decay') {
                    settings[SETTINGS.GLACIAL_EMBRACE] = 0;
                    delete timers[key];
                } else if (key === '_blood_tithe_decay') {
                    settings[SETTINGS.BLOOD_TITHE] = 0;
                    delete timers[key];
                } else if (key.startsWith(COOLDOWN_PREFIX) || key.startsWith('conjure_') || key.startsWith('command_')) {
                    // Cooldown, conjure, or command expired - just remove the timer
                    delete timers[key];
                } else if (key === SETTINGS.ICY_PRECISION || key === SETTINGS.DEATHSPORE_COOLDOWN) {
                    settings[key] = 0;
                } else {
                    settings[key] = false;
                }
            }
        }
    }
}

function isChannelled(settingsCopy: any, key: string): boolean {
    return abils[key].abilityClassification === 'channel';
}

/**
 *
 */
function getAftershockVariant(combatStyle: string): ABILITIES {
    switch (combatStyle) {
        case 'melee': return ABILITIES.AFTERSHOCK_MELEE;
        case 'ranged': return ABILITIES.AFTERSHOCK_RANGED;
        case 'necromancy':
        case 'necro': return ABILITIES.AFTERSHOCK_NECRO;
        case 'magic':
        default: return ABILITIES.AFTERSHOCK_MAGIC;
    }
}

function handleAftershock(state: RotationState, settingsCopy: any) {
        // Check every 10 ticks if 500 damage has been done since last checkpoint
        if (state.tick % 10 === 0 && settingsCopy[SETTINGS.AFTERSHOCK] > 0) {
            const currentTotalDamage = state.dmgs.reduce((acc, current) => acc + current, 0);
            const damageSinceLastCheck = currentTotalDamage - state.lastAftershockProc;

            if (damageSinceLastCheck >= 50000) {
                state.lastAftershockProc = currentTotalDamage;
                const aftershockAbility = getAftershockVariant(state.combatStyle);
                processSingleHitAbility(state, settingsCopy, aftershockAbility, state.tick+2);
            }
        }
}

function getCracklingVariant(combatStyle: string): ABILITIES {
    switch (combatStyle) {
        case 'melee': return ABILITIES.CRACKLING_MELEE;
        case 'ranged': return ABILITIES.CRACKLING_RANGED;
        case 'necromancy':
        case 'necro': return ABILITIES.CRACKLING_NECRO;
        case 'magic':
        default: return ABILITIES.CRACKLING_MAGIC;
    }
}

function handleCrackling(state: RotationState, settingsCopy: any) {
    // Crackling procs every 60 seconds (100 ticks), dealing 50% * rank of ability damage

    // Crackling doesn't proc before the first non-nulled ability or after the last ability
    if (state.firstAbilityTick < 0 || state.tick < state.firstAbilityTick) return;
    if (state.lastAbilityTick < 0 || state.tick > state.lastAbilityTick) return;

    const rank = settingsCopy[SETTINGS.CRACKLING];
    if (state.tick > 0 && state.tick % 100 === 0 && rank > 0) {
        const cracklingAbility = getCracklingVariant(state.combatStyle);
        // Temporarily scale ability damage by rank (ability data has 0.5 = 50% per rank)
        const savedAD = settingsCopy[SETTINGS.ABILITY_DAMAGE];
        settingsCopy[SETTINGS.ABILITY_DAMAGE] = savedAD * rank;
        processSingleHitAbility(state, settingsCopy, cracklingAbility, state.tick + 2);
        settingsCopy[SETTINGS.ABILITY_DAMAGE] = savedAD;
    }
}

function findLastValueIndex(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] != null && arr[i] !== '' && arr[i] !== undefined) {
            return i;
        }
    }
    return -1; // No value found
}

/**
 * Calculates Gaussian parameters (mean and standard deviation) from the collected damage distribution statistics.
 * This models the total damage as a Gaussian distribution for more accurate damage prediction.
 *
 * @param distributionStats - Array of damage distribution statistics collected during calculation
 * @returns Object containing mean and standard deviation of the total damage distribution
 */
export function calculateGaussianParameters(distributionStats: DamageDistributionStat[]): { mean: number; stdDev: number } {
    if (distributionStats.length === 0) {
        return { mean: 0, stdDev: 0 };
    }

    // Calculate weighted mean and variance
    let totalWeight = 0;
    let weightedSum = 0;
    let weightedSumSquares = 0;

    distributionStats.forEach(stat => {
        const weight = stat.likelihood;
        const meanDamage = (stat.minDamage + stat.maxDamage) / 2;
        const variance = Math.pow((stat.maxDamage - stat.minDamage) / 2, 2) / 3; // Uniform distribution variance

        totalWeight += weight;
        weightedSum += weight * meanDamage;
        weightedSumSquares += weight * (Math.pow(meanDamage, 2) + variance);
    });

    const mean = weightedSum / totalWeight;
    const variance = (weightedSumSquares / totalWeight) - Math.pow(mean, 2);
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
}

/**
 * Returns the collected distribution statistics for external analysis.
 *
 * @param state - The rotation state containing the distribution statistics
 * @returns Array of damage distribution statistics
 */
export function getDistributionStats(state: RotationState): DamageDistributionStat[] {
    return state.distributionStats;
}
