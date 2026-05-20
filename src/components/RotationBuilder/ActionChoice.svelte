<script>
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { getStyleColor } from '$lib/utils/colors';
    import { getItemsForSlot } from '$lib/calc/rotation_builder/gear-registry';
    import { GearSlots } from '$lib/calc/rotation_builder/gear';
    import { offGcdAbilities, prayers, spells, consumables } from '$lib/special/abilities';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import { PERKABLE_SLOTS, formatPerkAbbrev } from '$lib/data/perks';
    import ActionIcon from '$components/UI/ActionIcon.svelte';
    import { settingsStore } from '$lib/stores/settingsStore.svelte.js';

    export let handleAbilityClick;
    export let handleDragStart;
    export let showOnly = 'all'; // 'all', 'gear', 'actions'
    export let style = 'ranged';

    $: styleColor = getStyleColor(style);
    $: gearFilterSetting = settingsStore.settings?.[SETTINGS.GEAR_FILTER]?.value ?? 'popular';

    const gearStyleMap = {
        ranged: 'ranged', magic: 'magic', melee: 'melee', necro: 'necromancy',
    };

    const iconSize = "md";

    // Gear row definitions
    const gearRows = [
        { label: 'W', slots: [GearSlots.MAINHAND, GearSlots.OFFHAND] },
        { label: 'A', slots: [GearSlots.AMMO, GearSlots.POCKET] },
        { label: 'J', slots: [GearSlots.RING, GearSlots.NECKLACE, GearSlots.CAPE] },
        { label: 'E', slots: [GearSlots.HELMET, GearSlots.BODY, GearSlots.LEGS, GearSlots.GLOVES, GearSlots.BOOTS] },
    ];

    function getGearRowItems(slots) {
        const gearStyle = gearStyleMap[style] ?? 'ranged';
        const result = [];
        for (const slot of slots) {
            const items = getItemsForSlot(slot, gearStyle);
            for (const item of items) {
                if (item.value === 'none') continue;
                if (gearFilterSetting === 'owned' && !ownedItemsStore.ownedGear.has(item.value)) continue;
                if (gearFilterSetting === 'popular' && !item.popular && !ownedItemsStore.ownedGear.has(item.value)) continue;

                // For perkable slots, expand into per-instance entries
                const instances = PERKABLE_SLOTS.has(slot) ? ownedItemsStore.ownedGear.get(item.value) : null;
                if (instances && instances.length > 1) {
                    for (let i = 0; i < instances.length; i++) {
                        const perkStr = formatPerkAbbrev(instances[i].perks);
                        const label = instances[i].label || perkStr || `#${i + 1}`;
                        result.push({
                            title: `${item.text} (${label})`,
                            value: item.value,
                            icon: item.icon,
                            slot: item.slot,
                            style: item.style,
                            weaponType: item.weaponType,
                            isGear: true,
                            perks: instances[i].perks,
                            instanceIndex: i,
                        });
                    }
                } else {
                    const perks = instances?.[0]?.perks ?? [];
                    const perkStr = formatPerkAbbrev(perks);
                    result.push({
                        title: perkStr ? `${item.text} (${perkStr})` : item.text,
                        value: item.value,
                        icon: item.icon,
                        slot: item.slot,
                        style: item.style,
                        weaponType: item.weaponType,
                        isGear: true,
                        perks,
                        instanceIndex: 0,
                    });
                }
            }
        }
        return result;
    }

    // Convert ability/prayer/spell/consumable records to a flat item array
    function recordToItems(record) {
        return Object.entries(record).map(([key, val]) => ({
            key,
            title: val.title || key,
            icon: val.icon || '',
        }));
    }

    // Force reactivity on showAllGear, style, and owned items by referencing them
    $: _gearDeps = [gearFilterSetting, style, ownedItemsStore.ownedGear.size];
    $: gearRowData = _gearDeps && gearRows.map(r => ({ label: r.label, items: getGearRowItems(r.slots) })).filter(r => r.items.length > 0);
    $: abilityItems = recordToItems(offGcdAbilities);
    $: prayerItems = recordToItems(prayers);
    $: spellItems = recordToItems(spells);
    $: consumableItems = recordToItems(consumables);
</script>

