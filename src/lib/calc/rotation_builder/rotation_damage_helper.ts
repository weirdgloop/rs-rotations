import { create_damage_object } from './rota_object_helper';
import { ARMOUR } from '$lib/data/armour';
import { SETTINGS } from '../settings_rb';
import { ABILITIES, abils } from '$lib/data/abilities';
import { on_cast, on_hit, COOLDOWN_PREFIX } from './damage_calc_new';
import { DamageObject, DamageKind, DamageDistribution } from '../types';

// Import and re-export from calculation_utils
import { addAdrenaline } from './calculation_utils';
import { armour } from '$lib/data/armour';
import { gearSets, GEAR_SET } from '$lib/data/gear-sets';
import { countSetPieces } from './gear-registry';

/**
 * Calculate conjure spirit duration in ticks based on Spirit Pact level
 * and First Necromancer robe pieces.
 * Base: 60s. Spirit Pact I/II/III: +6/12/18s. TFN 4+pc: +5% per piece (after Spirit Pact).
 */
export function getConjureDuration(settings: Record<string, any>): number {
    const spiritPact = settings[SETTINGS.SPIRIT_PACT] || 0;
    let durationSeconds = 60 + spiritPact * 6;

    // Count First Necromancer pieces
    const tfnPieces = countTFNPieces(settings);
    if (tfnPieces >= 4) {
        durationSeconds = Math.floor(durationSeconds * (1 + 0.05 * tfnPieces));
    }

    // Convert to ticks (1 tick = 0.6s)
    return Math.ceil(durationSeconds / 0.6);
}

/**
 * Count equipped Robes of the First Necromancer pieces.
 * Crown with addon counts as 2 pieces; capped at 5.
 */
export function countTFNPieces(settings: Record<string, any>): number {
    let count = countSetPieces(settings, gearSets[GEAR_SET.FIRST_NECROMANCER]);
    // Crown with addon counts as 2 pieces (countSetPieces already counted it as 1)
    if (settings[SETTINGS.NECRO_HELMET] === ARMOUR.TFN_CROWN_WITH_ADDON) count++;
    return Math.min(count, 5);
}

/**
 * Calculate conjure spirit damage multiplier from gear
 * Conjurer's Raising Amulet: 1.05x. TFN 2+pc: 7% per piece.
 */
export function getConjureDamageMultiplier(settings: Record<string, any>): number {
    let mult = 1.0;

    // Conjurer's Raising Amulet
    if (settings[SETTINGS.NECKLACE] === ARMOUR.CONJURERS_RAISING_AMULET) {
        mult *= 1.05;
    }

    // First Necromancer: 7% per piece when 2+ equipped
    const tfnPieces = countTFNPieces(settings);
    if (tfnPieces >= 2) {
        mult *= 1 + 0.07 * tfnPieces;
    }

    return mult;
}

// Helper functions
function getDamageDistribution(dmgObject: DamageObject, kind: DamageKind): DamageDistribution | undefined {
    return dmgObject.distributions[kind];
}

function iterateDistributions(dmgObject: DamageObject, callback: (distribution: DamageDistribution, kind: DamageKind) => void): void {
    for (const kind of ['non_crit', 'crit'] as DamageKind[]) {
        const distribution = dmgObject.distributions[kind];
        if (distribution) {
            callback(distribution, kind);
        }
    }
}

/**
 * Calculates the damage object for a single tick of a channelled ability
 * @param settings
 * @param hit_index - which hit to calculate
 * @param rotation - information on all hits of the ability (e.g. {1: [hit1, hit2...], 2: [], 3: [hit1], etc.})
 * @param timers - timers object containing buff timer information
 * @returns
 */
