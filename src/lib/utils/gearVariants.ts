/**
 * Shared utilities for gear variant handling.
 *
 * Items like "bow of the last guardian [IM]" have variant suffixes that need
 * to be stripped for icon resolution, and displayed as badges on the UI.
 * This module centralises that logic.
 */

export interface GearBadge {
    img?: string;
    text?: string;
}

/** All recognised variant suffixes and their badge representations */
const VARIANT_SUFFIXES: { pattern: RegExp; endsWith: string; badge: GearBadge }[] = [
    { pattern: / \[IM\]$/, endsWith: ' [IM]', badge: { img: '/effect_icons/shard_of_genesis.png' } },
    { pattern: / \(i\)$/, endsWith: ' (i)', badge: { text: 'i' } },
    { pattern: /\+$/, endsWith: '+', badge: { text: '+' } },
    { pattern: / \(or\)$/, endsWith: ' (or)', badge: { text: 'or' } },
    { pattern: / \(e\)$/, endsWith: ' (e)', badge: { text: 'e' } },
];

/**
 * Strip variant suffixes from an item name to get the base name.
 * Used for icon path resolution (variants share the base item's icon).
 */
export function stripVariantSuffix(value: string): string {
    let result = value;
    for (const { pattern } of VARIANT_SUFFIXES) {
        result = result.replace(pattern, '');
    }
    return result;
}

/**
 * Get the badge for a gear item's variant suffix, if any.
 * Returns null for base items with no variant.
 */
export function getGearBadge(value: string): GearBadge | null {
    if (!value) return null;
    for (const { endsWith, badge } of VARIANT_SUFFIXES) {
        if (value.endsWith(endsWith)) return badge;
    }
    return null;
}

/**
 * Resolve the icon path for a gear item, falling back to the base name
 * if the item has a variant suffix.
 */
export function resolveGearIcon(value: string, folder: string): string {
    return `/gear_icons/${folder}/${value}.png`;
}

/**
 * Resolve the fallback icon path by stripping variant suffixes.
 */
export function resolveGearIconFallback(value: string, folder: string): string {
    const base = stripVariantSuffix(value);
    return `/gear_icons/${folder}/${base}.png`;
}
