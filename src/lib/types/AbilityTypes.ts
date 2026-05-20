/**
 * Type definitions for ability information
 */

import { ABILITIES, abils } from "$lib/data/abilities";

// Ability classification types
export type AbilityClassification =
    'bleed' | 'dot' | 'burn' | 'channel' | 'self cast' |
    'regular' | 'multihit' | 'auto' | 'grounded' |
    'conjure' | 'proc' | 'perk';

// Ability type categories - 'ability' is used for necro abils
export type AbilityType = 'basic' | 'threshold' | 'special attack' | 'ability' | 'spell' | 'ultimate' | 'auto'| 'conjure' | 'proc' | 'perk';

// Combat styles
export type CombatStyle = 'melee' | 'ranged' | 'magic' | 'necromancy' | 'defence' | 'poison';

// Damage types (what does the hitsplat look like?)
export type DamageType = 'melee' | 'ranged' | 'magic' | 'necrotic' | 'spirit' | 'defence' | 'poison' | 'split soul';

// Hit information for channeled abilities
export interface AbilityHits {
    [tick: number]: string[]; // tick number -> array of hit ability names
}

// Core ability information structure
export interface AbilityInfo {
    // Damage calculation properties
    minHit: number; // minimum % of ability damage expressed as decimal (e.g., 0.3 = 30%)
    varHit: number; // variance in damage as decimal
    onHitEffects: boolean; // whether ability gets on-hit effects
    critEffects: boolean; // whether ability can crit
    damagePotentialEffects: boolean; // whether ability is affected by damage potential

    // Classification properties
    abilityClassification: AbilityClassification; // type of ability (bleed, channel, etc.)
    abilityType: AbilityType; // category of ability (basic, threshold, etc.)
    mainStyle: CombatStyle; // primary combat style
    damageType: DamageType; // type of damage dealt

    // Optional properties
    hits?: AbilityHits; // for channeled abilities, defines hits per tick
    hitTimings?: number[]; // for multihit/bleeds/dots/etc, defines hit timings
    duration?: number; // ability duration in ticks (if not standard 3t)
    cooldown?: number; // ability cooldown in seconds
    adrenaline?: number; // adrenaline cost/gain - +25 means the ability costs 25 adrenaline
    parent?: ABILITIES; // parent ability for multihit, channel or bleed ability hit entries

    // UI properties (if applicable)
    title?: string; // display name
    icon?: string; // icon path
    description?: string; // ability description
    common?: boolean // For UI filtering of irrelevant abilities

    // Special properties
    isUltimate?: boolean; // whether this is an ultimate ability
    requiresTarget?: boolean; // whether ability requires a target
    canStall?: boolean; // whether ability can be stalled
    canNull?: boolean; // whether ability can be nulled
}

// Type for the entire abilities object
export type AbilitiesObject = {
    [abilityName: string]: AbilityInfo;
};

// Utility types for specific ability categories
export type ChanneledAbility = AbilityInfo & {
    abilityClassification: 'channel';
    hits: AbilityHits; // Required for channeled abilities
};

export type BleedAbility = AbilityInfo & {
    abilityClassification: 'bleed';
};

export type DotAbility = AbilityInfo & {
    abilityClassification: 'dot';
};

export type BurnAbility = AbilityInfo & {
    abilityClassification: 'burn';
};

export type RegularAbility = AbilityInfo & {
    abilityClassification: 'regular';
};

export type MultihitAbility = AbilityInfo & {
    abilityClassification: 'multihit';
};

// Type guards for checking ability types
export function isChanneledAbility(ability: AbilityInfo): ability is ChanneledAbility {
    return ability.abilityClassification === 'channel';
}

export function isBleedAbility(ability: AbilityInfo): ability is BleedAbility {
    return ability.abilityClassification === 'bleed';
}

export function isDotAbility(ability: AbilityInfo): ability is DotAbility {
    return ability.abilityClassification === 'dot';
}

export function isBurnAbility(ability: AbilityInfo): ability is BurnAbility {
    return ability.abilityClassification === 'burn';
}

export function isRegularAbility(ability: AbilityInfo): ability is RegularAbility {
    return ability.abilityClassification === 'regular';
}

export function isMultihitAbility(ability: AbilityInfo): ability is MultihitAbility {
    return ability.abilityClassification === 'multihit';
}

// Utility functions for working with abilities
export function canAbilityCrit(ability: AbilityInfo): boolean {
    return ability.critEffects;
}

export function hasOnHitEffects(ability: AbilityInfo): boolean {
    return ability.onHitEffects;
}

export function isAffectedByDamagePotential(ability: AbilityInfo): boolean {
    return ability.damagePotentialEffects;
}

export function getMinHit(ability: AbilityInfo): number {
    return ability.minHit;
}

export function getVarHit(ability: AbilityInfo): number {
    return ability.varHit;
}

export function getAbilityStyle(ability: AbilityInfo): CombatStyle {
    return ability.mainStyle;
}

export function getAbilityType(ability: AbilityInfo): AbilityType {
    return ability.abilityType;
}

export function getAbilityClassification(ability: AbilityInfo): AbilityClassification {
    return ability.abilityClassification;
}

export function isChannelledHit(ability: AbilityInfo): boolean {
    const parent = ability.parent;
    if (parent && getAbilityClassification(abils[parent]) === 'channel') {
        return true;
    }
    return false;
}

