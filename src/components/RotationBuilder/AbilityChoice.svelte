<script>
    export let abilities = {}; // Default to an empty object if no data is provided
    export let handleAbilityClick;
    export let handleDragStart;
    export let style = 'ranged';
    export let filter = 'popular'; // 'popular' | 'owned' | 'all'

    import { getStyleColor } from '$lib/utils/colors';
    import { groupAbilitiesByType } from '$lib/utils/abilityClassifier';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import { getAbilityClassification, getAbilityType } from '$lib/types/AbilityTypes';

    $: grouped = groupAbilitiesByType(abilities);
    $: styleColor = getStyleColor(style);
</script>

<div class="ability-clusters">
    {#each grouped as group}
        {@const filteredAbilities = group.abilities.filter(([key, abil]) =>
            !["proc", "perk"].includes(getAbilityType(abil)) &&
            (abil.title && abil.icon) && (
            filter === 'all' ||
            (filter === 'owned' && ownedItemsStore.ownedAbilities.has(key)) ||
            (filter === 'popular' && abil.common !== false))
        )}
        {#if filteredAbilities.length > 0}
            <div class="ability-cluster" style="border-color: {styleColor};">
                <span class="cluster-label">{group.label}</span>
                <div class="cluster-icons">
                    {#each filteredAbilities as [key, ability]}
                        <div
                            role="button"
                            tabindex="0"
                            aria-label={ability.title}
                            on:click={(e) => handleAbilityClick(e, key)}
                            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAbilityClick(e, key); }}
                            class="ability-slot"
                        >
                        {#if ability.icon}
                            <img
                                src={ability.icon}
                                alt={ability.title || key}
                                draggable="true"
                                on:dragstart={(e) => handleDragStart(e, key)}
                                title={ability.title || key}
                                style="width: 30px; height: 30px; object-fit: contain; background-color: #333; border: 1px solid {styleColor};"
                            />
                        {:else}
                            <div
                                style="width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; background-color: #444; color: white; font-size: 10px; border: 1px solid {styleColor};"
                                draggable="true"
                                on:dragstart={(e) => handleDragStart(e, key)}
                                title={ability.title || key}
                            >
                                {key.substring(0, 3)}
                            </div>
                        {/if}
                    </div>
                    {/each}
                </div>
            </div>
        {/if}
    {/each}
</div>

<style>
    .ability-clusters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: flex-start;
    }

    .ability-cluster {
        display: flex;
        flex-direction: column;
        border-left: 2px solid;
        padding-left: 4px;
    }

    .cluster-label {
        font-size: 0.5rem;
        color: rgba(255, 255, 255, 0.4);
        user-select: none;
        letter-spacing: 0.05em;
        line-height: 1;
        margin-bottom: 2px;
    }

    .cluster-icons {
        display: flex;
        flex-wrap: wrap;
        gap: 1px;
        max-width: 160px;
    }

    .ability-slot {
        display: inline-block;
        overflow: hidden;
        width: 30px;
        height: 30px;
    }
</style>
