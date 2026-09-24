/**
 * Style-specific effects index
 *
 * Provides a unified interface for applying combat style-specific effects
 * during damage calculation.
 */
import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { weapons } from '$lib/data/weapons'
import { SETTINGS } from '../../settings_rb';
import { DamageDistribution, DamageObject } from '../../types';
import { EffectContext, BoostedADResult, StyleEffects } from './types';

import { magicEffects } from './magic_effects';
import { meleeEffects } from './melee_effects';
import { rangedEffects, handleWenBuffActivation } from './ranged_effects';
import { necromancyEffects } from './necromancy_effects';

// Re-export types
export * from './types';

// Re-export necromancy utility functions
export { };

// Re-export ranged utility functions
export { handleWenBuffActivation as handleWenBuffConsumption };

// Re-export additive and PvE effects
export {
    calculateAdditiveBoost,
    applyAdditiveBoosts,
    calculatePvEBoost,
    applyPvEBoosts,
    calculateSlayerHelmBoost,
    calculateGuardhouseBoost
} from './additive_effects';

// Re-export equipment effects
export { calculateVoidBoost, countVoidPieces, getVoidHelmBoost } from './equipment_effects';

// Re-export prayer effects
export { calculatePrayerBoost } from './prayer_effects';

// Re-export damage modifier effects
export {
    applyAllDamageModifiers,
    applyVulnerabilityEffect,
    applyAllSlayerEffects,
    applyElementsScrimshawEffect,
    applyCrueltyScrimshawEffect,
    applyGhostHunterEffect,
    applyCryptbloomEffect,
    applySalamancyEffect,
    applyHauntedEffect,
    applyEssenceCorruptionEffect,
    applyHitCap,
    calculateHauntedBonus,
    countGhostHunterPieces,
    type DamageModifierContext
} from './damage_modifier_effects';

type CombatStyle = 'magic' | 'melee' | 'ranged' | 'necromancy';

/**
 * Map of combat styles to their effect handlers
 */
const styleEffectsMap: Record<CombatStyle, StyleEffects> = {
    magic: magicEffects,
    melee: meleeEffects,
    ranged: rangedEffects,
    necromancy: necromancyEffects
};

/**
 * Get the combat style for an ability
 */
export function getAbilityStyle(abilityKey: ABILITIES): CombatStyle | null {
    const style = abils[abilityKey]?.mainStyle;
    if (style && style in styleEffectsMap) {
        return style as CombatStyle;
    }
    return null;
}

/**
 * Get the effect handlers for a given combat style
 */
export function getStyleEffects(style: CombatStyle): StyleEffects {
    return styleEffectsMap[style];
}

/**
 * Apply boosted AD effects for the ability's combat style
 * Also applies shared pocket slot effects (Scripture of Amascut)
 */
export function applyStyleBoostedADEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    baseDamage: number
): BoostedADResult {
    const { settings } = ctx;
    let result: BoostedADResult = { applied: false };

    // Apply style-specific effects
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        result = styleEffectsMap[style].applyBoostedADEffects(ctx, distribution, baseDamage);
    }

    // Scripture of Amascut (shared across all styles, +10% boosted AD)
    if (settings[SETTINGS.POCKET] === ARMOUR.AMASCUT_BOOK) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.1);
        result.applied = true;
    }

    // Ultimatums perk: ultimates gain (3 + 1 per rank)% boosted AD
    if (settings[SETTINGS.ULTIMATUMS] > 0 && abils[ctx.abilityKey]?.abilityType === 'ultimate') {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] / 100 * (100 + 3 + settings[SETTINGS.ULTIMATUMS]));
        result.applied = true;
    }

    return result;
}

/**
 * Apply ability-specific effects for the ability's combat style
 */
export function applyStyleAbilitySpecificEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        styleEffectsMap[style].applyAbilitySpecificEffects(ctx, distribution);
    }
}

/**
 * Apply ability percent modifiers for the ability's combat style
 * Called in set_min_var before conversion to damage values
 */
export function applyStyleAbilityPercentModifiers(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        styleEffectsMap[style].applyAbilityPercentModifiers(ctx, distribution);
    }
}

/**
 * Apply min/var effects for the ability's combat style
 * Also applies style-agnostic effects like precise perk
 */
export function applyStyleMinVarEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings } = ctx;

    // Apply style-specific effects
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        styleEffectsMap[style].applyMinVarEffects(ctx, distribution);
    }

    // Apply precise perk
    if (settings[SETTINGS.PRECISE] > 0) {
        const max_hit = distribution.minHit + distribution.varHit;
        distribution.minHit = distribution.minHit + Math.floor(0.015 * settings[SETTINGS.PRECISE] * max_hit);
        distribution.varHit = Math.max(0, distribution.varHit - Math.floor(0.015 * settings[SETTINGS.PRECISE] * max_hit));
    }
}

/**
 * Apply multiplicative effects for the ability's combat style
 * Also applies shared effects (revenge, ruthless)
 */
export function applyStyleMultiplicativeEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    boost: number
): number {
    const { settings } = ctx;

    // Apply style-specific effects (berserk, death's swiftness, sunshine, etc.)
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        boost = styleEffectsMap[style].applyMultiplicativeEffects(ctx, distribution, boost);
    }

    // Revenge (shield/defender ability)
    const ohWeaponType = weapons[settings[SETTINGS.OH]]?.['weapon type'];
    if (ohWeaponType === 'shield' || ohWeaponType === 'defender') {
        let revenge = 0.025 * settings[SETTINGS.REVENGE];
        // Boost is twice as big if done with a shield
        if (ohWeaponType === 'shield') {
            revenge = revenge * 2;
        }
        boost = Math.floor(boost * (1 + revenge));
    }

    // Crystal weapons (proc based, addsd later
    // Spendthrift?
    // Ruthless perk
    // TODO: fix - currently breaks calc if no ruthless stacks
    boost = Math.floor(
        boost * (1 + settings[SETTINGS.RUTHLESS_STACKS] * settings[SETTINGS.RUTHLESS_RANK] * 0.005)
    );

    return boost;
}

/**
 * Apply stack effects for the ability's combat style
 */
export function applyStyleStackEffects(ctx: EffectContext): void {
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        styleEffectsMap[style].applyStackEffects(ctx);
    }
}

/**
 * Consume stacks after damage has been calculated for the ability's combat style.
 * Optional — only fires if the style implements consumeStacks.
 */
export function consumeStyleStacks(ctx: EffectContext): void {
    const style = getAbilityStyle(ctx.abilityKey);
    if (style && styleEffectsMap[style].consumeStacks) {
        styleEffectsMap[style].consumeStacks(ctx);
    }
}

/**
 * Apply bonus damage effects for the ability's combat style
 */
export function applyStyleBonusDamageEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        styleEffectsMap[style].applyBonusDamageEffects(ctx, distribution);
    }
}

/**
 * Collect all cleanup functions from style effects that need to run
 */
export function collectCleanupFunctions(
    ctx: EffectContext,
    distribution: DamageDistribution,
    baseDamage: number
): Array<() => void> {
    const cleanups: Array<() => void> = [];

    const style = getAbilityStyle(ctx.abilityKey);
    if (style) {
        const result = styleEffectsMap[style].applyBoostedADEffects(ctx, distribution, baseDamage);
        if (result.cleanup) {
            cleanups.push(result.cleanup);
        }
    }

    return cleanups;
}

