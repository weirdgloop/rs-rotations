import { settingsActions } from '$lib/stores';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { gear } from '$lib/data/slayer-helmets';
import { ABILITIES, abils } from '$lib/data/abilities';
import { armour } from '$lib/data/armour'
import { weapons } from '$lib/data/weapons'
import { getEquipmentTier, getStyleStrength, isCustomEquipment, migrateEquipmentSettings } from '$lib/data/equipment';
import { prayers } from '../data/prayers';
import { create_object } from './rotation_builder/rota_object_helper';
import { SETTINGS } from './settings_rb';
import { collectActivePerks, applyPerksToSettings } from '$lib/data/perks';
import { Logger } from '$lib/utils/Logger';
const logger = Logger.getInstance();

function calc_level_damage(settings) {
    let style = abils[settings['ability']].mainStyle;
    if (style === 'melee') {
        style = 'strength';
    }
    const level = settings[style + ' level'];
    const result = Math.round(145 * 2.5 * (Math.log(1 + 0.6 * (level / 145)) / Math.log(1.6)));
    logger.trace('Level Damage', result, `${style} level ${level}: round(145 × 2.5 × ln(1 + 0.6 × ${level}/145) / ln(1.6))`);
    return result;
}

function calc_base_ad(settings) {
    // see wiki page /ability_damage for more info
    let base_AD = 0;
    const levelDmg = calc_level_damage(settings);
    const bonus = calc_bonus(settings);

    if (settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW) {
        const mhTier = calc_weapon_tier(settings, 'main-hand weapon');
        let AD_mh = Math.floor(levelDmg + 9.6 * mhTier + bonus);
        logger.trace('AD (Main-Hand)', AD_mh, `floor(${levelDmg} + 9.6 × ${mhTier} + ${bonus})`);

        let AD_oh = 0;
        if (weapons[settings[SETTINGS.OH]]?.['weapon type'] === 'off-hand') {
            const ohTier = calc_weapon_tier(settings, 'off-hand weapon');
            AD_oh = Math.floor(0.5 * Math.floor(levelDmg + 9.6 * ohTier + bonus));
            logger.trace('AD (Off-Hand)', AD_oh, `floor(0.5 × floor(${levelDmg} + 9.6 × ${ohTier} + ${bonus}))`);
        }
        base_AD = AD_mh + AD_oh;
        logger.trace('Raw Base AD (DW)', base_AD, `${AD_mh} + ${AD_oh}`);
    }

    else if (settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH) {
        const thTier = calc_weapon_tier(settings, 'two-hand weapon');
        const mhComponent = Math.floor(levelDmg + 9.6 * thTier + bonus);
        const ohComponent = Math.floor(0.5 * mhComponent);
        base_AD = mhComponent + ohComponent;
        logger.trace('AD (TH)', base_AD, `floor(${levelDmg} + 9.6 × ${thTier} + ${bonus}) = ${mhComponent}, + floor(0.5 × ${mhComponent}) = ${ohComponent}`);
    }

    // base damage buffs (eruptive / equilibrium)
    let buff = 1 + settings[SETTINGS.ERUPTIVE] * 0.005;
    if (settings[SETTINGS.EQ_PERK] > 0) {
        buff += 0.06 + settings[SETTINGS.EQ_PERK] * 0.02;
    }
    const rawAD = base_AD;
    base_AD = Math.floor(base_AD * buff);
    if (buff !== 1) {
        logger.trace('AD Buff', `×${buff}`, `Eruptive ${settings[SETTINGS.ERUPTIVE]}, EQ ${settings[SETTINGS.EQ_PERK]}`);
    }
    logger.trace('Base AD', base_AD, buff !== 1 ? `floor(${rawAD} × ${buff})` : 'No eruptive/equilibrium');
    return base_AD;

}

function calc_weapon_tier(settings, hand) {
    let ammo_tier = 999;
    if (abils[settings['ability']].mainStyle === 'ranged') {
        if (settings[SETTINGS.AMMO] === ARMOUR.CUSTOM) {
            ammo_tier = settings[SETTINGS.AMMO_TIER];
        }
        else {
            ammo_tier = getEquipmentTier(settings[SETTINGS.AMMO], 'ranged') || 999;
        }
    }

    let weapon_tier = 0;
    // custom weapon tier
    if (isCustomEquipment(settings[hand])) {
        weapon_tier = settings[hand + ' custom tier'];
    }
    // standard weapon
    else {
        weapon_tier = getEquipmentTier(settings[hand]);
    }
    let tier = Math.min(weapon_tier, ammo_tier);
    logger.trace(`Weapon Tier (${hand})`, tier, `weapon: ${settings[hand]} (t${weapon_tier})${ammo_tier < 999 ? `, ammo capped to t${ammo_tier}` : ''}`);
    return tier;
}

// Slot multipliers for calculating strength bonus from tier
const SLOT_MULTIPLIERS = {
    'helmet': 0.25,
    'necklace': 0.575,
    'body': 0.375,
    'boots': 0.15625,
    'cape': 0.375,
    'gloves': 0.15625,
    'legs': 0.3125,
    'pocket': 0.15625,
    'ring': 0.375,
    'melee ammo': 0.26875,
    'not used': 0,
};

// Calculate strength bonus from tier and slot: floor(tier * 10 * multiplier) / 10
function calcSlotBonus(tier, slot) {
    const multiplier = SLOT_MULTIPLIERS[slot] ?? 0;
    return Math.floor(tier * 10 * multiplier) / 10;
}

// bonus from gear and reaper crew
function calc_bonus(settings) {
    let bonus = 0;
    const style = abils[settings['ability']].mainStyle;
    const tierKey = style === 'necromancy' ? 'necro' : style;

    if (settings[SETTINGS.REAPER_CREW] === true) {
        bonus += 12;
    }

    const slots = [
        SETTINGS.HELMET, SETTINGS.BODY, SETTINGS.LEGS,
        SETTINGS.GLOVES, SETTINGS.BOOTS, SETTINGS.NECKLACE,
        SETTINGS.RING, SETTINGS.CAPE, SETTINGS.POCKET
    ];

    for (const slotSetting of slots) {
        bonus += getStyleStrength(settings[slotSetting], style);
    }

    if (style === 'melee' && settings[SETTINGS.AMMO] !== 'none') {
        bonus += getStyleStrength(settings[SETTINGS.AMMO], style);
    }

    logger.trace('Strength Bonus', bonus, `Gear slots${settings[SETTINGS.REAPER_CREW] ? ' + Reaper Crew (+12)' : ''}`);
    return bonus;
}

// modify boosted AD by damage potential (hit chance)
function calc_damage_potential(settings, dmgObject) {
    let hit_chance = 1;
    if (abils[settings['ability']].damagePotentialEffects === true) {
        hit_chance = Math.min(settings[SETTINGS.HIT_CHANCE] / 100, 1);
    }
    return Math.floor(dmgObject['base AD'] * hit_chance);
}