function calc_channelled_hit(settings: Record<string, any>, hit_index: number, rotation: Record<number, string[]>, timers: Record<string, number>, abilityKey: ABILITIES) {
    let hits: DamageObject[] = [];
    let dmgObject = create_damage_object(settings, abilityKey);
    for (let iter = 0; iter < rotation[hit_index].length; iter++) {
        settings['ability'] = rotation[hit_index][iter]; //TODO fix
        let dmgObjects = on_cast(settings, dmgObject, timers, abilityKey);
        for (let obj of dmgObjects) {
            let o = on_hit(settings, obj, timers, obj.ability);
            for (let hit of o) {
                hits.push(hit);
                handleDracolichInfusion(settings, timers, hit.ability);
                handleChanneledAsphyx(settings, timers, hit.ability);
            }
        }
    }
    return hits;
}

/**
 * Handles the toggling and timer initialisation of most buffs, exlcuding (e)dracolich
 * The buffs handled are those which are activated upon casting the ability
 * @param settings
 * @param timers - map of (buff_name -> buff_duration)
 * @param abilityKey
 */
export function handleBuffs(settings: Record<string, any>, timers: Record<string, number>, abilityKey: string) {
    //TODO handle swiftness' weird damage calc + cleanup format
    switch (abilityKey) {
        // Magic Buff Abilities
        case ABILITIES.SMOKE_CLOUD:
            settings[SETTINGS.SMOKE_CLOUD] = true;
            timers[SETTINGS.SMOKE_CLOUD] = 200; // 120 seconds = 200 ticks
            break;
        case ABILITIES.SOULFIRE:
            settings[SETTINGS.CONFLAGRATE] = true;
            timers[SETTINGS.CONFLAGRATE] = 25; // 15 seconds = 25 ticks
            break;
        case ABILITIES.WILD_MAGIC:
            // Blast diffusion boots: Wild Magic activates Blast Infused buff
            if (settings[SETTINGS.BOOTS] === ARMOUR.BLAST_DIFFUSION_BOOTS ||
                settings[SETTINGS.BOOTS] === ARMOUR.BLAST_DIFFUSION_BOOTS_E) {
                settings[SETTINGS.BLAST_INFUSED] = true;
                timers[SETTINGS.BLAST_INFUSED] = 10; // 6 seconds = 10 ticks
            }
            break;
        case ABILITIES.DRAGON_BREATH:
            // Kerapac's wristwraps: Dragon Breath activates the buff if wearing KWW or KWW_E
            if (settings[SETTINGS.GLOVES] === ARMOUR.KERAPACS_WRISTWRAPS ||
                settings[SETTINGS.GLOVES] === ARMOUR.KERAPACS_WRISTWRAPS_E) {
                settings[SETTINGS.KERAPACS_WRIST_WRAPS] = true;
                timers[SETTINGS.KERAPACS_WRIST_WRAPS] = 10; // 6 seconds = 10 ticks
            }
            break;
        case ABILITIES.GREATER_BARGE:
            // Endless Assault: activates when 8+ ticks since last attack
            if (settings[SETTINGS.TIME_SINCE_ATTACK] >= 8) {
                settings[SETTINGS.ENDLESS_ASSAULT] = true;
                timers[SETTINGS.ENDLESS_ASSAULT] = 10; // 6 seconds = 10 ticks
            }
            break;
        case ABILITIES.INSTABILITY:
            settings[SETTINGS.INSTABILITY] = true;
            timers[SETTINGS.INSTABILITY] = 50;
            break;
        case ABILITIES.TSUNAMI:
            settings[SETTINGS.CRIT_BUFF] = true;
            timers[SETTINGS.CRIT_BUFF] = 51;
            break;
        case ABILITIES.SUNSHINE:
            settings[SETTINGS.SUNSHINE] = true;
            timers[SETTINGS.SUNSHINE] = 50;
            break;
        case ABILITIES.GREATER_SUNSHINE:
            settings[SETTINGS.SUNSHINE] = true;
            timers[SETTINGS.SUNSHINE] = 63;
            break;
        // Ranged Buff Abilities
        case ABILITIES.GALESHOT:
            settings[SETTINGS.SEARING_WINDS] = true;
            timers[SETTINGS.SEARING_WINDS] = 10; // 6 seconds
            break;
        case ABILITIES.IMBUE_SHADOWS:
            settings[SETTINGS.SHADOW_IMBUED] = true;
            timers[SETTINGS.SHADOW_IMBUED] = 50; // 30 seconds
            break;
        case ABILITIES.SHADOW_TENDRILS:
            // Shadow Tendrils extends Imbue Shadows buff by 3.6s (6 ticks) if active
            if (settings[SETTINGS.SHADOW_IMBUED] === true && timers[SETTINGS.SHADOW_IMBUED] > 0) {
                timers[SETTINGS.SHADOW_IMBUED] += 6;
            }
            break;
        case ABILITIES.DEATHS_SWIFTNESS:
            settings['death swiftness'] = true;
            timers['death swiftness'] = 50;
            break;
        case ABILITIES.GREATER_DEATHS_SWIFTNESS:
            settings['death swiftness'] = true;
            timers['death swiftness'] = 63;
            break;
        case ABILITIES.BALANCE_BY_FORCE:
            settings[ABILITIES.BALANCE_BY_FORCE] = true;
            timers[ABILITIES.BALANCE_BY_FORCE] = 50;
            break;
        case ABILITIES.SPLIT_SOUL_ECB: //TODO remove split soul on changing weapon
            settings[SETTINGS.SPLIT_SOUL] = true;
            timers[SETTINGS.SPLIT_SOUL] = 25;
            break;
        // Melee Buff Abilities
        case ABILITIES.FURY:
            settings[SETTINGS.FURY_BUFF] = SETTINGS.FURY_BUFF_VALUES.REGULAR;
            break;
        case ABILITIES.GREATER_FURY:
            settings[SETTINGS.FURY_BUFF] = SETTINGS.FURY_BUFF_VALUES.GREATER;
            break;
        case ABILITIES.CHAOS_ROAR:
            settings[SETTINGS.CHAOS_ROAR] = true;
            break;
        case ABILITIES.METEOR_STRIKE:
            settings[SETTINGS.METEOR_STRIKE_BUFF] = true;
            timers[SETTINGS.METEOR_STRIKE_BUFF] = 50; // 30 seconds
            break;
        case ABILITIES.IGNEOUS_SHOWDOWN:
            if (settings[SETTINGS.FLAMEBOUND_RIVAL] === true) {
                // Already applied: bonus hits handled by get_hit_sequence, generate 15% adrenaline
                addAdrenaline(settings, 15);
            }
            // Note: FLAMEBOUND_RIVAL is set to true AFTER hits process (see _pendingFlamebound flag)
            settings['_pendingFlamebound'] = true;
            break;
        case ABILITIES.BERSERK:
            settings[SETTINGS.BERSERK] = true;
            // Vestments of Havoc: 3+ pieces extends Berserk by 10 ticks
            const vestPieces = countSetPieces(settings, gearSets[GEAR_SET.VESTMENTS_OF_HAVOC]);
            timers[SETTINGS.BERSERK] = vestPieces >= 3 ? 43 : 33;
            break;
        case ABILITIES.BLACKHOLE:
            settings[SETTINGS.BLACKHOLE] = true;
            timers[SETTINGS.BLACKHOLE] = 35;
            break;
        case ABILITIES.RAMPAGE:
            settings[SETTINGS.RAMPAGE] = true;
            timers[SETTINGS.RAMPAGE] = 100;
            break;
        case ABILITIES.BARRICADE:
            settings[SETTINGS.BARRICADE] = true;
            timers[SETTINGS.BARRICADE] = 17 + 3 * (settings[SETTINGS.MALLETOPS] || 0); // 10s + 1.8s per malletops rank
            break;
        // Flow buffs (magic)
        case ABILITIES.SONIC_WAVE:
            const variant = settings[SETTINGS.ANIMA_CHARGED] ? SETTINGS.FLOW_AC : SETTINGS.FLOW;
            settings[variant] = true;
            timers[variant] = 15; // 9 seconds = 15 ticks
            break;
        case ABILITIES.GREATER_SONIC_WAVE:
            const variant2 = settings[SETTINGS.ANIMA_CHARGED] ? SETTINGS.GREATER_FLOW_AC : SETTINGS.GREATER_FLOW;
            settings[variant2] = true;
            timers[variant2] = 15; // 9 seconds = 15 ticks
            break;
        // Necromancy Buff Abilities
        case ABILITIES.SPLIT_SOUL_NECRO:
            settings[SETTINGS.SPLIT_SOUL_NECRO] = true;
            timers[SETTINGS.SPLIT_SOUL_NECRO] = 34; // 20.4s = 34 ticks
            break;

        case ABILITIES.CONJURE_UNDEAD_ARMY: // Conjure abilities — tracked via timers, processed by processConjureTick
            timers['conjure_skeleton_warrior'] = getConjureDuration(settings);
            timers['conjure_vengeful_ghost'] = getConjureDuration(settings);
            timers['conjure_putrid_zombie'] = getConjureDuration(settings);
            timers['conjure_phantom_guardian'] = getConjureDuration(settings);
            break;
        case ABILITIES.CONJURE_SKELETON_WARRIOR:
            timers['conjure_skeleton_warrior'] = getConjureDuration(settings);
            break;
        case ABILITIES.CONJURE_VENGEFUL_GHOST:
            timers['conjure_vengeful_ghost'] = getConjureDuration(settings);
            break;
        case ABILITIES.CONJURE_PUTRID_ZOMBIE:
            timers['conjure_putrid_zombie'] = getConjureDuration(settings);
            break;
        case ABILITIES.CONJURE_PHANTOM_GUARDIAN:
            timers['conjure_phantom_guardian'] = getConjureDuration(settings);
            break;

        case ABILITIES.COMMAND_SKELETON_WARRIOR: // Command abilities — trigger effect from conjures
            timers['command_skeleton_warrior'] = 10; // 6s = 10 ticks, 10 hits
            break;
        case ABILITIES.COMMAND_PUTRID_ZOMBIE:
            timers['command_putrid_zombie'] = 1; // single instant explosion
            break;
        case ABILITIES.COMMAND_VENGEFUL_GHOST:
            timers['command_vengeful_ghost'] = timers['conjure_vengeful_ghost'];
            // settings[SETTINGS.HAUNTED] = true;
            // settings[SETTINGS.HAUNTED_AD] = settings[SETTINGS.ABILITY_DAMAGE];
            // timers[SETTINGS.HAUNTED] = 8; // 4.8s = 8 ticks
            break;
        case ABILITIES.LIFE_TRANSFER: {
            // Extend all active conjure durations by 21s (35 ticks)
            const conjureKeys = ['conjure_skeleton_warrior', 'conjure_vengeful_ghost', 'conjure_putrid_zombie', 'conjure_phantom_guardian'];
            for (const key of conjureKeys) {
                if (timers[key] && timers[key] > 0) {
                    timers[key] += 35;
                }
            }
            break;
        }
        case ABILITIES.THREADS_OF_FATE:
            settings[SETTINGS.THREADS_OF_FATE] = true;
            timers[SETTINGS.THREADS_OF_FATE] = 11; // 6.6s = 11 ticks
            break;
        case ABILITIES.INVOKE_DEATH:
            settings[SETTINGS.INVOKE_DEATH] = true;
            timers[SETTINGS.INVOKE_DEATH] = 20; // 12s = 20 ticks
            break;
        case ABILITIES.LIVING_DEATH:
            settings[SETTINGS.LIVING_DEATH] = true;
            timers[SETTINGS.LIVING_DEATH] = 50; // 30 seconds
            // On-cast: reset cooldowns of Touch of Death and Death Skulls
            delete timers[COOLDOWN_PREFIX + ABILITIES.TOUCH_OF_DEATH];
            delete timers[COOLDOWN_PREFIX + ABILITIES.DEATHSKULLS_4];
            break;
        case ABILITIES.NATURAL_INSTINCT:
            settings[SETTINGS.NATURAL_INSTINCT] = true;
            timers[ABILITIES.NATURAL_INSTINCT] = 34;
            break;
    }

    // Vestments of Havoc 2-piece: melee ultimate triggers adrenaline regen
    if (
        abils[abilityKey]?.mainStyle === 'melee' &&
        abils[abilityKey]?.abilityType === 'ultimate'
    ) {
        const vestCount = countSetPieces(settings, gearSets[GEAR_SET.VESTMENTS_OF_HAVOC]);

        if (vestCount >= 2) {
            if (settings[SETTINGS.VESTMENTS_REGEN] === true) {
                // Already active: cancel regen, add 20% adrenaline instantly
                settings[SETTINGS.VESTMENTS_REGEN] = false;
                delete timers[SETTINGS.VESTMENTS_REGEN];
                addAdrenaline(settings, 20);
            } else {
                // Activate regen: 0.5% per tick for 30 ticks (18 seconds)
                settings[SETTINGS.VESTMENTS_REGEN] = true;
                timers[SETTINGS.VESTMENTS_REGEN] = 30;
            }
        }
    }
}

