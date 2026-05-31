import { abils, ABILITIES } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { style_specific_unification, calc_base_ad } from '../damage_calc_rb';
import { get_hit_sequence, addAdrenaline } from './calculation_utils';
import { handleBuffs, get_user_value, handleDracolichInfusion, handleChanneledAsphyx, handleChannellers, getConjureDamageMultiplier } from './rotation_damage_helper';
import { SETTINGS } from '../settings_rb';
import { on_stall, on_cast, on_hit, on_damage, COOLDOWN_PREFIX } from './damage_calc_new.js';
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
import { uiActions, uiStore } from '$lib/stores/uiStore.svelte';
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
    if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.VULNERABILITY) return 1.1;
    if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.CURSE) return 1.05;
    return 1.0;
}

interface RotationState {
    dmgs: number[];
    damageQueue: Record<number, any[]>;
    timers: Record<string, number>;
    tick: number;
    hit_delay: number;
    start_tick: number;
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
    resolvedAbility: string;
    duration: number;
}

interface DamageResult {
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

const FUL_BUFF_DURATION = 25; // 15 seconds = 25 ticks
// Cooldown runs concurrently with buff (both 15s from proc), so no additional cooldown-only period
const FUL_TOTAL_LOCKOUT = 25; // Total ticks from proc where no new proc can happen
const FUL_PROC_CHANCE = 0.066;

/**
 * Update Scripture of Ful probability on ability release.
 * Tracks probability mass of procs at each tick using fulProcHistory.
 * fulProcHistory[t] = probability that a NEW proc started at tick t.
 */
function updateFulProbability(state: RotationState, settings: Record<string, any>) {
    if (settings[SETTINGS.POCKET] !== ARMOUR.FUL_BOOK) {
        settings[SETTINGS.SCRIPTURE_OF_FUL_PROB] = 0;
        return;
    }

    const tick = state.tick;

    // Calculate current probability of being in buff or lockout state
    // by summing proc history over the relevant windows
    let buffProb = 0; // probability buff is active (procced within last FUL_BUFF_DURATION ticks)
    let lockoutProb = 0; // probability locked out but buff expired (shouldn't happen with concurrent timing)

    for (let i = 0; i < state.fulProcHistory.length; i++) {
        const mass = state.fulProcHistory[i] || 0; // Handle sparse array (undefined entries between ability ticks)
        if (mass === 0) continue;
        const ticksAgo = tick - i;
        if (ticksAgo >= 0 && ticksAgo < FUL_BUFF_DURATION) {
            buffProb += mass;
        } else if (ticksAgo >= FUL_BUFF_DURATION && ticksAgo < FUL_TOTAL_LOCKOUT) {
            lockoutProb += mass;
        }
    }

    // Probability we're in the "can proc" state (not in buff or lockout)
    const canProcProb = Math.max(0, 1);// - buffProb - lockoutProb);

    // New proc probability mass this tick
    const newProcMass = canProcProb * FUL_PROC_CHANCE;
    state.fulProcHistory[tick] = (state.fulProcHistory[tick] || 0) + newProcMass;

    // The triggering hit doesn't benefit, so the buff probability for THIS tick's damage
    // is the buffProb BEFORE adding the new proc (later hits on this tick will use updated value)
    settings[SETTINGS.SCRIPTURE_OF_FUL_PROB] = buffProb;
}

/**
 * Recalculate Ful buff probability for the current tick (for non-ability ticks).
 */
function recalcFulProbability(state: RotationState, settings: Record<string, any>) {
    if (settings[SETTINGS.POCKET] !== ARMOUR.FUL_BOOK) {
        settings[SETTINGS.SCRIPTURE_OF_FUL_PROB] = 0;
        return;
    }

    const tick = state.tick;
    let buffProb = 0;
    for (let i = 0; i < state.fulProcHistory.length; i++) {
        const mass = state.fulProcHistory[i] || 0;
        if (mass === 0) continue;
        const ticksAgo = tick - i;
        if (ticksAgo >= 0 && ticksAgo < FUL_BUFF_DURATION) {
            buffProb += mass;
        }
    }
    settings[SETTINGS.SCRIPTURE_OF_FUL_PROB] = buffProb;
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
    };

