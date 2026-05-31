/**
 * Crit chance and crit damage calculations
 */

import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { weapons } from '$lib/data/weapons';
import { prayers } from '$lib/data/prayers';
import { SETTINGS } from './settings_rb';
import { Logger } from '$lib/utils/Logger';
const logger = Logger.getInstance();
import { DamageObject } from './types';
import { getAbilityClassification, getAbilityStyle, isChannelledHit } from '$lib/types/AbilityTypes';

// =============================================================================
// Crit Chance
// =============================================================================

export function calc_crit_chance(settings: Record<string, any>, abilityKey: ABILITIES): number {
    // base crit chance
    let crit_chance = 0.1;

    if (settings[SETTINGS.EQ_PERK]) {
        return 0.0 // No crits if Equilibrium perk used
    }

    // eclipsed soul
    if (settings[SETTINGS.ECLIPSED_SOUL] === true &&
        (prayers[settings[SETTINGS.PRAYER]].book === "normal")) {
        crit_chance += 0.04;
    }

    // biting
    crit_chance += 0.02 * settings[SETTINGS.BITING];

    // level 20 armour
    if (settings[SETTINGS.LVL20ARMOUR] === true) {
        crit_chance += 0.002 * settings[SETTINGS.BITING];
    }

    // warpriest of tuska
    if (settings['helmet'] === 'warpriest of tuska helm') {
        crit_chance += 0.01;
    }
    if (settings['body'] === 'warpriest of tuska cuirass') {
        crit_chance += 0.01;
    }
    if (settings['legs'] === 'warpriest of tuska robe legs') {
        crit_chance += 0.01;
    }
    if (settings['gloves'] === 'warpriest of tuska gauntlets') {
        crit_chance += 0.01;
    }
    if (settings['boots'] === 'warpriest of tuska boots') {
        crit_chance += 0.01;
    }
    if (settings['cape'] === 'warpriest of tuska cape') {
        crit_chance += 0.01;
    }

    // sliske tuska
    if (
        settings[SETTINGS.HELMET] === ARMOUR.SLISKE_HELM &&
        settings[SETTINGS.BODY] === ARMOUR.SLISKE_BODY &&
        settings[SETTINGS.LEGS] === ARMOUR.SLISKE_LEGS
    ) {
        crit_chance += 0.06;
    }

    // erethdor's grimoire
    if (settings[SETTINGS.POCKET] === ARMOUR.ERETHDORS_GRIMOIRE) {
        crit_chance += 0.12;
    }

    // chaotic grimoire
    if (settings[SETTINGS.POCKET] === ARMOUR.CHAOTIC_GRIMOIRE) {
        crit_chance += 0.07;
    }

    // leagues pocket
    if (settings[SETTINGS.POCKET] === ARMOUR.LEAGUES_POCKET) {
        crit_chance += 0.12;
    }

    // reaver's ring
    if (settings[SETTINGS.RING] === ARMOUR.REAVERS_RING) {
        crit_chance += 0.05;
    }

    // kalg base
    if (settings['familiar'] === 'kalgerion demon') {
        crit_chance += 0.01;
    }

    // kalg scroll
    if (settings[SETTINGS.KALG_SPEC] === true) {
        crit_chance += 0.05;
    }

    if (abils[abilityKey].mainStyle === 'magic') {
        // tectonic armour
        if (settings[SETTINGS.HELMET] === ARMOUR.TECTONIC_MASK) {
            crit_chance += 0.01;
        }
        if (settings[SETTINGS.BODY] === ARMOUR.TECTONIC_ROBE_TOP) {
            crit_chance += 0.01;
        }
        if (settings[SETTINGS.LEGS] === ARMOUR.TECTONIC_ROBE_BOTTOM) {
            crit_chance += 0.01
        }

        // elite tectonic armour'
        if (settings[SETTINGS.HELMET] === ARMOUR.ELITE_TECTONIC_MASK) {
            crit_chance += 0.02;
        }
        if (settings[SETTINGS.BODY] === ARMOUR.ELITE_TECTONIC_ROBE_TOP) {
            crit_chance += 0.02;
        }
        if (settings[SETTINGS.LEGS] === ARMOUR.ELITE_TECTONIC_ROBE_BOTTOM) {
            crit_chance += 0.02;
        }

        //tumeken armour
        let tumekens_resplendence = 0;
        if (settings[SETTINGS.MAGIC_HELMET] === ARMOUR.TUMEKENS_MASK) {
            tumekens_resplendence += 1;
        }
        if (settings[SETTINGS.MAGIC_BODY] === ARMOUR.TUMEKENS_ROBE_TOP) {
            tumekens_resplendence += 1;
        }
        if (settings[SETTINGS.MAGIC_LEGS] === ARMOUR.TUMEKENS_ROBE_BOTTOM) {
            tumekens_resplendence += 1;
        }
        if (settings[SETTINGS.MAGIC_BOOTS] === ARMOUR.TUMEKENS_BOOTS) {
            tumekens_resplendence += 1;
        }
        if (settings[SETTINGS.MAGIC_GLOVES] === ARMOUR.TUMEKENS_GLOVES) {
            tumekens_resplendence += 1;
        }
        if (settings[SETTINGS.SUNSHINE] === true && tumekens_resplendence >= 3) {
            crit_chance += 0.015 * tumekens_resplendence;
        }

        if (settings[SETTINGS.CAPE] === ARMOUR.TUSKA_CAPE &&
            settings[SETTINGS.GLOVES] === ARMOUR.TUSKA_GAUNTLETS &&
            settings[SETTINGS.BOOTS] === ARMOUR.TUSKA_BOOTS
        ) {
            crit_chance += 0.03;
        }

        // channeller's ring
        if (
            (settings[SETTINGS.RING] === ARMOUR.CHANNELLERS_RING ||
                settings[SETTINGS.RING] === ARMOUR.CHANNELLERS_RING_E)
            &&
            abils[abilityKey].parent && abils[abils[abilityKey].parent].abilityClassification === 'channel'
        ) {
            crit_chance += 0.04;
            crit_chance += 0.04 * (1 + settings[SETTINGS.CHANNELLER_RING_STACKS]);
        }
        else if (!["proc", "perk"].includes(getAbilityClassification(abils[abilityKey])))
            {settings[SETTINGS.CHANNELLER_RING_STACKS] = 0}

        // (G)Conc blast: hardcoded crit bonuses on hits 2 and 3
        if (abilityKey === ABILITIES.CONCENTRATED_BLAST_2) crit_chance += settings['_conc_anima_charged'] ? 0.15 : 0.05;
        else if (abilityKey === ABILITIES.CONCENTRATED_BLAST_3) crit_chance += settings['_conc_anima_charged'] ? 0.30 : 0.10;
        else if (abilityKey === ABILITIES.GREATER_CONCENTRATED_BLAST_2) crit_chance += settings['_conc_anima_charged'] ? 0.17 : 0.07;
        else if (abilityKey === ABILITIES.GREATER_CONCENTRATED_BLAST_3) crit_chance += settings['_conc_anima_charged'] ? 0.34 : 0.14;

        // (G)Conc crit buff: apply crit bonus (consumption handled in on_cast)
        if (!["proc", "perk"].includes(getAbilityClassification(abils[abilityKey]))) {
            if (settings[SETTINGS.CONC_CRIT] === true) crit_chance += 0.15;
            else if (settings[SETTINGS.GCONC_CRIT] === true) crit_chance += 0.21;
            else if (settings[SETTINGS.CONC_CRIT_AC] === true) crit_chance += 0.45;
            else if (settings[SETTINGS.GCONC_CRIT_AC] === true) crit_chance += 0.51;
        }

        // smoke tendrils
        if ([ABILITIES.SMOKE_TENDRILS_1, ABILITIES.SMOKE_TENDRILS_2, ABILITIES.SMOKE_TENDRILS_3, ABILITIES.SMOKE_TENDRILS_4].includes(abilityKey)) {
            crit_chance = 1;
        }

        // Magma tempest
        if (abilityKey === ABILITIES.MAGMA_TEMPEST) {
            crit_chance = 0;
        }

        if (abilityKey === ABILITIES.WILD_MAGIC_HIT) {
            crit_chance += 0.1;
        }
    }

    if (abils[abilityKey].mainStyle === 'melee') {
        // champion's ring
        if (settings[SETTINGS.RING] === ARMOUR.CHAMPIONS_RING || settings[SETTINGS.RING] === ARMOUR.CHAMPIONS_RING_E) {
            crit_chance += 0.03;
            if (settings[SETTINGS.RING] === ARMOUR.CHAMPIONS_RING_E) {
                crit_chance += 0.01;
            }
        }
        if (!(abils[abilityKey].abilityClassification === 'multihit' &&
            abils[abilityKey]['hits'] &&
            Object.keys(abils[abilityKey]['hits'])))
        {
            // (g)fury
            if (settings[SETTINGS.FURY_BUFF] === SETTINGS.FURY_BUFF_VALUES.REGULAR && abilityKey !== ABILITIES.FURY) {
                crit_chance += 0.25;
                settings[SETTINGS.FURY_BUFF] = SETTINGS.FURY_BUFF_VALUES.NONE; // TODO check this is the correct place - should only work on one hitsplat
            } else if (settings[SETTINGS.FURY_BUFF] === SETTINGS.FURY_BUFF_VALUES.GREATER && abilityKey !== ABILITIES.GREATER_FURY) {
                crit_chance = 1;
                settings[SETTINGS.FURY_BUFF] = SETTINGS.FURY_BUFF_VALUES.NONE; // TODO check this is the correct place - should only work on one hitsplat
            }
        }

        // no fear (pof meteor strike)
        if (abilityKey === 'meteor strike') {
            if (settings[SETTINGS.POF_DINOS] === SETTINGS.POF_DINOS_VALUES.CORBICULA_1) {
                crit_chance += 0.2;
            }
            else if (settings[SETTINGS.POF_DINOS] === SETTINGS.POF_DINOS_VALUES.CORBICULA_2) {
                crit_chance += 0.4;
            }
        }

        // The Final Flurry: hits 1 & 2 get +25% crit, hit 3 gets +50% crit
        if (abilityKey === ABILITIES.THE_FINAL_FLURRY_1) {
            crit_chance += 0.25;
        }
        if (abilityKey === ABILITIES.THE_FINAL_FLURRY_2) {
            crit_chance += 0.5;
        }
    }

    if (abils[abilityKey].mainStyle === 'ranged') {
        // stalker's ring
        if (
            (settings[SETTINGS.RING] === ARMOUR.STALKERS_RING || settings[SETTINGS.RING] === ARMOUR.STALKERS_RING_E) &&
            settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
            (weapons[settings[SETTINGS.TH]].type === 'bow' || settings[SETTINGS.TH_TYPE_CUSTOM] === SETTINGS.TH_TYPE_CUSTOM_VALUES.BOW)
        ) {
            crit_chance += 0.03;
            if (settings[SETTINGS.RING] === ARMOUR.STALKERS_RING_E &&
                (weapons[settings[SETTINGS.TH]]['type'] === 'bow' || settings[SETTINGS.TH_TYPE_CUSTOM] === SETTINGS.TH_TYPE_CUSTOM_VALUES.BOW)) {
                crit_chance+= 0.01;
            }
        }

        // shadow tendril
        if (abilityKey === ABILITIES.SHADOW_TENDRILS) {
            crit_chance = 1;
        }

        // dracolich — supports both boolean (rotation builder buff) and dropdown (single-ability page)
        if (settings[SETTINGS.GREATER_DRACOLICH_INFUSION] === true) {
            crit_chance += 0.4;
        } else if (settings[SETTINGS.DRACOLICH_INFUSION] === true ||
                   settings[SETTINGS.DRACOLICH_INFUSION] === SETTINGS.DRACOLICH_INFUSION_VALUES?.GREATER) {
            crit_chance += 0.4;
        } else if (settings[SETTINGS.DRACOLICH_INFUSION] === SETTINGS.DRACOLICH_INFUSION_VALUES?.REGULAR) {
            crit_chance += 0.2;
        }

    }

    // max hit mode
    if (settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MAX_CRIT ||
        settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MIN_CRIT ||
        settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MEAN_CRIT
    ) {
        crit_chance = 1;
    }

    // min hit mode
    if (settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MAX_NO_CRIT ||
        settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MIN_NO_CRIT ||
        settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MEAN_NO_CRIT
    ) {
        crit_chance = 0;
    }

    const result = Math.min(1, crit_chance);

    return result;
}