// calculate boosted AD
function calc_boosted_ad(settings, dmgObject) {
    let boosted_AD = calc_damage_potential(settings, dmgObject);
    let base_ad_boost = 1;

    if (abils[settings['ability']].mainStyle === 'magic') {
        // inq staff
        if (
            settings[SETTINGS.WEAPON] === 'two-hand' &&
            settings['two-hand weapon'] === WEAPONS.INQUISITOR_STAFF
        ) {
            //boosted_AD = Math.floor(boosted_AD * 1.125);
            base_ad_boost += 0.125;
        }

        // inq staff upgraded
        else if (
            settings[SETTINGS.WEAPON] === 'two-hand' &&
            settings['two-hand weapon'] === WEAPONS.INQUISITOR_STAFF_PLUS
        ) {
            //boosted_AD = Math.floor(boosted_AD * 1.175);
            base_ad_boost += 0.175;
        }

        // crumble undead
        if (settings[SETTINGS.AUTO_CAST] === SETTINGS.AUTO_CAST_VALUES.CRUMBLE_UNDEAD) {
            //boosted_AD = Math.floor(boosted_AD * 1.3);
            base_ad_boost += 0.3;
        }

    }

    if (abils[settings['ability']].mainStyle === 'melee') {
        // terrasaur maul
        if (
            settings[SETTINGS.WEAPON] === 'two-hand' &&
            settings['two-hand weapon'] === WEAPONS.TERRASAUR_MAUL
        ) {
            base_ad_boost += 0.125;
        }

        // terrasaur maul upgraded
        else if (
            settings[SETTINGS.WEAPON] === 'two-hand' &&
            settings['two-hand weapon'] === WEAPONS.TERRASAUR_MAUL_PLUS
        ) {
            base_ad_boost += 0.175;
        }

        // keris
        if (settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW) {
            if ([WEAPONS.KERIS, WEAPONS.PRIMED_KERIS, WEAPONS.CONSECRATED_KERIS].includes(settings[SETTINGS.MH])) {
                base_ad_boost += 0.333;
            }
            else if ([WEAPONS.KERIS_PROC, WEAPONS.PRIMED_KERIS_PROC, WEAPONS.CONSECRATED_KERIS_PROC].includes(settings[SETTINGS.MH])) {
                base_ad_boost += 2;
            }
        }

    }

    if (abils[settings['ability']].mainStyle === 'ranged') {
        // hex bow
        if (
            settings[SETTINGS.WEAPON] === 'two-hand' &&
            settings['two-hand weapon'] === WEAPONS.HEXHUNTER_BOW
        ) {
            base_ad_boost += 0.125;
        }

        // hex bow upgraded
        else if (
            settings[SETTINGS.WEAPON] === 'two-hand' &&
            settings['two-hand weapon'] === WEAPONS.HEXHUNTER_BOW_PLUS
        ) {
            base_ad_boost += 0.175;
        }

        // icy precision (wen arrows) - flat +30% base damage
        const wen_arrow_abil_types_buffed = ['threshold', 'ultimate', 'special attack'];
        if (
            wen_arrow_abil_types_buffed.includes(abils[settings['ability']].abilityType) &&
            settings[SETTINGS.AMMO] === ARMOUR.WEN_ARROWS &&
            settings[SETTINGS.ICY_PRECISION] > 0
        ) {
            base_ad_boost += 0.30;
        }
    }

    // necromancy has no (known) buffs of this type

    // Scripture of Amascut
    if (settings[SETTINGS.POCKET] === ARMOUR.AMASCUT_BOOK) {
        base_ad_boost += 0.1;
    }

    boosted_AD = Math.floor(boosted_AD * base_ad_boost);

    // chaos roar (flat +755, applied after multiplier)
    if (abils[settings['ability']].mainStyle === 'melee' && settings['chaos roar'] === true) {
        boosted_AD += 755;
    }

    return boosted_AD;
}

function ability_specific_effects(settings, dmgObject) {
    // order of these effects in unknown and should be researched properly still.
    if (abils[settings['ability']].mainStyle === 'magic') {
        // conflagrate
        if (settings['ability'] === ABILITIES.COMBUST_HIT && settings[SETTINGS.CONFLAGRATE] === true) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * 1.4);
        }

        // song of destruction 2 item set effect
        if (
            ['bleed', 'burn', 'dot'].includes(abils[settings['ability']].abilityClassification) &&
                (settings[SETTINGS.MH] === WEAPONS.ROAR_OF_AWAKENING || settings[SETTINGS.MH] === WEAPONS.ROAR_OF_AWAKENING_IM) &&
                (settings[SETTINGS.OH] === WEAPONS.ODE_TO_DECEIT || settings[SETTINGS.OH] === WEAPONS.ODE_TO_DECEIT_IM) &&
                settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW
        ) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * 1.3);
        }

        // kerapac's wristwraps — buff flag set by Dragon Breath with KWW/KWW_E
        if (settings['ability'] === ABILITIES.COMBUST_HIT && settings[SETTINGS.KERAPACS_WRIST_WRAPS] === true) {
            const hasEnchantment = settings[SETTINGS.GLOVES] === ARMOUR.KERAPACS_WRISTWRAPS_E &&
                settings[SETTINGS.ENCHANTMENT_OF_FLAMES] === true;
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * (hasEnchantment ? 1.4 : 1.25));
        }

        // combust lunging - (10 + 3 per rank)% more damage
        if (settings['ability'] === ABILITIES.COMBUST_HIT && settings[SETTINGS.LUNGING] > 0) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * (1 + (0.10 + 0.03 * settings[SETTINGS.LUNGING])));
        }
        // energising - no longer affects damage (now gives accuracy bonus)

        // greater chain half damage
        const gchain_not_halved = ['bleed', 'burn', 'dot'];
        if (
            gchain_not_halved.includes(abils[settings['ability']].abilityClassification) === false
        ) {
            dmgObject[boosted_AD] = Math.floor(dmgObject[boosted_AD] * 0.5);
        }
    }

    if (abils[settings['ability']].mainStyle === 'melee') {
        // dismember lunging - (10 + 3 per rank)% more damage
        if (settings['ability'] === ABILITIES.DISMEMBER_HIT && settings[SETTINGS.LUNGING] > 0) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * (1 + (0.10 + 0.03 * settings[SETTINGS.LUNGING])));
        }

        // punish low
        if (settings['ability'] === ABILITIES.PUNISH && settings[SETTINGS.TARGET_HP_PERCENT] <= 50) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * 2.5);
        }
    }

    if (abils[settings['ability']].mainStyle === 'ranged') {
        // piercing shot bound
        if (
            settings['ability'] === 'piercing shot' &&
            (settings[SETTINGS.TARGET_DISABILITY] === SETTINGS.TARGET_DISABILITY_VALUES.STUNNED ||
                settings[SETTINGS.TARGET_DISABILITY] === SETTINGS.TARGET_DISABILITY_VALUES.BOUND ||
                settings[SETTINGS.TARGET_DISABILITY] === SETTINGS.TARGET_DISABILITY_VALUES.BOUND_STUNNED)
        ) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * 1.3);
        }

        // energising - no longer affects piercing shot damage (now gives accuracy bonus)

    }

    if (abils[settings['ability']].mainStyle === 'necromancy') {
        // death spark (omni guard passive)
        if (settings['death spark'] === true && settings['ability'] === 'necromancy auto') {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * 2);
        }

        // living death - finger of death
        if (
            settings[SETTINGS.LIVING_DEATH] === true &&
            settings['ability'] === ABILITIES.FINGER_OF_DEATH
        ) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * 1.5);
        }

        // skeleton warrior stacks
        if (settings['ability'] === ABILITIES.SKELETON_WARRIOR_AUTO) {
            dmgObject['boosted AD'] = Math.floor(
                dmgObject['boosted AD'] *
                    (1 + 0.03 * settings[SETTINGS.SKELETON_WARRIOR_RAGE_STACKS])
            );
        }

        // valour / phantom guardian stacks
        if (settings['ability'] === ABILITIES.COMMAND_PHANTOM_GUARDIAN) {
            dmgObject['boosted AD'] = Math.floor(
                dmgObject['boosted AD'] *
                    (1 + 0.2 * settings[SETTINGS.VALOUR_STACKS])
            );
        }

        // scythe 3
        if (settings['ability'] === ABILITIES.SPECTRAL_SCYTHE_3) {
            dmgObject['boosted AD'] = Math.floor(dmgObject['boosted AD'] * (1 + (1-settings[SETTINGS.TARGET_HP_PERCENT]/100)));
        }
    }
    return dmgObject;
}

function set_min_var(settings, dmgObject) {
    // set initial min and var values
    let min_percent = abils[settings['ability']].minHit;
    let var_percent = abils[settings['ability']].varHit;

    if (abils[settings['ability']].mainStyle === 'magic') {
        // flank
        if (settings['ability'] === ABILITIES.IMPACT) {
            min_percent += min_percent * 0.4 * settings[SETTINGS.FLANKING];
            var_percent += var_percent * 0.4 * settings[SETTINGS.FLANKING];
        }
    }

    if (abils[settings['ability']].mainStyle === 'melee') {
        // greater barge tick bonus
        if (settings['ability'] === ABILITIES.GREATER_BARGE) {
            min_percent = min_percent + Math.min(0.05 * settings[SETTINGS.TIME_SINCE_ATTACK], 0.5);
            var_percent = var_percent + Math.min(0.07 * settings[SETTINGS.TIME_SINCE_ATTACK], 0.7);
        }

        // icy tempest
        if (
            settings['ability'] === ABILITIES.ICY_TEMPEST_1 ||
            settings['ability'] === ABILITIES.ICY_TEMPEST_2
        ) {
            min_percent += 0.18 * settings[SETTINGS.PRIMORDIAL_ICE];
            var_percent += 0.04 * settings[SETTINGS.PRIMORDIAL_ICE];
        }

        // flank
        if (settings['ability'] === ABILITIES.BACKHAND) {
            min_percent += min_percent * 0.4 * settings[SETTINGS.FLANKING];
            var_percent += var_percent * 0.4 * settings[SETTINGS.FLANKING];
        }

    }

    if (abils[settings['ability']].mainStyle === 'ranged') {
        // flank
        if (settings['ability'] === ABILITIES.BINDING_SHOT) {
            min_percent += min_percent * 0.4 * settings[SETTINGS.FLANKING];
            var_percent += var_percent * 0.4 * settings[SETTINGS.FLANKING];
        }
    }

    if (abils[settings['ability']].mainStyle === 'necromancy') {
        // death grasp (death guard spec)
        if (settings['ability'] === ABILITIES.DEATH_GRASP) {
            min_percent = min_percent + 0.4 * settings[SETTINGS.NECROSIS_STACKS];
        }

        // flank
        if (settings['ability'] === ABILITIES.SOUL_STRIKE) {
            min_percent += min_percent * 0.4 * settings[SETTINGS.FLANKING];
            var_percent += var_percent * 0.4 * settings[SETTINGS.FLANKING];
        }
    }

    dmgObject.minHit = Math.max(Math.floor(min_percent * dmgObject['boosted AD']), 0);
    dmgObject.varHit = Math.max(Math.floor(var_percent * dmgObject['boosted AD']), 0);
    return dmgObject;
}

