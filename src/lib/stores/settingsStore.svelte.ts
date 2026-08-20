import { settingsConfig, SETTINGS } from '$lib/calc/settings_rb';
import { coerceEquipmentValue, migrateEquipmentSettings } from '$lib/data/equipment';

type SettingConfigEntry = (typeof settingsConfig)[keyof typeof settingsConfig];

export type SettingEntry = SettingConfigEntry & {
    key: string;
    value: unknown;
};

export type SettingsMap = Record<string, SettingEntry>;

// Settings store
export const settingsStore = $state({
    initialized: false,
    settings: {} as SettingsMap
});

// Initialize settings
export function initializeSettings() {
    if (settingsStore.initialized) return;

    let storedSettings: Record<string, { value?: unknown }> = {};
    if (typeof localStorage !== 'undefined') {
        storedSettings = JSON.parse(localStorage.getItem('rotation_settings') || '{}') || {};
    }

    settingsStore.settings =
        Object.fromEntries(
            Object.entries(settingsConfig).map(([key, value]) => [
                key,
                {
                    ...value,
                    key,
                    // defaults are heterogeneous; some are `{ rotation, ability }` objects
                    value: coerceEquipmentValue(
                        storedSettings[key]?.value ?? (value.default as any)?.rotation ?? value.default,
                        key
                    )
                }
            ])
        ) as SettingsMap;
    migrateEquipmentSettings(settingsStore.settings);
    settingsStore.settings[SETTINGS.INSTABILITY].value = false;
    settingsStore.settings[SETTINGS.BALANCE_BY_FORCE].value = false;
    settingsStore.settings[SETTINGS.DRACOLICH_INFUSION].value = false;
    settingsStore.settings[SETTINGS.GREATER_DRACOLICH_INFUSION].value = false;
    settingsStore.settings[SETTINGS.ICY_PRECISION].value = 0;
    settingsStore.settings[SETTINGS.NATURAL_INSTINCT].value = false;
    settingsStore.settings[SETTINGS.SMOKE_CLOUD].value = false;
    settingsStore.settings[SETTINGS.CHAIN_MODIFIER].value = SETTINGS.CHAIN_MODIFIER_VALUES.NONE;
    settingsStore.settings[SETTINGS.KERAPACS_WRIST_WRAPS].value = false;

    settingsStore.initialized = true;
}

initializeSettings();

// Settings actions
export const settingsActions = {
    // Update a setting value
    updateSetting(key: string, value: unknown) {
        if (!settingsStore.initialized) return;
        if (settingsStore.settings[key]) {
            settingsStore.settings[key].value = value;
        }
    },

    // Get a setting value
    getSetting(key: string) {
        if (!settingsStore.initialized) return null;
        return settingsStore.settings[key]?.value ?? null;
    },

    // Get all settings
    getAllSettings() {
        if (!settingsStore.initialized) return {} as SettingsMap;
        return settingsStore.settings;
    },

    // Save settings to localStorage
    saveSettings() {
        if (!settingsStore.initialized || typeof localStorage === 'undefined') return;
        try {
            const toSave = Object.fromEntries(
                Object.entries(settingsStore.settings).map(([key, val]) => [key, { value: val.value }])
            );
            localStorage.setItem('rotation_settings', JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    },

    // Reset all settings to defaults
    resetToDefaults() {
        if (!settingsStore.initialized) return;
        settingsStore.settings = Object.fromEntries(
            Object.entries(settingsConfig).map(([key, value]) => [
                key,
                { ...value, key: key, value: coerceEquipmentValue(value.default, key) }
            ])
        ) as SettingsMap;
        migrateEquipmentSettings(settingsStore.settings);
    }
};
