// Notification store
export const notificationStore = $state({
    // Simple notification
    notification: {
        show: false,
        title: '',
        message: '',
        type: 'info'
    },

    // Confirmation dialog
    confirmationDialog: {
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null
    },

    // Input prompt
    inputPrompt: {
        show: false,
        title: '',
        message: '',
        placeholder: '',
        value: '',
        onSubmit: null,
        onCancel: null
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
    showNotification(title, message, type = 'info') {
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
    showConfirmation(title, message, onConfirm, onCancel = null) {
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
    showInputPrompt(title, message, placeholder, onSubmit, onCancel = null) {
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

    setSaveConfigName(name) {
        notificationStore.saveConfigName = name;
    },

    setSelectedConfigId(id) {
        notificationStore.selectedConfigId = id;
    },

    // Helper methods for common patterns
    showSuccess(title, message) {
        this.showNotification(title, message, 'success');
    },

    showError(title, message) {
        this.showNotification(title, message, 'error');
    },

    showWarning(title, message) {
        this.showNotification(title, message, 'warning');
    },

    showInfo(title, message) {
        this.showNotification(title, message, 'info');
    }
};