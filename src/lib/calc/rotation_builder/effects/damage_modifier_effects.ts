/**
 * Damage modifier effects that apply during the on_damage phase
 * These effects modify the final damage values in the damage list
 */

import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { SETTINGS } from '../../settings_rb';
import { gearSets, GEAR_SET } from '$lib/data/gear-sets';
import { countSetPieces } from '../gear-registry';
import { DamageDistribution } from '../../types';

export interface DamageModifierContext {
    settings: Record<string, any>;
    abilityKey: ABILITIES;
}

// =============================================================================
// Vulnerability & Debuff Effects
// =============================================================================

/**
 * Apply vulnerability/curse damage multiplier
 */
export function applyVulnerabilityEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.VULNERABILITY) {
        return Math.floor(damage * 1.1);
    } else if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.CURSE) {
        return Math.floor(damage * 1.05);
    }

    return damage;
}

// =============================================================================
// Slayer Effects (Perks & Sigils)
// =============================================================================

/**
 * Apply undead slayer effects (perk + sigil)
 */
export function applyUndeadSlayerEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.SLAYER_PERK_UNDEAD] === true) {
        damage = Math.floor(damage * 1.07);
    }

    if (settings[SETTINGS.UNDEAD_SLAYER_ABILITY] === true) {
        damage = Math.floor(damage * 1.15);
    }

    return damage;
}

/**
 * Apply dragon slayer effects (perk + sigil)
 */
export function applyDragonSlayerEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.SLAYER_PERK_DRAGON] === true) {
        damage = Math.floor(damage * 1.07);
    }

    if (settings[SETTINGS.DRAGON_SLAYER_ABILITY] === true) {
        damage = Math.floor(damage * 1.15);
    }

    return damage;
}

/**
 * Apply demon slayer effects (perk + sigil)
 */
export function applyDemonSlayerEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.SLAYER_PERK] === SETTINGS.SLAYER_PERK_VALUES.UNDEAD ) {
        damage = Math.floor(damage * 1.07);
    }

    if (settings[SETTINGS.SLAYER_SIGIL] === SETTINGS.SLAYER_SIGIL_VALUES.UNDEAD) {
        damage = Math.floor(damage * 1.15);
    }

    if (settings[SETTINGS.SLAYER_PERK] === SETTINGS.SLAYER_PERK_VALUES.DRAGON ) {
        damage = Math.floor(damage * 1.07);
    }

    if (settings[SETTINGS.SLAYER_SIGIL] === SETTINGS.SLAYER_SIGIL_VALUES.DRAGON) {
        damage = Math.floor(damage * 1.15);
    }

    if (settings[SETTINGS.SLAYER_PERK] === SETTINGS.SLAYER_PERK_VALUES.DEMON ) {
        damage = Math.floor(damage * 1.07);
    }

    if (settings[SETTINGS.SLAYER_SIGIL] === SETTINGS.SLAYER_SIGIL_VALUES.DEMON) {
        damage = Math.floor(damage * 1.15);
    }

    return damage;
}

/**
 * Apply all slayer effects
 */
export function applyAllSlayerEffects(
    ctx: DamageModifierContext,
    damage: number
): number {
    damage = applyUndeadSlayerEffect(ctx, damage);
    damage = applyDragonSlayerEffect(ctx, damage);
    damage = applyDemonSlayerEffect(ctx, damage);
    return damage;
}

// =============================================================================
// Pocket Slot Effects (Scrimshaws)
// =============================================================================

/**
 * Apply scrimshaw of elements effect (magic)
 */
export function applyElementsScrimshawEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings, abilityKey } = ctx;
    const style = abils[abilityKey]?.mainStyle;

    if (style !== 'magic') {
        return damage;
    }

    if (settings[SETTINGS.POCKET] === ARMOUR.SCRIMSHAW_OF_ELEMENTS) {
        return Math.floor(damage * 1.05);
    } else if (settings[SETTINGS.POCKET] === ARMOUR.SUPERIOR_SCRIMSHAW_OF_ELEMENTS) {
        return Math.floor(damage * 1.0666);
    }

    return damage;
}

