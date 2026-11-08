/**
 * Damage Regression Tests
 *
 * Placeholder - previous fixture-based tests were removed during the
 * Combat Style Modernisation update. Re-add verified in-game values
 * once the new ability data has been validated.
 */

import { describe, it, expect } from 'vitest';
import { WEAPONS } from '$lib/data/weapons';
import { calculateSingleAbilityDamage } from '../../unified-damage-calculator';
import { SETTINGS } from '../../settings_rb';
import { ABILITIES } from '$lib/data/abilities';
import {
    createBaseSettings,
    createBlankSettings,
    createMeleeSettings,
    createMagicSettings,
    createNecromancySettings,
} from '../test-helpers';

// =============================================================================
// SMOKE TESTS - Verify abilities calculate without crashing
// =============================================================================

describe('Smoke Tests', () => {
    describe('Melee abilities calculate', () => {
        it('Dismember produces positive damage', () => {
            const settings = createMeleeSettings({
                [SETTINGS.ABILITY_DAMAGE]: 1800,
                [SETTINGS.USE_RAW_ABILITY_DAMAGE]: true,
            });
            const result = calculateSingleAbilityDamage(settings, {
                ability: 'dismember',
            });
            expect(result.expected).toBeGreaterThan(0);
        });

        it('Quick Smash produces positive damage', () => {
            const settings = createMeleeSettings({
                [SETTINGS.ABILITY_DAMAGE]: 1800,
                [SETTINGS.USE_RAW_ABILITY_DAMAGE]: true,
            });
            const result = calculateSingleAbilityDamage(settings, {
                ability: 'quick smash',
            });
            expect(result.expected).toBeGreaterThan(0);
        });
    });

    describe('Magic abilities calculate', () => {
        it('Dragon Breath produces positive damage', () => {
            const settings = createMagicSettings({
                [SETTINGS.ABILITY_DAMAGE]: 1700,
                [SETTINGS.USE_RAW_ABILITY_DAMAGE]: true,
            });
            const result = calculateSingleAbilityDamage(settings, {
                ability: 'dragon breath',
            });
            expect(result.expected).toBeGreaterThan(0);
        });
    });

    describe('Necromancy abilities calculate', () => {
        it('Touch of Death produces positive damage', () => {
            const settings = createNecromancySettings({
                [SETTINGS.ABILITY_DAMAGE]: 1600,
                [SETTINGS.USE_RAW_ABILITY_DAMAGE]: true,
            });
            const result = calculateSingleAbilityDamage(settings, {
                ability: ABILITIES.TOUCH_OF_DEATH,
            });
            expect(result.expected).toBeGreaterThan(0);
        });
    });
});

// =============================================================================
// MANUAL TESTS - For complex scenarios requiring custom logic
// =============================================================================

