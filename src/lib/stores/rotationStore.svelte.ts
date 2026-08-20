import { createBuffTimings, createStackTimings } from '$lib/calc/rotation_builder/rotation_consts.ts';
import { settingsStore } from '$lib/stores/settingsStore.svelte.ts';
import { normalizeLegacy } from '$lib/calc/rotation_builder/extra-action';
import { gearSwaps, allExtraActions } from '$lib/special/abilities';
import { migrateEquipmentSettings } from '$lib/data/equipment';

// Configuration constants
const STORAGE_KEY = 'rotation_configs';
const MAX_SAVED_CONFIGS = 20;
const BAR_SIZE = 300;
const EXTRA_BAR_SIZE = 12;

type AbilitySlot = string | null;
type ExtraActionRow = AbilitySlot[] | null;

export type RotationData = {
    a: string[];
    e: string[][];
    n: boolean[];
    t: string[];
    s: Record<string, unknown>;
};

export type SavedRotation = {
    id: string;
    name: string;
    timestamp: number;
    data: RotationData;
};

export type DistributionStat = {
    tick: number;
    likelihood: number;
    minDamage: number;
    maxDamage: number;
    ability: string;
    distributionType: 'crit' | 'non_crit' | 'combined';
    source?: 'familiar' | 'dreadnip' | 'conjure' | 'poison' | 'perk';
    critProbability?: number;
    critMean?: number;
    critVariance?: number;
    critMin?: number;
    critMax?: number;
    nonCritProbability?: number;
    nonCritMean?: number;
    nonCritVariance?: number;
    nonCritMin?: number;
    nonCritMax?: number;
};

export type PhaseTransition = {
    tick: number;
    phaseIdx: number;
    label: string;
    hp: number;
    pause: number;
};

export type TickMeta = {
    resolvedAbility: string;
    duration: number;
};

type MessageCallback = (message: string) => void;
type StorageResult = { success: true } | { success: false; error: string };

type DamageCalcResult = {
    regularDamage: number;
    poisonDamage: number;
    familiarDamage: number;
    dreadnipDamage?: number;
    conjureDamage?: number;
    distributionStats: DistributionStat[];
    poisonPerTick?: number[];
    familiarPerTick?: number[];
    familiarVariancePerTick?: number[];
    dreadnipPerTick?: number[];
    dreadnipVariancePerTick?: number[];
    conjurePerTick?: number[];
    conjureVariancePerTick?: number[];
    phaseTransitions?: PhaseTransition[];
    tickMetadata?: Record<number, TickMeta>;
};

type BarKey = 'abilityBar' | 'extraActionBar' | 'nulledTicks' | 'stalledAbilities';

// Rotation store
export const rotationStore = $state({
    // Saved rotations
    savedRotations: [] as SavedRotation[],
    activeRotationId: null as string | null,

    // Current rotation data
    abilityBar: Array(BAR_SIZE).fill(null) as AbilitySlot[],
    extraActionBar: Array(BAR_SIZE).fill(null) as ExtraActionRow[],
    nulledTicks: Array(BAR_SIZE).fill(false) as boolean[],
    stalledAbilities: Array(BAR_SIZE).fill(null) as AbilitySlot[],

    // Buffs and stacks
    buffs: createBuffTimings(BAR_SIZE),
    stacks: createStackTimings(BAR_SIZE),

    // Cooldown tracking - array of (string[] | null) per tick
    cooldownReady: Array(BAR_SIZE).fill(null) as (string[] | null)[],

    // Damage calculations
    totalDamage: 0,
    poisonDamage: 0,
    familiarDamage: 0,
    dreadnipDamage: 0,
    conjureDamage: 0,
    distributionStats: [] as DistributionStat[],
    poisonPerTick: [] as number[],
    familiarPerTick: [] as number[],
    familiarVariancePerTick: [] as number[],
    dreadnipPerTick: [] as number[],
    dreadnipVariancePerTick: [] as number[],
    conjurePerTick: [] as number[],
    conjureVariancePerTick: [] as number[],
    phaseTransitions: [] as PhaseTransition[],
    tickMetadata: {} as Record<number, TickMeta>
});

// Helper: snapshot current settings values as a plain object
function getSettingsSnapshot(): Record<string, unknown> {
    if (!settingsStore.initialized) return {};
    return Object.fromEntries(
        Object.entries(settingsStore.settings).map(([key, setting]) => [key, setting.value])
    );
}

