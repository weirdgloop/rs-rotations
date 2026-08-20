import { weapons } from '$lib/data/weapons';
import { armour } from '$lib/data/armour';
import { abils } from '$lib/data/abilities';
import { coerceEquipmentValue, migrateOwnedGearEntries } from '$lib/data/equipment';

const ABILITIES_STORAGE_KEY = 'owned_abilities';
const LEGACY_STORAGE_KEY = 'owned_items';
const GEAR_STORAGE_KEY = 'owned_gear';

export type PerkInstance = {
    perkKey: string;
    rank: number;
};

export type OwnedGearItem = {
    itemKey: number | string;
    perks: PerkInstance[];
    label?: string;
};

type GearKey = number | string;

/** Build default owned abilities from common abilities */
function buildAbilityDefaults(): Set<string> {
    const defaults = new Set<string>();
    for (const [key, item] of Object.entries(abils)) {
        if (item.title && item.common !== false) defaults.add(key);
    }
    return defaults;
}

/** Build default owned gear from popular weapons and armour (no perks) */
function buildGearDefaults(): Map<GearKey, OwnedGearItem[]> {
    const defaults = new Map<GearKey, OwnedGearItem[]>();
    for (const [key, item] of Object.entries(weapons)) {
        if (item.popular) {
            const id = Number(key);
            defaults.set(id, [{ itemKey: id, perks: [] }]);
        }
    }
    for (const [key, item] of Object.entries(armour)) {
        if (item.popular) {
            const id = Number(key);
            defaults.set(id, [{ itemKey: id, perks: [] }]);
        }
    }
    return defaults;
}

/** Serialize gear map for localStorage. */
function serializeGear(gearMap: Map<GearKey, OwnedGearItem[]>): string {
    const obj: Record<string, OwnedGearItem[]> = {};
    for (const [key, instances] of gearMap) {
        obj[String(key)] = instances;
    }
    return JSON.stringify(obj);
}

/** Deserialize gear map from localStorage. */
function deserializeGear(json: string): Map<GearKey, OwnedGearItem[]> {
    const obj = JSON.parse(json) as Record<string, OwnedGearItem[]>;
    return migrateOwnedGearEntries(obj) as Map<GearKey, OwnedGearItem[]>;
}

function asGearKey(itemKey: unknown): GearKey {
    return coerceEquipmentValue(itemKey) as GearKey;
}

export const ownedItemsStore = $state({
    ownedAbilities: new Set<string>(),
    ownedGear: new Map<GearKey, OwnedGearItem[]>()
});

