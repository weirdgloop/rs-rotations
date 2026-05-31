import { weapons } from '$lib/data/weapons';
import { armour } from '$lib/data/armour';
import { abils } from '$lib/data/abilities';
import { coerceEquipmentValue, migrateOwnedGearEntries } from '$lib/data/equipment';

const ABILITIES_STORAGE_KEY = 'owned_abilities';
const LEGACY_STORAGE_KEY = 'owned_items';
const GEAR_STORAGE_KEY = 'owned_gear';

/**
 * @typedef {Object} PerkInstance
 * @property {string} perkKey - Reference to perk definition key (e.g. 'precise')
 * @property {number} rank - Rank of this perk (1 to maxRank)
 */

/**
 * @typedef {Object} OwnedGearItem
 * @property {number|string} itemKey - Equipment id, or legacy item key during migration
 * @property {PerkInstance[]} perks - Perks applied to this gear instance
 * @property {string} [label] - Optional user label to distinguish copies
 */

/** Build default owned abilities from common abilities */
function buildAbilityDefaults() {
    const defaults = new Set();
    for (const [key, item] of Object.entries(abils)) {
        if (item.title && item.common !== false) defaults.add(key);
    }
    return defaults;
}

/** Build default owned gear from popular weapons and armour (no perks) */
function buildGearDefaults() {
    /** @type {Map<number|string, OwnedGearItem[]>} */
    const defaults = new Map();
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

/**
 * Serialize gear map for localStorage.
 * @param {Map<string, OwnedGearItem[]>} gearMap
 * @returns {string}
 */
function serializeGear(gearMap) {
    const obj = {};
    for (const [key, instances] of gearMap) {
        obj[key] = instances;
    }
    return JSON.stringify(obj);
}

/**
 * Deserialize gear map from localStorage.
 * @param {string} json
 * @returns {Map<string, OwnedGearItem[]>}
 */
function deserializeGear(json) {
    const obj = JSON.parse(json);
    return migrateOwnedGearEntries(obj);
}

export const ownedItemsStore = $state({
    /** @type {Set<string>} Set of owned ability keys */
    ownedAbilities: new Set(),
    /** @type {Map<string, OwnedGearItem[]>} Gear items with perks, keyed by item name */
    ownedGear: new Map()
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
                ownedItemsStore.ownedAbilities = new Set(JSON.parse(stored));
            } else {
                // Migrate from legacy key if it exists
                const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
                if (legacy) {
                    const allKeys = new Set(JSON.parse(legacy));
                    // Filter to only ability keys
                    const abilityKeys = new Set();
                    for (const key of allKeys) {
                        if (abils[key]) abilityKeys.add(key);
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

    /**
     * Toggle ownership of an ability.
     */
    toggleAbility(abilityKey) {
        if (ownedItemsStore.ownedAbilities.has(abilityKey)) {
            ownedItemsStore.ownedAbilities.delete(abilityKey);
        } else {
            ownedItemsStore.ownedAbilities.add(abilityKey);
        }
        ownedItemsStore.ownedAbilities = new Set(ownedItemsStore.ownedAbilities);
        this.saveOwned();
    },

    /**
     * Toggle ownership of a gear item.
     */
    toggleGear(itemKey) {
        itemKey = coerceEquipmentValue(itemKey);
        if (ownedItemsStore.ownedGear.has(itemKey)) {
            ownedItemsStore.ownedGear.delete(itemKey);
        } else {
            ownedItemsStore.ownedGear.set(itemKey, [{ itemKey, perks: [] }]);
        }
        ownedItemsStore.ownedGear = new Map(ownedItemsStore.ownedGear);
        this.saveOwned();
    },

    /**
     * Get all owned instances of a gear item (for items with multiple perk setups).
     * @param {string} itemKey
     * @returns {OwnedGearItem[]}
     */
    getGearInstances(itemKey) {
        itemKey = coerceEquipmentValue(itemKey);
        return ownedItemsStore.ownedGear.get(itemKey) || [];
    },

    /**
     * Add a new gear instance (e.g. a second copy with different perks).
     * @param {string} itemKey
     * @param {PerkInstance[]} perks
     * @param {string} [label]
     */
    addGearInstance(itemKey, perks = [], label = undefined) {
        itemKey = coerceEquipmentValue(itemKey);
        const existing = ownedItemsStore.ownedGear.get(itemKey) || [];
        const updated = [...existing, { itemKey, perks: [...perks], label }];
        const newMap = new Map(ownedItemsStore.ownedGear);
        newMap.set(itemKey, updated);
        ownedItemsStore.ownedGear = newMap;
        this.saveOwned();
    },

    /**
     * Update perks on a specific gear instance.
     * @param {string} itemKey
     * @param {number} instanceIndex - Which copy to update
     * @param {PerkInstance[]} perks
     * @param {string} [label]
     */
    updateGearInstance(itemKey, instanceIndex, perks, label = undefined) {
        itemKey = coerceEquipmentValue(itemKey);
        const instances = ownedItemsStore.ownedGear.get(itemKey);
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
        newMap.set(itemKey, updated);
        ownedItemsStore.ownedGear = newMap;
        this.saveOwned();
    },

    /**
     * Remove a specific gear instance.
     * @param {string} itemKey
     * @param {number} instanceIndex
     */
    removeGearInstance(itemKey, instanceIndex) {
        itemKey = coerceEquipmentValue(itemKey);
        const instances = ownedItemsStore.ownedGear.get(itemKey);
        if (!instances) return;
        const updated = instances.filter((_, i) => i !== instanceIndex);
        const newMap = new Map(ownedItemsStore.ownedGear);
        if (updated.length === 0) {
            newMap.delete(itemKey);
        } else {
            newMap.set(itemKey, updated);
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