<div class="action-choice">
    {#if showOnly === 'all' || showOnly === 'gear'}
    <!-- Gear section -->
    <div class="section-header">
        <span class="section-title">Gear</span>
        <span class="text-xs text-gray-500 capitalize">{gearFilterSetting}</span>
    </div>
    {#each gearRowData as row}
        <div class="item-row" style="border-left: 2px solid {styleColor};">
            <span class="row-label">{row.label}</span>
            <div class="item-grid">
                {#each row.items as item}
                    <ActionIcon
                        type="gear"
                        value={item.value}
                        src={item.icon}
                        size={iconSize}
                        borderColor={styleColor}
                        title={item.title}
                        onclick={(e) => handleAbilityClick(e, item)}
                        draggable={true}
                        ondragstart={(e) => handleDragStart(e, item)}
                    />
                {/each}
            </div>
        </div>
    {/each}
    {/if}

    {#if showOnly === 'all' || showOnly === 'actions'}
    <!-- Abilities -->
    {#if abilityItems.length > 0}
        <div class="section-header"><span class="section-title">Abilities</span></div>
        <div class="item-row" style="border-left: 2px solid #8888ff;">
            <span class="row-label">A</span>
            <div class="item-grid">
                {#each abilityItems as item}
                    <ActionIcon
                        type="ability"
                        src={item.icon}
                        size={iconSize}
                        borderColor="#8888ff"
                        title={item.title}
                        onclick={(e) => handleAbilityClick(e, item.key)}
                        draggable={true}
                        ondragstart={(e) => handleDragStart(e, item.key)}
                    />
                {/each}
            </div>
        </div>
    {/if}

    <!-- Prayers -->
    {#if prayerItems.length > 0}
        <div class="item-row" style="border-left: 2px solid #ffdd57;">
            <span class="row-label">P</span>
            <div class="item-grid">
                {#each prayerItems as item}
                    <ActionIcon
                        type="prayer"
                        src={item.icon}
                        size={iconSize}
                        borderColor="#ffdd57"
                        title={item.title}
                        onclick={(e) => handleAbilityClick(e, item.key)}
                        draggable={true}
                        ondragstart={(e) => handleDragStart(e, item.key)}
                    />
                {/each}
            </div>
        </div>
    {/if}

    <!-- Spells -->
    {#if spellItems.length > 0}
        <div class="item-row" style="border-left: 2px solid #44ccff;">
            <span class="row-label">S</span>
            <div class="item-grid">
                {#each spellItems as item}
                    <ActionIcon
                        type="spell"
                        src={item.icon}
                        size={iconSize}
                        borderColor="#44ccff"
                        title={item.title}
                        onclick={(e) => handleAbilityClick(e, item.key)}
                        draggable={true}
                        ondragstart={(e) => handleDragStart(e, item.key)}
                    />
                {/each}
            </div>
        </div>
    {/if}

    <!-- Consumables -->
    {#if consumableItems.length > 0}
        <div class="item-row" style="border-left: 2px solid #ff8844;">
            <span class="row-label">C</span>
            <div class="item-grid">
                {#each consumableItems as item}
                    <ActionIcon
                        type="consumable"
                        src={item.icon}
                        size={iconSize}
                        borderColor="#ff8844"
                        title={item.title}
                        onclick={(e) => handleAbilityClick(e, item.key)}
                        draggable={true}
                        ondragstart={(e) => handleDragStart(e, item.key)}
                    />
                {/each}
            </div>
        </div>
    {/if}
    {/if}
</div>

<style>
    .action-choice {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 4px;
    }

    .section-title {
        font-size: 0.65rem;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .filter-btn {
        font-size: 0.6rem;
        padding: 1px 6px;
        border: 1px solid #555;
        border-radius: 3px;
        background: rgba(255,255,255,0.05);
        color: #aaa;
        cursor: pointer;
    }
    .filter-btn.active {
        border-color: #4ade80;
        color: #4ade80;
    }

    .item-row {
        padding-left: 4px;
        display: flex;
        align-items: flex-start;
        gap: 4px;
    }

    .row-label {
        font-size: 0.55rem;
        color: rgba(255, 255, 255, 0.3);
        line-height: 24px;
        user-select: none;
        flex-shrink: 0;
        width: 8px;
        text-align: center;
    }

    .item-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1px;
    }

</style>
