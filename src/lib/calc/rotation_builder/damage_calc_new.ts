import { ABILITIES, abils } from '$lib/data/abilities';
import { WEAPONS } from '$lib/data/weapons';
import { ARMOUR } from '$lib/data/armour';
import { create_damage_object } from './rota_object_helper';
import { SETTINGS } from '../settings_rb';
import { calc_crit_damage, get_hit_sequence, calc_split_soul_hit, addAdrenaline } from './calculation_utils';
import { handle_sgb } from './rotation_damage_helper';
import { DamageObject, DamageKind, DamageDistribution } from '../types';
import { Logger, LogCategory } from '../../utils/Logger';
import {
    applyStyleBoostedADEffects,
    applyStyleAbilitySpecificEffects,
    applyStyleAbilityPercentModifiers,
    applyStyleStackEffects,
    consumeStyleStacks,
    applyStyleBonusDamageEffects,
    applyStyleMinVarEffects,
    applyStyleMultiplicativeEffects,
    calculatePrayerBoost,
    applyAllDamageModifiers,
    applyAdditiveBoosts,
    applyPvEBoosts,
    handleWenBuffConsumption,
    EffectContext,
    DamageModifierContext
} from './effects';

// Initialize logger
const logger = Logger.getInstance();

// ============================================================
// DAMAGE PIPELINE - Main functions called in sequence per ability
// on_stall → on_cast → on_hit → on_damage
// ============================================================

/**
 * Handles pre-cast adrenaline costs for an ability. Checks if the Deathspore
 * buff can be consumed (making the ability free), otherwise processes normal
 * adrenaline gain/cost: basics gain adrenaline (with impatient), while
 * thresholds, ultimates, and special attacks spend it.
 *
 * Called before on_cast at the same time as the cast, except when the ability
 * is stalled (in which case on_stall fires at stall time, and on_cast fires
 * later at release time).
 */
function on_stall(settings: Record<string, any>, abilityKey: string, timers?: Record<string, number>) {
    if (consumeDeathsporeBuff(settings, abilityKey, timers)) return;
    handleAdrenalineCost(settings, abilityKey, timers);
    // Essence corruption adrenaline: magic basic with >= 25 stacks starts/resets 6-tick buff
    if (
        timers &&
        abils[abilityKey]?.abilityType === 'basic' &&
        abils[abilityKey]?.mainStyle === 'magic' &&
        settings[SETTINGS.ESSENCE_CORRUPTION] >= 25
    ) {
        timers[SETTINGS.ESS_CORRUPTION_ADREN] = 6;
        settings[SETTINGS.ESS_CORRUPTION_ADREN] = true;
    }
    // Bloodlust stacks: Berserk grants 4 stacks on activation
    if (abilityKey === ABILITIES.BERSERK) {
        const cap = 8; // Berserk raises cap to 8
        settings[SETTINGS.BLOODLUST_STACKS] = Math.min(
            (settings[SETTINGS.BLOODLUST_STACKS] || 0) + 4, cap
        );
    }

    // Bloodlust consumption: Assault, Hurricane, Flurry/Greater Flurry consume 4 stacks
    if (
        (settings[SETTINGS.BLOODLUST_STACKS] || 0) >= 4 &&
        (abilityKey === ABILITIES.ASSAULT || abilityKey === ABILITIES.ASSAULT_BARGE ||
        abilityKey === ABILITIES.HURRICANE || abilityKey === ABILITIES.FLURRY || abilityKey === ABILITIES.GREATER_FLURRY ||
        abilityKey === ABILITIES.FLURRY_BARGE || abilityKey === ABILITIES.GREATER_FLURRY_BARGE)
    ) {
        settings[SETTINGS.BLOODLUST_STACKS] -= 4;
        settings['_bloodlust_consumed'] = abilityKey;
    } else {
        settings['_bloodlust_consumed'] = null;
    }

    if (timers) {
        startCooldown(timers, abilityKey, settings);
    }
}

/**
 * Initializes boosted ability damage (AD) based on hit chance, applies
 * weapon/style-specific AD effects (e.g. Scripture of Amascut, chaos roar,
 * flow stacks), handles ability-specific overrides (e.g. conflagrate,
 * flanking), then splits the ability into its component hits (multihit
 * expansion, bleed/burn/dot cloning, or single-hit passthrough) and sets
 * min/var damage percentages on each resulting hit object.
 *
 * Channels are not expanded here — they are handled tick-by-tick by the
 * rotation builder.
 */