export const ownedItemsActions = {
    loadOwned() {
        if (typeof localStorage === 'undefined') {
            ownedItemsStore.ownedAbilities = buildAbilityDefaults();
            ownedItemsStore.ownedGear = buildGearDefaults();
            return;
        }
        try {
            // Load abilities
            const stored = localStorage.getItem(ABILITIES_STORAGE_KEY);
            if (stored) {
                ownedItemsStore.ownedAbilities = new Set(JSON.parse(stored) as string[]);
            } else {
                // Migrate from legacy key if it exists
                const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
                if (legacy) {
                    const allKeys = new Set(JSON.parse(legacy) as string[]);
                    // Filter to only ability keys
                    const abilityKeys = new Set<string>();
                    for (const key of allKeys) {
                        if ((abils as Record<string, unknown>)[key]) abilityKeys.add(key);
                    }
                    ownedItemsStore.ownedAbilities = abilityKeys;
                } else {
                    ownedItemsStore.ownedAbilities = buildAbilityDefaults();
                }
            }

            // Load gear with perks
            const storedGear = localStorage.getItem(GEAR_STORAGE_KEY);
            if (storedGear) {
                ownedItemsStore.ownedGear = deserializeGear(storedGear);
            } else {
                ownedItemsStore.ownedGear = buildGearDefaults();
            }

            this.saveOwned();
        } catch (e) {
            console.error('Failed to load owned items:', e);
            ownedItemsStore.ownedAbilities = new Set();
            ownedItemsStore.ownedGear = new Map();
        }
    },

    saveOwned() {
        if (typeof localStorage === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(ABILITIES_STORAGE_KEY, JSON.stringify([...ownedItemsStore.ownedAbilities]));
            localStorage.setItem(GEAR_STORAGE_KEY, serializeGear(ownedItemsStore.ownedGear));
        } catch (e) {
            console.error('Failed to save owned items:', e);
        }
    },

    /** Toggle ownership of an ability. */
    toggleAbility(abilityKey: string) {
        if (ownedItemsStore.ownedAbilities.has(abilityKey)) {
            ownedItemsStore.ownedAbilities.delete(abilityKey);
        } else {
            ownedItemsStore.ownedAbilities.add(abilityKey);
        }
        ownedItemsStore.ownedAbilities = new Set(ownedItemsStore.ownedAbilities);
        this.saveOwned();
    },

    /** Toggle ownership of a gear item. */
    toggleGear(itemKey: unknown) {
        const key = asGearKey(itemKey);
        if (ownedItemsStore.ownedGear.has(key)) {
            ownedItemsStore.ownedGear.delete(key);
        } else {
            ownedItemsStore.ownedGear.set(key, [{ itemKey: key, perks: [] }]);
        }
        ownedItemsStore.ownedGear = new Map(ownedItemsStore.ownedGear);
        this.saveOwned();
    },

    /** Get all owned instances of a gear item (for items with multiple perk setups). */
    getGearInstances(itemKey: unknown): OwnedGearItem[] {
        return ownedItemsStore.ownedGear.get(asGearKey(itemKey)) || [];
    },

    /** Add a new gear instance (e.g. a second copy with different perks). */
    addGearInstance(itemKey: unknown, perks: PerkInstance[] = [], label: string | undefined = undefined) {
        const key = asGearKey(itemKey);
        const existing = ownedItemsStore.ownedGear.get(key) || [];
        const updated = [...existing, { itemKey: key, perks: [...perks], label }];
        const newMap = new Map(ownedItemsStore.ownedGear);
        newMap.set(key, updated);
        ownedItemsStore.ownedGear = newMap;
        this.saveOwned();
    },

    /** Update perks on a specific gear instance. */
    updateGearInstance(
        itemKey: unknown,
        instanceIndex: number,
        perks: PerkInstance[],
        label: string | undefined = undefined
    ) {
        const key = asGearKey(itemKey);
        const instances = ownedItemsStore.ownedGear.get(key);
        if (!instances || !instances[instanceIndex]) return;
        const updated = instances.map((inst, i) => {
            if (i !== instanceIndex) return inst;
            return {
                ...inst,
                perks: [...perks],
                ...(label !== undefined ? { label } : {})
            };
        });
        const newMap = new Map(ownedItemsStore.ownedGear);
        newMap.set(key, updated);
        ownedItemsStore.ownedGear = newMap;
        this.saveOwned();
    },

    /** Remove a specific gear instance. */
    removeGearInstance(itemKey: unknown, instanceIndex: number) {
        const key = asGearKey(itemKey);
        const instances = ownedItemsStore.ownedGear.get(key);
        if (!instances) return;
        const updated = instances.filter((_, i) => i !== instanceIndex);
        const newMap = new Map(ownedItemsStore.ownedGear);
        if (updated.length === 0) {
            newMap.delete(key);
        } else {
            newMap.set(key, updated);
        }
        ownedItemsStore.ownedGear = newMap;
        this.saveOwned();
    },

    clearAll() {
        ownedItemsStore.ownedAbilities = new Set();
        ownedItemsStore.ownedGear = new Map();
        this.saveOwned();
    }
};

// Load on module init
ownedItemsActions.loadOwned();