function calc_style_specific(settings, dmgObject) {
    if (abils[settings['ability']].onHitEffects === true) {
        if (abils[settings['ability']].mainStyle === 'ranged') {
            // add bolg damage (rot builder)
            if (settings['ability'] === 'bolg proc' && Array.isArray(settings['bolg damage'])) {
                dmgObject.minHit += Math.floor(settings['bolg damage'][0]['crit']['damage list'][0] * 0.33);
                dmgObject.varHit += Math.floor(settings['bolg damage'][0]['crit']['damage list'][settings['bolg damage'][0]['crit']['damage list'].length-1] * 0.37 -
                    settings['bolg damage'][0]['crit']['damage list'][0] * 0.33
                );
            }

            // add bolg damage (damage sheets)
            else if (settings['ability'] === 'bolg proc') {
                dmgObject.minHit += Math.floor(settings['bolg damage']['crit']['damage list'][0] * 0.33);
                dmgObject.varHit += Math.floor(settings['bolg damage']['crit']['damage list'][settings['bolg damage']['crit']['damage list'].length-1] * 0.37 -
                    settings['bolg damage']['crit']['damage list'][0] * 0.33
                );
            }

            // og bane ammo
            if (settings['ammunition'] === 'bane bolts' || settings['ammunition'] === 'bane arrows') {
                if (
                    settings['ability'] === 'ranged main-hand auto' ||
                    settings['ability'] === 'ranged two-hand auto' ||
                    settings['ability'] === 'ranged off-hand auto'
                ) {
                    dmgObject.minHit = Math.floor(dmgObject.minHit * 1.4);
                    dmgObject.varHit = Math.floor(dmgObject.varHit * 1.4);
                } else {
                    dmgObject.minHit = Math.floor(dmgObject.minHit * 1.25);
                    dmgObject.varHit = Math.floor(dmgObject.varHit * 1.25);
                }
            }

            // jas bane ammo
            if (
                settings[SETTINGS.AMMO] === ARMOUR.JAS_ARROWS
            ) {
                dmgObject.minHit = Math.floor(dmgObject.minHit * 1.3);
                dmgObject.varHit = Math.floor(dmgObject.varHit * 1.3);
            }

            // ful arrows
            //TODO check you're actually using a bow
            if (settings[SETTINGS.AMMO] === ARMOUR.FUL_ARROWS) {
                dmgObject.minHit = Math.floor(dmgObject.minHit * 1.15);
                dmgObject.varHit = Math.floor(dmgObject.varHit * 1.15);
            }

            // enchanted bolts (proc based, will come later)
            // sirenic set effect (proc based, will come later)
            // gemstone armour effect (proc based, will come later)

            // pernix quiver
            if (
                settings[SETTINGS.QUIVER] === true &&
                settings[SETTINGS.TARGET_HP_PERCENT] <= 25
            ) {
                dmgObject.varHit = Math.floor(
                    (dmgObject.varHit += 0.04 * (dmgObject.minHit + dmgObject.varHit))
                );
            }
        }
    }
    return dmgObject;
}

function calc_precise(settings, dmgObject) {
    // calculate precise
    let max_hit = dmgObject.minHit + dmgObject.varHit;
    dmgObject.minHit = dmgObject.minHit + Math.floor(0.015 * settings[SETTINGS.PRECISE] * max_hit);
    dmgObject.varHit = Math.max(0, dmgObject.varHit - Math.floor(0.015 * settings[SETTINGS.PRECISE] * max_hit));

    return dmgObject;
}

function calc_additive_boosts(settings, dmgObject) {
    // compute the bonus gained from additive boosts
    let boost = 0;

    // add stone of jas boost
    boost += settings[SETTINGS.STONE_OF_JAS] / 100;

    // void armour
    // count the number of non-helmet void pieces
    let void_pieces = 0;
    const void_chest_pieces = [
        ARMOUR.VOID_KNIGHT_TOP,
        ARMOUR.SUPERIOR_VOID_KNIGHT_TOP,
        ARMOUR.ELITE_VOID_KNIGHT_TOP,
        ARMOUR.SUPERIOR_ELITE_VOID_KNIGHT_TOP
    ];
    if (void_chest_pieces.includes(settings[SETTINGS.BODY])) {
        void_pieces += 1;
    }
    const void_legs_pieces = [
        ARMOUR.VOID_KNIGHT_ROBE,
        ARMOUR.SUPERIOR_VOID_KNIGHT_ROBE,
        ARMOUR.ELITE_VOID_KNIGHT_ROBE,
        ARMOUR.SUPERIOR_ELITE_VOID_KNIGHT_ROBE
    ];
    if (void_legs_pieces.includes(settings[SETTINGS.LEGS])) {
        void_pieces += 1;
    }
    const void_hands_pieces = [ARMOUR.VOID_KNIGHT_GLOVES, ARMOUR.SUPERIOR_VOID_KNIGHT_GLOVES];
    if (void_hands_pieces.includes(settings[SETTINGS.GLOVES])) {
        void_pieces += 1;
    }
    const void_shield_pieces = [ARMOUR.VOID_KNIGHT_DEFLECTOR, ARMOUR.SUPERIOR_VOID_KNIGHT_DEFLECTOR];
    if (
        void_shield_pieces.includes(settings[SETTINGS.OH]) &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW
    ) {
        void_pieces += 1; // TODO: use number of void pieces somewhere
    }

    // add damage bonus
    if (abils[settings['ability']].mainStyle === 'magic') {
        if (settings[SETTINGS.HELMET] === ARMOUR.VOID_KNIGHT_MAGIC_HELM) {
            boost += 0.05;
        } else if (settings[SETTINGS.HELMET] === ARMOUR.SUPERIOR_VOID_KNIGHT_MAGIC_HELM) {
            boost += 0.07;
        }
    } else if (abils[settings['ability']].mainStyle === 'melee') {
        if (settings[SETTINGS.HELMET] === ARMOUR.VOID_KNIGHT_MELEE_HELM) {
            boost += 0.05;
        } else if (settings[SETTINGS.HELMET] === ARMOUR.SUPERIOR_VOID_KNIGHT_MELEE_HELM) {
            boost += 0.07;
        }
    } else if (abils[settings['ability']].mainStyle === 'ranged') {
        if (settings[SETTINGS.HELMET] === ARMOUR.VOID_KNIGHT_RANGED_HELM) {
            boost += 0.05;
        } else if (settings[SETTINGS.HELMET] === ARMOUR.SUPERIOR_VOID_KNIGHT_RANGED_HELM) {
            boost += 0.07;
        }
    }

    // draconic fruit
    if (settings[SETTINGS.DRACONIC_FRUIT] === true) {
        boost += 0.02;
    }

    // berserker necklace
    if (settings[SETTINGS.NECKLACE] === ARMOUR.BERSERKER_NECKLACE &&
        (settings[SETTINGS.TH] === WEAPONS.EZK || settings[SETTINGS.TH] === WEAPONS.EZK_IM) && settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        boost += 0.05;
    }

    // Flamebound rival
    if ( (settings[SETTINGS.FLAMEBOUND_RIVAL] === true || settings['ability'] === ABILITIES.IGNEOUS_SHOWDOWN) &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        (settings[SETTINGS.TH] === WEAPONS.EZK || settings[SETTINGS.TH] === WEAPONS.EZK_IM) &&
        abils[settings['ability']].mainStyle === 'melee'
    ) {
         boost += 0.12;
    }

    // dominion marker (wtf does this do lol?)

    // regular gloves of passive next abil boost if style is melee
    if (
        settings[SETTINGS.ENDURING_RUIN_HIT] === SETTINGS.ENDURING_RUIN_HIT_VALUES.REGULAR &&
        abils[settings['ability']].mainStyle === 'melee'
    ) {
        boost += 0.1;
    } else if (
        settings[SETTINGS.ENDURING_RUIN_HIT] === SETTINGS.ENDURING_RUIN_HIT_VALUES.ENCHANTED &&
        abils[settings['ability']].mainStyle === 'melee'
    ) {
        boost += 0.16;
    }

    // ruby aurora
    boost += settings[SETTINGS.RUBY_AURORA] * 0.01;

    // gorajan trailblazer
    /*if (settings['gorajan trailblazer effect'] === true) {
        boost += 0.07;
    }*/

    // gravitate (annihilation spec)
    if (abils[settings['ability']].mainStyle === 'melee') {
        boost += settings[SETTINGS.GRAVITATE] / 100;
    }

    // scripture of ful (probability-weighted in rotation builder, flat 20% for single-ability calc)
    if (settings[SETTINGS.POCKET] === ARMOUR.FUL_BOOK) {
        const fulProb = settings[SETTINGS.SCRIPTURE_OF_FUL_PROB];
        boost += 0.2 * (fulProb !== undefined ? fulProb : 1);
    }

    // desperado (ring of kinship ranged boost)
    /*if (settings['desperado'] > 0 && abils[settings['ability']].mainStyle === 'ranged') {
        boost += 0.1;
        boost = boost + 0.01 * settings['desperado'];
    }*/
    dmgObject.minHit = Math.floor(dmgObject.minHit * (1 + boost));
    dmgObject.varHit = Math.floor(dmgObject.varHit * (1 + boost));

    return dmgObject;
}

