import { ABILITIES, abils } from '$lib/data/abilities';
import { SETTINGS } from '../settings_rb';
import { DamageObject, DamageKind, DamageDistribution } from '../types';
import { Logger, LogCategory } from '../../utils/Logger';
import { calc_crit_chance } from '../crit';

const logger = Logger.getInstance();

function create_damage_object(settings: Record<string, any>, ability: ABILITIES): DamageObject {
    let crit_chance = 0
    if (abils[ability].critEffects === true) {
        crit_chance = calc_crit_chance(settings, ability);
        logger.log(LogCategory.ABILITY_DAMAGE, `Crit chance for ${ability}`, crit_chance);
        logger.trace('Crit Chance', `${(crit_chance * 100).toFixed(1)}%`, `${ability}`);
    } else {
        logger.trace('Crit Chance', 'N/A', `${ability} cannot crit`);
    }

    const nonCritDistribution: DamageDistribution = {
        minHit: 0,
        varHit: 0,
        'crit': false,
        'probability': 1 - crit_chance,
        'damage list': []
    };

    const critDistribution: DamageDistribution = {
        minHit: 0,
        varHit: 0,
        'crit': true,
        'probability': crit_chance,
        'damage list': []
    };

    const distributions: Record<DamageKind, DamageDistribution | undefined> = {
        'non_crit': nonCritDistribution,
        'crit': critDistribution
    };

    const result = {
        distributions,
        ability: ability,
        likelihood: 1.0
    };

    logger.log(LogCategory.ABILITY_DAMAGE, `create_damage_object result for ${ability}`, result);
    return result;
}

/**
 * Legacy wrapper — reads ability from settings['ability'].
 * Used by damage_calc_rb.js which sets settings['ability'] before calling.
 */
function create_object(settings: Record<string, any>): DamageObject {
    const ability = settings['ability'] as ABILITIES;
    return create_damage_object(settings, ability);
}

export { create_damage_object, create_object };