export function handle_wen_buff(settings: Record<string, any>, timers: Record<string, number>) {
    settings[SETTINGS.ICY_PRECISION] = 1; // flat buff, no longer per-stack
    settings[SETTINGS.ICY_CHILL_STACKS] = 0;
    timers[SETTINGS.ICY_PRECISION] = 15; // fixed 15 tick duration
}

/**
 * Sets (greater) dracolich infusion buff to active if applicable
 */
export function handleDracolichInfusion(settings: Record<string, any>, timers: Record<string, number>, abilityKey: string) {
    const nEDracoPieces = countSetPieces(settings, gearSets[GEAR_SET.ELITE_DRACOLICH]);
    const nDracoPieces = countSetPieces(settings, gearSets[GEAR_SET.DRACOLICH]);
    const nPieces = Math.max(nEDracoPieces, nDracoPieces);
    if (abilityKey == ABILITIES.RAPID_FIRE_HIT || abilityKey == ABILITIES.RAPID_FIRE_LAST_HIT) {
        addAdrenaline(settings, nEDracoPieces * 0.5);
        addAdrenaline(settings, nDracoPieces * 0.2);
    }

    if (abilityKey == ABILITIES.RAPID_FIRE_LAST_HIT && nPieces >= 3) {
        const buff_duration = 5 + (3 * Math.max(nPieces - 3, 0));
        const buff = nEDracoPieces >= 3 ? SETTINGS.GREATER_DRACOLICH_INFUSION : SETTINGS.DRACOLICH_INFUSION;
        settings[buff] = true;
        settings['_channelBuffJustActivated'] = buff;
        timers[buff] = buff_duration;
    }
}

