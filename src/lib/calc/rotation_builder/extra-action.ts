/**
 * Unified ExtraAction interface — all items in the extra action bar
 * (gear swaps, off-GCD abilities, prayers, consumables, spells)
 * use this common format.
 */

import { coerceEquipmentValue, getEquipmentIcon, getEquipmentTitle } from '$lib/data/equipment';

export type ExtraActionType = 'gear' | 'ability' | 'prayer' | 'consumable' | 'spell';

export interface ExtraAction {
    /** What kind of extra action this is */
    type: ExtraActionType;
    /** The lookup key (gear: equipment id, ability: ABILITIES key, etc.) */
    value: string | number;
    /** Display name */
    title: string;
    /** Icon path */
    icon: string;
    /** Settings key to update (gear swaps only, e.g. 'ranged helmet') */
    slot?: string;
    /** Perks on this gear piece (gear swaps only, inline for self-contained rotations) */
    perks?: { perkKey: string; rank: number }[];
}

/**
 * Create a gear swap ExtraAction.
 * @param value - The item name string (e.g. 'elite dracolich coif')
 * @param title - Display name
 * @param icon - Icon path
 * @param slot - The settings key this gear writes to (e.g. 'ranged helmet')
 */
export function gearAction(value: string | number, title: string, icon: string, slot: string, perks?: { perkKey: string; rank: number }[]): ExtraAction {
    const id = coerceEquipmentValue(value);
    return { type: 'gear', value: id as string | number, title: getEquipmentTitle(id, title), icon: getEquipmentIcon(id, icon), slot, ...(perks?.length ? { perks } : {}) };
}

/**
 * Create an off-GCD ability ExtraAction.
 * @param value - The ability key (e.g. 'ingenuity of the humans')
 * @param title - Display name
 * @param icon - Icon path
 */
export function abilityAction(value: string, title: string, icon: string): ExtraAction {
    return { type: 'ability', value, title, icon };
}

/**
 * Create a prayer ExtraAction.
 */
export function prayerAction(value: string, title: string, icon: string): ExtraAction {
    return { type: 'prayer', value, title, icon };
}

/**
 * Create a consumable ExtraAction.
 */
export function consumableAction(value: string, title: string, icon: string): ExtraAction {
    return { type: 'consumable', value, title, icon };
}

/**
 * Create a spell ExtraAction.
 */
export function spellAction(value: string, title: string, icon: string): ExtraAction {
    return { type: 'spell', value, title, icon };
}

/**
 * Check if an object is an ExtraAction (vs legacy format).
 */
export function isExtraAction(obj: any): obj is ExtraAction {
    return obj && typeof obj === 'object' && 'type' in obj && 'value' in obj;
}

/**
 * Normalize a legacy extra action entry to the new ExtraAction format.
 * Legacy entries are either:
 * - string keys (abilities, prayers, etc.)
 * - { title, icon } objects (gear swaps)
 */
export function normalizeLegacy(entry: any, gearSwapsLookup?: Record<string, string>, iconLookup?: Record<string, { title?: string; icon?: string }>): ExtraAction | null {
    if (!entry) return null;
    if (isExtraAction(entry)) {
        if (entry.type !== 'gear') return entry;
        const id = coerceEquipmentValue(entry.value, entry.slot);
        return {
            ...entry,
            value: id as string | number,
            title: getEquipmentTitle(id, entry.title),
            icon: getEquipmentIcon(id, entry.icon)
        };
    }

    // Legacy gear object: { title: 'item name', icon: '/path' }
    if (typeof entry === 'object' && entry.title) {
        const id = coerceEquipmentValue(entry.title);
        const slot = gearSwapsLookup?.[entry.title];
        return {
            type: 'gear',
            value: id as string | number,
            title: getEquipmentTitle(id, entry.title),
            icon: getEquipmentIcon(id, entry.icon || ''),
            ...(slot ? { slot } : {}),
        };
    }

    // Legacy string key (ability, prayer, consumable, spell)
    if (typeof entry === 'string') {
        const info = iconLookup?.[entry];
        return {
            type: 'ability',
            value: entry,
            title: info?.title || entry,
            icon: info?.icon || '',
        };
    }

    return null;
}
