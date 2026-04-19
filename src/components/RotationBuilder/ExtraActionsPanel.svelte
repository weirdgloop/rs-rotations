<script>
    import { onMount } from 'svelte';
    import ActionChoice from './ActionChoice.svelte';
    import { allExtraActions, gearSwaps } from '$lib/special/abilities';
    import { getSettingsKeyForItem, getItemForValue } from '$lib/calc/rotation_builder/gear-registry';
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { settingsStore, initializeSettings } from '$lib/stores/settingsStore.svelte.js';
    import { rotationStore } from '$lib/stores/rotationStore.svelte.js';
    import { stripVariantSuffix } from '$lib/utils/gearVariants';
    import ActionIcon from '$components/UI/ActionIcon.svelte';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import { perks as perkDefs } from '$lib/data/perks';
    import { bossPresets, getBossPresetWithEnrage } from '$lib/data/bosses/boss_presets';
    import { weapons } from '$lib/data/weapons';
    import { STYLE_COLORS } from '$lib/utils/colors';

    // Initialize settings on component mount
    onMount(async () => {
        await initializeSettings();
    });

    let {
        uiState,
        gameState,
        allAbils,
        handleAbilityClickExtra,
        handleDragStart,
        handleBarRightClick,
        handleDragStartBar,
        extraActions,
        onRemoveAbility = () => {},
        onToggleNull = () => {},
        onRefreshUI = () => {},
        closeExtraActions = () => {},
        setExtraActionsTab = (tab) => {},
    } = $props();

    const EXTRA_BAR_SIZE = 12;
    let tick = $derived(uiState.extraActions.tick);

    // Build gear state at the selected tick by applying gear swaps from tick 0 to tick
    function buildGearState(currentTick) {
        const state = {};
        const settings = settingsStore.settings;
        for (const key of Object.keys(settings)) {
            if (settings[key]?.value !== undefined) {
                state[key] = settings[key].value;
            }
        }
        if (currentTick >= 0 && rotationStore.extraActionBar) {
            for (let t = 0; t <= currentTick; t++) {
                const actions = rotationStore.extraActionBar[t];
                if (!actions) continue;
                for (const action of actions) {
                    if (!action) continue;
                    // New ExtraAction format — has .type and .slot
                    if (action.type === 'gear' && action.slot) {
                        state[action.slot] = action.value;
                        if (action.slot.includes('ammo')) {
                            const styleAmmo = ammoKeys[uiState.activeTab];
                            if (styleAmmo) state[styleAmmo] = action.value;
                        }
                        continue;
                    }
                    // Legacy format fallback
                    const key = typeof action === 'string' ? action : action.title;
                    if (!key) continue;
                    const slot = getSettingsKeyForItem(key) || gearSwaps[key];
                    if (slot) {
                        state[slot] = key;
                        if (slot === SETTINGS.AMMO) {
                            const styleAmmo = ammoKeys[uiState.activeTab];
                            if (styleAmmo) state[styleAmmo] = key;
                        }
                    }
                }
            }
        }
        return state;
    }

    function getGearState() {
        return buildGearState(tick);
    }

    const slotFallbacks = {
        helmet: '/armour_icons/Head_slot.webp',
        body: '/armour_icons/Torso_slot.png',
        legs: '/armour_icons/Legs_slot.png',
        gloves: '/armour_icons/Hands_slot.webp',
        boots: '/armour_icons/Feet_slot.png',
        necklace: '/armour_icons/Neck_slot.png',
        cape: '/armour_icons/Back_slot.png',
        ring: '/armour_icons/Ring_slot.png',
        pocket: '/armour_icons/Pocket_slot.webp',
        ammo: '/armour_icons/Ammo_slot.png',
    };

    const stylePrefix = { ranged: 'ranged', magic: 'magic', melee: 'melee', necro: 'necro' };
    const sharedSlots = [];

    // These slots have inconsistent key prefixes, so map explicitly
    const pocketKeys = {
        ranged: SETTINGS.RANGED_POCKET,
        magic: SETTINGS.MAGIC_POCKET,
        melee: SETTINGS.MELEE_POCKET,
        necro: SETTINGS.NECRO_POCKET,
    };
    const necklaceKeys = {
        ranged: SETTINGS.RANGED_NECKLACE,
        magic: SETTINGS.MAGIC_NECKLACE,
        melee: SETTINGS.MELEE_NECKLACE,
        necro: SETTINGS.NECRO_NECKLACE,
    };
    const capeKeys = {
        ranged: SETTINGS.RANGED_CAPE,
        magic: SETTINGS.MAGIC_CAPE,
        melee: SETTINGS.MELEE_CAPE,
        necro: SETTINGS.NECRO_CAPE,
    };
    const ringKeys = {
        ranged: SETTINGS.RANGED_RING,
        magic: SETTINGS.MAGIC_RING,
        melee: SETTINGS.MELEE_RING,
        necro: SETTINGS.NECRO_RING,
    };

    const ammoKeys = {
        ranged: SETTINGS.RANGED_AMMO_SLOT,
        magic: SETTINGS.MAGIC_AMMO_SLOT,
        melee: SETTINGS.MELEE_AMMO_SLOT,
        necro: SETTINGS.NECRO_AMMO_SLOT,
    };

    function getAmmoIcon() {
        const gs = getGearState();
        // Check per-style ammo slot first, then fall back to old shared 'ammo' key
        const key = ammoKeys[uiState.activeTab];
        const val = (key && gs[key]) || gs[SETTINGS.AMMO];
        if (!val || val === 'none' || val === 'custom') return slotFallbacks.ammo;
        const base = stripVariantSuffix(val);
        return `/gear_icons/ranged/${base}.png`;
    }

    const slotKeyMaps = { pocket: pocketKeys, necklace: necklaceKeys, cape: capeKeys, ring: ringKeys, ammo: ammoKeys };

    function getEquipIcon(slot) {
        let key;
        const keyMap = slotKeyMaps[slot];
        if (keyMap) {
            key = keyMap[uiState.activeTab] ?? slot;
        } else {
            const prefix = sharedSlots.includes(slot) ? '' : (stylePrefix[uiState.activeTab] ?? 'ranged') + ' ';
            key = prefix + slot;
        }
        const val = getGearState()[key];
        if (!val || val === 'none' || val === 'custom' || val === 'custom oh' || val === 'custom th') return slotFallbacks[slot];
        // Use gear registry to resolve the correct icon folder from item's style
        const item = getItemForValue(val);
        let folder = sharedSlots.includes(slot) ? 'shared' : (stylePrefix[uiState.activeTab] ?? 'shared');
        if (item) {
            if (item.style === 'hybrid') folder = 'shared';
            else {
                const map = { melee: 'melee', ranged: 'ranged', magic: 'magic', necromancy: 'necro' };
                folder = map[item.style] ?? folder;
            }
        }
        return `/gear_icons/${folder}/${val}.png`;
    }

    const weaponTypeKeys = {
        ranged: SETTINGS.WEAPON_TYPE_RANGED,
        magic: SETTINGS.WEAPON_TYPE_MAGE,
        melee: SETTINGS.WEAPON_TYPE_MELEE,
    };
    const weaponKeys = {
        ranged: { mh: SETTINGS.RANGED_MH, oh: SETTINGS.RANGED_OH, th: SETTINGS.RANGED_TH },
        magic: { mh: SETTINGS.MAGIC_MH, oh: SETTINGS.MAGIC_OH, th: SETTINGS.MAGIC_TH },
        melee: { mh: SETTINGS.MELEE_MH, oh: SETTINGS.MELEE_OH, th: SETTINGS.MELEE_TH },
        necro: { mh: SETTINGS.NECRO_MH, oh: SETTINGS.NECRO_OH },
    };

    // Can't use $: here as it doesn't track rune state - computed in template via {#key tick}

    function getWeaponValue(hand) {
        const wk = weaponKeys[uiState.activeTab];
        if (!wk) return 'none';
        const key = hand === 'th' ? wk.th : hand === 'oh' ? wk.oh : wk.mh;
        if (!key) return 'none';
        const val = getGearState()[key];
        if (!val || val === 'custom' || val === 'custom oh' || val === 'custom th') return 'none';
        return val;
    }

    function getEquipValue(slot) {
        let key;
        const keyMap = slotKeyMaps[slot];
        if (keyMap) {
            key = keyMap[uiState.activeTab] ?? slot;
        } else {
            const prefix = sharedSlots.includes(slot) ? '' : (stylePrefix[uiState.activeTab] ?? 'ranged') + ' ';
            key = prefix + slot;
        }
        const val = getGearState()[key];
        if (!val || val === 'none' || val === 'custom' || val === 'custom oh' || val === 'custom th') return 'none';
        return val;
    }

    function getEquipFolder(slot) {
        const val = getEquipValue(slot);
        if (val === 'none') return stylePrefix[uiState.activeTab] ?? 'shared';
        const item = getItemForValue(val);
        if (item?.style === 'hybrid') return 'shared';
        const map = { melee: 'melee', ranged: 'ranged', magic: 'magic', necromancy: 'necro' };
        return item ? (map[item.style] ?? stylePrefix[uiState.activeTab] ?? 'shared') : (stylePrefix[uiState.activeTab] ?? 'shared');
    }

    function getWeaponFallback(hand) {
        return hand === 'mh' ? '/armour_icons/Main_hand_slot.webp'
            : hand === 'th' ? '/armour_icons/2h_slot.png'
            : '/armour_icons/Off-hand_slot.webp';
    }

    // Get perks for an equipped item by value
    function getPerksForItem(itemValue) {
        if (!itemValue || itemValue === 'none' || itemValue.startsWith('custom')) return [];
        const instances = ownedItemsStore.ownedGear.get(itemValue);
        return instances?.[0]?.perks ?? [];
    }

    let currentAbility = $derived(tick !== undefined && tick >= 0 && rotationStore.abilityBar && rotationStore.abilityBar[tick] ? allAbils[rotationStore.abilityBar[tick]] : null);
    let currentAbilityKey = $derived(tick !== undefined && tick >= 0 && rotationStore.abilityBar ? rotationStore.abilityBar[tick] : null);
    let currentStalledAbility = $derived(tick !== undefined && tick >= 0 && gameState.stalledAbilities && gameState.stalledAbilities[tick] ? allAbils[gameState.stalledAbilities[tick]] : null);
    let isNulled = $derived(tick !== undefined && tick >= 0 && rotationStore.nulledTicks && rotationStore.nulledTicks[tick]);

    // Boss HP: actual health (not including heals)
    let bossHp = $derived.by(() => {
        const bossKey = settingsStore.settings[SETTINGS.BOSS_PRESET]?.value;
        if (bossKey && bossKey !== 'none') {
            const enrage = settingsStore.settings[SETTINGS.BOSS_ENRAGE]?.value ?? 0;
            const boss = getBossPresetWithEnrage(bossKey, enrage);
            if (boss?.health) return boss.health;
        }
        const customHp = settingsStore.settings[SETTINGS.BOSS_HP]?.value;
        return customHp > 0 ? customHp : 0;
    });

    // Get boss phases for remaining HP calculation
    let bossPhases = $derived.by(() => {
        const bossKey = settingsStore.settings[SETTINGS.BOSS_PRESET]?.value;
        if (bossKey && bossKey !== 'none') {
            const enrage = settingsStore.settings[SETTINGS.BOSS_ENRAGE]?.value ?? 0;
            const boss = getBossPresetWithEnrage(bossKey, enrage);
            return boss?.phases ?? [];
        }
        return [];
    });

    /**
     * Calculate remaining boss HP accounting for phase heals.
     * Heals only count once cumulative damage has passed the phase threshold.
     */
    function getRemainingHp(cumulativeDamage) {
        let healed = 0;
        for (const phase of bossPhases) {
            if (cumulativeDamage >= phase.hp) {
                healed += phase.heal ?? 0;
            }
        }
        return Math.max(0, bossHp + healed - cumulativeDamage);
    }

    // Per-tick damage breakdown, grouped by ability
    function getTickDamage(tick) {
        if (!rotationStore.distributionStats || rotationStore.distributionStats.length === 0 || tick === undefined || tick < 0) {
            return [];
        }
        const grouped = new Map();
        for (const stat of rotationStore.distributionStats) {
            if (stat.tick !== tick) continue;
            let expected;
            if (stat.distributionType === 'combined' && stat.critProbability !== undefined) {
                expected = stat.critProbability * stat.critMean + (1 - stat.critProbability) * stat.nonCritMean;
            } else {
                expected = (stat.minDamage + stat.maxDamage) / 2;
            }
            const entry = grouped.get(stat.ability);
            if (entry) {
                entry.expected += Math.round(expected * stat.likelihood);
                entry.min += Math.round(stat.minDamage * stat.likelihood);
                entry.max += Math.round(stat.maxDamage * stat.likelihood);
                entry.hits++;
            } else {
                grouped.set(stat.ability, {
                    ability: stat.ability,
                    expected: Math.round(expected * stat.likelihood),
                    min: Math.round(stat.minDamage * stat.likelihood),
                    max: Math.round(stat.maxDamage * stat.likelihood),
                    hits: 1
                });
            }
        }
        return [...grouped.values()];
    }

    // Active buffs at this tick
    function getTickBuffs(tick) {
        if (!rotationStore.buffs || tick === undefined || tick < 0) return [];
        return Object.entries(rotationStore.buffs)
            .filter(([_, buff]) => buff.buffTicks && buff.buffTicks[tick] && buff.buffTicks[tick] !== 'none')
            .map(([key, buff]) => ({ key, title: buff.title, colour: buff.colour }));
    }

    // Stack values at this tick
    function getTickStacks(tick) {
        if (!rotationStore.stacks || tick === undefined || tick < 0) return [];
        return Object.entries(rotationStore.stacks)
            .filter(([_, stack]) => stack.idx >= 0 && stack.stackTicks && stack.stackTicks[tick] !== 0)
            .map(([key, stack]) => ({
                key, title: stack.title,
                value: stack.stackTicks[tick],
                colour: stack.colour,
                image: stack.image
            }));
    }

    function calculateCumulativeDamage() {
        if (!rotationStore.distributionStats || rotationStore.distributionStats.length === 0 || tick === undefined || tick < 0) {
            return { total: 0, mean: 0, min: 0, max: 0 };
        }

        let totalDamage = 0;
        let totalLikelihood = 0;
        let minDamage = 0;
        let maxDamage = 0;

        rotationStore.distributionStats.forEach(stat => {
            if (stat.tick <= tick) {
                if (stat.distributionType === 'combined' && stat.critProbability !== undefined) {
                    const critDamage = stat.critProbability * stat.critMean;
                    const nonCritDamage = (1 - stat.critProbability) * stat.nonCritMean;
                    const expectedDamage = critDamage + nonCritDamage;

                    totalDamage += expectedDamage * stat.likelihood;
                    totalLikelihood += stat.likelihood;
                    minDamage += stat.minDamage * stat.likelihood;
                    maxDamage += stat.maxDamage * stat.likelihood;
                } else {
                    const meanDamage = (stat.minDamage + stat.maxDamage) / 2;
                    totalDamage += meanDamage * stat.likelihood;
                    totalLikelihood += stat.likelihood;
                    minDamage += stat.minDamage * stat.likelihood;
                    maxDamage += stat.maxDamage * stat.likelihood;
                }
            }
        });

        if (totalLikelihood > 0) {
            return {
                total: Math.round(totalDamage),
                mean: Math.round(totalDamage),
                min: Math.round(minDamage),
                max: Math.round(maxDamage)
            };
        }

        return { total: 0, mean: 0, min: 0, max: 0 };
    }

    function formatDamage(damage, full = false) {
        if (full) {
            // View full number, not abbreviated
            return damage.toLocaleString();
        }
        if (damage >= 1000000) {
            const val = damage / 1000000;
            return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
        } else if (damage >= 1000) {
            return Math.round(damage / 1000) + 'K';
        }
        return damage.toString();
    }

    function handleRemoveAbility() {
        if (tick !== undefined && tick >= 0) {
            rotationStore.abilityBar[tick] = null;
            onRemoveAbility();
        }
    }

    function handleToggleNull() {
        if (tick !== undefined && tick >= 0) {
            rotationStore.nulledTicks[tick] = !rotationStore.nulledTicks[tick];
            onRefreshUI();
        }
    }

    function handleRemoveStall() {
        if (tick !== undefined && tick >= 0) {
            rotationStore.stalledAbilities[tick] = null;
            onRefreshUI();
        }
    }