/**
 * Activates Tumeken's Resplendence buff after the last hit of Asphyxiate (5pc set effect).
 * 9 second buff (15 ticks) that enhances the next Asphyxiate.
 */
export function handleChanneledAsphyx(settings: Record<string, any>, timers: Record<string, number>, abilityKey: string) {
    if (abilityKey !== ABILITIES.ASPHYXIATE_LAST_HIT && abilityKey !== ABILITIES.TUMEKEN_ASPHYXIATE_LAST_HIT) return;

    const tumekensCount = countSetPieces(settings, gearSets[GEAR_SET.TUMEKENS_RESPLENDENCE]);

    if (tumekensCount >= 5) {
        settings[SETTINGS.GREATER_CHANNELLED_MIGHT] = true;
        settings['_channelBuffJustActivated'] = SETTINGS.GREATER_CHANNELLED_MIGHT;
        timers[SETTINGS.GREATER_CHANNELLED_MIGHT] = 16; // 9s = 15 ticks
    } else {
        settings[SETTINGS.CHANNELLED_MIGHT] = true;
        settings['_channelBuffJustActivated'] = SETTINGS.CHANNELLED_MIGHT;
        timers[SETTINGS.CHANNELLED_MIGHT] = 7; // 3.6s = 6 ticks
    }
}

