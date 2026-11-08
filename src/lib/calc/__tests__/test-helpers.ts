/**
 * Test Helpers for Damage Calculation Tests
 *
 * Provides common fixtures, settings configurations, and utility functions
 * for testing damage calculations across different scenarios.
 */

import { SETTINGS } from '../settings_rb';
import { ARMOUR } from '$lib/data/armour';

/**
 * Creates a base settings object with sensible defaults for testing.
 * All values are set to typical mid-game levels.
 *
 * Important: The damage calculation requires at minimum:
 * - ABILITY_DAMAGE: base ability damage value
 * - HIT_CHANCE: accuracy percentage (0-100)
 *
 * Note: USE_RAW_ABILITY_DAMAGE is set to skip recalculating AD from equipment,
 * allowing tests to use the pre-set ABILITY_DAMAGE value directly.
 */
export function createBaseSettings(overrides: Record<string, any> = {}): Record<string, any> {
    return {
        // Core stats - REQUIRED
        [SETTINGS.ABILITY_DAMAGE]: 1500,
        [SETTINGS.HIT_CHANCE]: 100,  // Required for damage calculation
        [SETTINGS.USE_RAW_ABILITY_DAMAGE]: true, // Skip recalculating AD from equipment

        // Crit settings
        [SETTINGS.CUSTOM_CRIT]: 0,
        [SETTINGS.CRIT_BUFF]: false,

        // Levels
        [SETTINGS.STRENGTH_LEVEL]: 99,
        [SETTINGS.RANGED_LEVEL]: 99,
        [SETTINGS.MAGIC_LEVEL]: 99,
        [SETTINGS.NECROMANCY_LEVEL]: 120,

        // Prayers - default to no prayer
        [SETTINGS.MELEE_PRAYER]: SETTINGS.MELEE_PRAYER_VALUES.NONE,
        [SETTINGS.RANGED_PRAYER]: SETTINGS.RANGED_PRAYER_VALUES.NONE,
        [SETTINGS.MAGIC_PRAYER]: SETTINGS.MAGIC_PRAYER_VALUES.NONE,
        [SETTINGS.NECRO_PRAYER]: SETTINGS.NECRO_PRAYER_VALUES.NONE,

        // Auras - default to none
        [SETTINGS.AURA]: SETTINGS.AURA_VALUES.NONE,

        // Perks - default to none
        [SETTINGS.PRECISE]: 0,
        [SETTINGS.BITING]: 0,
        [SETTINGS.FLANKING]: 0,
        [SETTINGS.LUNGING]: 0,
        [SETTINGS.ULTIMATUMS]: 0,
        [SETTINGS.ERUPTIVE]: 0,
        [SETTINGS.EQ_PERK]: 0,

        // Buffs - all off by default
        [SETTINGS.BERSERK]: false,
        [SETTINGS.SUNSHINE]: false,
        [SETTINGS.DEATH_SWIFTNESS]: false,
        [SETTINGS.LIVING_DEATH]: false,

        // Target settings
        [SETTINGS.VULN]: SETTINGS.VULN_VALUES.NONE,
        [SETTINGS.SLAYER_HELM]: SETTINGS.SLAYER_HELM_VALUES.NONE,

        // Weapon/gear settings - use two-hand custom weapons for simplicity
        [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_MAGIC]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_RANGED]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_NECRO]: SETTINGS.WEAPON_VALUES.DW,
        [SETTINGS.TH]: 'custom two-hand weapon',
        [SETTINGS.MH]: 'custom main-hand weapon',
        [SETTINGS.OH]: 'custom off-hand weapon',
        [SETTINGS.MELEE_TH]: 'custom two-hand weapon',
        [SETTINGS.MELEE_MH]: 'custom main-hand weapon',
        [SETTINGS.MELEE_OH]: 'custom off-hand weapon',
        [SETTINGS.RANGED_TH]: 'custom two-hand weapon',
        [SETTINGS.RANGED_MH]: 'custom main-hand weapon',
        [SETTINGS.RANGED_OH]: 'custom off-hand weapon',
        [SETTINGS.MAGIC_TH]: 'custom two-hand weapon',
        [SETTINGS.MAGIC_MH]: 'custom main-hand weapon',
        [SETTINGS.MAGIC_OH]: 'custom off-hand weapon',
        [SETTINGS.NECRO_MH]: 'custom main-hand weapon',
        [SETTINGS.NECRO_OH]: 'custom off-hand weapon',
        // Equipment slots
        [SETTINGS.HELMET]: 'none',
        [SETTINGS.BODY]: 'none',
        [SETTINGS.LEGS]: 'none',
        [SETTINGS.BOOTS]: 'none',
        [SETTINGS.GLOVES]: 'none',
        [SETTINGS.CAPE]: 'none',
        [SETTINGS.NECKLACE]: 'none',
        [SETTINGS.POCKET]: 'none',
        [SETTINGS.RING]: 'none',
        [SETTINGS.AMMO]: 'none',
        [SETTINGS.MELEE_POCKET]: 'none',
        [SETTINGS.RANGED_POCKET]: 'none',
        [SETTINGS.MAGIC_POCKET]: 'none',
        [SETTINGS.NECRO_POCKET]: 'none',
        [SETTINGS.MELEE_AMMO_SLOT]: 'none',
        [SETTINGS.RANGED_AMMO_SLOT]: 'none',
        [SETTINGS.MAGIC_AMMO_SLOT]: 'none',
        [SETTINGS.NECRO_AMMO_SLOT]: 'none',
        // Style-specific equipment (for style_specific_unification)
        [SETTINGS.MELEE_HELMET]: 'none',
        [SETTINGS.MELEE_BODY]: 'none',
        [SETTINGS.MELEE_LEGS]: 'none',
        [SETTINGS.MELEE_BOOTS]: 'none',
        [SETTINGS.MELEE_GLOVES]: 'none',
        [SETTINGS.RANGED_HELMET]: 'none',
        [SETTINGS.RANGED_BODY]: 'none',
        [SETTINGS.RANGED_LEGS]: 'none',
        [SETTINGS.RANGED_BOOTS]: 'none',
        [SETTINGS.RANGED_GLOVES]: 'none',
        [SETTINGS.MAGIC_HELMET]: 'none',
        [SETTINGS.MAGIC_BODY]: 'none',
        [SETTINGS.MAGIC_LEGS]: 'none',
        [SETTINGS.MAGIC_BOOTS]: 'none',
        [SETTINGS.MAGIC_GLOVES]: 'none',
        [SETTINGS.NECRO_HELMET]: 'none',
        [SETTINGS.NECRO_BODY]: 'none',
        [SETTINGS.NECRO_LEGS]: 'none',
        [SETTINGS.NECRO_BOOTS]: 'none',
        [SETTINGS.NECRO_GLOVES]: 'none',

        // Other commonly used settings
        [SETTINGS.REAPER_CREW]: false,
        [SETTINGS.BERSERKERS_FURY]: 0,
        [SETTINGS.NECROSIS_STACKS]: 0,
        [SETTINGS.PERFECT_EQUILIBRIUM_STACKS]: 0,
        [SETTINGS.RUTHLESS_STACKS]: 0,
        [SETTINGS.RUTHLESS_RANK]: 0,
        [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MEAN,
        [SETTINGS.DAMAGE_PER_UNIT_DIVIDER]: 1,
        [SETTINGS.CHAIN_MODIFIER]: SETTINGS.CHAIN_MODIFIER_VALUES.NONE,

        // Additional settings that damage calc expects
        [SETTINGS.REVENGE]: 0,
        [SETTINGS.SMOKE_CLOUD]: false,
        [SETTINGS.RUBY_AURORA]: 0,
        [SETTINGS.STONE_OF_JAS]: 0,
        [SETTINGS.GENOCIDAL]: 0,
        [SETTINGS.NOPE]: 0,
        [SETTINGS.TARGET_HP_PERCENT]: 100,
        [SETTINGS.BLOOD_TITHE]: 0,
        [SETTINGS.GLACIAL_EMBRACE]: 0,
        [SETTINGS.HAUNTED]: false,
        [SETTINGS.ADRENALINE]: 0,
        [SETTINGS.SPLIT_SOUL]: false,

        // Settings used in on-hit effects calculation (damage_calc_new.ts)
        [SETTINGS.GRAVITATE]: 0,           // Line 576 - melee additive boost
        [SETTINGS.PRAYER]: 'none melee',   // General prayer setting for multiplicative buffs
        [SETTINGS.GUARDHOUSE]: SETTINGS.GUARDHOUSE_VALUES?.NONE || 'none', // Fort forinthry effect
        [SETTINGS.FAMILIAR]: SETTINGS.FAMILIAR_VALUES?.NONE || 'none',     // Familiar/ripper demon
        [SETTINGS.DRACONIC_FRUIT]: false,  // Line 522 - additive boost
        [SETTINGS.DIVINE_RAGE]: false,     // Line 617 - magic multiplier
        [SETTINGS.BLACKHOLE]: false,       // Line 653 - ZGS melee multiplier
        [SETTINGS.RAMPAGE]: false,         // Line 658 - dragon battleaxe multiplier
        [SETTINGS.FROSTBLADES]: false,     // Line 817 - leng weapon bonus damage
        [SETTINGS.SWIFTNESS_OF_THE_AVIANSIE]: false, // Line 781 - aviansie pve buff

        // Magic crit chance settings (rota_object_helper.ts calc_crit_chance)
        [SETTINGS.CONCENTRATED_BLAST_STACKS]: 0,  // Line 146 - magic crit boost
        [SETTINGS.CHANNELLER_RING_STACKS]: 0,      // Line 142 - channeller ring crit stacks

        // Melee crit chance settings
        [SETTINGS.FURY_BUFF]: SETTINGS.FURY_BUFF_VALUES?.NONE || 'none', // Line 182-188

        // Ranged crit chance settings
        [SETTINGS.DRACOLICH_INFUSION]: false,         // Line 223-224
        [SETTINGS.GREATER_DRACOLICH_INFUSION]: false, // Line 221-222

        // Necromancy settings
        [SETTINGS.RESIDUAL_SOULS]: 0,                 // Volley of Souls total hits (min 2 required)

        // Magic multihit settings
        [SETTINGS.RUIN]: 0,                           // Combust extra hits

        // Melee bloodlust stacks
        [SETTINGS.BLOODLUST_STACKS]: 0,

        // CSM update settings
        [SETTINGS.METEOR_STRIKE_BUFF]: false,
        [SETTINGS.VESTMENTS_REGEN]: false,
        [SETTINGS.FLAMEBOUND_RIVAL]: false,
        [SETTINGS.ATTACK_LEVEL]: 99,
        [SETTINGS.PLAYER_HP_PERCENT]: 100,
        [SETTINGS.CHAOS_ROAR]: false,
        [SETTINGS.NATURAL_INSTINCT]: false,
        [SETTINGS.SEARING_WINDS]: false,
        [SETTINGS.SHADOW_IMBUED]: false,
        [SETTINGS.INSTABILITY]: false,
        [SETTINGS.KALG_SPEC]: false,
        [SETTINGS.ECLIPSED_SOUL]: false,
        [SETTINGS.LVL20ARMOUR]: false,
        [SETTINGS.IMPATIENT]: 0,
        [SETTINGS.EXPECTED_ADRENALINE]: false,
        [SETTINGS.DEATHMARK]: false,
        [SETTINGS.CAP_ADRENALINE]: true,
        [SETTINGS.HEIGHTENED_SENSES]: false,
        [SETTINGS.VIGOUR]: false,
        [SETTINGS.FURY_OF_THE_SMALL]: false,
        [SETTINGS.CONSERVATION_OF_ENERGY]: false,
        [SETTINGS.INFERNAL_PUZZLE_BOX]: 0,
        [SETTINGS.ICY_CHILL_STACKS]: 0,
        [SETTINGS.ICY_PRECISION]: 0,
        [SETTINGS.ESSENCE_CORRUPTION]: 0,
        [SETTINGS.DEATH_SPARK_STACKS]: 0,
        [SETTINGS.SOUL_REAVE_STACKS]: 0,
        [SETTINGS.DEATHSPORE_BUFF]: false,
        [SETTINGS.DEATHSPORE_COOLDOWN]: 0,

        // Apply any overrides
        ...overrides
    };
}