</script>

    <div class="extra-action-section">
        <!-- Header -->
        <div class="flex justify-between items-center w-full">
            <p class="grow text-center font-bold">Tick {tick}</p>
            <button
                class="text-[#C2BA9E] font-bold text-xl hover:text-[#968A5C]"
                onclick={closeExtraActions}
            >
                x
            </button>
        </div>

         <!-- Ability summary + quick actions -->
         <div class="tick-summary">
            <div class="flex items-center gap-2 w-full">
                {#if currentAbility}
                    <img src={currentAbility.icon}
                        alt={currentAbility.title}
                        style="width: 36px; height: 36px; background-color: #333; border: 1px solid #666;"
                        title="{currentAbility.title}"
                    />
                    <div>
                        <p class="text-sm font-bold">{currentAbility.title}</p>
                    </div>
                {:else}
                    <div style="width: 36px; height: 36px; background-color: #333; border: 1px solid #666; display: flex; align-items: center; justify-content: center;">
                        <span class="text-xs text-gray-500">-</span>
                    </div>
                    <p class="text-sm text-gray-400">Empty tick</p>
                {/if}
                {#if isNulled}
                    <span class="nulled-badge">Nulled</span>
                {/if}
                <!-- Cumulative damage + boss HP inline -->
                {#if rotationStore.distributionStats && rotationStore.distributionStats.length > 0}
                    {@const cumDmgInline = calculateCumulativeDamage()}
                    {#if cumDmgInline.total > 0}
                        <span class="cumulative-inline">
                            <span class="cumulative-inline-val">{formatDamage(cumDmgInline.total)}</span>
                            {#if cumDmgInline.min !== cumDmgInline.max}
                                <span class="text-xs text-gray-500">({formatDamage(cumDmgInline.min)}-{formatDamage(cumDmgInline.max)})</span>
                            {/if}
                        </span>
                    {/if}
                    {#if bossHp > 0 && cumDmgInline.total > 0}
                        {@const remaining = getRemainingHp(cumDmgInline.total)}
                        {@const hpPercent = Math.max(0, Math.min(100, (remaining / bossHp) * 100))}
                        <div class="boss-hp-bar-container">
                            <div class="boss-hp-bar-track">
                                <div
                                    class="boss-hp-bar-fill"
                                    style="width: {hpPercent}%; background: {hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FFA726' : '#EF5350'};"
                                ></div>
                                <span class="boss-hp-bar-text">
                                    {remaining > 0 ? formatDamage(remaining) : 'Dead'} / {formatDamage(bossHp)}
                                </span>
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>
            {#if currentStalledAbility}
                <div class="flex items-center gap-2 mt-1">
                    <img src={currentStalledAbility.icon}
                        alt={currentStalledAbility.title}
                        style="width: 24px; height: 24px; background-color: #333; border: 1px solid #555;"
                        title="Stalled: {currentStalledAbility.title}"
                    />
                    <p class="text-xs text-gray-300">Stalled: {currentStalledAbility.title}</p>
                </div>
            {/if}
            <!-- Quick actions -->
            <div class="quick-actions">
                {#if currentAbility}
                    <button class="quick-btn" title="Remove ability" onclick={handleRemoveAbility}>Remove</button>
                {/if}
                <button class="quick-btn" class:active={isNulled} title="Toggle null" onclick={handleToggleNull}>
                    {isNulled ? 'Un-null' : 'Null'}
                </button>
                {#if currentStalledAbility}
                    <button class="quick-btn" title="Remove stall" onclick={handleRemoveStall}>Un-stall</button>
                {/if}
            </div>
        </div>
        <!-- Extra actions bar -->
        <div class="extra-actions-bar">
            {#each gameState.extraActionBar[tick] || Array(EXTRA_BAR_SIZE).fill(null) as action, subIndex}
                <button
                    class="action-slot"
                    style="background-color: #9da777;"
                    tabindex="0"
                    aria-label="Action slot"
                    oncontextmenu={(e) => handleBarRightClick(e, tick, subIndex)}
                >
                    {#if action}
                        {@const actionIcon = action.icon || allExtraActions[action]?.icon || ''}
                        {@const actionTitle = action.title || allExtraActions[action]?.title || ''}
                        <img src={actionIcon}
                            alt={actionTitle}
                            style="width: 100%; height: 100%; object-fit: contain;"
                            title={actionTitle}
                            draggable="true"
                            ondragstart={(e) => handleDragStartBar(e, action, tick)}
                        />
                    {/if}
                </button>
            {/each}
        </div>

       

        <!-- Info section -->
            <div class="info-tab">
                <!-- Per-tick damage -->
                {#if rotationStore.distributionStats && rotationStore.distributionStats.length > 0}
                    {@const tickDmg = getTickDamage(tick)}

                    {#if tickDmg.length > 0}
                        <div class="info-section">
                            <p class="info-label">Damage on this tick</p>
                            {#each tickDmg as hit}
                                <div class="damage-row">
                                    <span class="text-xs text-gray-300">
                                        {#if allAbils[hit.ability]?.title}
                                            {allAbils[hit.ability].title.replace(/\b\w/g, l => l.toUpperCase())}
                                        {:else}
                                            {hit.ability.replace(/\b\w/g, l => l.toUpperCase())}
                                        {/if}
                                        {#if hit.hits > 1}<span class="text-xs text-gray-500">&times;{hit.hits}</span>{/if}
                                    </span>
                                    <span class="damage-val">{formatDamage(hit.expected, true)}</span>
                                    <span class="text-xs text-gray-500">({formatDamage(hit.min, true)} - {formatDamage(hit.max, true)})</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}

                <!-- Buffs & Stacks side by side -->
                {#if getTickBuffs(tick).length > 0 || getTickStacks(tick).length > 0}
                    <div class="buffs-stacks-row">
                        {#if getTickBuffs(tick).length > 0}
                            <div class="info-section" style="flex: 1; min-width: 0;">
                                <p class="info-label">Active buffs</p>
                                <div class="buff-list">
                                    {#each getTickBuffs(tick) as buff}
                                        <div class="buff-item">
                                            <span class="buff-dot" style="background-color: {buff.colour};"></span>
                                            <span class="text-xs">{buff.title}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                        {#if getTickStacks(tick).length > 0}
                            <div class="info-section" style="flex: 1; min-width: 0;">
                                <p class="info-label">Stacks</p>
                                <div class="stack-list">
                                    {#each getTickStacks(tick) as stack}
                                        <div class="stack-item">
                                            <img src={stack.image} alt={stack.title} style="width: 16px; height: 16px;" />
                                            <span class="text-xs">{stack.title}</span>
                                            <span class="stack-val" style="color: {stack.colour};">{Number.isInteger(stack.value) ? stack.value : stack.value?.toFixed?.(1) ?? stack.value}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Equipped gear visual + actions -->
            <div class="actions-layout">
                <!-- Left: equipped gear grid -->
                <div class="equipped-panel">
                    {#key uiState.extraActions.tick}
                    {@const gs = buildGearState(uiState.extraActions.tick)}
                    {@const mhValue = getWeaponValue('mh')}
                    {@const isTwoHanded = mhValue !== 'none' && weapons[mhValue]?.['weapon type'] === 'two-hand'}
                    <!-- Weapon perks -->
                    {@const wpnPerks = [...getPerksForItem(getWeaponValue('mh')), ...getPerksForItem(getWeaponValue('oh'))]}
                    {#if wpnPerks.length > 0}
                        <div class="flex gap-1 flex-wrap justify-center mb-1">
                            {#each wpnPerks as perk}
                                {@const def = perkDefs[perk.perkKey]}
                                {#if def}
                                    <ActionIcon type="perk" src={def.icon} size="xsm" badgeText="{perk.rank}" borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                {/if}
                            {/each}
                        </div>
                    {/if}
                    <div class="equip-grid">
                        <!--        Col1    Col2    Col3    -->
                        <!-- Row1:          Head    Pocket  -->
                        <div></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('helmet')} folder={getEquipFolder('helmet')} fallback={slotFallbacks.helmet} size="lg" bare={true} title="Head" /></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('pocket')} folder={getEquipFolder('pocket')} fallback={slotFallbacks.pocket} size="lg" bare={true} title="Pocket" /></div>
                        <!-- Row2:  Cape    Neck    Ammo    -->
                        <div class="equip-cell"><ActionIcon value={getEquipValue('cape')} folder={getEquipFolder('cape')} fallback={slotFallbacks.cape} size="lg" bare={true} title="Cape" /></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('necklace')} folder={getEquipFolder('necklace')} fallback={slotFallbacks.necklace} size="lg" bare={true} title="Neck" /></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('ammo')} folder="ranged" fallback={slotFallbacks.ammo} size="lg" bare={true} title="Ammo" /></div>
                        <!-- Row3:  MH/2H   Body    OH/empty -->
                        {#if isTwoHanded}
                            <div class="equip-cell"><ActionIcon value={getWeaponValue('th')} folder={stylePrefix[uiState.activeTab]} fallback={getWeaponFallback('th')} size="lg" bare={true} title="2H" /></div>
                            <div class="equip-cell"><ActionIcon value={getEquipValue('body')} folder={getEquipFolder('body')} fallback={slotFallbacks.body} size="lg" bare={true} title="Body" /></div>
                            <div></div>
                        {:else}
                            <div class="equip-cell"><ActionIcon value={getWeaponValue('mh')} folder={stylePrefix[uiState.activeTab]} fallback={getWeaponFallback('mh')} size="lg" bare={true} title="MH" /></div>
                            <div class="equip-cell"><ActionIcon value={getEquipValue('body')} folder={getEquipFolder('body')} fallback={slotFallbacks.body} size="lg" bare={true} title="Body" /></div>
                            <div class="equip-cell"><ActionIcon value={getWeaponValue('oh')} folder={stylePrefix[uiState.activeTab]} fallback={getWeaponFallback('oh')} size="lg" bare={true} title="OH" /></div>
                        {/if}
                        <!-- Row4:          Legs            -->
                        <div></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('legs')} folder={getEquipFolder('legs')} fallback={slotFallbacks.legs} size="lg" bare={true} title="Legs" /></div>
                        <div></div>
                        <!-- Row5:  Gloves  Boots   Ring    -->
                        <div class="equip-cell"><ActionIcon value={getEquipValue('gloves')} folder={getEquipFolder('gloves')} fallback={slotFallbacks.gloves} size="lg" bare={true} title="Gloves" /></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('boots')} folder={getEquipFolder('boots')} fallback={slotFallbacks.boots} size="lg" bare={true} title="Boots" /></div>
                        <div class="equip-cell"><ActionIcon value={getEquipValue('ring')} folder={getEquipFolder('ring')} fallback={slotFallbacks.ring} size="lg" bare={true} title="Ring" /></div>
                    </div>
                    <!-- Body + Legs perks -->
                    {@const armourPerks = [...getPerksForItem(getEquipValue('body')), ...getPerksForItem(getEquipValue('legs'))]}
                    {#if armourPerks.length > 0}
                        <div class="flex gap-1 flex-wrap justify-center mt-1">
                            {#each armourPerks as perk}
                                {@const def = perkDefs[perk.perkKey]}
                                {#if def}
                                    <ActionIcon type="perk" src={def.icon} size="xsm" badgeText="{perk.rank}" borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                {/if}
                            {/each}
                        </div>
                    {/if}
                    {/key}
                </div>
                <!-- Right: gear choices -->
                <div class="actions-panel">
                    <ActionChoice
                        handleAbilityClick={handleAbilityClickExtra}
                        {handleDragStart}
                        style={uiState.activeTab}
                        showOnly="gear"
                    />
                </div>
            </div>
            <!-- Bottom: other actions -->
            <ActionChoice
                handleAbilityClick={handleAbilityClickExtra}
                {handleDragStart}
                style={uiState.activeTab}
                showOnly="actions"
            />
    </div>

<style>
    .extra-action-section {
        border-left: 8px solid var(--card-border-rotation, #ffd700);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem;
        background: #171d21;
        max-width: 100%;
    }

    .tick-summary {
        width: 100%;
        padding: 0.3rem;
        border-bottom: 1px solid #444;
        margin-bottom: 0.1rem;
    }

    .cumulative-inline {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-shrink: 0;
    }

    .cumulative-inline-val {
        font-size: 1rem;
        font-weight: bold;
        color: #4CAF50;
    }

    .boss-hp-bar-container {
        margin-top: 4px;
        width: 100%;
    }
    .boss-hp-bar-track {
        height: 22px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .boss-hp-bar-fill {
        height: 100%;
        border-radius: 2px 0 0 2px;
        transition: width 0.2s ease;
    }
    .boss-hp-bar-text {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: bold;
        color: #fff;
        white-space: nowrap;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        pointer-events: none;
    }

    .nulled-badge {
        font-size: 0.65rem;
        padding: 1px 6px;
        background-color: rgba(255, 0, 0, 0.3);
        border: 1px solid rgba(255, 0, 0, 0.6);
        border-radius: 3px;
        color: #ff6666;
        text-transform: uppercase;
    }

    .quick-actions {
        display: flex;
        gap: 4px;
        margin-top: 6px;
    }

    .quick-btn {
        font-size: 0.7rem;
        padding: 2px 8px;
        background-color: rgba(255, 255, 255, 0.08);
        border: 1px solid #555;
        border-radius: 3px;
        color: #C2BA9E;
        cursor: pointer;
    }

    .quick-btn:hover {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: #888;
    }

    .quick-btn.active {
        background-color: rgba(255, 0, 0, 0.15);
        border-color: rgba(255, 0, 0, 0.5);
    }

    .tab-btn {
        color: #C2BA9E;
        font-weight: bold;
        font-size: 0.85rem;
        text-transform: uppercase;
        padding: 4px 12px;
        border-bottom: 2px solid transparent;
    }

    .tab-btn:hover {
        color: #968A5C;
    }

    .tab-active {
        color: #ffd700;
        border-bottom-color: #ffd700;
    }

    .info-tab {
        width: 100%;
        padding: 0.2rem 0;
    }

    .buffs-stacks-row {
        display: flex;
        gap: 0.5rem;
        border-bottom: 1px solid #333;
    }

    .buffs-stacks-row .info-section {
        border-bottom: none;
    }

    .info-section {
        padding: 0.4rem 0.5rem;
        border-bottom: 1px solid #333;
    }

    .info-section:last-child {
        border-bottom: none;
    }

    .info-label {
        font-size: 0.7rem;
        color: #888;
        text-transform: uppercase;
        margin-bottom: 4px;
        letter-spacing: 0.5px;
    }

    .damage-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
    }

    .damage-val {
        font-size: 0.85rem;
        font-weight: bold;
        color: #4CAF50;
    }

    .damage-val-lg {
        font-size: 1.1rem;
        font-weight: bold;
        color: #4CAF50;
    }

    .buff-list, .stack-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .buff-item {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .buff-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .stack-item {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .stack-val {
        font-weight: bold;
        font-size: 0.85rem;
        margin-left: auto;
    }

    .section-label {
        font-size: 0.7rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        width: 100%;
        padding: 0 0.5rem;
    }
    .action-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .action-row > :first-child {
        flex: 1;
        min-width: 0;
    }
    .row-label {
        font-size: 0.55rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        writing-mode: vertical-rl;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .actions-layout {
        display: flex;
        gap: 8px;
        width: 100%;
    }
    .equipped-panel {
        flex: 0 0 30%;
        min-width: 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .equip-grid {
        display: inline-grid;
        grid-template-columns: repeat(3, 35px);
        grid-auto-rows: 35px;
        gap: 2px;
        justify-items: center;
        align-items: center;
    }
    .equip-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        background: rgba(0, 0, 0, 0.2);
    }
    .actions-panel {
        flex: 1 1 0;
        min-width: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .extra-actions-bar {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin: 0.5rem 0;
        gap: 2px;
    }

    .action-slot {
        position: relative;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #878787;
        box-sizing: border-box;
    }
</style>
