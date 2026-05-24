import generatedEquipment from '../../equipment.json';
import syntheticEquipment from '../../equipment_synthetic.json';
import popularEquipment from '../../equipment_popular.json';
import { LEGACY_EQUIPMENT_NAME_TO_ID } from './equipment-legacy';
import type { Equipment, EquipmentSlot, EquipmentStyle, WeaponType } from '$lib/calc/types';

export type EquipmentId = number;
export type EquipmentValue = EquipmentId | 'none';

type RawBonuses = {
    class?: string;
    slot?: string;
    type?: string;
    style?: string;
    strength?: number;
    ranged?: number;
    magic?: number;
    necromancy?: number;
    tier?: number;
};

type RawEquipmentRecord = {
    id: number | number[];
    ids?: number[];
    name: string;
    image?: string[];
    bonuses?: RawBonuses;
    app?: {
        title?: string;
        slot?: EquipmentSlot;
        style?: EquipmentStyle;
        weaponType?: WeaponType;
        type?: string;
        classification?: string;
        popular?: boolean;
    };
};

export type EquipmentRecord = Equipment & {
    id: EquipmentId;
    name: string;
    image: string[];
    bonuses: RawBonuses;
    icon: string;
};

const rawEquipment = {
    ...(generatedEquipment as Record<string, RawEquipmentRecord>),
    ...(syntheticEquipment as Record<string, RawEquipmentRecord>)
};

const popularIds = new Set((popularEquipment as number[]).map(Number));

export const RS_WIKI_IMAGE_BASE = 'https://runescape.wiki/images/';

export function equipmentImageUrl(image: string | undefined): string {
    // Spaces are replaced with underscores, but everything else is encoded
    // as per usual URI encoding rules
    if (!image) return '';
    const normalized = image.replace(/ /g, '_');
    return `${RS_WIKI_IMAGE_BASE}${encodeURIComponent(normalized)}`;
}

function firstId(record: RawEquipmentRecord): number {
    return Number(Array.isArray(record.id) ? record.id[0] : record.id);
}

function normalizeStyle(value?: string): EquipmentStyle {
    const style = value?.toLowerCase();
    if (style === 'melee' || style === 'ranged' || style === 'magic' || style === 'necromancy') return style;
    return 'hybrid';
}

function normalizeSlot(value?: string): EquipmentSlot {
    switch (value?.toLowerCase()) {
        case 'head': return 'helmet';
        case 'torso': return 'body';
        case 'hands': return 'gloves';
        case 'feet': return 'boots';
        case 'neck': return 'necklace';
        case 'back': return 'cape';
        case 'main hand weapon':
        case '2h weapon':
            return 'mainhand';
        case 'off-hand weapon':
        case 'off-hand':
            return 'offhand';
        case 'legs':
        case 'ring':
        case 'pocket':
        case 'ammo':
            return value.toLowerCase() as EquipmentSlot;
        default:
            return 'not used';
    }
}

function normalizeWeaponType(record: RawEquipmentRecord, slot: EquipmentSlot): WeaponType | undefined {
    const appType = record.app?.weaponType;
    if (appType) return appType;
    const rawSlot = record.bonuses?.slot?.toLowerCase();
    const rawType = record.bonuses?.type?.toLowerCase() ?? '';
    const name = record.name.toLowerCase();
    if (rawSlot === '2h weapon') return 'two-hand';
    if (rawSlot === 'main hand weapon') return 'main-hand';
    if (slot === 'offhand' && (rawType.includes('shield') || name.includes('shield'))) return 'shield';
    if (rawSlot === 'off-hand weapon' || rawSlot === 'off-hand') return 'off-hand';
    return undefined;
}

