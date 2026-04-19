import { settingsConfig, SETTINGS } from '../settings_rb';
import { SettingsCombatStyles } from './types/SettingsCombatStyles';
import { BUFF_COLORS, STACK_COLORS } from '../../utils/colors';

/*
 * All the buffs displayed as bars under the rotation in the UI.
 */
export const buffs = [
    SETTINGS.CRIT_BUFF, 
    SETTINGS.NATURAL_INSTINCT, 
    SETTINGS.DEATH_SWIFTNESS, 
	SETTINGS.SUNSHINE, 
    SETTINGS.BERSERK,
    
    SETTINGS.SPLIT_SOUL, 
    SETTINGS.GREATER_DRACOLICH_INFUSION,
	SETTINGS.ICY_PRECISION, 
    SETTINGS.BALANCE_BY_FORCE,
    SETTINGS.INSTABILITY,
    SETTINGS.CHAOS_ROAR,
    SETTINGS.BLACKHOLE,
    SETTINGS.SEARING_WINDS,
    SETTINGS.SHADOW_IMBUED,
    SETTINGS.DEATHSPORE_BUFF,
    SETTINGS.ESS_CORRUPTION_ADREN,
    SETTINGS.LIVING_DEATH,
    SETTINGS.HAUNTED,
    SETTINGS.THREADS_OF_FATE,
    SETTINGS.INVOKE_DEATH,
    SETTINGS.SPLIT_SOUL_NECRO,
    SETTINGS.METEOR_STRIKE_BUFF,
    SETTINGS.VESTMENTS_REGEN,
    SETTINGS.RAMPAGE,
    SETTINGS.FLOW,
    SETTINGS.GREATER_FLOW,
    SETTINGS.FLOW_AC,
    SETTINGS.GREATER_FLOW_AC,
    SETTINGS.ANIMA_CHARGED,
    SETTINGS.BARRICADE,
    SETTINGS.CHANNELLED_MIGHT,
    SETTINGS.GREATER_CHANNELLED_MIGHT,
    SETTINGS.SMOKE_CLOUD,
    SETTINGS.UNDEAD_SLAYER_ABILITY,
    SETTINGS.DRAGON_SLAYER_ABILITY,
    SETTINGS.DEMON_SLAYER_ABILITY,
    SETTINGS.CONFLAGRATE,
    SETTINGS.KERAPACS_WRIST_WRAPS,
    SETTINGS.BLAST_INFUSED,
    SETTINGS.ENDLESS_ASSAULT,
    SETTINGS.CONC_CRIT,
    SETTINGS.GCONC_CRIT,
    SETTINGS.CONC_CRIT_AC,
    SETTINGS.GCONC_CRIT_AC,
];