/**
 * Creates settings for melee combat style
 * Note: Combat style is determined by the ability's 'main style' property, not settings
 */
export function createMeleeSettings(overrides: Record<string, any> = {}): Record<string, any> {
    return createBaseSettings({
        [SETTINGS.ABILITY_DAMAGE]: 1800,
        [SETTINGS.MELEE_PRAYER]: SETTINGS.MELEE_PRAYER_VALUES.NONE,
        ...overrides
    });
}

/**
 * Creates settings for ranged combat style
 */
export function createRangedSettings(overrides: Record<string, any> = {}): Record<string, any> {
    return createBaseSettings({
        [SETTINGS.ABILITY_DAMAGE]: 1750,
        [SETTINGS.RANGED_PRAYER]: SETTINGS.RANGED_PRAYER_VALUES.NONE,
        ...overrides
    });
}

/**
 * Creates settings for magic combat style
 */
export function createMagicSettings(overrides: Record<string, any> = {}): Record<string, any> {
    return createBaseSettings({
        [SETTINGS.ABILITY_DAMAGE]: 1700,
        [SETTINGS.MAGIC_PRAYER]: SETTINGS.MAGIC_PRAYER_VALUES.NONE,
        ...overrides
    });
}

/**
 * Creates settings for necromancy combat style
 */
