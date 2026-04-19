import { AbilityInfo } from "$lib/types/AbilityTypes";

export enum ABILITIES {
    NECRO_AUTO = 'necromancy auto',
    TOUCH_OF_DEATH = 'touch of death',
    SOUL_SAP = 'soul sap',
    CONJURE_UNDEAD_ARMY = 'conjure undead army',
    CONJURE_SKELETON_WARRIOR = 'conjure skeleton warrior',
    CONJURE_VENGEFUL_GHOST = 'conjure vengeful ghost',
    CONJURE_PUTRID_ZOMBIE = 'conjure putrid zombie',
    CONJURE_PHANTOM_GUARDIAN = 'conjure phantom guardian',
    SKELETON_WARRIOR_AUTO = 'skeleton warrior auto',
    SKELETON_WARRIOR_AUTO_10 = 'skeleton warrior auto 10',
    VENGEFUL_GHOST_AUTO = 'vengeful ghost auto',
    PUTRID_ZOMBIE_AUTO = 'putrid zombie auto',
    PUTRID_ZOMBIE_POISON = 'putrid zombie poison',
    COMMAND_SKELETON_WARRIOR = 'command skeleton warrior',
    COMMAND_VENGEFUL_GHOST = 'command vengeful ghost',
    COMMAND_PUTRID_ZOMBIE = 'command putrid zombie',
    COMMAND_PHANTOM_GUARDIAN = 'command phantom guardian',
    LIFE_TRANSFER = 'life transfer',
    THREADS_OF_FATE = 'threads of fate',
    INVOKE_DEATH = 'invoke death',
    SPLIT_SOUL_NECRO = 'split soul necro',
    FINGER_OF_DEATH = 'finger of death',
    BLOAT = 'bloat',
    DEATHSKULLS = 'death skulls',
    DEATHSKULLS_4 = 'death skulls 4',
    DEATHSKULLS_7 = 'death skulls 7',
    SOUL_STRIKE = 'soul strike',
    SOUL_STRIKE_AOE = 'soul strike aoe',
    VOLLEY_OF_SOULS = 'volley of souls',
    VOLLEY_OF_SOULS_DYNAMIC = 'volley of souls dynamic',
    VOLLEY_OF_SOULS_2 = 'volley of souls 2',
    VOLLEY_OF_SOULS_3 = 'volley of souls 3',
    VOLLEY_OF_SOULS_4 = 'volley of souls 4',
    VOLLEY_OF_SOULS_5 = 'volley of souls 5',
    SPECTRAL_SCYTHE_1 = 'spectral scythe 1',
    SPECTRAL_SCYTHE_2 = 'spectral scythe 2',
    SPECTRAL_SCYTHE_3 = 'spectral scythe 3',
    BLOOD_SIPHON_BLEED_HIT = 'blood siphon bleed hit',
    BLOOD_SIPHON_LAST_HIT = 'blood siphon last hit',

    BLOOD_SIPHON = 'blood siphon',
    DEATH_GRASP = 'death grasp',
    DEATH_ESSENCE = 'death essence',
    SOUL_CRUSH = 'soul crush',
    LIVING_DEATH = 'living death',

    // Range Basics
    RANGED_AUTO = 'ranged auto',
    GREATER_RICOCHET_1 = 'greater ricochet 1',
    GREATER_RICOCHET_2 = 'greater ricochet 2',
    GREATER_RICOCHET_3 = 'greater ricochet 3',
    GREATER_RICOCHET = 'greater ricochet',
    GALESHOT = 'galeshot',
    PIERCING_SHOT_HIT = 'piercing shot hit',
    PIERCING_SHOT = 'piercing shot',
    BINDING_SHOT = 'binding shot',
    RICOCHET = 'ricochet',
    
    // Range Enhanced
    SNAP_SHOT_HIT = 'snap shot 1',
    SNAP_SHOT = 'snap shot',
    RAPID_FIRE_LAST_HIT = 'rapid fire last hit',
    RAPID_FIRE_HIT = 'rapid fire hit',
    RAPID_FIRE = 'rapid fire',
    SNIPE_HIT = 'snipe hit',
    SNIPE_HIT_2 = 'snipe hit nightmare gauntlets',
    SNIPE = 'snipe',
    SHADOW_TENDRILS = 'shadow tendrils',
    CORRUPTION_SHOT = 'corruption shot',
    CORRUPTION_SHOT_HIT_1 = 'corruption shot hit 1',
    CORRUPTION_SHOT_HIT_2 = 'corruption shot hit 2',
    CORRUPTION_SHOT_HIT_3 = 'corruption shot hit 3',
    CORRUPTION_SHOT_HIT_4 = 'corruption shot hit 4',
    CORRUPTION_SHOT_HIT_5 = 'corruption shot hit 5',
    BOMBARDMENT = 'bombardment',
    IMBUE_SHADOWS = 'imbue shadows',
    
    // Range Ults
    DEADSHOT_HIT = 'deadshot initial',
    DEADSHOT = 'deadshot',
    IGNEOUS_DEADSHOT_HIT = 'igneous_deadshot_hit',
    IGNEOUS_DEADSHOT = 'igneous_deadshot',
    DEATHS_SWIFTNESS = 'death\'s swiftness',
    GREATER_DEATHS_SWIFTNESS = 'greater death\'s swiftness',
    
    // Range Specs
    SHADOWFALL_1 = 'shadowfall 1',
    SHADOWFALL_2 = 'shadowfall 2',
    SHADOWFALL = 'shadowfall',
    BALANCE_BY_FORCE = 'balance by force',
    CRYSTAL_RAIN = 'crystal rain',
    DESCENT_OF_DARKNESS_HIT = 'descent of darkness hit',
    DESCENT_OF_DARKNESS = 'descent of darkness',
    DESTRUCTIVE_SHOT_HIT = 'destructive shot hit',
    DESTRUCTIVE_SHOT = 'destructive shot',
    RESTORATIVE_SHOT = 'restorative shot',
    BALANCED_SHOT = 'balanced shot',
    AIMED_SHOT = 'aimed shot',
    AIMED_SHOT_HIT = 'aimed shot hit',
    POWER_SHOT = 'power shot',
    TWIN_FANG_HIT = 'twin fang hit',
    TWIN_FANG = 'twin fang',
    PHANTOM_STRIKE_INITIAL = 'phantom strike initial',
    PHANTOM_STRIKE_BLEED = 'phantom strike bleed',
    PHANTOM_STRIKE = 'phantom strike',
    HAMSTRING = 'hamstring',
    TWIN_SHOT_HIT = 'twin shot hit',
    TWIN_SHOT = 'twin shot',
    CHAIN_HIT = 'chain hit',
    SOUL_SHOT = 'soul shot',
    SPLIT_SOUL_ECB = 'split soul ecb',
    DEEP_BURN = 'deep burn',
    DEFIANCE = 'defiance',
    LOCATE = 'locate',
    BOLG_PROC = 'bolg proc',
    BOLG_PROC_PERCENTAGES = 'bolg proc percentages',

    // Mage Basics
    MAGIC_AUTO = 'magic auto',
    GREATER_CONCENTRATED_BLAST_1 = 'greater concentrated blast 1',
    GREATER_CONCENTRATED_BLAST_2 = 'greater concentrated blast 2',
    GREATER_CONCENTRATED_BLAST_3 = 'greater concentrated blast 3',
    GREATER_CONCENTRATED_BLAST = 'greater concentrated blast',
    GREATER_SONIC_WAVE = 'greater sonic wave',
    DRAGON_BREATH = 'dragon breath',
    GREATER_CHAIN = 'greater chain',
    COMBUST_HIT = 'combust hit',
    COMBUST = 'combust',
    CHAIN = 'chain',
    SONIC_WAVE = 'sonic wave',
    IMPACT = 'impact',
    SHOCK = 'shock',
    CONCENTRATED_BLAST_1 = 'concentrated blast 1',
    CONCENTRATED_BLAST_2 = 'concentrated blast 2',
    CONCENTRATED_BLAST_3 = 'concentrated blast 3',
    CONCENTRATED_BLAST = 'concentrated blast',
    
    // Mage Enhanced
    ASPHYXIATE_HIT = 'asphyxiate hit',
    ASPHYXIATE_LAST_HIT = 'asphyxiate last hit',
    ASPHYXIATE = 'asphyxiate',
    TUMEKEN_ASPHYXIATE_HIT = 'tumeken asphyxiate hit',
    TUMEKEN_ASPHYXIATE_LAST_HIT = 'tumeken asphyxiate last hit',
    TUMEKEN_ASPHYXIATE = 'tumeken asphyxiate',
    WILD_MAGIC_HIT = 'wild magic hit',
    WILD_MAGIC = 'wild magic',
    SMOKE_CLOUD = 'smoke cloud',
    SMOKE_TENDRILS_1 = 'smoke tendrils 1',
    SMOKE_TENDRILS_2 = 'smoke tendrils 2',
    SMOKE_TENDRILS_3 = 'smoke tendrils 3',
    SMOKE_TENDRILS_4 = 'smoke tendrils 4',
    SMOKE_TENDRILS = 'smoke tendrils',
    MAGMA_TEMPEST_HIT = 'magma tempest hit',
    MAGMA_TEMPEST = 'magma tempest',
    CORRUPTION_BLAST = 'corruption blast',
    CORRUPTION_BLAST_HIT_1 = 'corruption blast hit 1',
    CORRUPTION_BLAST_HIT_2 = 'corruption blast hit 2',
    CORRUPTION_BLAST_HIT_3 = 'corruption blast hit 3',
    CORRUPTION_BLAST_HIT_4 = 'corruption blast hit 4',
    CORRUPTION_BLAST_HIT_5 = 'corruption blast hit 5',
    
    // Mage Ults
    OMNIPOWER_REGULAR = 'omnipower regular',
    OMNIPOWER_IGNEOUS_HIT = 'omnipower igneous',
    OMNIPOWER = 'omnipower',
    TSUNAMI = 'tsunami',
    SUNSHINE_DOT = 'sunshine dot',
    SUNSHINE = 'sunshine',
    GREATER_SUNSHINE = 'greater sunshine',
    
    // Mage Specs
    INSTABILITY = 'instability',
    TIME_STRIKE = 'time strike',
    SOULFIRE_INITIAL = 'soulfire initial',
    SOULFIRE_BURN = 'soulfire burn',
    SOULFIRE = 'soulfire',
    THE_LAST_COMMAND = 'the last command',
    TEMPEST_OF_ARMADYL_HIT_1 = 'tempest of armadyl hit 1',
    TEMPEST_OF_ARMADYL_HIT_2 = 'tempest of armadyl hit 2',
    TEMPEST_OF_ARMADYL_HIT_3 = 'tempest of armadyl hit 3',
    TEMPEST_OF_ARMADYL_HIT_4 = 'tempest of armadyl hit 4',
    TEMPEST_OF_ARMADYL_HIT_5 = 'tempest of armadyl hit 5',
    TEMPEST_OF_ARMADYL = 'tempest of armadyl',
    IBAN_BLAST = 'iban blast',
    CLAWS_OF_GUTHIX = 'claws of guthix',
    RUNE_FLAME = 'rune flame',
    DEVOUR = 'devour',
    REAP = 'reap',
    SARADOMIN_STRIKE = 'saradomin strike',
    POWER_OF_DARKNESS = 'power of darkness',
    FROM_THE_SHADOWS_HIT = 'from the shadows hit',
    FROM_THE_SHADOWS = 'from the shadows',
    FLAMES_OF_ZAMORAK = 'flames of zamorak',
    MIASMIC_BARRAGE = 'miasmic barrage',

    // Melee Basics
    MELEE_AUTO = 'melee auto',
    GREATER_BARGE = 'greater barge',
    PUNISH = 'punish',
    ADAPTIVE_STRIKE_HIT = 'adaptive strike hit',
    ADAPTIVE_STRIKE = 'adaptive strike',
    ADAPTIVE_STRIKE_TH = 'adaptive strike 2h',
    REND = 'rend',
    CHAOS_ROAR = 'chaos roar',
    GREATER_FURY = 'greater fury',
    FURY = 'fury',
    BACKHAND = 'backhand',
    BARGE = 'barge',
    BLADED_DIVE = 'bladed dive',
    DISMEMBER_HIT = 'dismember hit',
    DISMEMBER = 'dismember',
    
    // Melee Enhanced
    ASSAULT_HIT = 'assault hit',
    ASSAULT = 'assault',
    ASSAULT_BARGE = 'assault barge',
    GREATER_FLURRY_HIT = 'greater flurry hit',
    GREATER_FLURRY = 'greater flurry',
    GREATER_FLURRY_BARGE = 'greater flurry barge',
    HURRICANE_1 = 'hurricane 1',
    HURRICANE_2 = 'hurricane 2',
    HURRICANE = 'hurricane',
    BLOODLUST_HURRICANE_HIT = 'bloodlust hurricane hit',
    SLAUGHTER = 'slaughter',
    SLAUGHTER_HIT = 'slaughter hit',
    MASSACRE_INITIAL = 'massacre initial',
    MASSACRE_BLEED = 'massacre bleed',
    MASSACRE = 'massacre',
    FLURRY_HIT = 'flurry hit',
    FLURRY = 'flurry',
    FLURRY_BARGE = 'flurry barge',
    
