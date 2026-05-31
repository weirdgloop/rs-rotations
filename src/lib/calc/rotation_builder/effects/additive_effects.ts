/**
 * Additive damage boost effects
 * These are flat percentage boosts applied during the on_hit phase
 */

import { gear } from '$lib/data/slayer-helmets';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { ABILITIES, abils } from '$lib/data/abilities';
import { SETTINGS } from '../../settings_rb';
import { DamageDistribution } from '../../types';
import { EffectContext } from './types';
import { calculateVoidBoost } from './equipment_effects';

/**
 * Calculate the total additive boost for an ability
 * Returns a multiplier (e.g., 1.15 for 15% boost)
 */
export function calculateAdditiveBoost(ctx: EffectContext): number {
    const { settings, abilityKey } = ctx;
    let boost = 0;

    // Stone of Jas bonus
    boost += settings[SETTINGS.STONE_OF_JAS] / 100;

    // Void equipment boost
    boost += calculateVoidBoost(settings, abilityKey);

    // Draconic fruit (2%)
    boost += settings[SETTINGS.DRACONIC_FRUIT] === true ? 0.02 : 0;

    // berserker necklace
    if (settings[SETTINGS.NECKLACE] === ARMOUR.BERSERKER_NECKLACE &&
        (settings[SETTINGS.TH] === WEAPONS.EZK || settings[SETTINGS.TH] === WEAPONS.EZK_IM) && settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        boost += 0.05;
    }

    // Flamebound Rival: +12% damage (always applies during Igneous Showdown, or when debuff is active with EZK)
    if (
        (settings[SETTINGS.FLAMEBOUND_RIVAL] === true || abilityKey === ABILITIES.IGNEOUS_SHOWDOWN ||
         abilityKey === ABILITIES.IGNEOUS_SHOWDOWN_HIT || abilityKey === ABILITIES.IGNEOUS_SHOWDOWN_BONUS) &&
        (settings[SETTINGS.TH] === WEAPONS.EZK || settings[SETTINGS.TH] === WEAPONS.EZK_IM) &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        boost += 0.12;
    }

    // Enduring ruin (melee only)
    if (abils[abilityKey]?.mainStyle === 'melee') {
        boost += settings[SETTINGS.ENDURING_RUIN_HIT] === SETTINGS.ENDURING_RUIN_HIT_VALUES.REGULAR ? 0.1 : 0;
        boost += settings[SETTINGS.ENDURING_RUIN_HIT] === SETTINGS.ENDURING_RUIN_HIT_VALUES.ENCHANTED ? 0.16 : 0;
    }

     // Am-hej necklace 5% of str level
     if (abils[abilityKey]?.mainStyle === 'melee' &&
        settings[SETTINGS.NECKLACE] === ARMOUR.AM_HEJ) {
        boost += Math.floor(0.05 * settings[SETTINGS.STRENGTH_LEVEL])/100;
    }

    // Ruby aurora stacks (1% per stack)
    boost += settings[SETTINGS.RUBY_AURORA] * 0.01;

    // Scripture of Ful (20% * probability buff is active)
    if (settings[SETTINGS.POCKET] === ARMOUR.FUL_BOOK) {
        // TODO - expected vs max
        if (settings[SETTINGS.CALC_TYPE] === SETTINGS.CALC_TYPE_VALUES.ROTATION) {
            const fulProb = settings[SETTINGS.SCRIPTURE_OF_FUL_PROB] || 0;
            boost += 0.2 * fulProb;
        } else {
            boost += 0.2;
        }
    }

    // Gorajan trailblazer (7%)
    boost += settings[SETTINGS.GORAJAN_TRAILBLAZER] ? 0.07 : 0;

    // Gravitate - annihilation spec (melee only)
    if (abils[abilityKey]?.mainStyle === 'melee') {
        boost += settings[SETTINGS.GRAVITATE] / 100;
    }

    // Desperado - ring of kinship ranged boost
    if (settings[SETTINGS.DESPERADO] > 0 && abils[abilityKey]?.mainStyle === 'ranged') {
        boost += 0.1;
        boost += 0.01 * settings[SETTINGS.DESPERADO];
    }

    return boost;
}

/**
 * Apply additive boosts to a damage distribution
 */