export function createNecromancySettings(overrides: Record<string, any> = {}): Record<string, any> {
    return createBaseSettings({
        [SETTINGS.ABILITY_DAMAGE]: 1600,
        [SETTINGS.NECROMANCY_LEVEL]: 120,
        [SETTINGS.NECRO_PRAYER]: SETTINGS.NECRO_PRAYER_VALUES.NONE,
        ...overrides
    });
}

/**
 * Creates a minimal rotation input for testing single abilities
 */
export function createSingleAbilityRotation(ability: string, barSize: number = 20): {
    abilityBar: (string | null)[];
    extraActionBar: (any[] | null)[];
    nulledTicks: boolean[];
    stalledAbilities: (string | null)[];
} {
    return {
        abilityBar: [ability, ...Array(barSize - 1).fill(null)],
        extraActionBar: Array(barSize).fill(null),
        nulledTicks: Array(barSize).fill(false),
        stalledAbilities: Array(barSize).fill(null)
    };
}

/**
 * Creates a rotation input from an array of abilities
 */
export function createRotationFromAbilities(abilities: (string | null)[], barSize?: number): {
    abilityBar: (string | null)[];
    extraActionBar: (any[] | null)[];
    nulledTicks: boolean[];
    stalledAbilities: (string | null)[];
} {
    const size = barSize ?? Math.max(abilities.length + 10, 30);
    const paddedAbilities = [...abilities, ...Array(size - abilities.length).fill(null)];

    return {
        abilityBar: paddedAbilities,
        extraActionBar: Array(size).fill(null),
        nulledTicks: Array(size).fill(false),
        stalledAbilities: Array(size).fill(null)
    };
}

