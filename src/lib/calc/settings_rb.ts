import { ARMOUR } from '$lib/data/armour';
import { PERKS } from '$lib/data/perks';

const SETTINGS = {
    // General
    MODE: 'user value',
    MODE_VALUES: {
        MEAN: 'mean',
        MEAN_NO_CRIT: 'mean no crit',
        MEAN_CRIT: 'mean crit',
        MIN_NO_CRIT: 'min no crit',
        MIN_CRIT: 'min crit',
        MAX_NO_CRIT: 'max no crit',
        MAX_CRIT: 'max crit'
    },
    DAMAGE_PER_UNIT: 'damage per unit',
    DAMAGE_PER_UNIT_VALUES: {
        ABIL: 'abil',
        TICK: 'tick',
    },
    DAMAGE_UNITS: 'damage units',
    DAMAGE_UNITS_VALUES: {
        RAW: 'raw',
        PERCENT: 'percent',
    },
    DAMAGE_PER_UNIT_DIVIDER: 'damage per time unit divider',
    CALC_TYPE: 'calc type',
    CALC_TYPE_VALUES: {
        ABILITY: 'ability',
        ROTATION: 'rotation'
    },
    HIT_COUNTER_START: 'hit counter start',
    HIT_COUNTER_END: 'hit counter end',

    // Player Stats
    ABILITY_DAMAGE: 'ability damage',
    NECROMANCY_LEVEL: 'necromancy level',
    MAGIC_LEVEL: 'magic level',
    ATTACK_LEVEL: 'attack level',
    STRENGTH_LEVEL: 'strength level',
    RANGED_LEVEL: 'ranged level',
    POTION: 'potion',
    POTION_VALUES: {
        NONE: 'none',
        ELDER: 'elder overload',
        SUPREME: 'supreme overload',
        OVERLOAD: 'overload',
        EXTREME: 'extreme necromancy',
        SUPER: 'super necromancy',
        REGULAR: 'necromancy potion'
    },
    HIT_CHANCE: 'hit chance',
    REAPER_CREW: 'reaper crew',

    //Prayers
    PRAYER: 'prayer',
    MAGIC_PRAYER: 'magic prayer',
    MAGIC_PRAYER_VALUES: {
        NONE: 'none magic',
        AFFLICTION: 'affliction',
        TORMENT: 'torment',
        LEECH_MAGIC_STRENGTH_2: 'leech magic strength 2',
        LEECH_MAGIC_STRENGTH_4: 'leech magic strength 4',
        LEECH_MAGIC_STRENGTH_6: 'leech magic strength 6',
        LEECH_MAGIC_STRENGTH_8: 'leech magic strength 8',
        AUGURY: 'augury',
        OVERCHARGE: 'overcharge',
        SUPER_CHARGE: 'super charge',
        CHARGE: 'charge'
    },
    RANGED_PRAYER: 'ranged prayer',
    RANGED_PRAYER_VALUES: {
        NONE: 'none ranged',
        DESOLATION: 'desolation',
        ANGUISH: 'anguish',
        LEECH_RANGED_STRENGTH_2: 'leech ranged strength 2',
        LEECH_RANGED_STRENGTH_4: 'leech ranged strength 4',
        LEECH_RANGED_STRENGTH_6: 'leech ranged strength 6',
        LEECH_RANGED_STRENGTH_8: 'leech ranged strength 8',
        RIGOUR: 'rigour',
        OVERPOWERING_FORCE: 'overpowering force',
        UNRELENTING_FORCE: 'unrelenting force',
        UNSTOPPABLE_FORCE: 'unstoppable force'
    },
    MELEE_PRAYER: 'melee prayer',
    MELEE_PRAYER_VALUES: {
        NONE: 'none melee',
        MALEVOLENCE: 'malevolence',
        TURMOIL: 'turmoil',
        LEECH_MELEE_STRENGTH_2: 'leech melee strength 2',
        LEECH_MELEE_STRENGTH_4: 'leech melee strength 4',
        LEECH_MELEE_STRENGTH_6: 'leech melee strength 6',
        LEECH_MELEE_STRENGTH_8: 'leech melee strength 8',
        PIETY: 'piety',
        CHIVALRY: 'chivalry',
        ULTIMATE_STRENGTH: 'ultimate strength',
        SUPERHUMAN_STRENGTH: 'superhuman strength',
        BURST_OF_STRENGTH: 'burst of strength'
    },
    NECRO_PRAYER: 'necromancy prayer',
    NECRO_PRAYER_VALUES: {
        NONE: 'none necro',
        RUINATION: 'ruination',
        SORROW: 'sorrow',
        LEECH_NECRO_STRENGTH_2: 'leech necromancy strength 2',
        LEECH_NECRO_STRENGTH_4: 'leech necromancy strength 4',
        LEECH_NECRO_STRENGTH_6: 'leech necromancy strength 6',
        LEECH_NECRO_STRENGTH_8: 'leech necromancy strength 8',
        SANCTITY: 'sanctity',
        ACCELERATED_DECAY: 'accelerated decay',
        HASTENED_DECAY: 'hastened decay',
        DECAY: 'decay'
    },
    // Misc buffs
    RUBY_AURORA: 'ruby aurora',
    REVENGE: 'revenge',
    BERSERKERS_FURY: 'berserkers fury',
    RUTHLESS_STACKS: 'ruthless stacks',
    SLAYER_HELM: 'slayer helm',
    SLAYER_HELM_VALUES: {
        NONE: 'none',
        REGULAR: 'slayer helmet',
        FULL: 'full slayer helmet',
        REINFORCED: 'reinforced slayer helmet',
        STRONG: 'strong slayer helmet',
        MIGHTY: 'mighty slayer helmet',
        CORRUPTED: 'corrupted slayer helmet'
    },
    GUARDHOUSE: 'guardhouse',
    GUARDHOUSE_VALUES: {
        NONE: 'none',
        LVL1: 'tier 1',
        LVL1_UNDEAD: 'tier 1 undead',
        LVL3: 'tier 3',
        LVL3_UNDEAD: 'tier 3 undead'
    },
    TARGET_HP_PERCENT: 'target hp percent',
    PLAYER_HP_PERCENT: 'player hp percent',
    GENOCIDAL: PERKS.GENOCIDAL,
    IMPATIENT: PERKS.IMPATIENT,
    INVIGORATING: PERKS.INVIGORATING,
    AFTERSHOCK: PERKS.AFTERSHOCK,
    CRACKLING: PERKS.CRACKLING,
    // Familiars
    FAMILIAR: 'familiar',
    FAMILIAR_VALUES: {
        NONE: 'none',
        RIPPER_DEMON: 'ripper demon',
        KALGERION_DEMON: 'kalgerion demon',
        STEEL_TITAN: 'steel titan',
    },
    FAMILIAR_ACCURACY: 'familiar accuracy',
    KALG_SPEC: 'kalg spec',
    USE_FAMILIAR_SCROLLS: 'use familiar scrolls',
    FAMILIAR_SPEC_POINTS: 'familiar spec points',
    FAMILIAR_SPEC_REGEN_ACCUMULATOR: 'familiar spec regen accumulator',
    SHOW_FAMILIAR_SPEC_POINTS: 'show familiar spec points',
    SPIRIT_CAPE: 'spirit cape',
    SUMMONING_RENEWAL: 'summoning renewal',
    SPIRIT_WEED_INCENSE: 'spirit weed incense',
    SPIRIT_WEED_INCENSE_VALUES: {
        NONE: 0,
        LVL1: 1,
        LVL2: 2,
        LVL3: 3,
        LVL4: 4
    },
    PRISM_OF_RESTORATION: 'prism of restoration',

    AURA: 'aura',
    AURA_VALUES: {
        NONE: 'none',
    },
    // On Damage
    VULN: 'vulnerability',
    VULN_VALUES: {
        NONE: 'none',
        CURSE: 'curse',
        VULNERABILITY: 'vuln'
    },
    // Poison
    POISON: 'poison',
    POISON_VALUES: {
        NONE: 'none',
        WEAPON_POISON0: 'weapon poison',
        WEAPON_POISON1: 'weapon poison+',
        WEAPON_POISON2: 'weapon poison++',
        WEAPON_POISON3: 'weapon poison+++',
    },
    SMOKE_CLOUD: 'smoke cloud',
    CRYPTBLOOM: 'cryptbloom',
    SLAYER_PERK_UNDEAD: PERKS.SLAYER_PERK_UNDEAD,
    SLAYER_PERK_DRAGON: PERKS.SLAYER_PERK_DRAGON,
    SLAYER_PERK_DEMON: PERKS.SLAYER_PERK_DEMON,
    UNDEAD_SLAYER_ABILITY: 'undead slayer ability',
    DRAGON_SLAYER_ABILITY: 'dragon slayer ability',
    DEMON_SLAYER_ABILITY: 'demon slayer ability',
    SLAYER_PERK: 'slayer perk',
    SLAYER_PERK_VALUES: {
        NONE: 'none',
        UNDEAD: 'undead',
        DRAGON: 'dragon',
        DEMON: 'demon'
    },
    SLAYER_SIGIL: 'slayer sigil',
    SLAYER_SIGIL_VALUES: {
        NONE: 'none',
        UNDEAD: 'undead',
        DRAGON: 'dragon',
        DEMON: 'demon'
    },
    HAUNTED: 'haunted',
    HAUNTED_AD: 'haunted AD',
    THREADS_OF_FATE: 'threads of fate',
    INVOKE_DEATH: 'invoke death',
    SPLIT_SOUL_NECRO: 'split soul necro',
    SPIRIT_PACT: 'spirit pact',
    SKELETON_WARRIOR_RAGE_STACKS: 'skeleton rage stacks',
    NOPE: 'nopenopenope',
    CUSTOM_ON_AD: 'custom on ad',
    CUSTOM_ON_HIT: 'custom on hit',
    CUSTOM_ON_NPC: 'custom on npc',
    CUSTOM_CRIT: 'custom crit',
    HELMET: 'helmet',
    MAGIC_HELMET: 'magic helmet',
    RANGED_HELMET: 'ranged helmet',
    MELEE_HELMET: 'melee helmet',
    NECRO_HELMET: 'necro helmet',
    BODY: 'body',
    MAGIC_BODY: 'magic body',
    RANGED_BODY: 'ranged body',
    MELEE_BODY: 'melee body',
    NECRO_BODY: 'necro body',
    LEGS: 'legs',
    MAGIC_LEGS: 'magic legs',
    RANGED_LEGS: 'ranged legs',
    MELEE_LEGS: 'melee legs',
    NECRO_LEGS: 'necro legs',
    GLOVES: 'gloves',
    MAGIC_GLOVES: 'magic gloves',
    RANGED_GLOVES: 'ranged gloves',
    MELEE_GLOVES: 'melee gloves',
    NECRO_GLOVES: 'necro gloves',
    BOOTS: 'boots',
    MAGIC_BOOTS: 'magic boots',
    RANGED_BOOTS: 'ranged boots',
    MELEE_BOOTS: 'melee boots',
    NECRO_BOOTS: 'necro boots',
    NECKLACE: 'necklace',
    MAGIC_NECKLACE: 'magic necklace',
    RANGED_NECKLACE: 'range necklace',
    MELEE_NECKLACE: 'melee necklace',
    NECRO_NECKLACE: 'necro necklace',
    CAPE: 'cape',
    MAGIC_CAPE: 'magic cape',
    RANGED_CAPE: 'range cape',
    MELEE_CAPE: 'melee cape',
    NECRO_CAPE: 'necro cape',
    RING: 'ring',
    MAGIC_RING: 'magic ring',
    RANGED_RING: 'range ring',
    MELEE_RING: 'melee ring',
    NECRO_RING: 'necro ring',
    MAGIC_POCKET: 'mage pocket',
    RANGED_POCKET: 'range pocket',
    MELEE_POCKET: 'melee pocket',
    NECRO_POCKET: 'necro pocket',
    POCKET: 'pocket',
    WEAPON: 'weapon type',
    WEAPON_TYPE_MAGE: 'weapon type mage',
    WEAPON_TYPE_MELEE: 'weapon type melee',
    WEAPON_TYPE_RANGED: 'weapon type ranged',
    WEAPON_TYPE_NECRO: 'weapon type necro',

    WEAPON_VALUES: {
        DW: 'main-hand',
        TH: 'two-hand'
    },
    MH: 'main-hand weapon',
    MH_TIER_CUSTOM: 'main-hand weapon custom tier',
    MAGIC_MH: 'magic main-hand weapon',
    MAGIC_MH_VALUES: {
        CUSTOM: 'custom',
        ROAR_OF_AWAKENING: 'roar of awakening',
        ROAR_OF_AWAKENING_IM: 'roar of awakening [IM]',
    },
    RANGED_MH: 'ranged main-hand weapon',
    RANGED_MH_VALUES: {
        CUSTOM: 'custom',
        BLIGHTBOUND: 'blightbound crossbow',
    },
    MELEE_MH: 'melee main-hand weapon',
    MELEE_MH_VALUES: {
        CUSTOM: 'custom',
        DARK_ICE_SHARD: 'dark ice shard',
        LENG: 'dark shard of leng',
        LENG_IM: 'dark shard of leng [IM]',
        KERIS: 'keris',
        KERIS_PROC: 'keris proc',
        KERIS_AVG: 'keris avg',
        PRIMED_KERIS: 'primed keris',
        PRIMED_KERIS_PROC: 'primed keris proc',
        PRIMED_KERIS_AVG: 'primed keris avg',
        CONSECRATED_KERIS: 'consecrated keris',
        CONSECRATED_KERIS_PROC: 'consecrated keris proc',
        CONSECRATED_KERIS_AVG: 'consecrated keris avg',
    },
    NECRO_MH: 'necro main-hand weapon',
    NECRO_MH_VALUES: {
        CUSTOM: 'custom',
        OMNI_GUARD: 'omni guard',
        OMNI_GUARD_IM: 'omni guard [IM]',
        DEVOURERS_GUARD: 'devourer\'s guard',
        DEVOURERS_GUARD_IM: 'devourer\'s guard [IM]'
    },
    OH: 'off-hand weapon',
    OH_TIER_CUSTOM: 'off-hand weapon custom tier',
    MAGIC_OH: 'magic off-hand weapon',
    MAGIC_OH_VALUES: {
        CUSTOM: 'custom oh',
        IMPERIUM_CORE: 'imperium core',
        ODE_TO_DECEIT: 'ode to deceit',
        ODE_TO_DECEIT_IM: 'ode to deceit [IM]',
        CUSTOM_SHIELD: 'custom shield'
    },
    RANGED_OH: 'ranged off-hand weapon',
    RANGED_OH_VALUES: {
        CUSTOM: 'custom oh',
        CUSTOM_SHIELD: 'custom shield',
        BLIGHTBOUND: 'off-hand blightbound crossbow',
    },
    MELEE_OH: 'melee off-hand weapon',
    MELEE_OH_VALUES: {
        CUSTOM: 'custom oh',
        CUSTOM_SHIELD: 'custom shield',
        DARK_ICE_SLIVER: 'dark ice sliver',
        LENG: 'dark sliver of leng',
        LENG_IM: 'dark sliver of leng [IM]'
    },
    NECRO_OH: 'necro off-hand weapon',
    NECRO_OH_VALUES: {
        CUSTOM: 'custom oh',
        CUSTOM_SHIELD: 'custom shield',
        SOULBOUND_LANTERN: 'soulbound lantern',
        SOULBOUND_LANTERN_IM: 'soulbound lantern [IM]',
        SPECTRAL: 'spectral shield'
    },
    TH: 'two-hand weapon',
    TH_TIER_CUSTOM: 'two-hand weapon custom tier',
    TH_TYPE_CUSTOM: 'two-hand weapon custom type',
    TH_TYPE_CUSTOM_VALUES: {
        NONE: 'none',
        BOW: 'bow',
    },
    MAGIC_TH: 'magic two-hand weapon',
    MAGIC_TH_VALUES: {
        CUSTOM: 'custom th',
        INQ_STAFF: 'inquisitor staff',
        INQ_STAFF_E: 'inquisitor staff+',
        FSOA: 'fractured staff of armadyl',
        FSOA_IM: 'fractured staff of armadyl [IM]',
    },
    RANGED_TH: 'ranged two-hand weapon',
    RANGED_TH_VALUES: {
        CUSTOM: 'custom th',
        BOLG: 'bow of the last guardian',
        BOLG_IM: 'bow of the last guardian [IM]',
        HEX_E: 'hexhunter bow+',
        HEX: 'hexhunter bow',
    },
    MELEE_TH: 'melee two-hand weapon',
    MELEE_TH_VALUES: {
        CUSTOM: 'custom th',
        T_MAUL: 'terrasaur maul',
        T_MAUL_E: 'terrasaur maul+',
        MW_SPEAR: 'masterwork spear of annihilation',
        EZK: 'ezk',
        EZK_IM: 'ezk [IM]',
    },
    NECRO_TH: 'necro two-hand weapon',
    NECRO_TH_VALUES: {
        CUSTOM: 'custom th'
    },
    AMMO: 'ammo',
    AMMO_TIER: 'ammo tier',
    MELEE_AMMO_SLOT: 'melee ammo slot',
    RANGED_AMMO_SLOT: 'ranged ammo slot',
    MAGIC_AMMO_SLOT: 'magic ammo slot',
    NECRO_AMMO_SLOT: 'necro ammo slot',
    AUTO_CAST: 'auto cast',
    AUTO_CAST_VALUES: {
        NONE: 'none',
        CRUMBLE_UNDEAD: 'crumble undead',
        INCITE_FEAR: 'incite fear',
        EXSANGUINATE: 'exsanguinate'
    },
    // Perks
    LVL20ARMOUR: 'level 20 armour',
    BITING: PERKS.BITING,
    PRECISE: PERKS.PRECISE,
    ERUPTIVE: PERKS.ERUPTIVE,
    EQ_PERK: PERKS.EQ_PERK,
    FLANKING: PERKS.FLANKING,
    CAROMING: PERKS.CAROMING,
    CHAIN_MODIFIER: 'chain modifier',
    CHAIN_MODIFIER_VALUES: {
        NONE: 'none',
        REGULAR: 'regular',
        GREATER: 'greater',
    },
    RUTHLESS_RANK: PERKS.RUTHLESS,
    // Boss Specific Buffs
    TELOS_RED_BEAM: 'Telos red beam',
    TELOS_BLACK_BEAM: 'Telos black beam',
    TOKKUL_ZO: 'Tokkul-zo',
    KBD_ARTEFACT: 'King black dragon wilderness portal',
    INNER_CHAOS: 'Zamorak inner chaos',
    SWORD_OF_EDICTS: 'Zamorak sword of edicts',
    BOSS_PRESET: 'boss preset',
    BOSS_ENRAGE: 'boss enrage',
    BOSS_PATTERN_START: 'boss pattern start tick',
    BOSS_HP: 'boss hp',
    GUARDIANS_TRIUMPH: 'Zamorak guardians triumph',
    BALANCE_OF_POWER: 'Zamorak balance of power',
    ZAMORAK_CHOKE_STACKS: 'zamorak choke stacks',
    RAKSHA_INNER_POWER: 'Raksha inner power',
    STONE_OF_JAS: 'stone of jas',
    INFERNAL_PUZZLE_BOX: 'Infernal puzzle box',
    // Stacks and Buffs
    // Necro
    RESIDUAL_SOULS: 'residual souls',
    NECROSIS_STACKS: 'necrosis stacks',
    DEATH_SPARK_STACKS: 'death spark stacks',
    SOUL_REAVE_STACKS: 'soul reave stacks',
    BLOAT_DMG: 'bloat damage',
    // Ranged
    ICY_PRECISION: 'icy precision',
    ICY_CHILL_STACKS: 'icy chill stacks',
    PUNCTURE_STACKS: 'puncture stacks',
    // Magic
    FLOW: 'flow',
    GREATER_FLOW: 'greater flow',
    FLOW_AC: 'flow ac',
    GREATER_FLOW_AC: 'greater flow ac',
    COMBUSTED: 'combusted',
    CONFLAGRATE: 'conflagrate',
    GREATER_CHAIN: 'greater chain',

    // Defence
    BARRICADE: 'barricade',
    MALLETOPS: 'malletops',
    ENDLESS_ASSAULT: 'endless assault', // buff flag, set by Greater Barge when TIME_SINCE_ATTACK >= 8
    KERAPACS_WRIST_WRAPS: 'kerapacs wrist wraps', // buff flag, set by casting Dragon Breath with KWW/KWW_E
    ENCHANTMENT_OF_FLAMES: 'enchantment of flames', // toggle: KWW_E with enchantment unlocks 1.4x instead of 1.25x
    ENCHANTMENT_OF_DREAD: 'enchantment of dread', // toggle: NG_E with enchantment adds second snipe hit
    
    TARGET_DISABILITY: 'target disability',
    TARGET_DISABILITY_VALUES: {
        NONE: 'none',
        BOUND: 'bound',
        STUNNED: 'stunned',
        BOUND_STUNNED: 'bound and stunned'
    },
    DEVOURER_NEXUS: 'devourer nexus',
    CHANNELLED_MIGHT: 'channelled might',
    GREATER_CHANNELLED_MIGHT: 'greater channelled might',
    DRACONIC_FRUIT: 'draconic fruit',
    ENDURING_RUIN_HIT: 'enduring ruin hit',
    ENDURING_RUIN_HIT_VALUES: {
        NONE: 'none',
        REGULAR: 'regular',
        ENCHANTED: 'enchanted'
    },
    ENDURING_RUIN_BLEED: 'enduring ruin bleed',
    ENDURING_RUIN_BLEED_VALUES: {
        NONE: 'none',
        REGULAR: 'regular',
        ENCHANTED: 'enchanted'
    },
    GRAVITATE: 'gravitate',
    BLOOD_TITHE: 'blood tithe',
    GLACIAL_EMBRACE: 'glacial embrace',
    DEATH_SPARK: 'death spark',
    LIVING_DEATH: 'living death',
    SWIFTNESS_OF_THE_AVIANSIE: 'swiftness of the avianse',
    ESSENCE_CORRUPTION: 'essence corruption',
    ESS_CORRUPTION_ADREN: 'essence corruption adrenaline',
    CONCENTRATED_BLAST_STACKS: 'concentrated blast stacks',
    CONC_CRIT: 'conc crit',
    GCONC_CRIT: 'gconc crit',
    CONC_CRIT_AC: 'conc crit ac',
    GCONC_CRIT_AC: 'gconc crit ac',
    CHAOS_ROAR: 'chaos roar',
    FURY_BUFF: 'fury buff',
    FURY_BUFF_VALUES: {
        NONE: 'none',
        REGULAR: 'regular',
        GREATER: 'greater'
    },
    RAMPAGE: 'rampage',
    BIK_STACKS: 'bik stacks',
    DEATHSPORE_STACKS: 'deathspore stacks',
    DEATHSPORE_BUFF: 'deathspore buff',
    DEATHSPORE_COOLDOWN: 'deathspore cooldown',
    PERFECT_EQUILIBRIUM_STACKS: 'perfect equilibrium stacks',
    BLOODLUST_STACKS: 'bloodlust stacks',
    BALANCE_BY_FORCE: 'balance by force',
    TARGET_SIZE: 'target size',
    PRIMORDIAL_ICE: 'primordial ice',
    FROSTBLADES: 'frostblades',
    IGNEOUS_EXTENSIOS: 'igneous extensions',
    DRACOLICH_INFUSION: 'dracolich infusion',
    DRACOLICH_INFUSION_VALUES: {
        NONE: 'none',
        REGULAR: 'regular',
        GREATER: 'greater',
    },
    GREATER_DRACOLICH_INFUSION: 'greater dracolich infusion',
    INSTABILITY: 'instability',
    TIME_SINCE_ATTACK: 'time since attack',
    CHANNELLER_RING_STACKS: 'channellers ring stacks',
    NUMBER_OF_BLEEDS: 'number of bleeds',
    STRENGTH_CAPE: 'strength cape',
    GORAJAN_TRAILBLAZER: 'gorajan trailblazer',
    SUNSHINE: 'sunshine',
    DEATH_SWIFTNESS: 'death swiftness',
    SWIFTNESS_ACTIVE: 'swiftness',
    SPLIT_SOUL: 'split soul',
    NATURAL_INSTINCT: 'natural instinct',
    //SPLIT_SOUL_ECB: 'split soul ecb',
    BLACKHOLE: 'blackhole',
    SEARING_WINDS: 'searing winds',
    VESTMENTS_REGEN: 'vestments regen',
    METEOR_STRIKE_BUFF: 'meteor strike buff',
    SHADOW_IMBUED: 'shadow imbued',
    DEATHMARK: 'deathmark',
    ANIMA_CHARGED: 'anima charged',
    SCRIPTURE_OF_FUL_PROB: 'scripture of ful probability',
    SCRIPTURE_OF_FUL_COOLDOWN_PROB: 'scripture of ful cooldown probability',
    BERSERK: 'berserk',
    DIVINE_RAGE: 'divine rage',
    ECLIPSED_SOUL: 'eclipsed soul',

    // Dungeoneering
    DESPERADO: 'desperado',    

    SHOW_BLOODLUST_STACKS: 'show bloodlust stacks',
    SHOW_PRIMORDIAL_ICE_STACKS: 'show primordial ice stacks',
    SHOW_BOLG_STACKS: 'show bolg stacks',
    SHOW_ICY_CHILL_STACKS: 'show icy chill stacks',
    SHOW_BIK_STACKS: 'show bik stacks',
    SHOW_DEATHSPORE_STACKS: 'show deathspore stacks',
    SHOW_NECROSIS_STACKS: 'show necrosis stacks',
    SHOW_RESIDUAL_SOULS: 'show residual souls',
    SHOW_DEATH_SPARK_STACKS: 'show death spark stacks',
    SHOW_SOUL_REAVE_STACKS: 'show soul reave stacks',
    SHOW_ESSENCE_CORRUPTION: 'show essence corruption',
    SHOW_BLOOD_TITHE: 'show blood tithe',
    SHOW_GLACIAL_EMBRACE: 'show glacial embrace',
    ADRENALINE: 'adrenaline',
    EXPECTED_ADRENALINE: 'expected adrenaline',
    CAP_ADRENALINE: 'cap adrenaline',
    CRIT_BUFF: 'crit buff',
    VIGOUR: 'vigour',
    FURY_OF_THE_SMALL: 'fots',
    HEIGHTENED_SENSES: 'heightened senses',
    CONSERVATION_OF_ENERGY: 'coe',
    POF_DINOS: 'pof dinos',
    POF_DINOS_VALUES: {
        NONE: 'none',
        CORBICULA_1: '1 corbicula',
        CORBICULA_2: '2 corbicula',
    },
    LUNGING: PERKS.LUNGING,
    RUIN: 'ruin',
    VALOUR_STACKS: 'valour stacks',
    HITCAP: 'hit cap',
    USE_OWNED_GEAR: 'use owned gear',
    GEAR_FILTER: 'gear filter',
    GEAR_FILTER_VALUES: {
        POPULAR: 'popular',
        OWNED: 'owned',
        ALL: 'all',
    },
    QUIVER: 'quiver',
    DAMAGE_QUALIFIER: 'damage qualifier',
    DAMAGE_QUALIFIER_VALUES: {
        TOTAL: 'total',
        PER_TICK: 'per tick',
        PER_ADREN: 'per adren',
    },
    MAX_CHANNEL_DURATION: 'max channel duration',
    FLAMEBOUND_RIVAL: 'flamebound rival',


    AUTO_SPEED: 'auto speed',
    AUTO_SPEED_VALUES: {
        FASTEST: 'fastest',
        FAST: 'fast',
        AVERAGE: 'average',
    },
    AUTO_HAND: 'auto hand',
    AUTO_HAND_VALUES: {
        MH: 'main hand',
        OH: 'off hand',
        TH: 'two hand',
    },

    ENERGISING: 'energising',
    ULTIMATUMS: PERKS.ULTIMATUMS,
    BLAST_INFUSED: 'blast infused',
    GCONC_UNLOCK: 'gconc unlock',
    STRENGTH_MASTER_CAPE: 'strength master cape',

    // Testing/utility flags
    USE_RAW_ABILITY_DAMAGE: 'use raw ability damage', // Skip recalculating AD from equipment
};

