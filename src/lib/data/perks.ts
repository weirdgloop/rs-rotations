/**
 * Perk definitions for RuneScape 3
 *
 * Perks are enhancements applied to individual gear pieces (weapons and armour).
 * Each gear piece holds a flat list of perks — we don't enforce slot counts here
 * since a single gizmo slot can contain combo perks (e.g. Precise 6 + Equilibrium 2).
 *
 * When a gear piece is equipped, its perks become the active perks for the player.
 * Swapping gear (e.g. in a rotation) changes which perks are active.
 */

export type PerkSlotType = 'weapon' | 'armour' | 'any';

export interface PerkDefinition {
    /** Display name */
    name: string;
    /** Which gear type this perk can be applied to */
    slotType: PerkSlotType;
    /** Maximum rank */
    maxRank: number;
    /** Icon path */
    icon: string;
}

export enum PERKS {
    PRECISE = 'precise',
    ERUPTIVE = 'eruptive',
    EQ_PERK = 'eq perk',
    AFTERSHOCK = 'aftershock',
    CAROMING = 'caroming',
    FLANKING = 'flanking',
    LUNGING = 'lunging',
    CRACKLING = 'crackling',
    BITING = 'biting',
    IMPATIENT = 'impatient',
    GENOCIDAL = 'genocidal',
    ULTIMATUMS = 'ultimatums',
    RUTHLESS = 'ruthless rank',
    INVIGORATING = 'invigorating',
    SLAYER_PERK_UNDEAD = 'undead slayer perk',
    SLAYER_PERK_DRAGON = 'dragon slayer perk',
    SLAYER_PERK_DEMON = 'demon slayer perk',
}

/**
 * A perk applied to a specific gear piece.
 */
export interface PerkInstance {
    /** Reference to perk definition by key */
    perkKey: string;
    /** Rank of this perk (1 to maxRank) */
    rank: number;
}

/** All perk definitions, keyed by a stable identifier */
export const perks: Record<PERKS, PerkDefinition> = {
    [PERKS.PRECISE]: {
        name: 'Precise',
        slotType: 'weapon',
        maxRank: 6,
        icon: '/effect_icons/perks/Precise.webp',
    },
    [PERKS.ERUPTIVE]: {
        name: 'Eruptive',
        slotType: 'weapon',
        maxRank: 4,
        icon: '/effect_icons/perks/Eruptive.webp',
    },
    [PERKS.EQ_PERK]: {
        name: 'Equilibrium',
        slotType: 'weapon',
        maxRank: 4,
        icon: '/effect_icons/perks/Equilibrium.png',
    },
    [PERKS.AFTERSHOCK]: {
        name: 'Aftershock',
        slotType: 'weapon',
        maxRank: 4,
        icon: '/effect_icons/perks/Aftershock.png',
    },
    [PERKS.CAROMING]: {
        name: 'Caroming',
        slotType: 'weapon',
        maxRank: 4,
        icon: '/effect_icons/perks/caroming.png',
    },
    [PERKS.FLANKING]: {
        name: 'Flanking',
        slotType: 'weapon',
        maxRank: 4,
        icon: '/effect_icons/perks/Flanking.webp',
    },
    [PERKS.LUNGING]: {
        name: 'Lunging',
        slotType: 'weapon',
        maxRank: 4,
        icon: '/effect_icons/perks/Lunging.webp',
    },
    [PERKS.CRACKLING]: {
        name: 'Crackling',
        slotType: 'armour',
        maxRank: 4,
        icon: '/effect_icons/perks/Crackling.webp',
    },
    [PERKS.BITING]: {
        name: 'Biting',
        slotType: 'armour',
        maxRank: 4,
        icon: '/effect_icons/perks/Biting.webp',
    },
    [PERKS.IMPATIENT]: {
        name: 'Impatient',
        slotType: 'armour',
        maxRank: 4,
        icon: '/effect_icons/perks/Impatient.png',
    },
    [PERKS.GENOCIDAL]: {
        name: 'Genocidal',
        slotType: 'armour',
        maxRank: 1,
        icon: '/effect_icons/perks/genocidal.png',
    },
    [PERKS.ULTIMATUMS]: {
        name: 'Ultimatums',
        slotType: 'any',
        maxRank: 4,
        icon: '/effect_icons/perks/ultimatums.png',
    },
    [PERKS.RUTHLESS]: {
        name: 'Ruthless',
        slotType: 'any',
        maxRank: 3,
        icon: '/effect_icons/perks/Ruthless.webp',
    },
    [PERKS.INVIGORATING]: {
        name: 'Invigorating',
        slotType: 'any',
        maxRank: 3,
        icon: '/effect_icons/perks/Invigorating.png',
    },
    [PERKS.SLAYER_PERK_UNDEAD]: {
        name: 'Undead Slayer',
        slotType: 'armour',
        maxRank: 1,
        icon: '/effect_icons/perks/25px-Undead_Slayer.webp',
    },
    [PERKS.SLAYER_PERK_DRAGON]: {
        name: 'Dragon Slayer',
        slotType: 'armour',
        maxRank: 1,
        icon: '/effect_icons/perks/dragon_slayer_perk.png',
    },
    [PERKS.SLAYER_PERK_DEMON]: {
        name: 'Demon Slayer',
        slotType: 'armour',
        maxRank: 1,
        icon: '/effect_icons/perks/demon_slayer_perk.webp',
    },
};

