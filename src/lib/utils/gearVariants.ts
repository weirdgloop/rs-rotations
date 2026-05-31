/**
 * Shared utilities for gear variant handling.
 *
 * Items like Genesis-upgraded gear and enchantment variants display small
 * badges on the UI. Icon resolution is handled by the equipment database.
 * This module centralises that logic.
 */

import { getEquipment, getEquipmentIcon, getEquipmentTitle } from '$lib/data/equipment';

export interface GearBadge {
    img?: string;
    text?: string;
}

/** All recognised variant suffixes and their badge representations */
const VARIANT_SUFFIXES: { pattern: RegExp; endsWith: string; badge: GearBadge }[] = [
    { pattern: / \[IM\]$/, endsWith: ' [IM]', badge: { img: '/rs-rot/effect_icons/shard_of_genesis.png' } },
    { pattern: / \(i\)$/, endsWith: ' (i)', badge: { text: 'i' } },
    { pattern: /\+$/, endsWith: '+', badge: { text: '+' } },
    { pattern: / \(or\)$/, endsWith: ' (or)', badge: { text: 'or' } },
    { pattern: / \(e\)$/, endsWith: ' (e)', badge: { text: 'e' } },
];

/**
 * Strip variant suffixes from an item name to get the base name.
 * Used for icon path resolution (variants share the base item's icon).
 */
export function stripVariantSuffix(value: string | number): string {
    let result = getEquipmentTitle(value, String(value));
    for (const { pattern } of VARIANT_SUFFIXES) {
        result = result.replace(pattern, '');
    }
    return result;
}

/**
 * Get the badge for a gear item's variant suffix, if any.
 * Returns null for base items with no variant.
 */
export function getGearBadge(value: string | number): GearBadge | null {
    if (!value) return null;
    const title = getEquipment(value)?.title ?? String(value);
    for (const { endsWith, badge } of VARIANT_SUFFIXES) {
        if (title.endsWith(endsWith)) return badge;
    }
    return null;
}

/**
 * Resolve the icon path for a gear item, falling back to the base name
 * if the item has a variant suffix.
 */
export function resolveGearIcon(value: string | number, _folder = 'shared'): string {
    return getEquipmentIcon(value);
}

/**
 * Resolve the fallback icon path by stripping variant suffixes.
 */
export function resolveGearIconFallback(value: string | number, _folder = 'shared'): string {
    return getEquipmentIcon(value);
}