/**
 * Common melee abilities for testing
 */
export const MELEE_ABILITIES = {
    FURY: 'fury',
    ASSAULT: 'assault',
    GREATER_FURY: 'greater fury',
    QUICK_SMASH: 'quick smash',
    THE_FINAL_FLURRY: 'the final flurry',
    DISMEMBER: 'dismember',
    BERSERK: 'berserk',
    OVERPOWER: 'overpower',
    METEOR_STRIKE: 'meteor strike',
} as const;

/**
 * Common ranged abilities for testing
 */
export const RANGED_ABILITIES = {
    PIERCING_SHOT: 'piercing shot',
    BINDING_SHOT: 'binding shot',
    SNIPE: 'snipe',
    RAPID_FIRE: 'rapid fire',
    SNAP_SHOT: 'snap shot',
    BOMBARDMENT: 'bombardment',
    DEATHS_SWIFTNESS: 'death\'s swiftness',
    SHADOW_TENDRILS: 'shadow tendrils',
} as const;

/**
 * Common magic abilities for testing
 */
export const MAGIC_ABILITIES = {
    IMPACT: 'impact',
    DRAGON_BREATH: 'dragon breath',
    WILD_MAGIC: 'wild magic',
    ASPHYXIATE: 'asphyxiate',
    SUNSHINE: 'sunshine',
    OMNIPOWER: 'omnipower',
} as const;

/**
 * Assertion helper: checks that damage is within expected range
 */
export function expectDamageInRange(
    actual: number,
    expectedMin: number,
    expectedMax: number,
    message?: string
): void {
    const msg = message || `Expected damage ${actual} to be between ${expectedMin} and ${expectedMax}`;
    if (actual < expectedMin || actual > expectedMax) {
        throw new Error(msg);
    }
}

/**
 * Assertion helper: checks that damage is positive
 */
