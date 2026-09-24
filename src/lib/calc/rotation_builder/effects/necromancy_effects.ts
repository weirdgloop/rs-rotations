/**
 * Necromancy-specific damage calculation effects
 */

import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { SETTINGS } from '../../settings_rb';
import { DamageDistribution } from '../../types';
import { countTFNPieces } from '../rotation_damage_helper';
import { EffectContext, BoostedADResult, StyleEffects } from './types';

/**
 * Apply necromancy weapon effects that modify boosted AD
 * Note: Necromancy currently has no known weapon-based boosted AD modifiers
 */
function applyBoostedADEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    baseDamage: number
): BoostedADResult {
    const { settings, abilityKey } = ctx;

    // Conjure abilities: TFN set effect + Conjurer's Raising Amulet, then early return
    if (abils[abilityKey]?.abilityType === 'conjure') {
        let conjBoost = 0;
        const tfnPieces = countTFNPieces(settings);
        if (tfnPieces >= 2) {
            conjBoost += 0.07 * tfnPieces;
        }
        if (settings[SETTINGS.NECKLACE] === ARMOUR.CONJURERS_RAISING_AMULET) {
            conjBoost += 0.05;
        }
        if (conjBoost > 0) {
            distribution['boosted AD'] = Math.floor((1 + conjBoost) * distribution['boosted AD']);
            return { applied: true };
        }
    }

    return { applied: false };
}

/**
 * Apply necromancy ability-specific effects
 */
function applyAbilitySpecificEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // Death Spark empowered auto (Omni Guard) - at 5 stacks the auto does 2x damage
    if (abilityKey === ABILITIES.NECRO_AUTO &&
        (settings[SETTINGS.NECRO_MH] === WEAPONS.OMNI_GUARD || settings[SETTINGS.NECRO_MH] === WEAPONS.OMNI_GUARD_IM) &&
        (settings[SETTINGS.DEATH_SPARK_STACKS] || 0) >= 5) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 2);
    }

    // Living Death - Finger of Death 1.5x damage
    if (settings[SETTINGS.LIVING_DEATH] === true && abilityKey === ABILITIES.FINGER_OF_DEATH) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.5);
    }

    // Skeleton Warrior rage stacks
    if (abilityKey === ABILITIES.SKELETON_WARRIOR_AUTO) {
        distribution['boosted AD'] = Math.floor(
            distribution['boosted AD'] * (1 + 0.03 * settings[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS])
        );
    }

    if (abilityKey === ABILITIES.SPECTRAL_SCYTHE_3) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * (1 + (1-settings[SETTINGS.TARGET_HP_PERCENT]/100)));
    }
}

/**
 * Apply necromancy ability percent modifiers (before conversion to damage values)
 */
function applyAbilityPercentModifiers(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // Death Grasp (Death Guard spec)
    if (abilityKey === ABILITIES.DEATH_GRASP) {
        distribution.minHit = distribution.minHit + 0.4 * settings[SETTINGS.NECROSIS_STACKS];
    }

    // soul crush
    if (settings['ability'] === ABILITIES.SOUL_CRUSH) {
        distribution.minHit += 1.35 * settings[SETTINGS.RESIDUAL_SOULS];
        distribution.varHit += 0.3 * settings[SETTINGS.RESIDUAL_SOULS];
    }

    // Flanking - Soul Strike (basic stun)
    if (abilityKey === ABILITIES.SOUL_STRIKE) {
        distribution.minHit += distribution.minHit * 0.4 * settings[SETTINGS.FLANKING];
        distribution.varHit += distribution.varHit * 0.4 * settings[SETTINGS.FLANKING];
    }
}

/**
 * Apply necromancy effects that modify min/var hit
 */
function applyMinVarEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // First Necromancer's equipment set effect ?
}

/**
 * Apply necromancy multiplicative effects
 */
function applyMultiplicativeEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    boost: number
): number {
    // Necromancy has no style-specific multiplicative effects in the shared section
    // (Living Death effects are handled in ability-specific effects)
    return boost;
}

/**
 * Handle necromancy stack effects
 * This includes necrosis stacks, residual souls, and essence corruption
 */