    // Melee Ults
    OVERPOWER_HIT = 'overpower hit',
    OVERPOWER = 'overpower',
    METEOR_STRIKE = 'meteor strike',
    PULVERISE = 'pulverise',

    // Melee Special Attacks
    IGNEOUS_SHOWDOWN_HIT = 'igneous showdown hit',
    IGNEOUS_SHOWDOWN_BONUS = 'igneous showdown bonus',
    IGNEOUS_SHOWDOWN = 'igneous showdown',
    THE_FINAL_FLURRY_1 = 'the final flurry 1',
    THE_FINAL_FLURRY_2 = 'the final flurry 2',
    THE_FINAL_FLURRY ='the final flurry',
    QUICK_SMASH = 'quick smash',
    ICY_TEMPEST_1 = 'icy tempest 1',
    ICY_TEMPEST_2 = 'icy tempest 2',
    ICY_TEMPEST = 'icy tempest',
    SLICE_N_DICE_1 = 'slice & dice 1',
    SLICE_N_DICE_2 = 'slice & dice 2',
    SLICE_N_DICE_3 = 'slice & dice 3',
    SLICE_N_DICE = 'slice & dice',
    DRACONIC_SLASH = 'draconic slash',
    OBLITERATE = 'obliterate',
    SUNFALL_SLAM = 'sunfall slam',
    LESSER_PURIFYING_LIGHT = 'lesser purifying light',
    PURIFYING_LIGHT = 'puyrifying light',
    POWERSTAB = 'powerstab',
    DRACONIC_CLEAVE = 'draconic cleave',
    ARMADYLS_JUDGEMENT = 'armadyls judgement',
    DRACONIC_BLOW = 'draconic blow',
    VINE_CALL_INITIAL = 'vine call initial',
    VINE_CALL_AOE = 'vine call aoe',
    VINE_CALL = 'vine call',
    ENERGY_DRAIN = 'energy drain',
    FAVOUR_OF_THE_WAR_GOD = 'favour of the war god',
    WARSTRIKE = 'warstrike',
    SUNDER = 'sunder',
    BACKSTAB = 'backstab',
    LIQUEFY = 'liquefy',
    CLOBBER = 'clobber',
    WEAKEN_SPECIAL_ATTACK = 'weaken special attack',
    DRACONIC_PUNCTURE_HIT = 'draconic puncture hit',
    DRACONIC_PUNCTURE = 'draconic puncture',
    SWEEP_HIT = 'sweep hit',
    SWEEP = 'sweep',
    SHOVE = 'shove',
    AIMED_STRIKE = 'aimed strike',
    DISRUPT = 'disrupt',
    GET_OVER_HERE = 'get over here!',
    IMPALE = 'impale',
    HEALING_BLADE = 'healing blade',
    SARADOMINS_LIGHTNING_HIT = 'saradomins lightning hit',
    SARADOMINS_LIGHTNING = 'saradomins lightning',
    FEINT = 'feint',
    SPEAR_WALL = 'spear wall',
    RAMPAGE = 'rampage',
    ICE_CLEAVE = 'ice cleave',
    BERSERK = 'berserk',
    BLACKHOLE = 'blackhole',

    // perks damage
    AFTERSHOCK_RANGED = 'aftershock ranged',
    AFTERSHOCK_MELEE = 'aftershock melee',
    AFTERSHOCK_MAGIC = 'aftershock magic',
    AFTERSHOCK_NECRO = 'aftershock necro',
    CRACKLING_RANGED = 'crackling ranged',
    CRACKLING_MELEE = 'crackling melee',
    CRACKLING_MAGIC = 'crackling magic',
    CRACKLING_NECRO = 'crackling necro',

    // Defensives
    FREEDOM = 'freedom',
    ANTICIPATION = 'anticipation',
    RESONANCE = 'resonance',
    DIVERT = 'divert',
    PREPARATION = 'preparation',
    REFLECT = 'reflect',
    DEVOTION = 'devotion',
    REVENGE = 'revenge',
    IMMORTALITY = 'immortality',
    BARRICADE = 'barricade',
    NATURAL_INSTINCT = 'natural instinct',
    

    //no gcd abilities
    INGENUITY_OF_THE_HUMANS = 'ingenuity of the humans',
    LIMITLESS = 'limitless',
    DRAGON_SLAYER_ABILITY = 'dragon slayer ability',
    DEMON_SLAYER_ABILITY = 'demon slayer ability',
    UNDEAD_SLAYER_ABILITY = 'undead slayer ability',
    RUNIC_CHARGE = 'runic charge',
    EXSANGUINATE = 'exsanguinate',
    INCITE_FEAR = 'incite fear',
    GLACIAL_EMBRACE_HIT = 'glacial embrace hit',
    SURGE = 'surge',
    ESCAPE = 'escape',
    DIVE = 'dive',
    VENGEANCE = 'vengeance',
    SPELLBOOK_SWAP = 'spellbook swap',
    DISRUPTION_SHIELD = 'disruption shield',
    PRISM_OF_RESTORATION = 'prism of restoration',
    DREADNIP = 'dreadnip',
    DEFLECT_MAGIC = 'deflect magic',
    DEFLECT_MELEE = 'deflect melee',
    DEFLECT_RANGED = 'deflect ranged',
    DEFLECT_NECROMANCY = 'deflect necromancy',
    SOUL_SPLIT = 'soul split',

    // Misc
    POISON_DAMAGE = 'poison damage'
};