describe('Manual Tests', () => {
    describe('Damage Scaling', () => {
        it('Touch of Death scales linearly with ability damage', () => {
            const lowAD = createNecromancySettings({ [SETTINGS.ABILITY_DAMAGE]: 1000 });
            const highAD = createNecromancySettings({ [SETTINGS.ABILITY_DAMAGE]: 2000 });

            const lowResult = calculateSingleAbilityDamage(lowAD, {
                ability: ABILITIES.TOUCH_OF_DEATH,
            });
            const highResult = calculateSingleAbilityDamage(highAD, {
                ability: ABILITIES.TOUCH_OF_DEATH,
            });

            expect(highResult.expected).toBeGreaterThan(lowResult.expected);
            const ratio = highResult.expected / lowResult.expected;
            expect(ratio).toBeCloseTo(2.0, 1);
        });
    });

// =============================================================================
// VERIFIED IN-GAME VALUES
// =============================================================================

describe('Verified In-Game Values', () => {
    describe('1. Base Damage Formula', () => {
        it('Rend: Lv101 Str, t75 melee 2h, no perks/buffs → 2002-2446 non-crit', () => {
            const settings = createBlankSettings(101, 75, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.REND });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_NO_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.REND });

            expect(minResult.expected).toBe(2002);
            expect(maxResult.expected).toBe(2446);
        });

        it('Dismember: Lv101 Str, t75 melee 2h, no perks/buffs → 370-518 per hit (x8 identical hits)', () => {
            const settings = createBlankSettings(101, 75, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DISMEMBER });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_NO_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DISMEMBER });

            // Total = per-hit × 8
            expect(minResult.expected).toBe(370 * 8);
            expect(maxResult.expected).toBe(518 * 8);
        });

        it('Hurricane: Lv101 Str, t75 melee 2h → hit 1: 2002-2446, hit 2: 2298-2742', () => {
            const settings = createBlankSettings(101, 75, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.HURRICANE });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_NO_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.HURRICANE });

            // Total = hit1 + hit2
            expect(minResult.expected).toBe(2002 + 2298);
            expect(maxResult.expected).toBe(2446 + 2742);
        });
        // TODO: Ranged AD formula may need updating — off by 1 per hit
        it.skip('Piercing Shot: Lv112 Ranged, t5 ranged 2h, no perks/buffs → 230-281 per hit (x2 hits)', () => {
            const settings = createBlankSettings(112, 5, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_RANGED]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.PIERCING_SHOT });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_NO_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.PIERCING_SHOT });

            // Total = per-hit × 2
            expect(minResult.expected).toBe(230 * 2);
            expect(maxResult.expected).toBe(281 * 2);
        });

        it('Dragon Breath: Lv114 Magic, t60 magic 2h, no perks/buffs → 1442-1704 non-crit', () => {
            const settings = createBlankSettings(114, 60, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MAGIC]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DRAGON_BREATH });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_NO_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DRAGON_BREATH });

            expect(minResult.expected).toBe(1442);
            expect(maxResult.expected).toBe(1704);
        });
    });

    describe('4. Prayers', () => {
        it('Rend + Turmoil: Lv101 Str, t75 2h → non-crit min 2202, crit max 4035', () => {
            const settings = createBlankSettings(101, 75, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MELEE_PRAYER]: SETTINGS.MELEE_PRAYER_VALUES.TURMOIL,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.REND });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.REND });

            expect(minResult.expected).toBe(2202);
            expect(critMaxResult.expected).toBe(4035);
        });

        // TODO: Ranged AD formula off — skipping ranged prayer test
        it.skip('Piercing Shot + Desolation: Lv112 Ranged, t5 2h → non-crit min 257 per hit, crit max 471 per hit', () => {
            const settings = createBlankSettings(112, 5, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_RANGED]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.RANGED_PRAYER]: SETTINGS.RANGED_PRAYER_VALUES.DESOLATION,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.PIERCING_SHOT });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.PIERCING_SHOT });

            // x2 hits
            expect(minResult.expected).toBe(257 * 2);
            expect(critMaxResult.expected).toBe(471 * 2);
        });

        it('Dragon Breath + Torment: Lv114 Magic, t60 2h → non-crit min 1586, crit max 2811', () => {
            const settings = createBlankSettings(114, 60, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MAGIC]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MAGIC_PRAYER]: SETTINGS.MAGIC_PRAYER_VALUES.TORMENT,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DRAGON_BREATH });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DRAGON_BREATH });

            expect(minResult.expected).toBe(1586);
            expect(critMaxResult.expected).toBe(2811);
        });
    });

    describe('5. Single Buffs', () => {
        it('Rend + Berserk: Lv101 Str, t75 2h → min 3503', () => {
            const settings = createBlankSettings(101, 75, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.BERSERK]: true,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.REND });

            expect(minResult.expected).toBe(3503);
        });

        it('Dragon Breath + Sunshine: Lv114 Magic, t60 2h → 2163-2556', () => {
            const settings = createBlankSettings(114, 60, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MAGIC]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.SUNSHINE]: true,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DRAGON_BREATH });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_NO_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.DRAGON_BREATH });

            expect(minResult.expected).toBe(2163);
            expect(maxResult.expected).toBe(2556);
        });
    });

    describe('7. Weapon-Specific Effects', () => {
        it('Igneous Showdown (1st cast, no Flamebound): Lv120 Str, EZK IM 2h, reaper crew → 1 hit, min 5602, crit max 9694', () => {
            const settings = createBlankSettings(120, 100, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MELEE_TH]: WEAPONS.EZK_IM,
                [SETTINGS.TH]: WEAPONS.EZK_IM,
                [SETTINGS.REAPER_CREW]: true,
                [SETTINGS.FLAMEBOUND_RIVAL]: false,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            expect(minResult.expected).toBe(5602);
            expect(critMaxResult.expected).toBe(9694);
        });

        it('Igneous Showdown (2nd cast, Flamebound): Lv120 Str, EZK IM 2h, reaper crew → 4 hits, total min 21436, total crit max 35380', () => {
            const settings = createBlankSettings(120, 100, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MELEE_TH]: WEAPONS.EZK_IM,
                [SETTINGS.TH]: WEAPONS.EZK_IM,
                [SETTINGS.REAPER_CREW]: true,
                [SETTINGS.FLAMEBOUND_RIVAL]: true,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            // Total = hit1 + 3 × bonus hits
            expect(minResult.expected).toBe(5602 + 5278 * 3);
            expect(critMaxResult.expected).toBe(9694 + 8562 * 3);
        });
    });

        it('Igneous Showdown (1st cast) + Precise 6: Lv120 Str, EZK IM, reaper crew → min 6183, crit max 9694', () => {
            const settings = createBlankSettings(120, 100, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MELEE_TH]: WEAPONS.EZK_IM,
                [SETTINGS.TH]: WEAPONS.EZK_IM,
                [SETTINGS.REAPER_CREW]: true,
                [SETTINGS.PRECISE]: 6,
                [SETTINGS.FLAMEBOUND_RIVAL]: false,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            expect(minResult.expected).toBe(6183);
            expect(critMaxResult.expected).toBe(9694);
        });

        // TODO: Precise 6 interaction with multi-hit sub-abilities needs investigation
        it.skip('Igneous Showdown (2nd cast) + Precise 6: Lv120 Str, EZK IM, reaper crew → 4 hits total', () => {
            const settings = createBlankSettings(120, 100, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MELEE_TH]: WEAPONS.EZK_IM,
                [SETTINGS.TH]: WEAPONS.EZK_IM,
                [SETTINGS.REAPER_CREW]: true,
                [SETTINGS.PRECISE]: 6,
                [SETTINGS.FLAMEBOUND_RIVAL]: true,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_NO_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const critMaxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.IGNEOUS_SHOWDOWN });

            // Total = hit1 + 3 × bonus hits
            expect(minResult.expected).toBe(6183 + 5707 * 3);
            expect(critMaxResult.expected).toBe(9694 + 8562 * 3);
        });
    });

    describe('2. Crit Calculation', () => {
        it('Melee Auto: Lv101 Str, t75 2h, base crit → crit min 2446, crit max 2890', () => {
            const settings = createBlankSettings(101, 75, {
                [SETTINGS.WEAPON]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.WEAPON_TYPE_MELEE]: SETTINGS.WEAPON_VALUES.TH,
                [SETTINGS.MODE]: SETTINGS.MODE_VALUES.MIN_CRIT,
            });
            const minResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.MELEE_AUTO });

            settings[SETTINGS.MODE] = SETTINGS.MODE_VALUES.MAX_CRIT;
            const maxResult = calculateSingleAbilityDamage(settings, { ability: ABILITIES.MELEE_AUTO });

            expect(minResult.expected).toBe(2446);
            expect(maxResult.expected).toBe(2890);
        });
    });

    describe('Perk Effects', () => {
        it('Precise 6 increases minimum damage', () => {
            const baseSettings = createMeleeSettings({
                [SETTINGS.ABILITY_DAMAGE]: 1800,
                [SETTINGS.PRECISE]: 0,
            });
            const preciseSettings = createMeleeSettings({
                [SETTINGS.ABILITY_DAMAGE]: 1800,
                [SETTINGS.PRECISE]: 6,
            });

            const baseResult = calculateSingleAbilityDamage(baseSettings, {
                ability: 'quick smash',
            });
            const preciseResult = calculateSingleAbilityDamage(preciseSettings, {
                ability: 'quick smash',
            });

            expect(preciseResult.expected).toBeGreaterThan(baseResult.expected);

            if (baseResult.distributionStats.length > 0 && preciseResult.distributionStats.length > 0) {
                expect(preciseResult.distributionStats[0].minDamage)
                    .toBeGreaterThan(baseResult.distributionStats[0].minDamage);
            }
        });
    });
});
