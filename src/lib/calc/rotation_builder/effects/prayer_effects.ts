/**
 * Prayer-related damage calculation effects
 */

import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { prayers } from '../../../data/prayers';
import { SETTINGS } from '../../settings_rb';

/**
 * Calculate the prayer boost for an ability based on settings
 * Returns a multiplier to apply to the boost value
 */
export function calculatePrayerBoost(
    settings: Record<string, any>,
    abilityKey: ABILITIES
): number {
    const abilityStyle = abils[abilityKey]?.mainStyle;
    const prayerStyle = prayers[settings[SETTINGS.PRAYER]]?.['style'];

    // Prayer only applies if ability style matches prayer style
    if (abilityStyle !== prayerStyle) {
        return 1;
    }

    let prayerBoost = prayers[settings[SETTINGS.PRAYER]]?.['boost'] || 0;

    // Amulet of zealots bonus for single-stat boosting or leech curses
    if (
        settings[SETTINGS.NECKLACE] === ARMOUR.AMULET_OF_ZEALOTS &&
        ['single-stat boosting', 'leech curse'].includes(
            prayers[settings[SETTINGS.PRAYER]]?.['category']
        )
    ) {
        prayerBoost += 0.1;
    }

    if (settings[SETTINGS.DIVINE_RAGE] === true &&
        (prayers[settings[SETTINGS.PRAYER]]['book'] === "normal" || prayers[settings[SETTINGS.PRAYER]]['style'] === "none")) {
        prayerBoost += 0.05;
    }

    return 1 + prayerBoost;
}
