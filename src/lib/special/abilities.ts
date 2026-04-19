import { ABILITIES } from '$lib/data/abilities';

export enum CONSUMABLES {
    ADRENALINE_RENEWAL = 'Adrenaline renewal potion',
    ADD_1_ADRENALINE = 'Add 1 Adrenaline',
    ADD_5_ADRENALINE = 'Add 5 Adrenaline',
    ADD_10_ADRENALINE = 'Add 10 Adrenaline',
    ADD_20_ADRENALINE = 'Add 20 Adrenaline',
    ADD_50_ADRENALINE = 'Add 50 Adrenaline',
    SPIRITUAL_PRAYER = 'Spiritual Prayer Potion',
    VULNERABILITY_BOMB = 'Vulnerability bomb',
}

export const consumables: Record<string, { title: string; icon: string; group?: string }> = {
    [CONSUMABLES.ADRENALINE_RENEWAL]: {
        title: 'Adrenaline renewal potion',
        icon: '/rs-rot/ability_icons/special/Adrenaline_renewal_potion.png'
    },
    [CONSUMABLES.ADD_1_ADRENALINE]: {
        title: 'Add 1 Adrenaline',
        icon: '/rs-rot/ability_icons/special/Adrenaline_1.png'
    },
    [CONSUMABLES.ADD_5_ADRENALINE]: {
        title: 'Add 5 Adrenaline',
        icon: '/rs-rot/ability_icons/special/Adrenaline_5.png'
    },
    [CONSUMABLES.ADD_10_ADRENALINE]: {
        title: 'Add 10 Adrenaline',
        icon: '/rs-rot/ability_icons/special/Adrenaline_10.png'
    },
    [CONSUMABLES.ADD_20_ADRENALINE]: {
        title: 'Add 20 Adrenaline',
        icon: '/rs-rot/ability_icons/special/Adrenaline_20.png'
    },
    [CONSUMABLES.ADD_50_ADRENALINE]: {
        title: 'Add 50 Adrenaline',
        icon: '/rs-rot/ability_icons/special/Adrenaline_50.png'
    },
    [CONSUMABLES.SPIRITUAL_PRAYER]: {
        title: 'Spiritual Prayer Potion',
        icon: '/rs-rot/effect_icons/Spiritual_prayer_potion.png'
    },
    [CONSUMABLES.VULNERABILITY_BOMB]: {
        title: 'Vulnerability bomb',
        icon: '/rs-rot/ability_icons/special/Vulnerability_bomb.png'
    },
    [ABILITIES.DREADNIP]: {
        title: 'Dreadnip',
        icon: '/rs-rot/ability_icons/special/Dreadnip.png'
    }
};

// Off-GCD abilities (sigils, slayer, mobility, etc.)
export const offGcdAbilities: Record<string, { title: string; icon: string }> = {
    [ABILITIES.RUNIC_CHARGE]: {
        title: 'Runic Charge',
        icon: '/rs-rot/ability_icons/magic/Runic_Charge.png'
    },
    [ABILITIES.INGENUITY_OF_THE_HUMANS]: {
        title: 'Ingenuity of the Humans',
        icon: '/rs-rot/ability_icons/special/Ingenuity_of_the_Humans.png'
    },
    [ABILITIES.LIMITLESS]: {
        title: 'Limitless',
        icon: '/rs-rot/ability_icons/special/Limitless.png'
    },
    [ABILITIES.DRAGON_SLAYER_ABILITY]: {
        title: 'Dragon Slayer',
        icon: '/rs-rot/ability_icons/special/Dragon_Slayer_(ability).png'
    },
    [ABILITIES.DEMON_SLAYER_ABILITY]: {
        title: 'Demon Slayer',
        icon: '/rs-rot/ability_icons/special/Demon_Slayer_(ability).png'
    },
    [ABILITIES.UNDEAD_SLAYER_ABILITY]: {
        title: 'Undead Slayer',
        icon: '/rs-rot/ability_icons/special/Undead_Slayer_(ability).png'
    },
    [ABILITIES.SURGE]: {
        title: 'Surge',
        icon: '/rs-rot/ability_icons/special/Surge.png'
    },
    [ABILITIES.ESCAPE]: {
        title: 'Escape',
        icon: '/rs-rot/ability_icons/special/Escape.png'
    },
    [ABILITIES.DIVE]: {
        title: 'Dive',
        icon: '/rs-rot/ability_icons/special/Dive.png'
    },
};