function calc_prayer(settings) {
    let boost = 0;
    if (abils[settings['ability']].mainStyle === prayers[settings[SETTINGS.PRAYER]]['style']) {
        boost += prayers[settings[SETTINGS.PRAYER]].boost;

        if (['single-stat boosting', 'leech curse'].includes(prayers[settings[SETTINGS.PRAYER]]['category']) &&
            settings[SETTINGS.NECKLACE] === ARMOUR.AMULET_OF_ZEALOTS
        ) {
            boost += 0.1;
        }
    }
    if (settings[SETTINGS.DIVINE_RAGE] === true &&
        (prayers[settings[SETTINGS.PRAYER]]['book'] === "normal" || prayers[settings[SETTINGS.PRAYER]]['style'] === "none")) {
        boost += 0.05;
    }
    return boost;
}

function calc_multiplicative_shared_buffs(settings, dmgObject) {
    let boost = 10000;

    // apply magic unique boosts
    if (abils[settings['ability']].mainStyle === 'magic') {
        // prayer boost
        boost = Math.floor(boost * (1 + calc_prayer(settings)));

        // sunshine
        if (settings['sunshine'] === true) {
            boost = Math.floor(boost * 1.5);
        }

        // blood tithe (exsanguinate)
        if (abils[settings['ability']].abilityType === 'basic') {
            boost = Math.floor(boost * (1 + settings[SETTINGS.BLOOD_TITHE] / 100));
        }
    }

    // apply melee unique boosts
    if (abils[settings['ability']].mainStyle === 'melee') {
        // prayer boost
        boost = Math.floor(boost * (1 + calc_prayer(settings)));

        // berserk
        if (settings['berserk'] === true) {
            boost = Math.floor(boost * 2);
        }

        // zaros godsword
        if (settings[SETTINGS.BLACKHOLE] === true) {
            boost = Math.floor(boost * 1.25);
        }

        // dragon battleaxe
        if (settings['rampage'] === true) {
            boost = Math.floor(boost * 1.2);
        }
    }

    // apply ranged unique boosts
    if (abils[settings['ability']].mainStyle === 'ranged') {
        // prayer boost
        boost = Math.floor(boost * (1 + calc_prayer(settings)));

        // death swiftness
        if (settings['death swiftness'] === true) {
            boost = Math.floor(boost * 1.5);
        }
    }

    // apply necro unique boosts
    if (abils[settings['ability']].mainStyle === 'necromancy') {
        // prayer boost
        boost = Math.floor(boost * (1 + calc_prayer(settings)));
    }

    // apply revenge
    if (
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW &&
        ['shield', 'defender'].includes(weapons[settings[SETTINGS.OH]]?.['weapon type'])
    ) {
        let revenge = 0.025 * settings[SETTINGS.REVENGE];

        // boost is twice as big if done with a shield
        if (weapons[settings[SETTINGS.OH]]?.['weapon type'] === 'shield') {
            revenge = revenge * 2;
        }

        boost = Math.floor(boost * (1 + revenge));
    }
    // crystal weapons (proc based, so added later)

    // spendthrift (proc based, so added later)

    // ruthless
    boost = Math.floor(
        boost * (1 + settings[SETTINGS.RUTHLESS_STACKS] * settings[SETTINGS.RUTHLESS_RANK] * 0.005)
    );

    dmgObject.minHit = Math.floor((dmgObject.minHit * boost) / 10000);
    dmgObject.varHit = Math.floor((dmgObject.varHit * boost) / 10000);

    return dmgObject;
}

function calc_multiplicative_pve_buffs(settings, dmgObject) {
    let boost = 10000;

    // apply magic unique buffs
    if (abils[settings['ability']].mainStyle === 'magic') {
        // spellcaster gloves (proc based, so added later)
        // boost = boost; // useless self-assignment
    }

    // apply melee unique buffs
    if (abils[settings['ability']].mainStyle === 'melee') {
        // spellcaster gloves (proc based, so added later)
        //bane gear
        // if (weapons[settings['main-hand']]['category'] === 'bane') {
        //     boost = Math.floor(boost * 1.25);
        // }
    }

    // slayer helm
    boost = Math.floor(boost * (1 + gear[settings[SETTINGS.SLAYER_HELM]]['boost']));

    // fort forinthry guard house task
    if (settings[SETTINGS.GUARDHOUSE] === 'tier 1' || settings[SETTINGS.GUARDHOUSE] === 'tier 3') {
        boost = Math.floor(boost * 1.01);
    } else if (
        settings[SETTINGS.GUARDHOUSE] === 'tier 1 undead' ||
        settings[SETTINGS.GUARDHOUSE] === 'tier 3 undead'
    ) {
        boost = Math.floor(boost * 1.02);
    }

    // fort forinthry guard house low hp
    if (
        settings[SETTINGS.GUARDHOUSE] in ['tier 3', 'tier 3 undead'] &&
        settings[SETTINGS.TARGET_HP_PERCENT] < 25
    ) {
        boost = Math.floor(boost * 1.1);
    }

    // genocidal
    boost = Math.floor(boost * (1 + settings[SETTINGS.GENOCIDAL] / 100));

    // salve amulet
    if (settings[SETTINGS.NECKLACE] === ARMOUR.SALVE_AMULET) {
        boost = Math.floor(boost * 1.15);
    } else if (settings[SETTINGS.NECKLACE] === ARMOUR.SALVE_AMULET_E) {
        boost = Math.floor(boost * 1.2);
    }

    // swiftness of the aviansie (egwd kree'arra buff)
    if (settings['swiftness of the aviansie'] === true) {
        boost = Math.floor(boost * 1.1);
    }

    // perfect dung potion buff
    if (settings['perfect dungeoneering potion'] === true) {
        boost = Math.floor(boost * 1.05);
    }

    // ripper claws buff (quantity of buff unknown)

    // ripper demon familiar buff
    if (settings[SETTINGS.FAMILIAR] === SETTINGS.FAMILIAR_VALUES.RIPPER_DEMON) {
        boost += Math.floor(boost * 0.05 * (1 - settings[SETTINGS.TARGET_HP_PERCENT] / 100));
    }

    dmgObject.minHit = Math.floor((dmgObject.minHit * boost) / 10000);
    dmgObject.varHit = Math.floor((dmgObject.varHit * boost) / 10000);

    return dmgObject;
}

function calc_bonus_damage(settings, dmgObject) {
    let min_hit = dmgObject.minHit;
    let var_hit = dmgObject.varHit;

    if (abils[settings['ability']].mainStyle === 'melee') {
        // frostblades (leng off-hand effects)
        if (
            (settings[SETTINGS.OH] === WEAPONS.DARK_SLIVER_OF_LENG ||
                settings[SETTINGS.OH] === WEAPONS.DARK_SLIVER_OF_LENG_IM ||
                settings[SETTINGS.OH] === WEAPONS.DARK_ICE_SLIVER) &&
            settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW &&
            settings[SETTINGS.FROSTBLADES] === true
        ) {
            min_hit += Math.floor(0.24 * dmgObject['base AD']);
        }
    }

    dmgObject.minHit = min_hit;
    dmgObject.varHit = var_hit;

    return dmgObject;
}

