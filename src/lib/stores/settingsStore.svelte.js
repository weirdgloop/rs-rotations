import { settingsConfig } from '$lib/calc/settings_rb';
import { SETTINGS } from '$lib/calc/settings_rb';
import { coerceEquipmentValue, migrateEquipmentSettings } from '$lib/data/equipment';

// Settings store
export const settingsStore = $state({
    initialized: false,
    settings: {}
});

// Initialize settings
export function initializeSettings() {
    if (settingsStore.initialized) return;

    let storedSettings = {};
    if (typeof localStorage !== 'undefined') {
        storedSettings = JSON.parse(localStorage.getItem('rotation_settings')) || {};
    }

    settingsStore.settings =
        Object.fromEntries(
            Object.entries(settingsConfig).map(([key, value]) => [
                key,
                {
                    ...value,
                    key,
                    value: coerceEquipmentValue(storedSettings[key]?.value ?? value.default?.rotation ?? value.default, key)
                }
            ])
        );
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
    updateSetting(key, value) {
        if (!settingsStore.initialized) return;
        if (settingsStore.settings[key]) {
            settingsStore.settings[key].value = value;
        }
    },

    // Get a setting value
    getSetting(key) {
        if (!settingsStore.initialized) return null;
        return settingsStore.settings[key]?.value;
    },

    // Get all settings
    getAllSettings() {
        if (!settingsStore.initialized) return {};
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
        );
        migrateEquipmentSettings(settingsStore.settings);
    }
};