// Prayers
export const prayers: Record<string, { title: string; icon: string }> = {
    [ABILITIES.DEFLECT_MAGIC]: {
        title: 'Deflect Magic',
        icon: '/rs-rot/ability_icons/special/Deflect_Magic.png'
    },
    [ABILITIES.DEFLECT_RANGED]: {
        title: 'Deflect Ranged',
        icon: '/rs-rot/ability_icons/special/Deflect_Ranged.png'
    },
    [ABILITIES.DEFLECT_MELEE]: {
        title: 'Deflect Melee',
        icon: '/rs-rot/ability_icons/special/Deflect_Melee.png'
    },
    [ABILITIES.DEFLECT_NECROMANCY]: {
        title: 'Deflect Melee',
        icon: '/rs-rot/ability_icons/special/Deflect_Necromancy.png'
    },
    [ABILITIES.SOUL_SPLIT]: {
        title: 'Soul Split',
        icon: '/rs-rot/ability_icons/special/Soul_Split.png'
    },
};

// Spells
export const spells: Record<string, { title: string; icon: string }> = {
    [ABILITIES.EXSANGUINATE]: {
        title: 'Exsanguinate',
        icon: '/rs-rot/effect_icons/Exsanguinate_icon.webp'
    },
    [ABILITIES.INCITE_FEAR]: {
        title: 'Incite Fear',
        icon: '/rs-rot/ability_icons/magic/Incite_Fear_icon.webp'
    },
    [ABILITIES.VENGEANCE]: {
        title: 'Vengeance',
        icon: '/rs-rot/ability_icons/special/Vengeance.png'
    },
    [ABILITIES.SPELLBOOK_SWAP]: {
        title: 'Spellbook Swap',
        icon: '/rs-rot/ability_icons/special/Spellbook_Swap.png'
    },
    [ABILITIES.DISRUPTION_SHIELD]: {
        title: 'Disruption Shield',
        icon: '/rs-rot/ability_icons/special/Disruption_Shield.png'
    },
    [ABILITIES.PRISM_OF_RESTORATION]: {
        title: 'Prism of Restoration',
        icon: '/rs-rot/effect_icons/Prism_of_Restoration_icon.png'
    },
};

// Flat lookup of all EoF items by key (for extra action bar rendering)
const eofItems: Record<string, { title: string; icon: string }> = {
    'EoF': { title: 'EoF', icon: '/rs-rot/gear_icons/essence of finality amulet.png' },
    'EoF (black)': { title: 'EoF (black)', icon: '/rs-rot/gear_icons/essence of finality amulet (black).png' },
    'EoF (blue)': { title: 'EoF (blue)', icon: '/rs-rot/gear_icons/essence of finality amulet (blue).png' },
    'EoF (green)': { title: 'EoF (green)', icon: '/rs-rot/gear_icons/essence of finality amulet (green).png' },
    'EoF (pink)': { title: 'EoF (pink)', icon: '/rs-rot/gear_icons/essence of finality amulet (pink).png' },
    'EoF (purple)': { title: 'EoF (purple)', icon: '/rs-rot/gear_icons/essence of finality amulet (purple).png' },
    'EoF (red)': { title: 'EoF (red)', icon: '/rs-rot/gear_icons/essence of finality amulet (red).png' },
    'EoF (yellow)': { title: 'EoF (yellow)', icon: '/rs-rot/gear_icons/essence of finality amulet (yellow).png' },
};

// Combined lookup for extra action bar rendering (needs to find both abilities, consumables, and gear)
export const allExtraActions: Record<string, { title: string; icon: string }> = {
    ...offGcdAbilities,
    ...prayers,
    ...spells,
    ...consumables,
    ...eofItems,
};

// Legacy gear swap lookup — kept as empty export for backward compatibility
// TODO: remove once all consumers use getSettingsKeyForItem instead
export const gearSwaps: Record<string, string> = {};