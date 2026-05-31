// Import stores and actions
import { rotationStore, rotationActions } from './rotationStore.svelte.js';
import { uiStore, uiActions } from './uiStore.svelte.js';
import { notificationStore, notifActions } from './notificationStore.svelte.js';
import { settingsStore, settingsActions } from './settingsStore.svelte.js';

// Export all stores and actions
export { rotationStore, rotationActions };
export { uiStore, uiActions };
export { notificationStore, notifActions as notificationActions };
export { settingsStore, settingsActions };

// Re-export commonly used actions with shorter names
export const {
    showNotification,
    showConfirmation,
    showInputPrompt,
    showSuccess,
    showError,
    showWarning,
    showInfo
} = notifActions;

export const {
    setActiveTab,
    setActiveTool,
    toggleSettingsPanel,
    handleKeypress
} = uiActions;

export const {
    saveRotation,
    loadRotation,
    deleteRotation,
    clearRotation,
    importRotation,
    updateDamageCalculations
} = rotationActions;