function applyStackEffects(ctx: EffectContext): void {
    const { settings, abilityKey } = ctx;

    // Residual Souls - Soul Sap generates 1 soul
    if (abilityKey === ABILITIES.SOUL_SAP) {
        settings[SETTINGS.RESIDUAL_SOULS] = Math.min(
            (settings[SETTINGS.RESIDUAL_SOULS] || 0) + 1,
            7  // TODO: set soul limit dynamically based on gear
        );
    }

    // Necrosis Stacks
    // Touch of Death generates 4 stacks
    if (abilityKey === ABILITIES.TOUCH_OF_DEATH) {
        settings[SETTINGS.NECROSIS_STACKS] = Math.min(
            (settings[SETTINGS.NECROSIS_STACKS] || 0) + 4,
            12
        );
    }

    // Necro Auto generates 2 necrosis stacks ONLY during Living Death
    if (abilityKey === ABILITIES.NECRO_AUTO && settings[SETTINGS.LIVING_DEATH] === true) {
        settings[SETTINGS.NECROSIS_STACKS] = Math.min(
            (settings[SETTINGS.NECROSIS_STACKS] || 0) + 2,
            12
        );
    }

    // Omni Guard - Death Spark: each auto generates 1 stack (max 5).
    // Empowered auto at 5 stacks resets to 0 (damage applied in applyAbilitySpecificEffects).
    if (abilityKey === ABILITIES.NECRO_AUTO &&
        (settings[SETTINGS.NECRO_MH] === WEAPONS.OMNI_GUARD || settings[SETTINGS.NECRO_MH] === WEAPONS.OMNI_GUARD_IM)) {
        const currentStacks = settings[SETTINGS.DEATH_SPARK_STACKS] || 0;
        if (currentStacks >= 5) {
            // Empowered auto was fired — reset stacks
            settings[SETTINGS.DEATH_SPARK_STACKS] = 0;
        } else {
            settings[SETTINGS.DEATH_SPARK_STACKS] = currentStacks + 1;
        }
    }

    // Devourer's Guard - Soul Reave: each auto generates 1 stack, at 4 generates 1 Residual Soul (resets)
    if (abilityKey === ABILITIES.NECRO_AUTO &&
        (settings[SETTINGS.NECRO_MH] === WEAPONS.DEVOURERS_GUARD || settings[SETTINGS.NECRO_MH] === WEAPONS.DEVOURERS_GUARD_IM)) {
        const currentStacks = settings[SETTINGS.SOUL_REAVE_STACKS] || 0;
        if (currentStacks >= 4) {
            settings[SETTINGS.SOUL_REAVE_STACKS] = 0;
            settings[SETTINGS.RESIDUAL_SOULS] = Math.min(
                (settings[SETTINGS.RESIDUAL_SOULS] || 0) + 1,
                7
            );
        } else {
            settings[SETTINGS.SOUL_REAVE_STACKS] = currentStacks + 1;
        }
    }

    // Essence Corruption — implemented in magic_effects.ts applyStackEffects
    // (stacks per hitsplat from Combust, Corruption Blast, Soulfire with RoA/OtD equipped)
}

/**
 * Apply necromancy bonus damage effects
 */
function applyBonusDamageEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    // Necromancy currently has no flat bonus damage effects
}

/**
 * Consume stacks after damage has been calculated.
 * Handles residual souls and necrosis stacks.
 */
function consumeStacks(ctx: EffectContext): void {
    const { settings, abilityKey } = ctx;

    // Volley of Souls — consumes all residual souls
    if ((abilityKey === ABILITIES.VOLLEY_OF_SOULS_DYNAMIC ||
        abilityKey === ABILITIES.VOLLEY_OF_SOULS) && (settings[SETTINGS.RESIDUAL_SOULS] || 0) >= 2) {
        settings[SETTINGS.RESIDUAL_SOULS] = 0;
    }

    // Soul Crush — consumes all residual souls
    if (abilityKey === ABILITIES.SOUL_CRUSH) {
        settings[SETTINGS.RESIDUAL_SOULS] = 0;
    }

    // Soul Strike — consumes 1 residual soul
    if (abilityKey === ABILITIES.SOUL_STRIKE && (settings[SETTINGS.RESIDUAL_SOULS] || 0) > 0) {
        settings[SETTINGS.RESIDUAL_SOULS] -= 1;
    }

    // Finger of Death — consumes up to 6 necrosis stacks
    if (abilityKey === ABILITIES.FINGER_OF_DEATH) {
        const necrosis = settings[SETTINGS.NECROSIS_STACKS] || 0;
        const consumed = Math.min(necrosis, 6);
        settings[SETTINGS.NECROSIS_STACKS] = necrosis - consumed;
    }

    // Death Grasp — consumes all residual souls
    if (abilityKey === ABILITIES.DEATH_GRASP) {
        settings[SETTINGS.NECROSIS_STACKS] = 0;
    }
}

export const necromancyEffects: StyleEffects = {
    applyBoostedADEffects,
    applyAbilitySpecificEffects,
    applyAbilityPercentModifiers,
    applyMinVarEffects,
    applyMultiplicativeEffects,
    applyStackEffects,
    applyBonusDamageEffects,
    consumeStacks
}