function normalizeWeaponSubtype(record: RawEquipmentRecord, weaponType?: WeaponType): string | undefined {
    if (!weaponType) return undefined;
    if (record.app?.type) return record.app.type;
    const rawType = record.bonuses?.type?.toLowerCase() ?? '';
    const name = record.name.toLowerCase();
    if (weaponType === 'shield') return 'shield';
    if (name.includes('bow') && !name.includes('crossbow')) return 'bow';
    if (name.includes('crossbow')) return 'crossbow';
    if (name.includes('staff')) return 'staff';
    if (name.includes('wand')) return 'wand';
    if (name.includes('orb')) return 'orb';
    if (name.includes('core')) return 'core';
    if (name.includes('lantern')) return 'conduit';
    if (name.includes('guard')) return 'guard';
    if (rawType.includes('staff')) return 'staff';
    if (rawType.includes('bow')) return 'bow';
    if (rawType.includes('wand')) return 'wand';
    if (rawType.includes('orb')) return 'orb';
    return 'none';
}

function normalizeRecord(record: RawEquipmentRecord): EquipmentRecord {
    const id = firstId(record);
    const bonuses = record.bonuses ?? {};
    const slot = record.app?.slot ?? normalizeSlot(bonuses.slot);
    const style = record.app?.style ?? normalizeStyle(bonuses.class);
    const weaponType = normalizeWeaponType(record, slot);
    const type = normalizeWeaponSubtype(record, weaponType);
    const title = record.app?.title ?? record.name;
    const image = record.image ?? [];
    const tier = Number(bonuses.tier ?? 0);
    const piece: EquipmentRecord = {
        id,
        name: record.name,
        image,
        bonuses,
        slot,
        style,
        tier,
        offensiveTier: {
            melee: Number(bonuses.strength ? tier : 0),
            ranged: Number(bonuses.ranged ? tier : 0),
            magic: Number(bonuses.magic ? tier : 0),
            necro: Number(bonuses.necromancy ? tier : 0)
        },
        'melee strength': Number(bonuses.strength ?? 0),
        'ranged strength': Number(bonuses.ranged ?? 0),
        'magic strength': Number(bonuses.magic ?? 0),
        'necromancy strength': Number(bonuses.necromancy ?? 0),
        popular: Boolean(record.app?.popular || popularIds.has(id)),
        title,
        icon: equipmentImageUrl(image[0])
    };

    if (weaponType) {
        piece['weapon type'] = weaponType;
        piece.type = type;
        piece.classification = record.app?.classification ?? (record.name === 'Ek-ZekKil' ? 'obsidian' : 'none');
    }

    return piece;
}

export const equipment: Record<number, EquipmentRecord> = Object.fromEntries(
    Object.values(rawEquipment).map((record) => [firstId(record), normalizeRecord(record)])
);

export const weapons: Record<number, EquipmentRecord> = Object.fromEntries(
    Object.entries(equipment).filter(([, item]) => Boolean(item['weapon type']))
);

export const armour: Record<number, EquipmentRecord> = Object.fromEntries(
    Object.entries(equipment).filter(([, item]) => !item['weapon type'])
);

const customIds = new Set([1000000, 1000001, 1000002, 1000003, 1000316]);
const ammoSettings = new Set(['ammo', 'melee ammo slot', 'ranged ammo slot', 'magic ammo slot', 'necro ammo slot']);

export function coerceEquipmentValue(value: unknown, settingKey?: string): EquipmentValue | unknown {
    if (value == null || value === '') return value;
    if (value === 'none') return 'none';
    if (typeof value === 'number') return equipment[value] ? value : value;
    if (typeof value !== 'string') return value;

    const numeric = Number(value);
    if (Number.isInteger(numeric) && equipment[numeric]) return numeric;

    const key = value.toLowerCase();
    if (key === 'custom' && settingKey && ammoSettings.has(settingKey)) return 1000316;
    const legacyId = (LEGACY_EQUIPMENT_NAME_TO_ID as Record<string, number>)[key];
    return legacyId ?? value;
}

export function getEquipment(value: unknown): EquipmentRecord | undefined {
    const id = coerceEquipmentValue(value);
    return typeof id === 'number' ? equipment[id] : undefined;
}

export function getWeapon(value: unknown): EquipmentRecord | undefined {
    const id = coerceEquipmentValue(value);
    return typeof id === 'number' ? weapons[id] : undefined;
}

