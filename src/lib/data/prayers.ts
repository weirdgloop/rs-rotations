// Prayer types
export type PrayerStyle = 'magic' | 'melee' | 'ranged' | 'necromancy';
export type PrayerCategory = 'single-stat boosting' | 'multi-stat boosting' | 'leech curse' | 'none';
export type PrayerBook = 'normal' | 'curses' | 'none';

export interface Prayer {
    boost: number;
    style: PrayerStyle;
    category: PrayerCategory;
    book: PrayerBook;
}

export type Prayers = Record<PRAYERS, Prayer>;

// Prayer name enum for type safety
export enum PRAYERS {
    CHARGE = 'charge',
    SUPER_CHARGE = 'super charge',
    OVERCHARGE = 'overcharge',
    AUGURY = 'augury',
    LEECH_MAGIC_STRENGTH_2 = 'leech magic strength 2',
    LEECH_MAGIC_STRENGTH_4 = 'leech magic strength 4',
    LEECH_MAGIC_STRENGTH_6 = 'leech magic strength 6',
    LEECH_MAGIC_STRENGTH_8 = 'leech magic strength 8',
    TORMENT = 'torment',
    AFFLICTION = 'affliction',

    BURST_OF_STRENGTH = 'burst of strength',
    SUPERHUMAN_STRENGTH = 'superhuman strength',
    ULTIMATE_STRENGTH = 'ultimate strength',
    CHIVALRY = 'chivalry',
    PIETY = 'piety',
    LEECH_MELEE_STRENGTH_2 = 'leech melee strength 2',
    LEECH_MELEE_STRENGTH_4 = 'leech melee strength 4',
    LEECH_MELEE_STRENGTH_6 = 'leech melee strength 6',
    LEECH_MELEE_STRENGTH_8 = 'leech melee strength 8',
    TURMOIL = 'turmoil',
    MALEVOLENCE = 'malevolence',

    UNSTOPPABLE_FORCE = 'unstoppable force',
    UNRELENTING_FORCE = 'unrelenting force',
    OVERPOWERING_FORCE = 'overpowering force',
    RIGOUR = 'rigour',
    LEECH_RANGED_STRENGTH_2 = 'leech ranged strength 2',
    LEECH_RANGED_STRENGTH_4 = 'leech ranged strength 4',
    LEECH_RANGED_STRENGTH_6 = 'leech ranged strength 6',
    LEECH_RANGED_STRENGTH_8 = 'leech ranged strength 8',
    ANGUISH = 'anguish',
    DESOLATION = 'desolation',

    DECAY = 'decay',
    HASTENED_DECAY = 'hastened decay',
    ACCELERATED_DECAY = 'accelerated decay',
    SANCTITY = 'sanctity',
    LEECH_NECROMANCY_STRENGTH_2 = 'leech necromancy strength 2',
    LEECH_NECROMANCY_STRENGTH_4 = 'leech necromancy strength 4',
    LEECH_NECROMANCY_STRENGTH_6 = 'leech necromancy strength 6',
    LEECH_NECROMANCY_STRENGTH_8 = 'leech necromancy strength 8',
    SORROW = 'sorrow',
    RUINATION = 'ruination',

    NONE_NECRO = 'none necro',
    NONE_MAGIC = 'none magic',
    NONE_RANGED = 'none ranged',
    NONE_MELEE = 'none melee'
}

