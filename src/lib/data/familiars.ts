/**
 * Interface defining a familiar
 */
export interface Familiar {
    name: string;
    attack_rate: number;
    max_hit: number;
    has_dps_spec: boolean;
    spec_damage: number;
    spec_cost: number;
    combat_style: 'melee' | 'ranged' | 'magic';
    accuracy: number;
    // Per-style accuracy values from game data 
    melee_accuracy: number;
    ranged_accuracy: number;
    magic_accuracy: number;
    spec_min_roll?: number; // Minimum roll as fraction of max (e.g., 0.2 = 20%)
    // Meta data
    icon: string;
    scroll_icon?: string;
}
/**
 * Available familiars
 * Accuracy values sourced from PVME Familiar Damage spreadsheet
 */
export const familiars: Record<string, Familiar> = {
    'ripper demon': {
        name: 'Ripper Demon',
        attack_rate: 6,
        max_hit: 1341,
        has_dps_spec: true,
        spec_damage: 3.2 * 1341, // max roll: 320% of max_hit
        spec_cost: 20,
        combat_style: 'melee',
        accuracy: 3724,
        melee_accuracy: 3724,
        ranged_accuracy: 0,
        magic_accuracy: 0,
        spec_min_roll: 2.0 / 3.2, // min roll: 200% of max_hit → 200/320 = 0.625 of spec_damage
        icon: '/familiars/Ripper_Demon_chathead.png',
        scroll_icon: '/familiars/scrolls/Ripper_Demon_scroll_(Death_From_Above).png'
    },
    'kalgerion demon': {
        name: "Kal'gerion Demon",
        attack_rate: 4,
        max_hit: 1368,
        has_dps_spec: false,
        spec_damage: 0,
        spec_cost: 0,
        combat_style: 'melee',
        accuracy: 3399,
        melee_accuracy: 3399,
        ranged_accuracy: 0,
        magic_accuracy: 3399,
        icon: '/familiars/Kal\'gerion_demon_(familiar)_chathead.png',
    },
    'blood reaver': {
        name: 'Blood Reaver',
        attack_rate: 5,
        max_hit: 672,
        has_dps_spec: false,
        spec_damage: 0,
        spec_cost: 0,
        combat_style: 'magic',
        accuracy: 1816,
        melee_accuracy: 1816,
        ranged_accuracy: 0,
        magic_accuracy: 1816,
        icon: '/familiars/Blood_reaver_(familiar)_chathead.png'
    },
    'steel titan': {
        name: 'Steel Titan',
        attack_rate: 8,
        max_hit: 1296,
        has_dps_spec: true,
        spec_damage: 5184 / 2,
        spec_cost: 18,
        combat_style: 'melee',
        accuracy: 3023,
        melee_accuracy: 3023,
        ranged_accuracy: 3023,
        magic_accuracy: 3023,
        spec_min_roll: 0.2,
        icon: '/familiars/Steel_titan_chathead.png',
        scroll_icon: '/familiars/scrolls/Steel_Titan_scroll_(Steel_of_Legends).png'
    },
    'nihil': {
        name: 'Nihil',
        attack_rate: 2,
        max_hit: 768,
        has_dps_spec: false,
        spec_damage: 0,
        spec_cost: 0,
        combat_style: 'magic',
        accuracy: 2795,
        melee_accuracy: 2795,
        ranged_accuracy: 2795,
        magic_accuracy: 2795,
        icon: '/familiars/Shadow_nihil_(familiar)_chathead.png',
    },
    'talon beast': {
        name: 'Talon Beast',
        attack_rate: 8,
        max_hit: 3024,
        has_dps_spec: true,
        spec_damage: 3024,
        spec_cost: 18,
        combat_style: 'melee',
        accuracy: 1816,
        melee_accuracy: 1816,
        ranged_accuracy: 1816,
        magic_accuracy: 1816,
        spec_min_roll: 0.2,
        icon: '/familiars/Talon_beast_chathead.png',
    },
    'hellhound': {
        name: 'Hellhound',
        attack_rate: 4,
        max_hit: 576,
        has_dps_spec: false,
        spec_damage: 0,
        spec_cost: 0,
        combat_style: 'melee',
        accuracy: 1816,
        melee_accuracy: 1816,
        ranged_accuracy: 1508,
        magic_accuracy: 1508,
        icon: '/familiars/Hellhound_(familiar)_chathead.png',
    },
    'smoke devil': {
        name: 'Smoke Devil',
        attack_rate: 4,
        max_hit: 792,
        has_dps_spec: false,
        spec_damage: 0,
        spec_cost: 0,
        combat_style: 'magic',
        accuracy: 1197,
        melee_accuracy: 1197,
        ranged_accuracy: 1197,
        magic_accuracy: 1197,
        icon: '/familiars/Smoke_devil_chathead.png',
    },
    'wolpertinger': {
        name: 'Wolpertinger',
        attack_rate: 4,
        max_hit: 1195,
        has_dps_spec: false,
        spec_damage: 0,
        spec_cost: 0,
        combat_style: 'magic',
        accuracy: 2542,
        melee_accuracy: 2542,
        ranged_accuracy: 2542,
        magic_accuracy: 2542,
        icon: '/familiars/Wolpertinger_chathead.png',
    },
};

/**
 * Dreadnip data — modeled separately as a deployable, not a familiar
 * Duration: 45s (75 ticks), attacks every 6 ticks, avg auto 450.5
 */
export const dreadnipData = {
    name: 'Dreadnip',
    attack_rate: 4, // every 4 ticks (up to 18 attacks per lifespan)
    duration: 75, // 45 seconds in ticks
    max_attacks: 18,
    avg_hit: 450.5,
    melee_accuracy: 2489,
    ranged_accuracy: 2489,
    magic_accuracy: 2489,
};

/**
 * Calculate familiar hit chance against a target
 * hit_chance = min(1, accuracy / armour * affinity)
 * Takes the best of all styles the familiar can attack with
 */
export function calculateFamiliarHitChance(
    familiar: Familiar,
    targetArmour: number,
    affinities: { melee: number; ranged: number; magic: number },
    affinityBonus: number = 0
): number {
    if (targetArmour <= 0) return 1;

    const styles: Array<{ acc: number; aff: number }> = [];
    if (familiar.melee_accuracy > 0) {
        styles.push({ acc: familiar.melee_accuracy, aff: affinities.melee + affinityBonus });
    }
    if (familiar.ranged_accuracy > 0) {
        styles.push({ acc: familiar.ranged_accuracy, aff: affinities.ranged + affinityBonus });
    }
    if (familiar.magic_accuracy > 0) {
        styles.push({ acc: familiar.magic_accuracy, aff: affinities.magic + affinityBonus });
    }

    if (styles.length === 0) return 0;

    let bestHitChance = 0;
    for (const { acc, aff } of styles) {
        const hitChance = Math.floor((acc / targetArmour) * 100) / 100 * aff;
        bestHitChance = Math.max(bestHitChance, hitChance);
    }

    return Math.min(1, bestHitChance);
}

/**
 * Get a familiar by name
 */
export function getFamiliar(name: string): Familiar | undefined {
    return familiars[name];
}