export function expectPositiveDamage(actual: number, abilityName?: string): void {
    if (actual <= 0) {
        throw new Error(`Expected positive damage for ${abilityName || 'ability'}, got ${actual}`);
    }
}

/**
 * Calculates the percentage difference between two values
 */
export function percentDifference(a: number, b: number): number {
    if (b === 0) return a === 0 ? 0 : Infinity;
    return Math.abs((a - b) / b) * 100;
}

/**
 * Settings presets for common buff scenarios
 */
export const BUFF_PRESETS = {
    BERSERK: {
        [SETTINGS.BERSERK]: true,
    },
    SUNSHINE: {
        [SETTINGS.SUNSHINE]: true,
    },
    DEATH_SWIFTNESS: {
        [SETTINGS.DEATH_SWIFTNESS]: true,
    },
    PRECISE_6: {
        [SETTINGS.PRECISE]: 6,
    },
    BITING_4: {
        [SETTINGS.BITING]: 4,
    },
    VULNERABILITY: {
        [SETTINGS.VULN]: SETTINGS.VULN_VALUES.VULNERABILITY,
    },
    SLAYER_HELM: {
        [SETTINGS.SLAYER_HELM]: SETTINGS.SLAYER_HELM_VALUES.FULL,
    },
} as const;

/**
 * Creates "blank" settings - minimal setup with no equipment bonuses.
 * Used for testing base damage calculations without any modifiers.
 *
 * @param level - Combat level to use (applies to all styles)
 * @param weaponTier - Weapon tier to use (default 1 = minimum)
 * @param overrides - Additional setting overrides
 */
