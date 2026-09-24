/**
 * Magic-specific damage calculation effects
 */

import { ABILITIES, abils } from '$lib/data/abilities';
import { WEAPONS } from '$lib/data/weapons';
import { ARMOUR } from '$lib/data/armour';
import { SETTINGS } from '../../settings_rb';
import { DamageDistribution } from '../../types';
import { EffectContext, BoostedADResult, StyleEffects } from './types';

/**
 * Apply magic weapon effects that modify boosted AD
 */
function applyBoostedADEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    baseDamage: number
): BoostedADResult {
    const { settings, abilityKey } = ctx;
    let applied = false;

    // Inquisitor staff
    if (
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        settings[SETTINGS.TH] === WEAPONS.INQUISITOR_STAFF
    ) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.125);
        applied = true;
    }
    // Inquisitor staff upgraded
    else if (
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        settings[SETTINGS.TH] === WEAPONS.INQUISITOR_STAFF_PLUS
    ) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.175);
        applied = true;
    }

    // crumble undead
    if (settings[SETTINGS.AUTO_CAST] === SETTINGS.AUTO_CAST_VALUES.CRUMBLE_UNDEAD) {
        distribution['boosted AD'] = Math.floor(1.3 * distribution['boosted AD']);
    }

    // blast infused — magic basics get +8% of base AD added to boosted AD
    if (abils[abilityKey]?.mainStyle === 'magic' &&
        abils[abilityKey]?.abilityType === 'basic' &&
        settings[SETTINGS.BLAST_INFUSED] === true
    ) {
        distribution['boosted AD'] += Math.floor(baseDamage * 80 / 1000);
    }

    // blood tithe (exsanguinate) — basics get +1% of base AD per stack
    if (abils[abilityKey]?.abilityType === 'basic' && settings[SETTINGS.BLOOD_TITHE] > 0) {
        distribution['boosted AD'] += Math.floor(baseDamage / 1000 * settings[SETTINGS.BLOOD_TITHE] * 10);
    }

    // caroming chain — reduces bounced hit damage to a percentage
    if (settings[SETTINGS.CHAIN_MODIFIER] !== SETTINGS.CHAIN_MODIFIER_VALUES.NONE) {
        let chainModifier = 25;
        if (settings[SETTINGS.CHAIN_MODIFIER] === SETTINGS.CHAIN_MODIFIER_VALUES.GREATER) {
            chainModifier = 50;
        }
        if (settings[SETTINGS.CAROMING] >= 1) {
            chainModifier += 5 * (1 + settings[SETTINGS.CAROMING]);
        }
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] / 100 * chainModifier);
    }

    return { applied };
}

/**
 * Apply magic ability-specific effects
 */
function applyAbilitySpecificEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    if (abilityKey === ABILITIES.THE_LAST_COMMAND) {
        const hpMissing = 100 - Math.min(settings[SETTINGS.TARGET_HP_PERCENT], 100)
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * (1 + 0.01 * (Math.min(hpMissing, 75))));
    }

    // Dragon Breath — 25% more damage if target is combusted
    if (abilityKey === ABILITIES.DRAGON_BREATH && settings[SETTINGS.COMBUSTED] === true) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.25);
    }

    // Conflagrate (boosted Combust)
    if (abilityKey === ABILITIES.COMBUST && settings[SETTINGS.CONFLAGRATE] === true) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.4);
    }

    // Song of Destruction 2-piece set effect (RoA + OtD)
    if (
        ['bleed', 'burn', 'dot'].includes(abils[abilityKey]?.abilityClassification) &&
        (settings[SETTINGS.MH] === WEAPONS.ROAR_OF_AWAKENING || settings[SETTINGS.MH] === WEAPONS.ROAR_OF_AWAKENING_IM) &&
        (settings[SETTINGS.OH] === WEAPONS.ODE_TO_DECEIT || settings[SETTINGS.OH] === WEAPONS.ODE_TO_DECEIT_IM) &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW
    ) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.3);
    }

    // Kerapac's wristwraps (Combust) — buff active when Dragon Breath was cast with KWW/KWW_E
    if (abilityKey === ABILITIES.COMBUST && settings[SETTINGS.KERAPACS_WRIST_WRAPS] === true) {
        const hasEnchantment = settings[SETTINGS.GLOVES] === ARMOUR.KERAPACS_WRISTWRAPS_E &&
            settings[SETTINGS.ENCHANTMENT_OF_FLAMES] === true;
        const multiplier = hasEnchantment ? 1.4 : 1.25;
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * multiplier);
    }

    // Combust lunging - (10 + 3 per rank)% more damage
    if (abilityKey === ABILITIES.COMBUST && settings[SETTINGS.LUNGING] > 0) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * (1 + (0.10 + 0.03 * settings[SETTINGS.LUNGING])));
    }

    // Greater chain — non-bleed/burn/dot abilities deal half damage
    if (
        settings[SETTINGS.GREATER_CHAIN] === true &&
        !['bleed', 'burn', 'dot'].includes(abils[abilityKey]?.abilityClassification)
    ) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 0.5);
    }
}

/**
 * Apply magic ability percent modifiers (before conversion to damage values)
 * These modify the base min/var percentages from ability data
 */
