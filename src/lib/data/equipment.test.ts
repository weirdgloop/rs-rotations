import { describe, expect, it } from 'vitest';
import { ARMOUR } from './armour';
import { WEAPONS } from './weapons';
import { coerceEquipmentValue, equipment, getEquipmentIcon, migrateEquipmentSettings } from './equipment';
import syntheticEquipment from '../../equipment_synthetic.json';

describe('equipment database', () => {
    it('resolves every equipment constant to a database record', () => {
        const ids = [
            ...Object.values(WEAPONS),
            ...Object.values(ARMOUR).filter((value) => value !== 'none')
        ];

        for (const id of ids) {
            expect(equipment[id as number], `missing equipment id ${id}`).toBeTruthy();
        }
    });

    it('keeps synthetic records in the reserved id range', () => {
        for (const id of Object.keys(syntheticEquipment)) {
            expect(Number(id)).toBeGreaterThanOrEqual(1_000_000);
        }
    });

    it('uses RuneScape Wiki image urls from image filenames', () => {
        expect(getEquipmentIcon(WEAPONS.BOW_OF_THE_LAST_GUARDIAN)).toBe(
            'https://runescape.wiki/images/Bow%20of%20the%20Last%20Guardian.png'
        );
    });

    it('migrates legacy equipment names in settings snapshots', () => {
        const settings = {
            'ranged main-hand weapon': { value: 'bow of the last guardian [IM]' },
            'ranged ammo slot': { value: 'custom' },
            '_gearInstances': {
                value: {
                    'ranged main-hand weapon': { itemKey: 'bow of the last guardian [IM]', instanceIndex: 0 }
                }
            }
        };

        migrateEquipmentSettings(settings);

        expect(settings['ranged main-hand weapon'].value).toBe(WEAPONS.BOW_OF_THE_LAST_GUARDIAN_IM);
        expect(settings['ranged ammo slot'].value).toBe(ARMOUR.CUSTOM);
        expect(settings._gearInstances.value['ranged main-hand weapon'].itemKey).toBe(WEAPONS.BOW_OF_THE_LAST_GUARDIAN_IM);
        expect(coerceEquipmentValue('ring of vigour')).toBe(ARMOUR.RING_OF_VIGOUR);
    });
});
