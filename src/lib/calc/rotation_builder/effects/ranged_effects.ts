/**
 * Ranged-specific damage calculation effects
 */
import { ABILITIES, abils } from '$lib/data/abilities';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { weapons } from '$lib/data/weapons'
import { SETTINGS } from '../../settings_rb';
import { DamageDistribution } from '../../types';
import { EffectContext, BoostedADResult, StyleEffects } from './types';
import { handle_wen_buff } from '../rotation_damage_helper';
import { addAdrenaline } from '../calculation_utils';
import { settingsActions } from '$lib/stores';

/**
 * Check if Icy Precision should be Activated and handle it
 * Called during on_cast phase for ranged abilities
 */
export function handleWenBuffActivation(
    settings: Record<string, any>,
    timers: Record<string, number>,
    abilityKey: ABILITIES
): void {
    if (abils[abilityKey]?.mainStyle !== 'ranged') {
        return;
    }

    const isEligibleAbilityType = ['threshold', 'special attack', 'ultimate'].includes(
        abils[abilityKey]?.abilityType
    );

    const hasWenArrows = settings[SETTINGS.AMMO] === ARMOUR.WEN_ARROWS;
    const isTwoHand = settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH;
    const notOnIcyPrecision = !timers[SETTINGS.ICY_PRECISION] || timers[SETTINGS.ICY_PRECISION] < 0;
    const hasMaxStacks = settings[SETTINGS.ICY_CHILL_STACKS] >= 10;

    // Abilities that don't consume Wen buff
    const excludedAbilities: ABILITIES[] = [
        ABILITIES.GREATER_DEATHS_SWIFTNESS,
        ABILITIES.SPLIT_SOUL_ECB,
        ABILITIES.DEATHS_SWIFTNESS,
        ABILITIES.IMBUE_SHADOWS
    ];

    if (
        hasWenArrows &&
        isEligibleAbilityType &&
        isTwoHand &&
        notOnIcyPrecision &&
        hasMaxStacks &&
        !excludedAbilities.includes(abilityKey)
    ) {
        handle_wen_buff(settings, timers);
    }
}

/**
 * Apply ranged weapon effects that modify boosted AD
 */
function applyBoostedADEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    baseDamage: number
): BoostedADResult {
    const { settings, abilityKey } = ctx;
    let applied = false;

    // Hexhunter bow
    if (
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        settings[SETTINGS.TH] === WEAPONS.HEXHUNTER_BOW
    ) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.125);
        applied = true;
    }
    // Hexhunter bow upgraded
    else if (
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH &&
        settings[SETTINGS.TH] === WEAPONS.HEXHUNTER_BOW_PLUS
    ) {
        distribution['boosted AD'] = Math.floor(distribution['boosted AD'] * 1.175);
        applied = true;
    }

    // Icy precision (Wen arrows) - flat +25% base damage
    if (
        ['threshold', 'ultimate', 'special attack'].includes(abils[abilityKey]?.abilityType) &&
        settings[SETTINGS.AMMO] === ARMOUR.WEN_ARROWS &&
        settings[SETTINGS.ICY_PRECISION] > 0
    ) {
        distribution['boosted AD'] = Math.floor(
            distribution['boosted AD'] * 1.3
        );
        applied = true;
    }

    // Balance by Force activation (BoLG spec)
    if (abilityKey === ABILITIES.BALANCE_BY_FORCE) {
        settings[SETTINGS.BALANCE_BY_FORCE] = true;
    }

    return { applied };
}

/**
 * Apply ranged ability-specific effects
 */
function applyAbilitySpecificEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

}

/**
 * Apply ranged ability percent modifiers (before conversion to damage values)
 */
function applyAbilityPercentModifiers(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // Flanking - Binding Shot (basic stun)
    if (settings[SETTINGS.FLANKING] > 0) {
        if (abilityKey === ABILITIES.BINDING_SHOT) {
            distribution.minHit += distribution.minHit * 0.4 * settings[SETTINGS.FLANKING];
            distribution.varHit += distribution.varHit * 0.4 * settings[SETTINGS.FLANKING];
        }
    }
}

/**
 * Apply ranged effects that modify min/var hit
 */
function applyMinVarEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // OG bane ammo (bane bolts/arrows)
    if (settings[SETTINGS.AMMO] === 'bane bolts' || settings[SETTINGS.AMMO] === 'bane arrows') {
        if (abilityKey === ABILITIES.RANGED_AUTO) {
            distribution.minHit = Math.floor(distribution.minHit * 1.4);
            distribution.varHit = Math.floor(distribution.varHit * 1.4);
        } else {
            distribution.minHit = Math.floor(distribution.minHit * 1.25);
            distribution.varHit = Math.floor(distribution.varHit * 1.25);
        }
    }

    // Jas arrows bane effect
    if (settings[SETTINGS.AMMO] === ARMOUR.JAS_ARROWS) {
        distribution.minHit = Math.floor(distribution.minHit * 1.3);
        distribution.varHit = Math.floor(distribution.varHit * 1.3);
    }

    // Ful arrows effect
    if (settings[SETTINGS.AMMO] === ARMOUR.FUL_ARROWS) {
        distribution.minHit = Math.floor(distribution.minHit * 1.15);
        distribution.varHit = Math.floor(distribution.varHit * 1.15);
}

    // enchanted bolts (proc based, will come later)
    // sirenic set effect (proc based, will come later)
    // gemstone armour effect (proc based, will come later)

    // Pernix quiver (low HP bonus)
    if (
        settings[SETTINGS.QUIVER] === true &&
        settings[SETTINGS.TARGET_HP_PERCENT] <= 25
    ) {
        distribution.varHit = Math.floor(
            distribution.varHit + 0.04 * (distribution.minHit + distribution.varHit)
        );
    }
}

/**
 * Apply ranged multiplicative effects
 */
function applyMultiplicativeEffects(
    ctx: EffectContext,
    distribution: DamageDistribution,
    boost: number
): number {
    const { settings } = ctx;

    // Death's Swiftness
    if (settings[SETTINGS.DEATH_SWIFTNESS] === true) {
        boost = Math.floor(boost * 1.5);
    }

    return boost;
}

/**
 * Handle ranged stack effects
 */
function applyStackEffects(ctx: EffectContext): void {
    const { settings, abilityKey } = ctx;

    // Icy chill stacks (Wen arrows) - only on basic abilities
    if (
        settings[SETTINGS.AMMO] === ARMOUR.WEN_ARROWS &&
        abils[abilityKey]?.abilityType === 'basic' &&
        abils[abilityKey]?.mainStyle === 'ranged' &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        settings[SETTINGS.ICY_CHILL_STACKS] = Math.min(
            (settings[SETTINGS.ICY_CHILL_STACKS] || 0) + 1,
            10
        );
    }
    // Rapid Fire extends Searing Winds by 1 tick per hit
    if (
        (abilityKey === ABILITIES.RAPID_FIRE_HIT || abilityKey === ABILITIES.RAPID_FIRE_LAST_HIT) &&
        settings[SETTINGS.SEARING_WINDS] === true &&
        ctx.timers
    ) {
        ctx.timers[SETTINGS.SEARING_WINDS] += 1;
    }

    // Shadow Imbued (Imbue Shadows buff) - each ranged hit generates 5% adrenaline
    if (settings[SETTINGS.SHADOW_IMBUED] === true && abils[abilityKey]?.mainStyle === 'ranged' &&
        abils[abilityKey]?.abilityClassification !== 'perk'
    ) {
        addAdrenaline(settings, 5)
    }

    // Bik stacks (Bik arrows)
    if (
        settings[SETTINGS.AMMO] === ARMOUR.BIK_ARROWS &&
        settings[SETTINGS.WEAPON] === SETTINGS.WEAPON_VALUES.TH
    ) {
        settings[SETTINGS.BIK_STACKS] = Math.min(
            (settings[SETTINGS.BIK_STACKS] || 0) + 1,
            150
        );
    }

    // Deathspore arrows - gain Feasting Spores stacks on ranged hits (not during cooldown)
    if (
        settings[SETTINGS.AMMO] === ARMOUR.DEATHSPORE_ARROWS &&
        abils[abilityKey]?.mainStyle === 'ranged' &&
        !(settings[SETTINGS.DEATHSPORE_COOLDOWN] > 0)
    ) {
        settings[SETTINGS.DEATHSPORE_STACKS] = Math.min(
            (settings[SETTINGS.DEATHSPORE_STACKS] || 0) + 1,
            12
        );

        // At 12 stacks, consume and activate buff
        if (settings[SETTINGS.DEATHSPORE_STACKS] >= 12) {
            settings[SETTINGS.DEATHSPORE_STACKS] = 0;
            settings[SETTINGS.DEATHSPORE_BUFF] = true;
            settings[SETTINGS.DEATHSPORE_COOLDOWN] = 50;
            if (ctx.timers) {
                ctx.timers[SETTINGS.DEATHSPORE_BUFF] = 15;
                ctx.timers[SETTINGS.DEATHSPORE_COOLDOWN] = 50;
            }
        }
    }

    // Hydrix bakriminel bolts - Deathmark effect (10% proc chance per hit)
    // Grants 10% adrenaline on proc + 1% extra adrenaline from basics for 25 ticks (15s)
    // Cannot proc from Corruption Shot. Refreshes on subsequent procs.
    if (
        settings[SETTINGS.AMMO] === ARMOUR.HYDRIX_BAKRIMINEL_BOLTS_E &&
        abils[abilityKey]?.mainStyle === 'ranged' &&
        abilityKey !== ABILITIES.CORRUPTION_SHOT &&
        !isCorruptionShotHit(abilityKey)
    ) {
        if (settings[SETTINGS.EXPECTED_ADRENALINE]) {
            // Expected value: 10% chance × 10% adrenaline = 1% per hit
            addAdrenaline(settings, 1);
            // Deathmark is treated as always active in expected mode (high uptime with procs per hit)
            if (ctx.timers) {
                ctx.timers[SETTINGS.DEATHMARK] = 25;
            }
            settings[SETTINGS.DEATHMARK] = true;
        } else {
            // TODO: discrete proc simulation for non-expected mode
        }
    }
}

