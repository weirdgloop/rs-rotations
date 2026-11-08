<script>
    import {teamDebuffOptions, teamDebuffsAt} from '$lib/calc/rotation_builder/targetDebuffs';
    import { fightTime } from '$lib/calc/rotation_builder/fightTime';
    import { sectionBounds, setSectionEnd } from '$lib/calc/rotation_builder/sectionBounds';
    import { phaseStackOptions } from '$lib/calc/rotation_builder/phaseStacks';
    import { applyActionAmmo, isPernixQuiver, quiverProfileKey, resolveQuiverAmmo, selectQuiverSlot, QUIVER_SLOT_1, QUIVER_SLOT_2 } from '$lib/calc/rotation_builder/quiver';
    import { weaponSelectionUpdates } from '$lib/data/equipmentSlots';
    import EquipmentSlots from '$components/Settings/EquipmentSlots.svelte';
    import { applyAccuracyEvent, accuracyAt, normalizeTickEvent } from '$lib/calc/rotation_builder/tickEvents';
    import { targetCountAt, normalizeTargetCount } from '$lib/calc/rotation_builder/targets';
    import { isGhrazi } from '$lib/calc/accuracy';
    import { onMount } from 'svelte';
    import ActionChoice from './ActionChoice.svelte';
    import { allExtraActions, gearSwaps } from '$lib/special/abilities';
    import { getSettingsKeyForItem, getItemForValue } from '$lib/calc/rotation_builder/gear-registry';
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { settingsStore, initializeSettings } from '$lib/stores/settingsStore.svelte.js';
    import { rotationStore } from '$lib/stores/rotationStore.svelte.js';
    import { equipment, getEquipmentIcon, getEquipment, isCustomEquipment } from '$lib/data/equipment';
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
        showFightTime = false,
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

    const ammoChoices = Object.values(equipment).filter(item => item.slot === 'ammo' && /arrow|bolt/i.test(item.name + ' ' + item.bonuses?.style)).sort((a,b) => a.name.localeCompare(b.name));
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
        state._gearInstances = {...state._gearInstances};
        resolveQuiverAmmo(state);
        if (currentTick >= 0 && rotationStore.extraActionBar) {
            for (let t = 0; t <= currentTick; t++) {
                const actions = rotationStore.extraActionBar[t] ?? [];
                for (const action of actions) {
                    if (!action) continue;
                    // New ExtraAction format — has .type and .slot
                    if (action.type === 'gear' && action.slot) {
                        state[action.slot] = action.value;
                        state._gearInstances[action.slot] = {itemKey:action.value, instanceId:action.instanceId};
                        Object.assign(state, weaponSelectionUpdates(action.slot, action.value));
                        if (action.slot.includes('ammo')) {
                            const styleAmmo = ammoKeys[uiState.activeTab];
                            if (styleAmmo) state[styleAmmo] = action.value;
                        }
                        resolveQuiverAmmo(state);
                        continue;
                    }
                    // Legacy format fallback
                    const key = typeof action === 'string' ? action : (action.value ?? action.title);
                    if (!key) continue;
                    if (key === QUIVER_SLOT_1 || key === QUIVER_SLOT_2) {selectQuiverSlot(state, key === QUIVER_SLOT_2 ? 1 : 0); continue;}
                    const slot = getSettingsKeyForItem(key) || gearSwaps[key];
                    if (slot) {
                        state[slot] = key;
                        if (slot === SETTINGS.AMMO) {
                            const styleAmmo = ammoKeys[uiState.activeTab];
                            if (styleAmmo) state[styleAmmo] = key;
                        }
                    }
                }
                if (rotationStore.releasedAbilities[t]) applyActionAmmo(state, rotationStore.tickEvents[t]?.releaseAmmo);
                if (rotationStore.abilityBar[t]) applyActionAmmo(state, rotationStore.tickEvents[t]?.castAmmo);
            }
        }
        return state;
    }

    function getGearState() {
        return buildGearState(tick);
    }

    const slotFallbacks = {
        helmet: '/rs-rot/armour_icons/Head_slot.webp',
        body: '/rs-rot/armour_icons/Torso_slot.png',
        legs: '/rs-rot/armour_icons/Legs_slot.png',
        gloves: '/rs-rot/armour_icons/Hands_slot.webp',
        boots: '/rs-rot/armour_icons/Feet_slot.png',
        necklace: '/rs-rot/armour_icons/Neck_slot.png',
        cape: '/rs-rot/armour_icons/Back_slot.png',
        ring: '/rs-rot/armour_icons/Ring_slot.png',
        pocket: '/rs-rot/armour_icons/Pocket_slot.webp',
        ammo: '/rs-rot/armour_icons/Ammo_slot.png',
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
        if (!val || val === 'none' || isCustomEquipment(val)) return slotFallbacks.ammo;
        return getEquipmentIcon(val, slotFallbacks.ammo);
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
        if (!val || val === 'none' || isCustomEquipment(val)) return slotFallbacks[slot];
        return getEquipmentIcon(val, slotFallbacks[slot]);
    }

    const weaponTypeKeys = {
        ranged: SETTINGS.WEAPON_TYPE_RANGED,
        magic: SETTINGS.WEAPON_TYPE_MAGIC,
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
        if (!val || isCustomEquipment(val)) return 'none';
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
        if (!val || val === 'none' || isCustomEquipment(val)) return 'none';
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
        return hand === 'mh' ? '/rs-rot/armour_icons/Main_hand_slot.webp'
            : hand === 'th' ? '/rs-rot/armour_icons/2h_slot.png'
            : '/rs-rot/armour_icons/Off-hand_slot.webp';
    }

    // Get perks for an equipped item by value
    function getPerksForItem(itemValue) {
        if (!itemValue || itemValue === 'none' || isCustomEquipment(itemValue)) return [];
        const instances = ownedItemsStore.ownedGear.get(itemValue);
        return instances?.[0]?.perks ?? [];
    }

    let currentAbility = $derived(tick !== undefined && tick >= 0 && rotationStore.abilityBar && rotationStore.abilityBar[tick] ? allAbils[rotationStore.abilityBar[tick]] : null);
    let currentAbilityKey = $derived(tick !== undefined && tick >= 0 && rotationStore.abilityBar ? rotationStore.abilityBar[tick] : null);
    let currentStalledAbility = $derived(tick !== undefined && tick >= 0 && gameState.stalledAbilities && gameState.stalledAbilities[tick] ? allAbils[gameState.stalledAbilities[tick]] : null);
    let currentReleaseKey = $derived(rotationStore.releasedAbilities[tick]);
    let pendingStall = $derived.by(() => {
        let held = null;
        for (let i = 0; i < tick; i++) {
            if (rotationStore.stalledAbilities[i]) held = rotationStore.stalledAbilities[i];
            if (rotationStore.releasedAbilities[i] || rotationStore.abilityBar[i]) held = null;
        }
        return held;
    });
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
        for (const hit of rotationStore.secondaryHits ?? []) {
            if (hit.tick !== tick) continue;
            const key = `${hit.ability}:${hit.targetIndex}`;
            const entry = grouped.get(key);
            if (entry) { entry.expected += hit.expected; entry.hits++; }
            else grouped.set(key, {...hit, hits: 1});
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
            .filter(([key, stack]) => stack.idx >= 0 && stack.stackTicks && Number.isFinite(stack.stackTicks[tick]) &&
                (key === SETTINGS.PERFECT_EQUILIBRIUM_STACKS || stack.stackTicks[tick] !== 0))
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
    let namedTargets = $derived([...new Set(['Initial target', ...rotationStore.tickEvents.map(event => event?.targetId).filter(Boolean)])]);
    let activeTeamDebuffs = $derived(teamDebuffsAt(rotationStore.tickEvents, tick));
    let tickEvent = $derived(rotationStore.tickEvents[tick] ?? {});
    let effectiveAccuracy = $derived(accuracyAt(rotationStore.tickEvents, tick, Number(settingsStore.settings[SETTINGS.HIT_CHANCE]?.value ?? 100)));
    let accuracyConditions = $derived.by(() => {
        const result = buildGearState(tick);
        for (let t = 0; t <= tick; t++) applyAccuracyEvent(result, rotationStore.tickEvents[t]);
        return result;
    });
    const distanceLabels = ['Overlapping (+160)', '1 clear tile (+120)', '2 clear tiles (+30)', '3+ clear tiles'];
    let previousDistance = $derived.by(() => {
        for (let t = tick - 1; t >= 0; t--) {
            const value = rotationStore.tickEvents[t]?.ghraziDistance;
            if (value != null) return Math.min(3, value);
        }
        return Math.min(3, settingsStore.settings[SETTINGS.GHRAZI_DISTANCE]?.value ?? 3);
    });
    let automaticAccuracy = $derived(accuracyConditions[SETTINGS.AUTO_ACCURACY] === true && !!bossPresets[accuracyConditions[SETTINGS.BOSS_PRESET]]);
    let outsideCombat = $derived.by(() => {
        if (tickEvent.outOfCombat != null) return tickEvent.outOfCombat;
        for (let i = tick - 1; i >= 0; i--) {
            if ((rotationStore.abilityBar[i] && allAbils[rotationStore.abilityBar[i]]?.abilityClassification !== 'self cast') || rotationStore.releasedAbilities[i]) return false;
            if (rotationStore.tickEvents[i]?.outOfCombat != null) return rotationStore.tickEvents[i].outOfCombat;
        }
        return !!settingsStore.settings[SETTINGS.OUT_OF_COMBAT]?.value;
    });
    let currentGear = $derived.by(() => {
        const result = buildGearState(tick);
        const prefix = stylePrefix[uiState.activeTab] ?? 'ranged';
        const mode = result[`weapon type ${prefix}`];
        const mh = `${prefix} main-hand weapon`;
        if (mode === 'two-hand' && weapons[result[mh]]?.['weapon type'] !== 'two-hand') result[mh] = result[`${prefix} two-hand weapon`];
        return result;
    });
    let currentInstances = $derived.by(() => {
        const result = {...(settingsStore.settings._gearInstances?.value ?? {})};
        for (let t = 0; t <= tick; t++) for (const action of rotationStore.extraActionBar[t] ?? []) {
            if (action?.type === 'gear' && action.slot) result[action.slot] = {itemKey:action.value, label:action.label, instanceIndex:action.instanceIndex, perks:action.perks};
        }
        return result;
    });
    let currentSectionBounds = $derived(sectionBounds(rotationStore.tickEvents, tick));
    function changeSectionEnd(event) {
        const input = event.currentTarget;
        input.setCustomValidity('');
        if (input.value === '') return;
        try {
            rotationStore.tickEvents = setSectionEnd(rotationStore.tickEvents, tick, Number(input.value));
            onRefreshUI();
        } catch (error) {
            input.setCustomValidity(error.message);
            input.reportValidity();
            input.value = currentSectionBounds.end ?? '';
        }
    }
    function updateTickEvent(changes) {
        rotationStore.tickEvents[tick] = normalizeTickEvent({...tickEvent, ...changes});
        onRefreshUI();
    }
    function placeGear(action) {
        const row = [...(rotationStore.extraActionBar[tick] ?? [])];
        let index = row.findIndex(existing => existing?.type === 'gear' && existing.slot === action.slot);
        if (index < 0) index = row.findIndex(existing => !existing);
        if (index < 0) index = row.length;
        row[index] = action;
        rotationStore.extraActionBar[tick] = row;
        onRefreshUI();
    }
    function removeAction(index) { rotationStore.extraActionBar[tick][index] = null; onRefreshUI(); }
</script>

    <div class="extra-action-section">
        <!-- Header -->
        <div class="flex justify-between items-center w-full">
            <p class="grow text-center font-bold">{#if showFightTime}{fightTime(tick, settingsStore.settings[SETTINGS.BOSS_PATTERN_START]?.value ?? -1)} into fight · Tick {tick}{:else}Tick {tick} - {(tick * 0.6).toFixed(1)}s{/if}</p>
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
                    <p class="text-xs text-gray-300">Stalled: {currentStalledAbility.title} (adrenaline only)</p>
                </div>
            {/if}
            {#if currentReleaseKey}
                <div class="release-status">
                    <img src={allAbils[currentReleaseKey]?.icon} alt="" width="24" height="24" />
                    <span>Release: {allAbils[currentReleaseKey]?.title || currentReleaseKey}
                        {#if pendingStall !== currentReleaseKey}<small>No matching held ability. This release does no damage.</small>{/if}
                    </span>
                    <button class="quick-btn" onclick={() => {rotationStore.releasedAbilities[tick] = null; onRefreshUI();}}>Remove release</button>
                </div>
            {:else if pendingStall && !currentStalledAbility}
                <button class="quick-btn" onclick={() => {rotationStore.releasedAbilities[tick] = pendingStall; onRefreshUI();}}>Release {allAbils[pendingStall]?.title || pendingStall} here</button>
            {/if}
            {#if currentReleaseKey}
                <div class="tick-controls">
                    <label class="phase-name">Release ammo
                        <select value={tickEvent.releaseAmmo ?? ''} onchange={e => updateTickEvent({releaseAmmo: e.currentTarget.value || undefined})}>
                            <option value="">Use equipped ammo</option>
                            {#each ammoChoices as ammo}<option value={ammo.id}>{ammo.name}</option>{/each}
                        </select>
                    </label>
                    {#if rotationStore.abilityBar[tick]}
                        <label class="phase-name">Then cast ammo
                            <select value={tickEvent.castAmmo ?? ''} onchange={e => updateTickEvent({castAmmo: e.currentTarget.value || undefined})}>
                                <option value="">Keep ammo after release</option>
                                {#each ammoChoices as ammo}<option value={ammo.id}>{ammo.name}</option>{/each}
                            </select>
                        </label>
                    {/if}
                    <p class="condition-note">Release first, then swap ammo for the cast on this tick. The final ammo stays equipped.</p>
                </div>
            {/if}
            <section class="tick-controls" aria-label="Tick conditions">
                <details>
                    <summary>Team-applied target debuffs</summary>
                    {#each teamDebuffOptions as [key, label]}
                        <label class="phase-toggle"><input type="checkbox" checked={activeTeamDebuffs[key] === true} onchange={e => updateTickEvent({teamDebuffs:{...tickEvent.teamDebuffs, [key]:e.currentTarget.checked}})} /> {label}</label>
                    {/each}
                    <p class="condition-note">Assume teammates maintain these effects from this tick until disabled. They belong to this named target and are remembered when you return. Warhammer and Guthix staff each model one defence drain; affinity bonuses stack. Enable automatic damage potential for accuracy effects.</p>
                    {#if tickEvent.teamDebuffs}<button class="text-button" onclick={() => updateTickEvent({teamDebuffs:undefined})}>Use previous debuff selections</button>{/if}
                </details>
                <div class="condition-row"><label for="tick-adrenaline">Set adrenaline</label><div class="percent-field"><input id="tick-adrenaline" type="number" min="0" max="130" step="0.1" placeholder="Auto" value={tickEvent.adrenaline ?? ''} onchange={e => updateTickEvent({adrenaline:e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value)})} /><span aria-hidden="true">%</span></div></div>
                <p class="condition-note">Overrides adrenaline before actions on this tick, capped at your maximum. Later gains and costs continue normally. Clear the box to use the calculated value.</p>
                <label class="phase-toggle"><input type="checkbox" checked={outsideCombat} onchange={e => updateTickEvent({outOfCombat:e.currentTarget.checked})} /> Outside combat (Persistent Rage)</label>
                <p class="condition-note">Applies until changed or an attack is cast/released. Persistent Rage gains 5% every 2 ticks outside combat.</p>
                <div class="condition-row"><label for="targets-in-range">Targets in range</label>
                    <input id="targets-in-range" type="number" min="1" max="25" value={targetCountAt(rotationStore.targetCounts,tick)} onchange={e => {rotationStore.targetCounts[tick] = normalizeTargetCount(e.currentTarget.value); onRefreshUI();}} /></div>
                <label class="phase-name">Fighting<select value={accuracyConditions[SETTINGS.BOSS_PRESET] ?? 'none'} onchange={e => updateTickEvent({target:e.currentTarget.value, automaticAccuracy:true})}><option value="none">No target</option>{#each Object.keys(bossPresets).sort() as key}<option value={key}>{bossPresets[key].name}</option>{/each}</select></label>
                {#if bossPresets[accuracyConditions[SETTINGS.BOSS_PRESET]]}
                    <label class="phase-toggle"><input type="checkbox" checked={automaticAccuracy} onchange={e => updateTickEvent({automaticAccuracy:e.currentTarget.checked})} /> Automatic damage potential</label>
                {/if}
                {#if bossPresets[accuracyConditions[SETTINGS.BOSS_PRESET]]?.notes}<p class="condition-note">{bossPresets[accuracyConditions[SETTINGS.BOSS_PRESET]].notes}</p>{/if}
                {#if automaticAccuracy}
                    <p class="condition-note">Calculated per hit from target, equipment and buffs. Untick to enter a damage potential override.</p>
                {:else}
                    <div class="condition-row"><label for="tick-accuracy">Damage potential</label><div class="percent-field"><input id="tick-accuracy" type="number" min="0" max="100" step="0.1" value={effectiveAccuracy} onchange={e => updateTickEvent({accuracy:Number(e.currentTarget.value), automaticAccuracy:false})} /><span aria-hidden="true">%</span></div></div>
                {/if}
                {#if isGhrazi(accuracyConditions[SETTINGS.BOSS_PRESET])}
                    <label class="phase-name">Distance between knights
                        <select value={tickEvent.ghraziDistance == null ? 'previous' : String(Math.min(3, tickEvent.ghraziDistance))} onchange={e => updateTickEvent({ghraziDistance:e.currentTarget.value === 'previous' ? undefined : Number(e.currentTarget.value)})}>
                            <option value="previous">Use previous: {distanceLabels[previousDistance]}</option>
                            <option value="3">3+ clear tiles</option><option value="2">2 clear tiles (+30)</option><option value="1">1 clear tile (+120)</option><option value="0">Overlapping (+160)</option>
                        </select>
                    </label>
                    <p class="condition-note">Choose Use previous to remove the distance change at this tick and inherit the earlier value, or the starting setup if none was set.</p>
                {/if}
                {#if isGhrazi(accuracyConditions[SETTINGS.BOSS_PRESET])}<p class="condition-note">Proximity scaling is approximate, calibrated from same-gear melee readings (99 / 60 / 34 / 18%). Untick automatic damage potential to use an exact in-game value.</p>{/if}
                <p class="condition-note">Target, distance and accuracy apply from this tick until changed again.</p>
                {#if ['accuracy', 'automaticAccuracy', 'target', 'ghraziDistance', 'armourMultiplier'].some(key => tickEvent[key] != null) || rotationStore.targetCounts[tick] != null}<button class="text-button" onclick={() => {rotationStore.targetCounts[tick] = null; updateTickEvent({accuracy:undefined, automaticAccuracy:undefined, target:undefined, ghraziDistance:undefined, armourMultiplier:undefined});}}>Use previous conditions</button>{/if}
                <label class="phase-toggle"><input type="checkbox" checked={!!tickEvent.phase} onchange={e => updateTickEvent({phase:e.currentTarget.checked ? 'Phase transition' : undefined, downtime:0})} /> New phase / section</label>
                {#if tickEvent.phase}
                    <label class="phase-name">Section heading<input value={tickEvent.phase} maxlength="80" onchange={e => updateTickEvent({phase:e.currentTarget.value})} /></label>
                    <label class="phase-name">Target identity
                        <input list="phase-target-identities" value={tickEvent.targetId ?? ''} placeholder="Keep current target" maxlength="80" onchange={e => updateTickEvent({targetId:e.currentTarget.value || undefined})} />
                        <datalist id="phase-target-identities">{#each namedTargets as target}<option value={target}></option>{/each}</datalist>
                    </label>
                    <p class="condition-note">Enter a new name to switch targets, or choose an earlier name to return to it. Blank keeps the current target. Delayed hits and bleeds stay on their original target; ECB Split Soul only applies while that target is selected.</p>
                    <p class="condition-note">Starts a new timeline section here. Cooldowns, buffs and stacks carry over by default.</p>
                    <div class="condition-row"><label for="section-end">End tick (inclusive)</label><input id="section-end" type="number" min={tick} max={currentSectionBounds.maxEnd} step="1" placeholder="End of rotation" value={currentSectionBounds.end ?? ''} disabled={tick > currentSectionBounds.maxEnd} oninput={e => e.currentTarget.setCustomValidity('')} onchange={changeSectionEnd} /></div>
                    <p class="condition-note">The next section starts one tick after this end. Changing it moves the next heading and its phase reset settings; abilities, gear swaps and target conditions stay on their ticks. If there is no next section, one is created for you to name.</p>
                    <label class="phase-toggle"><input type="checkbox" checked={!!tickEvent.clearStacks?.length} onchange={e => updateTickEvent({clearStacks:e.currentTarget.checked ? phaseStackOptions.map(([key]) => key) : []})} /> Clear stacks at this phase start</label>
                    {#if tickEvent.clearStacks?.length}
                        <details><summary>Choose stacks to clear ({tickEvent.clearStacks.length})</summary>
                            {#each phaseStackOptions as [key, label]}
                                <label class="phase-toggle"><input type="checkbox" checked={tickEvent.clearStacks.includes(key)} onchange={e => updateTickEvent({clearStacks:e.currentTarget.checked ? [...tickEvent.clearStacks, key] : tickEvent.clearStacks.filter(value => value !== key)})} /> {label}</label>
                            {/each}
                        </details>
                        <p class="condition-note">Clears selected stacks before this tick's actions. Adrenaline, buffs and cooldowns are kept.</p>
                    {/if}
                    <div class="condition-row"><label for="phase-downtime">Invulnerable ticks</label><input id="phase-downtime" type="number" min="0" max="300" value={tickEvent.downtime ?? 0} onchange={e => updateTickEvent({downtime:Number(e.currentTarget.value)})} /></div>
                    <p class="condition-note">0 adds a section heading without interrupting the rotation. Higher values pause damage; buffs keep ticking.</p>
                {/if}
                {#if uiState.activeTab === 'ranged'}
                    <label class="phase-name">Malachi cooldown reset<select value={tickEvent.malachiReset === true ? 'yes' : tickEvent.malachiReset === false ? 'no' : 'expected'} onchange={e=>updateTickEvent({malachiReset:e.currentTarget.value === 'expected' ? undefined : e.currentTarget.value === 'yes'})}><option value="expected">Expected chance (25%)</option><option value="yes">Reset occurs on this cast</option><option value="no">No reset on this cast</option></select></label>
                    <p class="condition-note">Requires a Malachi crossbow. Both pieces grant Crimson Salvo after a reset. Expected mode weights the buff; it does not guarantee a ready cooldown.</p>
                {/if}
                <details class="condition-help"><summary>Target-count help</summary><p>Includes the main target. Count enemies inside the attack area: Locate caps at 6; Meteor Strike, Sweep and Sunfall Slam at 9; Powerstab at 25. Position and facing are not simulated.</p></details>
            </section>
            <!-- Quick actions -->
            <div class="quick-actions">
                {#if currentAbility}
                    <button class="quick-btn" title="Remove ability" onclick={handleRemoveAbility}>Remove</button>
                {/if}
                <button class="quick-btn" class:active={isNulled} title="Set damage to zero on this tick while still applying buffs and stacks" onclick={handleToggleNull}>
                    {isNulled ? 'Restore damage' : 'Zero damage this tick'}
                </button>
                {#if currentStalledAbility}
                    <button class="quick-btn" title="Remove stall" onclick={handleRemoveStall}>Un-stall</button>
                {/if}
            </div>
        </div>
        <section class="placed-actions" aria-label="Actions at this tick">
            <header><strong>Actions at this tick</strong><small>Before the ability</small></header>
            {#each rotationStore.extraActionBar[tick] ?? [] as action, index}{#if action}
                <div class="placed-action"><img src={action.icon || allExtraActions[action]?.icon || ''} alt="" /><span>{action.title || allExtraActions[action]?.title || action}</span><button aria-label={`Remove ${action.title || 'action'}`} onclick={() => removeAction(index)}>Remove</button></div>
            {/if}{/each}
            {#if !rotationStore.extraActionBar[tick]?.some(Boolean)}<p class="empty-actions">No extra actions. Choose a slot below to add a swap.</p>{/if}
        </section>

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
                                        <span class="text-xs text-gray-500"> {hit.targetIndex ? `Target ${hit.targetIndex + 1}` : 'Main target'}</span>
                                        {#if hit.hits > 1}<span class="text-xs text-gray-500">&times;{hit.hits}</span>{/if}
                                    </span>
                                    <span class="damage-val">{formatDamage(hit.expected, true)}</span>
                                    {#if hit.min != null}<span class="text-xs text-gray-500">({formatDamage(hit.min, true)} - {formatDamage(hit.max, true)})</span>{/if}
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

            <section class="tick-equipment"><h3>Equipment at this tick</h3>
                    {#if isPernixQuiver(currentGear[SETTINGS.RANGED_AMMO_SLOT])}
                        <p class="condition-note"><strong>Quiver ammo: {getEquipment(resolveQuiverAmmo({...currentGear, _quiverSlots:{...currentGear._quiverSlots}}))?.title ?? 'Empty'}</strong></p>
                    {/if}<p class="condition-note">Click a slot to search and choose an item copy.</p>
                <EquipmentSlots values={currentGear} instances={currentInstances} style={uiState.activeTab} onselect={placeGear} actionLabel="Add swap at this tick" />
            </section>
            <details class="more-actions"><summary>Add prayer, potion or ability</summary>
            <ActionChoice
                handleAbilityClick={handleAbilityClickExtra}
                {handleDragStart}
                style={uiState.activeTab}
                showOnly="actions"
            /></details>
    </div>

<style>
    .release-status { display:flex; align-items:center; gap:8px; font-size:12px; margin:8px 0; flex-wrap:wrap; }
    .release-status small { display:block; color:#f6b58d; }
    .tick-controls {display:grid;gap:9px;padding:14px 0;border-top:1px solid #33434d;margin-top:12px;font-size:12px}
    .condition-row {display:flex;align-items:center;justify-content:space-between;gap:12px}.condition-row input {width:90px;height:32px;margin:0!important;box-sizing:border-box}
    .tick-controls input:not([type=checkbox]) {background:#101b22;border:1px solid #46565f;border-radius:4px;color:#c1dce9;padding:6px 8px;min-width:0}
    .condition-note,.condition-help,.empty-actions {font-size:11px;color:#98acb7;line-height:1.5;margin:0}
    .text-button {font-size:11px;color:#d8c58d;text-align:left}.phase-toggle {display:flex;align-items:center;gap:8px;padding-top:10px;border-top:1px solid #33434d}.phase-name {display:grid;gap:5px}
    .condition-help summary,.more-actions summary {cursor:pointer;color:#c4d8e3}.condition-help p{margin-top:6px}
    .placed-actions {width:100%;padding:12px 0;border-bottom:1px solid #33434d;margin-bottom:12px}.placed-actions header{display:flex;justify-content:space-between;gap:8px;font-size:12px;margin-bottom:9px}.placed-actions small{font-size:10px;color:#98acb7}
    .placed-action {display:flex;align-items:center;gap:8px;background:#1c272e;border-radius:4px;padding:7px;margin-top:5px;font-size:11px}.placed-action img{width:26px;height:26px;object-fit:contain}.placed-action span{flex:1;min-width:0;overflow-wrap:anywhere}.placed-action button{color:#d7bc89}
    .empty-actions {border:1px dashed #46565f;border-radius:4px;padding:10px}.tick-equipment{width:100%;border-top:1px solid #33434d;padding-top:13px;margin-top:10px}.tick-equipment h3{font-weight:600;font-size:13px;margin-bottom:5px}.tick-equipment>p{margin-bottom:10px}.more-actions{width:100%;border-top:1px solid #33434d;padding-top:12px;margin-top:16px;font-size:12px}

    .percent-field {position:relative;width:90px;flex:0 0 90px}
    .percent-field input {width:100%;padding-right:28px!important;appearance:textfield;-moz-appearance:textfield}
    .percent-field input::-webkit-inner-spin-button,.percent-field input::-webkit-outer-spin-button {appearance:none;margin:0}
    .percent-field span {position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:#98acb7}


    .extra-action-section {
        border: 1px solid #46565f;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 14px;
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
.tick-help { font-size: 12px; color: #b4c0c8; line-height: 1.6; margin: 14px 0 8px; }
</style>
