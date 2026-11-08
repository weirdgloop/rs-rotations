import { getEquipment } from './equipment';
export const equipmentSlots = [
    ['mainhand', 'Main hand / 2H'], ['offhand', 'Off hand'], ['helmet', 'Head'], ['body', 'Body'],
    ['legs', 'Legs'], ['gloves', 'Hands'], ['boots', 'Feet'], ['necklace', 'Neck'],
    ['cape', 'Cape'], ['ring', 'Ring'], ['pocket', 'Pocket'], ['ammo', 'Ammo'],
];
export function equipmentSlotKey(style: string, slot: string): string {
    const prefix = style === 'necromancy' ? 'necro' : style;
    if (slot === 'mainhand') return `${prefix} main-hand weapon`;
    if (slot === 'offhand') return `${prefix} off-hand weapon`;
    if (slot === 'ammo') return `${prefix} ammo slot`;
    const shared = ['necklace', 'cape', 'ring', 'pocket'].includes(slot);
    return `${shared && prefix === 'ranged' ? 'range' : shared && prefix === 'magic' ? 'magic' : prefix} ${slot}`;
}

export function weaponSelectionUpdates(slot: string, value: any): Record<string, any> {
    if (!slot.endsWith('main-hand weapon') && !slot.endsWith('two-hand weapon')) return {};
    const prefix = slot.replace(/(main-hand|two-hand) weapon$/, '');
    const type = getEquipment(value)?.['weapon type'];
    const twoHand = type === 'two-hand';
    const style = prefix.trim();
    return {
        [prefix + 'main-hand weapon']: value,
        ['weapon type ' + style]: twoHand ? 'two-hand' : 'main-hand',
        ...(twoHand ? {[prefix + 'two-hand weapon']: value} : {}),
    };
}