    // Get settings from the store
    const adaptedSettings = Object.fromEntries(
        Object.entries(settingsStore.settings).map(([key, value]: [string, { value: any }]) => [key, value.value])
    );

    // Pocket and ammo are now resolved per-ability in style_specific_unification

    // Attach gear perks if "use owned gear" mode is enabled
    if (adaptedSettings[SETTINGS.USE_OWNED_GEAR]) {
        attachGearPerks(adaptedSettings, ownedItemsStore.ownedGear);
    }

    // Strip any Svelte proxies from internal keys before cloning
    if (adaptedSettings['_gearInstances'] && typeof adaptedSettings['_gearInstances'] === 'object') {
        adaptedSettings['_gearInstances'] = JSON.parse(JSON.stringify(adaptedSettings['_gearInstances']));
    }

    const settingsCopy = structuredClone(adaptedSettings);
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
        tickMetadata: {}
    };

    // Find the last tick that has an ability (familiar/dreadnip stop after this)
    for (let i = rotation.abilityBar.length - 1; i >= 0; i--) {
        if (rotation.abilityBar[i] != null) {
            state.lastAbilityTick = i;
            break;
        }
    }

    // Find the first tick with a non-nulled ability (familiar/dreadnip start here)
    for (let i = 0; i < rotation.abilityBar.length; i++) {
        if (rotation.abilityBar[i] != null && !(rotation.nulledTicks[i] ?? false)) {
            state.firstAbilityTick = i;
            break;
        }
    }

    const settingsCopy = structuredClone(settings);

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

    // Check if rotation contains any melee abilities (for Vestments max adrenaline)
    if (settingsCopy['_hasMeleeAbilities'] === undefined) {
        settingsCopy['_hasMeleeAbilities'] = rotation.abilityBar.some(
            (abilKey: string | null) => abilKey && abils[abilKey as ABILITIES]?.mainStyle === 'melee'
        );
    }

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
function processCurrentTickCore(
    state: RotationState,
    settingsCopy: any,
    barSize: number,
    rotation: RotationInput,
    onTick?: OnTickCallback
) {
    // Store nulled state at the start
    const isNulledTick = rotation.nulledTicks[state.tick] ?? false;
    settingsCopy.isNulledTick = isNulledTick;

    // First process any stalled ability on this tick
    const stalledAbility = rotation.stalledAbilities[state.tick];
    if (stalledAbility) {
        style_specific_unification(settingsCopy, abils[stalledAbility].mainStyle);
        state.combatStyle = abils[stalledAbility].mainStyle;
        const abil_duration = typeof abils[stalledAbility]['duration'] === 'number' ? abils[stalledAbility]['duration'] : 3;
        settingsCopy['ability'] = stalledAbility;

        if (!settingsCopy[SETTINGS.USE_RAW_ABILITY_DAMAGE]) {
            settingsCopy[SETTINGS.ABILITY_DAMAGE] = calc_base_ad(settingsCopy);
        }

        state.start_tick = state.tick;
        const hit_tick = state.tick + state.hit_delay;
        state.damageQueue[hit_tick] ??= [];
        handleBuffs(settingsCopy, state.timers, stalledAbility);
        if (stalledAbility in abils) {
            processStalledAbility(state, settingsCopy, stalledAbility, hit_tick);
        }
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
    state.tickMetadata[state.tick] = { resolvedAbility: abilityKey, duration: abil_duration };
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
        handleTimers(state.timers, settingsCopy);
        onTick?.(state.tick, settingsCopy, state.timers);
        state.tick += 1;
        return;
    }

    handleExtraActionsCore(settingsCopy, state.timers, state.tick, rotation);
    onTick?.(state.tick, settingsCopy, state.timers);
    recalcFulProbability(state, settingsCopy);
    handleTimers(state.timers, settingsCopy);
    processQueuedDamage(tickToProcess, state, settingsCopy);
    handleAftershock(state, settingsCopy);
    handleCrackling(state, settingsCopy);
    processSecondaryDamageWithBudget(state, settingsCopy);
    updateBossHpPercent(state, settingsCopy);

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
    rotationState.combatStyle = abils[abilityKey].mainStyle;
    settingsCopy['ability'] = abilityKey;
    updateFulProbability(rotationState, settingsCopy);

    on_stall(settingsCopy, abilityKey, rotationState.timers);
    if (!settingsCopy[SETTINGS.USE_RAW_ABILITY_DAMAGE]) {
        settingsCopy[SETTINGS.ABILITY_DAMAGE] = calc_base_ad(settingsCopy);
    }

    rotationState.start_tick = rotationState.tick;
    const hit_tick = rotationState.tick + rotationState.hit_delay;
    rotationState.damageQueue[hit_tick] ??= [];

    handleBuffs(settingsCopy, rotationState.timers, abilityKey);

    // Cooldowns are now tracked via timers in on_stall (damage_calc_new.ts)

    if (abilityKey in abils) {
        const classification = abils[abilityKey]?.abilityClassification;
        if (isChannelled(settingsCopy, abilityKey)) {
            // Handled in processAbilityTicksCore
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
        if (isChannel && hasHits) {
            processChannelledTickCore(state, settingsCopy, abilityKey, i, rota, rotation);
        }
        processTickOperations(i, state, settingsCopy, rotation, onTick);
        if (rotation.abilityBar[i+1]) {
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
    let hit_index = 1 + currentTick - state.start_tick;
    let dmgObjects: DamageObject[] = [];

    if (hitSequence[hit_index].length > 0) {
        for (let hitKey of hitSequence[hit_index]) {
            let dmgObject = create_damage_object(settingsCopy, hitKey);
            let dmgObjs = on_cast(settingsCopy, dmgObject, state.timers, hitKey);
            dmgObjs.forEach(dmgObj => {
                let o = on_hit(settingsCopy, dmgObj, state.timers, dmgObj.ability);
                for (let hit of o) {
                    dmgObjects.push(hit);
                }
            });
            handleDracolichInfusion(settingsCopy, state.timers, hitKey);
            handleChanneledAsphyx(settingsCopy, state.timers, hitKey);
            handleChannellers(settingsCopy, state.timers, hitKey);
        }
    }
    dmgObjects.forEach(dmgObject => {
        if (settingsCopy.isNulledTick) {
            dmgObject = zeroDamageObject(dmgObject);
        }

        if (dmgObject.distributions['non_crit']['damage list'].length > 0) {
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
        let namedDmgObjects = on_hit(settingsCopy, element, state.timers, hitKey);
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
        let namedDmgObjects = on_hit(settingsCopy, element, state.timers, element.ability);
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
        let hits = on_hit(settingsCopy, element, state.timers, element.ability);
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
 * TODO: recalculate hit chance when defence/armour/affinities change at phase transitions.
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
 * TODO: recalculate hit chance when defence/armour/affinities change at phase transitions.
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
function processQueuedDamage(tick: number, state: RotationState, settingsCopy: any) {
    if (!state.damageQueue[tick]) return;

    // Track whether a capped phase transitioned on this tick — all subsequent hits are nullified
    let cappedOnThisTick = false;

    for (const namedDmgObject of state.damageQueue[tick]) {
        settingsCopy['ability'] = namedDmgObject.ability;
        const scale = namedDmgObject.likelihood;

        // Essence corruption: +1 stack per hitsplat from Combust, Corruption Blast, Soulfire
        // when Roar of Awakening or Ode to Deceit equipped
        handleEssenceCorruptionStack(namedDmgObject.ability, settingsCopy);

        const { results: damageObjects, delayed } = on_damage(settingsCopy, namedDmgObject);
        // Queue delayed hits (e.g. Split Soul) for the next tick
        for (const delayedObj of delayed) {
            (state.damageQueue[tick + 1] ??= []).push(delayedObj);
        }
        for (const dmgObj of damageObjects) {
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
            state.cinderHitCount += scale;

            // Accumulate poison damage per-hit (scales with current Bik stacks)
            if (!cappedOnThisTick) {
                state.poisonDamage += calcPoisonDamagePerHit(scale, settingsCopy);
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

    return Math.floor(basePoisonDmg * hitScale);
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
    //Only calc indices on last tick
    if (tick === uiStore.bar.size - 1) {

    // Update buff idx values for UI display order and calculate active rows
        let buffIndex = 0;
        for (let key in rotationStore.buffs) {
            if (Object.hasOwnProperty.call(rotationStore.buffs, key)) {
                // Clear previous active rows
                rotationStore.buffs[key].activeRows = [];

                // Calculate which rows this buff is active on
                for (let rowIndex = 0; rowIndex < rotationStore.buffs[key].buffTicks.length; rowIndex++) {
                    const tickValue = rotationStore.buffs[key].buffTicks[rowIndex];
                    if (tickValue && tickValue !== 'none') {
                        rotationStore.buffs[key].activeRows.push(rowIndex);
                    }
                }

                // Set idx based on whether buff is active anywhere
                if (rotationStore.buffs[key].activeRows.length > 0) {
                    rotationStore.buffs[key].idx = buffIndex;
                    buffIndex++;
                } else {
                    rotationStore.buffs[key].idx = -1;
                }
            }
        }
        uiActions.updateBarLastIndex(buffIndex);
    }
}

/** Process a single extra action entry — handles both new ExtraAction and legacy formats */
function processExtraAction(element: any, settings: any, timers: Record<string, number>) {
    // New ExtraAction format
    if (isExtraAction(element)) {
        if (element.type === 'gear' && element.slot) {
            settings[element.slot] = element.value;
            // Ammo/pocket swaps: also update the generic key so the calc engine sees it
            if (element.slot.includes('ammo')) settings[SETTINGS.AMMO] = element.value;
            if (element.slot.includes('pocket')) settings[SETTINGS.POCKET] = element.value;
            // Update gear perks if the extra action carries inline perks
            if (element.perks?.length && settings['_gearPerks']) {
                settings['_gearPerks'][element.value] = element.perks;
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
            settings[slot] = element.title;
            if (slot.includes('ammo')) settings[SETTINGS.AMMO] = element.title;
            if (slot.includes('pocket')) settings[SETTINGS.POCKET] = element.title;
        }
        return;
    }
}

/** Process an extra action by its string value key */
function processExtraActionByValue(value: string, settings: any, timers: Record<string, number>) {
    if (value === CONSUMABLES.ADRENALINE_RENEWAL) {
        timers[value] = 10;
    }
    else if (value === CONSUMABLES.SPIRITUAL_PRAYER) {
        settings[SETTINGS.FAMILIAR_SPEC_POINTS] = Math.min(60, (settings[SETTINGS.FAMILIAR_SPEC_POINTS] || 0) + 15);
    }
    else if (value.includes("Adrenaline")) {
        const amount = parseInt(value.split(" ")[1]);
        settings[SETTINGS.ADRENALINE] += amount;
    }
    else if (value === ABILITIES.UNDEAD_SLAYER_ABILITY) {
            settings[SETTINGS.UNDEAD_SLAYER_ABILITY] = true;
            timers[SETTINGS.UNDEAD_SLAYER_ABILITY] = 17;
    }
    else if (value === ABILITIES.DRAGON_SLAYER_ABILITY) {
        settings[SETTINGS.DRAGON_SLAYER_ABILITY] = true;
        timers[SETTINGS.DRAGON_SLAYER_ABILITY] = 17;
    }
    else if (value === ABILITIES.DEMON_SLAYER_ABILITY) {
        settings[SETTINGS.DEMON_SLAYER_ABILITY] = true;
        timers[SETTINGS.DEMON_SLAYER_ABILITY] = 17;
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
    // Vestments of Havoc: 0.5% adrenaline per tick while regen is active
    if (settings[SETTINGS.VESTMENTS_REGEN] === true && timers[SETTINGS.VESTMENTS_REGEN] > 0) {
        addAdrenaline(settings, 0.5);
    }

    // Meteor Strike buff: 4.5% adrenaline per tick while active
    if (settings[SETTINGS.METEOR_STRIKE_BUFF] === true && timers[SETTINGS.METEOR_STRIKE_BUFF] > 0) {
        addAdrenaline(settings, 4.5);
    }

    if (Object.keys(timers).length > 0) {
        for (let key in timers) {
            timers[key] -= 1;
            if (timers[key] <= 0) {
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