/**
 * Pure utility functions for damage calculation
 * These have no dependencies on on_cast/on_hit to avoid circular imports
 */

import { SETTINGS } from '../settings_rb';
import { ABILITIES, abils } from '$lib/data/abilities';
import { WEAPONS } from '$lib/data/weapons';
import { ARMOUR } from '$lib/data/armour';
import { gearSets, GEAR_SET } from '$lib/data/gear-sets';
import { countSetPieces } from './gear-registry';

// Re-export calc_crit_damage from its new home for any transitive consumers
export { calc_crit_damage } from '../crit';

// =============================================================================
// Soul Split / Split Soul Calculations
// =============================================================================

/**
 * Calculate soul split heal amount for a single hit
 * @param hit - damage dealt
 * @param settings - game settings object
 * @returns heal amount
 */
function calc_soul_split_hit(hit: number, settings: Record<string, any>): number {
    let heal = 0;

    // Heal 10% of first 2k
    heal += Math.min(0.1 * hit, 200);
    hit -= 2000;

    // Heal 5% of the next 2000
    if (hit > 0) {
        heal += Math.min(0.05 * hit, 100);
        hit -= 2000;
    }

    // Heal 1.25% over the rest
    if (hit > 0) {
        heal += 0.0125 * hit;
    }

    // Amulet of souls bonus healing (+18.75%)
    const aos_amulets = [
        ARMOUR.AOS,
        ARMOUR.AOS_OR,
        ARMOUR.EOF,
        ARMOUR.EOF_OR
    ];
    if (aos_amulets.includes(settings['amulet'])) {
        heal = heal * 1.1875;
    }

    return Math.floor(heal);
}

/**
 * Calculate split soul (ECB spec) damage for a hit
 * Split soul deals 4x the soul split heal as damage
 * @param hit - damage dealt
 * @param settings - game settings object
 * @returns split soul damage
 */
export function calc_split_soul_hit(hit: number, settings: Record<string, any>): number {
    return 4 * calc_soul_split_hit(hit, settings);
}

// =============================================================================
// Hit Sequence Generation
// =============================================================================

/**
 * Get the hit sequence for a multihit ability, accounting for gear/perks
 * @param settings - game settings object (must have settings['ability'] set)
 * @returns hit sequence object { tick: [abilities...] }
 */
