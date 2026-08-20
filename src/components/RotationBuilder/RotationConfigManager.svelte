<script>
    import { rotationStore, rotationActions } from '$lib/stores/rotationStore.svelte.ts';
    import { notificationStore, notifActions } from '$lib/stores/notificationStore.svelte.ts';
    import { uiStore, uiActions } from '$lib/stores/uiStore.svelte.ts';
    import { exportToPvme } from '$lib/utils/pvmeExport.js';

    let { refreshUI, onOpenKeybinds = () => {}, onShowKeypresses = () => {} } = $props();

    function handleSaveRotation() {
        notifActions.showInputPrompt(
            'Save Rotation',
            'Enter a name for your rotation:',
            'Rotation name...',
            (rotationName) => {
                const result = rotationActions.saveRotation(
                    rotationName,
                    (message) => notifActions.showNotification('Success!', message, 'success'),
                    (message) => notifActions.showNotification('Failed', message, 'warning')
                );

                if (result && result.needsConfirmation) {
                    notifActions.showConfirmation(
                        'Overwrite Rotation?',
                        `A rotation named "${rotationName.trim()}" already exists. Do you want to overwrite it?`,
                        () => {
                            rotationActions.overwriteRotation(
                                result.config,
                                result.existingIndex,
                                (message) => notifActions.showNotification('Success!', message, 'success'),
                                (message) => notifActions.showNotification('Failed', message, 'error')
                            );
                        }
                    );
                }
            }
        );
    }

    function handleLoadRotation(configId) {
        rotationActions.loadRotation(
            configId,
            (message) => notifActions.showNotification('Success!', message, 'success'),
            (message) => notifActions.showNotification('Failed', message, 'error'),
            refreshUI
        );
    }

    function handleDeleteRotation(configId, configName) {
        notifActions.showConfirmation(
            'Delete Rotation?',
            `Are you sure you want to delete "${configName}"? This action cannot be undone.`,
            () => {
                rotationActions.deleteRotation(
                    configId,
                    (message) => notifActions.showNotification('Success!', message, 'success'),
                    (message) => notifActions.showNotification('Failed', message, 'error')
                );
            }
        );
    }

    function handleUpdateRotation(configId, configName) {
        rotationActions.overwriteRotation(
            rotationActions.buildCurrentConfig(configName, configId),
            rotationStore.savedRotations.findIndex(c => c.id === configId),
            (message) => notifActions.showNotification('Success!', message, 'success'),
            (message) => notifActions.showNotification('Failed', message, 'error')
        );
    }

    function exportToFile() {
        notifActions.showInputPrompt(
            'Export Rotation', 'Enter a name for your rotation file:', 'Rotation name...',
            (rotationName) => {
                rotationActions.exportToFile(
                    rotationName,
                    (message) => notifActions.showNotification('Success!', message, 'success'),
                    (message) => notifActions.showNotification('Failed', message, 'error')
                );
            }
        );
    }

    function importFromFile() {
        rotationActions.importFromFile(
            (message) => notifActions.showNotification('Success!', message, 'success'),
            (message) => notifActions.showNotification('Failed', message, 'error'),
            refreshUI
        );
    }

    function exportToString() {
        rotationActions.exportToString(
            (message) => notifActions.showNotification('Success!', message, 'success'),
            (message) => notifActions.showNotification('Failed', message, 'error')
        );
    }

    function importFromString() {
        notifActions.showInputPrompt(
            'Import Rotation String',
            'Paste your rotation string:',
            'Paste rotation string here...',
            (importStr) => {
                rotationActions.importFromString(
                    importStr,
                    (message) => notifActions.showNotification('Success!', message, 'success'),
                    (message) => notifActions.showNotification('Failed', message, 'error'),
                    refreshUI
                );
            }
        );
    }

    function copyDiscordFormat() {
        try {
            const text = exportToPvme(rotationStore.abilityBar);
            navigator.clipboard.writeText(text);
            notifActions.showNotification('Success!', 'Rotation copied in Discord format!', 'success');
        } catch (e) {
            notifActions.showNotification('Failed', 'Could not copy to clipboard.', 'error');
        }
    }

    const VISIBLE_LIMIT = 10;
    let showAllRotations = $state(false);
</script>