/**
 * Activates Tumeken's Resplendence buff after the last hit of Asphyxiate (5pc set effect).
 * 9 second buff (15 ticks) that enhances the next Asphyxiate.
 */
export function handleChannellers(settings: Record<string, any>, timers: Record<string, number>, abilityKey: string) {
    if (![ARMOUR.CHANNELLERS_RING, ARMOUR.CHANNELLERS_RING_E].includes(settings[SETTINGS.RING])) return;
    settings[SETTINGS.CHANNELLER_RING_STACKS] += 1;
}

/**
 * Handle SGB special attack by creating additional damage objects based on target size
 * Each target size corresponds to a hit multiplier where the integer part represents
 * guaranteed hits and the fractional part represents probability of an additional hit
 *
 * @param settings - game settings object
 * @param dmgObject - base damage object to multiply
 * @param damageTracker - damage tracking object (unused currently)
 * @param hitTick - tick when hit occurs (unused currently)
 * @returns Array of damage objects representing all hits
 */
export function handle_sgb(settings: Record<string, any>, dmgObject: DamageObject): DamageObject[] {
    const hitMultipliers = [0, 1.16, 1.64, 2.44, 3.56, 5.0];
    const size = Math.min(settings[SETTINGS.TARGET_SIZE], 5);
    const hitMultiplier = hitMultipliers[size] - 1; // don't include guaranteed hit

    if (hitMultiplier <= 0) {
        return [dmgObject]; // Single hit, no multiplication needed
    }

    const guaranteedHits = Math.floor(hitMultiplier);
    const fractionalPart = hitMultiplier - guaranteedHits;

    const results: DamageObject[] = [];

    // Add guaranteed hits (each with likelihood 1.0)
    for (let i = 0; i < guaranteedHits; i++) {
        const hitCopy = structuredClone(dmgObject);
        hitCopy.likelihood = 1.0;
        results.push(hitCopy);
    }

    // Add fractional hit if there is one (with likelihood = fractional part)
    if (fractionalPart > 0) {
        const fractionalHit = structuredClone(dmgObject);
        fractionalHit.likelihood = fractionalPart;
        results.push(fractionalHit);
    }
    return results;
}

