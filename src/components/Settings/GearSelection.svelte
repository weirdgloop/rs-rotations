<script>
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { ARMOUR } from '$lib/data/armour';
    import { WEAPONS, weapons } from '$lib/data/weapons';
    import { SettingsCombatStyles } from '$lib/calc/rotation_builder/types/SettingsCombatStyles.ts';
    import { getItemsForSlot, getItemForValue } from '$lib/calc/rotation_builder/gear-registry';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import { formatPerkAbbrev, itemDisplayText as _itemDisplayText, expandOptionsWithInstances as _expandOptions } from '$lib/data/perks';
    import { stripVariantSuffix } from '$lib/utils/gearVariants';
    import ActionIcon from '$components/UI/ActionIcon.svelte';
    import PillToggle from '$components/UI/PillToggle.svelte';
    import InfoTip from '$components/UI/InfoTip.svelte';
    import { getStyleColor } from '$lib/utils/colors';
    import { GearSlots } from '$lib/calc/rotation_builder/gear';

    let { settings, styleTab, updateDamages, openDropdown = $bindable(null), gearFilter = undefined, onFilterChange = undefined } = $props();

    const styleColorMap = { ranged: 'ranged', magic: 'magic', melee: 'melee', necro: 'necromancy' };
    let activeStyleColor = $derived(getStyleColor(styleColorMap[styleTab] ?? 'ranged'));

    // If no explicit gearFilter prop, read from settings (works for both store-based and local settings)
    let effectiveFilter = $derived(gearFilter ?? settings[SETTINGS.GEAR_FILTER]?.value ?? 'popular');

    function cycleFilter() {
        const modes = ['popular', 'owned', 'all'];
        const next = modes[(modes.indexOf(effectiveFilter) + 1) % modes.length];
        if (onFilterChange) {
            onFilterChange(next);
        } else if (settings[SETTINGS.GEAR_FILTER]) {
            // Update directly on the settings object (works for single-ability pages with local settings)
            settings[SETTINGS.GEAR_FILTER].value = next;
            if (settings[SETTINGS.USE_OWNED_GEAR]) {
                settings[SETTINGS.USE_OWNED_GEAR].value = next === 'owned';
            }
            updateDamages();
        }
    }

    const styleFolder = {
        [SettingsCombatStyles.MELEE]: 'melee',
        [SettingsCombatStyles.RANGED]: 'ranged',
        [SettingsCombatStyles.MAGIC]: 'magic',
        [SettingsCombatStyles.NECROMANCY]: 'necro',
    };

    const gearStyle = {
        [SettingsCombatStyles.MELEE]: 'melee',
        [SettingsCombatStyles.RANGED]: 'ranged',
        [SettingsCombatStyles.MAGIC]: 'magic',
        [SettingsCombatStyles.NECROMANCY]: 'necromancy',
    };

    function getSlotOptions(slot) {
        if (slot.gearSlot) {
            const items = getItemsForSlot(slot.gearSlot, gearStyle[styleTab]);
            if (effectiveFilter === 'all') return items;
            const currentValue = settings[slot.key]?.value;
            if (effectiveFilter === 'owned') {
                return items.filter(i => i.value === 'none' || i.value === currentValue || ownedItemsStore.ownedGear.has(i.value));
            }
            return items.filter(i => i.popular || i.value === 'none' || i.value === currentValue);
        }
        return settings[slot.key]?.options ?? [];
    }

    /** Get weapon options from gear registry, optionally filtered by weapon type */
    function getWeaponOptions(slot, weaponTypeFilter = null) {
        const items = getItemsForSlot(slot, gearStyle[styleTab]);
        let filtered = weaponTypeFilter
            ? items.filter(i => i.weaponType === weaponTypeFilter || i.value === 'none')
            : items;
        if (effectiveFilter !== 'all') {
            const currentMh = settings[weaponSlotsByStyle[styleTab]?.mh]?.value;
            const currentOh = settings[weaponSlotsByStyle[styleTab]?.oh]?.value;
            if (effectiveFilter === 'owned') {
                filtered = filtered.filter(i => i.value === 'none' || i.value === currentMh || i.value === currentOh || ownedItemsStore.ownedGear.has(i.value));
            } else {
                filtered = filtered.filter(i => i.popular || i.value === 'none' || i.value === currentMh || i.value === currentOh);
            }
        }
        return filtered;
    }

    /** Get display text for an item with perks */
    function itemDisplayText(itemValue, baseText, instanceIndex = 0) {
        return _itemDisplayText(itemValue, baseText, ownedItemsStore.ownedGear, instanceIndex);
    }

    /** Expand options with per-instance perk entries */
    function expandOptionsWithInstances(options) {
        return _expandOptions(options, ownedItemsStore.ownedGear);
    }

    /** Store the selected instance index for a settings key */
    function selectGearInstance(settingsKey, itemValue, instanceIndex) {
        settings[settingsKey].value = itemValue;
        // Store instance index so perk resolution knows which copy to use
        if (!settings['_gearInstances']) settings['_gearInstances'] = { value: {} };
        settings['_gearInstances'].value[settingsKey] = { itemKey: itemValue, instanceIndex };
    }

    /** Check if a specific option+instance is the currently selected one for a slot */
    function isActiveOption(settingsKey, itemValue, instanceIndex) {
        if (settings[settingsKey]?.value !== itemValue) return false;
        const gearInstances = settings['_gearInstances']?.value;
        if (!gearInstances || !gearInstances[settingsKey]) {
            // No instance tracking — default (index 0) is active
            return instanceIndex === 0;
        }
        return gearInstances[settingsKey].itemKey === itemValue &&
               gearInstances[settingsKey].instanceIndex === instanceIndex;
    }

    function isWeaponTwoHand(value) {
        if (!value || value === 'custom' || value === 'none') return false;
        const weapon = weapons[value];
        return weapon?.['weapon type'] === 'two-hand';
    }

    function isCustomWeapon(value) {
        return value?.startsWith('custom');
    }

    function onWeaponSelected(ws, value) {
        settings[ws.mh].value = value;
        openDropdown = null;
        updateDamages();
    }

    function getIconFolder(value, fallbackFolder) {
        if (!value || value === 'none') return fallbackFolder;
        const item = getItemForValue(value);
        if (!item) return fallbackFolder;
        if (item.style === 'hybrid') return 'shared';
        const styleFolderMap = { melee: 'melee', ranged: 'ranged', magic: 'magic', necromancy: 'necro' };
        return styleFolderMap[item.style] ?? fallbackFolder;
    }

    function gearIcon(settingKey, fallback, folder = 'shared') {
        const val = settings[settingKey]?.value;
        if (!val || val === 'none') return fallback;
        const base = stripVariantSuffix(val);
        if (base !== val) return `/gear_icons/${folder}/${base}.png`;
        return `/gear_icons/${folder}/${val}.png`;
    }

    function gearBadge(settingKey) {
        const val = settings[settingKey]?.value;
        return getGearBadge(val);
    }



    const armourSlotsByStyle = {
        [SettingsCombatStyles.RANGED]: [
            { key: SETTINGS.RANGED_HELMET, fallback: '/armour_icons/Head_slot.webp', gearSlot: GearSlots.HELMET },
            { key: SETTINGS.RANGED_BODY, fallback: '/armour_icons/Torso_slot.png', gearSlot: 'body' },
            { key: SETTINGS.RANGED_LEGS, fallback: '/armour_icons/Legs_slot.png', gearSlot: 'legs' },
            { key: SETTINGS.RANGED_GLOVES, fallback: '/armour_icons/Hands_slot.webp', gearSlot: 'gloves' },
            { key: SETTINGS.RANGED_BOOTS, fallback: '/armour_icons/Feet_slot.png', gearSlot: 'boots' },
            { key: SETTINGS.RANGED_NECKLACE, fallback: '/armour_icons/Neck_slot.png', gearSlot: 'necklace' },
            { key: SETTINGS.RANGED_CAPE, fallback: '/armour_icons/Back_slot.png', gearSlot: 'cape' },
            { key: SETTINGS.RANGED_RING, fallback: '/armour_icons/Ring_slot.png', gearSlot: 'ring' },
            { key: SETTINGS.RANGED_POCKET, fallback: '/armour_icons/Pocket_slot.webp', gearSlot: 'pocket' },
            { key: SETTINGS.RANGED_AMMO_SLOT, fallback: '/armour_icons/Ammo_slot.png', gearSlot: 'ammo' },
        ],
        [SettingsCombatStyles.MAGIC]: [
            { key: SETTINGS.MAGIC_HELMET, fallback: '/armour_icons/Head_slot.webp', gearSlot: 'helmet' },
            { key: SETTINGS.MAGIC_BODY, fallback: '/armour_icons/Torso_slot.png', gearSlot: 'body' },
            { key: SETTINGS.MAGIC_LEGS, fallback: '/armour_icons/Legs_slot.png', gearSlot: 'legs' },
            { key: SETTINGS.MAGIC_GLOVES, fallback: '/armour_icons/Hands_slot.webp', gearSlot: 'gloves' },
            { key: SETTINGS.MAGIC_BOOTS, fallback: '/armour_icons/Feet_slot.png', gearSlot: 'boots' },
            { key: SETTINGS.MAGIC_NECKLACE, fallback: '/armour_icons/Neck_slot.png', gearSlot: 'necklace' },
            { key: SETTINGS.MAGIC_CAPE, fallback: '/armour_icons/Back_slot.png', gearSlot: 'cape' },
            { key: SETTINGS.MAGIC_RING, fallback: '/armour_icons/Ring_slot.png', gearSlot: 'ring' },
            { key: SETTINGS.MAGIC_POCKET, fallback: '/armour_icons/Pocket_slot.webp', gearSlot: 'pocket' },
            { key: SETTINGS.MAGIC_AMMO_SLOT, fallback: '/armour_icons/Ammo_slot.png', gearSlot: 'ammo' },
        ],
        [SettingsCombatStyles.MELEE]: [
            { key: SETTINGS.MELEE_HELMET, fallback: '/armour_icons/Head_slot.webp', gearSlot: 'helmet' },
            { key: SETTINGS.MELEE_BODY, fallback: '/armour_icons/Torso_slot.png', gearSlot: 'body' },
            { key: SETTINGS.MELEE_LEGS, fallback: '/armour_icons/Legs_slot.png', gearSlot: 'legs' },
            { key: SETTINGS.MELEE_GLOVES, fallback: '/armour_icons/Hands_slot.webp', gearSlot: 'gloves' },
            { key: SETTINGS.MELEE_BOOTS, fallback: '/armour_icons/Feet_slot.png', gearSlot: 'boots' },
            { key: SETTINGS.MELEE_NECKLACE, fallback: '/armour_icons/Neck_slot.png', gearSlot: 'necklace' },
            { key: SETTINGS.MELEE_CAPE, fallback: '/armour_icons/Back_slot.png', gearSlot: 'cape' },
            { key: SETTINGS.MELEE_RING, fallback: '/armour_icons/Ring_slot.png', gearSlot: 'ring' },
            { key: SETTINGS.MELEE_POCKET, fallback: '/armour_icons/Pocket_slot.webp', gearSlot: 'pocket' },
            { key: SETTINGS.MELEE_AMMO_SLOT, fallback: '/armour_icons/Ammo_slot.png', gearSlot: 'ammo' },
        ],
        [SettingsCombatStyles.NECROMANCY]: [
            { key: SETTINGS.NECRO_HELMET, fallback: '/armour_icons/Head_slot.webp', gearSlot: 'helmet' },
            { key: SETTINGS.NECRO_BODY, fallback: '/armour_icons/Torso_slot.png', gearSlot: 'body' },
            { key: SETTINGS.NECRO_LEGS, fallback: '/armour_icons/Legs_slot.png', gearSlot: 'legs' },
            { key: SETTINGS.NECRO_GLOVES, fallback: '/armour_icons/Hands_slot.webp', gearSlot: 'gloves' },
            { key: SETTINGS.NECRO_BOOTS, fallback: '/armour_icons/Feet_slot.png', gearSlot: 'boots' },
            { key: SETTINGS.NECRO_NECKLACE, fallback: '/armour_icons/Neck_slot.png', gearSlot: 'necklace' },
            { key: SETTINGS.NECRO_CAPE, fallback: '/armour_icons/Back_slot.png', gearSlot: 'cape' },
            { key: SETTINGS.NECRO_RING, fallback: '/armour_icons/Ring_slot.png', gearSlot: 'ring' },
            { key: SETTINGS.NECRO_POCKET, fallback: '/armour_icons/Pocket_slot.webp', gearSlot: 'pocket' },
            { key: SETTINGS.NECRO_AMMO_SLOT, fallback: '/armour_icons/Ammo_slot.png', gearSlot: 'ammo' },
        ],
    };

    const weaponSlotsByStyle = {
        [SettingsCombatStyles.RANGED]: {
            mh: SETTINGS.RANGED_MH,
            oh: SETTINGS.RANGED_OH,
        },
        [SettingsCombatStyles.MAGIC]: {
            mh: SETTINGS.MAGIC_MH,
            oh: SETTINGS.MAGIC_OH,
        },
        [SettingsCombatStyles.MELEE]: {
            mh: SETTINGS.MELEE_MH,
            oh: SETTINGS.MELEE_OH,
        },
        [SettingsCombatStyles.NECROMANCY]: {
            mh: SETTINGS.NECRO_MH,
            oh: SETTINGS.NECRO_OH,
        },
    };

    const ARMOUR_PRESETS = {
        [SettingsCombatStyles.RANGED]: {
            'BIS': {
                [SETTINGS.RANGED_HELMET]: ARMOUR.ELITE_DRACOLICH_COIF,
                [SETTINGS.RANGED_BODY]: ARMOUR.ELITE_DRACOLICH_HAUBERK,
                [SETTINGS.RANGED_LEGS]: ARMOUR.ELITE_DRACOLICH_CHAPS,
                [SETTINGS.RANGED_GLOVES]: ARMOUR.ELITE_DRACOLICH_VAMBRACES,
                [SETTINGS.RANGED_BOOTS]: ARMOUR.ELITE_DRACOLICH_BOOTS,
                [SETTINGS.RANGED_NECKLACE]: ARMOUR.EOF_OR,
                [SETTINGS.RANGED_CAPE]: ARMOUR.IGNEOUS_KAL_ZUK,
                [SETTINGS.RANGED_RING]: ARMOUR.STALKERS_RING_E,
                [SETTINGS.RANGED_POCKET]: ARMOUR.FUL_BOOK,
                [SETTINGS.RANGED_AMMO_SLOT]: ARMOUR.FUL_ARROWS,
                [SETTINGS.RANGED_MH]: WEAPONS.BOW_OF_THE_LAST_GUARDIAN_IM,
            },
            'Elite Dracolich': {
                [SETTINGS.RANGED_HELMET]: ARMOUR.ELITE_DRACOLICH_COIF,
                [SETTINGS.RANGED_BODY]: ARMOUR.ELITE_DRACOLICH_HAUBERK,
                [SETTINGS.RANGED_LEGS]: ARMOUR.ELITE_DRACOLICH_CHAPS,
                [SETTINGS.RANGED_GLOVES]: ARMOUR.ELITE_DRACOLICH_VAMBRACES,
                [SETTINGS.RANGED_BOOTS]: ARMOUR.ELITE_DRACOLICH_BOOTS,
            },
            'Dracolich': {
                [SETTINGS.RANGED_HELMET]: ARMOUR.DRACOLICH_COIF,
                [SETTINGS.RANGED_BODY]: ARMOUR.DRACOLICH_HAUBERK,
                [SETTINGS.RANGED_LEGS]: ARMOUR.DRACOLICH_CHAPS,
                [SETTINGS.RANGED_GLOVES]: ARMOUR.DRACOLICH_VAMBRACES,
                [SETTINGS.RANGED_BOOTS]: ARMOUR.DRACOLICH_BOOTS,
            },
            'Elite Sirenic': {
                [SETTINGS.RANGED_HELMET]: ARMOUR.ELITE_SIRENIC_MASK,
                [SETTINGS.RANGED_BODY]: ARMOUR.ELITE_SIRENIC_HAUBERK,
                [SETTINGS.RANGED_LEGS]: ARMOUR.ELITE_SIRENIC_CHAPS,
            },
            'Sirenic': {
                [SETTINGS.RANGED_HELMET]: ARMOUR.SIRENIC_MASK,
                [SETTINGS.RANGED_BODY]: ARMOUR.SIRENIC_HAUBERK,
                [SETTINGS.RANGED_LEGS]: ARMOUR.SIRENIC_CHAPS,
            },
            'None': {
                [SETTINGS.RANGED_HELMET]: ARMOUR.NONE,
                [SETTINGS.RANGED_BODY]: ARMOUR.NONE,
                [SETTINGS.RANGED_LEGS]: ARMOUR.NONE,
                [SETTINGS.RANGED_GLOVES]: ARMOUR.NONE,
                [SETTINGS.RANGED_BOOTS]: ARMOUR.NONE,
                [SETTINGS.RANGED_NECKLACE]: ARMOUR.NONE,
                [SETTINGS.RANGED_CAPE]: ARMOUR.NONE,
                [SETTINGS.RANGED_RING]: ARMOUR.NONE,
                [SETTINGS.RANGED_POCKET]: ARMOUR.NONE,
            },
        },
        [SettingsCombatStyles.MAGIC]: {
            'BIS': {
                [SETTINGS.MAGIC_HELMET]: ARMOUR.TUMEKENS_MASK,
                [SETTINGS.MAGIC_BODY]: ARMOUR.TUMEKENS_ROBE_TOP,
                [SETTINGS.MAGIC_LEGS]: ARMOUR.TUMEKENS_ROBE_BOTTOM,
                [SETTINGS.MAGIC_GLOVES]: ARMOUR.TUMEKENS_GLOVES,
                [SETTINGS.MAGIC_BOOTS]: ARMOUR.TUMEKENS_BOOTS,
                [SETTINGS.MAGIC_NECKLACE]: ARMOUR.EOF_OR,
                [SETTINGS.MAGIC_CAPE]: ARMOUR.IGNEOUS_KAL_ZUK,
                [SETTINGS.MAGIC_RING]: ARMOUR.CHANNELLERS_RING_E,
                [SETTINGS.MAGIC_POCKET]: ARMOUR.ERETHDORS_GRIMOIRE,
                [SETTINGS.MAGIC_MH]: WEAPONS.FRACTURED_STAFF_OF_ARMADYL_IM
            },
            'Elite Tectonic': {
                [SETTINGS.MAGIC_HELMET]: ARMOUR.ELITE_TECTONIC_MASK,
                [SETTINGS.MAGIC_BODY]: ARMOUR.ELITE_TECTONIC_ROBE_TOP,
                [SETTINGS.MAGIC_LEGS]: ARMOUR.ELITE_TECTONIC_ROBE_BOTTOM,
            },
            'Tectonic': {
                [SETTINGS.MAGIC_HELMET]: ARMOUR.TECTONIC_MASK,
                [SETTINGS.MAGIC_BODY]: ARMOUR.TECTONIC_ROBE_TOP,
                [SETTINGS.MAGIC_LEGS]: ARMOUR.TECTONIC_ROBE_BOTTOM,
            },
            'Virtus': {
                [SETTINGS.MAGIC_HELMET]: ARMOUR.VIRTUS_MASK,
                [SETTINGS.MAGIC_BODY]: ARMOUR.VIRTUS_ROBE_TOP,
                [SETTINGS.MAGIC_LEGS]: ARMOUR.VIRTUS_ROBE_LEGS,
            },
            'None': {
                [SETTINGS.MAGIC_HELMET]: ARMOUR.NONE,
                [SETTINGS.MAGIC_BODY]: ARMOUR.NONE,
                [SETTINGS.MAGIC_LEGS]: ARMOUR.NONE,
                [SETTINGS.MAGIC_GLOVES]: ARMOUR.NONE,
                [SETTINGS.MAGIC_BOOTS]: ARMOUR.NONE,
                [SETTINGS.MAGIC_NECKLACE]: ARMOUR.NONE,
                [SETTINGS.MAGIC_CAPE]: ARMOUR.NONE,
                [SETTINGS.MAGIC_RING]: ARMOUR.NONE,
                [SETTINGS.MAGIC_POCKET]: ARMOUR.NONE,
            },
        },
        [SettingsCombatStyles.MELEE]: {
            'BIS': {
                [SETTINGS.MELEE_HELMET]: ARMOUR.VESTMENTS_OF_HAVOC_HOOD,
                [SETTINGS.MELEE_BODY]: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_TOP,
                [SETTINGS.MELEE_LEGS]: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_BOTTOM,
                [SETTINGS.MELEE_GLOVES]: ARMOUR.GLOVES_OF_PASSAGE_E,
                [SETTINGS.MELEE_BOOTS]: ARMOUR.VESTMENTS_OF_HAVOC_BOOTS,
                [SETTINGS.MELEE_NECKLACE]: ARMOUR.AM_HEJ,
                [SETTINGS.MELEE_CAPE]: ARMOUR.IGNEOUS_KAL_ZUK,
                [SETTINGS.MELEE_RING]: ARMOUR.REAVERS_RING,
                [SETTINGS.MELEE_POCKET]: ARMOUR.FUL_BOOK,
                [SETTINGS.MELEE_MH]: WEAPONS.EZK_IM
            },
            'Trimmed Masterwork': {
                [SETTINGS.MELEE_HELMET]: ARMOUR.TMW_MELEE_HELM,
                [SETTINGS.MELEE_BODY]: ARMOUR.TMW_MELEE_PLATEBODY,
                [SETTINGS.MELEE_LEGS]: ARMOUR.TMW_MELEE_PLATELEGS,
                [SETTINGS.MELEE_GLOVES]: ARMOUR.TMW_MELEE_GLOVES,
                [SETTINGS.MELEE_BOOTS]: ARMOUR.TMW_MELEE_BOOTS,
            },
            'Masterwork': {
                [SETTINGS.MELEE_HELMET]: ARMOUR.MASTERWORK_MELEE_HELM,
                [SETTINGS.MELEE_BODY]: ARMOUR.MASTERWORK_MELEE_PLATEBODY,
                [SETTINGS.MELEE_LEGS]: ARMOUR.MASTERWORK_MELEE_PLATELEGS,
                [SETTINGS.MELEE_GLOVES]: ARMOUR.MASTERWORK_MELEE_GLOVES,
                [SETTINGS.MELEE_BOOTS]: ARMOUR.MASTERWORK_MELEE_BOOTS,
            },
            'Vestments of Havoc': {
                [SETTINGS.MELEE_HELMET]: ARMOUR.VESTMENTS_OF_HAVOC_HOOD,
                [SETTINGS.MELEE_BODY]: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_TOP,
                [SETTINGS.MELEE_LEGS]: ARMOUR.VESTMENTS_OF_HAVOC_ROBE_BOTTOM,
                [SETTINGS.MELEE_BOOTS]: ARMOUR.VESTMENTS_OF_HAVOC_BOOTS,
            },
            'None': {
                [SETTINGS.MELEE_HELMET]: ARMOUR.NONE,
                [SETTINGS.MELEE_BODY]: ARMOUR.NONE,
                [SETTINGS.MELEE_LEGS]: ARMOUR.NONE,
                [SETTINGS.MELEE_GLOVES]: ARMOUR.NONE,
                [SETTINGS.MELEE_BOOTS]: ARMOUR.NONE,
                [SETTINGS.MELEE_NECKLACE]: ARMOUR.NONE,
                [SETTINGS.MELEE_CAPE]: ARMOUR.NONE,
                [SETTINGS.MELEE_RING]: ARMOUR.NONE,
                [SETTINGS.MELEE_POCKET]: ARMOUR.NONE,
            },
        },
        [SettingsCombatStyles.NECROMANCY]: {
            'BIS': {
                [SETTINGS.NECRO_HELMET]: ARMOUR.TFN_CROWN,
                [SETTINGS.NECRO_BODY]: ARMOUR.TFN_ROBE_TOP,
                [SETTINGS.NECRO_LEGS]: ARMOUR.TFN_ROBE_BOTTOM,
                [SETTINGS.NECRO_GLOVES]: ARMOUR.TFN_HAND_WRAP,
                [SETTINGS.NECRO_BOOTS]: ARMOUR.TFN_FOOT_WRAPS,
                [SETTINGS.NECRO_NECKLACE]: ARMOUR.EOF_OR,
                [SETTINGS.NECRO_CAPE]: ARMOUR.IGNEOUS_KAL_ZUK,
                [SETTINGS.NECRO_RING]: ARMOUR.REAVERS_RING,
                [SETTINGS.NECRO_POCKET]: ARMOUR.ERETHDORS_GRIMOIRE,
                [SETTINGS.NECRO_MH]: WEAPONS.OMNI_GUARD_IM,
                [SETTINGS.NECRO_OH]: WEAPONS.SOULBOUND_LANTERN_IM,
            },
            'First Necromancer (t110)': {
                [SETTINGS.NECRO_HELMET]: ARMOUR.TFN_CROWN,
                [SETTINGS.NECRO_BODY]: ARMOUR.TFN_ROBE_TOP,
                [SETTINGS.NECRO_LEGS]: ARMOUR.TFN_ROBE_BOTTOM,
                [SETTINGS.NECRO_GLOVES]: ARMOUR.TFN_HAND_WRAP,
                [SETTINGS.NECRO_BOOTS]: ARMOUR.TFN_FOOT_WRAPS,
            },
            'Deathdealer (t90)': {
                [SETTINGS.NECRO_HELMET]: ARMOUR.DEATHDEALER_HOOD_T90,
                [SETTINGS.NECRO_BODY]: ARMOUR.DEATHDEALER_ROBE_TOP_T90,
                [SETTINGS.NECRO_LEGS]: ARMOUR.DEATHDEALER_ROBE_BOTTOM_T90,
                [SETTINGS.NECRO_GLOVES]: ARMOUR.DEATHDEALER_GLOVES_T90,
                [SETTINGS.NECRO_BOOTS]: ARMOUR.DEATHDEALER_BOOTS_T90,
            },
        },
    };

    let selectedPreset = $state('');

    function applyArmourPreset(presetName) {
        const presets = ARMOUR_PRESETS[styleTab];
        if (!presets || !presets[presetName]) return;
        const preset = presets[presetName];
        for (const [settingKey, value] of Object.entries(preset)) {
            settings[settingKey]['value'] = value;
        }
        selectedPreset = '';
        updateDamages();
    }