<div class="space-y-4 mt-4">
    <div class="config-section">
        <button class="config-header"
            onclick={() => uiActions.toggleConfigSection()}
        >
            <span class="config-title">Save & Load Rotations</span>
            <svg
                class="collapse-icon"
                class:rotated={!uiStore.configSectionCollapsed}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
            >
                <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
        </button>

        <!-- Action buttons always visible -->
        <div class="config-content">
            <div class="action-row">
                <button class="action-btn primary" onclick={handleSaveRotation} title="Save current rotation">
                    Save
                </button>
                <button class="action-btn" onclick={exportToFile} title="Export to file">
                    Export
                </button>
                <button class="action-btn" onclick={importFromFile} title="Import from file">
                    Import
                </button>
                <button class="action-btn" onclick={importFromString} title="Import rotation string">
                    Paste
                </button>
                <button class="action-btn" onclick={exportToString} title="Copy rotation to clipboard">
                    Copy
                </button>
                <button class="action-btn" onclick={copyDiscordFormat} title="Copy rotation as Discord text (pvme format)">
                    Discord
                </button>
                <button class="action-btn" onclick={onOpenKeybinds} title="Manage owned actions and keybinds">
                    Actions
                </button>
                <button class="action-btn" onclick={onShowKeypresses} title="Show keypress sequence for rotation">
                    Keys
                </button>
            </div>
        </div>

        {#if !uiStore.configSectionCollapsed}
            <!-- Saved rotations list -->
            {#if rotationStore.savedRotations.length > 0}
                {@const visibleRotations = showAllRotations
                    ? rotationStore.savedRotations
                    : rotationStore.savedRotations.slice(0, VISIBLE_LIMIT)}
                {@const hiddenCount = rotationStore.savedRotations.length - VISIBLE_LIMIT}
                <div class="saved-list">
                    <div class="saved-grid">
                        {#each visibleRotations as config}
                            <div class="saved-item"
                                class:active={rotationStore.activeRotationId === config.id}
                            >
                                <button
                                    class="saved-name"
                                    onclick={() => handleLoadRotation(config.id)}
                                    title="Load {config.name}"
                                >
                                    {config.name}
                                </button>
                                <div class="saved-actions">
                                    {#if rotationStore.activeRotationId === config.id}
                                        <button
                                            class="icon-btn update"
                                            onclick={() => handleUpdateRotation(config.id, config.name)}
                                            title="Update {config.name} with current rotation"
                                        >↑</button>
                                    {/if}
                                    <button
                                        class="icon-btn delete"
                                        onclick={() => handleDeleteRotation(config.id, config.name)}
                                        title="Delete {config.name}"
                                    >×</button>
                                </div>
                            </div>
                        {/each}
                    </div>
                    {#if hiddenCount > 0 && !showAllRotations}
                        <button class="show-more" onclick={() => showAllRotations = true}>
                            +{hiddenCount} more
                        </button>
                    {:else if showAllRotations && hiddenCount > 0}
                        <button class="show-more" onclick={() => showAllRotations = false}>
                            Show less
                        </button>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>

<style>
    .config-section {
        border: 1px solid #444;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.2);
        overflow: hidden;
    }

    .config-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0.4rem 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #fff;
    }

    .config-header:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .config-title {
        font-size: 0.95rem;
        font-weight: 600;
    }

    .collapse-icon {
        color: #888;
        transition: transform 0.2s ease;
    }

    .collapse-icon.rotated {
        transform: rotate(180deg);
    }

    .config-content {
        padding: 0 0.75rem 0.5rem;
    }

    .action-row {
        display: flex;
        gap: 4px;
    }

    .action-btn {
        flex: 1;
        padding: 4px 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: #aaa;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #444;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
    }

    .action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ddd;
        border-color: #666;
    }

    .action-btn.primary {
        color: #c2ba9e;
        border-color: #c2ba9e;
        font-weight: 600;
    }

    .action-btn.primary:hover {
        background: rgba(194, 186, 158, 0.15);
    }

    .saved-list {
        padding: 0 0.75rem 0.75rem;
    }

    .saved-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px;
    }

    .saved-item {
        display: flex;
        align-items: center;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid transparent;
        transition: all 0.15s;
    }

    .saved-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .saved-item.active {
        border-color: #c2ba9e;
        background: rgba(194, 186, 158, 0.08);
    }

    .saved-name {
        flex: 1;
        text-align: left;
        padding: 5px 8px;
        font-size: 0.8rem;
        color: #ccc;
        background: none;
        border: none;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .saved-item.active .saved-name {
        color: #c2ba9e;
        font-weight: 500;
    }

    .saved-name:hover {
        color: #fff;
    }

    .saved-actions {
        display: flex;
        gap: 2px;
        padding-right: 4px;
        flex-shrink: 0;
    }

    .icon-btn {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        color: #777;
        background: none;
        border: 1px solid transparent;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.15s;
    }

    .icon-btn.delete:hover {
        color: #ff6b6b;
        background: rgba(255, 0, 0, 0.1);
        border-color: rgba(255, 0, 0, 0.3);
    }

    .icon-btn.update:hover {
        color: #6bff6b;
        background: rgba(0, 255, 0, 0.1);
        border-color: rgba(0, 255, 0, 0.3);
    }

    .show-more {
        padding: 3px 8px;
        margin-top: 2px;
        font-size: 0.7rem;
        color: #777;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
    }

    .show-more:hover {
        color: #aaa;
    }
</style>