export const prayers: Prayers = {
    'charge': {
        'boost': 0.02,
        'style': 'magic',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'super charge': {
        'boost': 0.04,
        'style': 'magic',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'overcharge': {
        'boost': 0.06,
        'style': 'magic',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'augury': {
        'boost': 0.08,
        'style': 'magic',
        'category': 'multi-stat boosting',
        'book': 'normal'
    },
    'leech magic strength 2': {
        'boost': 0.02,
        'style': 'magic',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech magic strength 4': {
        'boost': 0.04,
        'style': 'magic',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech magic strength 6': {
        'boost': 0.06,
        'style': 'magic',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech magic strength 8': {
        'boost': 0.08,
        'style': 'magic',
        'category': 'leech curse',
        'book': 'curses'
    },
    'torment': {
        'boost': 0.1,
        'style': 'magic',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },
    'affliction': {
        'boost': 0.12,
        'style': 'magic',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },

    'burst of strength': {
        'boost': 0.02,
        'style': 'melee',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'superhuman strength': {
        'boost': 0.04,
        'style': 'melee',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'ultimate strength': {
        'boost': 0.06,
        'style': 'melee',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'chivalry': {
        'boost': 0.07,
        'style': 'melee',
        'category': 'multi-stat boosting',
        'book': 'normal'
    },
    'piety': {
        'boost': 0.08,
        'style': 'melee',
        'category': 'multi-stat boosting',
        'book': 'normal'
    },
    'leech melee strength 2': {
        'boost': 0.02,
        'style': 'melee',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech melee strength 4': {
        'boost': 0.04,
        'style': 'melee',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech melee strength 6': {
        'boost': 0.06,
        'style': 'melee',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech melee strength 8': {
        'boost': 0.08,
        'style': 'melee',
        'category': 'leech curse',
        'book': 'curses'
    },
    'turmoil': {
        'boost': 0.1,
        'style': 'melee',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },
    'malevolence': {
        'boost': 0.12,
        'style': 'melee',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },

    'unstoppable force': {
        'boost': 0.02,
        'style': 'ranged',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'unrelenting force': {
        'boost': 0.04,
        'style': 'ranged',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'overpowering force': {
        'boost': 0.06,
        'style': 'ranged',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'rigour': {
        'boost': 0.08,
        'style': 'ranged',
        'category': 'multi-stat boosting',
        'book': 'normal'
    },
    'leech ranged strength 2': {
        'boost': 0.02,
        'style': 'ranged',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech ranged strength 4': {
        'boost': 0.04,
        'style': 'ranged',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech ranged strength 6': {
        'boost': 0.06,
        'style': 'ranged',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech ranged strength 8': {
        'boost': 0.08,
        'style': 'ranged',
        'category': 'leech curse',
        'book': 'curses'
    },
    'anguish': {
        'boost': 0.1,
        'style': 'ranged',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },
    'desolation': {
        'boost': 0.12,
        'style': 'ranged',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },

    'decay': {
        'boost': 0.02,
        'style': 'necromancy',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'hastened decay': {
        'boost': 0.04,
        'style': 'necromancy',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'accelerated decay': {
        'boost': 0.06,
        'style': 'necromancy',
        'category': 'single-stat boosting',
        'book': 'normal'
    },
    'sanctity': {
        'boost': 0.08,
        'style': 'necromancy',
        'category': 'multi-stat boosting',
        'book': 'normal'
    },
    'leech necromancy strength 2': {
        'boost': 0.02,
        'style': 'necromancy',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech necromancy strength 4': {
        'boost': 0.04,
        'style': 'necromancy',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech necromancy strength 6': {
        'boost': 0.06,
        'style': 'necromancy',
        'category': 'leech curse',
        'book': 'curses'
    },
    'leech necromancy strength 8': {
        'boost': 0.08,
        'style': 'necromancy',
        'category': 'leech curse',
        'book': 'curses'
    },
    'sorrow': {
        'boost': 0.1,
        'style': 'necromancy',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },
    'ruination': {
        'boost': 0.12,
        'style': 'necromancy',
        'category': 'multi-stat boosting',
        'book': 'curses'
    },

    'none necro': {
        'boost': 0,
        'style': 'necromancy',
        'category': 'none',
        'book': 'none'
    },
    'none magic': {
        'boost': 0,
        'style': 'magic',
        'category': 'none',
        'book': 'none'
    },
    'none ranged': {
        'boost': 0,
        'style': 'ranged',
        'category': 'none',
        'book': 'none'
    },
    'none melee': {
        'boost': 0,
        'style': 'melee',
        'category': 'none',
        'book': 'none'
    },
};