</script>

<div class="flex items-center justify-center gap-2 mb-4">
    <h5 class="uppercase font-bold text-lg text-center">
        <InfoTip text="The default setting for gear is [b:All]. [b:Popular] shows only meta gear. [b:Owned] shows the gear you own, which
        can be configured in the [b:Actions] interface. When using owned gear, [pe:perks] are applied item by item, not globally.">
            Armour
        </InfoTip>
    </h5>
    <PillToggle value={effectiveFilter} onchange={cycleFilter} />
</div>
<div class="flex flex-wrap gap-2 justify-center mb-3" style="--style-color: {activeStyleColor}">
    {#each (armourSlotsByStyle[styleTab] ?? []) as slot}
        {@const slotOptions = getSlotOptions(slot)}
        {@const iconFolder = slot.gearSlot ? getIconFolder(settings[slot.key]?.value, styleFolder[styleTab]) : styleFolder[styleTab]}
        <div class="relative">
            <ActionIcon
                value={settings[slot.key]?.value ?? 'none'}
                folder={iconFolder}
                fallback={slot.fallback}
                size="md"
                active={settings[slot.key]?.value && settings[slot.key]?.value !== 'none'}
                borderColor={activeStyleColor}
                title="{settings[slot.key]?.label ?? slot.key}: {slotOptions.find(o => o.value === settings[slot.key]?.value)?.text ?? 'None'}"
                onclick={() => { openDropdown = openDropdown === slot.key ? null : slot.key; }}
                oncontextmenu={(e) => { e.preventDefault(); if (settings[slot.key]) { settings[slot.key].value = 'none'; updateDamages(); } }}
            />
            {#if openDropdown === slot.key}
                {@const expandedOptions = expandOptionsWithInstances(slotOptions)}
                <div class="icon-dropdown" style="min-width: 160px;">
                    {#each expandedOptions as option}
                        <button
                            type="button"
                            class="icon-dropdown-item"
                            class:active={isActiveOption(slot.key, option.value, option.instanceIndex ?? 0)}
                            onclick={() => { selectGearInstance(slot.key, option.value, option.instanceIndex ?? 0); openDropdown = null; updateDamages(); }}
                        >
                            {option.text}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
    <!-- Weapon: combined MH + 2H dropdown, OH -->
    {#each [weaponSlotsByStyle[styleTab]].filter(Boolean) as ws}
        {@const is2h = isWeaponTwoHand(settings[ws.mh]?.value)}
        {@const mhItems = getWeaponOptions('mainhand', 'main-hand')}
        {@const thItems = getWeaponOptions('mainhand', 'two-hand')}
        {@const ohItems = getWeaponOptions('offhand')}
        {@const currentValue = settings[ws.mh]?.value}
        {@const weaponBaseText = [...mhItems, ...thItems].find(o => o.value === currentValue)?.text ?? 'Custom'}
        {@const weaponText = itemDisplayText(currentValue, weaponBaseText)}
        <div class="relative">
            <ActionIcon
                value={settings[ws.mh]?.value ?? 'none'}
                folder={styleFolder[styleTab]}
                fallback="/armour_icons/Main_hand_slot.webp"
                size="md"
                active={!!currentValue && currentValue !== 'none'}
                borderColor={activeStyleColor}
                title="Weapon: {weaponText}{is2h ? ' (2H)' : ''}"
                onclick={() => { openDropdown = openDropdown === 'weapon_combined' ? null : 'weapon_combined'; }}
                oncontextmenu={(e) => { e.preventDefault(); if (settings[ws.mh]) { settings[ws.mh].value = 'none'; updateDamages(); } }}
            />
            {#if openDropdown === 'weapon_combined'}
                {@const expandedMh = expandOptionsWithInstances(mhItems)}
                {@const expandedTh = expandOptionsWithInstances(thItems)}
                <div class="icon-dropdown" style="min-width: 180px;">
                    {#if expandedMh.length > 0}
                        <div style="padding: 0.2rem 0.5rem; font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Main-hand</div>
                        {#each expandedMh as option}
                            <button type="button" class="icon-dropdown-item"
                                class:active={isActiveOption(ws.mh, option.value, option.instanceIndex ?? 0) && !is2h}
                                onclick={() => { selectGearInstance(ws.mh, option.value, option.instanceIndex ?? 0); openDropdown = null; updateDamages(); }}
                            >{option.text}</button>
                        {/each}
                    {/if}
                    {#if expandedTh.length > 0}
                        <div style="padding: 0.2rem 0.5rem; font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 0.2rem;">Two-handed</div>
                        {#each expandedTh as option}
                            <button type="button" class="icon-dropdown-item"
                                class:active={isActiveOption(ws.mh, option.value, option.instanceIndex ?? 0) && is2h}
                                onclick={() => { selectGearInstance(ws.mh, option.value, option.instanceIndex ?? 0); openDropdown = null; updateDamages(); }}
                            >{option.text}</button>
                        {/each}
                    {/if}
                </div>
            {/if}
        </div>
        <!-- OH: only show when dual-wield -->
        {#if !is2h && ws.oh && settings[ws.oh]}
            <div class="relative">
                <ActionIcon
                    value={settings[ws.oh]?.value ?? 'none'}
                    folder={styleFolder[styleTab]}
                    fallback="/armour_icons/Off-hand_slot.webp"
                    size="md"
                    active={settings[ws.oh]?.value && settings[ws.oh]?.value !== 'none'}
                    borderColor={activeStyleColor}
                    title="Off-hand: {ohItems.find(o => o.value === settings[ws.oh]?.value)?.text ?? 'None'}"
                    onclick={() => { openDropdown = openDropdown === ws.oh ? null : ws.oh; }}
                    oncontextmenu={(e) => { e.preventDefault(); if (settings[ws.oh]) { settings[ws.oh].value = 'none'; updateDamages(); } }}
                />
                {#if openDropdown === ws.oh}
                    {@const expandedOh = expandOptionsWithInstances(ohItems)}
                    <div class="icon-dropdown" style="min-width: 160px;">
                        {#each expandedOh as option}
                            <button type="button" class="icon-dropdown-item"
                                class:active={isActiveOption(ws.oh, option.value, option.instanceIndex ?? 0)}
                                onclick={() => { selectGearInstance(ws.oh, option.value, option.instanceIndex ?? 0); openDropdown = null; updateDamages(); }}
                            >{option.text}</button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
        <!-- Custom tier inputs -->
        {#if is2h && isCustomWeapon(currentValue) && settings[SETTINGS.TH_TIER_CUSTOM]}
            <input type="number" class="custom-tier-input" min="1" max="120"
                bind:value={settings[SETTINGS.TH_TIER_CUSTOM].value}
                oninput={updateDamages}
                title="Two-hand weapon tier"
                placeholder="Tier"
            />
        {/if}
        {#if !is2h && isCustomWeapon(currentValue) && settings[SETTINGS.MH_TIER_CUSTOM]}
            <input type="number" class="custom-tier-input" min="1" max="120"
                bind:value={settings[SETTINGS.MH_TIER_CUSTOM].value}
                oninput={updateDamages}
                title="Main-hand weapon tier"
                placeholder="MH"
            />
        {/if}
        {#if !is2h && isCustomWeapon(settings[ws.oh]?.value) && settings[SETTINGS.OH_TIER_CUSTOM]}
            <input type="number" class="custom-tier-input" min="1" max="120"
                bind:value={settings[SETTINGS.OH_TIER_CUSTOM].value}
                oninput={updateDamages}
                title="Off-hand weapon tier"
                placeholder="OH"
            />
        {/if}
    {/each}
    {#if styleTab === SettingsCombatStyles.RANGED && settings[SETTINGS.QUIVER] != null}
        <button
            type="button"
            class="stack-toggle"
            class:stack-active={settings[SETTINGS.QUIVER]?.value}
            title="Pernix Quiver (+4% damage when target ≤25% HP)"
            onclick={() => { settings[SETTINGS.QUIVER].value = !settings[SETTINGS.QUIVER].value; updateDamages(); }}
        >
            <img src="/gear_icons/ranged/pernix quiver.png" alt="Pernix Quiver" class="w-7 h-7 object-contain"
                onerror={(e) => { e.target.onerror = null; e.target.src = '/armour_icons/Ammo_slot.png'; }}
            />
        </button>
    {/if}
    {#if styleTab === SettingsCombatStyles.MAGIC && settings[SETTINGS.AUTO_CAST]}
        <div class="relative">
            <button
                type="button"
                class="stack-toggle"
                class:stack-active={settings[SETTINGS.AUTO_CAST]?.value && settings[SETTINGS.AUTO_CAST]?.value !== 'none'}
                title="Auto Cast: {settings[SETTINGS.AUTO_CAST]?.options?.find(o => o.value === settings[SETTINGS.AUTO_CAST]?.value)?.text ?? 'None'}"
                onclick={() => { openDropdown = openDropdown === SETTINGS.AUTO_CAST ? null : SETTINGS.AUTO_CAST; }}
            >
                <img
                    src={
                        settings[SETTINGS.AUTO_CAST]?.value === 'exsanguinate' ? '/effect_icons/Exsanguinate_icon.webp' : 
                        settings[SETTINGS.AUTO_CAST]?.value === 'incite fear' ? '/ability_icons/magic/Incite_Fear_icon.webp' :
                        settings[SETTINGS.AUTO_CAST]?.value === 'crumble undead' ? '/ability_icons/magic/Crumble_Undead_icon.png' 
                        : '/ability_icons/magic/Vanilla_fudge_log.png'}
                    alt="Auto Cast"
                    class="w-7 h-7 object-contain"
                />
            </button>
            {#if openDropdown === SETTINGS.AUTO_CAST}
                <div class="icon-dropdown" style="min-width: 140px;">
                    {#each settings[SETTINGS.AUTO_CAST]?.options ?? [] as option}
                        <button
                            type="button"
                            class="icon-dropdown-item"
                            class:active={settings[SETTINGS.AUTO_CAST]?.value === option.value}
                            onclick={() => { settings[SETTINGS.AUTO_CAST].value = option.value; openDropdown = null; updateDamages(); }}
                        >
                            {option.text}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>
{#if ARMOUR_PRESETS[styleTab]}
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; padding: 0.4rem 0.5rem; background: rgba(255,255,255,0.05); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
        <span style="font-size: 0.75rem; color: #aaa; white-space: nowrap;">Preset</span>
        <select
            style="flex: 1; background: rgba(0,0,0,0.3); color: #ddd; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 0.25rem 0.4rem; font-size: 0.8rem; cursor: pointer;"
            bind:value={selectedPreset}
            onchange={() => { if (selectedPreset) applyArmourPreset(selectedPreset); }}
        >
            <option value="">-- Select preset --</option>
            {#each Object.keys(ARMOUR_PRESETS[styleTab]) as name}
                <option value={name}>{name}</option>
            {/each}
        </select>
    </div>
{/if}

<style>
    .stack-toggle {
        position: relative;
        padding: 4px;
        border: 2px solid transparent;
        border-radius: 6px;
        opacity: 0.4;
        cursor: pointer;
        transition: all 0.15s ease;
        background: none;
    }
    .stack-toggle:hover { opacity: 0.7; }
    .stack-active { opacity: 1; border-color: var(--style-color, var(--style-color, #4ade80)); }
    .stack-count {
        position: absolute;
        bottom: -2px;
        right: -2px;
        font-size: 0.6rem;
        font-weight: bold;
        color: white;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 3px;
        padding: 0 3px;
        line-height: 1.2;
    }
    .icon-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 20;
        background: #1e293b;
        border: 1px solid var(--style-color, #4ade80);
        border-radius: 6px;
        max-height: 200px;
        overflow-y: auto;
        margin-top: 2px;
    }
    .icon-dropdown-item {
        display: block;
        width: 100%;
        padding: 4px 8px;
        text-align: left;
        font-size: 0.75rem;
        color: #ccc;
        background: none;
        border: none;
        cursor: pointer;
    }
    .icon-dropdown-item:hover { background: rgba(255, 255, 255, 0.1); }
    .icon-dropdown-item.active { color: var(--style-color, #4ade80); font-weight: bold; }
    .custom-tier-input {
        width: 42px;
        background: rgba(0, 0, 0, 0.3);
        color: #ddd;
        border: 2px solid var(--style-color, #4ade80);
        border-radius: 6px;
        padding: 4px 6px;
        font-size: 0.75rem;
        text-align: center;
        height: 35px;
        align-self: center;
    }
    .custom-tier-input:focus {
        outline: none;
        border-color: #6ee7b7;
    }
</style>
