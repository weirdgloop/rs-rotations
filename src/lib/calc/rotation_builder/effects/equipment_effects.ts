/**
 * Shared equipment effects that apply across combat styles
 */

import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { SETTINGS } from '../../settings_rb';

type CombatStyle = 'magic' | 'melee' | 'ranged' | 'necromancy';

// Void armour piece definitions
const VOID_CHEST_PIECES = [
    ARMOUR.VOID_KNIGHT_TOP,
    ARMOUR.SUPERIOR_VOID_KNIGHT_TOP,
    ARMOUR.ELITE_VOID_KNIGHT_TOP,
    ARMOUR.SUPERIOR_ELITE_VOID_KNIGHT_TOP
];

const VOID_LEGS_PIECES = [
    ARMOUR.VOID_KNIGHT_ROBE,
    ARMOUR.SUPERIOR_VOID_KNIGHT_ROBE,
    ARMOUR.ELITE_VOID_KNIGHT_ROBE,
    ARMOUR.SUPERIOR_ELITE_VOID_KNIGHT_ROBE
];

const VOID_HANDS_PIECES = [ARMOUR.VOID_KNIGHT_GLOVES, ARMOUR.SUPERIOR_VOID_KNIGHT_GLOVES];

const VOID_SHIELD_PIECES = [ARMOUR.VOID_KNIGHT_DEFLECTOR, ARMOUR.SUPERIOR_VOID_KNIGHT_DEFLECTOR];

// Void helm definitions by style
const VOID_HELMS: Record<CombatStyle, { regular: number | ''; superior: number | '' }> = {
    magic: {
        regular: ARMOUR.VOID_KNIGHT_MAGIC_HELM,
        superior: ARMOUR.SUPERIOR_VOID_KNIGHT_MAGIC_HELM
    },
    melee: {
        regular: ARMOUR.VOID_KNIGHT_MELEE_HELM,
        superior: ARMOUR.SUPERIOR_VOID_KNIGHT_MELEE_HELM
    },
    ranged: {
        regular: ARMOUR.VOID_KNIGHT_RANGED_HELM,
        superior: ARMOUR.SUPERIOR_VOID_KNIGHT_RANGED_HELM
    },
    necromancy: {
        regular: '', // Necromancy doesn't have void helm
        superior: ''
    }
};

/**
 * Count the number of void armour pieces equipped (excluding helmet)
 */
export function countVoidPieces(settings: Record<string, any>): number {
    let voidPieces = 0;

    if (VOID_CHEST_PIECES.includes(settings[SETTINGS.BODY])) {
        voidPieces += 1;
    }

    if (VOID_LEGS_PIECES.includes(settings[SETTINGS.LEGS])) {
        voidPieces += 1;
    }

    if (VOID_HANDS_PIECES.includes(settings[SETTINGS.GLOVES])) {
        voidPieces += 1;
    }

    if (
        VOID_SHIELD_PIECES.includes(settings[SETTINGS.OH]) &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW
    ) {
        voidPieces += 1;
    }

    return voidPieces;
}

/**
 * Get the void helm damage boost for an ability based on its combat style
 * Returns 0 if no matching void helm is equipped
 */
export function getVoidHelmBoost(settings: Record<string, any>, abilityKey: ABILITIES): number {
    const style = abils[abilityKey]?.mainStyle as CombatStyle | undefined;

    if (!style || !VOID_HELMS[style]) {
        return 0;
    }

    const helmet = settings[SETTINGS.HELMET];
    const helmConfig = VOID_HELMS[style];

    if (helmet === helmConfig.regular) {
        return 0.05;
    } else if (helmet === helmConfig.superior) {
        return 0.07;
    }

    return 0;
}

/**
 * Calculate the total void equipment damage boost
 * This includes the helm bonus (style-specific) but not the set bonus
 * TODO: Implement full void set bonus when void piece count is used
 */
export function calculateVoidBoost(settings: Record<string, any>, abilityKey: ABILITIES): number {
    // Count pieces for potential future use (set bonus)
    const _voidPieces = countVoidPieces(settings);

    // Currently only the helm provides a damage boost
    return getVoidHelmBoost(settings, abilityKey);
}
