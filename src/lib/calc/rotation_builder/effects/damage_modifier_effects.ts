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

function multiplyDamageList(list: number[], multiplier: number): void {
    for (let i = 0; i < list.length; i++) {
        list[i] = Math.floor(list[i] * multiplier);
    }
}

// =============================================================================
// Vulnerability & Debuff Effects
// =============================================================================

/**
 * Apply vulnerability/curse damage multiplier
 */
export function applyVulnerabilityEffect(
    ctx: DamageModifierContext,
    list: number[]
): void {
    const { settings } = ctx;

    let multiplier: number;
    if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.VULNERABILITY) {
        multiplier = 1.1;
    } else if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.CURSE) {
        multiplier = 1.05;
    } else {
        return;
    }

    multiplyDamageList(list, multiplier);
    
}

// =============================================================================
// Slayer Effects (Perks & Abilities)
// =============================================================================

export function applyUndeadSlayerEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {   
    const { settings } = ctx;
    if (settings[SETTINGS.SLAYER_PERK_UNDEAD] === true) {
        multiplyDamageList(damageList, 1.07);
    }
    if (settings[SETTINGS.UNDEAD_SLAYER_ABILITY] === true) {
        multiplyDamageList(damageList, 1.15);
    }
    return;
}

export function applyDragonSlayerEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;
    if (settings[SETTINGS.SLAYER_PERK_DRAGON] === true) {
        multiplyDamageList(damageList, 1.07);
    }
    if (settings[SETTINGS.DRAGON_SLAYER_ABILITY] === true) {
        multiplyDamageList(damageList, 1.15);
    }
    return;
}

export function applyDemonSlayerEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;
    if (settings[SETTINGS.SLAYER_PERK_DEMON] === true) {
        multiplyDamageList(damageList, 1.07);
    }
    if (settings[SETTINGS.DEMON_SLAYER_ABILITY] === true) {
        multiplyDamageList(damageList, 1.15);
    }
    return;
}

/**
 * Apply all slayer effects
 */
export function applyAllSlayerEffects(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    applyUndeadSlayerEffect(ctx, damageList);
    applyDragonSlayerEffect(ctx, damageList);
    applyDemonSlayerEffect(ctx, damageList);
    return;
}

// =============================================================================
// Pocket Slot Effects (Scrimshaws)
// =============================================================================

/**
 * Apply scrimshaw of elements effect (magic)
 */
export function applyElementsScrimshawEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings, abilityKey } = ctx;
    const style = abils[abilityKey]?.mainStyle;

    if (style !== 'magic') {
        return;
    }

    if (settings[SETTINGS.POCKET] === ARMOUR.SCRIMSHAW_OF_ELEMENTS) {
        multiplyDamageList(damageList, 1.05);
    } else if (settings[SETTINGS.POCKET] === ARMOUR.SUPERIOR_SCRIMSHAW_OF_ELEMENTS) {
        multiplyDamageList(damageList, 1.0666);
    }

    return;
}

/**
 * Apply scrimshaw of cruelty effect (ranged)
 */
export function applyCrueltyScrimshawEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings, abilityKey } = ctx;
    const style = abils[abilityKey]?.mainStyle;

    if (style !== 'ranged') {
        return;
    }

    if (settings[SETTINGS.POCKET] === ARMOUR.SCRIMSHAW_OF_CRUELTY) {
        multiplyDamageList(damageList, 1.05);
    } else if (settings[SETTINGS.POCKET] === ARMOUR.SUPERIOR_SCRIMSHAW_OF_CRUELTY) {
        multiplyDamageList(damageList, 1.0666);
    }

    return;
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
    damageList: number[]
): void {
    const { settings } = ctx;
    const pieces = countGhostHunterPieces(settings);

    if (pieces === 1) {
        multiplyDamageList(damageList, 1.03);
    } else if (pieces === 2) {
        multiplyDamageList(damageList, 1.06);
    } else if (pieces >= 3) {
        multiplyDamageList(damageList, 1.1);
    }

    return;
}

/**
 * Apply cryptbloom/croesus deathspores effect
 */
export function applyCryptbloomEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;

    if (settings[SETTINGS.CRYPTBLOOM] === true) {
        multiplyDamageList(damageList, 1.1);
    }

    return;
}

// =============================================================================
// Necklace Effects
// =============================================================================

/**
 * Apply necklace of salamancy effect
 */
export function applySalamancyEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;

    if (settings[SETTINGS.NECKLACE] === ARMOUR.NECKLACE_OF_SALAMANCY) {
        multiplyDamageList(damageList, 1.1);
    }

    return;
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
    damageList: number[],
    hauntedBonuses: number[]
): void {
    const { settings } = ctx;

    if (settings[SETTINGS.HAUNTED] === true) {
        for (let i = 0; i < damageList.length; i++) {
            damageList[i] = damageList[i] + hauntedBonuses[i];
        }
    }
    return;
}

/**
 * Apply wilderness puzzlebox effect
 */
export function applyWildernessPuzzleboxEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;

    if (settings['wilderness puzzlebox'] > 1) {
        multiplyDamageList(damageList, 1 + 0.03 + settings['wilderness puzzlebox']);
    }

    return;
}

/**
 * Apply nopenopenope (PoF spider buff) effect
 */
export function applyNopeEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;
    let boost = 0;
    if (settings[SETTINGS.NOPE] == 1) {
        boost = 0.02
    }
    else if (settings[SETTINGS.NOPE] == 2) {
        boost = 0.03
    }
    multiplyDamageList(damageList, 1 + boost);
    return;
}