export function createBuffTimings(barSize: number) {
    return (
        {
            [SETTINGS.CRIT_BUFF]: {
                title: 'Crit Buff',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.crit_buff,
                icon: '/effect_icons/magic/Crit_buff.png',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.DEATH_SWIFTNESS]: {
                title: 'Death\'s Swiftness',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.death_swiftness,
                icon: '/ability_icons/ranged/Greater_Death\'s_Swiftness.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.SUNSHINE]: {
                title: 'Sunshine',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.sunshine,
                icon: '/ability_icons/magic/Greater_Sunshine.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.BERSERK]: {
                title: 'Berserk',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.berserk,
                icon: '/ability_icons/melee/berserk.webp',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.NATURAL_INSTINCT]: {
                title: 'Natural Instinct',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.natural_instinct,
                icon: '/ability_icons/defence/30px-Natural_Instinct.png',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.SPLIT_SOUL]: {
                title: 'Split Soul',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.split_soul,
                icon: '/effect_icons/Split_Soul_icon.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.GREATER_DRACOLICH_INFUSION]: {
                title: 'Dracolich Infusion (Greater)',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.greater_dracolich,
                icon: '/effect_icons/dracolich_infusion.png',
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.ICY_PRECISION]: {
                title: 'Icy Precision',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.icy_precision,
                icon: '/effect_icons/icy_precision.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.BALANCE_BY_FORCE]: {
                title: 'Balance By Force',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.balance_by_force,
                icon: '/effect_icons/balance_by_force.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.INSTABILITY]: {
                title: 'Instability',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.instability,
                icon: '/effect_icons/instability.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.CHAOS_ROAR]: {
                title: 'Chaos Roar',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.chaos_roar,
                icon: '/effect_icons/Chaos_Roar.webp',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.BLACKHOLE]: {
                title: 'Blackhole',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.blackhole,
                icon: '/effect_icons/melee/Blackhole_(self_status).png',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.SEARING_WINDS]: {
                title: 'Searing Winds',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.searing_winds,
                icon: '/effect_icons/ranged/Searing_Winds.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.SHADOW_IMBUED]: {
                title: 'Shadow Imbued',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.shadow_imbued,
                icon: '/ability_icons/ranged/30x30/imbue_shadows.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.DEATHSPORE_BUFF]: {
                title: 'Feasting Spores',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.deathspore_buff,
                icon: '/gear_icons/ranged/deathspore arrows.png',
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.ESS_CORRUPTION_ADREN]: {
                title: 'Essence Corruption Adrenaline',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.essence_corruption_adren,
                icon: '/effect_icons/Essence_Corruption_Adrenaline.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.LIVING_DEATH]: {
                title: 'Living Death',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.living_death,
                icon: '/effect_icons/living_death.png',
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.HAUNTED]: {
                title: 'Haunted',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.haunted,
                icon: '/effect_icons/haunted.png',
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.THREADS_OF_FATE]: {
                title: 'Threads of Fate',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.threads_of_fate,
                icon: '/ability_icons/necro/incantations/Threads_of_Fate_icon.png',
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.INVOKE_DEATH]: {
                title: 'Invoke Death',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.invoke_death,
                icon: '/ability_icons/necro/incantations/Invoke_Death_icon.png',
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.SPLIT_SOUL_NECRO]: {
                title: 'Split Soul (Necro)',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.split_soul_necro,
                icon: '/effect_icons/Split_Soul_icon.png',
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.METEOR_STRIKE_BUFF]: {
                title: 'Meteor Strike',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.meteor_strike_buff,
                icon: '/effect_icons/melee/Meteor_Strike_(status).png',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.VESTMENTS_REGEN]: {
                title: 'Vestments Regen',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.vestments_regen,
                icon: '/effect_icons/melee/Havoc_(status).png',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.RAMPAGE]: {
                title: 'Rampage',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.rampage,
                icon: '/effect_icons/rampage.png',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.FLOW]: {
                title: 'Flow',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#0ce6ff',
                icon: '/effect_icons/magic/Flow.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.GREATER_FLOW]: {
                title: 'Greater Flow',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#0ce6ff',
                icon: '/effect_icons/magic/Greater_Flow.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.FLOW_AC]: {
                title: 'Flow (Anima Charged)',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#0ce6ff',
                icon: '/effect_icons/magic/Flow.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.GREATER_FLOW_AC]: {
                title: 'Greater Flow (Anima Charged)',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#0ce6ff',
                icon: '/effect_icons/magic/Greater_Flow.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.ANIMA_CHARGED]: {
                title: 'Anima Charged',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#a855f7',
                icon: '/effect_icons/magic/Anima_Charged.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.BARRICADE]: {
                title: 'Barricade',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.barricade,
                icon: '/ability_icons/defence/30px-Barricade.png',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.CHANNELLED_MIGHT]: {
                title: "Channelled Might",
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.tumekens_asphyx,
                icon: '/effect_icons/magic/Channelled_Might.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.GREATER_CHANNELLED_MIGHT]: {
                title: "Greater Channelled Might",
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.tumekens_asphyx,
                icon: '/effect_icons/magic/Channelled_Might.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.SMOKE_CLOUD]: {
                title: 'Smoke Cloud',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#7B68EE',
                icon: '/effect_icons/Smoke_Cloud_icon.webp',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.UNDEAD_SLAYER_ABILITY]: {
                title: 'Undead Slayer',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#8B5CF6',
                icon: '/ability_icons/special/Undead_Slayer_(ability).png',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.DRAGON_SLAYER_ABILITY]: {
                title: 'Dragon Slayer',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#EF4444',
                icon: '/ability_icons/special/Dragon_Slayer_(ability).png',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.DEMON_SLAYER_ABILITY]: {
                title: 'Demon Slayer',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#F97316',
                icon: '/ability_icons/special/Demon_Slayer_(ability).png',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.CONFLAGRATE]: {
                title: 'Conflagrate',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#FF4500',
                icon: '/effect_icons/conflagrate.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.KERAPACS_WRIST_WRAPS]: {
                title: "Kerapac's Wristwraps",
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#C0392B',
                icon: '/effect_icons/Kerapac\'s_wrist_wraps.webp',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.BLAST_INFUSED]: {
                title: 'Blast Infused',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#E67E22',
                icon: '/effect_icons/magic/Blast_Infused.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.ENDLESS_ASSAULT]: {
                title: 'Endless Assault',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: '#c78d68',
                icon: '/effect_icons/melee/Endless_Assault.png',
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.CONC_CRIT]: {
                title: 'Conc Crit',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.conc_crit,
                icon: '/ability_icons/magic/30x30/concentrated_blast.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.GCONC_CRIT]: {
                title: 'GConc Crit',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.gconc_crit,
                icon: '/ability_icons/magic/30x30/greater_concentrated_blast.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.CONC_CRIT_AC]: {
                title: 'Conc Crit (AC)',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.conc_crit_ac,
                icon: '/effect_icons/magic/Conc_AC.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.GCONC_CRIT_AC]: {
                title: 'GConc Crit (AC)',
                idx: -1,
                buffTicks: Array(barSize).fill(0),
                activeRows: [],
                colour: BUFF_COLORS.gconc_crit_ac,
                icon: '/ability_icons/magic/GConc_AC.png',
                combatStyle: SettingsCombatStyles.MAGIC
            },
        }
    )
}