/** Gear slots that support perk gizmos */
export const PERKABLE_SLOTS = new Set(['mainhand', 'offhand', 'body', 'legs']);

/**
 * Get the list of perks valid for a given gear slot type.
 */
export function getPerksForSlot(slot: string): PerkDefinition[] {
    const slotType = slot === 'mainhand' || slot === 'offhand' ? 'weapon' : 'armour';
    return Object.values(perks).filter(
        p => p.slotType === slotType || p.slotType === 'any'
    );
}

/**
 * Collect all active perks from a list of equipped gear pieces.
 * If the same perk appears on multiple pieces, the highest rank wins.
 */
export function collectActivePerks(equippedPerks: PerkInstance[][]): PerkInstance[] {
    const best = new Map<string, PerkInstance>();
    for (const gearPerks of equippedPerks) {
        for (const instance of gearPerks) {
            const existing = best.get(instance.perkKey);
            if (!existing || instance.rank > existing.rank) {
                best.set(instance.perkKey, instance);
            }
        }
    }
    return Array.from(best.values());
}

/**
 * Build a gear perks lookup map from the owned gear store.
 * Returns { itemKey: PerkInstance[] } for all owned items that have perks.
 * Attach this to settings as settings['_gearPerks'] before running the calc.
 *
 * When an item has multiple instances (copies with different perks),
 * the first instance's perks are used by default.
 * To use a specific instance, pass selectedInstances: { itemKey: instanceIndex }.
 */
export function buildGearPerksMap(
    ownedGear: Map<string, { itemKey: string, perks: PerkInstance[] }[]>,
): Record<string, PerkInstance[]> {
    const map: Record<string, PerkInstance[]> = {};
    // Deep-copy perks to strip Svelte 5 proxies (structuredClone can't handle them)
    const copyPerks = (perks: PerkInstance[]): PerkInstance[] =>
        perks.map(p => ({ perkKey: p.perkKey, rank: p.rank }));

    for (const [itemKey, instances] of ownedGear) {
        if (instances.length === 0) continue;
        // Default entry uses first instance
        if (instances[0].perks.length > 0) {
            map[itemKey] = copyPerks(instances[0].perks);
        }
        // For items with multiple instances, also store indexed entries
        // so the calc can look up specific instances via "itemKey#index"
        if (instances.length > 1) {
            for (let i = 0; i < instances.length; i++) {
                if (instances[i].perks.length > 0) {
                    map[`${itemKey}#${i}`] = copyPerks(instances[i].perks);
                }
            }
        }
    }
    return map;
}

/**
 * Attach gear perks to a settings object from the owned gear store.
 * Call this before running the calc pipeline so that style_specific_unification
 * can resolve perks per-ability from the equipped gear.
 *
 * This is opt-in: if _gearPerks is not set, the calc uses global perk settings (old behavior).
 */
