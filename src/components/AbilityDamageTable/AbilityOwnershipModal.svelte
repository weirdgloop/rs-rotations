<script>
    import { abils } from '$lib/data/abilities';
    import { ownedItemsStore, ownedItemsActions } from '$lib/stores/ownedItemsStore.svelte.ts';
    import { getAbilityType } from '$lib/types/AbilityTypes';

    let { show = $bindable(false), style = 'magic' } = $props();

    let filter = $state('');

    let entries = $derived.by(() => {
        const result = [];
        const f = filter.toLowerCase();
        for (const [key, abil] of Object.entries(abils)) {
            if (!abil.icon || !abil.title) continue;
            if (abil.mainStyle !== style) continue;
            if (["proc", "perk"].includes(getAbilityType(abil))) continue;
            if (f && !abil.title.toLowerCase().includes(f) && !key.toLowerCase().includes(f)) continue;
            result.push({ key, title: abil.title, icon: abil.icon });
        }
        return result;
    });

    function selectAll() {
        for (const entry of entries) {
            ownedItemsStore.ownedAbilities.add(entry.key);
        }
        ownedItemsStore.ownedAbilities = new Set(ownedItemsStore.ownedAbilities);
        ownedItemsActions.saveOwned();
    }

    function deselectAll() {
        for (const entry of entries) {
            ownedItemsStore.ownedAbilities.delete(entry.key);
        }
        ownedItemsStore.ownedAbilities = new Set(ownedItemsStore.ownedAbilities);
        ownedItemsActions.saveOwned();
    }

    function close() { show = false; }
    function handleOverlayClick(e) { if (e.target === e.currentTarget) close(); }
    function handleKeydown(e) { if (e.key === 'Escape') close(); }
</script>

{#if show}
    <div
        class="modal-overlay"
        onclick={handleOverlayClick}
        onkeydown={handleKeydown}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Owned Abilities</h2>
                <button class="close-btn" onclick={close}>x</button>
            </div>

            <div class="search-row">
                <input
                    type="text"
                    class="search-input"
                    placeholder="Filter abilities..."
                    bind:value={filter}
                />
                <button class="action-btn select-btn" onclick={selectAll}>Own All</button>
                <button class="action-btn deselect-btn" onclick={deselectAll}>Unown All</button>
            </div>

            <div class="ability-list">
                {#each entries as entry (entry.key)}
                    <label class="ability-row">
                        <input
                            type="checkbox"
                            class="owned-checkbox"
                            checked={ownedItemsStore.ownedAbilities.has(entry.key)}
                            onchange={() => ownedItemsActions.toggleAbility(entry.key)}
                        />
                        <img
                            src={entry.icon}
                            alt={entry.title}
                            class="ability-icon"
                            width="24"
                            height="24"
                        />
                        <span class="ability-name">{entry.title}</span>
                    </label>
                {/each}
                {#if entries.length === 0}
                    <div class="empty-msg">No abilities match your filter.</div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }
    .modal-content {
        background: #171d21;
        border-left: 4px solid #c2ba9e;
        border-radius: 8px;
        padding: 1.25rem;
        width: 380px;
        max-width: 95vw;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    .modal-title {
        font-family: Kumbh Sans, sans-serif;
        font-size: 1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #b2dbee;
        margin: 0;
    }
    .close-btn {
        background: none;
        border: none;
        color: #c2ba9e;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }
    .close-btn:hover { background: rgba(194, 186, 158, 0.1); color: #fff; }

    .search-row {
        display: flex;
        gap: 6px;
        margin-bottom: 0.5rem;
    }
    .search-input {
        flex: 1;
        padding: 5px 8px;
        font-size: 0.8rem;
        color: #ccc;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #444;
        border-radius: 4px;
        outline: none;
    }
    .search-input:focus { border-color: #c2ba9e; }

    .action-btn {
        padding: 5px 10px;
        font-size: 0.7rem;
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
    }
    .select-btn {
        color: #4ade80;
        background: rgba(74, 222, 128, 0.08);
        border: 1px solid rgba(74, 222, 128, 0.3);
    }
    .select-btn:hover { background: rgba(74, 222, 128, 0.15); }
    .deselect-btn {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .deselect-btn:hover { background: rgba(245, 158, 11, 0.15); }

    .ability-list {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
    .ability-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 4px;
        border-radius: 3px;
        cursor: pointer;
    }
    .ability-row:hover { background: rgba(255, 255, 255, 0.03); }

    .owned-checkbox {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        cursor: pointer;
        accent-color: #4ade80;
    }
    .ability-icon {
        flex-shrink: 0;
        border-radius: 3px;
    }
    .ability-name {
        flex: 1;
        font-size: 0.8rem;
        color: #ccc;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .empty-msg {
        padding: 1rem;
        text-align: center;
        color: #666;
        font-size: 0.8rem;
    }
</style>