function calc_core(settings, dmgObject, key) {
    for (let i = 0; i < dmgObject[key]['damage list'].length; i++) {
        // berserker's fury
        dmgObject[key]['damage list'][i] = Math.floor(
            dmgObject[key]['damage list'][i] * (1 + settings[SETTINGS.BERSERKERS_FURY] / 100)
        );

        // dharock's gear (proc based, so added later)

        // store damage into bolg
        if (
            (settings[SETTINGS.TH] === WEAPONS.BOW_OF_THE_LAST_GUARDIAN ||
            settings[SETTINGS.TH] === WEAPONS.BOW_OF_THE_LAST_GUARDIAN_IM)
            &&
            settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
            &&
            (settings[SETTINGS.PERFECT_EQUILIBRIUM_STACKS] === 7 ||
                (settings[SETTINGS.PERFECT_EQUILIBRIUM_STACKS] >= 3
                &&
                settings[SETTINGS.BALANCE_BY_FORCE] === true))
        ) {
            if (!('bolg damage' in settings)) {
                settings['bolg damage'] = create_object(settings);
            }
            settings['bolg damage'][key]['damage list'].push(dmgObject[key]['damage list'][i]);
        }
        // crits
        if (dmgObject[key]['crit'] === true && abils[settings['ability']].critEffects === true) {
            dmgObject[key]['damage list'][i] = Math.floor(
                dmgObject[key]['damage list'][i] * (1 + calc_crit_damage(settings))
            );
        }

        // store bloat damages
        if (settings['ability'] === ABILITIES.BLOAT) {
            if (!('bloat damage' in settings)) {
                settings['bloat damage'] = create_object(settings);
            }
            settings['bloat damage'][key]['damage list'].push(dmgObject[key]['damage list'][i]);
        }

        // store fsoa damage
        if (abils[settings['ability']].critEffects === true
            && settings['instability'] === true
            && abils[settings['ability']].damageType === 'magic'
            && settings['ability'] != 'time strike') {
                if (!('fsoa damage' in settings)) {
                    settings['fsoa damage'] = create_object(settings);
                }
                settings['fsoa damage'][key]['damage list'].push(dmgObject[key]['damage list'][i]);
            }
    }
    return dmgObject[key];
}

function calc_crit_damage(settings) {
    let crit_buff = 0.5; // base

    // smoke cloud
    if (settings[SETTINGS.SMOKE_CLOUD] === true) {
        if (abils[settings['ability']].mainStyle === 'magic') {
            crit_buff += 0.15;
        } else {
            crit_buff += 0.06;
        }
    }

    // channellers ring
    if (
        (settings[SETTINGS.RING] === ARMOUR.CHANNELLERS_RING_E) &&
        abils[settings['ability']]['parent'] &&
        abils[settings['ability']]['parent'].abilityClassification === 'channel'
    ) {
        crit_buff += 0.025 * (1 + settings[SETTINGS.CHANNELLER_RING_STACKS]);
    }

    // champions ring
    if (settings[SETTINGS.RING] === ARMOUR.CHAMPIONS_RING_E &&
        abils[settings['ability']].mainStyle === 'melee'
    ) {
        crit_buff += 0.015 * settings[SETTINGS.NUMBER_OF_BLEEDS];
    }

    // stalkers ring
    if (abils[settings['ability']].mainStyle === 'ranged' &&
        settings[SETTINGS.RING] === ARMOUR.STALKERS_RING_E &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        (weapons[settings[SETTINGS.TH]]['type'] === 'bow' || settings[SETTINGS.TH_TYPE_CUSTOM] === SETTINGS.TH_TYPE_CUSTOM_VALUES.BOW)) {
            crit_buff += 0.03;
        }

    // the final flurry crit damage
    if (settings['ability'] === ABILITIES.THE_FINAL_FLURRY_1) {
        crit_buff += 0.25;
    }

    if (settings['ability'] === ABILITIES.THE_FINAL_FLURRY_2) {
        crit_buff += 0.5;
    }

    // fsoa 22.5%
    if ((settings[SETTINGS.TH] === WEAPONS.FRACTURED_STAFF_OF_ARMADYL || settings[SETTINGS.TH] === WEAPONS.FRACTURED_STAFF_OF_ARMADYL_IM) && settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH) {
        if (settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MAX_CRIT) {
            crit_buff += 0.25;
        }
        else if (settings[SETTINGS.MODE] === SETTINGS.MODE_VALUES.MIN_CRIT) {
            crit_buff += 0.15;
        }
        else {
            crit_buff += 0.2;
        }
    }
    return crit_buff;
}

function calc_on_npc(settings, dmgObject) {
    for (let i = 0; i < dmgObject['damage list'].length; i++) {
        // set haunted
        let haunted = Math.min(
            Math.floor(dmgObject['damage list'][i] * 0.1),
            Math.floor(0.2 * settings['haunted AD'])
        );

        // vulnerability / curse
        if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.VULNERABILITY) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.1);
        } else if (settings[SETTINGS.VULN] === SETTINGS.VULN_VALUES.CURSE) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.05);
        }

        // enduring ruin bleed (gop)
        if (
            settings[SETTINGS.ENDURING_RUIN_BLEED] === SETTINGS.ENDURING_RUIN_BLEED_VALUES.REGULAR &&
            abils[settings['ability']].abilityClassification === 'bleed'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.2);
        } else if (
            settings[SETTINGS.ENDURING_RUIN_BLEED] === SETTINGS.ENDURING_RUIN_BLEED_VALUES.ENCHANTED &&
            abils[settings['ability']].abilityClassification === 'bleed'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.25);
        }

        // wilderness puzzlebox
        if (settings['wilderness puzzlebox'] > 1) {
            dmgObject['damage list'][i] = Math.floor(
                dmgObject['damage list'][i] * (1 + 0.03 + settings['wilderness puzzlebox'])
            );
        }

        // croesus deathspores (crypt flanking)
        if (settings[SETTINGS.CRYPTBLOOM] === true) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.1);
        }

        // zamorak's guardian triumph
        /*if (
            settings['guardian triump'] === true &&
            abils[settings['ability']].abilityType === 'basic'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.2);
        }*/

        // undead slayer perk
        if (settings[SETTINGS.SLAYER_PERK] === SETTINGS.SLAYER_PERK_VALUES.UNDEAD) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.07);
        }

        // undead slayer sigil
        if (settings[SETTINGS.SLAYER_SIGIL] === SETTINGS.SLAYER_SIGIL_VALUES.UNDEAD) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.15);
        }

        // dragon slayer perk
        if (settings[SETTINGS.SLAYER_PERK] === SETTINGS.SLAYER_PERK_VALUES.DRAGON) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.07);
        }

        // dragon slayer sigil
        if (settings[SETTINGS.SLAYER_SIGIL] === SETTINGS.SLAYER_SIGIL_VALUES.DRAGON) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.15);
        }

        // demon slayer perk
        if (settings[SETTINGS.SLAYER_PERK] === SETTINGS.SLAYER_PERK_VALUES.DEMON) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.07);
        }

        // demon slayer sigil
        if (settings[SETTINGS.SLAYER_SIGIL] === SETTINGS.SLAYER_SIGIL_VALUES.DEMON) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.15);
        }

        // nopenopenope (pof spider buff)
        dmgObject['damage list'][i] = Math.floor(
            dmgObject['damage list'][i] * (1 + 0.01*settings[SETTINGS.NOPE])
        );

        // ghost hunter outfit
        // count number of pieces
        let ghost_hunter_pieces = 0;
        if (settings[SETTINGS.HELMET] === ARMOUR.GHOST_HUNTER_GOGGLES) {
            ghost_hunter_pieces += 1;
        }
        if (settings[SETTINGS.CAPE] === ARMOUR.GHOST_HUNTER_BACKPACK) {
            ghost_hunter_pieces += 1;
        }
        if (settings[SETTINGS.BODY] === ARMOUR.GHOST_HUNTER_BODY) {
            ghost_hunter_pieces += 1;
        }
        if (settings[SETTINGS.LEGS] === ARMOUR.GHOST_HUNTER_LEGS) {
            ghost_hunter_pieces += 1;
        }

        // apply buff
        if (ghost_hunter_pieces === 1) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.03);
        } else if (ghost_hunter_pieces === 2) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.06);
        } else if (ghost_hunter_pieces === 3 || ghost_hunter_pieces === 4) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.1);
        }

        // vanquish (quest point weapon)
        if (settings['two-hand weapon'] === 'vanquish') {
            dmgObject['damage list'][i] = Math.floor(
                dmgObject['damage list'][i] * (1 + 0.05 * settings['quest deaths'])
            );
        }

        // scrimshaw of elements
        if (
            settings[SETTINGS.POCKET] === ARMOUR.SCRIMSHAW_OF_ELEMENTS &&
            abils[settings['ability']].mainStyle === 'magic'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.05);
        } else if (
            settings[SETTINGS.POCKET] === ARMOUR.SUPERIOR_SCRIMSHAW_OF_ELEMENTS &&
            abils[settings['ability']].mainStyle === 'magic'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.0666);
        }

        // scrimshaw of cruelty
        if (
            settings[SETTINGS.POCKET] === ARMOUR.SCRIMSHAW_OF_CRUELTY &&
            abils[settings['ability']].mainStyle === 'ranged'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.05);
        } else if (
            settings[SETTINGS.POCKET] === ARMOUR.SUPERIOR_SCRIMSHAW_OF_ELEMENTS &&
            abils[settings['ability']].mainStyle === 'ranged'
        ) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.0666);
        }

        // apply haunted
        if (settings[SETTINGS.HAUNTED] === true) {
            dmgObject['damage list'][i] = dmgObject['damage list'][i] + haunted;
        }

        // essence corruption 10 stack bonus
        if (
            abils[settings['ability']].damageType === 'magic' &&
            settings[SETTINGS.ESSENCE_CORRUPTION] >= 10 &&
            settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.DW &&
            (settings[SETTINGS.MH] === WEAPONS.ROAR_OF_AWAKENING || settings[SETTINGS.MH] === WEAPONS.ROAR_OF_AWAKENING_IM ||
                settings[SETTINGS.OH] === WEAPONS.ODE_TO_DECEIT || settings[SETTINGS.OH] === WEAPONS.ODE_TO_DECEIT_IM)
        ) {
            dmgObject['damage list'][i] =
                dmgObject['damage list'][i] +
                settings[SETTINGS.MAGIC_LEVEL] +
                settings[SETTINGS.ESSENCE_CORRUPTION] * 3;
        }

        // tokkul-zo
        if (settings[SETTINGS.RING] === ARMOUR.TOKKUL_ZO) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.1);
        }

        // necklace of salamancy
        if (settings[SETTINGS.NECKLACE] === ARMOUR.NECKLACE_OF_SALAMANCY) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.15);
        }

        // balance of power
        if (settings[SETTINGS.BALANCE_OF_POWER] > 0) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * (1 + 0.06 * settings[SETTINGS.BALANCE_OF_POWER]));
        }

        // telos red beam
        if (settings[SETTINGS.TELOS_RED_BEAM] === true) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 1.3);
        }

        // telos black beam
        if (settings[SETTINGS.TELOS_BLACK_BEAM] === true) {
            dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * 0.7);
        }

        // anachronia slayer lodge buff
        // dmgObject['damage list'][i] = Math.floor(dmgObject['damage list'][i] * (1 + settings['anachronia slayer lodge buff']));

        // store damage into soul split
        settings['soul split'] = dmgObject;

        // hit cap
        if (settings[SETTINGS.HITCAP] === true) {
            dmgObject['damage list'][i] = Math.min(dmgObject['damage list'][i], 30000);
        }
    }
    return dmgObject;
}