/**
 * Apply scrimshaw of cruelty effect (ranged)
 */
export function applyCrueltyScrimshawEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings, abilityKey } = ctx;
    const style = abils[abilityKey]?.mainStyle;

    if (style !== 'ranged') {
        return damage;
    }

    if (settings[SETTINGS.POCKET] === ARMOUR.SCRIMSHAW_OF_CRUELTY) {
        return Math.floor(damage * 1.05);
    } else if (settings[SETTINGS.POCKET] === ARMOUR.SUPERIOR_SCRIMSHAW_OF_CRUELTY) {
        return Math.floor(damage * 1.0666);
    }

    return damage;
}

// =============================================================================
// Outfit & Equipment Effects
// =============================================================================

/**
 * Count ghost hunter pieces equipped
 */
export function countGhostHunterPieces(settings: Record<string, any>): number {
    return countSetPieces(settings, gearSets[GEAR_SET.GHOST_HUNTER]);
}

/**
 * Apply ghost hunter outfit effect
 */
export function applyGhostHunterEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;
    const pieces = countGhostHunterPieces(settings);

    if (pieces === 1) {
        return Math.floor(damage * 1.03);
    } else if (pieces === 2) {
        return Math.floor(damage * 1.06);
    } else if (pieces >= 3) {
        return Math.floor(damage * 1.1);
    }

    return damage;
}

/**
 * Apply cryptbloom/croesus deathspores effect
 */
export function applyCryptbloomEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.CRYPTBLOOM] === true) {
        return Math.floor(damage * 1.1);
    }

    return damage;
}

// =============================================================================
// Necklace Effects
// =============================================================================

/**
 * Apply necklace of salamancy effect
 */
export function applySalamancyEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.NECKLACE] === ARMOUR.NECKLACE_OF_SALAMANCY) {
        return Math.floor(damage * 1.1);
    }

    return damage;
}

// =============================================================================
// Miscellaneous Effects
// =============================================================================

/**
 * Calculate haunted damage bonus (must be calculated before vuln is applied)
 */
export function calculateHauntedBonus(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;
    const hasNexus = settings[SETTINGS.DEVOURER_NEXUS] === true;
    return Math.min(
        Math.floor(damage * (hasNexus ? 0.15 : 0.1)),
        Math.floor(settings[SETTINGS.HAUNTED_AD] * (hasNexus ? 0.3 : 0.2))
    );
}

/**
 * Apply haunted effect (flat damage addition)
 */
export function applyHauntedEffect(
    ctx: DamageModifierContext,
    damage: number,
    hauntedBonus: number
): number {
    const { settings } = ctx;

    if (settings[SETTINGS.HAUNTED] === true) {
        return damage + hauntedBonus;
    }

    return damage;
}

/**
 * Apply wilderness puzzlebox effect
 */
export function applyWildernessPuzzleboxEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings['wilderness puzzlebox'] > 1) {
        return Math.floor(damage * (1 + 0.03 + settings['wilderness puzzlebox']));
    }

    return damage;
}

/**
 * Apply nopenopenope (PoF spider buff) effect
 */
export function applyNopeEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;
    let boost = 0;
    if (settings[SETTINGS.NOPE] == 1) {
        boost = 0.02
    }
    else if (settings[SETTINGS.NOPE] == 2) {
        boost = 0.03
    }

    return Math.floor(damage * (1 + boost));
}

/**
 * Apply vanquish (quest point weapon) effect
 */
export function applyVanquishEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings } = ctx;

    if (settings['two-hand weapon'] === 'vanquish') {
        return Math.floor(damage * (1 + 0.05 * settings['quest deaths']));
    }

    return damage;
}

/**
 * Apply essence corruption 25 stack bonus (flat damage)
 */