export function getArmour(value: unknown): EquipmentRecord | undefined {
    const id = coerceEquipmentValue(value);
    return typeof id === 'number' ? armour[id] : undefined;
}

export function getEquipmentIcon(value: unknown, fallback = ''): string {
    return getEquipment(value)?.icon || fallback;
}

export function getEquipmentTitle(value: unknown, fallback = ''): string {
    return getEquipment(value)?.title || fallback;
}

export function getStyleStrength(value: unknown, style: string): number {
    const item = getEquipment(value);
    if (!item) return 0;
    const strengthKey =
        style === 'necromancy' || style === 'necro'
            ? 'necromancy strength'
            : `${style} strength`;
    return Number(item[strengthKey as keyof EquipmentRecord] ?? 0);
}

export function getEquipmentTier(value: unknown, style?: string): number {
    const item = getEquipment(value);
    if (!item) return 0;
    if (!style) return Number(item.tier ?? 0);
    const key = style === 'necromancy' ? 'necro' : style;
    const offensiveTier = Number(item.offensiveTier?.[key as keyof typeof item.offensiveTier] ?? 0);
    return offensiveTier || Number(item.tier ?? 0);
}

export function isCustomEquipment(value: unknown): boolean {
    const id = coerceEquipmentValue(value);
    return typeof id === 'number' && customIds.has(id);
}

export function isEquipmentNone(value: unknown): boolean {
    return value == null || value === '' || value === 'none';
}

const gearSettingKeys = new Set([
    'helmet', 'body', 'legs', 'gloves', 'boots', 'necklace', 'cape', 'ring', 'pocket', 'ammo',
    'main-hand weapon', 'off-hand weapon', 'two-hand weapon',
    'magic helmet', 'magic body', 'magic legs', 'magic gloves', 'magic boots', 'magic necklace', 'magic cape', 'magic ring', 'mage pocket', 'magic ammo slot',
    'ranged helmet', 'ranged body', 'ranged legs', 'ranged gloves', 'ranged boots', 'range necklace', 'range cape', 'range ring', 'range pocket', 'ranged ammo slot',
    'melee helmet', 'melee body', 'melee legs', 'melee gloves', 'melee boots', 'melee necklace', 'melee cape', 'melee ring', 'melee pocket', 'melee ammo slot',
    'necro helmet', 'necro body', 'necro legs', 'necro gloves', 'necro boots', 'necro necklace', 'necro cape', 'necro ring', 'necro pocket', 'necro ammo slot',
    'magic main-hand weapon', 'magic off-hand weapon', 'magic two-hand weapon',
    'ranged main-hand weapon', 'ranged off-hand weapon', 'ranged two-hand weapon',
    'melee main-hand weapon', 'melee off-hand weapon', 'melee two-hand weapon',
    'necro main-hand weapon', 'necro off-hand weapon', 'necro two-hand weapon'
]);

export function migrateEquipmentSettings<T extends Record<string, any>>(settings: T): T {
    for (const [key, entry] of Object.entries(settings)) {
        if (key === '_gearInstances' && entry?.value) {
            for (const info of Object.values(entry.value) as any[]) {
                if (info?.itemKey != null) info.itemKey = coerceEquipmentValue(info.itemKey, key);
            }
            continue;
        }
        if (!gearSettingKeys.has(key)) continue;
        if (entry && typeof entry === 'object' && 'value' in entry) {
            entry.value = coerceEquipmentValue(entry.value, key);
        } else {
            settings[key as keyof T] = coerceEquipmentValue(entry, key) as T[keyof T];
        }
    }
    return settings;
}

export function migrateOwnedGearEntries(entries: Record<string, any[]>): Map<EquipmentValue, any[]> {
    const map = new Map<EquipmentValue, any[]>();
    for (const [key, instances] of Object.entries(entries)) {
        const itemKey = coerceEquipmentValue(key) as EquipmentValue;
        const normalizedInstances = (instances ?? []).map((instance) => ({
            ...instance,
            itemKey
        }));
        map.set(itemKey, normalizedInstances);
    }
    return map;
}