export const abils: Record<ABILITIES, AbilityInfo> = {
    // Melee Basic Abilities
    [ABILITIES.MELEE_AUTO]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'auto', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        title: 'Auto',
        icon: '/ability_icons/melee/Attack_ability.png',
    },
    [ABILITIES.GREATER_BARGE]: {
        // ability name
        minHit: 0.75, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 20.4,
        title: 'Greater barge',
        icon: '/ability_icons/melee/30x30/gbarge.png',
    },
    [ABILITIES.REND]: {
        minHit: 1.35,
        varHit: 0.3,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 5.4,
        title: 'Rend',
        icon: '/ability_icons/melee/Rend.png',
    },
    [ABILITIES.CHAOS_ROAR]: {
        // ability name
        minHit: 1.0, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 60,
        title: 'Chaos roar',
        icon: '/ability_icons/melee/30x30/roar.png',
    },
    [ABILITIES.PUNISH]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 24,
        title: 'Punish',
        icon: '/ability_icons/melee/30x30/punish.png',
    },
    [ABILITIES.FURY]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 15
    ,
        title: 'Fury',
        icon: '/ability_icons/melee/30x30/fury.png',
    },
    [ABILITIES.GREATER_FURY]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 15,
        title: 'Greater fury',
        icon: '/ability_icons/melee/30x30/gfury.png',
    },
    [ABILITIES.ADAPTIVE_STRIKE_HIT]: {
        minHit: 0.6,
        varHit: 0.15,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 5.4,
        parent: ABILITIES.ADAPTIVE_STRIKE
    },
    [ABILITIES.ADAPTIVE_STRIKE]: {
        minHit: 0.6,
        varHit: 0.15,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'basic',
        mainStyle: 'melee',
        damageType: 'melee',
        hitTimings: [0, 0],
        hits: {
            1: [ABILITIES.ADAPTIVE_STRIKE_HIT, 'next hit', ABILITIES.ADAPTIVE_STRIKE_HIT]
        },
        cooldown: 5.4,
        title: 'Adaptive strike',
        icon: '/ability_icons/melee/Adaptive_Strike.png',
    },
    [ABILITIES.ADAPTIVE_STRIKE_TH]: {
        minHit: 1.2,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 5.4},
    [ABILITIES.BACKHAND]: {
        // ability name
        minHit: 0.95, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 15,
        title: 'Backhand',
        icon: '/ability_icons/melee/30x30/backhand.png',
    },
    [ABILITIES.BLADED_DIVE]: {
        // ability name
        minHit: 0.75, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 20.4,
        title: 'Bladed dive',
        icon: '/ability_icons/melee/30x30/bd.png',
    },
    [ABILITIES.BARGE]: {
        // ability name
        minHit: 0.75, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 20.4,
        title: 'Barge',
        icon: '/ability_icons/melee/30x30/barge.png',
    },
    
    // Melee Enhanced Abilities
    [ABILITIES.GREATER_FLURRY_HIT]: {
        // ability name
        minHit: 0.6, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 20.4,
        parent: ABILITIES.GREATER_FLURRY
    },
    [ABILITIES.GREATER_FLURRY]: {
        // ability name
        minHit: 0.6, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        'duration': 8,
        hits: {
            1: [ABILITIES.GREATER_FLURRY_HIT],
            2: [ABILITIES.GREATER_FLURRY_HIT],
            3: [ABILITIES.GREATER_FLURRY_HIT],
            4: [ABILITIES.GREATER_FLURRY_HIT],
            5: [ABILITIES.GREATER_FLURRY_HIT],
            6: [ABILITIES.GREATER_FLURRY_HIT],
            7: [ABILITIES.GREATER_FLURRY_HIT],
            8: [ABILITIES.GREATER_FLURRY_HIT]},
        adrenaline: 25,
        cooldown: 20.4,
        hitTimings: [0, 1, 2, 3, 4, 5, 6, 7]
    ,
        title: 'Greater flurry',
        icon: '/ability_icons/melee/30x30/gflurry.png',
    },
    // Greater Barge → Greater Flurry (Endless Assault): channel converted to multihit
    [ABILITIES.GREATER_FLURRY_BARGE]: {
        minHit: 0.6,
        varHit: 0.1,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'threshold',
        mainStyle: 'melee',
        damageType: 'melee',
        duration: 3,
        hits: {
            1: [ABILITIES.GREATER_FLURRY_HIT, ABILITIES.GREATER_FLURRY_HIT, ABILITIES.GREATER_FLURRY_HIT, ABILITIES.GREATER_FLURRY_HIT,
                ABILITIES.GREATER_FLURRY_HIT, ABILITIES.GREATER_FLURRY_HIT, ABILITIES.GREATER_FLURRY_HIT, ABILITIES.GREATER_FLURRY_HIT]
        },
        adrenaline: 25,
        cooldown: 20.4,
        hitTimings: [0, 1, 2, 3, 4, 5, 6, 7],
        parent: ABILITIES.GREATER_FLURRY,
    },
    [ABILITIES.ASSAULT_HIT]: {
        // ability name
        minHit: 1.3, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 30,
        parent: ABILITIES.ASSAULT
    },
    [ABILITIES.ASSAULT]: {
        // ability name
        minHit: 1.3, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        'duration': 7,
        hits: {
            1: [ABILITIES.ASSAULT_HIT],
            2: [],
            3: [ABILITIES.ASSAULT_HIT],
            4: [],
            5: [ABILITIES.ASSAULT_HIT],
            6: [],
            7: [ABILITIES.ASSAULT_HIT]
        },
        adrenaline: 25,
        cooldown: 6,
        hitTimings: [0, 2, 4, 6],
        title: 'Assault',
        icon: '/ability_icons/melee/30x30/assault.png',
    },
    // Greater Barge → Assault (Endless Assault): channel converted to multihit, player free to act
    [ABILITIES.ASSAULT_BARGE]: {
        minHit: 1.3,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'threshold',
        mainStyle: 'melee',
        damageType: 'melee',
        duration: 3,
        hits: {
            1: [ABILITIES.ASSAULT_HIT, ABILITIES.ASSAULT_HIT, ABILITIES.ASSAULT_HIT, ABILITIES.ASSAULT_HIT],
        },
        adrenaline: 25,
        cooldown: 6,
        hitTimings: [0, 2, 4, 6],
        parent: ABILITIES.ASSAULT,
    },
    [ABILITIES.HURRICANE_1]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 20.4,
        parent: ABILITIES.HURRICANE},
    [ABILITIES.HURRICANE_2]: {
        // ability name
        minHit: 1.55, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 20.4,
        parent: ABILITIES.HURRICANE},
    [ABILITIES.HURRICANE]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 25,
        hitTimings: [0, 0],
        hits: {
            1: [ABILITIES.HURRICANE_1, ABILITIES.HURRICANE_2]
        },
        cooldown: 20.4
    ,
        title: 'Hurricane',
        icon: '/ability_icons/melee/30x30/cane.png',
    },
    [ABILITIES.BLOODLUST_HURRICANE_HIT]: {
        minHit: 0.75,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'proc',
        abilityType: 'threshold',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.ASSAULT
    },
    [ABILITIES.SLAUGHTER_HIT]: {
        // ability name
        minHit: 0.8, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 30,
        parent: ABILITIES.SLAUGHTER
    },
    [ABILITIES.FLURRY_HIT]: {
        // ability name
        minHit: 0.6, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 20.4,
        parent: ABILITIES.FLURRY
    },
    [ABILITIES.FLURRY]: {
        // ability name
        minHit: 0.6, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        'duration': 8,
        hits: {
            1: [ABILITIES.FLURRY_HIT],
            2: [ABILITIES.FLURRY_HIT],
            3: [ABILITIES.FLURRY_HIT],
            4: [ABILITIES.FLURRY_HIT],
            5: [ABILITIES.FLURRY_HIT],
            6: [ABILITIES.FLURRY_HIT],
            7: [ABILITIES.FLURRY_HIT],
            8: [ABILITIES.FLURRY_HIT]
        },
        adrenaline: 25,
        cooldown: 20.4,
        hitTimings: [0, 2, 4, 6]
    ,
        title: 'Flurry',
        icon: '/ability_icons/melee/30x30/flurry.png',
    },
    // Greater Barge → Flurry (Endless Assault): channel converted to multihit
    [ABILITIES.FLURRY_BARGE]: {
        minHit: 0.6,
        varHit: 0.1,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'threshold',
        mainStyle: 'melee',
        damageType: 'melee',
        duration: 3,
        hits: {
            1: [ABILITIES.FLURRY_HIT, ABILITIES.FLURRY_HIT, ABILITIES.FLURRY_HIT, ABILITIES.FLURRY_HIT,
                ABILITIES.FLURRY_HIT, ABILITIES.FLURRY_HIT, ABILITIES.FLURRY_HIT, ABILITIES.FLURRY_HIT],
        },
        adrenaline: 25,
        cooldown: 20.4,
        hitTimings: [0, 1, 2, 3, 4, 5, 6, 7],
        parent: ABILITIES.FLURRY,
    },
    [ABILITIES.DISMEMBER_HIT]: {
        // ability name
        minHit: 0.25, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 0,
        parent: ABILITIES.DISMEMBER
    },
    [ABILITIES.DISMEMBER]: {
        // ability name
        minHit: 0.8, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        hits: {
            1: [
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT,
                ABILITIES.DISMEMBER_HIT
            ]},
        adrenaline: 0,
        cooldown: 24,
        hitTimings: [1, 3, 5, 7, 9, 11, 13, 15],
        title: 'Dismember',
        icon: '/ability_icons/melee/Dismember.png',
    },
    [ABILITIES.SLAUGHTER]: {
        // ability name
        minHit: 0.8, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        hits: {
            1: [
                ABILITIES.SLAUGHTER_HIT,
                ABILITIES.SLAUGHTER_HIT,
                ABILITIES.SLAUGHTER_HIT,
                ABILITIES.SLAUGHTER_HIT,
                ABILITIES.SLAUGHTER_HIT,
                ABILITIES.SLAUGHTER_HIT
            ]}
        ,
        adrenaline: 25,
        cooldown: 30,
        hitTimings: [1, 4, 7, 10, 13, 16]
    ,
        title: 'Slaughter',
        icon: '/ability_icons/melee/Slaughter.png',
    },
    [ABILITIES.MASSACRE_INITIAL]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 60},
    [ABILITIES.MASSACRE_BLEED]: {
        // ability name
        minHit: 1.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 60},
    [ABILITIES.MASSACRE]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        hits: {
            1: [
                ABILITIES.MASSACRE_INITIAL,
                ABILITIES.MASSACRE_BLEED,
                ABILITIES.MASSACRE_BLEED,
                ABILITIES.MASSACRE_BLEED,
                ABILITIES.MASSACRE_BLEED,
                ABILITIES.MASSACRE_BLEED,
                ABILITIES.MASSACRE_BLEED
            ]
        },
        hitTimings: [1, 2, 6, 10, 14, 18, 22],
        adrenaline: 25,
        cooldown: 60,
        title: 'Massacre',
        icon: '/ability_icons/melee/Massacre.png',
    },
    // Melee Ultimate Abilities
    [ABILITIES.OVERPOWER_HIT]: {
        // Igneous Overpower hit: 280-340% per hit (2 hits total)
        minHit: 2.8,
        varHit: 0.6,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'ultimate',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 30,
        parent: ABILITIES.OVERPOWER
    },
    [ABILITIES.OVERPOWER]: {
        // Non-igneous: 520-570% single hit. Igneous: 2x 280-340% hits.
        // Default hit sequence is igneous (swapped at calc time if no cape)
        minHit: 5.2,
        varHit: 0.5,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'ultimate',
        mainStyle: 'melee',
        damageType: 'melee',
        hits: {
            1: [ABILITIES.OVERPOWER_HIT, 'next hit', ABILITIES.OVERPOWER_HIT]
        },
        adrenaline: 60,
        hitTimings: [1, 1],
        cooldown: 30
    ,
        title: 'Overpower',
        icon: '/ability_icons/melee/30x30/overpower.png',
    },
    [ABILITIES.METEOR_STRIKE]: {
        // ability name
        minHit: 2.2, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 60,
        cooldown: 60,
        title: 'Meteor strike',
        icon: '/ability_icons/melee/30x30/meteor.png',
    },
    [ABILITIES.PULVERISE]: {
        // ability name
        minHit: 3.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 60,
        cooldown: 60,
        title: 'Pulverise',
        icon: '/ability_icons/melee/30x30/pulverise.png',
    },
    // Melee Special Attacks
    [ABILITIES.IGNEOUS_SHOWDOWN_HIT]: {
        minHit: 2.6,
        varHit: 0.4,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'special attack',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.IGNEOUS_SHOWDOWN
    },
    [ABILITIES.IGNEOUS_SHOWDOWN_BONUS]: {
        minHit: 2.45,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'special attack',
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.IGNEOUS_SHOWDOWN
    },
    [ABILITIES.IGNEOUS_SHOWDOWN]: {
        minHit: 2.6,
        varHit: 0.4,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'special attack',
        mainStyle: 'melee',
        damageType: 'melee',
        'hits': {
            1: [ABILITIES.IGNEOUS_SHOWDOWN_HIT]
        },
        hitTimings: [1],
        adrenaline: 50,
        cooldown: 60,
        title: 'Igneous showdown',
        icon: '/ability_icons/melee/30x30/ezk-bg.png',
    },
    [ABILITIES.THE_FINAL_FLURRY_1]: {
        minHit: 0.8,
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 0,
    },
    [ABILITIES.THE_FINAL_FLURRY_2]: {
        minHit: 1.5,
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 0,
    },
    [ABILITIES.THE_FINAL_FLURRY]: {
        minHit: 0.85,
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        hitTimings: [0, 1, 2],
        hits: {
            1: [ABILITIES.THE_FINAL_FLURRY_1, 'next hit', ABILITIES.THE_FINAL_FLURRY_1,
                'next hit', ABILITIES.THE_FINAL_FLURRY_2
            ]
        }
    ,
        title: 'The Final Flurry',
        icon: '/gear_icons/melee/varanus\'s mercy.png',
    },
    [ABILITIES.QUICK_SMASH]: {
        // ability name
        minHit: 1.15, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0.0,
        title: 'Quick smash',
        icon: '/ability_icons/melee/30x30/gmaul-bg.png',
        common: false
    },
    [ABILITIES.ICY_TEMPEST_1]: {
        // ability name
        minHit: 1.15, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.ICY_TEMPEST
    },
    [ABILITIES.ICY_TEMPEST_2]: {
        // ability name
        minHit: 1.75, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.ICY_TEMPEST
    },
    [ABILITIES.ICY_TEMPEST]: {
        // ability name
        minHit: 1.15, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        hits: {
            1: [ABILITIES.ICY_TEMPEST_1, 'next hit', ABILITIES.ICY_TEMPEST_2]
        },
        adrenaline: 30,
        hitTimings: [0, 0], 
        cooldown: 15,
        title: 'Icy tempest',
        icon: '/ability_icons/melee/leng.png',
    },
    [ABILITIES.SUNFALL_SLAM]: {
        // ability name
        minHit: 2.9, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 40,
        cooldown: 60.0,
        title: 'Sunfall Slam',
        icon: '/gear_icons/melee/tumeken\'s light.png',
    },
    [ABILITIES.LESSER_PURIFYING_LIGHT]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    },
    [ABILITIES.PURIFYING_LIGHT]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        title: 'Purifying Light',
    },
    [ABILITIES.SLICE_N_DICE_1]: {
        // ability name
        minHit: 1.8, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 3},
    [ABILITIES.SLICE_N_DICE_2]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 3},
    [ABILITIES.SLICE_N_DICE_3]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 3},
    [ABILITIES.SLICE_N_DICE]: {
        // ability name
        minHit: 1.0, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        hits: {
            1: [
                ABILITIES.SLICE_N_DICE_1,
                'next hit',
                ABILITIES.SLICE_N_DICE_2,
                'next hit',
                ABILITIES.SLICE_N_DICE_3,
                'next hit',
                ABILITIES.SLICE_N_DICE_3
            ]
        },
        hitTimings: [0, 1, 1, 1],
        cooldown: 3,
        adrenaline: 50,
        title: 'Slice & dice',
        icon: '/ability_icons/melee/30x30/dclaw-bg.png',
    },
    [ABILITIES.POWERSTAB]: {
        // ability name
        minHit: 2.6, // min % of abil expressed as a decimal
        varHit: 0.6,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0,
        title: 'Powerstab',
        icon: '/ability_icons/melee/30x30/dragon_2h_sword.png',
        common: false
    },
    [ABILITIES.DRACONIC_SLASH]: {
        // ability name
        minHit: 2.4, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 25,
        cooldown: 0,
        title: 'Draconic Slash',
        icon: '/ability_icons/melee/30x30/dragon_scimitar.png',
        common: false
    },
    [ABILITIES.OBLITERATE]: {
        // ability name
        minHit: 1.6, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 35,
        cooldown: 0,
        title: 'Obliterate',
        icon: '/ability_icons/melee/30x30/statius_warhammer.png',
        common: false
    },
    [ABILITIES.DRACONIC_CLEAVE]: {
        // ability name
        minHit: 2.75, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 25,
        cooldown: 7.2,
        title: 'Draconic Cleave',
        icon: '/ability_icons/melee/30x30/dlong-bg.png',
        common: false
    },
    [ABILITIES.ARMADYLS_JUDGEMENT]: {
        // ability name
        minHit: 4.0, // min % of abil expressed as a decimal
        varHit: 0.8,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0,
        title: 'Armadyl\'s judgement',
        icon: '/ability_icons/melee/ags.png',
        common: false
    },
    [ABILITIES.DRACONIC_PUNCTURE_HIT]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.DRACONIC_PUNCTURE
    },
    [ABILITIES.DRACONIC_PUNCTURE]: {
        // ability name
        minHit: 1.25, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        hits: {
            1: [ABILITIES.DRACONIC_PUNCTURE_HIT, 'next hit', ABILITIES.DRACONIC_PUNCTURE_HIT]
        },
        hitTimings: [0, 1],
        cooldown: 0,
        adrenaline: 25,
        title: 'Draconic Puncture',
        icon: '/ability_icons/melee/dds.png',
        common: false
    },
    [ABILITIES.SWEEP_HIT]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.SWEEP},
    [ABILITIES.SWEEP]: {
        // ability name
        minHit: 1.05, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 30,
        hits: {
            1: [ABILITIES.SWEEP_HIT, 'next hit', ABILITIES.SWEEP_HIT]
        },
        hitTimings: [1, 1], //Todo fix
        cooldown: 0,
        title: 'Sweep',
        icon: '/ability_icons/melee/30x30/dhally.png',
        common: false
    },
    [ABILITIES.DRACONIC_BLOW]: {
        // ability name
        minHit: 2.4, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 20,
        cooldown: 0,
        title: 'Draconic Blow',
        icon: '/ability_icons/melee/dmace.png',
        common: false
    },
    [ABILITIES.VINE_CALL_INITIAL]: {
        // ability name
        minHit: 1.0, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0,
        title: 'Vine Call Initial',
        common: false
    },
    [ABILITIES.VINE_CALL_AOE]: {
        // ability name
        minHit: 0.2, // min % of abil expressed as a decimal
        varHit: 0.05,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 0,
        cooldown: 0,
        title: 'Vine Call AOE',
        common: false
    },
    [ABILITIES.VINE_CALL]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        hits: {
            1: [ABILITIES.VINE_CALL_INITIAL, ...Array(10).fill(ABILITIES.VINE_CALL_AOE)]
        },
        cooldown: 19.8,
        hitTimings: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
        title: 'Vine Call',
        icon: '/gear_icons/melee/Abyssal_vine_whip.png',
        common: false
    },
    [ABILITIES.WARSTRIKE]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0
    ,
        title: 'Warstrike',
        icon: '/ability_icons/melee/30x30/bandos_godsword.png',
        common: false
    },
    [ABILITIES.SUNDER]: {
        // ability name
        minHit: 1.25, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0
    ,
        title: 'Sunder',
        icon: '/ability_icons/melee/30x30/barrelchest_anchor.png',
        common: false
    },
    [ABILITIES.BACKSTAB]: {
        // ability name
        minHit: 1.5, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0
    ,
        title: 'Backstab',
        icon: '/ability_icons/melee/30x30/bone_dagger.png',
        common: false
    },
    [ABILITIES.LIQUEFY]: {
        // ability name
        minHit: 1.25, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0
    ,
        title: 'Liquefy',
        icon: '/ability_icons/melee/30x30/brine_sabre.png',
        common: false
    },
    [ABILITIES.CLOBBER]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 0,
        title: 'Clobber',
        icon: '/ability_icons/melee/30x30/dragon_hatchet.png',
        common: false
    },
    [ABILITIES.WEAKEN_SPECIAL_ATTACK]: {
        // ability name
        minHit: 0.75, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0,
        title: 'Weaken',
        icon: '/ability_icons/melee/30x30/darklight.png',
        common: false
    },
    [ABILITIES.SHOVE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0},
    [ABILITIES.AIMED_STRIKE]: {
        // ability name
        minHit: 1.5, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 0,
        title: 'Aimed strike',
        icon: '/ability_icons/melee/30x30/keenblade.png',
        common: false
    },
    [ABILITIES.DISRUPT]: {
        // ability name
        minHit: 2.3, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'magic'
    ,
        cooldown: 0,
        title: 'Disrupt',
        icon: '/ability_icons/melee/30x30/korasis_sword.png',
        common: false
    },
    [ABILITIES.GET_OVER_HERE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 0},
    [ABILITIES.IMPALE]: {
        // ability name
        minHit: 1.3, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 0,
        title: 'Impale',
        icon: '/ability_icons/melee/30x30/rune_claws.png',
        common: false
    },
    [ABILITIES.HEALING_BLADE]: {
        // ability name
        minHit: 1.85, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee'
    ,
        cooldown: 0,
        title: 'Healing Blade',
        icon: '/ability_icons/melee/30x30/saradomin_godsword.png',
        common: false
    },
    [ABILITIES.SARADOMINS_LIGHTNING_HIT]: {
        // ability name
        minHit: 2.85, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        cooldown: 0,
        parent: ABILITIES.SARADOMINS_LIGHTNING
    },
    [ABILITIES.SARADOMINS_LIGHTNING]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        hits: {
            1: [ABILITIES.SARADOMINS_LIGHTNING_HIT, 'next hit', ABILITIES.SARADOMINS_LIGHTNING_HIT]
        },
        hitTimings: [2, 2], // TODO fix
        adrenaline: 100,
        cooldown: 0
    ,
        title: 'Saradomin\'s Lightning',
        icon: '/ability_icons/melee/30x30/saradomin_sword.png',
        common: false
    },
    [ABILITIES.FEINT]: {
        // ability name
        minHit: 2.55, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 25,
        cooldown: 0,
        title: 'Feint',
        icon: '/ability_icons/melee/30x30/vls.png',
        common: false
    },
    [ABILITIES.SPEAR_WALL]: {
        // ability name
        minHit: 1.05, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0,
        title: 'Spear Wall',
        icon: '/ability_icons/melee/30x30/vestas_spear.png',
        common: false
    },
    [ABILITIES.ICE_CLEAVE]: {
        // ability name
        minHit: 1.85, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 60,
        cooldown: 7.2,
        title: 'Ice Cleave',
        icon: '/ability_icons/melee/30x30/zamorak_godsword.png',
        common: false
    },
    [ABILITIES.RAMPAGE]: {
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 100,
        cooldown: 0,
        title: 'Rampage',
        icon: '/gear_icons/melee/dragon battleaxe.png',
    },
    [ABILITIES.BERSERK]: {
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 100,
        cooldown: 60,
        title: 'Berserk',
        icon: '/ability_icons/melee/berserk.webp',
    },
    [ABILITIES.BLACKHOLE]: {
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'melee',
        damageType: 'melee',
        adrenaline: 50,
        cooldown: 0,
        title: 'Blackhole',
        icon: '/ability_icons/melee/blackhole.webp',
    },
    // Mage Basic Abilities
    [ABILITIES.MAGIC_AUTO]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 0,
        title: 'Auto',
        icon: '/ability_icons/magic/Magic_ability.png',
    },
    [ABILITIES.GREATER_CONCENTRATED_BLAST_1]: {
        // ability name
        minHit: 0.40, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        parent: ABILITIES.GREATER_CONCENTRATED_BLAST
    },
    [ABILITIES.GREATER_CONCENTRATED_BLAST_2]: {
        // ability name
        minHit: 0.40, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        parent: ABILITIES.GREATER_CONCENTRATED_BLAST
    },
    [ABILITIES.GREATER_CONCENTRATED_BLAST_3]: {
        // ability name
        minHit: 0.40, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        parent: ABILITIES.GREATER_CONCENTRATED_BLAST
        },
    [ABILITIES.GREATER_CONCENTRATED_BLAST]: {
        // ability name
        minHit: 0.40, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: [ABILITIES.GREATER_CONCENTRATED_BLAST_1],
            2: [ABILITIES.GREATER_CONCENTRATED_BLAST_2],
            3: [ABILITIES.GREATER_CONCENTRATED_BLAST_3]
        },
        cooldown: 5.4,
        title: 'Greater Concentrated Blast',
        icon: '/ability_icons/magic/30x30/greater_concentrated_blast.png',
    },
    [ABILITIES.GREATER_SONIC_WAVE]: {
        // ability name
        minHit: 1.15, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        title: 'Greater sonic wave',
        icon: '/ability_icons/magic/30x30/greater_sonic_wave.png',
    },
    [ABILITIES.DRAGON_BREATH]: {
        // ability name
        minHit: 1.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 7.2,
        title: 'Dragon breath',
        icon: '/ability_icons/magic/30x30/dragon_breath.png',
    },
    [ABILITIES.GREATER_CHAIN]: {
        // ability name
        minHit: 0.80, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 10.2,
        title: 'Greater chain',
        icon: '/ability_icons/magic/30x30/greater_chain.png',
    },
    [ABILITIES.CONCENTRATED_BLAST_1]: {
        // ability name
        minHit: 0.30, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 5.4,
        parent: ABILITIES.CONCENTRATED_BLAST
    },
    [ABILITIES.CONCENTRATED_BLAST_2]: {
        // ability name
        minHit: 0.30, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 5.4,
        parent: ABILITIES.CONCENTRATED_BLAST
    },
    [ABILITIES.CONCENTRATED_BLAST_3]: {
        // ability name
        minHit: 0.30, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 5.4,
        parent: ABILITIES.CONCENTRATED_BLAST
    },
    [ABILITIES.CONCENTRATED_BLAST]: {
        // ability name
        minHit: 0.30, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: [ABILITIES.CONCENTRATED_BLAST_1],
            2: [ABILITIES.CONCENTRATED_BLAST_2],
            3: [ABILITIES.CONCENTRATED_BLAST_3]
        },
        cooldown: 5.4
    ,
        title: 'Concentrated blast',
        icon: '/ability_icons/magic/30x30/concentrated_blast.png',
        common: false
    },
    [ABILITIES.SONIC_WAVE]: {
        // ability name
        minHit: 0.90, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        title: 'Sonic wave',
        icon: '/ability_icons/magic/30x30/sonic_wave.png',
        common: false
    },
    [ABILITIES.COMBUST_HIT]: {
        // ability name
        minHit: 0.27, // min % of abil expressed as a decimal
        varHit: 0.06,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'burn', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 18,
        parent: ABILITIES.COMBUST},
    [ABILITIES.COMBUST]: {
        // ability name
        minHit: 0.27, // min % of abil expressed as a decimal
        varHit: 0.06,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'burn', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: [
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT,
                ABILITIES.COMBUST_HIT
            ]
        },
        cooldown: 18,
        hitTimings: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]
    ,
        title: 'Combust',
        icon: '/ability_icons/magic/30x30/combust.png',
    },
    [ABILITIES.CHAIN]: {
        // ability name
        minHit: 0.70, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 10.2,
        title: 'Chain',
        icon: '/ability_icons/magic/30x30/chain.png',
        common: false
    },
    [ABILITIES.IMPACT]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        title: 'Impact',
        icon: '/ability_icons/magic/30x30/impact.png',
        common: false
    },
    [ABILITIES.SHOCK]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 15},
    // Mage Abilities
    [ABILITIES.SMOKE_CLOUD]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 0,
        cooldown: 0,
        title: 'Smoke cloud',
        icon: '/effect_icons/smoke_cloud.png',
    },
    // Mage Enhanced Abilities
    [ABILITIES.ASPHYXIATE_HIT]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 5.4,
        parent: ABILITIES.ASPHYXIATE
    },
    [ABILITIES.ASPHYXIATE_LAST_HIT]: {
        minHit: 1.2,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        parent: ABILITIES.ASPHYXIATE
    },
    [ABILITIES.ASPHYXIATE]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 25,
        'duration': 7,
        hits: {
            1: [ABILITIES.ASPHYXIATE_HIT],
            2: [],
            3: [ABILITIES.ASPHYXIATE_HIT],
            4: [],
            5: [ABILITIES.ASPHYXIATE_HIT],
            6: [],
            7: [ABILITIES.ASPHYXIATE_LAST_HIT]
        },
        cooldown: 20.4,
        title: 'Asphyxiate',
        icon: '/ability_icons/magic/30x30/asphyxiate.png',
    },
    // Tumeken's Resplendence Asphyxiate (4+ pieces): 8 hits, 71-84% per hit
    [ABILITIES.TUMEKEN_ASPHYXIATE_HIT]: {
        minHit: 0.72,
        varHit: 0.12,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 5.4,
        parent: ABILITIES.TUMEKEN_ASPHYXIATE
    },
    [ABILITIES.TUMEKEN_ASPHYXIATE_LAST_HIT]: {
        minHit: 0.72,
        varHit: 0.12,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        parent: ABILITIES.TUMEKEN_ASPHYXIATE
    },
    [ABILITIES.TUMEKEN_ASPHYXIATE]: {
        minHit: 0.72,
        varHit: 0.12,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'channel',
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 25,
        'duration': 8,
        hits: {
            1: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            2: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            3: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            4: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            5: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            6: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            7: [ABILITIES.TUMEKEN_ASPHYXIATE_HIT],
            8: [ABILITIES.TUMEKEN_ASPHYXIATE_LAST_HIT]
        },
        cooldown: 20.4,
        icon: '/ability_icons/magic/30x30/asphyxiate.png',
    },
    [ABILITIES.WILD_MAGIC_HIT]: {
        // ability name
        minHit: 1.25, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 5.4,
        parent: ABILITIES.WILD_MAGIC
    },
    [ABILITIES.WILD_MAGIC]: {
        // ability name
        minHit: 1.25, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 25,
        hits: {
            1: [ABILITIES.WILD_MAGIC_HIT, 'next hit', ABILITIES.WILD_MAGIC_HIT]
        },
        cooldown: 5.4,
        hitTimings: [1, 1],
        title: 'Wild magic',
        icon: '/ability_icons/magic/30x30/wild_magic.png',
    },
    [ABILITIES.SMOKE_TENDRILS_1]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 45,
        parent: ABILITIES.SMOKE_TENDRILS},
    [ABILITIES.SMOKE_TENDRILS_2]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.15,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 45,
        parent: ABILITIES.SMOKE_TENDRILS},
    [ABILITIES.SMOKE_TENDRILS_3]: {
        // ability name
        minHit: 0.75, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 45,
        parent: ABILITIES.SMOKE_TENDRILS},
    [ABILITIES.SMOKE_TENDRILS_4]: {
        // ability name
        minHit: 0.85, // min % of abil expressed as a decimal
        varHit: 0.25,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 45,
        parent: ABILITIES.SMOKE_TENDRILS
    },
    [ABILITIES.SMOKE_TENDRILS]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        'duration': 7,
        hits: {
            1: [ABILITIES.SMOKE_TENDRILS_1],
            2: [],
            3: [ABILITIES.SMOKE_TENDRILS_2],
            4: [],
            5: [ABILITIES.SMOKE_TENDRILS_3],
            6: [],
            7: [ABILITIES.SMOKE_TENDRILS_4]
        },
        cooldown: 45
    ,
        title: 'Smoke tendrils',
        icon: '/ability_icons/magic/30x30/smoke_tendrils.png',
    },
    [ABILITIES.MAGMA_TEMPEST_HIT]: {
        // ability name
        minHit: 0.35, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 21,
        parent: ABILITIES.MAGMA_TEMPEST
    },
    [ABILITIES.MAGMA_TEMPEST]: {
        // ability name
        minHit: 0.35, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 20,
        hits: {
            1: [ABILITIES.MAGMA_TEMPEST_HIT],
            2: [ABILITIES.MAGMA_TEMPEST_HIT],
            3: [ABILITIES.MAGMA_TEMPEST_HIT],
            4: [ABILITIES.MAGMA_TEMPEST_HIT],
            5: [ABILITIES.MAGMA_TEMPEST_HIT],
            6: [ABILITIES.MAGMA_TEMPEST_HIT],
            7: [ABILITIES.MAGMA_TEMPEST_HIT],
            8: [ABILITIES.MAGMA_TEMPEST_HIT]
        },
        cooldown: 21,
        hitTimings: [3, 5, 7, 9, 11, 13, 15, 17]
    ,
        title: 'Magma tempest',
        icon: '/ability_icons/magic/30x30/magma_tempest.png',
    },
    [ABILITIES.CORRUPTION_BLAST]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 20,
        hits: {
            1: [
                ABILITIES.CORRUPTION_BLAST_HIT_1,
                ABILITIES.CORRUPTION_BLAST_HIT_2,
                ABILITIES.CORRUPTION_BLAST_HIT_3,
                ABILITIES.CORRUPTION_BLAST_HIT_4,
                ABILITIES.CORRUPTION_BLAST_HIT_5
            ]
        },
        cooldown: 15,
        hitTimings: [1, 3, 5, 7, 9],
    
        title: 'Corruption blast',
        icon: '/ability_icons/magic/30x30/corruption_blast.png',
    },
    [ABILITIES.CORRUPTION_BLAST_HIT_1]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_BLAST
    },
    [ABILITIES.CORRUPTION_BLAST_HIT_2]: {
        // ability name
        minHit: 0.72, // min % of abil expressed as a decimal
        varHit: 0.16,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_BLAST
    },
    [ABILITIES.CORRUPTION_BLAST_HIT_3]: {
        // ability name
        minHit: 0.576, // min % of abil expressed as a decimal
        varHit: 0.128,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_BLAST
    },
    [ABILITIES.CORRUPTION_BLAST_HIT_4]: {
        // ability name
        minHit: 0.4608, // min % of abil expressed as a decimal
        varHit: 0.1024,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_BLAST
    },
    [ABILITIES.CORRUPTION_BLAST_HIT_5]: {
        // ability name
        minHit: 0.36864, // min % of abil expressed as a decimal
        varHit: 0.08192,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_BLAST
    },
    // Mage Ultimate Abilities
    [ABILITIES.OMNIPOWER_REGULAR]: {
        // ability name
        minHit: 4.2, // min % of abil expressed as a decimal
        varHit: 0.8,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 30
    },
    [ABILITIES.OMNIPOWER_IGNEOUS_HIT]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 30
    },
    [ABILITIES.OMNIPOWER]: {
        // ability name
        minHit: 4.2, // min % of abil expressed as a decimal
        varHit: 0.8,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 60,
        hits: {
            1: [ABILITIES.OMNIPOWER_IGNEOUS_HIT, "next hit", ABILITIES.OMNIPOWER_IGNEOUS_HIT, "next hit", ABILITIES.OMNIPOWER_IGNEOUS_HIT, "next hit", ABILITIES.OMNIPOWER_IGNEOUS_HIT]
        },
        cooldown: 30,
        hitTimings: [0, 0, 0, 0],
        title: 'Omnipower',
        icon: '/ability_icons/magic/30x30/omnipower.png',
    },
    [ABILITIES.TSUNAMI]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 60,
        title: 'Tsunami',
        icon: '/ability_icons/magic/30x30/tsunami.png',
    },
    [ABILITIES.SUNSHINE_DOT]: {
        // ability name
        minHit: 0.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 60
    },
    [ABILITIES.SUNSHINE]: {
        //TODO check number of dot hits
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: new Array(17).fill(ABILITIES.SUNSHINE_DOT)
           },
        cooldown: 60,
        hitTimings: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],//TODO Find out what these actually are
        title: 'Sunshine',
        icon: '/ability_icons/magic/Sunshine.png',
    },
    [ABILITIES.GREATER_SUNSHINE]: {
        //TODO check number of dot hits
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: new Array(17).fill(ABILITIES.SUNSHINE_DOT)
        },
        cooldown: 60,
        hitTimings: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],//TODO Find out what these actually are
        title: 'Greater Sunshine',
        icon: '/ability_icons/magic/Greater_Sunshine.png',
    },
    // Mage Special Attacks
    [ABILITIES.INSTABILITY]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 50,
        cooldown: 60,
        title: 'Instability',
        icon: '/ability_icons/magic/Fractured_Staff_of_Armadyl.webp',
    },
    [ABILITIES.TIME_STRIKE]: {
        // ability name
        minHit: 0.8, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'proc', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'proc', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic'
    ,
        cooldown: 0,
        title: 'Timestrike',
        icon: '/ability_icons/magic/30x30/time_strike-bg.png',
    },
    [ABILITIES.SOULFIRE_INITIAL]: {
        // ability name
        minHit: 1.3, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 0,
        parent: ABILITIES.SOULFIRE
    },
    [ABILITIES.SOULFIRE_BURN]: {
        // ability name
        minHit: 1.7, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'burn', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 0,
        parent: ABILITIES.SOULFIRE
    },
    [ABILITIES.SOULFIRE]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1, 
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'burn', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: [
                ABILITIES.SOULFIRE_INITIAL,
                ABILITIES.SOULFIRE_BURN,
                ABILITIES.SOULFIRE_BURN,
                ABILITIES.SOULFIRE_BURN,
                ABILITIES.SOULFIRE_BURN,
                ABILITIES.SOULFIRE_BURN,
                ABILITIES.SOULFIRE_BURN,
            ]//2509, 3840
        },
        cooldown: 45,
        hitTimings: [0, 0, 3, 6, 9, 12, 15],
        adrenaline: 35,
        title: 'Soulfire',
        icon: '/ability_icons/magic/30x30/roar_of_awakening.png',
    },
    [ABILITIES.THE_LAST_COMMAND]: {
        minHit: 2.4,
        varHit: 0.4,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'special attack',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 0,
        adrenaline: 35,
        title: 'The Last Command', 
        icon: '/ability_icons/magic/30x30/Legatus\'s_Emberstaff.png',
    },
    [ABILITIES.TEMPEST_OF_ARMADYL_HIT_1]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic'
    ,
        cooldown: 0,
        parent: ABILITIES.TEMPEST_OF_ARMADYL},
    [ABILITIES.TEMPEST_OF_ARMADYL_HIT_2]: {
        // ability name
        minHit: 0.5, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic'
    ,
        cooldown: 0,
        parent: ABILITIES.TEMPEST_OF_ARMADYL},
    [ABILITIES.TEMPEST_OF_ARMADYL_HIT_3]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic'
    ,
        cooldown: 0,
        parent: ABILITIES.TEMPEST_OF_ARMADYL},
    [ABILITIES.TEMPEST_OF_ARMADYL_HIT_4]: {
        // ability name
        minHit: 0.6, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic'
    ,
        cooldown: 0,
        parent: ABILITIES.TEMPEST_OF_ARMADYL},
    [ABILITIES.TEMPEST_OF_ARMADYL_HIT_5]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic'
    ,
        cooldown: 0,
        parent: ABILITIES.TEMPEST_OF_ARMADYL},
    [ABILITIES.TEMPEST_OF_ARMADYL]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: [ABILITIES.TEMPEST_OF_ARMADYL_HIT_1],
            2: [ABILITIES.TEMPEST_OF_ARMADYL_HIT_2],
            3: [ABILITIES.TEMPEST_OF_ARMADYL_HIT_3],
            4: [ABILITIES.TEMPEST_OF_ARMADYL_HIT_4],
            5: [ABILITIES.TEMPEST_OF_ARMADYL_HIT_5]
        },
        cooldown: 0,
        hitTimings: [0, 1, 2, 3, 4],
        duration: 5,
        adrenaline: 50,
        title: 'Tempest of Armadyl',
        icon: '/ability_icons/magic/30x30/armadyl_battlestaff-bg.png',
    },
    [ABILITIES.IBAN_BLAST]: {
        // ability name
        minHit: 3.4, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 50,
        cooldown: 0,
        title: 'Iban blast',
        icon: '/ability_icons/magic/30x30/iban_staff.png',
        common: true
    },
    [ABILITIES.CLAWS_OF_GUTHIX]: {
        // ability name
        minHit: 2.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 25
    ,
        cooldown: 0,
        title: 'Claws of Guthix',
        icon: '/ability_icons/magic/30x30/guthix_staff-bg.png',
    },
    [ABILITIES.RUNE_FLAME]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 35
    ,
        cooldown: 0,
        title: 'Rune flame',
        icon: '/ability_icons/magic/30x30/mindspike.png',
        common: false
    },
    [ABILITIES.DEVOUR]: {
        // ability name
        minHit: 2.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 50
    ,
        cooldown: 0,
        title: 'Devour',
        icon: '/ability_icons/magic/30x30/obliteration.png',
        common: false
    },
    [ABILITIES.REAP]: {
        // ability name
        minHit: 2.7, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 45
    ,
        cooldown: 0,
        title: 'Reap',
        icon: '/ability_icons/magic/30x30/penance_trident.png',
        common: false
    },
    [ABILITIES.SARADOMIN_STRIKE]: {
        // ability name
        minHit: 2.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 25
    ,
        cooldown: 0,
        title: 'Saradomin strike',
        icon: '/ability_icons/magic/30x30/saradomin_staff.png',
        common: false
    },
    [ABILITIES.FROM_THE_SHADOWS_HIT]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 0
    },
    [ABILITIES.FROM_THE_SHADOWS]: {
        // ability name
        minHit: 1.3, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        hits: {
            1: [
                ABILITIES.FROM_THE_SHADOWS_HIT,
                ABILITIES.FROM_THE_SHADOWS_HIT,
                ABILITIES.FROM_THE_SHADOWS_HIT,
                ABILITIES.FROM_THE_SHADOWS_HIT,
                ABILITIES.FROM_THE_SHADOWS_HIT
            ]
        },
        cooldown: 10,
        hitTimings: [2, 4, 6, 8, 10],
        adrenaline: 50,
        title: 'From the shadows',
        icon: '/ability_icons/magic/30x30/staff_of_sliske.png',
        common: false
    },
    [ABILITIES.FLAMES_OF_ZAMORAK]: {
        // ability name
        minHit: 2.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 25,
        cooldown: 0,
        title: 'Flames of Zamorak',
        icon: '/ability_icons/magic/30x30/zamorak_staff.png',
        common: false
    },
    [ABILITIES.MIASMIC_BARRAGE]: {
        // ability name
        minHit: 2.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 50,
        cooldown: 0,
        title: 'Miasmic barrage',
        icon: '/ability_icons/magic/30x30/zuriels_staff.png',
        common: false
    },
    // Necro Basic Abilities
    [ABILITIES.NECRO_AUTO]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic' // basic, threshold, special attack, ability (necromancy classification), ultimate
    ,
        cooldown: 0,
        title: 'Necro auto',
        icon: '/ability_icons/necro/30x30/auto.png',
    },
    [ABILITIES.TOUCH_OF_DEATH]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 14.4,
        title: 'Touch of Death',
        icon: '/ability_icons/necro/30x30/tod.png',
    },
    [ABILITIES.SOUL_SAP]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 5.4,
        title: 'Soul sap',
        icon: '/ability_icons/necro/30x30/soul-sap.png',
    },
    // Necro Enhanced Abilities
    [ABILITIES.FINGER_OF_DEATH]: {
        // ability name
        minHit: 2.7, // min % of abil expressed as a decimal
        varHit: 0.6,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 60,
        cooldown: 0,
        title: 'Finger of death',
        icon: '/ability_icons/necro/30x30/FOD.png',
    },
    [ABILITIES.BLOAT]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 20,
        cooldown: 0,
        title: 'Bloat',
        icon: '/ability_icons/necro/30x30/bloat.png',
    },
    [ABILITIES.SPECTRAL_SCYTHE_1]: {
        // ability name
        minHit: 0.72, // min % of abil expressed as a decimal
        varHit: 0.16,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 10,
        cooldown: 15,
        title: 'Spectral scythe 1',
        icon: '/ability_icons/necro/30x30/scyth-1.png',
    },
    [ABILITIES.SPECTRAL_SCYTHE_2]: {
        // ability name
        minHit: 1.8, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 20,
        cooldown: 15,
        title: 'Spectral scythe 2',
        icon: '/ability_icons/necro/30x30/scyth-2.png',
    },
    [ABILITIES.SPECTRAL_SCYTHE_3]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 30,
        cooldown: 15,
        title: 'Spectral scythe 3',
        icon: '/ability_icons/necro/30x30/scyth-3.png',
    },
    // Necro Abilities
    [ABILITIES.SOUL_STRIKE]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 0,
        cooldown: 0,
        title: 'Soul Strike Main',
        icon: '/ability_icons/necro/30x30/soul_strike.png',
    },
    [ABILITIES.SOUL_STRIKE_AOE]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 0,
        title: 'Soul strike aoe',
        icon: '/ability_icons/necro/30x30/soul_strike.png',
    },
    [ABILITIES.VOLLEY_OF_SOULS]: {
        // ability name - single hit component used by multihit
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 0,
        cooldown: 0},
    [ABILITIES.VOLLEY_OF_SOULS_DYNAMIC]: {
        // Volley of Souls with dynamic hits based on residual souls
        // Total hits = residual souls (minimum 2 required to cast)
        minHit: 1.35,
        varHit: 0.3,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'threshold',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [] // Built dynamically by get_hit_sequence based on residual souls
        },
        cooldown: 0,
        adrenaline: 0,
        title: 'Volley of souls',
        icon: '/ability_icons/necro/30x30/volley.png',
    },
    [ABILITIES.VOLLEY_OF_SOULS_2]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [ABILITIES.VOLLEY_OF_SOULS, 'next hit', ABILITIES.VOLLEY_OF_SOULS]
        },
        adrenaline: 0,
        cooldown: 0
    },
    [ABILITIES.VOLLEY_OF_SOULS_3]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS
            ]
        },
        adrenaline: 0,
        cooldown: 0
    },
    [ABILITIES.VOLLEY_OF_SOULS_4]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS
            ]
        },
        adrenaline: 0,
        cooldown: 0
    },
    [ABILITIES.VOLLEY_OF_SOULS_5]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS,
                'next hit',
                ABILITIES.VOLLEY_OF_SOULS
            ]
        },
        adrenaline: 0,
        cooldown: 0
    },
    [ABILITIES.CONJURE_UNDEAD_ARMY]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 0,
        cooldown: 60,
        title: 'Conjure Undead Army',
        icon: '/ability_icons/necro/30x30/conj-undead-army.png',
    },
    [ABILITIES.CONJURE_SKELETON_WARRIOR]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 0,
        cooldown: 60,
        title: 'Conjure Skeleton Warrior',
        icon: '/ability_icons/necro/30x30/conj-skele.png',
    },
    [ABILITIES.SKELETON_WARRIOR_AUTO]: {
        // ability name
        minHit: 0.22, // min % of abil expressed as a decimal
        varHit: 0.06,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'conjure', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'conjure', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'spirit', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 0,
        title: 'Skeleton Warrior Auto',
        icon: '/ability_icons/necro/30x30/conj-skele.png',
        cooldown: 0
    },
    [ABILITIES.COMMAND_SKELETON_WARRIOR]: {
        // Command Skeleton Warrior: 10x 22-28% hits over 6s (2 hits every 1.2s)
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'conjure',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 15,
        title: 'Command Skeleton Warrior',
        icon: '/ability_icons/necro/Command_Skeleton_Warrior.png',
    },
    [ABILITIES.SKELETON_WARRIOR_AUTO_10]: {
        // ability name
        minHit: 0.22, // min % of abil expressed as a decimal
        varHit: 0.06,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'conjure', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'conjure', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'spirit',
        hits: {
            1: [ABILITIES.SKELETON_WARRIOR_AUTO],
            2: [ABILITIES.SKELETON_WARRIOR_AUTO],
            3: [ABILITIES.SKELETON_WARRIOR_AUTO],
            4: [ABILITIES.SKELETON_WARRIOR_AUTO],
            5: [ABILITIES.SKELETON_WARRIOR_AUTO],
            6: [ABILITIES.SKELETON_WARRIOR_AUTO],
            7: [ABILITIES.SKELETON_WARRIOR_AUTO],
            8: [ABILITIES.SKELETON_WARRIOR_AUTO],
            9: [ABILITIES.SKELETON_WARRIOR_AUTO],
            10: [ABILITIES.SKELETON_WARRIOR_AUTO]
        },
        cooldown: 0
    },
    [ABILITIES.CONJURE_VENGEFUL_GHOST]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 60,
        title: 'Conjure Vengeful Ghost',
        icon: '/ability_icons/necro/30x30/ghost.png',
    },
    [ABILITIES.VENGEFUL_GHOST_AUTO]: {
        // ability name
        minHit: 0.18, // min % of abil expressed as a decimal
        varHit: 0.04,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'conjure', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'conjure', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'spirit', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 0,
        title: 'Vengeful Ghost Auto',
        icon: '/ability_icons/necro/30x30/ghost.png'
    },
    [ABILITIES.CONJURE_PUTRID_ZOMBIE]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 60,
        title: 'Conjure Putrid Zombie',
        icon: '/ability_icons/necro/30x30/conj-zom.png',
    },
    [ABILITIES.PUTRID_ZOMBIE_AUTO]: {
        // ability name
        minHit: 0.18, // min % of abil expressed as a decimal
        varHit: 0.04,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'conjure', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'conjure', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'spirit', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 0,
        title: 'Putrid Zombie Auto',
        icon: '/ability_icons/necro/30x30/conj-zom.png'
    },
    [ABILITIES.PUTRID_ZOMBIE_POISON]: {
        // Putrid Zombie fetid stench: 8-12% poison damage every 1.8s
        minHit: 0.08,
        varHit: 0.04,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'conjure',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'poison',
        cooldown: 0
    },
    [ABILITIES.CONJURE_PHANTOM_GUARDIAN]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 60,
        title: 'Conjure Phantom Guardian',
        icon: '/ability_icons/necro/30x30/command_phantom_guardian.png',
    },
    [ABILITIES.COMMAND_PUTRID_ZOMBIE]: {
        // Command Putrid Zombie: single 360-440% spirit damage explosion
        minHit: 3.6,
        varHit: 0.8,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'spirit',
        cooldown: 15,
        title: 'Command Putrid Zombie',
        icon: '/ability_icons/necro/Command_Putrid_Zombie.png'
    },
    [ABILITIES.COMMAND_PHANTOM_GUARDIAN]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'conjure', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'spirit', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 9,
        title: 'Command Phantom Guardian',
        icon: '/ability_icons/necro/30x30/command_phantom_guardian.png',
    },
    [ABILITIES.BLOOD_SIPHON_BLEED_HIT]: {
        // ability name
        minHit: 0.22, // min % of abil expressed as a decimal
        varHit: 0.06,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 0,
        cooldown: 45,
        parent: ABILITIES.BLOOD_SIPHON,
    },
    [ABILITIES.BLOOD_SIPHON_LAST_HIT]: {
        // ability name
        minHit: 1.17, // min % of abil expressed as a decimal
        varHit: 0.26,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 0,
        cooldown: 45,
        parent: ABILITIES.BLOOD_SIPHON,
    },
    [ABILITIES.BLOOD_SIPHON]: {
        // ability name
        minHit: 1.17, // min % of abil expressed as a decimal
        varHit: 0.26,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        'duration': 8,
        hits: {
            1: [ABILITIES.BLOOD_SIPHON_BLEED_HIT],
            2: [],
            3: [ABILITIES.BLOOD_SIPHON_BLEED_HIT],
            4: [],
            5: [ABILITIES.BLOOD_SIPHON_BLEED_HIT],
            6: [],
            7: [ABILITIES.BLOOD_SIPHON_BLEED_HIT],
            8: [ABILITIES.BLOOD_SIPHON_LAST_HIT]
        },
        adrenaline: 0,
        cooldown: 45,
        hitTimings: [1, 3, 5, 7, 8],


        title: 'Blood siphon',
        icon: '/ability_icons/necro/30x30/blood-siphon.png',
    },
    [ABILITIES.INVOKE_DEATH]: {
        // Invoke Death: applies Death Mark on next necro attack, 12s duration
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 0,
        title: 'Invoke Death',
        icon: '/ability_icons/necro/incantations/Invoke_Death_icon.png',
    },
    
    [ABILITIES.COMMAND_VENGEFUL_GHOST]: {
        // Command Vengeful Ghost: applies Haunted debuff (10% bonus damage, capped at 20% necro AD)
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'conjure',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 0,
        title: 'Command Vengeful Ghost',
        icon: '/ability_icons/necro/Command_Vengeful_Ghost.png',
    },
    // Necro Ultimate Abilities
    [ABILITIES.DEATHSKULLS]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        adrenaline: 60,
        cooldown: 60
    },
    [ABILITIES.DEATHSKULLS_4]: {
        // Death Skulls - single target, igneous (4 damaging hits: M→P→M→P→M→P→M)
        // Non-igneous swapped at calc time to 3 hits (M→P→M→P→M)
        minHit: 2.25,
        varHit: 0.5,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'ultimate',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS
            ]
        },
        adrenaline: 60,
        hitTimings: [0, 2, 4, 6],
        cooldown: 60
    ,
        title: 'Death Skulls',
        icon: '/ability_icons/necro/30x30/skulls.png',
    },
    [ABILITIES.DEATHSKULLS_7]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        hits: {
            1: [
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS,
                ABILITIES.DEATHSKULLS
            ]
        },
        adrenaline: 60,
        cooldown: 0
    },
    [ABILITIES.LIVING_DEATH]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 100,
        cooldown: 90,
        title: 'Living Death',
        icon: '/effect_icons/living_death.png',
    },
    // Necro Special Attacks
    [ABILITIES.DEATH_GRASP]: {
        // ability name
        minHit: 4.05, // min % of abil expressed as a decimal
        varHit: 0.9,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 25,
        cooldown: 30,
        title: 'Death Grasp',
        icon: '/ability_icons/necro/30x30/deathguard-bg.png',
    },
    [ABILITIES.DEATH_ESSENCE]: {
        // ability name
        minHit: 3.6, // min % of abil expressed as a decimal
        varHit: 0.8,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 30,
        cooldown: 0,
        title: 'Death essence',
        icon: '/ability_icons/necro/30x30/omniguard-bg.png',
    },
    [ABILITIES.SOUL_CRUSH]: {
        minHit: 1.35,
        varHit: 0.3,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'special attack',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        adrenaline: 25,
        cooldown: 60,
        title: 'Soul Crush',
        icon: '/gear_icons/necro/devourer\'s guard.png',
    },
    //Necro Incantations
    [ABILITIES.LIFE_TRANSFER]: {
        // Life Transfer: extends active conjure durations by 21s, costs 50% base LP
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 45,
        title: 'Life Transfer',
        icon: '/ability_icons/necro/incantations/Life_Transfer.png',
    },
    [ABILITIES.THREADS_OF_FATE]: {
        // Threads of Fate: single-target necro attacks also hit up to 4 additional enemies, 6.6s
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'necromancy',
        damageType: 'necrotic',
        cooldown: 0,
        title: 'Threads of Fate',
        icon: '/ability_icons/necro/incantations/Threads_of_Fate_icon.png',
    },
    [ABILITIES.SPLIT_SOUL_NECRO]: {
        // Split Soul (Necromancy incantation): 20.4s duration, 60s cooldown
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'necromancy',
        damageType: 'split soul',
        cooldown: 60,
        title: 'Split Soul',
        icon: '/ability_icons/necro/incantations/Split_Soul_icon.png',
    },

    // Ranged Basic Abilities
    [ABILITIES.RANGED_AUTO]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 0,
        title: 'Ranged',
        icon: '/ability_icons/ranged/Ranged_ability.png',
    },
    [ABILITIES.GREATER_RICOCHET_1]: {
        minHit: 0.75, // 75-85% initial hit
        varHit: 0.1,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 10.2,
        parent: ABILITIES.GREATER_RICOCHET},
    [ABILITIES.GREATER_RICOCHET_2]: {
        minHit: 0.15, // 15-20% additional hit
        varHit: 0.05,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 10.2,
        parent: ABILITIES.GREATER_RICOCHET},
    [ABILITIES.GREATER_RICOCHET_3]: {
        minHit: 0.04, // 4-6% greater ricochet additional hit
        varHit: 0.02,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 10.2,
        parent: ABILITIES.GREATER_RICOCHET},
    [ABILITIES.GREATER_RICOCHET]: {
        minHit: 0.75, // 75-85% initial hit
        varHit: 0.1,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'basic',
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [1, 2, 2, 2, 2, 2, 2, 2],
        hits: {
            1: [
                ABILITIES.GREATER_RICOCHET_1,
                'next hit',
                ABILITIES.GREATER_RICOCHET_2,
                'next hit',
                ABILITIES.GREATER_RICOCHET_2,
                'next hit',
                ABILITIES.GREATER_RICOCHET_3,
                'next hit',
                ABILITIES.GREATER_RICOCHET_3,
                'next hit',
                ABILITIES.GREATER_RICOCHET_3,
                'next hit',
                ABILITIES.GREATER_RICOCHET_3
            ]
        },
        cooldown: 10.2,
        title: 'Greater Ricochet',
        icon: '/ability_icons/ranged/30x30/grico.png',
    },
    [ABILITIES.GALESHOT]: {
        minHit: 0.9,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'basic',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 20.4,
        title: 'Galeshot',
        icon: '/ability_icons/ranged/30x30/galeshot.png',
    },
    [ABILITIES.PIERCING_SHOT_HIT]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged'
    ,
        cooldown: 3},
    [ABILITIES.PIERCING_SHOT]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [1, 1],
        hits: {
            1: [ABILITIES.PIERCING_SHOT, 'next cast', ABILITIES.PIERCING_SHOT]
        },
        cooldown: 3,
        title: 'Piercing shot',
        icon: '/ability_icons/ranged/30x30/piercing.png',
    },
    [ABILITIES.RICOCHET]: {
        minHit: 0.75, // 75-85% initial hit
        varHit: 0.1,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'basic',
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [0, 0, 0],
        hits: {
            1: [
                ABILITIES.GREATER_RICOCHET_1,
                'next hit',
                ABILITIES.GREATER_RICOCHET_2,
                'next hit',
                ABILITIES.GREATER_RICOCHET_2
            ]
        },
        cooldown: 10.2,
        title: 'Ricochet',
        icon: '/ability_icons/ranged/30x30/rico.png',
        common: false
    },
    [ABILITIES.BINDING_SHOT]: {
        // ability name
        minHit: 0.65, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 15,
        title: 'Binding shot',
        icon: '/ability_icons/ranged/30x30/binding.png',
    },
    // Ranged Enhanced Abilities
    [ABILITIES.SNAP_SHOT_HIT]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 20.4},
    [ABILITIES.SNAP_SHOT]: {
        // ability name
        minHit: 0.45, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [1, 1], 
        hits: {
            1: [ABILITIES.SNAP_SHOT_HIT, 'next hit', ABILITIES.SNAP_SHOT_HIT]
        },
        adrenaline: 25,
        cooldown: 0,
        title: 'Snap shot',
        icon: '/ability_icons/ranged/30x30/snapshot.png',
    },
    [ABILITIES.RAPID_FIRE_HIT]: {
        minHit: 0.75, 
        varHit: 0.10,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'threshold',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 20.4,
        parent: ABILITIES.RAPID_FIRE},
    [ABILITIES.RAPID_FIRE_LAST_HIT]: {
        minHit: 0.75, // 17.5% avg additional hit
        varHit: 0.10,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'regular',
        abilityType: 'threshold',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 20.4,
        parent: ABILITIES.RAPID_FIRE},
    [ABILITIES.RAPID_FIRE]: {
        minHit: 0.72, // 80% avg initial hit
        varHit: 0.16,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        'duration': 8,
        hits: {
            1: [ABILITIES.RAPID_FIRE_HIT],
            2: [ABILITIES.RAPID_FIRE_HIT],
            3: [ABILITIES.RAPID_FIRE_HIT],
            4: [ABILITIES.RAPID_FIRE_HIT],
            5: [ABILITIES.RAPID_FIRE_HIT],
            6: [ABILITIES.RAPID_FIRE_HIT],
            7: [ABILITIES.RAPID_FIRE_HIT],
            8: [ABILITIES.RAPID_FIRE_LAST_HIT]
        },
        adrenaline: 25,
        cooldown: 20.4,
        hitTimings: [1, 2, 3, 4, 5, 6, 7, 8],
        title: 'Rapid Fire',
        icon: '/ability_icons/ranged/30x30/rapid.png',
    },
    [ABILITIES.SNIPE_HIT]: {
        // ability name
        minHit: 3.0, // min % of abil expressed as a decimal
        varHit: 0.6,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        parent: ABILITIES.SNIPE
        },
    [ABILITIES.SNIPE_HIT_2]: {
        // nightmare gauntlets extra hit
        minHit: 1.5, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        parent: ABILITIES.SNIPE
        },
    [ABILITIES.SNIPE]: {
        // ability name
        minHit: 1.6, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        'duration': 3,
        hits: {
            1: [],
            2: [],
            3: [ABILITIES.SNIPE_HIT]   
        },
        adrenaline: 0,
        hitTimings: [3],
        cooldown: 60.0,
        title: 'Snipe',
        icon: '/ability_icons/ranged/30x30/snipe.png',
    },
    [ABILITIES.SHADOW_TENDRILS]: {
        // ability name
        minHit: 2.0, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 0,
        cooldown: 45,
        title: 'Shadow Tendrils',
        icon: '/ability_icons/ranged/30x30/tendril.png',
    },
    [ABILITIES.IMBUE_SHADOWS]: {
        minHit: 0,
        varHit: 0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'threshold',
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 40,
        cooldown: 60,
        title: 'Imbue Shadows',
        icon: '/ability_icons/ranged/30x30/imbue_shadows.png',
    },
    [ABILITIES.CORRUPTION_SHOT]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hits: {
            1: [
                ABILITIES.CORRUPTION_SHOT_HIT_1,
                ABILITIES.CORRUPTION_SHOT_HIT_2,
                ABILITIES.CORRUPTION_SHOT_HIT_3,
                ABILITIES.CORRUPTION_SHOT_HIT_4,
                ABILITIES.CORRUPTION_SHOT_HIT_5
            ]
        },
        adrenaline: 20,
        cooldown: 15,
        hitTimings: [1, 3, 5, 7, 9],
    
        title: 'Corruption shot',
        icon: '/ability_icons/ranged/30x30/corrupt-shot.png',
    },
    [ABILITIES.CORRUPTION_SHOT_HIT_1]: {
        // ability name
        minHit: 0.9, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_SHOT},
    [ABILITIES.CORRUPTION_SHOT_HIT_2]: {
        // ability name
        minHit: 0.72, // min % of abil expressed as a decimal
        varHit: 0.16,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_SHOT},
    [ABILITIES.CORRUPTION_SHOT_HIT_3]: {
        // ability name
        minHit: 0.576, // min % of abil expressed as a decimal
        varHit: 0.12,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_SHOT},
    [ABILITIES.CORRUPTION_SHOT_HIT_4]: {
        // ability name
        minHit: 0.4608, // min % of abil expressed as a decimal
        varHit: 0.08,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_SHOT},
    [ABILITIES.CORRUPTION_SHOT_HIT_5]: {
        // ability name
        minHit: 0.36864, // min % of abil expressed as a decimal
        varHit: 0.04,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'dot', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 15,
        parent: ABILITIES.CORRUPTION_SHOT},
    [ABILITIES.BOMBARDMENT]: {
        // ability name
        minHit: 2.2, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 25,
        cooldown: 0,
        title: 'Bombardment',
        icon: '/ability_icons/ranged/30x30/bombard.png',
    },
    // Ranged Ultimate Abilities
    [ABILITIES.DEADSHOT_HIT]: {
        // ability name
        minHit: 1.05, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 30,
        title: 'Deadshot',
    },
    [ABILITIES.DEADSHOT]: {
        // Non-igneous: 4x 105-125%. Igneous: 8x 55-75%.
        // Default hit sequence is igneous (swapped at calc time if no cape)
        minHit: 1.15,
        varHit: 0.2,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'multihit',
        abilityType: 'ultimate',
        mainStyle: 'ranged',
        damageType: 'ranged',
        hits: {
            1: [ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT,
                ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT]
        },
        cooldown: 30,
        hitTimings: [1, 1, 1, 1, 1, 1, 1, 1],
        adrenaline: 60,
    
        title: 'Deadshot',
        icon: '/ability_icons/ranged/30x30/deadshot.png',
    },
    [ABILITIES.IGNEOUS_DEADSHOT_HIT]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 30},
    [ABILITIES.IGNEOUS_DEADSHOT]: {
        icon: '/ability_icons/ranged/30x30/deadshot.png',
        minHit: 1.15, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hits: {
            1: [ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT,
                ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT, ABILITIES.IGNEOUS_DEADSHOT_HIT
            ]
        },
        cooldown: 30,
        hitTimings: [1, 1, 1, 1, 1, 1, 1, 1],
        adrenaline: 60
    },
    [ABILITIES.DEATHS_SWIFTNESS]: {
        //TODO check number of dot hits
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 60,
        title: 'Death\'s Swiftness',
        icon: '/ability_icons/ranged/Death\'s_Swiftness.png',
    },
    [ABILITIES.GREATER_DEATHS_SWIFTNESS]: {
        //TODO check number of dot hits
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 60,
        title: 'Greater Death\'s Swiftness',
        icon: '/ability_icons/ranged/Greater_Death\'s_Swiftness.png',
    },
    // Ranged Special Attacks
    [ABILITIES.CRYSTAL_RAIN]: {
        // ability name
        minHit: 1.25, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [3, 4, 4, 4, 4], //TODO check these are correct
        adrenaline: 30,
        cooldown: 30,
        title: 'Crystal Rain',
        icon: '/ability_icons/ranged/30x30/sgb.png',
    },
    [ABILITIES.SHADOWFALL_1]: {
        // ability name
        minHit: 0.85, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
    },
    [ABILITIES.SHADOWFALL_2]: {
        // ability name
        minHit: 2.55, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
    },
    [ABILITIES.SHADOWFALL]: {
        // ability name
        minHit: 0.85, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 65,
        hits: {
            1: [ABILITIES.SHADOWFALL_1, 'next hit', ABILITIES.SHADOWFALL_1, 'next hit', ABILITIES.SHADOWFALL_2]
        },
        hitTimings: [1, 1, 2] // TODO check
    ,
        title: 'Shadowfall',
        icon: '/gear_icons/ranged/gloomfire bow.png',
    },
    [ABILITIES.BALANCE_BY_FORCE]: {
        // ability name
        minHit: 2.35, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 30,
        cooldown: 0,
        title: 'Balance by force',
        icon: '/ability_icons/ranged/30x30/bolg.png',
    },
    [ABILITIES.DESCENT_OF_DARKNESS_HIT]: {
        // ability name
        minHit: 1.9, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 0,
        parent: ABILITIES.DESCENT_OF_DARKNESS
    },
    [ABILITIES.DESCENT_OF_DARKNESS]: {
        // ability name
        minHit: 1.9, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [0, 0], 
        hits: {
            1: [ABILITIES.DESCENT_OF_DARKNESS_HIT, 'next hit', ABILITIES.DESCENT_OF_DARKNESS_HIT]
        },
        cooldown: 0,
        adrenaline: 65
    ,
        title: 'Descent of Darkness',
        icon: '/ability_icons/ranged/30x30/dbow.png',
    },
    [ABILITIES.DESTRUCTIVE_SHOT_HIT]: {
        // ability name
        minHit: 1.6, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 0},
    [ABILITIES.DESTRUCTIVE_SHOT]: {
        // ability name
        minHit: 1.6, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hits: {
            1: [ABILITIES.DESTRUCTIVE_SHOT_HIT, 'next hit', ABILITIES.DESTRUCTIVE_SHOT_HIT]
        },
        cooldown: 0,
        hitTimings: [1,1], //todo actual hit timings 
        adrenaline: 40
    ,
        title: 'Destructive shot',
        icon: '/ability_icons/ranged/30x30/zamorak_bow.png',
    },
    [ABILITIES.BALANCED_SHOT]: {
        // ability name
        minHit: 1.7, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 35
    ,
        cooldown: 0,
        title: 'Balanced shot',
        icon: '/ability_icons/ranged/30x30/guthix_bow.png',
        common: false
    },
    [ABILITIES.RESTORATIVE_SHOT]: {
        // ability name
        minHit: 1.35, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 30
    ,
        cooldown: 0,
        title: 'Restorative shot',
        icon: '/ability_icons/ranged/30x30/saradomin_bow.png',
        common: false
    },
    [ABILITIES.AIMED_SHOT_HIT]: {
        // ability name
        minHit: 3.0, // min % of abil expressed as a decimal
        varHit: 0.6,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        //TODO implement this properly
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 0,
        parent: ABILITIES.AIMED_SHOT
    },
    [ABILITIES.AIMED_SHOT]: {
        // ability name
        minHit: 3.0, // min % of abil expressed as a decimal
        varHit: 0.6,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'channel', // bleed, dot, burn, channel, regular, multihit
        //TODO implement this properly
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        'duration': 5,
        hits: {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [ABILITIES.AIMED_SHOT_HIT]   
        },
        // hitTimings: [5],
        cooldown: 0,
        adrenaline: 35,
        title: 'Aimed shot',
        icon: '/ability_icons/ranged/30x30/hand_cannon.png',
        common: false
    },
    [ABILITIES.POWER_SHOT]: {
        // ability name
        minHit: 2.1, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 35,
        cooldown: 0,
    
        title: 'Power shot',
        icon: '/ability_icons/ranged/30x30/magic_shieldbow.png',
        common: false
    },
    [ABILITIES.TWIN_FANG_HIT]: {
        // ability name
        minHit: 1.15, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 0,
    },
    [ABILITIES.TWIN_FANG]: {
        // ability name
        minHit: 1.9, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [1, 1],
        hits: {
            1: [ABILITIES.TWIN_FANG_HIT, 'next hit', ABILITIES.TWIN_FANG_HIT]
        },
        cooldown: 0,
        adrenaline: 50
    ,
        title: 'Twin fang',
        icon: '/ability_icons/ranged/30x30/msb.png',
        common: false
    },
    [ABILITIES.PHANTOM_STRIKE_INITIAL]: {
        // ability name
        minHit: 1.2, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged'
    ,
        cooldown: 0},
    [ABILITIES.PHANTOM_STRIKE_BLEED]: {
        // ability name
        minHit: 0.3, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'bleed', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged'
    ,
        cooldown: 0},
    [ABILITIES.PHANTOM_STRIKE]: {
        // ability name
        minHit: 1.9, // min % of abil expressed as a decimal
        varHit: 0.4,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hitTimings: [1, 4, 7, 10, 13, 16, 19], //todo actual hit timings 
        hits: {
            1: [
                ABILITIES.PHANTOM_STRIKE_INITIAL,
                ABILITIES.PHANTOM_STRIKE_BLEED,
                ABILITIES.PHANTOM_STRIKE_BLEED,
                ABILITIES.PHANTOM_STRIKE_BLEED,
                ABILITIES.PHANTOM_STRIKE_BLEED,
                ABILITIES.PHANTOM_STRIKE_BLEED
            ]
        },
        cooldown: 0,
        adrenaline: 50
    ,
        title: 'Phantom strike',
        icon: '/ability_icons/ranged/30x30/morrigans_javelin.png',
        common: false
    },
    [ABILITIES.HAMSTRING]: {
        // ability name
        minHit: 1.5, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 50
    ,
        cooldown: 0,
        title: 'Hamstring',
        icon: '/ability_icons/ranged/30x30/morrigans_throwing_axe.png',
        common: false
    },
    [ABILITIES.TWIN_SHOT_HIT]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged'
    ,
        cooldown: 0},
    [ABILITIES.TWIN_SHOT]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'multihit', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        hits: {
            1: [ABILITIES.TWIN_SHOT_HIT, 'next hit', ABILITIES.TWIN_SHOT_HIT]
        },
        hitTimings: [1, 1],
        cooldown: 0,
        adrenaline: 35
    ,
        title: 'Twin shot',
        icon: '/ability_icons/ranged/30x30/quickbow.png',
        common: false
    },
    [ABILITIES.CHAIN_HIT]: {
        // ability name
        minHit: 0.55, // min % of abil expressed as a decimal
        varHit: 0.1,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 10
    ,
        cooldown: 10.2,
        title: 'Chain hit',
        icon: '/ability_icons/ranged/30x30/rune_throwing_axe.png',
        common: false
    },
    [ABILITIES.SOUL_SHOT]: {
        // ability name
        minHit: 1.0, // min % of abil expressed as a decimal
        varHit: 0.2,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 50
    ,
        cooldown: 0,
        title: 'Soul shot',
        icon: '/ability_icons/ranged/30x30/seercull.png',
        common: false
    },
    [ABILITIES.SPLIT_SOUL_ECB]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast',
        abilityType: 'special attack',
        mainStyle: 'ranged',
        damageType: 'split soul',
        adrenaline: 25,
        cooldown: 0,
        title: 'Split soul (ECB)',
        icon: '/ability_icons/ranged/Eldritch_crossbow.png',
    },
    [ABILITIES.DEEP_BURN]: {
        // ability name
        minHit: 1.8, // min % of abil expressed as a decimal
        varHit: 0.3,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 25,
        cooldown: 0,
        title: 'Deep burn',
        icon: '/ability_icons/ranged/30x30/strykebow.png',
        common: false
    },
    [ABILITIES.DEFIANCE]: {
        // ability name
        minHit: 2.25, // min % of abil expressed as a decimal
        varHit: 0.5,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 40,
        cooldown: 0
    ,
        title: 'Defiance',
        icon: '/ability_icons/ranged/30x30/zaniks_crossbow.png',
        common: false
    },
    [ABILITIES.LOCATE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'special attack', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged',
        adrenaline: 35,
        cooldown: 0,
        title: 'Locate',
        icon: '/ability_icons/ranged/Decimation.png',
        common: false
    },
    [ABILITIES.BOLG_PROC]: {
        // ability name
        minHit: 0.12, // min % of abil expressed as a decimal
        varHit: 0.04,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'proc', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 0,
        title: 'Bolg proc',
        icon: '/ability_icons/ranged/30x30/bolg.png',
    },
    [ABILITIES.BOLG_PROC_PERCENTAGES]: {
        // ability name
        minHit: 0.33, // min % of abil expressed as a decimal
        varHit: 0.04,
        onHitEffects: true, // does the ability get on-hit effects
        critEffects: true, // can the ability crit
        damagePotentialEffects: true, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'proc', // basic, threshold, special attack, ability (necromancy classification), ultimate
        mainStyle: 'ranged',
        damageType: 'ranged', // basic, threshold, special attack, ability (necromancy classification), ultimate
        cooldown: 0},
    // Defensives
    [ABILITIES.NATURAL_INSTINCT]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        adrenaline: 100,
        cooldown: 120,
        title: 'Natural Instinct',
        icon: '/ability_icons/defence/30px-Natural_Instinct.png'
    },
    [ABILITIES.RESONANCE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 30},
    [ABILITIES.FREEDOM]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 30,
        title: 'Freedom',
        icon: '/ability_icons/defence/30px-Freedom.png'
    },
    [ABILITIES.DIVERT]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 30,
        title: 'Divert',
        icon: '/ability_icons/defence/Divert.png'},
    [ABILITIES.PREPARATION]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 20.4,
        title: 'Preparation',
        icon: '/ability_icons/defence/30px-Preparation.png'
    },
    [ABILITIES.ANTICIPATION]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 24.6,
        title: 'Anticipation',
        icon: '/ability_icons/defence/30px-Anticipation.png'
    },
    [ABILITIES.REFLECT]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        adrenaline: 15,
        cooldown: 30,
        title: 'Reflect',
        icon: '/ability_icons/defence/30px-Reflect.png'
    },
    [ABILITIES.DEVOTION]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        adrenaline: 15,
        cooldown: 60,
        title: 'Devotion',
        icon: '/ability_icons/defence/30px-Devotion.png'
    },
    [ABILITIES.REVENGE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'threshold', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        adrenaline: 15,
        cooldown: 45,
        title: 'Revenge',
        icon: '/ability_icons/defence/30px-Revenge.png'        
    },
    [ABILITIES.IMMORTALITY]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 120,
        title: 'Immortality',
        icon: '/ability_icons/defence/30px-Immortality.png'
    },
    [ABILITIES.BARRICADE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'self cast', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'ultimate', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 60,
        title: 'Barricade',
        icon: '/ability_icons/defence/30px-Barricade.png'
    },
    [ABILITIES.POWER_OF_DARKNESS]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 0},
    [ABILITIES.INGENUITY_OF_THE_HUMANS]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'melee',//TODO??
        damageType: 'melee',//TODO??
        'duration': 0,
        cooldown: 90
    },
    [ABILITIES.LIMITLESS]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 90},
    [ABILITIES.DEMON_SLAYER_ABILITY]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 60},
    [ABILITIES.DRAGON_SLAYER_ABILITY]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 60},
    [ABILITIES.UNDEAD_SLAYER_ABILITY]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 60},
    [ABILITIES.SURGE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 0},
    [ABILITIES.DIVE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 20.4},
    [ABILITIES.ESCAPE]: {
        // ability name
        minHit: 0.0, // min % of abil expressed as a decimal
        varHit: 0.0,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'regular', // bleed, dot, burn, channel, regular, multihit
        abilityType: 'basic', // basic, threshold, special attack, ability (necromancy classification), ultimate TODO new type
        mainStyle: 'defence',//TODO??
        damageType: 'defence',//TODO??
        cooldown: 0},
    [ABILITIES.VENGEANCE]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 30},
    [ABILITIES.SPELLBOOK_SWAP]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 0},
    [ABILITIES.DISRUPTION_SHIELD]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 60},
    [ABILITIES.PRISM_OF_RESTORATION]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        cooldown: 36},
    [ABILITIES.DREADNIP]: {
        minHit: 0.0,
        varHit: 0.0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'ranged',
        damageType: 'ranged',
        cooldown: 0},
    [ABILITIES.DEFLECT_MAGIC]: {
        minHit: 0, varHit: 0, onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'self cast',
        abilityType: 'spell', mainStyle: 'magic', damageType: 'magic', cooldown: 0},
    [ABILITIES.DEFLECT_MELEE]: {
        minHit: 0, varHit: 0, onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'self cast',
        abilityType: 'spell', mainStyle: 'magic', damageType: 'magic', cooldown: 0},
    [ABILITIES.DEFLECT_RANGED]: {
        minHit: 0, varHit: 0, onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'self cast',
        abilityType: 'spell', mainStyle: 'magic', damageType: 'magic', cooldown: 0},
    [ABILITIES.DEFLECT_NECROMANCY]: {
        minHit: 0, varHit: 0, onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'self cast',
        abilityType: 'spell', mainStyle: 'magic', damageType: 'magic', cooldown: 0},
    [ABILITIES.SOUL_SPLIT]: {
        minHit: 0, varHit: 0, onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'self cast',
        abilityType: 'spell', mainStyle: 'magic', damageType: 'magic', cooldown: 0},
    [ABILITIES.AFTERSHOCK_RANGED]: {
        minHit: 0.24, varHit: 0.156,
        onHitEffects: false, critEffects: true,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'ranged', damageType: 'ranged'
    ,
        title: 'Aftershock',
        icon: '/effect_icons/perks/Aftershock.png',
    },
    [ABILITIES.AFTERSHOCK_MAGIC]: {
        minHit: 0.24, varHit: 0.156,
        onHitEffects: false, critEffects: true,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'magic', damageType: 'magic'
    ,
        title: 'Aftershock',
        icon: '/effect_icons/perks/Aftershock.png',
        common: false
    },
    [ABILITIES.AFTERSHOCK_MELEE]: {
        minHit: 0.24, varHit: 0.156,
        onHitEffects: false, critEffects: true,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'melee', damageType: 'melee'
    ,
        title: 'Aftershock',
        icon: '/effect_icons/perks/Aftershock.png',
    },
    [ABILITIES.AFTERSHOCK_NECRO]: {
        minHit: 0.24, varHit: 0.156,
        onHitEffects: false, critEffects: true,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'necromancy', damageType: 'necrotic'
    ,
        title: 'Aftershock',
        icon: '/effect_icons/perks/Aftershock.png',
    },
    [ABILITIES.CRACKLING_RANGED]: {
        minHit: 0.5, varHit: 0,
        onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'ranged', damageType: 'ranged',
        title: 'Crackling',
        icon: '/effect_icons/perks/Crackling.webp',
    },
    [ABILITIES.CRACKLING_MAGIC]: {
        minHit: 0.5, varHit: 0,
        onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'magic', damageType: 'magic',
        title: 'Crackling',
        icon: '/effect_icons/perks/Crackling.webp',
        common: false
    },
    [ABILITIES.CRACKLING_MELEE]: {
        minHit: 0.5, varHit: 0,
        onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'melee', damageType: 'melee',
        title: 'Crackling',
        icon: '/effect_icons/perks/Crackling.webp',
    },
    [ABILITIES.CRACKLING_NECRO]: {
        minHit: 0.5, varHit: 0,
        onHitEffects: false, critEffects: false,
        damagePotentialEffects: false, abilityClassification: 'perk',
        abilityType: 'perk', mainStyle: 'necromancy', damageType: 'necrotic',
        title: 'Crackling',
        icon: '/effect_icons/perks/Crackling.webp',
    },
    [ABILITIES.RUNIC_CHARGE]: {
        minHit: 0,
        varHit: 0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 0,
        cooldown: 30
    },
    [ABILITIES.EXSANGUINATE]: {
        minHit: 0,
        varHit: 0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 0,
        cooldown: 0
    },
    [ABILITIES.INCITE_FEAR]: {
        minHit: 0,
        varHit: 0,
        onHitEffects: false,
        critEffects: false,
        damagePotentialEffects: false,
        abilityClassification: 'self cast',
        abilityType: 'spell',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 0,
        cooldown: 0
    },
    [ABILITIES.GLACIAL_EMBRACE_HIT]: {
        minHit: 0.10,
        varHit: 0.40,
        onHitEffects: true,
        critEffects: true,
        damagePotentialEffects: true,
        abilityClassification: 'proc',
        abilityType: 'proc',
        mainStyle: 'magic',
        damageType: 'magic',
        adrenaline: 0,
        cooldown: 20
    ,
        title: 'Glacial Embrace',
        icon: '/effect_icons/Glacial_Embrace.png',
    },
    [ABILITIES.POISON_DAMAGE]: {
        // ability name
        minHit: 0.13, // min % of abil expressed as a decimal
        varHit: 0.13,
        onHitEffects: false, // does the ability get on-hit effects
        critEffects: false, // can the ability crit
        damagePotentialEffects: false, // is the ability affected by damage potential
        abilityClassification: 'perk', // bleed, dot, burn, channel, regular, multihit
        damageType: 'poison',
        mainStyle: 'poison',
        abilityType: 'perk', // basic, threshold, special attack, ability (necromancy classification), ultimate
        'cooldown': 0
    }
};