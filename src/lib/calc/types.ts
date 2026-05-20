import { ABILITIES } from '$lib/data/abilities';

type DamageKind = 'non_crit' | 'crit';
export type CombatStyle = 'melee' | 'ranged' | 'magic' | 'necro' | 'necromancy' | 'poison';

export type EquipmentSlot = 'helmet' | 'body' | 'legs' | 'gloves' | 'boots' | 'necklace' | 'ring' | 'cape' | 'pocket' | 'ammo' | 'mainhand' | 'offhand' | 'not used';
export type EquipmentStyle = 'melee' | 'ranged' | 'magic' | 'necromancy' | 'hybrid';
export type WeaponType = 'main-hand' | 'off-hand' | 'two-hand' | 'shield';

export interface OffensiveTier {
    melee: number;
    ranged: number;
    magic: number;
    necro: number;
}

/** Base equipment piece — covers armour, accessories, and weapons */
export interface Equipment {
    /** Deprecated — use offensiveTier instead. Will be removed. */
    'necromancy strength'?: number;
    'magic strength'?: number;
    'melee strength'?: number;
    'ranged strength'?: number;
    /** Per-style offensive tier for armour/accessories */
    offensiveTier?: OffensiveTier;
    /** Flat weapon tier (weapons only) */
    tier?: number;
    slot: EquipmentSlot;
    style: EquipmentStyle;
    /** Weapon type — only present on weapons */
    'weapon type'?: WeaponType;
    /** Weapon subtype (bow, crossbow, wand, staff, etc.) — only present on weapons */
    type?: string;
    /** Weapon classification (obsidian, none) — only present on weapons */
    classification?: string;
    /** Whether this item is commonly used / should appear prominently in dropdowns. Defaults to false. */
    popular?: boolean;
    /** Display name */
    title?: string;
    /** Icon path */
    icon?: string;
}

/**
 * Input for rotation damage calculation - decoupled from stores
 */
export interface RotationInput {
    abilityBar: (string | null)[];
    extraActionBar: (any[] | null)[];
    nulledTicks: boolean[];
    stalledAbilities: (string | null)[];
}

/**
 * Optional callbacks for UI updates during calculation
 * When not provided, calculation runs in "headless" mode (no UI side effects)
 */
export interface UICallbacks {
    updateStacks?: (tick: number, key: string, value: number) => void;
    updateBuffs?: (tick: number, key: string, value: any) => void;
    updateBarLastIndex?: (index: number) => void;
    getBarSize?: () => number;
}

/**
 * Input for single ability damage calculation
 */
export interface SingleAbilityInput {
    ability: string;
    buffs?: {
        berserk?: boolean;
        sunshine?: boolean;
        blackhole?: boolean;
        deathSwiftness?: boolean;
        splitSoul?: boolean;
        splitSoulNecro?: boolean;
    };
    /** When true, skip resetting buff flags — use whatever is already in settings */
    rawBuffs?: boolean;
}
/**
 * Represents a uniform distribution of possible damage rolls (either critical or non-critical)

 */
interface DamageDistribution {
    minHit: number;
    varHit: number;
    'crit': boolean;
    'probability': number;
    'damage list': any[];
    'ability'?: ABILITIES;
}

/**
 * Represents a complete damage object that can contain both critical and non-critical damage distributions
 */
interface DamageObject {
    distributions: Record<DamageKind, DamageDistribution | undefined>; // A map from 'crit' to the crit distribution and 'non_crit' to the non-crit distribution
    ability: ABILITIES;
    likelihood: number; // The probability of this event occuring - for probabilistic hits (fsoa, sgb <5x5, etc.)
}

export type { DamageDistribution, DamageObject, DamageKind };