export function createStackTimings(barSize: number) {
    return (
        {
            [SETTINGS.ADRENALINE]: {
                title: 'Adrenaline',
                displaySetting: SETTINGS.SHOW_ADRENALINE,
                idx: -1,
                image: '/effect_icons/Adrenaline.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.adrenaline,
                number: 'true',
                combatStyle: SettingsCombatStyles.ALL
            },
            [SETTINGS.BLOODLUST_STACKS]: {
                title: 'Bloodlust stacks',
                displaySetting: SETTINGS.SHOW_BLOODLUST_STACKS,
                idx: -1,
                image: '/effect_icons/Bloodlust.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.bloodlust,
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.PRIMORDIAL_ICE]: {
                title: 'Primordial Ice stacks',
                displaySetting: SETTINGS.SHOW_PRIMORDIAL_ICE_STACKS,
                idx: -1,
                image: '/effect_icons/melee/primordial_ice.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.primordial_ice,
                combatStyle: SettingsCombatStyles.MELEE
            },
            [SETTINGS.PERFECT_EQUILIBRIUM_STACKS]: {
                title: 'Perfect Equilibrium stacks',
                displaySetting: SETTINGS.SHOW_BOLG_STACKS,
                idx: -1,
                image: '/effect_icons/Perfect Equilibrium (self status).png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.perfect_equilibrium,
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.ICY_CHILL_STACKS]: {
                title: 'Icy Chill stacks',
                displaySetting: SETTINGS.SHOW_ICY_CHILL_STACKS,
                idx: -1,
                image: '/effect_icons/Icy_Chill.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.icy_chill,
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.BIK_STACKS]: {
                title: 'Evolving Toxin stacks',
                displaySetting: SETTINGS.SHOW_BIK_STACKS,
                idx: -1,
                image: '/effect_icons/evolving_toxin.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.bik,
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.DEATHSPORE_STACKS]: {
                title: 'Feasting Spores stacks',
                displaySetting: SETTINGS.SHOW_DEATHSPORE_STACKS,
                idx: -1,
                image: '/gear_icons/ranged/deathspore arrows.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.deathspore,
                combatStyle: SettingsCombatStyles.RANGED
            },
            [SETTINGS.NECROSIS_STACKS]: {
                title: 'Necrosis stacks',
                displaySetting: SETTINGS.SHOW_NECROSIS_STACKS,
                idx: -1,
                image: '/effect_icons/necrosis.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.necrosis,
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.RESIDUAL_SOULS]: {
                title: 'Residual Souls',
                displaySetting: SETTINGS.SHOW_RESIDUAL_SOULS,
                idx: -1,
                image: '/effect_icons/residual_soul.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.residual_souls,
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.ESSENCE_CORRUPTION]: {
                title: 'Essence Corruption',
                displaySetting: SETTINGS.SHOW_ESSENCE_CORRUPTION,
                idx: -1,
                image: '/effect_icons/essence_corruption.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.essence_corruption,
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.DEATH_SPARK_STACKS]: {
                title: 'Death Spark',
                displaySetting: SETTINGS.SHOW_DEATH_SPARK_STACKS,
                idx: -1,
                image: '/effect_icons/necromancy/death_spark2.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.death_spark,
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.SOUL_REAVE_STACKS]: {
                title: 'Soul Reave',
                displaySetting: SETTINGS.SHOW_SOUL_REAVE_STACKS,
                idx: -1,
                image: '/effect_icons/necromancy/soul_reave2.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.soul_reave,
                combatStyle: SettingsCombatStyles.NECROMANCY
            },
            [SETTINGS.BLOOD_TITHE]: {
                title: 'Blood Tithe stacks',
                displaySetting: SETTINGS.SHOW_BLOOD_TITHE,
                idx: -1,
                image: '/effect_icons/Exsanguinate_icon.webp',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.blood_tithe,
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.GLACIAL_EMBRACE]: {
                title: 'Glacial Embrace stacks',
                displaySetting: SETTINGS.SHOW_GLACIAL_EMBRACE,
                idx: -1,
                image: '/effect_icons/Glacial_Embrace.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.glacial_embrace,
                combatStyle: SettingsCombatStyles.MAGIC
            },
            [SETTINGS.FAMILIAR_SPEC_POINTS]: {
                title: 'Special Move Points',
                displaySetting: SETTINGS.SHOW_FAMILIAR_SPEC_POINTS,
                idx: -1,
                image: '/effect_icons/familiar.png',
                stackTicks: Array(barSize).fill(0),
                colour: STACK_COLORS.familiar_spec_points,
                number: 'true',
                combatStyle: SettingsCombatStyles.ALL
            },
        }
    )
}