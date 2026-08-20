<script>
    import { ownedItemsStore, ownedItemsActions } from '$lib/stores/ownedItemsStore.svelte.ts';
    import { getItemsForSlot } from '$lib/calc/rotation_builder/gear-registry';
    import { GearSlots } from '$lib/calc/rotation_builder/gear';
    import { perks, getPerksForSlot } from '$lib/data/perks';
    import { STYLE_COLORS } from '$lib/utils/colors';
    import ActionIcon from '$components/UI/ActionIcon.svelte';
    import { isCustomEquipment } from '$lib/data/equipment';

    let { show = $bindable(false), initialStyle = 'ranged' } = $props();

    let styleTab = $state(initialStyle);

    // Sync styleTab when initialStyle changes (e.g. reopening the modal for a different style)
    $effect(() => { styleTab = initialStyle; });
    let selectedItem = $state(null); // { itemKey, instanceIndex } for editing perks
    let addingSlot = $state(null); // which slot's "add gear" panel is open
    let addFilter = $state('');

    // Perk editor state
    let newPerkKey = $state('');
    let newPerkRank = $state(1);

    // Context menu state
    let menu = $state(null);
    let menuEl = $state(null);

    // "Copy perks to another piece" picker state
    let copyPerks = $state(null); // { slot, perks, sourceKey }
    let copyFilter = $state('');

    const styles = ['melee', 'ranged', 'magic', 'necromancy'];

    // Slots to show per style (weapon slots + armour slots)
    // Only perkable slots (mainhand, offhand, body, legs)
    const slotsByStyle = {
        melee: [
            { slot: GearSlots.MAINHAND, label: 'Main-hand / Two-hand' },
            { slot: GearSlots.OFFHAND, label: 'Off-hand' },
            { slot: GearSlots.BODY, label: 'Body' },
            { slot: GearSlots.LEGS, label: 'Legs' },
        ],
        ranged: [
            { slot: GearSlots.MAINHAND, label: 'Main-hand / Two-hand' },
            { slot: GearSlots.OFFHAND, label: 'Off-hand' },
            { slot: GearSlots.BODY, label: 'Body' },
            { slot: GearSlots.LEGS, label: 'Legs' },
        ],
        magic: [
            { slot: GearSlots.MAINHAND, label: 'Main-hand / Two-hand' },
            { slot: GearSlots.OFFHAND, label: 'Off-hand' },
            { slot: GearSlots.BODY, label: 'Body' },
            { slot: GearSlots.LEGS, label: 'Legs' },
        ],
        necromancy: [
            { slot: GearSlots.MAINHAND, label: 'Main-hand' },
            { slot: GearSlots.OFFHAND, label: 'Off-hand' },
            { slot: GearSlots.BODY, label: 'Body' },
            { slot: GearSlots.LEGS, label: 'Legs' },
        ],
    };

    // Get owned items for a slot+style
    function getOwnedItems(slot, style) {
        return getItemsForSlot(slot, style).filter(i =>
            i.value !== 'none' &&
            !isCustomEquipment(i.value) &&
            ownedItemsStore.ownedGear.has(i.value)
        );
    }

    // Get unowned items for a slot+style (for the "add gear" picker)
    function getUnownedItems(slot, style) {
        return getItemsForSlot(slot, style).filter(i =>
            i.value !== 'none' &&
            !isCustomEquipment(i.value) &&
            !ownedItemsStore.ownedGear.has(i.value)
        );
    }

    // Add an item to owned gear and close the picker
    function addOwnedItem(itemKey) {
        ownedItemsActions.addGearInstance(itemKey, []);
        addingSlot = null;
    }

    // Reactive snapshot of ownedGear — converts the Map into a plain object
    // with deep-copied instances. The store reassigns ownedGear to a new Map
    // on each change, which triggers this $derived to recompute. Template
    // {@const} blocks that call getInstances() read from this derived value,
    // ensuring the UI updates whenever gear is added, removed, or perks change.
    let gearLookup = $derived.by(() => {
        const map = ownedItemsStore.ownedGear;
        /** @type {Record<string, Array<{itemKey: string, perks: Array<{perkKey: string, rank: number}>, label?: string}>>} */
        const obj = {};
        for (const [key, instances] of map) {
            obj[key] = instances.map(inst => ({
                ...inst,
                perks: inst.perks.map(p => ({ ...p }))
            }));
        }
        return obj;
    });

    // Get owned instances for an item
    function getInstances(itemKey) {
        return gearLookup[itemKey] || [];
    }

    // Format perk list for display
    function formatPerks(perkInstances) {
        if (!perkInstances || perkInstances.length === 0) return 'No perks';
        return perkInstances.map(p => {
            const def = perks[p.perkKey];
            if (!def) return p.perkKey;
            // Abbreviate: first letter(s) + rank
            const abbrev = def.name.charAt(0).toUpperCase();
            return `${abbrev}${p.rank}`;
        }).join(' ');
    }

    // Format perk name with rank
    function formatPerkFull(p) {
        const def = perks[p.perkKey];
        return def ? `${def.name} ${p.rank}` : `${p.perkKey} ${p.rank}`;
    }

    // Remove a specific instance
    function removeInstance(itemKey, index) {
        ownedItemsActions.removeGearInstance(itemKey, index);
        if (selectedItem?.itemKey === itemKey && selectedItem?.instanceIndex === index) {
            selectedItem = null;
        }
    }

    // Add a duplicate instance for different perks
    function duplicateInstance(itemKey, sourceIndex) {
        const instances = getInstances(itemKey);
        const source = instances[sourceIndex];
        ownedItemsActions.addGearInstance(itemKey, source ? [...source.perks] : []);
    }

    // Select an instance for perk editing
    function selectInstance(itemKey, instanceIndex) {
        selectedItem = { itemKey, instanceIndex };
        newPerkKey = '';
    }

    // Remove a perk from the selected instance
    function removePerk(perkIndex) {
        if (!selectedItem) return;
        const instances = getInstances(selectedItem.itemKey);
        const instance = instances[selectedItem.instanceIndex];
        if (!instance) return;
        const newPerks = instance.perks.filter((_, i) => i !== perkIndex);
        ownedItemsActions.updateGearInstance(selectedItem.itemKey, selectedItem.instanceIndex, newPerks);
    }

    // Add a perk to the selected instance
    function addPerk() {
        if (!selectedItem || !newPerkKey) return;
        const instances = getInstances(selectedItem.itemKey);
        const instance = instances[selectedItem.instanceIndex];
        if (!instance) return;
        const newPerks = [...instance.perks, { perkKey: newPerkKey, rank: newPerkRank }];
        ownedItemsActions.updateGearInstance(selectedItem.itemKey, selectedItem.instanceIndex, newPerks);
        newPerkKey = '';
        newPerkKey = '';
        newPerkRank = 1;
    }

    // Get available perks for the selected item's slot type
    function getAvailablePerksForSelected() {
        if (!selectedItem) return [];
        // Determine slot type from the item
        const items = getItemsForSlot(GearSlots.MAINHAND, styleTab);
        const isWeapon = items.some(i => i.value === selectedItem.itemKey);
        const slotType = isWeapon ? 'mainhand' : 'body'; // Simplified — weapon vs armour
        return getPerksForSlot(slotType);
    }

    // Get the currently selected instance — reads from gearLookup (deep-copied)
    // so the perk editor panel updates immediately when perks change.
    let selectedInstance = $derived.by(() => {
        if (!selectedItem) return null;
        const instances = gearLookup[selectedItem.itemKey] || [];
        return instances[selectedItem.instanceIndex] ?? null;
    });

    function openMenu(e, itemKey, instanceIndex, slot) {
        e.preventDefault();
        menu = { x: e.clientX, y: e.clientY, itemKey, instanceIndex, slot };
    }
    const closeMenu = () => menu = null;

    // "Copy perks to another piece" flow: holds the perks to clone and the slot to
    // pick a target from, while the picker is open.
    function newGearPieceWithPerks(itemKey, instanceIndex, slot) {
        const source = getInstances(itemKey)[instanceIndex];
        if (!source) return;
        copyPerks = { slot, perks: source.perks.map(p => ({ ...p })), sourceKey: itemKey };
        copyFilter = '';
    }

    function applyPerksToItem(targetKey) {
        if (!copyPerks) return;
        ownedItemsActions.addGearInstance(targetKey, copyPerks.perks);
        copyPerks = null;
    }

    const closeCopyPicker = () => copyPerks = null;

    // Every item in the target slot — owned pieces get an extra variant, unowned
    // ones become owned with these perks.
    let copyTargets = $derived.by(() => {
        if (!copyPerks) return [];
        const q = copyFilter.trim().toLowerCase();
        return getItemsForSlot(copyPerks.slot, styleTab).filter(i =>
            i.value !== 'none' &&
            !isCustomEquipment(i.value) &&
            (!q || i.text.toLowerCase().includes(q))
        );
    });

    // Capture phase: the modal container stops click propagation, so a bubble-phase
    // window listener never sees clicks inside the modal. Capture runs before that.
    // Clicks landing inside the menu are left alone so their own handler can run.
    function handleWindowClick(e) {
        if (!menu) return;
        if (menuEl?.contains(e.target)) return;
        closeMenu();
    }

    function close() {
        show = false;
        selectedItem = null;
        newPerkKey = '';
    }

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) close();
    }

    function handleKeydown(e) {
        if (!show || e.key !== 'Escape') return;
        // Escape unwinds one layer at a time: picker, then context menu, then modal.
        if (copyPerks) { closeCopyPicker(); return; }
        if (menu) { closeMenu(); return; }
        close();
    }