function roll_damage(settings, dmgObject, key) {
    let min_hit = dmgObject[key].minHit;
    let var_hit = dmgObject[key].varHit;
    let dmg_list = [];
    for (let i = 0; i <= var_hit; i++) {
        dmg_list.push(min_hit + i);
    }

    // store corruption shot/blast damage
    if ([ABILITIES.CORRUPTION_BLAST, ABILITIES.CORRUPTION_SHOT].includes(settings['ability'])) {
        if (!('corruption damage' in settings)) {
            settings['corruption damage'] = create_object(settings);
        }
        settings['corruption damage'][key]['damage list'] = [...dmg_list];
    }

    return dmg_list;
}

function calc_on_hit(settings, dmgObject) {
    dmgObject = calc_precise(settings, dmgObject);
    dmgObject = calc_additive_boosts(settings, dmgObject);
    // dmgObject = calc_multiplicative_shared_buffs(settings, dmgObject);

    // dmgObject = calc_multiplicative_pve_buffs(settings, dmgObject);
    // dmgObject = calc_bonus_damage(settings, dmgObject);
    return dmgObject;
}

function calc_damage_object(settings) {
    const dmgObject = create_object(settings);

    for (let key in dmgObject) {
        // calc base AD - use raw value if flag is set, otherwise calculate from equipment
        dmgObject[key]['base AD'] = settings[SETTINGS.USE_RAW_ABILITY_DAMAGE]
            ? settings[SETTINGS.ABILITY_DAMAGE]
            : calc_base_ad(settings);
        // calc buffed AD
        dmgObject[key]['boosted AD'] = calc_boosted_ad(settings, dmgObject[key]);
        // ability specific
        dmgObject[key] = ability_specific_effects(settings, dmgObject[key]);
        // set min var
        dmgObject[key] = set_min_var(settings, dmgObject[key]);
        // style specific
        dmgObject[key] = calc_style_specific(settings, dmgObject[key]);
        // calc on hit effects
        if (abils[settings['ability']].onHitEffects) {
            dmgObject[key] = calc_on_hit(settings, dmgObject[key]);
        }
        // roll damage
        dmgObject[key]['damage list'] = roll_damage(settings, dmgObject, key);
        // calc core
        if (abils[settings['ability']].onHitEffects) {
            dmgObject[key] = calc_core(settings, dmgObject, key);
        }
        // calc on npc
        dmgObject[key] = calc_on_npc(settings, dmgObject[key]);

        // add split soul damage
        if (
            settings['split soul'] === true &&
            ['magic', 'melee', 'ranged', 'necrotic'].includes(
                abils[settings['ability']].damageType
            )
        ) {
            dmgObject[key] = add_split_soul(settings, dmgObject[key]);
        }
    }
    // get user value
    return get_user_value(settings, dmgObject);
}

function calc_bolg(settings) {
    settings['ability'] = 'bolg proc';
    // calc base bolg damage
    let bolg_base = calc_damage_object(settings);
    return bolg_base;
}

function calc_bloat(settings) {
    let bloat_dot = create_object(settings);
    for (let key in settings['bloat damage']) {
        for (let dmg in settings['bloat damage'][key]['damage list']) {
            bloat_dot[key]['damage list'].push(
                Math.floor(settings['bloat damage'][key]['damage list'][dmg] / 4)
            );
        }
        bloat_dot[key] = calc_on_npc(settings, bloat_dot[key]);
        bloat_dot[key] = add_split_soul(settings, bloat_dot[key]);
    }
    const dmg = get_user_value(settings, bloat_dot);
    return 10 * dmg;
}

function calc_corruption(settings) {
    let total_damage = 0;
    for (let splat=2; splat <=5; splat++) {
        let hit_dmg = JSON.parse(JSON.stringify(settings['corruption damage']));
        let multiplier = 1 - ((splat-1) * 0.2)
        for (let key in hit_dmg) {
            for (let i=0; i<hit_dmg[key]['damage list'].length; i++) {
                hit_dmg[key]['damage list'][i] = Math.floor(hit_dmg[key]['damage list'][i] * multiplier);
            }
            hit_dmg[key] = calc_on_npc(settings, hit_dmg[key]);
        }
        total_damage += get_user_value(settings, hit_dmg);
    }
    return total_damage;
}

function calc_fsoa(settings) {
    settings['ability'] = 'time strike';

    return Math.floor(settings['fsoa damage']['crit']['probability'] * calc_damage_object(settings));
}

function calc_sgb(settings, dmg) {
    const hits = [0, 1, 1.5, 2.33, 3.5, 5.0];
    const size = Math.min(settings[SETTINGS.TARGET_SIZE], 5);

    return Math.floor(dmg * (hits[size] - 1));
}

function add_split_soul(settings, dmgObject) {
    if (settings[SETTINGS.SPLIT_SOUL]) {
        for (let i = 0; i < dmgObject['damage list'].length; i++) {
            dmgObject['damage list'][i] += calc_split_soul_hit(
                settings['soul split']['damage list'][i],
                settings
            );
        }
    }
    return dmgObject;
}

function calc_split_soul_hit(hit, settings) {
    return 4 * calc_soul_split_hit(hit, settings);
}