export function get_hit_sequence(settings: Record<string, any>): Record<number, string[]> {
    const abilityKey = settings['ability'];
    let rotation = JSON.parse(JSON.stringify(abils[abilityKey]['hits'])); // Deep copy

    // Igneous Showdown with EZK and Flamebound Rival
    if (
        abilityKey === ABILITIES.IGNEOUS_SHOWDOWN &&
        settings[SETTINGS.FLAMEBOUND_RIVAL] === true
    ) {
        rotation[1].push(
            'next hit', ABILITIES.IGNEOUS_SHOWDOWN_BONUS,
            'next hit', ABILITIES.IGNEOUS_SHOWDOWN_BONUS,
            'next hit', ABILITIES.IGNEOUS_SHOWDOWN_BONUS
        );
    }

    // Masterwork Spear of Annihilation bleed extensions
    if (
        settings[SETTINGS.TH] === WEAPONS.MASTERWORK_SPEAR_OF_ANNIHILATION &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        if (abilityKey === ABILITIES.DISMEMBER) {
            rotation[1].push(ABILITIES.DISMEMBER_HIT, ABILITIES.DISMEMBER_HIT, ABILITIES.DISMEMBER_HIT, ABILITIES.DISMEMBER_HIT);
        }
        if (abilityKey === ABILITIES.SLAUGHTER) {
            rotation[1].push(ABILITIES.SLAUGHTER_HIT, ABILITIES.SLAUGHTER_HIT, ABILITIES.SLAUGHTER_HIT);
        }
        if (abilityKey === ABILITIES.MASSACRE) {
            rotation[1].push(ABILITIES.MASSACRE_BLEED, ABILITIES.MASSACRE_BLEED, ABILITIES.MASSACRE_BLEED);
        }
    }

    // Strength cape dismember extension
    if (settings[SETTINGS.STRENGTH_CAPE] === true && abilityKey === ABILITIES.DISMEMBER) {
        rotation[1].push(ABILITIES.DISMEMBER_HIT, ABILITIES.DISMEMBER_HIT, ABILITIES.DISMEMBER_HIT);
    }

    // Igneous cape auto-swap: default hit sequences are igneous.
    // When not wearing an igneous cape, swap to non-igneous hit sequences.
    const hasIgneousCape = settings[SETTINGS.CAPE] === ARMOUR.IGNEOUS_KAL_ZUK;
    if (!hasIgneousCape) {
        if (abilityKey === ABILITIES.OVERPOWER) {
            // Non-igneous: single 550-600% hit (uses OVERPOWER's own min/var)
            rotation = { 1: [ABILITIES.OVERPOWER] };
        }
        else if (abilityKey === ABILITIES.OMNIPOWER) {
            // Non-igneous: single 420-500% hit
            rotation = { 1: [ABILITIES.OMNIPOWER_REGULAR] };
        }
        else if (abilityKey === ABILITIES.DEADSHOT) {
            // Non-igneous: 4x 105-125% hits
            rotation = { 1: [ABILITIES.DEADSHOT_HIT, ABILITIES.DEADSHOT_HIT, ABILITIES.DEADSHOT_HIT, ABILITIES.DEADSHOT_HIT] };
        }
        else if (abilityKey === ABILITIES.DEATHSKULLS_4) {
            // Non-igneous single target: 3 damaging hits (M→P→M→P→M, player bounces deal no damage)
            rotation = { 1: [ABILITIES.DEATHSKULLS, ABILITIES.DEATHSKULLS, ABILITIES.DEATHSKULLS] };
        }
    }

    // Volley of Souls - hits based on residual souls count
    if (abilityKey === ABILITIES.VOLLEY_OF_SOULS_DYNAMIC) {
        const residualSouls = settings[SETTINGS.RESIDUAL_SOULS] || 0;
        if (residualSouls >= 2) {
            rotation[1].push(ABILITIES.VOLLEY_OF_SOULS);
            for (let i = 1; i < residualSouls; i++) {
                rotation[1].push('next hit', ABILITIES.VOLLEY_OF_SOULS);
            }
        }
    }

    // Bloodlust Hurricane: consuming 4 stacks adds a bonus hit
    if (abilityKey === ABILITIES.HURRICANE && settings['_bloodlust_consumed'] === ABILITIES.HURRICANE) {
        rotation[1].push(ABILITIES.BLOODLUST_HURRICANE_HIT);
    }

    // Nightmare gauntlet snipe
    if (abilityKey === ABILITIES.SNIPE && settings[SETTINGS.GLOVES] === ARMOUR.NIGHTMARE_GAUNTLETS_E &&
        settings[SETTINGS.ENCHANTMENT_OF_DREAD] === true) {
        rotation[3].push(ABILITIES.SNIPE_HIT_2);
    }

    settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER] = 1;
    if (settings[SETTINGS.DAMAGE_PER_UNIT] === SETTINGS.DAMAGE_PER_UNIT_VALUES.TICK) {
        settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER] = 3;
        if (abils[settings['ability']].abilityClassification === 'channel') {
            if (settings[SETTINGS.HIT_COUNTER_END] != null && settings[SETTINGS.HIT_COUNTER_END] > 0) {
                settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER] = settings[SETTINGS.HIT_COUNTER_END] - settings[SETTINGS.HIT_COUNTER_START];
            } else {
                const lastHitTick = Object.keys(abils[settings['ability']]["hits"])
                    .map(item => parseInt(item, 10)).pop();
                settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER] = lastHitTick ?? 3;
            }
        }
    }

    // TO-DO give the option to get a start and end hit for an ability
    // to track and kill off the rest

    return rotation;
}

// =============================================================================
// Adrenaline
// =============================================================================

export function addAdrenaline(settings: Record<string, any>, amount: number) {
    if (settings[SETTINGS.NATURAL_INSTINCT] && amount > 0) {
        amount *= 2;
    }
    let new_adren = settings[SETTINGS.ADRENALINE] + amount;

    // Vestments of Havoc: full set (4 pieces) + melee abilities in rotation = +20 max adrenaline
    const hasFullVestments = settings['_hasMeleeAbilities'] &&
        countSetPieces(settings, gearSets[GEAR_SET.VESTMENTS_OF_HAVOC]) >= 4;

    let max_adren = 100 + (hasFullVestments ? 20 : 0);
    if (settings[SETTINGS.HEIGHTENED_SENSES]) max_adren += 10;

    settings[SETTINGS.ADRENALINE] = settings[SETTINGS.CAP_ADRENALINE] ? Math.min(max_adren, new_adren) : new_adren;
}