/** Check if an ability key is a Corruption Shot hit (the DoT ticks) */
function isCorruptionShotHit(abilityKey: ABILITIES): boolean {
    return abilityKey === ABILITIES.CORRUPTION_SHOT_HIT_1 ||
        abilityKey === ABILITIES.CORRUPTION_SHOT_HIT_2 ||
        abilityKey === ABILITIES.CORRUPTION_SHOT_HIT_3 ||
        abilityKey === ABILITIES.CORRUPTION_SHOT_HIT_4 ||
        abilityKey === ABILITIES.CORRUPTION_SHOT_HIT_5;
}

/**
 * Apply ranged bonus damage effects
 */
function applyBonusDamageEffects(
    ctx: EffectContext,
    distribution: DamageDistribution
): void {
    const { settings, abilityKey } = ctx;

    // Caroming - +4% ability damage per rank to all Ricochet/Greater Ricochet hits
    const ricochetAbilities: ABILITIES[] = [
        ABILITIES.RICOCHET, ABILITIES.GREATER_RICOCHET,
        ABILITIES.GREATER_RICOCHET_1, ABILITIES.GREATER_RICOCHET_2, ABILITIES.GREATER_RICOCHET_3
    ];
    if (settings[SETTINGS.CAROMING] > 0 && ricochetAbilities.includes(abilityKey)) {
        const caromingBoost = 0.04 * settings[SETTINGS.CAROMING];
        distribution.minHit += Math.floor(settings[SETTINGS.ABILITY_DAMAGE] * caromingBoost);
    }

    // Searing Winds (Galeshot buff) - adds 20% of ability damage as flat bonus to each hit
    if (settings[SETTINGS.SEARING_WINDS] === true && abilityKey != ABILITIES.GALESHOT) {
        const bonus = Math.floor(settings[SETTINGS.ABILITY_DAMAGE] * 0.2);
        distribution.minHit += bonus;
    }
}

export const rangedEffects: StyleEffects = {
    applyBoostedADEffects,
    applyAbilitySpecificEffects,
    applyAbilityPercentModifiers,
    applyMinVarEffects,
    applyMultiplicativeEffects,
    applyStackEffects,
    applyBonusDamageEffects
};