export function get_user_value(settings: Record<string, any>, dmgObject: DamageObject) {
    let divider = 1
    if (settings[SETTINGS.DAMAGE_PER_UNIT] === SETTINGS.DAMAGE_PER_UNIT_VALUES.TICK) {
        settings[SETTINGS.ABILITY]
        divider = 3;
    }
    divider = Math.max(divider, settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER])

    switch (settings[SETTINGS.MODE]) {
        case SETTINGS.MODE_VALUES.MEAN:
            return Math.floor(get_mean_damage(settings, dmgObject)/divider);
        case SETTINGS.MODE_VALUES.MEAN_NO_CRIT:
            return Math.floor(get_mean_no_crit(settings, dmgObject)/settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER]);
        case SETTINGS.MODE_VALUES.MEAN_CRIT:
            return Math.floor(get_mean_crit(settings, dmgObject)/settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER]);
        case SETTINGS.MODE_VALUES.MIN_NO_CRIT:
            return Math.floor(get_min_no_crit(settings, dmgObject)/settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER]);
        case SETTINGS.MODE_VALUES.MIN_CRIT:
            return Math.floor(get_min_crit(settings, dmgObject)/settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER]);
        case SETTINGS.MODE_VALUES.MAX_NO_CRIT:
            return Math.floor(get_max_no_crit(settings, dmgObject)/settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER]);
        case SETTINGS.MODE_VALUES.MAX_CRIT:
            return Math.floor(get_max_crit(settings, dmgObject)/settings[SETTINGS.DAMAGE_PER_UNIT_DIVIDER]);
        default:
            return null;
    }
}