const settingsConfig = {
    [SETTINGS.MODE]: {
        label: 'Mode',
        default: SETTINGS.MODE_VALUES.MEAN,
        options: [
            { text: 'Mean', value: SETTINGS.MODE_VALUES.MEAN },
            { text: 'Mean no crit', value: SETTINGS.MODE_VALUES.MEAN_NO_CRIT },
            { text: 'Mean crit', value: SETTINGS.MODE_VALUES.MEAN_CRIT },
            { text: 'Min no crit', value: SETTINGS.MODE_VALUES.MIN_NO_CRIT },
            { text: 'Min crit', value: SETTINGS.MODE_VALUES.MIN_CRIT },
            { text: 'Max no crit', value: SETTINGS.MODE_VALUES.MAX_NO_CRIT },
            { text: 'Max crit', value: SETTINGS.MODE_VALUES.MAX_CRIT }
        ]
    },
    [SETTINGS.CALC_TYPE]: {
        label: 'Mode',
        default: SETTINGS.CALC_TYPE_VALUES.ABILITY,
    },
    [SETTINGS.HIT_COUNTER_START]: { 
        label: 'Start hit',
        default: 0
    },
    [SETTINGS.HIT_COUNTER_END]: {
        label: 'End hit',
        default: 0
    },
    [SETTINGS.ABILITY_DAMAGE]: {
        label: 'Override base damage',
        default: 0
    },
    [SETTINGS.NECROMANCY_LEVEL]: {
        label: 'Necromancy Level',
        default: 145,
        style: 'necromancy'
    },
    [SETTINGS.MAGIC_LEVEL]: {
        label: 'Magic Level',
        default: 145,
        style: 'magic'
    },
    [SETTINGS.ATTACK_LEVEL]: {
        label: 'Attack Level',
        default: 145
    },
    [SETTINGS.STRENGTH_LEVEL]: {
        label: 'Strength Level',
        default: 145
    },
    [SETTINGS.RANGED_LEVEL]: {
        label: 'Ranged Level',
        default: 136
    },
    [SETTINGS.POTION]: {
        label: 'Potion',
        default: SETTINGS.POTION_VALUES.ELDER,
        options: [
            { text: 'None', value: SETTINGS.POTION_VALUES.NONE },
            { text: 'Elder overload', value: SETTINGS.POTION_VALUES.ELDER },
            { text: 'Supreme overload', value: SETTINGS.POTION_VALUES.SUPREME },
            { text: 'Overload', value: SETTINGS.POTION_VALUES.OVERLOAD },
            { text: 'Extreme', value: SETTINGS.POTION_VALUES.EXTREME },
            { text: 'Super', value: SETTINGS.POTION_VALUES.SUPER },
            { text: 'Regular', value: SETTINGS.POTION_VALUES.REGULAR }
        ]
    },
    [SETTINGS.HIT_CHANCE]: {
        label: 'Hit chance',
        default: 100
    },
    [SETTINGS.NECROSIS_STACKS]: {
        label: 'Necrosis stacks',
        default: 0
    },
    [SETTINGS.DEATH_SPARK_STACKS]: {
        label: 'Death Spark stacks',
        default: 0
    },
    [SETTINGS.SOUL_REAVE_STACKS]: {
        label: 'Soul Reave stacks',
        default: 0
    },
    [SETTINGS.REAPER_CREW]: {
        label: 'Reaper Crew',
        default: true
    },
    [SETTINGS.MAGIC_PRAYER]: {
        label: 'Prayer',
        default: SETTINGS.MAGIC_PRAYER_VALUES.AFFLICTION,
        options: [
            { text: 'None', value: SETTINGS.MAGIC_PRAYER_VALUES.NONE },
            { text: 'Affliction', value: SETTINGS.MAGIC_PRAYER_VALUES.AFFLICTION },
            { text: 'Torment', value: SETTINGS.MAGIC_PRAYER_VALUES.TORMENT },
            {
                text: 'Leech magic strength 2',
                value: SETTINGS.MAGIC_PRAYER_VALUES.LEECH_MAGIC_STRENGTH_2
            },
            {
                text: 'Leech magic strength 4',
                value: SETTINGS.MAGIC_PRAYER_VALUES.LEECH_MAGIC_STRENGTH_4
            },
            {
                text: 'Leech magic strength 6',
                value: SETTINGS.MAGIC_PRAYER_VALUES.LEECH_MAGIC_STRENGTH_6
            },
            {
                text: 'Leech magic strength 8',
                value: SETTINGS.MAGIC_PRAYER_VALUES.LEECH_MAGIC_STRENGTH_8
            },
            { text: 'Augury', value: SETTINGS.MAGIC_PRAYER_VALUES.AUGURY },
            { text: 'Overcharge', value: SETTINGS.MAGIC_PRAYER_VALUES.OVERCHARGE },
            { text: 'Super charge', value: SETTINGS.MAGIC_PRAYER_VALUES.SUPER_CHARGE },
            { text: 'Charge', value: SETTINGS.MAGIC_PRAYER_VALUES.CHARGE }
        ]
    },
    [SETTINGS.RANGED_PRAYER]: {
        label: 'Prayer',
        default: SETTINGS.RANGED_PRAYER_VALUES.DESOLATION,
        options: [
            { text: 'None', value: SETTINGS.RANGED_PRAYER_VALUES.NONE },
            { text: 'Desolation', value: SETTINGS.RANGED_PRAYER_VALUES.DESOLATION },
            { text: 'Anguish', value: SETTINGS.RANGED_PRAYER_VALUES.ANGUISH},
            {
                text: 'Leech ranged strength 2',
                value: SETTINGS.RANGED_PRAYER_VALUES.LEECH_RANGED_STRENGTH_2
            },
            {
                text: 'Leech ranged strength 4',
                value: SETTINGS.RANGED_PRAYER_VALUES.LEECH_RANGED_STRENGTH_4
            },
            {
                text: 'Leech ranged strength 6',
                value: SETTINGS.RANGED_PRAYER_VALUES.LEECH_RANGED_STRENGTH_6
            },
            {
                text: 'Leech ranged strength 8',
                value: SETTINGS.RANGED_PRAYER_VALUES.LEECH_RANGED_STRENGTH_8
            },
            { text: 'Rigour', value: SETTINGS.RANGED_PRAYER_VALUES.RIGOUR },
            { text: 'Overpowering force', value: SETTINGS.RANGED_PRAYER_VALUES.OVERPOWERING_FORCE },
            { text: 'Unrelenting force', value: SETTINGS.RANGED_PRAYER_VALUES.UNRELENTING_FORCE },
            { text: 'Unstoppable force', value: SETTINGS.RANGED_PRAYER_VALUES.UNSTOPPABLE_FORCE }
        ]
    },
    [SETTINGS.MELEE_PRAYER]: {
        label: 'Prayer',
        default: SETTINGS.MELEE_PRAYER_VALUES.MALEVOLENCE,
        options: [
            { text: 'None', value: SETTINGS.MELEE_PRAYER_VALUES.NONE },
            { text: 'Malevolence', value: SETTINGS.MELEE_PRAYER_VALUES.MALEVOLENCE },
            { text: 'Turmoil', value: SETTINGS.MELEE_PRAYER_VALUES.TURMOIL },
            {
                text: 'Leech melee strength 2',
                value: SETTINGS.MELEE_PRAYER_VALUES.LEECH_MELEE_STRENGTH_2
            },
            {
                text: 'Leech melee strength 4',
                value: SETTINGS.MELEE_PRAYER_VALUES.LEECH_MELEE_STRENGTH_4
            },
            {
                text: 'Leech melee strength 6',
                value: SETTINGS.MELEE_PRAYER_VALUES.LEECH_MELEE_STRENGTH_6
            },
            {
                text: 'Leech melee strength 8',
                value: SETTINGS.MELEE_PRAYER_VALUES.LEECH_MELEE_STRENGTH_8
            },
            { text: 'Piety', value: SETTINGS.MELEE_PRAYER_VALUES.PIETY },
            { text: 'Chivalry', value: SETTINGS.MELEE_PRAYER_VALUES.CHIVALRY },
            { text: 'Ultimate strength', value: SETTINGS.MELEE_PRAYER_VALUES.ULTIMATE_STRENGTH },
            { text: 'Superhuman strength', value: SETTINGS.MELEE_PRAYER_VALUES.SUPERHUMAN_STRENGTH },
            { text: 'Burst of strength', value: SETTINGS.MELEE_PRAYER_VALUES.BURST_OF_STRENGTH }
        ]
    },
    [SETTINGS.NECRO_PRAYER]: {
        label: 'Prayer',
        default: SETTINGS.NECRO_PRAYER_VALUES.RUINATION,
        options: [
            { text: 'None', value: SETTINGS.NECRO_PRAYER_VALUES.NONE },
            { text: 'Ruination', value: SETTINGS.NECRO_PRAYER_VALUES.RUINATION },
            { text: 'Sorrow', value: SETTINGS.NECRO_PRAYER_VALUES.SORROW },
            {
                text: 'Leech necromancy strength 2',
                value: SETTINGS.NECRO_PRAYER_VALUES.LEECH_NECRO_STRENGTH_2
            },
            {
                text: 'Leech necromancy strength 4',
                value: SETTINGS.NECRO_PRAYER_VALUES.LEECH_NECRO_STRENGTH_4
            },
            {
                text: 'Leech necromancy strength 6',
                value: SETTINGS.NECRO_PRAYER_VALUES.LEECH_NECRO_STRENGTH_6
            },
            {
                text: 'Leech necromancy strength 8',
                value: SETTINGS.NECRO_PRAYER_VALUES.LEECH_NECRO_STRENGTH_8
            },
            { text: 'Sanctity', value: SETTINGS.NECRO_PRAYER_VALUES.SANCTITY },
            { text: 'Accelerated Decay', value: SETTINGS.NECRO_PRAYER_VALUES.ACCELERATED_DECAY },
            { text: 'Hastened Decay', value: SETTINGS.NECRO_PRAYER_VALUES.HASTENED_DECAY },
            { text: 'Decay', value: SETTINGS.NECRO_PRAYER_VALUES.DECAY }
        ]
    },
    [SETTINGS.RUBY_AURORA]: {
        label: 'Ruby Aurora',
        default: 0
    },
    [SETTINGS.REVENGE]: {
        label: 'Revenge',
        default: 0
    },
    [SETTINGS.BERSERKERS_FURY]: {
        label: "Berserkers fury",
        default: 0
    },
    [SETTINGS.RUTHLESS_STACKS]: {
        label: 'Ruthless Stacks',
        default: 0
    },
    [SETTINGS.SLAYER_HELM]: {
        label: 'Slayer Helm',
        default: SETTINGS.SLAYER_HELM_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.SLAYER_HELM_VALUES.NONE },
            { text: 'Regular', value: SETTINGS.SLAYER_HELM_VALUES.REGULAR },
            { text: 'Full', value: SETTINGS.SLAYER_HELM_VALUES.FULL },
            { text: 'Reinforced', value: SETTINGS.SLAYER_HELM_VALUES.REINFORCED },
            { text: 'Strong', value: SETTINGS.SLAYER_HELM_VALUES.STRONG },
            { text: 'Mighty', value: SETTINGS.SLAYER_HELM_VALUES.MIGHTY },
            { text: 'Corrupted', value: SETTINGS.SLAYER_HELM_VALUES.CORRUPTED }
        ]
    },
    [SETTINGS.GUARDHOUSE]: {
        label: 'Guardhouse',
        default: SETTINGS.GUARDHOUSE_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.GUARDHOUSE_VALUES.NONE },
            { text: 'Tier 1', value: SETTINGS.GUARDHOUSE_VALUES.LVL1 },
            { text: 'Tier 1 with undead target', value: SETTINGS.GUARDHOUSE_VALUES.LVL1_UNDEAD },
            { text: 'Tier 3', value: SETTINGS.GUARDHOUSE_VALUES.LVL3 },
            { text: 'Tier 3 with undead target', value: SETTINGS.GUARDHOUSE_VALUES.LVL3_UNDEAD }
        ]
    },
    [SETTINGS.TARGET_HP_PERCENT]: {
        label: 'Target hp %',
        default: 50
    },
    [SETTINGS.PLAYER_HP_PERCENT]: {
        label: 'Player hp %',
        default: 100
    },
    [SETTINGS.GENOCIDAL]: {
        label: 'Genocidal %',
        default: 0
    },
    [SETTINGS.IMPATIENT]: {
        label: 'Impatient',
        default: 4
    },
    [SETTINGS.INVIGORATING]: {
        label: 'Invigorating',
        default: 0
    },
    [SETTINGS.AFTERSHOCK]: {
        label: 'Aftershock',
        default: 4
    },
    [SETTINGS.CRACKLING]: {
        label: 'Crackling',
        default: 4
    },
    [SETTINGS.FAMILIAR]: {
        label: 'Familiar',
        default: SETTINGS.FAMILIAR_VALUES.KALGERION_DEMON,
        options: [
            { text: 'None', value: SETTINGS.FAMILIAR_VALUES.NONE },
            { text: 'Ripper demon', value: SETTINGS.FAMILIAR_VALUES.RIPPER_DEMON },
            { text: 'Kalgerion demon', value: SETTINGS.FAMILIAR_VALUES.KALGERION_DEMON },
            { text: 'Steel titan', value: SETTINGS.FAMILIAR_VALUES.STEEL_TITAN }
        ]
    },
    [SETTINGS.FAMILIAR_ACCURACY]: {
        label: 'Familiar Accuracy',
        default: 100,
    },
    [SETTINGS.USE_FAMILIAR_SCROLLS]: {
        label: 'Use Scrolls',
        default: false,
    },
    [SETTINGS.SPIRIT_CAPE]: {
        label: 'Spirit Cape',
        default: true,
    },
    [SETTINGS.SUMMONING_RENEWAL]: {
        label: 'Summoning Renewal',
        default: false,
    },
    [SETTINGS.SPIRIT_WEED_INCENSE]: {
        label: 'Spirit Incense',
        default: SETTINGS.SPIRIT_WEED_INCENSE_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.SPIRIT_WEED_INCENSE_VALUES.NONE },
            { text: 'Potency 1 (10%)', value: SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL1 },
            { text: 'Potency 2 (20%)', value: SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL2 },
            { text: 'Potency 3 (30%)', value: SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL3 },
            { text: 'Potency 4 (40%)', value: SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL4 },
        ]
    },
    [SETTINGS.PRISM_OF_RESTORATION]: {
        label: 'Prism of Restoration',
        default: false,
    },
    [SETTINGS.AURA]: {
        label: 'Aura',
        default: SETTINGS.AURA_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.AURA_VALUES.NONE },
        ]
    },
    [SETTINGS.POISON]: {
        label: 'Poison',
        default: SETTINGS.POISON_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.POISON_VALUES.NONE },
            { text: 'Weapon poison', value: SETTINGS.POISON_VALUES.WEAPON_POISON0 },
            { text: 'Weapon poison+', value: SETTINGS.POISON_VALUES.WEAPON_POISON1 },
            { text: 'Weapon poison++', value: SETTINGS.POISON_VALUES.WEAPON_POISON2 },
            { text: 'Weapon poison+++', value: SETTINGS.POISON_VALUES.WEAPON_POISON3 },
        ]
    },
    [SETTINGS.VULN]: {
        label: 'Vulnerability',
        default: SETTINGS.VULN_VALUES.VULNERABILITY,
        options: [
            { text: 'None', value: SETTINGS.VULN_VALUES.NONE },
            { text: 'Curse', value: SETTINGS.VULN_VALUES.CURSE },
            { text: 'Vuln', value: SETTINGS.VULN_VALUES.VULNERABILITY }
        ]
    },
    [SETTINGS.SMOKE_CLOUD]: {
        label: 'Smoke Cloud',
        default: true
    },
    [SETTINGS.CRYPTBLOOM]: {
        label: 'Cryptbloom Vuln',
        default: false
    },
    [SETTINGS.SLAYER_PERK_UNDEAD]: {
        label: 'Undead Slayer Perk',
        default: false
    },
    [SETTINGS.SLAYER_PERK_DRAGON]: {
        label: 'Dragon Slayer Perk',
        default: false
    },
    [SETTINGS.SLAYER_PERK_DEMON]: {
        label: 'Demon Slayer Perk',
        default: false
    },
    [SETTINGS.DEVOURER_NEXUS]: {
        label: 'Devourer nexus',
        default: false
    },
    [SETTINGS.MELEE_AMMO_SLOT]: {
        label: 'Ammo slot',
        default: ARMOUR.NODON_SPIKE_HARNESS,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Nodon harness', value: ARMOUR.NODON_SPIKE_HARNESS },
        ]
    },
    [SETTINGS.RANGED_AMMO_SLOT]: {
        label: 'Ammo',
        default: ARMOUR.FUL_ARROWS,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Ful arrows', value: ARMOUR.FUL_ARROWS },
            { text: 'Wen arrows', value: ARMOUR.WEN_ARROWS },
            { text: 'Deathspore arrows', value: ARMOUR.DEATHSPORE_ARROWS },
            { text: 'Jas arrows', value: ARMOUR.JAS_ARROWS },
            { text: 'Bik arrows', value: ARMOUR.BIK_ARROWS },
            { text: 'Hydrix bolts (e)', value: ARMOUR.HYDRIX_BAKRIMINEL_BOLTS_E },
        ]
    },
    [SETTINGS.MAGIC_AMMO_SLOT]: {
        label: 'Ammo slot',
        default: 'none',
        options: [
            { text: 'None', value: 'none' },
        ]
    },
    [SETTINGS.NECRO_AMMO_SLOT]: {
        label: 'Ammo slot',
        default: 'none',
        options: [
            { text: 'None', value: 'none' },
        ]
    },
    [SETTINGS.CHANNELLED_MIGHT]: {
        label: 'Channelled Might',
        default: false
    },
    [SETTINGS.GREATER_CHANNELLED_MIGHT]: {
        label: 'Greater Channelled Might',
        default: false
    },
    [SETTINGS.SLAYER_PERK]: {
        label: 'Slayer perk',
        default: SETTINGS.SLAYER_PERK.NONE,
        options: [
            { text: 'None', value: SETTINGS.SLAYER_PERK_VALUES.NONE },
            { text: 'Undead', value: SETTINGS.SLAYER_PERK_VALUES.UNDEAD},
            { text: 'Dragon', value: SETTINGS.SLAYER_PERK_VALUES.DRAGON},
            { text: 'Demon', value: SETTINGS.SLAYER_PERK_VALUES.DEMON},
        ]
    },
    [SETTINGS.UNDEAD_SLAYER_ABILITY]: {
        label: 'Undead slayer ability',
        default: false
    },
    [SETTINGS.DRAGON_SLAYER_ABILITY]: {
        label: 'Dragon slayer Sigil',
        default: false
    },
    [SETTINGS.DEMON_SLAYER_ABILITY]: {
        label: 'Demon slayer Sigil',
        default: false
    },
    [SETTINGS.SLAYER_SIGIL]: {
        label: 'Slayer sigil',
        default: SETTINGS.SLAYER_SIGIL.NONE,
        options: [
            { text: 'None', value: SETTINGS.SLAYER_SIGIL_VALUES.NONE },
            { text: 'Undead', value: SETTINGS.SLAYER_SIGIL_VALUES.UNDEAD},
            { text: 'Dragon', value: SETTINGS.SLAYER_SIGIL_VALUES.DRAGON},
            { text: 'Demon', value: SETTINGS.SLAYER_SIGIL_VALUES.DEMON},
        ]
    },
    [SETTINGS.HAUNTED]: {
        label: 'Haunted',
        default: false
    },
    [SETTINGS.THREADS_OF_FATE]: {
        label: 'Threads of Fate',
        default: false
    },
    [SETTINGS.INVOKE_DEATH]: {
        label: 'Invoke Death',
        default: false
    },
    [SETTINGS.SPLIT_SOUL_NECRO]: {
        label: 'Split Soul (Necro)',
        default: false
    },
    [SETTINGS.HAUNTED_AD]: {
        label: 'Haunted AD',
        default: 2345
    },
    [SETTINGS.SPIRIT_PACT]: {
        label: 'Spirit Pact',
        default: 3,
        options: [
            { text: 'None', value: 0 },
            { text: 'I (+6s)', value: 1 },
            { text: 'II (+12s)', value: 2 },
            { text: 'III (+18s)', value: 3 },
        ]
    },
    [SETTINGS.SKELETON_WARRIOR_RAGE_STACKS]: {
        label: 'Skeleton rage stacks',
        default: 25
    },
    [SETTINGS.NOPE]: {
        label: 'Nope Nope Nope',
        default: 0
    },
    [SETTINGS.KALG_SPEC]: {
        label: 'Crit-i-Kal Spec',
        default: true
    },
    [SETTINGS.CUSTOM_ON_AD]: {
        label: 'Additional on AD buff %',
        default: 0
    },
    [SETTINGS.CUSTOM_ON_HIT]: {
        label: 'Additional on-hit buff %',
        default: 0
    },
    [SETTINGS.CUSTOM_ON_NPC]: {
        label: 'Additional on-npc buff %',
        default: 0
    },
    [SETTINGS.CUSTOM_CRIT]: {
        label: 'Additional crit chance %',
        default: 0
    },
    [SETTINGS.MAGIC_HELMET]: {
        label: 'Helmet',
        default: ARMOUR.TUMEKENS_MASK,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Tumekens resplendence', value: ARMOUR.TUMEKENS_MASK },
            { text: 'Tectonic', value: ARMOUR.TECTONIC_MASK },
            { text: 'Elite tectonic', value: ARMOUR.ELITE_TECTONIC_MASK },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MAGIC_HAT },
            { text: 'Virtus', value: ARMOUR.VIRTUS_MASK },
            { text: 'Sliske', value: ARMOUR.SLISKE_HELM },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_GOGGLES },
        ]
    },
    [SETTINGS.RANGED_HELMET]: {
        label: 'Helmet',
        default: ARMOUR.ELITE_DRACOLICH_COIF,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Sirenic', value: ARMOUR.SIRENIC_MASK },
            { text: 'Elite sirenic', value: ARMOUR.ELITE_SIRENIC_MASK },
            { text: 'Dracolich', value: ARMOUR.DRACOLICH_COIF },
            { text: 'Elite dracolich', value: ARMOUR.ELITE_DRACOLICH_COIF },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_GOGGLES },
        ]
    },
    [SETTINGS.MELEE_HELMET]: {
        label: 'Helmet',
        default: ARMOUR.VESTMENTS_OF_HAVOC_HOOD,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MELEE_HELM },
            { text: 'TMW', value: ARMOUR.TMW_MELEE_HELM },
            { text: 'Vestments', value: ARMOUR.VESTMENTS_OF_HAVOC_HOOD },
            { text: 'Jaws', value: ARMOUR.JAWS_OF_THE_ABYSS },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_GOGGLES },
        ]
    },
    [SETTINGS.NECRO_HELMET]: {
        label: 'Helmet',
        default: ARMOUR.TFN_CROWN,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'TFN', value: ARMOUR.TFN_CROWN },
            { text: 'TFN + addon', value: ARMOUR.TFN_CROWN_WITH_ADDON },
            { text: 't90 deathdealer', value: ARMOUR.DEATHDEALER_HOOD_T90 },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_GOGGLES },
        ]
    },
    [SETTINGS.MAGIC_BODY]: {
        label: 'Body',
        default: ARMOUR.TUMEKENS_ROBE_TOP,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Tumekens resplendence', value: ARMOUR.TUMEKENS_ROBE_TOP },
            { text: 'Tectonic', value: ARMOUR.TECTONIC_ROBE_TOP },
            { text: 'Elite tectonic', value: ARMOUR.ELITE_TECTONIC_ROBE_TOP },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MAGIC_ROBE_TOP },
            { text: 'Virtus', value: ARMOUR.VIRTUS_ROBE_TOP },
            { text: 'Sliske', value: ARMOUR.SLISKE_BODY },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_BODY },
        ]
    },
    [SETTINGS.RANGED_BODY]: {
        label: 'Body',
        default: ARMOUR.ELITE_DRACOLICH_HAUBERK,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Sirenic', value: ARMOUR.SIRENIC_HAUBERK },
            { text: 'Elite sirenic', value: ARMOUR.ELITE_SIRENIC_HAUBERK },
            { text: 'Dracolich', value: ARMOUR.DRACOLICH_HAUBERK },
            { text: 'Elite dracolich', value: ARMOUR.ELITE_DRACOLICH_HAUBERK },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_BODY},
        ]
    },
    [SETTINGS.MELEE_BODY]: {
        label: 'Body',
        default: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_TOP,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Bandos', value: ARMOUR.BANDOS_CHESTPLATE },
            { text: 'Torva', value: ARMOUR.TORVA_PLATEBODY },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MELEE_PLATEBODY },
            { text: 'TMW', value: ARMOUR.TMW_MELEE_PLATEBODY },
            { text: 'Vestments', value: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_TOP },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_BODY},
        ]
    },
    [SETTINGS.NECRO_BODY]: {
        label: 'Body',
        default: ARMOUR.TFN_ROBE_TOP,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'TFN', value: ARMOUR.TFN_ROBE_TOP },
            { text: 't90 deathdealer', value: ARMOUR.DEATHDEALER_ROBE_TOP_T90 },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_BODY},
        ]
    },
    [SETTINGS.MAGIC_LEGS]: {
        label: 'Legs',
        default: ARMOUR.TUMEKENS_ROBE_BOTTOM,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Tumekens resplendence', value: ARMOUR.TUMEKENS_ROBE_BOTTOM },
            { text: 'Tectonic', value: ARMOUR.TECTONIC_ROBE_BOTTOM },
            { text: 'Elite tectonic', value: ARMOUR.ELITE_TECTONIC_ROBE_BOTTOM },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MAGIC_ROBE_BOTTOM },
            { text: 'Virtus', value: ARMOUR.VIRTUS_ROBE_LEGS },
            { text: 'Sliske', value: ARMOUR.SLISKE_LEGS },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_LEGS},
        ]
    },
    [SETTINGS.RANGED_LEGS]: {
        label: 'Legs',
        default: ARMOUR.ELITE_DRACOLICH_CHAPS,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Sirenic', value: ARMOUR.SIRENIC_CHAPS },
            { text: 'Elite sirenic', value: ARMOUR.ELITE_SIRENIC_CHAPS },
            { text: 'Dracolich', value: ARMOUR.DRACOLICH_CHAPS },
            { text: 'Elite dracolich', value: ARMOUR.ELITE_DRACOLICH_CHAPS },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_LEGS},
        ]
    },
    [SETTINGS.MELEE_LEGS]: {
        label: 'Legs',
        default: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_BOTTOM,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Bandos', value: ARMOUR.BANDOS_TASSETS },
            { text: 'Torva', value: ARMOUR.TORVA_PLATELEGS },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MELEE_PLATELEGS },
            { text: 'TMW', value: ARMOUR.TMW_MELEE_PLATELEGS },
            { text: 'Vestments', value: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_BOTTOM },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_LEGS},
        ]
    },
    [SETTINGS.NECRO_LEGS]: {
        label: 'Legs',
        default: ARMOUR.TFN_ROBE_BOTTOM,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'TFN', value: ARMOUR.TFN_ROBE_BOTTOM },
            { text: 't90 deathdealer', value: ARMOUR.DEATHDEALER_ROBE_BOTTOM_T90 },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_LEGS},
        ]
    },
    [SETTINGS.MAGIC_GLOVES]: {
        label: 'Gloves',
        default: ARMOUR.TUMEKENS_GLOVES,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Tumekens resplendence', value: ARMOUR.TUMEKENS_GLOVES },
            { text: 'DTB', value: ARMOUR.DEATHTOUCH_BRACELET },
            { text: 'Cinderbanes', value: ARMOUR.CINDERBANE_GLOVES },
            { text: 'Kerrywaps', value: ARMOUR.KERAPACS_WRISTWRAPS },
            { text: 'Kerrywaps+', value: ARMOUR.KERAPACS_WRISTWRAPS_E },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MAGIC_GLOVES },
            { text: 'Tuska', value: ARMOUR.TUSKA_GAUNTLETS },
        ]
    },
    [SETTINGS.RANGED_GLOVES]: {
        label: 'Gloves',
        default: ARMOUR.ELITE_DRACOLICH_VAMBRACES,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Dracolich', value: ARMOUR.DRACOLICH_VAMBRACES },
            { text: 'Elite dracolich', value: ARMOUR.ELITE_DRACOLICH_VAMBRACES },
            { text: 'DTB', value: ARMOUR.DEATHTOUCH_BRACELET },
            { text: 'Cinderbanes', value: ARMOUR.CINDERBANE_GLOVES },
            { text: 'Nightmares', value: ARMOUR.NIGHTMARE_GAUNTLETS },
            { text: 'Nightmares+', value: ARMOUR.NIGHTMARE_GAUNTLETS_E },
        ]
    },
    [SETTINGS.MELEE_GLOVES]: {
        label: 'Gloves',
        default: ARMOUR.CINDERBANE_GLOVES,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'DTB', value: ARMOUR.DEATHTOUCH_BRACELET },
            { text: 'Cinderbanes', value: ARMOUR.CINDERBANE_GLOVES },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MELEE_GLOVES },
            { text: 'TMW', value: ARMOUR.TMW_MELEE_GLOVES },
            { text: 'GoP', value: ARMOUR.GLOVES_OF_PASSAGE },
            { text: 'GoP+', value: ARMOUR.GLOVES_OF_PASSAGE_E },
        ]
    },
    [SETTINGS.NECRO_GLOVES]: {
        label: 'Gloves',
        default: ARMOUR.TFN_HAND_WRAP,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'TFN', value: ARMOUR.TFN_HAND_WRAP },
            { text: 't90 deathdealer', value: ARMOUR.DEATHDEALER_GLOVES_T90 },
            { text: 'DTB', value: ARMOUR.DEATHTOUCH_BRACELET },
            { text: 'Cinderbane gloves', value: ARMOUR.CINDERBANE_GLOVES },
        ]
    },
    [SETTINGS.MAGIC_BOOTS]: {
        label: 'Boots',
        default: ARMOUR.TUMEKENS_BOOTS,
        options: [
            { text: 'None/Tank', value: ARMOUR.NONE_TANK },
            { text: 'Tumekens resplendence', value: ARMOUR.TUMEKENS_BOOTS },
            { text: 'Blast diff', value: ARMOUR.BLAST_DIFFUSION_BOOTS },
            { text: 'Blast diff+', value: ARMOUR.BLAST_DIFFUSION_BOOTS_E },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MAGIC_BOOTS },
            { text: 'Tuska', value: ARMOUR.TUSKA_BOOTS },
            { text: 'Silverhawks', value: ARMOUR.SILVERHAWK_BOOTS },
        ]
    },
    [SETTINGS.RANGED_BOOTS]: {
        label: 'Boots',
        default: ARMOUR.ELITE_DRACOLICH_BOOTS,
        options: [
            { text: 'None/Tank', value: 'none' },
            { text: 'Dracolich', value: ARMOUR.DRACOLICH_BOOTS },
            { text: 'Elite dracolich', value: ARMOUR.ELITE_DRACOLICH_BOOTS },
            { text: 'Fleeting', value: ARMOUR.FLEETING_BOOTS },
            { text: 'Enhanced fleeting', value: ARMOUR.FLEETING_BOOTS_E },
            { text: 'Silverhawks', value: ARMOUR.SILVERHAWK_BOOTS }
        ]
    },
    [SETTINGS.MELEE_BOOTS]: {
        label: 'Boots',
        default: ARMOUR.VESTMENTS_OF_HAVOC_BOOTS,
        options: [
            { text: 'None/Tank', value: 'none' },
            { text: 'Laceration', value: ARMOUR.LACERATION_BOOTS },
            { text: 'Enhanced lac', value: ARMOUR.LACERATION_BOOTS_E },
            { text: 'Silverhawks', value: ARMOUR.SILVERHAWK_BOOTS },
            { text: 'Masterwork', value: ARMOUR.MASTERWORK_MELEE_BOOTS },
            { text: 'TMW', value: ARMOUR.TMW_MELEE_BOOTS },
            { text: 'Vestments', value: ARMOUR.VESTMENTS_OF_HAVOC_BOOTS }
        ]
    },
    [SETTINGS.NECRO_BOOTS]: {
        label: 'Boots',
        default: ARMOUR.TFN_FOOT_WRAPS,
        options: [
            { text: 'None/Tank', value: 'none' },
            { text: 'TFN', value: ARMOUR.TFN_FOOT_WRAPS },
            { text: 't90 deathdealer', value: ARMOUR.DEATHDEALER_BOOTS_T90 },
            { text: 'Silverhawks', value: ARMOUR.SILVERHAWK_BOOTS }
        ]
    },
    [SETTINGS.NECKLACE]: {
        label: 'Necklace',
        default: ARMOUR.EOF_OR,
        options: [
            { text: 'None/Tank', value: 'none' },
            { text: 'EOF(or)', value: ARMOUR.EOF_OR },
            { text: 'EOF', value: ARMOUR.EOF },
            { text: 'Moonstone amulet', value: ARMOUR.CONJURERS_RAISING_AMULET },
            { text: 'AOS(or)', value: ARMOUR.AOS_OR },
            { text: 'AOS', value: ARMOUR.AOS },
            { text: 'Reaper(or)', value: ARMOUR.REAPER_NECKLACE_OR },
            { text: 'Reaper', value: ARMOUR.REAPER_NECKLACE },
            { text: 'Salve (e)', value: ARMOUR.SALVE_AMULET_E },
            { text: 'Salve', value: ARMOUR.SALVE_AMULET },
            { text: 'Zealots', value: ARMOUR.AMULET_OF_ZEALOTS },
            { text: 'Berserker', value: ARMOUR.BERSERKER_NECKLACE },
            { text: 'Desert ammy 4', value: ARMOUR.DESERT_AMULET_4 },
            { text: 'Blood fury', value: ARMOUR.BLOOD_AMULET_OF_FURY },
            { text: 'Arcane blood', value: ARMOUR.ARCANE_BLOOD_NECKLACE },
            { text: "Brawler's blood", value: ARMOUR.BRAWLERS_BLOOD_NECKLACE },
            { text: 'Farsight blood', value: ARMOUR.FARSIGHT_BLOOD_NECKLACE },
            { text: 'Am-zi', value: ARMOUR.AM_ZI },
            { text: 'Am-hej', value: ARMOUR.AM_HEJ },
            { text: 'Dragon rider', value: ARMOUR.DRAGON_RIDER_AMULET },
        ]
    },
    [SETTINGS.CAPE]: {
        label: 'Cape',
        default: ARMOUR.IGNEOUS_KAL_ZUK,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Zuk', value: ARMOUR.IGNEOUS_KAL_ZUK },
            { text: 'Comp cape', value: ARMOUR.COMP_MAX_CAPE },
            { text: 'Ghost hunter', value: ARMOUR.GHOST_HUNTER_BACKPACK },
            { text: 'Tuska', value: ARMOUR.TUSKA_CAPE },
        ]
    },
    [SETTINGS.RING]: {
        label: 'Ring',
        default: ARMOUR.REAVERS_RING,
        options: [
            { text: 'None', value: 'none' },
            { text: "Reaver's", value: ARMOUR.REAVERS_RING },
            { text: "Zorg/Occ", value: ARMOUR.ZORGOTHS_SOUL_RING },
            { text: 'ROD (i)', value: ARMOUR.RING_OF_DEATH_I },
            { text: 'ROD', value: ARMOUR.RING_OF_DEATH },
            { text: 'ASR (i)', value: ARMOUR.ASYLUM_SURGEONS_RING_I },
            { text: 'ASR', value: ARMOUR.ASYLUM_SURGEONS_RING },
            { text: 'Channeler', value: ARMOUR.CHANNELLERS_RING },
            { text: 'Channeller+', value: ARMOUR.CHANNELLERS_RING_E },
            { text: 'Stalker', value: ARMOUR.STALKERS_RING },
            { text: 'Stalker+', value: ARMOUR.STALKERS_RING_E },
            { text: 'Champion', value: ARMOUR.CHAMPIONS_RING },
            { text: 'Champion+', value: ARMOUR.CHAMPIONS_RING_E },
            { text: 'LOTD', value: ARMOUR.LUCK_OF_THE_DWARVES },
            { text: 'LOTD (i)', value: ARMOUR.LUCK_OF_THE_DWARVES_I },
            { text: 'HSR', value: ARMOUR.HAZELMERES_SIGNET_RING },
            { text: 'HSR (i)', value: ARMOUR.HAZELMERES_SIGNET_RING_I },
            { text: 'Tokkul-Zo', value: ARMOUR.TOKKUL_ZO },
        ]
    },
    [SETTINGS.MAGIC_RING]: {
        label: 'Ring',
        default: ARMOUR.REAVERS_RING,
    },
    [SETTINGS.RANGED_RING]: {
        label: 'Ring',
        default: ARMOUR.STALKERS_RING_E,
    },
    [SETTINGS.MELEE_RING]: {
        label: 'Ring',
        default: ARMOUR.REAVERS_RING,
    },
    [SETTINGS.NECRO_RING]: {
        label: 'Ring',
        default: ARMOUR.REAVERS_RING,
    },
    [SETTINGS.MAGIC_NECKLACE]: {
        label: 'Necklace',
        default: ARMOUR.EOF_OR,
    },
    [SETTINGS.RANGED_NECKLACE]: {
        label: 'Necklace',
        default: ARMOUR.EOF_OR,
    },
    [SETTINGS.MELEE_NECKLACE]: {
        label: 'Necklace',
        default: ARMOUR.EOF_OR,
    },
    [SETTINGS.NECRO_NECKLACE]: {
        label: 'Necklace',
        default: ARMOUR.EOF_OR,
    },
    [SETTINGS.MAGIC_CAPE]: {
        label: 'Cape',
        default: ARMOUR.IGNEOUS_KAL_ZUK,
    },
    [SETTINGS.RANGED_CAPE]: {
        label: 'Cape',
        default: ARMOUR.IGNEOUS_KAL_ZUK,
    },
    [SETTINGS.MELEE_CAPE]: {
        label: 'Cape',
        default: ARMOUR.IGNEOUS_KAL_ZUK,
    },
    [SETTINGS.NECRO_CAPE]: {
        label: 'Cape',
        default: ARMOUR.IGNEOUS_KAL_ZUK,
    },
    [SETTINGS.MAGIC_POCKET]: {
        label: 'Pocket',
        default: ARMOUR.ERETHDORS_GRIMOIRE,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Grimoire (active)', value: ARMOUR.ERETHDORS_GRIMOIRE },
            { text: 'Chaotic grim (active)', value: ARMOUR.CHAOTIC_GRIMOIRE },
            { text: 'Ful (active)', value: ARMOUR.FUL_BOOK },
            { text: 'Jas (active)', value: ARMOUR.JAS_BOOK },
            { text: 'Amascut (active)', value: ARMOUR.AMASCUT_BOOK },
            { text: 'New god book (inactive)', value: ARMOUR.GWD3_SCRIPTURE },
            { text: 'OG god book', value: ARMOUR.ILLUMINATED_GOD_BOOK },
            { text: 'Underworld grim', value: ARMOUR.UNDERWORLD_GRIMOIRE_4 },
            { text: 'Elements', value: ARMOUR.SCRIMSHAW_OF_ELEMENTS },
            { text: 'Superior elements', value: ARMOUR.SUPERIOR_SCRIMSHAW_OF_ELEMENTS }
        ]
    },
    [SETTINGS.RANGED_POCKET]: {
        label: 'Pocket',
        default: ARMOUR.FUL_BOOK,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Grimoire (active)', value: ARMOUR.ERETHDORS_GRIMOIRE },
            { text: 'Chaotic grim (active)', value: ARMOUR.CHAOTIC_GRIMOIRE },
            { text: 'Ful (active)', value: ARMOUR.FUL_BOOK },
            { text: 'Jas (active)', value: ARMOUR.JAS_BOOK },
            { text: 'Amascut (active)', value: ARMOUR.AMASCUT_BOOK },
            { text: 'New god book (inactive)', value: ARMOUR.GWD3_SCRIPTURE },
            { text: 'OG god book', value: ARMOUR.ILLUMINATED_GOD_BOOK },
            { text: 'Underworld grim', value: ARMOUR.UNDERWORLD_GRIMOIRE_4 },
            { text: 'Cruelty', value: ARMOUR.SCRIMSHAW_OF_CRUELTY },
            { text: 'Superior cruelty', value: ARMOUR.SUPERIOR_SCRIMSHAW_OF_CRUELTY }
        ]
    },
    [SETTINGS.MELEE_POCKET]: {
        label: 'Pocket',
        default: ARMOUR.ERETHDORS_GRIMOIRE,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Grimoire (active)', value: ARMOUR.ERETHDORS_GRIMOIRE },
            { text: 'Chaotic grim (active)', value: ARMOUR.CHAOTIC_GRIMOIRE },
            { text: 'Ful (active)', value: ARMOUR.FUL_BOOK },
            { text: 'Jas (active)', value: ARMOUR.JAS_BOOK },
            { text: 'Amascut (active)', value: ARMOUR.AMASCUT_BOOK },
            { text: 'New god book (inactive)', value: ARMOUR.GWD3_SCRIPTURE },
            { text: 'OG god book', value: ARMOUR.ILLUMINATED_GOD_BOOK },
            { text: 'Underworld grim', value: ARMOUR.UNDERWORLD_GRIMOIRE_4 }
        ]
    },
    [SETTINGS.NECRO_POCKET]: {
        label: 'Pocket',
        default: ARMOUR.FUL_BOOK,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Grimoire (active)', value: ARMOUR.ERETHDORS_GRIMOIRE },
            { text: 'Chaotic grim (active)', value: ARMOUR.CHAOTIC_GRIMOIRE },
            { text: 'Ful (active)', value: ARMOUR.FUL_BOOK },
            { text: 'Jas (active)', value: ARMOUR.JAS_BOOK },
            { text: 'Amascut (active)', value: ARMOUR.AMASCUT_BOOK },
            { text: 'New god book (inactive)', value: ARMOUR.GWD3_SCRIPTURE },
            { text: 'OG god book', value: ARMOUR.ILLUMINATED_GOD_BOOK },
            { text: 'Underworld grim', value: ARMOUR.UNDERWORLD_GRIMOIRE_4 }
        ]
    },
    [SETTINGS.POCKET]: {
        label: 'Pocket',
        default: ARMOUR.ERETHDORS_GRIMOIRE,
        options: [
            { text: 'None', value: 'none' },
            { text: 'Grimoire (active)', value: ARMOUR.ERETHDORS_GRIMOIRE },
            { text: 'Chaotic grim (active)', value: ARMOUR.CHAOTIC_GRIMOIRE },
            { text: 'Ful (active)', value: ARMOUR.FUL_BOOK },
            { text: 'Jas (active)', value: ARMOUR.JAS_BOOK },
            { text: 'Amascut (active)', value: ARMOUR.AMASCUT_BOOK },
            { text: 'New god book (inactive)', value: ARMOUR.GWD3_SCRIPTURE },
            { text: 'OG god book', value: ARMOUR.ILLUMINATED_GOD_BOOK },
            { text: 'Underworld grim', value: ARMOUR.UNDERWORLD_GRIMOIRE_4 },
            { text: 'Elements', value: ARMOUR.SCRIMSHAW_OF_ELEMENTS },
            { text: 'Superior elements', value: ARMOUR.SUPERIOR_SCRIMSHAW_OF_ELEMENTS },
            { text: 'Cruelty', value: ARMOUR.SCRIMSHAW_OF_CRUELTY },
            { text: 'Superior cruelty', value: ARMOUR.SUPERIOR_SCRIMSHAW_OF_CRUELTY },
        ]
    },
    [SETTINGS.WEAPON]: {
        label: 'Weapon type',
        default: {
            melee: SETTINGS.WEAPON_VALUES.TH,
            ranged: SETTINGS.WEAPON_VALUES.TH,
            magic: SETTINGS.WEAPON_VALUES.TH,
            necromancy: SETTINGS.WEAPON_VALUES.DW,
            rotation: SETTINGS.WEAPON_VALUES.TH
        },
        options: [
            { text: 'Dual wield', value: SETTINGS.WEAPON_VALUES.DW },
            { text: 'Two handed', value: SETTINGS.WEAPON_VALUES.TH }
        ]
    },
    [SETTINGS.WEAPON_TYPE_MAGE]: {
        label: 'Weapon type',
        default: SETTINGS.WEAPON_VALUES.TH,
        options: [
            { text: 'Dual wield', value: SETTINGS.WEAPON_VALUES.DW },
            { text: 'Two handed', value: SETTINGS.WEAPON_VALUES.TH }
        ]
    },
    [SETTINGS.WEAPON_TYPE_MELEE]: {
        label: 'Weapon type',
        default: SETTINGS.WEAPON_VALUES.DW,
        options: [
            { text: 'Dual wield', value: SETTINGS.WEAPON_VALUES.DW },
            { text: 'Two handed', value: SETTINGS.WEAPON_VALUES.TH }
        ]
    },
    [SETTINGS.WEAPON_TYPE_RANGED]: {
        label: 'Weapon type',
        default: SETTINGS.WEAPON_VALUES.TH,
        options: [
            { text: 'Dual wield', value: SETTINGS.WEAPON_VALUES.DW },
            { text: 'Two handed', value: SETTINGS.WEAPON_VALUES.TH }
        ]
    },
    [SETTINGS.WEAPON_TYPE_NECRO]: {
        label: 'Weapon type',
        default: SETTINGS.WEAPON_VALUES.DW,
        options: [
            { text: 'Dual wield', value: SETTINGS.WEAPON_VALUES.DW }
        ]
    },
    [SETTINGS.MAGIC_MH]: {
        label: 'Mh',
        default: SETTINGS.MAGIC_MH_VALUES.ROAR_OF_AWAKENING,
        options: [
            { text: 'Custom', value: SETTINGS.MAGIC_MH_VALUES.CUSTOM },
            { text: 'Roar of Awakening', value: SETTINGS.MAGIC_MH_VALUES.ROAR_OF_AWAKENING },
            { text: 'Roar of Awakening [IM]', value: SETTINGS.MAGIC_MH_VALUES.ROAR_OF_AWAKENING_IM },
        ]
    },
    [SETTINGS.RANGED_MH]: {
        label: 'Mh',
        default: SETTINGS.RANGED_TH_VALUES.BOLG_IM,
        options: [
            { text: 'Custom', value: SETTINGS.RANGED_MH_VALUES.CUSTOM },
            { text: 'Blightbound', value: SETTINGS.RANGED_MH_VALUES.BLIGHTBOUND },
        ]
    },
    [SETTINGS.MELEE_MH]: {
        label: 'Mh',
        default: SETTINGS.MELEE_MH_VALUES.LENG,
        options: [
            { text: 'Custom', value: SETTINGS.MELEE_MH_VALUES.CUSTOM },
            { text: 'Leng', value: SETTINGS.MELEE_MH_VALUES.LENG },
            { text: 'Leng [IM]', value: SETTINGS.MELEE_MH_VALUES.LENG_IM },
            { text: 'Leng t85', value: SETTINGS.MELEE_MH_VALUES.DARK_ICE_SHARD },
            { text: 'Consecrated Keris no proc', value: SETTINGS.MELEE_MH_VALUES.CONSECRATED_KERIS },
            { text: 'Consecrated Keris proc', value: SETTINGS.MELEE_MH_VALUES.CONSECRATED_KERIS_PROC },
            { text: 'Primed Keris no proc', value: SETTINGS.MELEE_MH_VALUES.PRIMED_KERIS },
            { text: 'Primed Keris proc', value: SETTINGS.MELEE_MH_VALUES.PRIMED_KERIS_PROC },
            { text: 'Keris no proc', value: SETTINGS.MELEE_MH_VALUES.KERIS },
            { text: 'Keris proc', value: SETTINGS.MELEE_MH_VALUES.KERIS_PROC },
        ]
    },
    [SETTINGS.NECRO_MH]: {
        label: 'Mh',
        default: SETTINGS.NECRO_MH_VALUES.OMNI_GUARD_IM,
        options: [
            { text: 'Custom', value: SETTINGS.NECRO_MH_VALUES.CUSTOM },
            { text: 'Omni Guard', value: SETTINGS.NECRO_MH_VALUES.OMNI_GUARD },
            { text: 'Omni Guard [IM]', value: SETTINGS.NECRO_MH_VALUES.OMNI_GUARD_IM },
            { text: "Devourer's Guard", value: SETTINGS.NECRO_MH_VALUES.DEVOURERS_GUARD },
            { text: "Devourer's Guard [IM]", value: SETTINGS.NECRO_MH_VALUES.DEVOURERS_GUARD_IM }
        ]
    },
    [SETTINGS.MAGIC_OH]: {
        label: 'Oh',
        default: SETTINGS.MAGIC_OH_VALUES.ODE_TO_DECEIT,
        options: [
            { text: 'Custom', value: SETTINGS.MAGIC_OH_VALUES.CUSTOM },
            { text: 'Ode to Deceit', value: SETTINGS.MAGIC_OH_VALUES.ODE_TO_DECEIT },
            { text: 'Ode to Deceit [IM]', value: SETTINGS.MAGIC_OH_VALUES.ODE_TO_DECEIT_IM },
            { text: 'Custom shield', value: SETTINGS.MAGIC_OH_VALUES.CUSTOM_SHIELD }
        ]
    },
    [SETTINGS.RANGED_OH]: {
        label: 'Oh',
        default: SETTINGS.RANGED_OH_VALUES.CUSTOM,
        options: [
            { text: 'Custom', value: SETTINGS.RANGED_OH_VALUES.CUSTOM },
            { text: 'Custom shield', value: SETTINGS.RANGED_OH_VALUES.CUSTOM_SHIELD },
            { text: 'Blightbound OH', value: SETTINGS.RANGED_OH_VALUES.BLIGHTBOUND }
        ]
    },
    [SETTINGS.MELEE_OH]: {
        label: 'Oh',
        default: SETTINGS.MELEE_OH_VALUES.LENG,
        options: [
            { text: 'Custom', value: SETTINGS.MELEE_OH_VALUES.CUSTOM },
            { text: 'Custom shield', value: SETTINGS.MELEE_OH_VALUES.CUSTOM_SHIELD },
            { text: 'Leng', value: SETTINGS.MELEE_OH_VALUES.LENG },
            { text: 'Leng [IM]', value: SETTINGS.MELEE_OH_VALUES.LENG_IM },
            { text: 'Leng t85', value: SETTINGS.MELEE_OH_VALUES.DARK_ICE_SLIVER }
        ]
    },
    [SETTINGS.NECRO_OH]: {
        label: 'Oh',
        default: SETTINGS.NECRO_OH_VALUES.SOULBOUND_LANTERN_IM,
        options: [
            { text: 'Custom', value: SETTINGS.NECRO_OH_VALUES.CUSTOM },
            { text: 'Custom shield', value: SETTINGS.NECRO_OH_VALUES.CUSTOM_SHIELD },
            { text: 'Soulbound Lantern', value: SETTINGS.NECRO_OH_VALUES.SOULBOUND_LANTERN },
            { text: 'Soulbound Lantern [IM]', value: SETTINGS.NECRO_OH_VALUES.SOULBOUND_LANTERN_IM },
            { text: 'Spectral shield', value: SETTINGS.NECRO_OH_VALUES.SPECTRAL }
        ]
    },
    [SETTINGS.MAGIC_TH]: {
        label: '2h',
        default: SETTINGS.MAGIC_TH_VALUES.FSOA_IM,
        options: [
            { text: 'Custom', value: SETTINGS.MAGIC_TH_VALUES.CUSTOM },
            { text: 'Inq', value: SETTINGS.MAGIC_TH_VALUES.INQ_STAFF },
            { text: 'Inq+', value: SETTINGS.MAGIC_TH_VALUES.INQ_STAFF_E },
            { text: 'FSOA (+22.5% crit dmg)', value: SETTINGS.MAGIC_TH_VALUES.FSOA },
            { text: 'FSOA [IM]', value: SETTINGS.MAGIC_TH_VALUES.FSOA_IM },
        ]
    },
    [SETTINGS.RANGED_TH]: {
        label: '2h',
        default: SETTINGS.RANGED_TH_VALUES.BOLG_IM,
        options: [
            { text: 'Custom', value: SETTINGS.RANGED_TH_VALUES.CUSTOM },
            { text: 'Bow of the Last Guardian', value: SETTINGS.RANGED_TH_VALUES.BOLG },
            { text: 'BOLG [IM]', value: SETTINGS.RANGED_TH_VALUES.BOLG_IM },
            { text: 'Hex', value: SETTINGS.RANGED_TH_VALUES.HEX },
            { text: 'Hex+', value: SETTINGS.RANGED_TH_VALUES.HEX_E }
        ]
    },
    [SETTINGS.MELEE_TH]: {
        label: '2h',
        default: SETTINGS.MELEE_TH_VALUES.EZK_IM,
        options: [
            { text: 'Custom', value: SETTINGS.MELEE_TH_VALUES.CUSTOM },
            { text: 'Terrasaur maul', value: SETTINGS.MELEE_TH_VALUES.T_MAUL },
            { text: 'Terrasaur maul+', value: SETTINGS.MELEE_TH_VALUES.T_MAUL_E },
            { text: 'MW Spear', value: SETTINGS.MELEE_TH_VALUES.MW_SPEAR},
            { text: 'EZK', value: SETTINGS.MELEE_TH_VALUES.EZK},
            { text: 'EZK [IM]', value: SETTINGS.MELEE_TH_VALUES.EZK_IM},
        ]
    },
    [SETTINGS.NECRO_TH]: {
        label: '2h',
        default: SETTINGS.NECRO_TH_VALUES.NONE,
        options: [{ text: 'Custom', value: SETTINGS.NECRO_TH_VALUES.CUSTOM }]
    },
    [SETTINGS.AMMO]: {
        label: 'Ammo',
        default: ARMOUR.WEN_ARROWS,
        options: [
            { text: 'Custom', value: ARMOUR.CUSTOM },
            { text: 'Ful', value: ARMOUR.FUL_ARROWS },
            { text: 'Wen', value: ARMOUR.WEN_ARROWS },
            { text: 'Jas', value: ARMOUR.JAS_ARROWS },
            { text: 'Deathspore arrows', value: ARMOUR.DEATHSPORE_ARROWS },
            { text: 'Bik arrows', value: ARMOUR.BIK_ARROWS },
            { text: 'Hydrix bolts (e)', value: ARMOUR.HYDRIX_BAKRIMINEL_BOLTS_E }
        ]
    },
    [SETTINGS.AMMO_TIER]: {
        label: 'Ammo tier',
        default: 99
    },
    [SETTINGS.AUTO_CAST]: {
        label: 'Auto cast',
        default: SETTINGS.AUTO_CAST_VALUES.INCITE_FEAR,
        options: [
            { text: 'Vanilla', value: SETTINGS.AUTO_CAST_VALUES.NONE },
            { text: 'Crumble Undead', value: SETTINGS.AUTO_CAST_VALUES.CRUMBLE_UNDEAD },
            { text: 'Exsanguinate', value: SETTINGS.AUTO_CAST_VALUES.EXSANGUINATE },
            { text: 'Incite Fear', value: SETTINGS.AUTO_CAST_VALUES.INCITE_FEAR },
        ]
    },
    [SETTINGS.LVL20ARMOUR]: {
        label: 'Level 20 Armour',
        default: true
    },
    [SETTINGS.BITING]: {
        label: 'Biting',
        default: 4
    },
    [SETTINGS.PRECISE]: {
        label: 'Precise',
        default: 6
    },
    [SETTINGS.ERUPTIVE]: {
        label: 'Eruptive',
        default: 2
    },
    [SETTINGS.FLANKING]: {
        label: 'Flanking',
        default: 0
    },
    [SETTINGS.EQ_PERK]: {
        label: 'Equilibrium',
        default: 0
    },
    [SETTINGS.RUTHLESS_RANK]: {
        label: 'Ruthless rank',
        default: 0
    },
    [SETTINGS.TELOS_RED_BEAM]: {
        label: 'Red Beam',
        default: false
    },
    [SETTINGS.TELOS_BLACK_BEAM]: {
        label: 'Black Beam',
        default: false
    },
    [SETTINGS.TOKKUL_ZO]: {
        label: 'Tokkul-zo',
        default: false
    },
    [SETTINGS.KBD_ARTEFACT]: {
        label: 'KBD Artefact',
        default: false
    },
    [SETTINGS.INNER_CHAOS]: {
        label: 'Inner Chaos',
        default: false
    },
    [SETTINGS.SWORD_OF_EDICTS]: {
        label: 'Sword of Edicts',
        default: false
    },
    [SETTINGS.BOSS_PRESET]: {
        label: 'Boss Preset',
        default: 'none',
        options: [{value: 'none', text: 'None'}],
    },
    [SETTINGS.BOSS_ENRAGE]: {
        label: 'Boss Enrage',
        default: 0
    },
    [SETTINGS.BOSS_PATTERN_START]: {
        label: 'Start Tick',
        default: -1
    },
    [SETTINGS.BOSS_HP]: {
        label: 'Boss HP',
        default: 0
    },
    [SETTINGS.GUARDIANS_TRIUMPH]: {
        label: 'Guardians Triumph',
        default: 0
    },
    [SETTINGS.BALANCE_OF_POWER]: {
        label: 'Balance of power',
        default: 0
    },
    [SETTINGS.ZAMORAK_CHOKE_STACKS]: {
        label: 'Zamorak choke stacks',
        default: 0
    },
    [SETTINGS.RAKSHA_INNER_POWER]: {
        label: 'Inner power (Raksha)',
        default: 0
    },
    [SETTINGS.STONE_OF_JAS]: {
        label: 'Stone of Jas %',
        default: 0
    },
    [SETTINGS.INFERNAL_PUZZLE_BOX]: {
        label: 'Infernal Puzzle Box %',
        default: 0
    },
    [SETTINGS.RESIDUAL_SOULS]: {
        label: 'Residual Souls',
        default: 0
    },

    [SETTINGS.DAMAGE_PER_UNIT]: {
        label: 'Damage per',
        default: SETTINGS.DAMAGE_PER_UNIT_VALUES.ABIL,
        options: [
            { text: 'abil', value: SETTINGS.DAMAGE_PER_UNIT_VALUES.ABIL },
            { text: 'tick', value: SETTINGS.DAMAGE_PER_UNIT_VALUES.TICK },
        ]
    },
    [SETTINGS.DAMAGE_UNITS]: {
        label: 'Damage result',
        default: SETTINGS.DAMAGE_UNITS_VALUES.RAW,
        options: [
            { text: 'Raw', value: SETTINGS.DAMAGE_UNITS_VALUES.RAW },
            { text: 'AD%', value: SETTINGS.DAMAGE_UNITS_VALUES.PERCENT },
        ]
    },
    [SETTINGS.DAMAGE_PER_UNIT_DIVIDER]: {
        label: 'Damager per unit divider',
        default: 1
    },
    [SETTINGS.ICY_PRECISION]: {
        label: 'Icy Precision stacks',
        default: 10
    },
    [SETTINGS.ICY_CHILL_STACKS]: {
        label: 'Icy Chill',
        default: 0
    },
    [SETTINGS.PUNCTURE_STACKS]: {
        label: 'Puncture Stacks',
        default: 0
    },
    [SETTINGS.FLOW]: {
        label: 'Flow',
        default: false
    },
    [SETTINGS.GREATER_FLOW]: {
        label: 'Greater Flow',
        default: false
    },
    [SETTINGS.FLOW_AC]: {
        label: 'Flow (Animate Dead)',
        default: false
    },
    [SETTINGS.GREATER_FLOW_AC]: {
        label: 'Greater Flow (Animate Dead)',
        default: false
    },
    [SETTINGS.BARRICADE]: {
        label: 'Barricade',
        default: false
    },
    [SETTINGS.MALLETOPS]: {
        label: 'Malletops',
        default: 0
    },
    [SETTINGS.COMBUSTED]: {
        label: 'Combusted',
        default: false
    },
    [SETTINGS.GREATER_CHAIN]: {
        label: 'Greater Chain',
        default: false
    },
    [SETTINGS.CONFLAGRATE]: {
        label: 'Conflagrate',
        default: false
    },
    [SETTINGS.ENDLESS_ASSAULT]: {
        label: 'Endless Assault',
        default: false
    },
    [SETTINGS.KERAPACS_WRIST_WRAPS]: {
        label: "Kerapac's wristwraps",
        default: false
    },
    [SETTINGS.ENCHANTMENT_OF_FLAMES]: {
        label: "Enchantment of Flames",
        default: false
    },
    [SETTINGS.ENCHANTMENT_OF_DREAD]: {
        label: "Enchantment of Dread",
        default: false
    },
    [SETTINGS.TARGET_DISABILITY]: {
        label: 'Stun/bound state',
        default: SETTINGS.TARGET_DISABILITY_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.TARGET_DISABILITY_VALUES.NONE },
            { text: 'Bound', value: SETTINGS.TARGET_DISABILITY_VALUES.BOUND },
            { text: 'Stunned', value: SETTINGS.TARGET_DISABILITY_VALUES.STUNNED },
            { text: 'Bound and stunned', value: SETTINGS.TARGET_DISABILITY_VALUES.BOUND_STUNNED }
        ]
    },
    [SETTINGS.DRACONIC_FRUIT]: {
        label: 'Draconic fruit',
        default: false
    },
    [SETTINGS.ENDURING_RUIN_HIT]: {
        label: 'Enduring ruin on-hit',
        default: SETTINGS.ENDURING_RUIN_HIT_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.ENDURING_RUIN_HIT_VALUES.NONE },
            { text: 'Regular', value: SETTINGS.ENDURING_RUIN_HIT_VALUES.REGULAR },
            { text: 'Enchanted', value: SETTINGS.ENDURING_RUIN_HIT_VALUES.ENCHANTED }
        ]
    },
    [SETTINGS.ENDURING_RUIN_BLEED]: {
        label: 'Enduring ruin bleed',
        default: SETTINGS.ENDURING_RUIN_BLEED_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.ENDURING_RUIN_BLEED_VALUES.NONE },
            { text: 'Regular', value: SETTINGS.ENDURING_RUIN_BLEED_VALUES.REGULAR },
            { text: 'Enchanted', value: SETTINGS.ENDURING_RUIN_BLEED_VALUES.ENCHANTED }
        ]
    },
    [SETTINGS.GRAVITATE]: {
        label: 'Gravitate',
        default: 0
    },
    [SETTINGS.BLOOD_TITHE]: {
        label: 'Blood tithe',
        default: 0
    },
    [SETTINGS.GLACIAL_EMBRACE]: {
        label: 'Glacial embrace',
        default: 0
    },
    [SETTINGS.DEATH_SPARK]: {
        label: 'Death spark',
        default: false
    },
    [SETTINGS.LIVING_DEATH]: {
        label: 'Living Death',
        default: false
    },
    [SETTINGS.SWIFTNESS_OF_THE_AVIANSIE]: {
        label: 'Swiftness of the Aviansie',
        default: false
    },
    [SETTINGS.ESSENCE_CORRUPTION]: {
        label: 'Essence corruption',
        default: 0
    },
    [SETTINGS.ESS_CORRUPTION_ADREN]: {
        label: 'Essence Corruption Adrenaline',
        default: false
    },
    [SETTINGS.CONFLAGRATE]: {
        label: 'Conflagrate',
        default: false
    },
    [SETTINGS.CONCENTRATED_BLAST_STACKS]: {
        label: 'Conc stacks',
        default: 0
    },
    [SETTINGS.CONC_CRIT]: {
        label: 'Conc Crit',
        default: false
    },
    [SETTINGS.GCONC_CRIT]: {
        label: 'GConc Crit',
        default: false
    },
    [SETTINGS.CONC_CRIT_AC]: {
        label: 'Conc Crit (AC)',
        default: false
    },
    [SETTINGS.GCONC_CRIT_AC]: {
        label: 'GConc Crit (AC)',
        default: false
    },
    [SETTINGS.CHAOS_ROAR]: {
        label: 'Chaos roar',
        default: false
    },
    [SETTINGS.FURY_BUFF]: {
        label: 'Fury buff',
        default: SETTINGS.FURY_BUFF_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.POTION_VALUES.NONE },
            { text: 'Regular', value: SETTINGS.FURY_BUFF_VALUES.REGULAR },
            { text: 'Greater', value: SETTINGS.FURY_BUFF_VALUES.GREATER }
        ]
    },
    [SETTINGS.RAMPAGE]: {
        label: 'Rampage',
        default: false
    },
    [SETTINGS.BALANCE_BY_FORCE]: {
        label: 'Balance by force',
        default: true
    },
    [SETTINGS.PERFECT_EQUILIBRIUM_STACKS]: {
        label: 'Bolg stacks',
        default: 0
    },
    [SETTINGS.BLOODLUST_STACKS]: {
        label: 'Bloodlust stacks',
        default: 0
    },
    [SETTINGS.BIK_STACKS]: {
        label: 'Bik stacks',
        default: 0
    },
    [SETTINGS.DEATHSPORE_STACKS]: {
        label: 'Deathspore stacks',
        default: 0
    },
    [SETTINGS.DEATHSPORE_BUFF]: {
        label: 'Deathspore buff',
        default: false
    },
    [SETTINGS.DEATHSPORE_COOLDOWN]: {
        label: 'Deathspore cooldown',
        default: 0
    },
    [SETTINGS.CAROMING]: {
        label: 'Caroming',
        default: 4
    },
    [SETTINGS.CHAIN_MODIFIER]: {
        label: 'Chain modifier',
        default: SETTINGS.CHAIN_MODIFIER_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.CHAIN_MODIFIER_VALUES.NONE },
            { text: 'Regular', value: SETTINGS.CHAIN_MODIFIER_VALUES.REGULAR },
            { text: 'Greater', value: SETTINGS.CHAIN_MODIFIER_VALUES.GREATER },
        ]
    },
    [SETTINGS.MH_TIER_CUSTOM]: {
        label: 'MH custom tier',
        default: 95
    },
    [SETTINGS.OH_TIER_CUSTOM]: {
        label: 'OH custom tier',
        default: 95
    },
    [SETTINGS.TH_TYPE_CUSTOM]: {
        label: '2H cust wep type',
        default: SETTINGS.TH_TYPE_CUSTOM_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.TH_TYPE_CUSTOM_VALUES.NONE },
            { text: 'Bow', value: SETTINGS.TH_TYPE_CUSTOM_VALUES.BOW },
        ]
    },
    [SETTINGS.TH_TIER_CUSTOM]: {
        label: '2H custom tier',
        default: 95
    },
    [SETTINGS.TARGET_SIZE]: {
        label: 'Target size',
        default: 5
    },
    [SETTINGS.PRIMORDIAL_ICE]: {
        label: 'Primordial ice',
        default: 0
    },
    [SETTINGS.FROSTBLADES]: {
        label: 'Frostblades',
        default: false
    },
    [SETTINGS.IGNEOUS_EXTENSIOS]: {
        label: 'Igneous extensions',
        default: 5
    },
    [SETTINGS.DRACOLICH_INFUSION]: {
        label: 'Dracolich infusion',
        default: SETTINGS.DRACOLICH_INFUSION_VALUES.NONE,
        options: [
            { text: 'None', value: SETTINGS.DRACOLICH_INFUSION_VALUES.NONE },
            { text: 'Regular', value: SETTINGS.DRACOLICH_INFUSION_VALUES.REGULAR },
            { text: 'Greater', value: SETTINGS.DRACOLICH_INFUSION_VALUES.GREATER }
        ]
    },
    [SETTINGS.GREATER_DRACOLICH_INFUSION]: {
        label: 'Greater dracolich infusion',
        default: true
    },
    [SETTINGS.INSTABILITY]: {
        label: 'Instability',
        default: true
    },
    [SETTINGS.TIME_SINCE_ATTACK]: {
        label: 'Time since last attack',
        default: 10
    },
    [SETTINGS.CHANNELLER_RING_STACKS]: {
        label: 'Channelers ring stacks',
        default: 0
    },
    [SETTINGS.NUMBER_OF_BLEEDS]: {
        label: 'Bleeds on boss',
        default: 1
    },
    [SETTINGS.STRENGTH_CAPE]: {
        label: 'Str cape',
        default: true
    },
    [SETTINGS.SUNSHINE]: {
        label: 'Sunshine',
        default: false
    },
    [SETTINGS.DEATH_SWIFTNESS]: {
        label: 'Swift',
        default: false
    },
    [SETTINGS.SPLIT_SOUL]: {
        label: 'Split soul',
        default: false
    },
    [SETTINGS.BLACKHOLE]: {
        label: 'ZGS',
        default: false
    },
    [SETTINGS.SEARING_WINDS]: {
        label: 'Searing Winds',
        default: false
    },
    [SETTINGS.SHADOW_IMBUED]: {
        label: 'Shadow Imbued',
        default: false
    },
    [SETTINGS.DEATHMARK]: {
        label: 'Deathmark',
        default: false
    },
    [SETTINGS.ANIMA_CHARGED]: {
        label: 'Anima Charged',
        default: false
    },
    [SETTINGS.BERSERK]: {
        label: 'Berserk',
        default: false
    },
    [SETTINGS.DIVINE_RAGE]: {
        label: 'Divine rage',
        default: false
    },
    [SETTINGS.ECLIPSED_SOUL]: {
        label: 'Eclipsed soul',
        default: false
    },
    [SETTINGS.SHOW_BLOODLUST_STACKS]: {
        label: 'Show Bloodlust Stacks',
        default: true
    },
    [SETTINGS.SHOW_PRIMORDIAL_ICE_STACKS]: {
        label: 'Show Primordial Ice Stacks',
        default: true
    },
    [SETTINGS.SHOW_BOLG_STACKS]: {
        label: 'Show Bolg Stacks',
        default: true
    },
    [SETTINGS.SHOW_ICY_CHILL_STACKS]: {
        label: 'Show Icy Chill Stacks',
        default: true
    },
    [SETTINGS.SHOW_BIK_STACKS]: {
        label: 'Show Bik Stacks',
        default: true
    },
    [SETTINGS.SHOW_DEATHSPORE_STACKS]: {
        label: 'Show Deathspore Stacks',
        default: true
    },
    [SETTINGS.SHOW_NECROSIS_STACKS]: {
        label: 'Show Necrosis Stacks',
        default: true
    },
    [SETTINGS.SHOW_RESIDUAL_SOULS]: {
        label: 'Show Residual Souls',
        default: true
    },
    [SETTINGS.SHOW_DEATH_SPARK_STACKS]: {
        label: 'Show Death Spark Stacks',
        default: true
    },
    [SETTINGS.SHOW_SOUL_REAVE_STACKS]: {
        label: 'Show Soul Reave Stacks',
        default: true
    },
    [SETTINGS.SHOW_ESSENCE_CORRUPTION]: {
        label: 'Show Essence Corruption',
        default: true
    },
    [SETTINGS.SHOW_BLOOD_TITHE]: {
        label: 'Show Blood Tithe',
        default: true
    },
    [SETTINGS.SHOW_GLACIAL_EMBRACE]: {
        label: 'Show Glacial Embrace',
        default: true
    },
    [SETTINGS.SHOW_FAMILIAR_SPEC_POINTS]: {
        label: 'Show Familiar Spec',
        default: true
    },
    [SETTINGS.SHOW_ADRENALINE]: {
        label: 'Show Adrenaline',
        default: true
    },
    [SETTINGS.ADRENALINE]: {
        label: 'Adrenaline',
        default: 100
    },
    [SETTINGS.EXPECTED_ADRENALINE]: {
        label: 'Expected Adrenaline RNG',
        default: true
    },
    [SETTINGS.CRIT_BUFF]: {
        label: 'Crit Buff',
        default: false
    },
    [SETTINGS.NATURAL_INSTINCT]: {
        label: 'Natural Instinct',
        default: false
    },
    [SETTINGS.CAP_ADRENALINE]: {
        label: 'Cap Adrenaline',
        default: true
    },
    [SETTINGS.VIGOUR]: {
        label: 'Vigour Passive',
        default: true
    },
    [SETTINGS.FURY_OF_THE_SMALL]: {
        label: 'Fury of the Small',
        default: true
    },
    [SETTINGS.HEIGHTENED_SENSES]: {
        label: 'Heightened Senses',
        default: true
    },
    [SETTINGS.CONSERVATION_OF_ENERGY]: {
        label: 'Conservation of Energy',
        default: false
    },
    [SETTINGS.POF_DINOS]: {
        label: 'Dino perks',
        default: SETTINGS.POF_DINOS_VALUES.CORBICULA_2,
        options: [
            { text: 'None', value: SETTINGS.POF_DINOS_VALUES.NONE },
            { text: '1 corbicula', value: SETTINGS.POF_DINOS_VALUES.CORBICULA_1 },
            { text: '2 corbiculas', value: SETTINGS.POF_DINOS_VALUES.CORBICULA_2 }
        ]
    },
    [SETTINGS.LUNGING]: {
        label: 'Lunging',
        default: 0
    },
    [SETTINGS.RUIN]: {
        label: 'Ruin stacks',
        default: 0
    },
    [SETTINGS.VALOUR_STACKS]: {
        label: 'Valour (Phantom stacks)',
        default: 25
    },
    [SETTINGS.HITCAP]: {
        label: 'Apply hitcap',
        default: true
    },
    [SETTINGS.USE_OWNED_GEAR]: {
        label: 'Use owned gear perks',
        default: false
    },
    [SETTINGS.GEAR_FILTER]: {
        label: 'Gear filter',
        default: SETTINGS.GEAR_FILTER_VALUES.POPULAR,
    },
    [SETTINGS.QUIVER]: {
        label: 'Pernix quiver',
        default: true
    },
    [SETTINGS.DAMAGE_QUALIFIER]: {
        label: 'Dino perks',
        default: SETTINGS.DAMAGE_QUALIFIER_VALUES.TOTAL,
        options: [
            { text: 'Total', value: SETTINGS.DAMAGE_QUALIFIER_VALUES.TOTAL },
            { text: 'Dmg per tick', value: SETTINGS.DAMAGE_QUALIFIER_VALUES.PER_TICK },
            { text: 'Dmg per adren', value: SETTINGS.DAMAGE_QUALIFIER_VALUES.PER_ADREN }
        ]
    },
    [SETTINGS.MAX_CHANNEL_DURATION]: {
        label: 'Max channel length',
        default: 1000
    },
    [SETTINGS.FLAMEBOUND_RIVAL]: {
        label: 'Flamebound',
        default: false
    },
    [SETTINGS.AUTO_SPEED]: {
        label: 'Attack speed',
        default: SETTINGS.AUTO_SPEED_VALUES.AVERAGE,
        options: [
            { text: 'Average (6t)', value: SETTINGS.AUTO_SPEED_VALUES.AVERAGE },
            { text: 'Fast (5t)', value: SETTINGS.AUTO_SPEED_VALUES.FAST },
            { text: 'Fastest (4t)', value: SETTINGS.AUTO_SPEED_VALUES.FASTEST }
        ]
    },
    [SETTINGS.AUTO_HAND]: {
        label: 'Auto type',
        default: SETTINGS.AUTO_HAND_VALUES.TH,
        options: [
            { text: '2h auto', value: SETTINGS.AUTO_HAND_VALUES.TH },
            { text: 'mh auto', value: SETTINGS.AUTO_HAND_VALUES.MH },
            { text: 'oh auto', value: SETTINGS.AUTO_HAND_VALUES.OH }
        ]
    },
    [SETTINGS.TELOS_RED_BEAM]: {
        label: 'Red beam',
        default: false
    },
    [SETTINGS.TELOS_BLACK_BEAM]: {
        label: 'Black beam',
        default: false
    },
    [SETTINGS.ENERGISING]: {
        label: 'Energising',
        default: 0
    },
    [SETTINGS.ULTIMATUMS]: {
        label: 'Ultimatums',
        default: 0
    },
    [SETTINGS.BLAST_INFUSED]: {
        label: 'Blast infused',
        default: false
    },
    [SETTINGS.GCONC_UNLOCK]: {
        label: 'Gconc unlocked',
        default: true
    },
    [SETTINGS.STRENGTH_MASTER_CAPE]: {
        label: '120 str cape',
        default: true
    },
};

export { SETTINGS, settingsConfig };