function on_cast(settings: Record<string, any>, dmgObject: DamageObject, timers: Record<string, number>, abilityKey: ABILITIES): DamageObject[] {
    // This function happens as an ability is cast
    // Ensure settings['ability'] is set for functions that depend on it (like get_hit_sequence)
    settings['ability'] = abilityKey;

    // Self-cast abilities (e.g. Imbue Shadows, Split Soul) only apply buffs — no hits
    if (abils[abilityKey].abilityClassification === 'self cast') {
        return [];
    }

    // Consume Anima Charged buff for empowered magic abilities
    consumeAnimaCharged(settings, timers, abilityKey);

    // scale to hit chance / damage potential
    logger.log(LogCategory.ABILITY_DAMAGE, `on_cast called for ${abilityKey}`, {
        abilityDamage: settings[SETTINGS.ABILITY_DAMAGE],
        hitChance: settings[SETTINGS.HIT_CHANCE]
    });
    logger.log(LogCategory.ABILITY_DAMAGE, 'BASE AD', settings[SETTINGS.ABILITY_DAMAGE]);
    const dmgObjects: DamageObject[] = [];
    const hitChance = Math.min(settings[SETTINGS.HIT_CHANCE] / 100, 1);
    iterateDistributions(dmgObject, (distribution) => {
        distribution['boosted AD'] = Math.floor(settings[SETTINGS.ABILITY_DAMAGE] * hitChance);
        logger.log(LogCategory.ABILITY_DAMAGE, `Set boosted AD for ${abilityKey}`, distribution['boosted AD']);
    });
    logger.trace('Hit Chance', `${settings[SETTINGS.HIT_CHANCE]}%`, `Damage potential: ${abils[abilityKey]?.damagePotentialEffects ? 'yes' : 'no'}`);
    logger.trace('Boosted AD', Math.floor(settings[SETTINGS.ABILITY_DAMAGE] * hitChance), `floor(${settings[SETTINGS.ABILITY_DAMAGE]} × ${hitChance})`);

    // Handle Wen buff consumption for ranged abilities
    handleWenBuffConsumption(settings, timers, abilityKey);
    // TODO - accuracy (including offstyle gear penalty and ingen)
    const baseDamage = settings[SETTINGS.ABILITY_DAMAGE];
    const effectCtx: EffectContext = { settings, abilityKey };
    const cleanupFunctions: Array<() => void> = [];

    iterateDistributions(dmgObject, (distribution) => {
        // Apply style-specific boosted AD effects (weapons, flow stacks, chaos roar, etc.)
        // Also applies shared pocket effects (Scripture of Amascut)
        const result = applyStyleBoostedADEffects(effectCtx, distribution, baseDamage);
        if (result.cleanup) {
            cleanupFunctions.push(result.cleanup);
        }
    });

    // Execute any cleanup functions (e.g., turn off chaos roar after it's been used)
    cleanupFunctions.forEach(cleanup => cleanup());

    let preability_AD = dmgObject.distributions.non_crit['boosted AD'];
    // apply ability specific effects
    iterateDistributions(dmgObject, (distribution) => {
        applyStyleAbilitySpecificEffects(effectCtx, distribution);
    });

    // Split single cast up into the different effects
    splitAbilityIntoHits(settings, abilityKey, dmgObject, dmgObjects, preability_AD);
    dmgObjects.forEach(dmgObject => {
        set_min_var(settings, dmgObject);
    });
    // Track time since last attack (increments every tick, reset by ability casts)
    settings[SETTINGS.TIME_SINCE_ATTACK] = 0;

    // Consume (G)Conc crit buff after all hits have been processed
    const classification = abils[abilityKey]?.abilityClassification;
    if (classification !== 'channel' && classification !== 'proc' && classification !== 'perk') {
        if (settings[SETTINGS.CONC_CRIT] === true) settings[SETTINGS.CONC_CRIT] = false;
        else if (settings[SETTINGS.GCONC_CRIT] === true) settings[SETTINGS.GCONC_CRIT] = false;
        else if (settings[SETTINGS.CONC_CRIT_AC] === true) settings[SETTINGS.CONC_CRIT_AC] = false;
        else if (settings[SETTINGS.GCONC_CRIT_AC] === true) settings[SETTINGS.GCONC_CRIT_AC] = false;
    }

    return dmgObjects;
}

/**
 * Applies all on-hit damage modifiers to the ability's damage object. This
 * includes min/var scaling from ammo/style effects, additive damage boosts,
 * prayer multipliers, PvE-specific boosts, and bonus damage effects. After
 * modifiers are applied, generates the full damage roll list, then applies
 * per-roll scaling (berserker's fury, crit damage).
 *
 * Also tracks Perfect Equilibrium stacks for BoLG, applies style-specific
 * stack effects (wen, bik, residual souls, necrosis), and handles procs/
 * non-standard abilities (BoLG perfect equilibrium, FSOA time strike,
 * Crystal Rain from SGB).
 */