function calc_soul_split_hit(hit, settings) {
    let heal = 0;

    // heal 10% of first 2k
    heal += Math.min(0.1 * hit, 200);
    hit -= 2000;

    // heal 5% of the next 2000
    if (hit > 0) {
        heal += Math.min(0.05 * hit, 100);
        hit -= 2000;
    }

    // heal 1.25% over the rest
    if (hit > 0) {
        heal += 0.0125 * hit;
    }

    // amulet of souls bonus healing
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

function get_user_value(settings, dmgObject) {
    switch (settings[SETTINGS.MODE]) {
        case SETTINGS.MODE_VALUES.MEAN:
            return get_mean_damage(settings, dmgObject);
        case SETTINGS.MODE_VALUES.MEAN_NO_CRIT:
            return get_mean_no_crit(settings, dmgObject);
        case SETTINGS.MODE_VALUES.MEAN_CRIT:
            return get_mean_crit(settings, dmgObject);
        case SETTINGS.MODE_VALUES.MIN_NO_CRIT:
            return get_min_no_crit(settings, dmgObject);
        case SETTINGS.MODE_VALUES.MIN_CRIT:
            return get_min_crit(settings, dmgObject);
        case SETTINGS.MODE_VALUES.MAX_NO_CRIT:
            return get_max_no_crit(settings, dmgObject);
        case SETTINGS.MODE_VALUES.MAX_CRIT:
            return get_max_crit(settings, dmgObject);
        default:
            return null;
    }
}

function get_mean_damage(settings, dmgObject) {
    let mean = 0;
    for (let key in dmgObject) {
        let total = 0;
        let prob = dmgObject[key]['probability'];
        for (let i = 0; i < dmgObject[key]['damage list'].length; i++) {
            total += dmgObject[key]['damage list'][i];
        }
        total = total / dmgObject[key]['damage list'].length;
        mean += total * prob;
    }
    return Math.round(mean);
}

function get_mean_no_crit(settings, dmgObject) {
    let mean = 0;
    for (let key in dmgObject) {
        if (dmgObject[key]['crit'] === false) {
            let total = 0;
            for (let i = 0; i < dmgObject[key]['damage list'].length; i++) {
                total += dmgObject[key]['damage list'][i];
            }
            total = total / dmgObject[key]['damage list'].length;
            mean += total;
        }
    }
    return Math.round(mean);
}

function get_mean_crit(settings, dmgObject) {
    if (abils[settings['ability']].critEffects === false ||
        dmgObject['crit']['probability'] === 0
    ) {
        return get_mean_damage(settings, dmgObject);
    }

    let mean = 0;
    for (let key in dmgObject) {
        if (dmgObject[key]['crit'] === true) {
            let total = 0;
            for (let i = 0; i < dmgObject[key]['damage list'].length; i++) {
                total += dmgObject[key]['damage list'][i];
            }
            total = total / dmgObject[key]['damage list'].length;
            mean += total;
        }
    }
    return Math.round(mean);
}

function get_min_no_crit(settings, dmgObject) {
    let min_hit = 100000000;
    for (let key in dmgObject) {
        if (dmgObject[key]['crit'] === false) {
            let lowest_hit = dmgObject[key]['damage list'][0];
            if (lowest_hit < min_hit) {
                min_hit = lowest_hit;
            }
        }
    }
    return min_hit;
}

function get_min_crit(settings, dmgObject) {
    if (abils[settings['ability']].critEffects === false ||
        dmgObject['crit']['probability'] === 0) {
        return get_min_no_crit(settings, dmgObject);
    }

    let min_hit = 100000000;
    for (let key in dmgObject) {
        if (dmgObject[key]['crit'] === true) {
            let lowest_hit = dmgObject[key]['damage list'][0];
            if (lowest_hit < min_hit) {
                min_hit = lowest_hit;
            }
        }
    }
    return min_hit;
}

function get_max_no_crit(settings, dmgObject) {
    let max_hit = 0;
    for (let key in dmgObject) {
        if (dmgObject[key]['crit'] === false) {
            let highest_hit =
                dmgObject[key]['damage list'][dmgObject[key]['damage list'].length - 1];
            if (highest_hit > max_hit) {
                max_hit = highest_hit;
            }
        }
    }
    return max_hit;
}

function get_max_crit(settings, dmgObject) {
    if (abils[settings['ability']].critEffects === false ||
        dmgObject['crit']['probability'] === 0) {
        return get_max_no_crit(settings, dmgObject);
    }

    let max_hit = 0;
    for (let key in dmgObject) {
        if (dmgObject[key]['crit'] === true) {
            let highest_hit =
                dmgObject[key]['damage list'][dmgObject[key]['damage list'].length - 1];
            if (highest_hit > max_hit) {
                max_hit = highest_hit;
            }
        }
    }
    return max_hit;
}

/**
 * Ensures the correct prayer and set of gear is used for calculating the damage of an ability
 * @param {*} settings
 * @returns
 */
function style_specific_unification(settings, style = null) {
    migrateEquipmentSettings(settings);
    const effectiveStyle = style || (abils[settings['ability']] && abils[settings['ability']].mainStyle);
    if (effectiveStyle == 'magic') {
        settings[SETTINGS.MH] = settings[SETTINGS.MAGIC_MH];
        settings[SETTINGS.OH] = settings[SETTINGS.MAGIC_OH];
        settings[SETTINGS.TH] = settings[SETTINGS.MAGIC_TH];
        settings[SETTINGS.HELMET] = settings[SETTINGS.MAGIC_HELMET];
        settings[SETTINGS.BODY] = settings[SETTINGS.MAGIC_BODY];
        settings[SETTINGS.LEGS] = settings[SETTINGS.MAGIC_LEGS];
        settings[SETTINGS.GLOVES] = settings[SETTINGS.MAGIC_GLOVES];
        settings[SETTINGS.BOOTS] = settings[SETTINGS.MAGIC_BOOTS];
        settings[SETTINGS.PRAYER] = settings[SETTINGS.MAGIC_PRAYER];
        settings[SETTINGS.NECKLACE] = settings[SETTINGS.MAGIC_NECKLACE];
        settings[SETTINGS.CAPE] = settings[SETTINGS.MAGIC_CAPE];
        settings[SETTINGS.RING] = settings[SETTINGS.MAGIC_RING];
        settings[SETTINGS.POCKET] = settings[SETTINGS.MAGIC_POCKET];
        settings[SETTINGS.AMMO] = settings[SETTINGS.MAGIC_AMMO_SLOT];
    } else if (effectiveStyle == 'ranged') {
        settings[SETTINGS.MH] = settings[SETTINGS.RANGED_MH];
        settings[SETTINGS.OH] = settings[SETTINGS.RANGED_OH];
        settings[SETTINGS.TH] = settings[SETTINGS.RANGED_TH];
        settings[SETTINGS.HELMET] = settings[SETTINGS.RANGED_HELMET];
        settings[SETTINGS.BODY] = settings[SETTINGS.RANGED_BODY];
        settings[SETTINGS.LEGS] = settings[SETTINGS.RANGED_LEGS];
        settings[SETTINGS.GLOVES] = settings[SETTINGS.RANGED_GLOVES];
        settings[SETTINGS.BOOTS] = settings[SETTINGS.RANGED_BOOTS];
        settings[SETTINGS.PRAYER] = settings[SETTINGS.RANGED_PRAYER];
        settings[SETTINGS.NECKLACE] = settings[SETTINGS.RANGED_NECKLACE];
        settings[SETTINGS.CAPE] = settings[SETTINGS.RANGED_CAPE];
        settings[SETTINGS.RING] = settings[SETTINGS.RANGED_RING];
        settings[SETTINGS.POCKET] = settings[SETTINGS.RANGED_POCKET];
        settings[SETTINGS.AMMO] = settings[SETTINGS.RANGED_AMMO_SLOT];
    } else if (effectiveStyle == 'melee') {
        settings[SETTINGS.MH] = settings[SETTINGS.MELEE_MH];
        settings[SETTINGS.OH] = settings[SETTINGS.MELEE_OH];
        settings[SETTINGS.TH] = settings[SETTINGS.MELEE_TH];
        settings[SETTINGS.HELMET] = settings[SETTINGS.MELEE_HELMET];
        settings[SETTINGS.BODY] = settings[SETTINGS.MELEE_BODY];
        settings[SETTINGS.LEGS] = settings[SETTINGS.MELEE_LEGS];
        settings[SETTINGS.GLOVES] = settings[SETTINGS.MELEE_GLOVES];
        settings[SETTINGS.BOOTS] = settings[SETTINGS.MELEE_BOOTS];
        settings[SETTINGS.PRAYER] = settings[SETTINGS.MELEE_PRAYER];
        settings[SETTINGS.NECKLACE] = settings[SETTINGS.MELEE_NECKLACE];
        settings[SETTINGS.CAPE] = settings[SETTINGS.MELEE_CAPE];
        settings[SETTINGS.RING] = settings[SETTINGS.MELEE_RING];
        settings[SETTINGS.POCKET] = settings[SETTINGS.MELEE_POCKET];
        settings[SETTINGS.AMMO] = settings[SETTINGS.MELEE_AMMO_SLOT];
    } else if (effectiveStyle == 'necromancy') {
        settings[SETTINGS.MH] = settings[SETTINGS.NECRO_MH];
        settings[SETTINGS.OH] = settings[SETTINGS.NECRO_OH];
        settings[SETTINGS.TH] = settings[SETTINGS.NECRO_TH];
        settings[SETTINGS.HELMET] = settings[SETTINGS.NECRO_HELMET];
        settings[SETTINGS.BODY] = settings[SETTINGS.NECRO_BODY];
        settings[SETTINGS.LEGS] = settings[SETTINGS.NECRO_LEGS];
        settings[SETTINGS.GLOVES] = settings[SETTINGS.NECRO_GLOVES];
        settings[SETTINGS.BOOTS] = settings[SETTINGS.NECRO_BOOTS];
        settings[SETTINGS.PRAYER] = settings[SETTINGS.NECRO_PRAYER];
        settings[SETTINGS.NECKLACE] = settings[SETTINGS.NECRO_NECKLACE];
        settings[SETTINGS.CAPE] = settings[SETTINGS.NECRO_CAPE];
        settings[SETTINGS.RING] = settings[SETTINGS.NECRO_RING];
        settings[SETTINGS.POCKET] = settings[SETTINGS.NECRO_POCKET];
        settings[SETTINGS.AMMO] = settings[SETTINGS.NECRO_AMMO_SLOT];
    }

    const weaponModeByStyle = {
        magic: SETTINGS.WEAPON_TYPE_MAGE,
        ranged: SETTINGS.WEAPON_TYPE_RANGED,
        melee: SETTINGS.WEAPON_TYPE_MELEE,
        necromancy: SETTINGS.WEAPON_TYPE_NECRO,
    };
    const weaponKeysByStyle = {
        magic: { mh: SETTINGS.MAGIC_MH, th: SETTINGS.MAGIC_TH },
        ranged: { mh: SETTINGS.RANGED_MH, th: SETTINGS.RANGED_TH },
        melee: { mh: SETTINGS.MELEE_MH, th: SETTINGS.MELEE_TH },
        necromancy: { mh: SETTINGS.NECRO_MH, th: SETTINGS.NECRO_TH },
    };
    const styleWeaponKeys = weaponKeysByStyle[effectiveStyle];
    const isEquipped = (value) => value != null && value !== 'none';
    const isTwoHand = (value) => weapons[value]?.['weapon type'] === 'two-hand';

    if (settings[weaponModeByStyle[effectiveStyle]] === SETTINGS.WEAPON_VALUES.TH && styleWeaponKeys) {
        const styleMh = settings[styleWeaponKeys.mh];
        const styleTh = settings[styleWeaponKeys.th];
        const preferredTh = (isTwoHand(styleMh) && !isCustomEquipment(styleMh)) || !isEquipped(styleTh) ? styleMh : styleTh;
        if (isEquipped(preferredTh)) {
            settings[SETTINGS.TH] = preferredTh;
            settings[SETTINGS.MH] = preferredTh;
        }
    }

    // Derive weapon type from the equipped MH weapon
    const mhWeapon = weapons[settings[SETTINGS.MH]];
    if (mhWeapon && mhWeapon['weapon type'] === 'two-hand') {
        settings[SETTINGS.WEAPON] = SETTINGS.WEAPON_VALUES.TH;
        settings[SETTINGS.TH] = settings[SETTINGS.MH];
    } else {
        settings[SETTINGS.WEAPON] = SETTINGS.WEAPON_VALUES.DW;
    }

    // Resolve perks from equipped gear if _gearPerks map is present
    const gearPerks = settings['_gearPerks'];
    if (gearPerks) {
        const rawGearInstances = settings['_gearInstances'] || {};
        // Map style-specific instance keys to generic keys
        const gearInstances = { ...rawGearInstances };
        if (effectiveStyle == 'magic') {
            if (rawGearInstances[SETTINGS.MAGIC_MH]) gearInstances[SETTINGS.MH] = rawGearInstances[SETTINGS.MAGIC_MH];
            if (rawGearInstances[SETTINGS.MAGIC_OH]) gearInstances[SETTINGS.OH] = rawGearInstances[SETTINGS.MAGIC_OH];
            if (rawGearInstances[SETTINGS.MAGIC_BODY]) gearInstances[SETTINGS.BODY] = rawGearInstances[SETTINGS.MAGIC_BODY];
            if (rawGearInstances[SETTINGS.MAGIC_LEGS]) gearInstances[SETTINGS.LEGS] = rawGearInstances[SETTINGS.MAGIC_LEGS];
        } else if (effectiveStyle == 'ranged') {
            if (rawGearInstances[SETTINGS.RANGED_MH]) gearInstances[SETTINGS.MH] = rawGearInstances[SETTINGS.RANGED_MH];
            if (rawGearInstances[SETTINGS.RANGED_OH]) gearInstances[SETTINGS.OH] = rawGearInstances[SETTINGS.RANGED_OH];
            if (rawGearInstances[SETTINGS.RANGED_BODY]) gearInstances[SETTINGS.BODY] = rawGearInstances[SETTINGS.RANGED_BODY];
            if (rawGearInstances[SETTINGS.RANGED_LEGS]) gearInstances[SETTINGS.LEGS] = rawGearInstances[SETTINGS.RANGED_LEGS];
        } else if (effectiveStyle == 'melee') {
            if (rawGearInstances[SETTINGS.MELEE_MH]) gearInstances[SETTINGS.MH] = rawGearInstances[SETTINGS.MELEE_MH];
            if (rawGearInstances[SETTINGS.MELEE_OH]) gearInstances[SETTINGS.OH] = rawGearInstances[SETTINGS.MELEE_OH];
            if (rawGearInstances[SETTINGS.MELEE_BODY]) gearInstances[SETTINGS.BODY] = rawGearInstances[SETTINGS.MELEE_BODY];
            if (rawGearInstances[SETTINGS.MELEE_LEGS]) gearInstances[SETTINGS.LEGS] = rawGearInstances[SETTINGS.MELEE_LEGS];
        } else if (effectiveStyle == 'necromancy') {
            if (rawGearInstances[SETTINGS.NECRO_MH]) gearInstances[SETTINGS.MH] = rawGearInstances[SETTINGS.NECRO_MH];
            if (rawGearInstances[SETTINGS.NECRO_OH]) gearInstances[SETTINGS.OH] = rawGearInstances[SETTINGS.NECRO_OH];
            if (rawGearInstances[SETTINGS.NECRO_BODY]) gearInstances[SETTINGS.BODY] = rawGearInstances[SETTINGS.NECRO_BODY];
            if (rawGearInstances[SETTINGS.NECRO_LEGS]) gearInstances[SETTINGS.LEGS] = rawGearInstances[SETTINGS.NECRO_LEGS];
        }
        // Only MH, OH, body, and legs can have perks (gizmo slots)
        const equippedSlots = [
            { item: settings[SETTINGS.MH], key: SETTINGS.MH },
            { item: settings[SETTINGS.OH], key: SETTINGS.OH },
            { item: settings[SETTINGS.BODY], key: SETTINGS.BODY },
            { item: settings[SETTINGS.LEGS], key: SETTINGS.LEGS },
        ];
        const perkLists = [];
        for (const { item, key } of equippedSlots) {
            if (!item) continue;
            // Check if a specific instance was selected for this slot
            const instanceInfo = gearInstances[key];
            if (instanceInfo && instanceInfo.itemKey === item && gearPerks[`${item}#${instanceInfo.instanceIndex}`]) {
                perkLists.push(gearPerks[`${item}#${instanceInfo.instanceIndex}`]);
            } else if (gearPerks[item]) {
                perkLists.push(gearPerks[item]);
            }
        }
        const activePerks = collectActivePerks(perkLists);
        applyPerksToSettings(settings, activePerks);
    }

    return settings;
}

// Only export functions actually used by the rotation builder
export { style_specific_unification, calc_base_ad };