// Helper: restore settings values from a snapshot
function restoreSettings(snapshot: Record<string, unknown> | null | undefined) {
    if (!snapshot || !settingsStore.initialized) return;
    migrateEquipmentSettings(snapshot);
    for (const [key, value] of Object.entries(snapshot)) {
        if (settingsStore.settings[key]) {
            settingsStore.settings[key].value = value;
        }
    }
}

// Rotation operations
export const rotationActions = {
    // Load saved rotations from localStorage
    loadSavedRotations() {
        if (typeof localStorage === 'undefined') {
            rotationStore.savedRotations = [];
            return;
        }
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                rotationStore.savedRotations = JSON.parse(stored) as SavedRotation[];
            }
        } catch (e) {
            console.error('Failed to load saved rotations:', e);
            rotationStore.savedRotations = [];
        }
    },

    // Save rotations to localStorage
    saveRotationsToStorage(): StorageResult {
        if (typeof localStorage === 'undefined') {
            return { success: true };
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rotationStore.savedRotations));
            return { success: true };
        } catch (e) {
            console.error('Failed to save rotations to storage:', e);
            return { success: false, error: 'Failed to save rotation. Storage might be full.' };
        }
    },

    // Get current rotation data for export (includes settings)
    getCurrentRotationData(): RotationData {
        return {
            a: rotationStore.abilityBar.map(a => a || ''),
            e: rotationStore.extraActionBar.map(row => row ? row.map(a => a || '') : []),
            n: rotationStore.nulledTicks,
            t: rotationStore.stalledAbilities.map(a => a || ''),
            s: getSettingsSnapshot()
        };
    },

    // Save a new rotation
    saveRotation(name: string, onSuccess: MessageCallback, onError: MessageCallback) {
        if (!name.trim()) {
            onError('Please enter a name for your rotation.');
            return;
        }

        const existingIndex = rotationStore.savedRotations.findIndex(config => config.name === name.trim());

        const newConfig: SavedRotation = {
            id: existingIndex >= 0 ? rotationStore.savedRotations[existingIndex].id : crypto.randomUUID(),
            name: name.trim(),
            timestamp: Date.now(),
            data: this.getCurrentRotationData()
        };

        if (existingIndex >= 0) {
            // Return overwrite confirmation needed
            return { needsConfirmation: true as const, config: newConfig, existingIndex };
        } else {
            // Add new config
            if (rotationStore.savedRotations.length >= MAX_SAVED_CONFIGS) {
                rotationStore.savedRotations = rotationStore.savedRotations.slice(1);
            }
            rotationStore.savedRotations = [...rotationStore.savedRotations, newConfig];

            const saveResult = this.saveRotationsToStorage();
            if (saveResult.success) {
                rotationStore.activeRotationId = newConfig.id;
                onSuccess(`Rotation "${newConfig.name}" saved successfully!`);
            } else {
                onError(saveResult.error);
            }
            return { success: true as const };
        }
    },

    // Overwrite existing rotation
    overwriteRotation(
        config: SavedRotation,
        existingIndex: number,
        onSuccess: MessageCallback,
        onError: MessageCallback
    ) {
        rotationStore.savedRotations[existingIndex] = config;

        const saveResult = this.saveRotationsToStorage();
        if (saveResult.success) {
            rotationStore.activeRotationId = config.id;
            onSuccess(`Rotation "${config.name}" saved successfully!`);
        } else {
            onError(saveResult.error);
        }
    },

    // Build a config object from the current rotation state (for updating existing saves)
    buildCurrentConfig(name: string, existingId?: string | null): SavedRotation {
        return {
            id: existingId || crypto.randomUUID(),
            name: name,
            timestamp: Date.now(),
            data: this.getCurrentRotationData()
        };
    },

    // Load a rotation
    async loadRotation(
        configId: string,
        onSuccess: MessageCallback,
        onError: MessageCallback,
        refreshUICallback?: () => void
    ) {
        const config = rotationStore.savedRotations.find(c => c.id === configId);
        if (!config) {
            onError('Rotation not found.');
            return;
        }

        try {
            rotationStore.abilityBar = config.data.a.map(a => a || null);
            rotationStore.extraActionBar = config.data.e.map(row =>
                row.map(a => (a ? (normalizeLegacy(a, gearSwaps, allExtraActions) || a) : null))
            );
            rotationStore.nulledTicks = config.data.n;
            rotationStore.stalledAbilities = config.data.t.map(a => a || null);

            // Restore settings if saved with the rotation
            if (config.data.s) {
                restoreSettings(config.data.s);
            }

            // Import and call the damage calculation function
            const { calculateTotalDamageNew } = await import('$lib/utils/rotationEventHandlers.js');
            calculateTotalDamageNew();

            // Refresh UI if callback provided (updates row gap, etc.)
            if (refreshUICallback) {
                refreshUICallback();
            }

            rotationStore.activeRotationId = configId;
            onSuccess(`Rotation "${config.name}" has been loaded!`);

        } catch (e) {
            onError('Failed to load rotation. The file might be corrupted. Sorry if update killed your rotation =(');
        }
    },

    // Delete a rotation
    deleteRotation(configId: string, onSuccess: MessageCallback, onError: MessageCallback) {
        const config = rotationStore.savedRotations.find(c => c.id === configId);
        if (!config) {
            onError('Rotation not found.');
            return;
        }

        rotationStore.savedRotations = rotationStore.savedRotations.filter(c => c.id !== configId);

        const saveResult = this.saveRotationsToStorage();
        if (saveResult.success) {
            onSuccess(`Rotation "${config.name}" has been deleted.`);
        } else {
            onError(saveResult.error);
        }
    },

    // Clear all saved configurations
    clearAllSavedConfigs(onSuccess: MessageCallback, onError: MessageCallback) {
        rotationStore.savedRotations = [];

        const saveResult = this.saveRotationsToStorage();
        if (saveResult.success) {
            onSuccess('All saved configurations have been deleted.');
        } else {
            onError(saveResult.error);
        }
    },

    // Clear current rotation
    clearRotation() {
        rotationStore.abilityBar = Array(BAR_SIZE).fill(null);
        rotationStore.extraActionBar = Array(BAR_SIZE).fill(null);
        rotationStore.nulledTicks = Array(BAR_SIZE).fill(false);
        rotationStore.stalledAbilities = Array(BAR_SIZE).fill(null);
        rotationStore.totalDamage = 0;
        rotationStore.cooldownReady = Array(BAR_SIZE).fill(null);

        // Reset stacks
        for (let i = 0; i < BAR_SIZE; i++) {
            rotationStore.stacks['icy chill stacks'].stackTicks[i] = 0;
            rotationStore.stacks['perfect equilibrium stacks'].stackTicks[i] = 0;
        }

        // Reset buffs
        for (const key of Object.keys(rotationStore.buffs) as (keyof typeof rotationStore.buffs)[]) {
            rotationStore.buffs[key].buffTicks = Array(BAR_SIZE).fill(0);
            rotationStore.buffs[key].activeRows = [];
            rotationStore.buffs[key].idx = -1;
        }
    },

    insertTicks(pos: number, count: number) {
        const fills: Record<BarKey, AbilitySlot | ExtraActionRow | boolean> = {
            abilityBar: null,
            extraActionBar: null,
            nulledTicks: false,
            stalledAbilities: null
        };
        for (const key of Object.keys(fills) as BarKey[]) {
            const fill = fills[key];
            const arr = rotationStore[key] as unknown[];
            (rotationStore as Record<BarKey, unknown>)[key] = [
                ...arr.slice(0, pos),
                ...Array(count).fill(fill),
                ...arr.slice(pos)
            ].slice(0, BAR_SIZE);
        }
    },

    removeTicks(pos: number, count: number) {
        const fills: Record<BarKey, AbilitySlot | ExtraActionRow | boolean> = {
            abilityBar: null,
            extraActionBar: null,
            nulledTicks: false,
            stalledAbilities: null
        };
        for (const key of Object.keys(fills) as BarKey[]) {
            const fill = fills[key];
            const arr = rotationStore[key] as unknown[];
            const removed = [...arr.slice(0, pos), ...arr.slice(pos + count)];
            (rotationStore as Record<BarKey, unknown>)[key] = [
                ...removed,
                ...Array(BAR_SIZE - removed.length).fill(fill)
            ];
        }
    },

    // Import rotation from data
    async importRotation(
        data: { data?: RotationData } | RotationData,
        onSuccess: MessageCallback,
        onError: MessageCallback,
        refreshUICallback?: () => void
    ) {
        try {
            // Handle both old format (just data) and new format (with metadata)
            const rotationData = ('data' in data && data.data) ? data.data : data as RotationData;

            rotationStore.abilityBar = rotationData.a.map(a => a || null);
            rotationStore.extraActionBar = rotationData.e.map(row =>
                row.map(a => (a ? (normalizeLegacy(a, gearSwaps, allExtraActions) || a) : null))
            );
            rotationStore.nulledTicks = rotationData.n;
            rotationStore.stalledAbilities = rotationData.t.map(a => a || null);

            // Restore settings if present
            if (rotationData.s) {
                restoreSettings(rotationData.s);
            }

            // Import and call the damage calculation function
            const { calculateTotalDamageNew } = await import('$lib/utils/rotationEventHandlers.js');
            calculateTotalDamageNew();

            // Refresh UI if callback provided (updates row gap, etc.)
            if (refreshUICallback) {
                refreshUICallback();
            }

            onSuccess('Rotation imported successfully!');
        } catch (e) {
            onError('Failed to import rotation. The file might be corrupted or in an invalid format.');
        }
    },

    // Export rotation to a JSON file download
    exportToFile(name: string, onSuccess: MessageCallback, onError: MessageCallback) {
        try {
            const exportData = {
                name: name.trim(),
                timestamp: Date.now(),
                data: this.getCurrentRotationData()
            };
            const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.trim().replace(/\s+/g, '_')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            onSuccess(`Rotation "${name.trim()}" exported to file!`);
        } catch (e) {
            onError('Failed to export rotation.');
        }
    },

    // Import rotation from a JSON file
    importFromFile(onSuccess: MessageCallback, onError: MessageCallback, refreshUICallback?: () => void) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                await this.importRotation(data, onSuccess, onError, refreshUICallback);
            } catch (err) {
                onError('Failed to read file. Make sure it is a valid rotation JSON.');
            }
        };
        input.click();
    },

    // Export rotation as a base64 string to clipboard
    exportToString(onSuccess: MessageCallback, onError: MessageCallback) {
        try {
            const exportData = {
                data: this.getCurrentRotationData()
            };
            const str = btoa(JSON.stringify(exportData));
            navigator.clipboard.writeText(str);
            onSuccess('Rotation copied to clipboard!');
        } catch (e) {
            onError('Failed to copy rotation to clipboard.');
        }
    },

    // Import rotation from a base64 string
    async importFromString(
        importStr: string,
        onSuccess: MessageCallback,
        onError: MessageCallback,
        refreshUICallback?: () => void
    ) {
        try {
            const data = JSON.parse(atob(importStr.trim()));
            await this.importRotation(data, onSuccess, onError, refreshUICallback);
        } catch (e) {
            onError('Invalid rotation string. Make sure you pasted the full string.');
        }
    },

    // Update damage calculations
    updateDamageCalculations(
        calculateTotalDamage: (barSize: number) => DamageCalcResult,
        calculateGaussianParameters: (stats: DistributionStat[]) => { mean: number; stdDev: number }
    ) {
        const dmgResult = calculateTotalDamage(BAR_SIZE);
        rotationStore.totalDamage = dmgResult.regularDamage;
        rotationStore.poisonDamage = dmgResult.poisonDamage;
        rotationStore.familiarDamage = dmgResult.familiarDamage;
        rotationStore.dreadnipDamage = dmgResult.dreadnipDamage || 0;
        rotationStore.conjureDamage = dmgResult.conjureDamage || 0;
        rotationStore.distributionStats = dmgResult.distributionStats;
        rotationStore.poisonPerTick = dmgResult.poisonPerTick || [];
        rotationStore.familiarPerTick = dmgResult.familiarPerTick || [];
        rotationStore.familiarVariancePerTick = dmgResult.familiarVariancePerTick || [];
        rotationStore.dreadnipPerTick = dmgResult.dreadnipPerTick || [];
        rotationStore.dreadnipVariancePerTick = dmgResult.dreadnipVariancePerTick || [];
        rotationStore.conjurePerTick = dmgResult.conjurePerTick || [];
        rotationStore.conjureVariancePerTick = dmgResult.conjureVariancePerTick || [];
        rotationStore.phaseTransitions = dmgResult.phaseTransitions || [];

        // Calculate Gaussian parameters for more accurate damage modeling
        calculateGaussianParameters(rotationStore.distributionStats);
    }
};

// Initialize saved rotations on module load
rotationActions.loadSavedRotations();