function on_hit(settings: Record<string, any>, dmgObject: DamageObject, timers: Record<string, number>, abilityKey: ABILITIES): DamageObject[] {
    const dmgObjects = [dmgObject];
    const effectCtx: EffectContext = { settings, abilityKey, timers };
    logger.log(LogCategory.ABILITY_DAMAGE, 'on_hit', abilityKey, dmgObject);

    // Apply on-hit damage modifiers (min/var scaling, boosts, prayer, PvE, bonus)
    if (abils[abilityKey].onHitEffects === true) {
        iterateDistributions(dmgObject, (distribution) => {
            applyStyleMinVarEffects(effectCtx, distribution);
            applyAdditiveBoosts(effectCtx, distribution);

            let boost = 10000;
            boost = Math.floor(boost * calculatePrayerBoost(settings, abilityKey));
            boost = applyStyleMultiplicativeEffects(effectCtx, distribution, boost);
            distribution.minHit = Math.floor((distribution.minHit * boost) / 10000);
            distribution.varHit = Math.floor((distribution.varHit * boost) / 10000);

            applyPvEBoosts(effectCtx, distribution);
            applyStyleBonusDamageEffects(effectCtx, distribution);
        });
    }

    // Generate damage rolls
    rollDamageList(dmgObject);

    // Track BoLG perfect equilibrium stacks (on-hit, non-proc only)
    if (abils[abilityKey].onHitEffects === true &&
        abils[abilityKey].abilityType != 'proc') {
        if ((settings[SETTINGS.TH] === WEAPONS.BOW_OF_THE_LAST_GUARDIAN ||
            settings[SETTINGS.TH] === WEAPONS.BOW_OF_THE_LAST_GUARDIAN_IM)
            &&
            settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH)
        {
            settings[SETTINGS.PERFECT_EQUILIBRIUM_STACKS] += 1;
        }
    }

    // Apply style-specific stack effects (wen, bik, residual souls, necrosis)
    applyStyleStackEffects(effectCtx);

    // Consume stacks that were used for this ability's damage
    consumeStyleStacks(effectCtx);

    // Piercing Shot: each hit reduces Snipe cooldown by 4 ticks
    if ((abilityKey === ABILITIES.PIERCING_SHOT || abilityKey === ABILITIES.PIERCING_SHOT_HIT) && timers[COOLDOWN_PREFIX + ABILITIES.SNIPE] > 0) {
        timers[COOLDOWN_PREFIX + ABILITIES.SNIPE] = Math.max(0, timers[COOLDOWN_PREFIX + ABILITIES.SNIPE] - 4);
    }

    // Glacial embrace proc: at 5 stacks, fire a magic hit (with its own cooldown, magic abilities only)
    if (
        settings[SETTINGS.GLACIAL_EMBRACE] >= 5 &&
        settings[SETTINGS.AUTO_CAST] === SETTINGS.AUTO_CAST_VALUES.INCITE_FEAR &&
        abils[abilityKey]?.mainStyle === 'magic' &&
        (!timers[COOLDOWN_PREFIX + ABILITIES.GLACIAL_EMBRACE_HIT] || timers[COOLDOWN_PREFIX + ABILITIES.GLACIAL_EMBRACE_HIT] <= 0)
    ) {
        startCooldown(timers, ABILITIES.GLACIAL_EMBRACE_HIT);
        let glacialObj = create_damage_object(settings, ABILITIES.GLACIAL_EMBRACE_HIT);
        glacialObj = on_cast(settings, glacialObj, timers, ABILITIES.GLACIAL_EMBRACE_HIT)[0];
        if (glacialObj) {
            const glacialHits = on_hit(settings, glacialObj, timers, ABILITIES.GLACIAL_EMBRACE_HIT);
            dmgObjects.push(...glacialHits);
        }
    }

    // Apply per-roll modifiers and handle procs
    if (abils[abilityKey].onHitEffects === true) {
        applyDamageListModifiers(settings, dmgObject, abilityKey);
    } else {
        // Trace hits that skip applyDamageListModifiers (bleeds, DOTs, burns)
        const nonCrit = dmgObject.distributions['non_crit'];
        const crit = dmgObject.distributions['crit'];
        if (nonCrit && nonCrit['damage list'].length > 0) {
            logger.traceHit({
                ability: abilityKey,
                boostedAD: nonCrit['boosted AD'] ?? 0,
                min: nonCrit['damage list'][0],
                max: nonCrit['damage list'][nonCrit['damage list'].length - 1],
                critChance: crit?.['probability'] ?? 0,
                critDamageBonus: 0,
                critMin: crit?.['damage list']?.[0] ?? 0,
                critMax: crit?.['damage list']?.[crit?.['damage list']?.length - 1] ?? 0,
            });
        }
    }

    if (abils[abilityKey].onHitEffects === true) {
        handleBolgProc(settings, dmgObject, timers, dmgObjects);
        handleFsoa(abilityKey, settings, dmgObject, timers, dmgObjects);

        // Add bloat bleed hits - TODO time them properly
        if (abilityKey === ABILITIES.BLOAT) {
            const bloatBleedHit = structuredClone(dmgObject);
            iterateDistributions(bloatBleedHit, (distribution) => {
                for (let i = 0; i < distribution['damage list'].length; i++) {
                    distribution['damage list'][i] = Math.floor(distribution['damage list'][i] * 0.25)
                }
            });
            for (let i = 0; i < 10; i++) {
                dmgObjects.push(structuredClone(bloatBleedHit))
            }
        }
        if (abilityKey == ABILITIES.CRYSTAL_RAIN) {
            dmgObjects.push(...handle_sgb(settings, dmgObject));
        }
    }

    return dmgObjects;
}