</script>

<svelte:window onclickcapture={handleWindowClick} onresize={closeMenu} onkeydown={handleKeydown} />

{#if show}
    <div
        class="fixed inset-0 bg-black/70 flex justify-center items-start z-[1100] backdrop-blur-sm overflow-y-auto pt-8 pb-8"
        onclick={handleOverlayClick}
        tabindex="-1"
        role="dialog"
    >
        <div class="bg-[#171d21] rounded-lg shadow-2xl w-full max-w-6xl mx-4" onclick={(e) => e.stopPropagation()}>
            <!-- Header -->
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 class="text-lg font-bold text-[#b2dbee] uppercase tracking-wider">Gear Manager</h2>
                <button class="text-gray-400 hover:text-white text-2xl leading-none px-2" onclick={close}>&times;</button>
            </div>

            <!-- Style Tabs -->
            <div class="flex border-b border-gray-700">
                {#each styles as style}
                    <button
                        class="flex-1 py-2 text-sm font-semibold uppercase transition-colors {styleTab === style ? 'text-sky-300 border-b-2 border-sky-300' : 'text-gray-500'}"
                        onclick={() => { styleTab = style; selectedItem = null; }}
                    >
                        {style}
                    </button>
                {/each}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
                <!-- Left: Item List -->
                <div class="border-r border-gray-700 max-h-[70vh] overflow-y-auto grid grid-cols-2 auto-rows-min items-start">
                    {#each slotsByStyle[styleTab] as slotDef}
                        {@const available = getOwnedItems(slotDef.slot, styleTab)}
                        {@const isAdding = addingSlot === slotDef.slot}
                        <div class="border-b border-gray-700/50 odd:border-r">
                            <div class="flex items-center justify-between px-3 py-2 bg-gray-800/50">
                                <h3 class="text-xs uppercase font-semibold text-gray-400">{slotDef.label}</h3>
                                <button
                                    class="text-md px-1.5 py-0.5 rounded transition-colors {isAdding ? 'text-gray-100 hover:text-red-400' : 'text-gray-100 hover:text-green-400'}"
                                    title={isAdding ? 'Close' : 'Add gear'}
                                    onclick={() => { addingSlot = isAdding ? null : slotDef.slot; addFilter = ''; }}
                                >
                                    {isAdding ? '×' : '+'}
                                </button>
                            </div>
                            {#if isAdding}
                                {@const unowned = getUnownedItems(slotDef.slot, styleTab)}
                                <div class="px-3 py-2 bg-gray-900/50 border-b border-gray-700/30">
                                    <input
                                        type="text"
                                        class="w-full mb-2 px-2 py-1 text-xs text-gray-300 bg-gray-800 border border-gray-600 rounded outline-none focus:border-gray-400"
                                        placeholder="Filter..."
                                        bind:value={addFilter}
                                    />
                                    <div class="max-h-40 overflow-y-auto space-y-0.5">
                                        {#each unowned.filter(i => !addFilter || i.text.toLowerCase().includes(addFilter.toLowerCase())) as item}
                                            {@const iconFolder = item.style === 'hybrid' ? 'shared' : ({ melee: 'melee', ranged: 'ranged', magic: 'magic', necromancy: 'necro' }[item.style] ?? styleTab)}
                                            <button
                                                class="flex items-center gap-2 w-full px-2 py-1 rounded text-left hover:bg-gray-700/50 transition-colors"
                                                onclick={() => addOwnedItem(item.value)}
                                            >
                                                <ActionIcon value={item.value} folder={iconFolder} size="sm" bare={true} title={item.text} />
                                                <span class="text-xs text-gray-300">{item.text}</span>
                                            </button>
                                        {:else}
                                            <div class="text-xs text-gray-500 py-1">No more items to add</div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                            {#if available.length === 0 && !isAdding}
                                <div class="px-3 py-2 text-xs text-gray-500">No owned items</div>
                            {/if}
                            {#each available as item}
                                {@const instances = getInstances(item.value)}
                                {@const iconFolder = item.style === 'hybrid' ? 'shared' : ({ melee: 'melee', ranged: 'ranged', magic: 'magic', necromancy: 'necro' }[item.style] ?? styleTab)}
                                <div class="px-3 py-1.5 hover:bg-gray-800/50">
                                    <div class="flex items-center gap-2">
                                        <ActionIcon value={item.value} folder={iconFolder} size="sm" bare={true} title={item.text} />
                                        <span class="text-sm text-white">{item.text}</span>
                                    </div>
                                        {#each instances as instance, idx}
                                            {@const isSelected = selectedItem?.itemKey === item.value && selectedItem?.instanceIndex === idx}
                                            <div
                                                class="flex items-center justify-between ml-3 mt-1 px-2 py-1 rounded cursor-pointer transition-colors {isSelected ? 'bg-sky-900/30' : 'hover:bg-gray-700/50'}"
                                                onclick={() => selectInstance(item.value, idx)}
                                                oncontextmenu={(e) => openMenu(e, item.value, idx, slotDef.slot)}
                                            >
                                                <span class="text-xs text-gray-300">
                                                    {instance.label || `#${idx + 1}`}:
                                                    <span class="text-[#c2ba9e]">{formatPerks(instance.perks)}</span>
                                                </span>
                                                <div class="flex gap-1">
                                                    <button
                                                        class="text-xs text-gray-500 hover:text-blue-400"
                                                        title="Duplicate this variant"
                                                        onclick={(e) => { e.stopPropagation(); duplicateInstance(item.value, idx); }}
                                                    >
                                                        copy
                                                    </button>
                                                    <button
                                                        class="text-xs text-gray-500 hover:text-green-400"
                                                        title="Add a new variant with no perks"
                                                        onclick={(e) => { e.stopPropagation(); ownedItemsActions.addGearInstance(item.value, []); }}
                                                    >
                                                        new
                                                    </button>
                                                    <button
                                                        class="text-xs text-gray-500 hover:text-red-400"
                                                        title="Remove"
                                                        onclick={(e) => { e.stopPropagation(); removeInstance(item.value, idx); }}
                                                    >
                                                        del
                                                    </button>
                                                </div>
                                            </div>
                                        {/each}
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>

                <!-- Right: Perk Editor -->
                <div class="p-4 max-h-[70vh] overflow-y-auto">
                    {#if selectedInstance}
                        <h3 class="text-sm font-semibold text-[#b2dbee] mb-3">
                            Perks: {selectedItem.itemKey}
                            {selectedInstance.label ? `(${selectedInstance.label})` : ''}
                        </h3>

                        <!-- Current perks -->
                        {#if selectedInstance.perks.length === 0}
                            <p class="text-gray-500 text-sm mb-3">No perks assigned.</p>
                        {:else}
                            <div class="space-y-2 mb-4">
                                {#each selectedInstance.perks as perk, idx}
                                    <div class="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                                        <div class="flex items-center gap-2">
                                            {#if perks[perk.perkKey]?.icon}
                                                <img src={perks[perk.perkKey].icon} alt="" class="w-5 h-5" />
                                            {/if}
                                            <span class="text-sm text-white">{formatPerkFull(perk)}</span>
                                        </div>
                                        <button
                                            class="text-gray-500 hover:text-red-400 text-sm"
                                            onclick={() => removePerk(idx)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <!-- Add perk -->
                        {#if newPerkKey}
                            <!-- Rank selector for selected perk -->
                            <div class="bg-gray-800 rounded p-3 space-y-2">
                                <div class="flex items-center gap-2">
                                    <img src={perks[newPerkKey].icon} alt="" class="w-5 h-5" />
                                    <span class="text-sm text-white">{perks[newPerkKey].name}</span>
                                </div>
                                {#if perks[newPerkKey].maxRank > 1}
                                    <div class="flex items-center gap-2">
                                        <label class="text-xs text-gray-400">Rank:</label>
                                        <input
                                            type="number"
                                            class="w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm"
                                            bind:value={newPerkRank}
                                            min="1"
                                            max={perks[newPerkKey].maxRank}
                                        />
                                    </div>
                                {/if}
                                <div class="flex gap-2">
                                    <button
                                        class="text-xs bg-sky-800 text-sky-200 hover:bg-sky-700 px-3 py-1 rounded"
                                        onclick={addPerk}
                                    >
                                        Add
                                    </button>
                                    <button
                                        class="text-xs text-gray-400 hover:text-white px-3 py-1"
                                        onclick={() => { newPerkKey = ''; }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <!-- Perk picker buttons -->
                            <div class="flex gap-1 flex-wrap">
                                {#each Object.entries(perks) as [key, def]}
                                    <ActionIcon
                                        type="perk"
                                        src={def.icon}
                                        size="sm"
                                        borderColor={STYLE_COLORS.perks}
                                        title={def.name}
                                        onclick={() => { newPerkKey = key; newPerkRank = def.maxRank; }}
                                    />
                                {/each}
                            </div>
                        {/if}
                    {:else}
                        <div class="flex items-center justify-center h-full text-gray-500 text-sm">
                            Select a gear instance to edit its perks
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- Context menu: rendered once, outside the overlay so it isn't clipped by the
         list's overflow-y-auto and doesn't trip handleOverlayClick. -->
    {#if menu}
        {@const instances = getInstances(menu.itemKey)}
        <div
            bind:this={menuEl}
            class="fixed z-[1200] bg-[#171d21] border border-gray-700 rounded shadow-lg py-1 min-w-32"
            style="left: {menu.x}px; top: {menu.y}px"
            oncontextmenu={(e) => e.preventDefault()}
        >
            <div class="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-700/50 mb-1">
                {instances[menu.instanceIndex]?.label || `#${menu.instanceIndex + 1}`}
            </div>
            <button
                class="block w-full px-3 py-1 text-xs text-left text-gray-300 hover:bg-gray-700 disabled:text-gray-600 disabled:hover:bg-transparent"
                disabled={!instances[menu.instanceIndex]?.perks.length}
                title={instances[menu.instanceIndex]?.perks.length
                    ? 'Pick another piece in this slot to give it these perks'
                    : 'This variant has no perks to copy'}
                onclick={() => { newGearPieceWithPerks(menu.itemKey, menu.instanceIndex, menu.slot); closeMenu(); }}
            >
                Copy perks to another piece…
            </button>
            <button
                class="block w-full px-3 py-1 text-xs text-left text-gray-300 hover:bg-gray-700"
                onclick={() => { duplicateInstance(menu.itemKey, menu.instanceIndex); closeMenu(); }}
            >
                Copy
            </button>
            <button
                class="block w-full px-3 py-1 text-xs text-left text-gray-300 hover:bg-gray-700"
                onclick={() => { ownedItemsActions.addGearInstance(menu.itemKey, []); closeMenu(); }}
            >
                New
            </button>
            <button
                class="block w-full px-3 py-1 text-xs text-left text-red-400 hover:bg-gray-700"
                onclick={() => { removeInstance(menu.itemKey, menu.instanceIndex); closeMenu(); }}
            >
                Delete
            </button>
        </div>
    {/if}

    <!-- Target picker for "copy perks to another piece" -->
    {#if copyPerks}
        <div
            class="fixed inset-0 bg-black/60 flex justify-center items-start z-[1300] pt-24"
            onclick={(e) => { if (e.target === e.currentTarget) closeCopyPicker(); }}
            role="dialog"
            tabindex="-1"
        >
            <div class="bg-[#171d21] border border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4">
                <div class="px-4 py-3 border-b border-gray-700">
                    <h3 class="text-sm font-semibold text-[#b2dbee]">Copy perks to another piece</h3>
                    <p class="text-xs text-gray-400 mt-1">
                        Giving <span class="text-[#c2ba9e]">{formatPerks(copyPerks.perks)}</span>
                        to a <span class="text-gray-300">{copyPerks.slot}</span> piece
                    </p>
                </div>
                <div class="p-3">
                    <!-- svelte-ignore a11y_autofocus -->
                    <input
                        type="text"
                        autofocus
                        class="w-full mb-2 px-2 py-1 text-xs text-gray-300 bg-gray-800 border border-gray-600 rounded outline-none focus:border-gray-400"
                        placeholder="Search pieces…"
                        bind:value={copyFilter}
                    />
                    <div class="max-h-64 overflow-y-auto space-y-0.5">
                        {#each copyTargets as target}
                            {@const iconFolder = target.style === 'hybrid' ? 'shared' : ({ melee: 'melee', ranged: 'ranged', magic: 'magic', necromancy: 'necro' }[target.style] ?? styleTab)}
                            {@const owned = getInstances(target.value).length}
                            <button
                                class="flex items-center gap-2 w-full px-2 py-1 rounded text-left hover:bg-gray-700/50 transition-colors"
                                onclick={() => applyPerksToItem(target.value)}
                            >
                                <ActionIcon value={target.value} folder={iconFolder} size="sm" bare={true} title={target.text} />
                                <span class="text-xs text-gray-300 flex-1">{target.text}</span>
                                {#if owned}
                                    <span class="text-[10px] text-gray-500">{owned} owned</span>
                                {/if}
                            </button>
                        {:else}
                            <div class="text-xs text-gray-500 py-2 text-center">No matching pieces</div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/if}