function get_mean_damage(settings: Record<string, any>, dmgObject: DamageObject) {
    let mean = 0;
    iterateDistributions(dmgObject, (distribution) => {
        const list = distribution['damage list'];
        if (list.length === 0) return;
        let total = 0;
        let prob = distribution['probability'];
        for (let i = 0; i < list.length; i++) {
            total += list[i];
        }
        total = total / list.length;
        mean += total * prob;
    });
    return Math.round(mean);
}

function get_mean_no_crit(settings: Record<string, any>, dmgObject: DamageObject) {
    let mean = 0;
    const nonCritDist = getDamageDistribution(dmgObject, 'non_crit');
    if (nonCritDist && nonCritDist['damage list'].length > 0) {
        let total = 0;
        for (let i = 0; i < nonCritDist['damage list'].length; i++) {
            total += nonCritDist['damage list'][i];
        }
        total = total / nonCritDist['damage list'].length;
        mean += total;
    }
    return Math.round(mean);
}

function get_mean_crit(settings: Record<string, any>, dmgObject: DamageObject) {
    const critDist = getDamageDistribution(dmgObject, 'crit');
    if (abils[dmgObject.ability].critEffects === false ||
        !critDist || critDist['probability'] === 0
    ) {
        return get_mean_damage(settings, dmgObject);
    }

    if (critDist['damage list'].length === 0) return 0;
    let total = 0;
    for (let i = 0; i < critDist['damage list'].length; i++) {
        total += critDist['damage list'][i];
    }
    return Math.round(total / critDist['damage list'].length);
}

function get_min_no_crit(settings: Record<string, any>, dmgObject: DamageObject) {
    let min_hit = 100000000;
    const nonCritDist = getDamageDistribution(dmgObject, 'non_crit');
    if (nonCritDist && nonCritDist['damage list'].length > 0) {
        let lowest_hit = nonCritDist['damage list'][0];
        if (lowest_hit < min_hit) {
            min_hit = lowest_hit;
        }
    }
    return min_hit;
}

function get_min_crit(settings: Record<string, any>, dmgObject: DamageObject) {
    const critDist = getDamageDistribution(dmgObject, 'crit');
    if (abils[dmgObject.ability].critEffects === false ||
        !critDist || critDist['probability'] === 0) {
        return get_min_no_crit(settings, dmgObject);
    }

    let min_hit = 100000000;
    if (critDist['damage list'].length > 0) {
        let lowest_hit = critDist['damage list'][0];
        if (lowest_hit < min_hit) {
            min_hit = lowest_hit;
        }
    }
    return min_hit;
}

function get_max_no_crit(settings: Record<string, any>, dmgObject: DamageObject) {
    let max_hit = 0;
    const nonCritDist = getDamageDistribution(dmgObject, 'non_crit');
    if (nonCritDist && nonCritDist['damage list'].length > 0) {
        let highest_hit = nonCritDist['damage list'][nonCritDist['damage list'].length - 1];
        if (highest_hit > max_hit) {
            max_hit = highest_hit;
        }
    }
    return max_hit;
}

function get_max_crit(settings: Record<string, any>, dmgObject: DamageObject) {
    const critDist = getDamageDistribution(dmgObject, 'crit');
    if (abils[dmgObject.ability].critEffects === false ||
        !critDist || critDist['probability'] === 0) {
        return get_max_no_crit(settings, dmgObject);
    }

    let max_hit = 0;
    if (critDist['damage list'].length > 0) {
        let highest_hit = critDist['damage list'][critDist['damage list'].length - 1];
        if (highest_hit > max_hit) {
            max_hit = highest_hit;
        }
    }
    return max_hit;
}