// =============================================================================
// Crit Damage Multiplier
// =============================================================================

/**
 * Calculate the crit damage multiplier based on equipped gear and buffs
 * @param settings - game settings object
 * @returns crit damage multiplier (0.5 base + bonuses)
 */
export function calc_crit_damage(settings: Record<string, any>, dmgObj: DamageObject): number {
    let crit_buff = 0.5; // base crit damage
    const abilityKey = dmgObj.ability;
    // Smoke cloud (+15% magic, +6% other)
    if (settings[SETTINGS.SMOKE_CLOUD] === true) {
        if (abils[settings['ability']]?.mainStyle === 'magic') {
            crit_buff += 0.15;
        } else {
            crit_buff += 0.06;
        }
    }

    if (
        settings[SETTINGS.RING] === ARMOUR.CHANNELLERS_RING_E &&
        isChannelledHit(abils[abilityKey]) &&
        getAbilityStyle(abils[abilityKey]) === 'magic'
    ) {
        crit_buff += 0.025 * (1 + settings[SETTINGS.CHANNELLER_RING_STACKS]);
    }

    // Champion's ring (melee, based on bleeds)
    if (
        settings[SETTINGS.RING] === ARMOUR.CHAMPIONS_RING_E &&
        abils[settings['ability']]?.mainStyle === 'melee'
    ) {
        crit_buff += 0.015 * settings[SETTINGS.NUMBER_OF_BLEEDS];
    }
    // Stalker's ring (ranged with bow)
    if (
        abils[settings['ability']]?.mainStyle === 'ranged' &&
        settings[SETTINGS.RING] === ARMOUR.STALKERS_RING_E &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        (weapons[settings[SETTINGS.TH]]?.type === 'bow' ||
            settings[SETTINGS.TH_TYPE_CUSTOM] === SETTINGS.TH_TYPE_CUSTOM_VALUES.BOW)
    ) {
        crit_buff += 0.03;
    }

    // FSOA crit bonus (15-25%, avg 20%)
    if (
        (settings[SETTINGS.TH] === WEAPONS.FRACTURED_STAFF_OF_ARMADYL || settings[SETTINGS.TH] === WEAPONS.FRACTURED_STAFF_OF_ARMADYL_IM) &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        if (settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MAX_CRIT) {
            crit_buff += 0.25;
        } else if (settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MIN_CRIT) {
            crit_buff += 0.15;
        } else {
            crit_buff += 0.2;
        }
    }

    // Channelled Might: +15% crit damage after fully channelling asphyxiate
    if (abils[settings['ability']].mainStyle === 'magic' && settings[SETTINGS.CHANNELLED_MIGHT] === true) {
        crit_buff += 0.15;
    }

    // Greater Channelled Might: +35% crit damage (5pc Tumeken's Resplendence)
    if (abils[settings['ability']].mainStyle === 'magic' && settings[SETTINGS.GREATER_CHANNELLED_MIGHT] === true) {
        crit_buff += 0.35;
    }

    if (dmgObj.ability === ABILITIES.THE_FINAL_FLURRY_1) {
        crit_buff += 0.25;
    }

    if (dmgObj.ability === ABILITIES.THE_FINAL_FLURRY_2) {
        crit_buff += 0.5;
    }

    if (dmgObj.ability === ABILITIES.WILD_MAGIC_HIT) {
        crit_buff += 0.2;
    }

    logger.trace('Crit Damage Bonus', `+${(crit_buff * 100).toFixed(1)}%`, `Base 50%${crit_buff !== 0.5 ? ' + modifiers' : ''} → ×${(1 + crit_buff).toFixed(4)} multiplier`);
    return crit_buff;
}