export function createBlankSettings(
    level: number = 99,
    weaponTier: number = 1,
    overrides: Record<string, any> = {}
): Record<string, any> {
    return {
        // DO NOT use raw ability damage - calculate from gear
        [SETTINGS.USE_RAW_ABILITY_DAMAGE]: false,

        // Full hit chance
        [SETTINGS.HIT_CHANCE]: 100,

        // Levels - all set to the same value for simplicity
        [SETTINGS.STRENGTH_LEVEL]: level,
        [SETTINGS.RANGED_LEVEL]: level,
        [SETTINGS.MAGIC_LEVEL]: level,
        [SETTINGS.NECROMANCY_LEVEL]: level,

        // Weapon type - default to 2H for simplicity
        [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_MAGIC]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_RANGED]: SETTINGS.WEAPON_VALUES.TH,
        [SETTINGS.WEAPON_TYPE_NECRO]: SETTINGS.WEAPON_VALUES.DW,

        // Custom weapons with specified tier
        [SETTINGS.TH]: 'custom th',
        [SETTINGS.TH_TIER_CUSTOM]: weaponTier,
        [SETTINGS.MH]: 'custom',
        [SETTINGS.MH_TIER_CUSTOM]: weaponTier,
        [SETTINGS.OH]: 'custom oh',
        [SETTINGS.OH_TIER_CUSTOM]: weaponTier,

        // Style-specific weapons (for style_specific_unification)
        // When style uses TH, set MH to the TH weapon so unification detects 'two-hand'
        [SETTINGS.MELEE_TH]: 'custom th',
        [SETTINGS.MELEE_MH]: 'custom th',
        [SETTINGS.MELEE_OH]: 'custom oh',
        [SETTINGS.RANGED_TH]: 'custom th',
        [SETTINGS.RANGED_MH]: 'custom th',
        [SETTINGS.RANGED_OH]: 'custom oh',
        [SETTINGS.MAGIC_TH]: 'custom th',
        [SETTINGS.MAGIC_MH]: 'custom th',
        [SETTINGS.MAGIC_OH]: 'custom oh',
        [SETTINGS.NECRO_MH]: 'custom main-hand weapon',
        [SETTINGS.NECRO_OH]: 'custom oh',

        // All armour slots set to 'none' (0 strength bonus)
        [SETTINGS.HELMET]: 'none',
        [SETTINGS.BODY]: 'none',
        [SETTINGS.LEGS]: 'none',
        [SETTINGS.BOOTS]: 'none',
        [SETTINGS.GLOVES]: 'none',
        [SETTINGS.CAPE]: 'none',
        [SETTINGS.NECKLACE]: 'none',
        [SETTINGS.RING]: 'none',
        [SETTINGS.POCKET]: 'none',
        [SETTINGS.MELEE_POCKET]: 'none',
        [SETTINGS.RANGED_POCKET]: 'none',
        [SETTINGS.MAGIC_POCKET]: 'none',
        [SETTINGS.NECRO_POCKET]: 'none',

        // Style-specific armour (all 'none')
        [SETTINGS.MELEE_HELMET]: 'none',
        [SETTINGS.MELEE_BODY]: 'none',
        [SETTINGS.MELEE_LEGS]: 'none',
        [SETTINGS.MELEE_BOOTS]: 'none',
        [SETTINGS.MELEE_GLOVES]: 'none',
        [SETTINGS.RANGED_HELMET]: 'none',
        [SETTINGS.RANGED_BODY]: 'none',
        [SETTINGS.RANGED_LEGS]: 'none',
        [SETTINGS.RANGED_BOOTS]: 'none',
        [SETTINGS.RANGED_GLOVES]: 'none',
        [SETTINGS.MAGIC_HELMET]: 'none',
        [SETTINGS.MAGIC_BODY]: 'none',
        [SETTINGS.MAGIC_LEGS]: 'none',
        [SETTINGS.MAGIC_BOOTS]: 'none',
        [SETTINGS.MAGIC_GLOVES]: 'none',
        [SETTINGS.NECRO_HELMET]: 'none',
        [SETTINGS.NECRO_BODY]: 'none',
        [SETTINGS.NECRO_LEGS]: 'none',
        [SETTINGS.NECRO_BOOTS]: 'none',
        [SETTINGS.NECRO_GLOVES]: 'none',

        // No ammo (for ranged - use custom with high tier so it doesn't limit)
        [SETTINGS.AMMO]: ARMOUR.CUSTOM,
        [SETTINGS.MELEE_AMMO_SLOT]: 'none',
        [SETTINGS.RANGED_AMMO_SLOT]: ARMOUR.CUSTOM,
        [SETTINGS.MAGIC_AMMO_SLOT]: 'none',
        [SETTINGS.NECRO_AMMO_SLOT]: 'none',
        [SETTINGS.AMMO_TIER]: 999, // Won't limit weapon tier

        // All perks disabled
        [SETTINGS.PRECISE]: 0,
        [SETTINGS.BITING]: 0,
        [SETTINGS.FLANKING]: 0,
        [SETTINGS.LUNGING]: 0,
        [SETTINGS.ULTIMATUMS]: 0,
        [SETTINGS.CAROMING]: 0,
        [SETTINGS.AFTERSHOCK]: 0,
        [SETTINGS.ERUPTIVE]: 0,
        [SETTINGS.EQ_PERK]: 0,

        // All prayers disabled
        [SETTINGS.MELEE_PRAYER]: SETTINGS.MELEE_PRAYER_VALUES.NONE,
        [SETTINGS.RANGED_PRAYER]: SETTINGS.RANGED_PRAYER_VALUES.NONE,
        [SETTINGS.MAGIC_PRAYER]: SETTINGS.MAGIC_PRAYER_VALUES.NONE,
        [SETTINGS.NECRO_PRAYER]: SETTINGS.NECRO_PRAYER_VALUES.NONE,
        [SETTINGS.PRAYER]: 'none melee', // Generic prayer setting

        // No aura
        [SETTINGS.AURA]: SETTINGS.AURA_VALUES.NONE,

        // No buffs
        [SETTINGS.BERSERK]: false,
        [SETTINGS.SUNSHINE]: false,
        [SETTINGS.DEATH_SWIFTNESS]: false,
        [SETTINGS.LIVING_DEATH]: false,

        // No debuffs on target
        [SETTINGS.VULN]: SETTINGS.VULN_VALUES.NONE,
        [SETTINGS.SMOKE_CLOUD]: false,

        // No slayer/PvE effects
        [SETTINGS.SLAYER_HELM]: SETTINGS.SLAYER_HELM_VALUES.NONE,
        [SETTINGS.GENOCIDAL]: 0,
        [SETTINGS.GUARDHOUSE]: SETTINGS.GUARDHOUSE_VALUES?.NONE || 'none',

        // No other damage modifiers
        [SETTINGS.BERSERKERS_FURY]: 0,
        [SETTINGS.STONE_OF_JAS]: 0,
        [SETTINGS.REAPER_CREW]: false,
        [SETTINGS.INNATE_MASTERY]: false,

        // Crit settings (0 base crit for clean testing)
        [SETTINGS.CUSTOM_CRIT]: 0,
        [SETTINGS.CRIT_BUFF]: false,
        [SETTINGS.CONCENTRATED_BLAST_STACKS]: 0,
        [SETTINGS.CHANNELLER_RING_STACKS]: 0,
        [SETTINGS.FURY_BUFF]: SETTINGS.FURY_BUFF_VALUES?.NONE || 'none',
        [SETTINGS.DRACOLICH_INFUSION]: false,
        [SETTINGS.GREATER_DRACOLICH_INFUSION]: false,

        // Other required settings
        [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MEAN,
        [SETTINGS.DAMAGE_PER_UNIT_DIVIDER]: 1,
        [SETTINGS.CHAIN_MODIFIER]: SETTINGS.CHAIN_MODIFIER_VALUES.NONE,
        [SETTINGS.REVENGE]: 0,
        [SETTINGS.RUTHLESS_STACKS]: 0,
        [SETTINGS.RUTHLESS_RANK]: 0,
        [SETTINGS.RUBY_AURORA]: 0,
        [SETTINGS.NOPE]: 0,
        [SETTINGS.TARGET_HP_PERCENT]: 100,
        [SETTINGS.BLOOD_TITHE]: 0,
        [SETTINGS.GLACIAL_EMBRACE]: 0,
        [SETTINGS.HAUNTED]: false,
        [SETTINGS.ADRENALINE]: 0,
        [SETTINGS.SPLIT_SOUL]: false,
        [SETTINGS.GRAVITATE]: 0,
        [SETTINGS.FAMILIAR]: SETTINGS.FAMILIAR_VALUES?.NONE || 'none',
        [SETTINGS.DRACONIC_FRUIT]: false,
        [SETTINGS.DIVINE_RAGE]: false,
        [SETTINGS.BLACKHOLE]: false,
        [SETTINGS.RAMPAGE]: false,
        [SETTINGS.FROSTBLADES]: false,
        [SETTINGS.SWIFTNESS_OF_THE_AVIANSIE]: false,
        [SETTINGS.RESIDUAL_SOULS]: 0,
        [SETTINGS.NECROSIS_STACKS]: 0,
        [SETTINGS.PERFECT_EQUILIBRIUM_STACKS]: 0,
        [SETTINGS.RUIN]: 0,

        // CSM update settings
        [SETTINGS.METEOR_STRIKE_BUFF]: false,
        [SETTINGS.VESTMENTS_REGEN]: false,
        [SETTINGS.FLAMEBOUND_RIVAL]: false,
        [SETTINGS.ATTACK_LEVEL]: 99,
        [SETTINGS.PLAYER_HP_PERCENT]: 100,
        [SETTINGS.CHAOS_ROAR]: false,
        [SETTINGS.NATURAL_INSTINCT]: false,
        [SETTINGS.SEARING_WINDS]: false,
        [SETTINGS.SHADOW_IMBUED]: false,
        [SETTINGS.INSTABILITY]: false,
        [SETTINGS.BLOODLUST_STACKS]: 0,
        [SETTINGS.KALG_SPEC]: false,
        [SETTINGS.ECLIPSED_SOUL]: false,
        [SETTINGS.LVL20ARMOUR]: false,
        [SETTINGS.IMPATIENT]: 0,
        [SETTINGS.EXPECTED_ADRENALINE]: false,
        [SETTINGS.DEATHMARK]: false,
        [SETTINGS.CAP_ADRENALINE]: true,
        [SETTINGS.HEIGHTENED_SENSES]: false,
        [SETTINGS.VIGOUR]: false,
        [SETTINGS.FURY_OF_THE_SMALL]: false,
        [SETTINGS.CONSERVATION_OF_ENERGY]: false,
        [SETTINGS.INFERNAL_PUZZLE_BOX]: 0,
        [SETTINGS.ICY_CHILL_STACKS]: 0,
        [SETTINGS.ICY_PRECISION]: 0,
        [SETTINGS.ESSENCE_CORRUPTION]: 0,
        [SETTINGS.DEATH_SPARK_STACKS]: 0,
        [SETTINGS.SOUL_REAVE_STACKS]: 0,
        [SETTINGS.DEATHSPORE_BUFF]: false,
        [SETTINGS.DEATHSPORE_COOLDOWN]: 0,

        // Apply overrides last
        ...overrides,
    };
}