export function attachGearPerks(
    settings: Record<string, any>,
    ownedGear: Map<string, { itemKey: string, perks: PerkInstance[] }[]>,
): void {
    settings['_gearPerks'] = buildGearPerksMap(ownedGear);
    // Deep-copy _gearInstances to strip Svelte proxies
    if (settings['_gearInstances'] && typeof settings['_gearInstances'] === 'object') {
        settings['_gearInstances'] = JSON.parse(JSON.stringify(settings['_gearInstances']));
    }
}

/**
 * Apply perk instances to a settings object.
 * Resets all perk settings to 0/false, then sets values from the provided perks.
 */
export function applyPerksToSettings(
    settings: Record<string, any>,
    activePerks: PerkInstance[]
): void {
    // Reset all perks to 0/false
    for (const key of Object.keys(perks)) {
        const current = settings[key];
        if (typeof current === 'boolean') {
            settings[key] = false;
        } else {
            settings[key] = 0;
        }
    }

    // Apply active perks
    for (const instance of activePerks) {
        if (!perks[instance.perkKey]) continue;
        const current = settings[instance.perkKey];
        if (typeof current === 'boolean') {
            settings[instance.perkKey] = true;
        } else {
            settings[instance.perkKey] = Math.max(settings[instance.perkKey] ?? 0, instance.rank);
        }
    }
}

// ─── Shared display utilities ────────────────────────────────

/**
 * Format a perk list as an abbreviated string: "P6 E2"
 */
export function formatPerkAbbrev(perkInstances: PerkInstance[]): string {
    if (!perkInstances || perkInstances.length === 0) return '';
    return perkInstances.map(p => {
        const def = perks[p.perkKey];
        if (!def) return '';
        const abbrev = def.name.charAt(0).toUpperCase();
        return `${abbrev}${p.rank}`;
    }).filter(Boolean).join(' ');
}

/**
 * Get display text for an item, appending perks from a specific owned instance.
 */
export function itemDisplayText(
    itemValue: string,
    baseText: string,
    ownedGear: Map<string, { itemKey: string, perks: PerkInstance[] }[]>,
    instanceIndex: number = 0
): string {
    if (!itemValue || itemValue === 'none' || itemValue.startsWith('custom')) return baseText;
    const instances = ownedGear.get(itemValue);
    if (!instances || instances.length === 0) return baseText;
    const instance = instances[instanceIndex] ?? instances[0];
    const perkStr = formatPerkAbbrev(instance?.perks);
    return perkStr ? `${baseText} (${perkStr})` : baseText;
}

/**
 * Expand a list of gear options into per-instance entries when items have
 * multiple owned copies with different perks.
 * Each expanded option carries `instanceIndex` and `perks` for downstream use.
 */
export function expandOptionsWithInstances<T extends { value: string; text: string }>(
    options: T[],
    ownedGear: Map<string, { itemKey: string, perks: PerkInstance[], label?: string }[]>,
): (T & { instanceIndex: number; perks: PerkInstance[] })[] {
    const expanded: (T & { instanceIndex: number; perks: PerkInstance[] })[] = [];
    for (const option of options) {
        const instances = ownedGear.get(option.value);
        if (instances && instances.length > 1) {
            for (let i = 0; i < instances.length; i++) {
                const perkStr = formatPerkAbbrev(instances[i].perks);
                const label = instances[i].label || (perkStr ? perkStr : `#${i + 1}`);
                expanded.push({
                    ...option,
                    text: `${option.text} (${label})`,
                    instanceIndex: i,
                    perks: instances[i].perks,
                });
            }
        } else {
            const instancePerks = instances?.[0]?.perks ?? [];
            const perkStr = formatPerkAbbrev(instancePerks);
            expanded.push({
                ...option,
                text: perkStr ? `${option.text} (${perkStr})` : option.text,
                instanceIndex: 0,
                perks: instancePerks,
            });
        }
    }
    return expanded;
}
