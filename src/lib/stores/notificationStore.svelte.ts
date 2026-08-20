type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification store
export const notificationStore = $state({
    // Simple notification
    notification: {
        show: false,
        title: '',
        message: '',
        type: 'info' as NotificationType
    },

    // Confirmation dialog
    confirmationDialog: {
        show: false,
        title: '',
        message: '',
        onConfirm: null as (() => void) | null,
        onCancel: null as (() => void) | null
    },

    // Input prompt
    inputPrompt: {
        show: false,
        title: '',
        message: '',
        placeholder: '',
        value: '',
        onSubmit: null as ((value: string) => void) | null,
        onCancel: null as (() => void) | null
    },

    // Legacy modal states (for backward compatibility)
    showSaveDialog: false,
    showLoadDialog: false,
    saveConfigName: '',
    selectedConfigId: ''
});

// Notification actions
export const notifActions = {
    // Simple notification
    showNotification(title: string, message: string, type: NotificationType = 'info') {
        notificationStore.notification = {
            show: true,
            title,
            message,
            type
        };
    },

    hideNotification() {
        notificationStore.notification.show = false;
    },

    // Confirmation dialog
    showConfirmation(
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel: (() => void) | null = null
    ) {
        notificationStore.confirmationDialog = {
            show: true,
            title,
            message,
            onConfirm,
            onCancel
        };
    },

    hideConfirmation() {
        notificationStore.confirmationDialog.show = false;
    },

    // Input prompt
    showInputPrompt(
        title: string,
        message: string,
        placeholder: string,
        onSubmit: (value: string) => void,
        onCancel: (() => void) | null = null
    ) {
        notificationStore.inputPrompt = {
            show: true,
            title,
            message,
            placeholder,
            value: '',
            onSubmit,
            onCancel
        };
    },

    hideInputPrompt() {
        notificationStore.inputPrompt.show = false;
    },

    // Legacy modal management
    showSaveDialog() {
        notificationStore.showSaveDialog = true;
    },

    hideSaveDialog() {
        notificationStore.showSaveDialog = false;
        notificationStore.saveConfigName = '';
    },

    showLoadDialog() {
        notificationStore.showLoadDialog = true;
    },

    hideLoadDialog() {
        notificationStore.showLoadDialog = false;
        notificationStore.selectedConfigId = '';
    },

    setSaveConfigName(name: string) {
        notificationStore.saveConfigName = name;
    },

    setSelectedConfigId(id: string) {
        notificationStore.selectedConfigId = id;
    },

    // Helper methods for common patterns
    showSuccess(title: string, message: string) {
        this.showNotification(title, message, 'success');
    },

    showError(title: string, message: string) {
        this.showNotification(title, message, 'error');
    },

    showWarning(title: string, message: string) {
        this.showNotification(title, message, 'warning');
    },

    showInfo(title: string, message: string) {
        this.showNotification(title, message, 'info');
    }
};