/**
 * Applies final damage modifiers that occur when damage is actually dealt
 * (e.g. vulnerability, slayer sigil, Zerk essence). After modifiers, handles
 * split soul (ECB spec) by creating additional damage objects from the soul
 * split portion, and grants adrenaline from critical hits when Tsunami crit buff
 * is active.
 */
function on_damage(settings: Record<string, any>, dmgObject: DamageObject): { results: DamageObject[], delayed: DamageObject[] } {
    const abilityKey = dmgObject.ability;
    const modifierCtx: DamageModifierContext = { settings, abilityKey };

    // Apply final damage modifiers (vulnerability, slayer sigil, etc.)
    iterateDistributions(dmgObject, (distribution) => {
        for (let i = 0; i < distribution['damage list'].length; i++) {
            distribution['damage list'][i] = applyAllDamageModifiers(
                modifierCtx,
                distribution['damage list'][i]
            );
        }
        settings['soul split'] = distribution;
    });

    const results: DamageObject[] = [dmgObject];
    const delayed: DamageObject[] = [];
    handleSplitSoul(settings, dmgObject, delayed);
    handleCritBuffAdrenaline(settings, dmgObject);

    return { results, delayed };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Helper functions for accessing DamageObjects
function getDamageDistribution(dmgObject: DamageObject, kind: DamageKind): DamageDistribution | undefined {
    return dmgObject.distributions[kind];
}

function iterateDistributions(dmgObject: DamageObject, callback: (distribution: DamageDistribution, kind: DamageKind) => void): void {
    for (const kind of ['non_crit', 'crit'] as DamageKind[]) {
        const distribution = dmgObject.distributions[kind];
        if (distribution) {
            callback(distribution, kind);
        }
    }
}

/**
 * Abilities that consume the Anima Charged buff from Runic Charge.
 * Dragon Breath: empowered to 260-310% damage.
 * Sonic Wave / Greater Sonic Wave: improved Flow buff (+25%). (FLOW_AC/GREATER_FLOW_AC)
 * Concentrated Blast / Greater Concentrated Blast: +20% crit per hit.
 */
const ANIMA_CHARGED_ABILITIES: Set<string> = new Set([
    ABILITIES.DRAGON_BREATH,
    ABILITIES.SONIC_WAVE,
    ABILITIES.GREATER_SONIC_WAVE,
    ABILITIES.CONCENTRATED_BLAST, ABILITIES.CONCENTRATED_BLAST_1,
    ABILITIES.GREATER_CONCENTRATED_BLAST, ABILITIES.GREATER_CONCENTRATED_BLAST_1,
]);

/**
 * Consumes the Anima Charged buff (from Runic Charge) when an empowerable magic ability is cast.
 * Sets a per-cast flag so downstream effects can check if this cast was Anima Charged.
 */
function consumeAnimaCharged(settings: Record<string, any>, timers: Record<string, number>, abilityKey: string): void {
    settings['anima charged cast'] = false;
    if (!settings[SETTINGS.ANIMA_CHARGED]) return;
    if (!ANIMA_CHARGED_ABILITIES.has(abilityKey)) return;

    settings['anima charged cast'] = true;
    settings[SETTINGS.ANIMA_CHARGED] = false;
    if (timers) {
        delete timers[SETTINGS.ANIMA_CHARGED];
    }
}

/**
 * Consumes the Deathspore buff if applicable (next ranged ability that costs adrenaline is free).
 * @returns true if the buff was consumed (skip normal adrenaline cost), false otherwise
 */
function consumeDeathsporeBuff(settings: Record<string, any>, abilityKey: string, timers?: Record<string, number>): boolean {
    const type = abils[abilityKey].abilityType;
    const isRanged = abils[abilityKey]?.mainStyle === 'ranged';
    const costsAdrenaline = ['threshold', 'ultimate', 'special attack'].includes(type);

    if (settings[SETTINGS.DEATHSPORE_BUFF] && isRanged && costsAdrenaline) {
        settings[SETTINGS.DEATHSPORE_BUFF] = false;
        if (timers) {
            delete timers[SETTINGS.DEATHSPORE_BUFF];
        }
        return true;
    }
    return false;
}

/**
 * Consumes the best active Flow buff if a magic ability that costs adrenaline is used.
 * Returns the adrenaline cost reduction percentage (0 if no buff consumed).
 */
function consumeFlowBuff(settings: Record<string, any>, abilityKey: string, timers?: Record<string, number>): number {
    const isMagic = abils[abilityKey]?.mainStyle === 'magic';
    const type = abils[abilityKey]?.abilityType;
    const costsAdrenaline = ['threshold', 'ultimate', 'special attack'].includes(type);
    if (!isMagic || !costsAdrenaline) return 0;

    // Consume the best available flow buff (highest reduction first)
    const flowBuffs: Array<{ key: string; reduction: number }> = [
        { key: SETTINGS.GREATER_FLOW_AC, reduction: 45 },
        { key: SETTINGS.FLOW_AC, reduction: 35 },
        { key: SETTINGS.GREATER_FLOW, reduction: 20 },
        { key: SETTINGS.FLOW, reduction: 10 },
    ];

    for (const buff of flowBuffs) {
        if (settings[buff.key]) {
            settings[buff.key] = false;
            if (timers) delete timers[buff.key];
            return buff.reduction;
        }
    }
    return 0;
}

/**
 * Handles adrenaline gain/cost for an ability based on its type.
 * Basics gain adrenaline (with impatient), thresholds/ultimates/specs spend it.
 */
function handleAdrenalineCost(settings: Record<string, any>, abilityKey: string, timers?: Record<string, number>): void {
    const type = abils[abilityKey].abilityType;
    const flowReduction = consumeFlowBuff(settings, abilityKey, timers);

    if (type == 'basic') {
        let basicAdren = settings[SETTINGS.FURY_OF_THE_SMALL] ? 10 : 9;
        // Meteor Strike buff: melee basics generate 1.5x adrenaline
        if (settings[SETTINGS.METEOR_STRIKE_BUFF] === true && abils[abilityKey]?.mainStyle === 'melee') {
            basicAdren = Math.floor(basicAdren * 1.5);
        }
        // Invigorating: +5% adrenaline per rank on autos
        let invigBoost = 1
        const autoAbilityKeys = [
            ABILITIES.RANGED_AUTO,
            ABILITIES.MELEE_AUTO,
            ABILITIES.MAGIC_AUTO,
            ABILITIES.NECRO_AUTO,
        ].map(key => String(key));
        if (autoAbilityKeys.includes(abilityKey)) {
            invigBoost += settings[SETTINGS.INVIGORATING] * 0.05;
        }

        addAdrenaline(settings, basicAdren * invigBoost);
        if (settings[SETTINGS.EXPECTED_ADRENALINE]) {
            const impAdren = settings[SETTINGS.IMPATIENT] * 0.09 * 3 * invigBoost;
            addAdrenaline(settings, impAdren);
        }

        // Deathmark (hydrix bolts): +1% adrenaline from basic abilities
        if (settings[SETTINGS.DEATHMARK]) {
            addAdrenaline(settings, 1);
        }
        // Living Death: Touch of Death generates an additional 6% adrenaline
        if (settings[SETTINGS.LIVING_DEATH] === true && abilityKey === ABILITIES.TOUCH_OF_DEATH) {
            addAdrenaline(settings, 6);
        }
    }
    else if (type == 'ultimate') {
        let cost = abils[abilityKey]['adrenaline'];
        cost = cost ? cost : 100;
        // Glacial embrace: each stack reduces Tsunami cost by 12%
        if (abilityKey === ABILITIES.TSUNAMI && settings[SETTINGS.GLACIAL_EMBRACE] > 0) {
            cost = Math.floor(cost * (1 - 0.12 * settings[SETTINGS.GLACIAL_EMBRACE]));
        }
        cost -= settings[SETTINGS.VIGOUR] ? 10 : 0;
        cost -= settings[SETTINGS.CONSERVATION_OF_ENERGY] ? 10 : 0;
        if (flowReduction > 0) cost = Math.max(0, Math.floor(cost - flowReduction));
        addAdrenaline(settings, -cost);
    }
    else if (type == 'threshold') {
        let cost = abils[abilityKey].adrenaline || 0;
        if (flowReduction > 0) cost = Math.max(0, Math.floor(cost - flowReduction));

        if (abilityKey === ABILITIES.FINGER_OF_DEATH) {
            const necrosis = settings[SETTINGS.NECROSIS_STACKS] || 0;
            const consumed = Math.min(necrosis, 6);
            cost = Math.max(0, cost - consumed * 10);
        }
        addAdrenaline(settings, -cost);
    }
    else if (type == 'special attack') {
        let cost = abils[abilityKey].adrenaline;
        const multi = settings[SETTINGS.VIGOUR] ? 0.9 : 1;
        cost *= multi;
        if (flowReduction > 0) cost = Math.max(0, Math.floor(cost - flowReduction));

        if (abilityKey === ABILITIES.ICY_TEMPEST) {
            const prim_ice = settings[SETTINGS.PRIMORDIAL_ICE] || 0;
            cost = Math.max(0, cost - prim_ice * 12);
        }
        addAdrenaline(settings, -cost);
    }
}

/** Prefix for cooldown timer keys to avoid collision with buff timers */
const COOLDOWN_PREFIX = 'cd_';

/**
 * Starts the cooldown timer for an ability. Uses the existing timer system
 * (counts down each tick via handleTimers). The timer key is prefixed with 'cd_'.
 */
function startCooldown(timers: Record<string, number>, abilityKey: string, settings?: Record<string, any>): void {
    const key = abils[abilityKey]?.parent ?? abilityKey;
    let cdSeconds = abils[key]?.['cooldown'];
    if (cdSeconds && cdSeconds > 0) {
        // Living Death: Death Skulls cooldown reduced to 10.2s (17 ticks)
        if (abilityKey === ABILITIES.DEATHSKULLS_4 && settings?.[SETTINGS.LIVING_DEATH] === true) {
            cdSeconds = 10.2;
        }
        if (abilityKey === ABILITIES.OVERPOWER && settings?.[SETTINGS.BERSERK] === true) {
            cdSeconds = 9.0;
        }

        timers[COOLDOWN_PREFIX + abilityKey] = 1 + Math.round(cdSeconds / 0.6);
    }
}

/**
 * Sets the min and var hit values for a given dmgObject as follows:
 * 1. Looks up and sets ability % values
 * 2. Applies style specific modifiers
 * 3. Calculates real damage ranges based on boosted AD
 * @param settings - Overall settings object
 * @param dmgObject - The dmgObject to set the min and var hit values for
 * @returns The dmgObject
 */
function set_min_var(settings: Record<string, any>, dmgObject: DamageObject) {
    const abilityKey = dmgObject.ability;
    const ctx: EffectContext = { settings, abilityKey };

    iterateDistributions(dmgObject, (distribution) => {
        // 1. Set base ability % values
        distribution.minHit = abils[abilityKey].minHit;
        distribution.varHit = abils[abilityKey].varHit;
        logger.log(LogCategory.ABILITY_DAMAGE, `set_min_var for ${abilityKey}`, {
            minHit: distribution.minHit,
            varHit: distribution.varHit
        });

        // 2. Apply style-specific ability percent modifiers (detonate, flanking, greater barge, etc.)
        applyStyleAbilityPercentModifiers(ctx, distribution);

        // 3. Shared effects (not style-specific)
        // Ultimatums — moved to applyBoostedADEffects (shared, in effects/index.ts)

        if (abilityKey === ABILITIES.AFTERSHOCK_MAGIC || abilityKey === ABILITIES.AFTERSHOCK_MELEE ||
            abilityKey === ABILITIES.AFTERSHOCK_RANGED || abilityKey === ABILITIES.AFTERSHOCK_NECRO) {
            distribution.minHit = distribution.minHit * settings[SETTINGS.AFTERSHOCK];
            distribution.varHit = distribution.varHit * settings[SETTINGS.AFTERSHOCK];
        }

        if (abilityKey === ABILITIES.POISON_DAMAGE) {
            let poison_tier = Object.values(SETTINGS.POISON_VALUES).indexOf(settings[SETTINGS.POISON]);
            if (poison_tier !== 0) {
                if (settings[SETTINGS.GLOVES] === ARMOUR.CINDERBANE_GLOVES) {
                    poison_tier = Math.min(5, Math.max(2, poison_tier + 1));
                }
                let multi = 1 + 0.25 * (poison_tier - 1);
                multi *= 1 + 0.03 * settings[SETTINGS.BIK_STACKS];
                distribution.minHit = distribution.minHit * multi;
                distribution.varHit = distribution.varHit * multi;
            }
        }

        // 4. Convert percent values to actual damage using boosted AD
        const minPct = distribution.minHit;
        const varPct = distribution.varHit;
        distribution.minHit = Math.floor(minPct * distribution['boosted AD']);
        distribution.varHit = Math.floor(varPct * distribution['boosted AD']);
    });

    return dmgObject;
}

/**
 * Splits a single ability cast into its component hit objects based on classification.
 * Multihits get expanded via hit sequence, bleeds/burns/dots get cloned per hit,
 * channels are handled elsewhere, and single hits pass through directly.
 */
function splitAbilityIntoHits(
    settings: Record<string, any>,
    abilityKey: ABILITIES,
    dmgObject: DamageObject,
    dmgObjects: DamageObject[],
    preability_AD: number
): void {
    const classification = abils[abilityKey].abilityClassification;

    if (classification == 'multihit') {
        let hits = get_hit_sequence(settings);

        for (let tick in hits) {
            for (let hit in hits[tick]) {
                if (abils[hits[tick][hit]]) {
                    let clone = create_damage_object(settings, hits[tick][hit] as ABILITIES);
                    iterateDistributions(clone, (cloneDist, kind) => {
                        const sourceDist = getDamageDistribution(dmgObject, kind);
                        if (sourceDist && cloneDist) {
                            // Copy boosted AD from parent, but keep the sub-hit's own crit probability
                            // (sub-hits like Final Flurry have different crit chances per hit)
                            cloneDist['boosted AD'] = sourceDist['boosted AD'];
                        }
                    });
                    dmgObjects.push(clone);
                }
            }
        }

        // Residual soul consumption now handled by consumeStacks in necromancy_effects.ts
    }
    else if (['bleed', 'burn', 'dot'].includes(classification)) {
        const bleedHits = get_hit_sequence(settings);
        let n_hits = bleedHits[1].length;
        for (let i = 0; i < n_hits; i++) {
            const clone = structuredClone(dmgObject);
            const hitAbility = bleedHits[1][i];
            clone.ability = hitAbility as ABILITIES;
            if (clone.ability === ABILITIES.SOULFIRE_INITIAL) {
                iterateDistributions(clone, (distribution) => {
                    distribution['boosted AD'] = preability_AD;
                });
            }
            dmgObjects.push(clone);
        }
    }
    else if (classification == 'channel') {
        // Channels are handled by the rotation builder tick-by-tick
    }
    else {
        dmgObjects.push(dmgObject);
    }
}

/**
 * Generates the damage list (all possible damage rolls) from min/var hit values.
 */
function rollDamageList(dmgObject: DamageObject): void {
    iterateDistributions(dmgObject, (distribution) => {
        for (let i = 0; i <= distribution.varHit; i++) {
            distribution['damage list'].push(distribution.minHit + i);
        }
    });
}

/**
 * Applies per-roll damage modifiers: berserker's fury and crit damage scaling.
 */
function applyDamageListModifiers(
    settings: Record<string, any>,
    dmgObject: DamageObject,
    abilityKey: ABILITIES
): void {
    let critDamageBonus = 0;
    iterateDistributions(dmgObject, (distribution) => {
        const isCrit = distribution['crit'] === true && abils[abilityKey].critEffects === true;
        const critMultiplier = isCrit ? 1 + calc_crit_damage(settings, dmgObject) : 1;
        if (isCrit) critDamageBonus = critMultiplier - 1;

        for (let i = 0; i < distribution['damage list'].length; i++) {
            // Berserker's fury
            distribution['damage list'][i] = Math.floor(
                distribution['damage list'][i] * (1 + settings[SETTINGS.BERSERKERS_FURY] / 100)
            );

            // Crit damage scaling
            if (isCrit) {
                distribution['damage list'][i] = Math.floor(
                    distribution['damage list'][i] * critMultiplier
                );
            }
        }
    });

    // Emit structured per-hit trace
    const nonCrit = dmgObject.distributions['non_crit'];
    const crit = dmgObject.distributions['crit'];
    if (nonCrit && nonCrit['damage list'].length > 0) {
        logger.traceHit({
            ability: abilityKey,
            boostedAD: nonCrit['boosted AD'] ?? 0,
            min: nonCrit['damage list'][0],
            max: nonCrit['damage list'][nonCrit['damage list'].length - 1],
            critChance: crit?.['probability'] ?? 0,
            critDamageBonus,
            critMin: crit?.['damage list']?.[0] ?? 0,
            critMax: crit?.['damage list']?.[crit['damage list'].length - 1] ?? 0,
        });
    }
}

/**
 * Creates split soul (ECB) damage objects from the original hit's damage.
 */
function handleSplitSoul(
    settings: Record<string, any>,
    dmgObject: DamageObject,
    results: DamageObject[]
): void {
    const abilityKey = dmgObject.ability;
    const damageType = abils[abilityKey].damageType;
    const hasSoulSplitData = settings['soul split']?.['damage list'];

    // ECB Split Soul: applies to all damage types while active
    const ecbActive = settings[SETTINGS.SPLIT_SOUL] === true;
    // Necro Split Soul: only applies to necrotic damage
    const necroActive = settings[SETTINGS.SPLIT_SOUL_NECRO] === true && damageType === 'necrotic';

    if (
        (!ecbActive && !necroActive) ||
        !['magic', 'melee', 'ranged', 'necrotic'].includes(damageType) ||
        !hasSoulSplitData || damageType === 'split soul'
    ) {
        return;
    }

    const splitSoulAbility = necroActive ? ABILITIES.SPLIT_SOUL_NECRO : ABILITIES.SPLIT_SOUL_ECB;
    const splitSoulObject = create_damage_object(settings, splitSoulAbility);
    splitSoulObject.likelihood = dmgObject.likelihood;

    iterateDistributions(dmgObject, (distribution, kind) => {
        const splitSoulDist = getDamageDistribution(splitSoulObject, kind);
        if (splitSoulDist && distribution['damage list']) {
            splitSoulDist['probability'] = distribution['probability'];
            splitSoulDist['crit'] = distribution['crit'];
            splitSoulDist['damage list'] = distribution['damage list'].map(damage =>
                calc_split_soul_hit(damage, settings)
            );
        }
    });

    results.push(splitSoulObject);
}

/**
 * Grants adrenaline from critical hits when crit buff (Tsunami/Incendiary/Meteor) is active.
 * Does not apply to necromancy abilities.
 */
function handleCritBuffAdrenaline(settings: Record<string, any>, dmgObject: DamageObject): void {
    const abilityKey = dmgObject.ability;
    if (
        abils[abilityKey].critEffects === true &&
        abils[abilityKey].mainStyle === 'magic' &&
        settings[SETTINGS.CRIT_BUFF] &&
        settings[SETTINGS.EXPECTED_ADRENALINE]
    ) {
        const critDist = getDamageDistribution(dmgObject, 'crit');
        let prob = critDist ? critDist['probability'] : 0;
        prob = prob * dmgObject.likelihood;
        addAdrenaline(settings, prob * 8);
    }
}

/**
 * Handles BOLG (Bow of the Last Guardian) perfect equilibrium proc
 * @param settings - game settings object
 * @param dmgObject - the triggering damage object (used to calculate bonus damage)
 * @param timers - timer state
 * @param dmgObjects - array to push resulting damage objects into
 * @returns true if proc was triggered, false otherwise
 */
function handleBolgProc(
    settings: Record<string, any>,
    dmgObject: DamageObject,
    timers: Record<string, number>,
    dmgObjects: DamageObject[]
): boolean {
    const isBolg = (settings[SETTINGS.TH] === WEAPONS.BOW_OF_THE_LAST_GUARDIAN ||
        settings[SETTINGS.TH] === WEAPONS.BOW_OF_THE_LAST_GUARDIAN_IM)
        &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH;

    const shouldProc = settings[SETTINGS.PERFECT_EQUILIBRIUM_STACKS] === 8 ||
        (settings[SETTINGS.PERFECT_EQUILIBRIUM_STACKS] >= 4 && settings[SETTINGS.BALANCE_BY_FORCE] === true);

    if (!isBolg || !shouldProc) {
        return false;
    }

    // Reset stacks and create proc damage
    settings[SETTINGS.PERFECT_EQUILIBRIUM_STACKS] = 0;

    let bolgDmgObject = create_damage_object(settings, ABILITIES.BOLG_PROC);
    bolgDmgObject = on_cast(settings, bolgDmgObject, timers, ABILITIES.BOLG_PROC)[0];

    // Get damage list from triggering hit to calculate bonus damage
    const dmgList = getDamageDistribution(dmgObject, 'non_crit')?.['damage list'] || [];

    // Add 33-37% of triggering hit's damage to BOLG proc
    if (dmgList.length > 0) {
        const minBonus = Math.floor(dmgList[0] * 0.33);
        const maxBonus = Math.floor(dmgList[dmgList.length - 1] * 0.37);
        const varBonus = maxBonus - minBonus;

        const bolgCritDist = getDamageDistribution(bolgDmgObject, 'crit');
        const bolgNonCritDist = getDamageDistribution(bolgDmgObject, 'non_crit');

        if (bolgCritDist) {
            bolgCritDist.minHit += minBonus;
            bolgCritDist.varHit += varBonus;
        }
        if (bolgNonCritDist) {
            bolgNonCritDist.minHit += minBonus;
            bolgNonCritDist.varHit += varBonus;
        }
    }

    const bolgDmgObjects = on_hit(settings, bolgDmgObject, timers, ABILITIES.BOLG_PROC);
    dmgObjects.push(...bolgDmgObjects);

    return true;
}

/**
 * Handles FSOA (Fractured Staff of Armadyl) instability proc
 * Creates Time Strike damage on magic critical hits
 */
function handleFsoa(
    abilityKey: ABILITIES,
    settings: Record<string, any>,
    dmgObject: DamageObject,
    timers: Record<string, number>,
    dmgObjects: DamageObject[]
): void {
    if (abils[abilityKey].critEffects === true
        && settings[SETTINGS.INSTABILITY] === true
        && abils[abilityKey].damageType === 'magic'
        && abilityKey != 'time strike') {

        let fsoaDmgObject = create_damage_object(settings, ABILITIES.TIME_STRIKE);
        fsoaDmgObject.likelihood = dmgObject.distributions.crit.probability || 0;
        fsoaDmgObject = on_cast(settings, fsoaDmgObject, timers, ABILITIES.TIME_STRIKE)[0];
        let fsoaDmgObjects = on_hit(settings, fsoaDmgObject, timers, ABILITIES.TIME_STRIKE);
        dmgObjects.push(...fsoaDmgObjects);
    }
}

export {on_stall, on_cast, on_hit, on_damage, COOLDOWN_PREFIX}