export function applyEssenceCorruptionEffect(
    ctx: DamageModifierContext,
    damage: number
): number {
    const { settings, abilityKey } = ctx;
    const damageType = abils[abilityKey]?.damageType;

    if (
        damageType === 'magic' &&
        settings[SETTINGS.ESSENCE_CORRUPTION] >= 25
    ) {
        return damage + settings[SETTINGS.MAGIC_LEVEL] + settings[SETTINGS.ESSENCE_CORRUPTION];
    }

    return damage;
}

/**
 * Apply Enduring Ruin bleed bonus (Gloves of Passage effect)
 * +20% (regular) or +25% (enchanted) to bleed abilities
 */
function applyEnduringRuinBleedEffect(ctx: DamageModifierContext, damage: number): number {
    const classification = abils[ctx.abilityKey]?.abilityClassification;
    if (classification !== 'bleed') return damage;

    if (ctx.settings[SETTINGS.ENDURING_RUIN_BLEED] === SETTINGS.ENDURING_RUIN_BLEED_VALUES.REGULAR) {
        return Math.floor(damage * 1.2);
    }
    if (ctx.settings[SETTINGS.ENDURING_RUIN_BLEED] === SETTINGS.ENDURING_RUIN_BLEED_VALUES.ENCHANTED) {
        return Math.floor(damage * 1.25);
    }
    return damage;
}

/**
 * Apply hit cap (30000 max damage)
 */
export function applyHitCap(damage: number): number {
    return Math.min(damage, 30000);
}

// =============================================================================
// Combined Application Functions
// =============================================================================

/**
 * Apply all damage modifiers in the correct order
 * Returns the modified damage value
 */
export function applyAllDamageModifiers(
    ctx: DamageModifierContext,
    damage: number
): number {
    // Calculate haunted bonus before other modifiers (based on pre-modified damage)
    const hauntedBonus = calculateHauntedBonus(ctx, damage);

    // Vulnerability/curse
    damage = applyVulnerabilityEffect(ctx, damage);

    // Enduring Ruin bleed bonus (Gloves of Passage)
    damage = applyEnduringRuinBleedEffect(ctx, damage);

    // Wilderness puzzlebox
    damage = applyWildernessPuzzleboxEffect(ctx, damage);

    // Cryptbloom
    damage = applyCryptbloomEffect(ctx, damage);

    // Slayer effects
    damage = applyAllSlayerEffects(ctx, damage);

    // Nope (spider buff)
    damage = applyNopeEffect(ctx, damage);

    // Ghost hunter
    damage = applyGhostHunterEffect(ctx, damage);

    // Vanquish
    damage = applyVanquishEffect(ctx, damage);

    // Scrimshaws
    damage = applyElementsScrimshawEffect(ctx, damage);
    damage = applyCrueltyScrimshawEffect(ctx, damage);

    // Haunted (flat addition)
    damage = applyHauntedEffect(ctx, damage, hauntedBonus);

    // Essence corruption (flat addition)
    damage = applyEssenceCorruptionEffect(ctx, damage);

    // Tokkul-zo ring (+10%)
    if (ctx.settings[SETTINGS.RING] === ARMOUR.TOKKUL_ZO) {
        damage = Math.floor(damage * 1.1);
    }

    // Necklace of salamancy
    damage = applySalamancyEffect(ctx, damage);

    // Balance of Power (Zamorak, +6% per rank)
    if (ctx.settings[SETTINGS.BALANCE_OF_POWER] > 0) {
        damage = Math.floor(damage * (1 + 0.06 * ctx.settings[SETTINGS.BALANCE_OF_POWER]));
    }

    // Telos red beam (+30%)
    if (ctx.settings[SETTINGS.TELOS_RED_BEAM] === true) {
        damage = Math.floor(damage * 1.3);
    }

    // Telos black beam (-30%)
    if (ctx.settings[SETTINGS.TELOS_BLACK_BEAM] === true) {
        damage = Math.floor(damage * 0.7);
    }

    // Hit cap (must be last)
    damage = applyHitCap(damage);

    return damage;
}