export function applyAdditiveBoosts(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const boost = calculateAdditiveBoost(ctx);
    distribution.minHit = Math.floor(distribution.minHit * (1 + boost));
    distribution.varHit = Math.floor(distribution.varHit * (1 + boost));
}

// =============================================================================
// PvE Multiplicative Effects
// =============================================================================

/**
 * Calculate slayer helm boost
 */
export function calculateSlayerHelmBoost(settings: Record<string, any>): number {
    return 1 + gear[settings[SETTINGS.SLAYER_HELM]]?.['boost'] || 0;
}

/**
 * Calculate guardhouse boost
 */
export function calculateGuardhouseBoost(settings: Record<string, any>): number {
    let boost = 1;

    // Base guardhouse boost (1%)
    if (
        settings[SETTINGS.GUARDHOUSE] === SETTINGS.GUARDHOUSE_VALUES.LVL1 ||
        settings[SETTINGS.GUARDHOUSE] === SETTINGS.GUARDHOUSE_VALUES.LVL3
    ) {
        boost *= 1.01;
    }
    // Undead guardhouse boost (2%)
    else if (
        settings[SETTINGS.GUARDHOUSE] === SETTINGS.GUARDHOUSE_VALUES.LVL1_UNDEAD ||
        settings[SETTINGS.GUARDHOUSE] === SETTINGS.GUARDHOUSE_VALUES.LVL3_UNDEAD
    ) {
        boost *= 1.02;
    }

    // Lvl 3 guardhouse low HP boost (10%)
    if (
        (settings[SETTINGS.GUARDHOUSE] === SETTINGS.GUARDHOUSE_VALUES.LVL3 ||
            settings[SETTINGS.GUARDHOUSE] === SETTINGS.GUARDHOUSE_VALUES.LVL3_UNDEAD) &&
        settings[SETTINGS.TARGET_HP_PERCENT] < 25
    ) {
        boost *= 1.1;
    }

    return boost;
}

/**
 * Calculate all PvE multiplicative boosts
 * Returns a boost value in 10000-scale (10000 = 1x)
 */
export function calculatePvEBoost(ctx: EffectContext): number {
    const { settings, abilityKey } = ctx;
    let boost = 10000;

    // Slayer helm
    boost = Math.floor(boost * calculateSlayerHelmBoost(settings));

    // Fort Forinthry guardhouse
    boost = Math.floor(boost * calculateGuardhouseBoost(settings));

    // Genocidal perk
    boost = Math.floor(boost * (1 + settings[SETTINGS.GENOCIDAL] / 100));

    // Salve amulet
    if (settings[SETTINGS.NECKLACE] === ARMOUR.SALVE_AMULET) {
        boost = Math.floor(boost * 1.15);
    } else if (settings[SETTINGS.NECKLACE] === ARMOUR.SALVE_AMULET_E) {
        boost = Math.floor(boost * 1.2);
    }

    // Dragon rider necklace (10% boost to Dragon Breath)
    if (settings[SETTINGS.NECKLACE] === ARMOUR.DRAGON_RIDER_AMULET &&
        abilityKey === ABILITIES.DRAGON_BREATH) {
        boost = Math.floor(boost * 1.1);
    }

    // Swiftness of the Aviansie (EGWD Kree'arra buff)
    if (settings[SETTINGS.SWIFTNESS_OF_THE_AVIANSIE] === true) {
        boost = Math.floor(boost * 1.1);
    }

    // Perfect dungeoneering potion
    if (settings['perfect dungeoneering potion'] === true) {
        boost = Math.floor(boost * 1.05);
    }

    // Ripper demon familiar
    if (settings[SETTINGS.FAMILIAR] === SETTINGS.FAMILIAR_VALUES.RIPPER_DEMON) {
        boost += Math.floor(boost * 0.05 * (1 - settings[SETTINGS.TARGET_HP_PERCENT] / 100));
    }

    return boost;
}

/**
 * Apply PvE multiplicative boosts to a damage distribution
 */
export function applyPvEBoosts(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const boost = calculatePvEBoost(ctx);
    distribution.minHit = Math.floor((distribution.minHit * boost) / 10000);
    distribution.varHit = Math.floor((distribution.varHit * boost) / 10000);
}