function applyAbilityPercentModifiers(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // Anima Charged Dragon Breath: 260-310% instead of 110-130%
    if (abilityKey === ABILITIES.DRAGON_BREATH && settings['anima charged cast'] === true) {
        distribution.minHit = 2.6;
        distribution.varHit = 0.5;
    }

    // Flanking - Impact
    if (abilityKey === ABILITIES.IMPACT) {
        distribution.minHit += distribution.minHit * 0.4 * settings[SETTINGS.FLANKING];
        distribution.varHit += distribution.varHit * 0.4 * settings[SETTINGS.FLANKING];
    }

}

/**
 * Apply magic effects that modify min/var hit (on-hit phase)
 */
function applyMinVarEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // Channeler's ring
    if (
        settings[SETTINGS.RING] === ARMOUR.CHANNELLERS_RING &&
        abils[abilityKey]?.abilityClassification === 'channel'
    ) {
        distribution.minHit = Math.floor(distribution.minHit * 1.04);
        distribution.varHit = Math.floor(distribution.varHit * 1.04);
    }
}

/**
 * Apply magic multiplicative effects
 */
function applyMultiplicativeEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    boost: number = 10000
): number {
    const { settings, abilityKey } = ctx;
    // Sunshine
    if (settings[SETTINGS.SUNSHINE] === true) {
        boost = Math.floor(boost * 1.5);
    }

    // blast infused — moved to applyBoostedADEffects
    // blood tithe — moved to applyBoostedADEffects

    return boost;
}

/**
 * Handle magic stack effects
 * Increments blood tithe (exsanguinate) and glacial embrace (incite fear) stacks.
 *
 * Stacks are gained once per ability activation (not per hit), so multihit abilities
 * like Wild Magic only grant 1 stack. Channeled abilities grant 1 per channel tick
 * since each tick enters on_hit separately with its own sub-ability key.
 *
 * We use a flag ('_last_stack_ability') to deduplicate: if the same parent ability
 * key already incremented stacks, skip subsequent hits from the same cast.
 */
function applyStackEffects(ctx: EffectContext): void {
    const { settings, abilityKey } = ctx;

    if (abils[abilityKey]?.mainStyle !== 'magic') return;
    if (abils[abilityKey]?.onHitEffects !== true) return;

    // Deduplicate: multihit sub-hits share the same key (e.g. 'wild magic hit')
    // and fire multiple on_hit calls in the same cast. Use settings['ability']
    // (set to parent key in on_cast) plus this hit key to detect repeats.
    const castId = settings['ability'] + ':' + abilityKey;
    if (settings['_last_stack_ability'] === castId) return;
    settings['_last_stack_ability'] = castId;

    // Blood tithe stacks (exsanguinate) - 1 per cast, cap 12, decay after 20.4s (34 ticks)
    if (settings[SETTINGS.AUTO_CAST] === SETTINGS.AUTO_CAST_VALUES.EXSANGUINATE) {
        settings[SETTINGS.BLOOD_TITHE] = Math.min(
            (settings[SETTINGS.BLOOD_TITHE] || 0) + 1,
            12
        );
        if (ctx.timers) {
            ctx.timers['_blood_tithe_decay'] = 34;
        }
    }

    // Glacial embrace stacks (incite fear) - 1 per cast, cap 5, decay after 20.4s (34 ticks)
    if (settings[SETTINGS.AUTO_CAST] === SETTINGS.AUTO_CAST_VALUES.INCITE_FEAR) {
        settings[SETTINGS.GLACIAL_EMBRACE] = Math.min(
            (settings[SETTINGS.GLACIAL_EMBRACE] || 0) + 1,
            5
        );
        // Refresh decay timer - stacks fall off 34 ticks after last magic ability with incite fear
        if (ctx.timers) {
            ctx.timers['_glacial_embrace_decay'] = 34;
        }
    }
    // Concentrated blast / Greater concentrated blast
    // Hit 3 activates a crit buff for the next ability.
    // Snapshot whether anima charged was active on hit 1 (AC gets consumed on cast).
    if (abilityKey === ABILITIES.CONCENTRATED_BLAST_1 || abilityKey === ABILITIES.GREATER_CONCENTRATED_BLAST_1) {
        settings['_conc_anima_charged'] = settings['anima charged cast'] === true;
    }

    if (abilityKey === ABILITIES.CONCENTRATED_BLAST_3) {
        const buffKey = settings['_conc_anima_charged'] ? SETTINGS.CONC_CRIT_AC : SETTINGS.CONC_CRIT;
        settings[buffKey] = true;
        settings['_channelBuffJustActivated'] = buffKey;
    } else if (abilityKey === ABILITIES.GREATER_CONCENTRATED_BLAST_3) {
        const buffKey = settings['_conc_anima_charged'] ? SETTINGS.GCONC_CRIT_AC : SETTINGS.GCONC_CRIT;
        settings[buffKey] = true;
        ctx.timers[buffKey] = 100;
        settings['_channelBuffJustActivated'] = buffKey;
    }
}

/**
 * Apply magic bonus damage effects
 */
function applyBonusDamageEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    // Magic currently has no flat bonus damage effects
}

export const magicEffects: StyleEffects = {
    applyBoostedADEffects,
    applyAbilitySpecificEffects,
    applyAbilityPercentModifiers,
    applyMinVarEffects,
    applyMultiplicativeEffects,
    applyStackEffects,
    applyBonusDamageEffects
};