/**
 * Apply vanquish (quest point weapon) effect
 */
export function applyVanquishEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings } = ctx;

    if (settings['two-hand weapon'] === 'vanquish') {
        multiplyDamageList(damageList, 1 + 0.05 * settings['quest deaths']);
    }

    return;
}

/**
 * Apply essence corruption 25 stack bonus (flat damage)
 */
export function applyEssenceCorruptionEffect(
    ctx: DamageModifierContext,
    damageList: number[]
): void {
    const { settings, abilityKey } = ctx;
    const damageType = abils[abilityKey]?.damageType;

    if (
        damageType === 'magic' &&
        settings[SETTINGS.ESSENCE_CORRUPTION] >= 25
    ) {
        let bonus = settings[SETTINGS.MAGIC_LEVEL] + settings[SETTINGS.ESSENCE_CORRUPTION];
        for (let i = 0; i < damageList.length; i++) {
            damageList[i] = damageList[i] + bonus;
        }
    }

    return;
}

/**
 * Apply Enduring Ruin bleed bonus (Gloves of Passage effect)
 * +20% (regular) or +25% (enchanted) to bleed abilities
 */
function applyEnduringRuinBleedEffect(ctx: DamageModifierContext, damageList: number[]): void {
    const classification = abils[ctx.abilityKey]?.abilityClassification;
    if (classification !== 'bleed') return

    if (ctx.settings[SETTINGS.ENDURING_RUIN_BLEED] === SETTINGS.ENDURING_RUIN_BLEED_VALUES.REGULAR) {
        multiplyDamageList(damageList, 1.2);
    }
    if (ctx.settings[SETTINGS.ENDURING_RUIN_BLEED] === SETTINGS.ENDURING_RUIN_BLEED_VALUES.ENCHANTED) {
        multiplyDamageList(damageList, 1.25);
    }
    return;
}

/**
 * Apply hit cap (30000 max damage) when the hitcap setting is enabled
 */
export function applyHitCap(ctx: DamageModifierContext, damageList: number[]): void {
    if (ctx.settings[SETTINGS.HITCAP] !== true) {
        return;
    }
    if (damageList[damageList.length - 1] < 30000) {
        return; // return early if max value is <30k
    }
    for (let i = 0; i < damageList.length; i++) {
        damageList[i] = Math.min(damageList[i], 30000);
    }
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
    distribution: DamageDistribution
): DamageDistribution {
    const dmgList: number[] = distribution['damage list'];

    // Haunted reads pre-modifier damage, so the bonuses must be captured before any
    // pass below mutates the list. Skipped entirely when haunted is off, since
    // applyHauntedEffect ignores the bonus in that case.
    const hauntedBonuses: number[] | null =
        ctx.settings[SETTINGS.HAUNTED] === true
            ? dmgList.map((damage) => calculateHauntedBonus(ctx, damage))
            : null;

    // Vulnerability/curse
    applyVulnerabilityEffect(ctx, dmgList);

    // Enduring Ruin bleed bonus (Gloves of Passage)
    applyEnduringRuinBleedEffect(ctx, dmgList);

    // Wilderness puzzlebox
    applyWildernessPuzzleboxEffect(ctx, dmgList);

    // Cryptbloom
    applyCryptbloomEffect(ctx, dmgList);

    // Slayer effects
    applyAllSlayerEffects(ctx, dmgList);

    // Nope (spider buff)
    applyNopeEffect(ctx, dmgList);

     // Ghost hunter
    applyGhostHunterEffect(ctx, dmgList);

     // Vanquish
    applyVanquishEffect(ctx, dmgList);

    // Scrimshaws
    applyElementsScrimshawEffect(ctx, dmgList);
    applyCrueltyScrimshawEffect(ctx, dmgList);
    
    // Haunted (flat addition)
    applyHauntedEffect(ctx, dmgList, hauntedBonuses);

    // Essence corruption (flat addition) 
    applyEssenceCorruptionEffect(ctx, dmgList);

    // Leagues 2 — Big Boned (flat addition from max LP)
    if (ctx.settings[SETTINGS.LEAGUES_TWO_TOGGLE] === true && ctx.settings[SETTINGS.LEAGUES_TWO_BIG_BONED] === true) {
        const bonus = Math.floor(0.05 * ctx.settings[SETTINGS.MAX_LIFE_POINTS]);
        for (let i = 0; i < dmgList.length; i++) {
            dmgList[i] += bonus;
        }
    }

    // Tokkul-zo ring (+10%)
    if (ctx.settings[SETTINGS.RING] === ARMOUR.TOKKUL_ZO) {
        multiplyDamageList(dmgList, 1.1);
    }

    // Necklace of salamancy
    applySalamancyEffect(ctx, dmgList);

    // Balance of Power (Zamorak, +6% per rank)
    if (ctx.settings[SETTINGS.BALANCE_OF_POWER] > 0) {
        multiplyDamageList(dmgList, 1 + 0.06 * ctx.settings[SETTINGS.BALANCE_OF_POWER]);
    }

    // Telos red beam (+30%)
    if (ctx.settings[SETTINGS.TELOS_RED_BEAM] === true) {
        multiplyDamageList(dmgList, 1.3);
    }

    // Telos black beam (-30%)
    if (ctx.settings[SETTINGS.TELOS_BLACK_BEAM] === true) {
        multiplyDamageList(dmgList, 0.7);
    }

    // Hit cap (must be last)
    applyHitCap(ctx, dmgList);

    return distribution;
}
