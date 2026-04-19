<script>
    import { onMount } from 'svelte';
import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
    import Checkbox from '../../components/Settings/Checkbox.svelte';
    import Number from '../../components/Settings/Number.svelte';
    import Select from '../../components/Settings/Select.svelte';
    import GearSelection from '../../components/Settings/GearSelection.svelte';
    import PerkSelection from '../../components/Settings/PerkSelection.svelte';
    import FamiliarSelection from '../../components/Settings/FamiliarSelection.svelte';
    import BuffSelection from '../../components/Settings/BuffSelection.svelte';
    import InfoTip from '../UI/InfoTip.svelte';
    import GearManager from '../../components/Settings/GearManager.svelte';
    import ActionIcon from '../UI/ActionIcon.svelte';
    import TabButton from '../UI/TabButton.svelte';
    import GradientSeparator from '../UI/GradientSeparator.svelte';
    import ToggleButton from '../UI/ToggleButton.svelte';
    import PillToggle from '../UI/PillToggle.svelte';
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { SettingsCombatStyles } from '$lib/calc/rotation_builder/types/SettingsCombatStyles.ts';
    import { settingsStore, settingsActions, initializeSettings } from '$lib/stores/settingsStore.svelte.js';
    import { bossPresets, getBossPresetWithEnrage } from '$lib/data/bosses/boss_presets';
    import { familiars, calculateFamiliarHitChance } from '$lib/data/familiars';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import { getStyleColor } from '$lib/utils/colors';
    import { perks as perkDefs, formatPerkAbbrev } from '$lib/data/perks';
    import { STYLE_COLORS } from '$lib/utils/colors';
    import { weapons } from '$lib/data/weapons';
    import '../../css/style.css';
    let { tab = 'general', styleTab = SettingsCombatStyles.RANGED, stacks, updateDamages, refreshUI, uiState } = $props();

    // Local reference to settings store
    let settings = $derived(settingsStore.settings);
    const styleColorMap = { ranged: 'ranged', magic: 'magic', melee: 'melee', necro: 'necromancy' };
    let activeStyleColor = $derived(getStyleColor(styleColorMap[styleTab] ?? 'ranged'));
    let showGearManager = $state(false);
    let gearFilter = $derived(settings[SETTINGS.GEAR_FILTER]?.value ?? 'popular');
    let useOwnedGearPerks = $derived(gearFilter === 'owned');

    function setGearFilter(value) {
        if (settings[SETTINGS.GEAR_FILTER]) {
            settings[SETTINGS.GEAR_FILTER].value = value;
        }
        if (settings[SETTINGS.USE_OWNED_GEAR]) {
            settings[SETTINGS.USE_OWNED_GEAR].value = value === 'owned';
        }
        settingsActions.saveSettings();
        updateDamages();
    }

    // Weapon slot keys by style
    const weaponKeysByStyle = {
        [SettingsCombatStyles.MELEE]: { mh: SETTINGS.MELEE_MH, oh: SETTINGS.MELEE_OH },
        [SettingsCombatStyles.RANGED]: { mh: SETTINGS.RANGED_MH, oh: SETTINGS.RANGED_OH },
        [SettingsCombatStyles.MAGIC]: { mh: SETTINGS.MAGIC_MH, oh: SETTINGS.MAGIC_OH },
        [SettingsCombatStyles.NECROMANCY]: { mh: SETTINGS.NECRO_MH, oh: SETTINGS.NECRO_OH },
    };
    const bodyKeysByStyle = {
        [SettingsCombatStyles.MELEE]: SETTINGS.MELEE_BODY,
        [SettingsCombatStyles.RANGED]: SETTINGS.RANGED_BODY,
        [SettingsCombatStyles.MAGIC]: SETTINGS.MAGIC_BODY,
        [SettingsCombatStyles.NECROMANCY]: SETTINGS.NECRO_BODY,
    };
    const legsKeysByStyle = {
        [SettingsCombatStyles.MELEE]: SETTINGS.MELEE_LEGS,
        [SettingsCombatStyles.RANGED]: SETTINGS.RANGED_LEGS,
        [SettingsCombatStyles.MAGIC]: SETTINGS.MAGIC_LEGS,
        [SettingsCombatStyles.NECROMANCY]: SETTINGS.NECRO_LEGS,
    };

    // Get perks for an equipped item
    function getEquippedPerks(settingsKey) {
        const itemKey = settings[settingsKey]?.value;
        if (!itemKey || itemKey === 'none' || itemKey.startsWith('custom')) return [];
        const instances = ownedItemsStore.ownedGear.get(itemKey);
        if (!instances || instances.length === 0) return [];
        // Use first instance (or selected instance if tracked)
        const gearInstances = settings['_gearInstances']?.value;
        const instanceInfo = gearInstances?.[settingsKey];
        const idx = (instanceInfo?.itemKey === itemKey) ? instanceInfo.instanceIndex : 0;
        return instances[idx]?.perks ?? [];
    }

    // Active perks display grouped by slot
    let weaponPerks = $derived.by(() => {
        if (!useOwnedGearPerks) return [];
        const wk = weaponKeysByStyle[styleTab];
        if (!wk) return [];
        const mhVal = settings[wk.mh]?.value;
        const is2h = mhVal && weapons[mhVal]?.['weapon type'] === 'two-hand';
        const mhPerks = getEquippedPerks(wk.mh);
        const ohPerks = is2h ? [] : getEquippedPerks(wk.oh);
        return [...mhPerks, ...ohPerks];
    });
    let bodyPerks = $derived.by(() => {
        if (!useOwnedGearPerks) return [];
        const key = bodyKeysByStyle[styleTab];
        return key ? getEquippedPerks(key) : [];
    });
    let legsPerks = $derived.by(() => {
        if (!useOwnedGearPerks) return [];
        const key = legsKeysByStyle[styleTab];
        return key ? getEquippedPerks(key) : [];
    });

    let editingStack = $state(null);
    let openDropdown = $state(null);
    function focusOnMount(node) { node.focus(); node.select(); }

    let maxAdrenaline = $derived.by(() => {
        let max = 100;
        const hasFullVestments =
            settings[SETTINGS.MELEE_HELMET]?.value === ARMOUR.VESTMENTS_OF_HAVOC_HOOD &&
            settings[SETTINGS.MELEE_BODY]?.value === ARMOUR.VESTMENTS_OF_HAVOC_ROBE_TOP &&
            settings[SETTINGS.MELEE_LEGS]?.value === ARMOUR.VESTMENTS_OF_HAVOC_ROBE_BOTTOM &&
            settings[SETTINGS.MELEE_BOOTS]?.value === ARMOUR.VESTMENTS_OF_HAVOC_BOOTS;
        if (hasFullVestments) max += 20;
        if (settings[SETTINGS.HEIGHTENED_SENSES]?.value) max += 10;
        return max;
    });

    let stackLimits = $derived({
        [SETTINGS.PERFECT_EQUILIBRIUM_STACKS]: 7,
        [SETTINGS.ICY_CHILL_STACKS]: 10,
        [SETTINGS.BLOOD_TITHE]: 12,
        [SETTINGS.GLACIAL_EMBRACE]: 5,
        [SETTINGS.ESSENCE_CORRUPTION]: 100,
        [SETTINGS.PRIMORDIAL_ICE]: 10,
        [SETTINGS.ADRENALINE]: maxAdrenaline,
        [SETTINGS.FAMILIAR_SPEC_POINTS]: 60,


        [SETTINGS.NECROSIS_STACKS]: 12,
        [SETTINGS.DEATH_SPARK_STACKS]: 5,
        [SETTINGS.SOUL_REAVE_STACKS]: 4,
    });
    function clampStack(key, val) {
        const v = parseInt(val) || 0;
        const max = stackLimits[key] ?? 999;
        return Math.max(0, Math.min(v, max));
    }

    const prayerSettingByStyle = {
        [SettingsCombatStyles.RANGED]: SETTINGS.RANGED_PRAYER,
        [SettingsCombatStyles.MAGIC]: SETTINGS.MAGIC_PRAYER,
        [SettingsCombatStyles.MELEE]: SETTINGS.MELEE_PRAYER,
        [SettingsCombatStyles.NECROMANCY]: SETTINGS.NECRO_PRAYER,
    };
    const prayerIconByStyle = {
        [SettingsCombatStyles.RANGED]: '/effect_icons/ranged_prayer.webp',
        [SettingsCombatStyles.MAGIC]: '/effect_icons/magic_prayer.webp',
        [SettingsCombatStyles.MELEE]: '/effect_icons/melee_prayer.webp',
        [SettingsCombatStyles.NECROMANCY]: '/effect_icons/necro_prayer.webp',
    };

    const familiarIcons = {
        [SETTINGS.FAMILIAR_VALUES.RIPPER_DEMON]: '/familiars/Ripper_Demon_chathead.png',
        [SETTINGS.FAMILIAR_VALUES.KALGERION_DEMON]: '/familiars/Kal\'gerion_demon_(familiar)_chathead.png',
        [SETTINGS.FAMILIAR_VALUES.STEEL_TITAN]: '/familiars/Steel_titan_chathead.png',
    };

    const BOLT_AMMO = [ARMOUR.HYDRIX_BAKRIMINEL_BOLTS_E];
    const ARROW_AMMO = [
        ARMOUR.FUL_ARROWS, ARMOUR.WEN_ARROWS,
        ARMOUR.JAS_ARROWS, ARMOUR.DEATHSPORE_ARROWS,
        ARMOUR.BIK_ARROWS
    ];

    // Sorted boss names for dropdown
    const bossNames = Object.keys(bossPresets).sort((a, b) => a.localeCompare(b));
    let bossFilter = $state('popular');

    function updateBossOptions() {
        const filtered = bossFilter === 'popular'
            ? bossNames.filter(key => bossPresets[key].popular)
            : bossNames;
        settings[SETTINGS.BOSS_PRESET].options = [
            { value: 'none', text: 'None' },
            ...filtered.map(key => ({ value: key, text: bossPresets[key].name }))
        ];
    }

    // Enrage tracking
    let enrageValue = $state(0);

    /** Get the effective boss preset, accounting for enrage if applicable */
    function getEffectiveBoss(bossKey) {
        if (!bossKey || bossKey === 'none') return null;
        const base = bossPresets[bossKey];
        if (!base) return null;
        if (base.enrage) return getBossPresetWithEnrage(bossKey, enrageValue);
        return base;
    }

    // Convert NPC armour tier to actual armour stat
    // Formula from PVME Familiar Damage sheet: round(0.002 * tier^3 + 10 * tier + 100)
    function armourFromTier(tier) {
        if (tier === 0) return 0;
        if (tier < 100) return Math.round(0.002 * tier * tier * tier + 10 * tier + 100);
        return tier; // tier >= 100 means raw armour value
    }

    // Recalculate familiar accuracy from boss preset + familiar selection
    function recalcFamiliarAccuracy() {
        const bossKey = settings[SETTINGS.BOSS_PRESET]?.value;
        const familiarKey = settings[SETTINGS.FAMILIAR]?.value;
        if (!bossKey || bossKey === 'none') {
            if (settings[SETTINGS.FAMILIAR_ACCURACY]) {
                settings[SETTINGS.FAMILIAR_ACCURACY].value = 100;
                updateDamages();
            }
            return;
        }
        if (!familiarKey || familiarKey === 'none') return;

        const boss = getEffectiveBoss(bossKey);
        const familiar = familiars[familiarKey];
        if (!boss || !familiar) return;

        const finalArmour = armourFromTier(boss.armour);

        const hitChance = calculateFamiliarHitChance(
            familiar,
            finalArmour,
            { melee: boss.affinities.melee, ranged: boss.affinities.ranged, magic: boss.affinities.magic }
        );

        settings[SETTINGS.FAMILIAR_ACCURACY].value = Math.round(hitChance * 100);
        updateDamages();
    }

    // Handle boss selection change — reset enrage to default
    function onBossChange() {
        const bossKey = settings[SETTINGS.BOSS_PRESET]?.value;
        const base = bossKey && bossKey !== 'none' ? bossPresets[bossKey] : null;
        enrageValue = base?.enrage?.default ?? 0;
        settings[SETTINGS.BOSS_ENRAGE].value = enrageValue;
        recalcFamiliarAccuracy();
    }

    // Handle enrage slider change
    function onEnrageChange() {
        settings[SETTINGS.BOSS_ENRAGE].value = enrageValue;
        recalcFamiliarAccuracy();
    }

    function getAmmoWarning(settings) {
        if (!settings?.[SETTINGS.AMMO]) return null;
        const ammo = settings[SETTINGS.AMMO].value;
        const weaponType = settings[SETTINGS.WEAPON]?.value;
        const thType = settings[SETTINGS.TH_TYPE_CUSTOM]?.value;
        const isBow = thType === SETTINGS.TH_TYPE_CUSTOM_VALUES.BOW;

        if (weaponType === SETTINGS.WEAPON_VALUES.TH) {
            if (BOLT_AMMO.includes(ammo) && isBow) return 'Bolts require a crossbow, not a bow.';
            if (ARROW_AMMO.includes(ammo) && !isBow) return 'Arrows require a bow, not a crossbow.';
        }
        if (weaponType === SETTINGS.WEAPON_VALUES.DW && ARROW_AMMO.includes(ammo)) {
            return 'Arrows require a bow — dual wield cannot use arrows.';
        }
        return null;
    }

    // Initialize settings on component mount
    onMount(async () => {
        await initializeSettings();

        // Populate boss preset options from boss_presets data
        updateBossOptions();

        // debugPreset2();
        settings[SETTINGS.UNDEAD_SLAYER_ABILITY]['value'] = false;
        settings[SETTINGS.BLACKHOLE]['value'] = false;
        settings[SETTINGS.SMOKE_CLOUD]['value'] = false;
        // settings[SETTINGS.KERAPACS_WRIST_WRAPS]['value'] = false;

    });
        
    updateDamages();


</script>

<div class="xl:col-span-6 xl:row-start-1 xl:row-span-1 card card-rotation">
    <button 
        class="collapse-button-settings"
        onclick={() => { if (uiState) uiState.settingsPanelCollapsed = true; }}
    >
        → Hide
    </button>
    <h1 class="rotation-header">Settings</h1>
    <GradientSeparator marginTop="0.0rem" marginBottom="1.0rem" />
    <ul class="flex flex-wrap flex-col md:flex-row text-sm font-medium text-center">
        <TabButton 
            id="ranged"
            label="Ranged"
            isActive={styleTab === SettingsCombatStyles.RANGED}
            onClick={() => (styleTab = SettingsCombatStyles.RANGED)}
        />
        <TabButton 
            id="magic"
            label="Magic"
            isActive={styleTab === SettingsCombatStyles.MAGIC}
            onClick={() => (styleTab = SettingsCombatStyles.MAGIC)}
        />
        <TabButton 
            id="melee"
            label="Melee"
            isActive={styleTab === SettingsCombatStyles.MELEE}
            onClick={() => (styleTab = SettingsCombatStyles.MELEE)}
        />
        <TabButton 
            id="necro"
            label="Necro"
            isActive={styleTab === SettingsCombatStyles.NECROMANCY}
            onClick={() => (styleTab = SettingsCombatStyles.NECROMANCY)}
        />
    </ul>
    <GradientSeparator marginTop="0.0rem" marginBottom="0.25rem" />
    <ul class="flex flex-wrap flex-col md:flex-row text-sm font-medium text-center">
        <TabButton 
            id="general"
            label="General"
            isActive={tab === 'general'}
            onClick={() => (tab = 'general')}
        />
        <TabButton 
            id="equipment"
            label="Equipment"
            isActive={tab === 'equipment'}
            onClick={() => (tab = 'equipment')}
        />
        <TabButton
            id="bosses"
            label="Advanced"
            isActive={tab === 'bosses'}
            onClick={() => (tab = 'bosses')}
        />
    </ul>
    <GradientSeparator marginTop="0.0rem" marginBottom="0.25rem" />
    {#if !settingsStore.initialized}
    <div class="w-full text-center py-8">
        <p>Loading settings...</p>
    </div>
    {:else}
    <form class="w-full" style="--style-color: {activeStyleColor}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {#if tab === 'general'}
                <div class="md:col-span-1 space-y-2">
                    <h5 class="uppercase font-bold text-lg text-center mb-4">General</h5>
                    <Select
                        bind:setting={settings[SETTINGS.MODE]}
                        img="/settings_icons/Skills_icon.png"
                        onchange={() => updateDamages()}
                    />
                    {#if styleTab == SettingsCombatStyles.RANGED}
                        <Number
                            bind:setting={settings[SETTINGS.RANGED_LEVEL]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/ranged_level.png"step="1"
                            max="150"
                            min="1"
                        />
                    {:else if styleTab == SettingsCombatStyles.MAGIC}
                        <Number
                            bind:setting={settings[SETTINGS.MAGIC_LEVEL]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/magic.png"
                            step="1"
                            max="150"
                            min="1"
                        />
                    {:else if styleTab == SettingsCombatStyles.MELEE}
                        <Number
                            bind:setting={settings[SETTINGS.STRENGTH_LEVEL]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/strength.png"
                            step="1"
                            max="150"
                            min="1"
                        />
                        <Checkbox
                            bind:setting={settings[SETTINGS.STRENGTH_CAPE]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/strength_cape.png"
                        />
                        <Number
                        bind:setting={settings[SETTINGS.TIME_SINCE_ATTACK]}
                        onchange={() => updateDamages()}
                        img="/effect_icons/cease.png"
                        step="1"
                        max="10"
                        min="0"
                    />
                    {:else if styleTab == SettingsCombatStyles.NECROMANCY}
                        <Number
                            bind:setting={settings[SETTINGS.NECROMANCY_LEVEL]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/necromancy.png"
                            step="1"
                            max="150"
                            min="1"
                        />
                    {/if}
                    
                    <Number
                        bind:setting={settings[SETTINGS.HIT_CHANCE]}
                        onchange={() => updateDamages()}

                        img="/settings_icons/Zero_weakness_icon.png"
                        step="1"
                        max="100"
                        min="0"
                    />
                    <Number
                        bind:setting={settings[SETTINGS.TARGET_SIZE]}
                        onchange={() => updateDamages()}
                        img="/settings_icons/target_size.webp"
                        step="1"
                        max="5"
                        min="0"
                    />
                    <Number
                        bind:setting={settings[SETTINGS.TARGET_HP_PERCENT]}
                        onchange={() => updateDamages()}
                        img="/effect_icons/target_hp.png"
                        step="1"
                        max="100"
                        min="0"
                    />
                </div>
                <div class="md:col-span-1 space-y-2">
                    <h5 class="uppercase font-bold text-lg text-center">Damage Buffs</h5>
                    {#if prayerSettingByStyle[styleTab]}
                    {@const prayerKey = prayerSettingByStyle[styleTab]}
                    <div class="relative inline-block w-full">
                        <button
                            type="button"
                            class="stack-toggle w-full flex items-center gap-2 px-2 py-1"
                            class:stack-active={settings[prayerKey]?.value && settings[prayerKey]?.value !== 'none'}
                            title="Prayer (click to change)"
                            onclick={() => { openDropdown = openDropdown === prayerKey ? null : prayerKey; }}
                        >
                            <img src={prayerIconByStyle[styleTab]} alt="Prayer" class="w-7 h-7" />
                            <span class="text-sm truncate">{settings[prayerKey]?.options?.find(o => o.value === settings[prayerKey]?.value)?.text ?? settings[prayerKey]?.value ?? 'None'}</span>
                        </button>
                        {#if openDropdown === prayerKey}
                            <div class="icon-dropdown">
                                {#each settings[prayerKey]?.options ?? [] as option}
                                    <button
                                        type="button"
                                        class="icon-dropdown-item"
                                        class:active={settings[prayerKey]?.value === option.value}
                                        onclick={() => { settings[prayerKey].value = option.value; openDropdown = null; updateDamages(); }}
                                    >
                                        {option.text}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    {/if}
                    <div class="relative inline-block w-full">
                        <button
                            type="button"
                            class="stack-toggle w-full flex items-center gap-2 px-2 py-1"
                            class:stack-active={settings[SETTINGS.SLAYER_HELM]?.value && settings[SETTINGS.SLAYER_HELM]?.value !== 'none'}
                            title="Slayer Helmet (click to change)"
                            onclick={() => { openDropdown = openDropdown === SETTINGS.SLAYER_HELM ? null : SETTINGS.SLAYER_HELM; }}
                        >
                            <img src="/effect_icons/slayer_helmet.png" alt="Slayer Helmet" class="w-7 h-7" />
                            <span class="text-sm truncate">{settings[SETTINGS.SLAYER_HELM]?.options?.find(o => o.value === settings[SETTINGS.SLAYER_HELM]?.value)?.text ?? 'None'}</span>
                        </button>
                        {#if openDropdown === SETTINGS.SLAYER_HELM}
                            <div class="icon-dropdown">
                                {#each settings[SETTINGS.SLAYER_HELM]?.options ?? [] as option}
                                    <button
                                        type="button"
                                        class="icon-dropdown-item"
                                        class:active={settings[SETTINGS.SLAYER_HELM]?.value === option.value}
                                        onclick={() => { settings[SETTINGS.SLAYER_HELM].value = option.value; openDropdown = null; updateDamages(); }}
                                    >
                                        {option.text}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <div class="flex flex-wrap gap-2 justify-center my-2">
                        {#each [
                            { key: SETTINGS.REAPER_CREW, img: '/effect_icons/death.png', title: 'Reaper Crew', toggle: true },
                            { key: SETTINGS.BERSERKERS_FURY, img: '/effect_icons/berserkers_fury.png', title: "Berserker's Fury", step: 0.5, max: 5.5 },
                            { key: SETTINGS.SMOKE_CLOUD, img: '/effect_icons/smoke_cloud.png', title: 'Smoke Cloud', toggle: true },
                            { key: SETTINGS.SWIFTNESS_OF_THE_AVIANSIE, img: '/effect_icons/swiftness_of_the_avianse.png', title: 'Swiftness of the Aviansie', toggle: true },
                            { key: SETTINGS.STONE_OF_JAS, img: '/effect_icons/stone_of_jas.png', title: 'Stone of Jas', step: 1, max: 6 },
                            { key: SETTINGS.INFERNAL_PUZZLE_BOX, img: '/effect_icons/infernal_puzzlebox.png', title: 'Infernal Puzzle Box', step: 1, max: 6 },
                            { key: SETTINGS.DIVINE_RAGE, img: '/ability_icons/special/Divine_Rage.png', title: 'Divine Rage', toggle: true },
                            { key: SETTINGS.ECLIPSED_SOUL, img: '/ability_icons/special/Eclipsed_Soul.png', title: 'Eclipsed Soul', toggle: true },
                            { key: SETTINGS.ENCHANTMENT_OF_FLAMES, img: '/effect_icons/magic/Enchantment_of_flames_detail.png', title: 'Enchantment of Flames', toggle: true },
                            { key: SETTINGS.ENCHANTMENT_OF_DREAD, img: '/effect_icons/ranged/Enchantment_of_dread.png', title: 'Enchantment of Dread', toggle: true }
                        ] as buff}
                            <ToggleButton
                                bind:setting={settings[buff.key]}
                                img={buff.img}
                                title={buff.title}
                                toggle={buff.toggle ?? false}
                                step={buff.step ?? 1}
                                max={buff.max}
                                borderColor={activeStyleColor}
                                onchange={updateDamages}
                            />
                        {/each}
                    </div>
                    <div class="flex flex-wrap gap-2 justify-center my-2">
                        <ToggleButton
                            bind:setting={settings[SETTINGS.VULN]}
                            img={(v) => v === SETTINGS.VULN_VALUES.CURSE ? '/effect_icons/magic/Curse_icon.png' : '/effect_icons/magic/Vulnerability_icon.webp'}
                            title="Vulnerability (click to cycle)"
                            cycle={[SETTINGS.VULN_VALUES.NONE, SETTINGS.VULN_VALUES.CURSE, SETTINGS.VULN_VALUES.VULNERABILITY]}
                            badgeFn={(v) => v === SETTINGS.VULN_VALUES.CURSE ? 'C' : v === SETTINGS.VULN_VALUES.VULNERABILITY ? 'V' : null}
                            borderColor={activeStyleColor}
                            onchange={updateDamages}
                        />
                        <ToggleButton
                            bind:setting={settings[SETTINGS.POISON]}
                            img="/effect_icons/poison.png"
                            title="Poison (click to cycle)"
                            cycle={[SETTINGS.POISON_VALUES.NONE, SETTINGS.POISON_VALUES.WEAPON_POISON0, SETTINGS.POISON_VALUES.WEAPON_POISON1, SETTINGS.POISON_VALUES.WEAPON_POISON2, SETTINGS.POISON_VALUES.WEAPON_POISON3]}
                            badgeFn={(v) => {
                                if (!v || v === SETTINGS.POISON_VALUES.NONE) return null;
                                const levels = [SETTINGS.POISON_VALUES.WEAPON_POISON0, SETTINGS.POISON_VALUES.WEAPON_POISON1, SETTINGS.POISON_VALUES.WEAPON_POISON2, SETTINGS.POISON_VALUES.WEAPON_POISON3];
                                const idx = levels.indexOf(v);
                                return idx >= 0 ? '+'.repeat(idx) || '0' : null;
                            }}
                            borderColor={activeStyleColor}
                            onchange={updateDamages}
                        />
                        <ToggleButton
                            bind:setting={settings[SETTINGS.NOPE]}
                            img="/effect_icons/nopenopenope.png"
                            title="Nope nope nope"
                            max={2}
                            borderColor={activeStyleColor}
                            onchange={updateDamages}
                        />
                    </div>
                </div>
                <div class="md:col-span-1" space-y-2>
                    <h5 class="uppercase font-bold text-lg text-center mb-4">
                        <InfoTip text="Starting stack values for the rotation. Unselected stacks will be hidden.">
                            Stacks
                        </InfoTip></h5>
                    <div class="flex flex-wrap gap-2 justify-center mb-3">
                    {#each Object.keys(stacks) as key}
                        {#if stacks[key].combatStyle === styleTab || stacks[key].combatStyle === SettingsCombatStyles.ALL}
                        <button
                            type="button"
                            class="stack-toggle"
                            class:stack-active={settings[stacks[key].displaySetting]?.value}
                            title="{stacks[key].title} (right-click to set starting value, scroll to adjust)"
                            onclick={() => { settings[stacks[key].displaySetting].value = !settings[stacks[key].displaySetting].value; updateDamages(); }}
                            oncontextmenu={(e) => { e.preventDefault(); editingStack = editingStack === key ? null : key; }}
                            onwheel={(e) => { e.preventDefault(); const curr = settings[key]?.value ?? 0; const next = clampStack(key, curr + (e.deltaY < 0 ? 1 : -1)); if (settings[key]) { settings[key].value = next; updateDamages(); } }}
                        >
                            <img src={stacks[key].image} alt={stacks[key].title} class="w-7 h-7" />
                            {#if settings[key] != null}
                                <span class="stack-count">{settings[key].value ?? 0}</span>
                            {/if}
                            {#if editingStack === key}
                                <input
                                    type="number"
                                    class="stack-edit"
                                    value={settings[key]?.value ?? 0}
                                    min="0"
                                    oninput={(e) => { settings[key].value = clampStack(key, e.target.value); updateDamages(); }}
                                    onblur={() => { editingStack = null; }}
                                    onkeydown={(e) => { if (e.key === 'Enter') editingStack = null; }}
                                    onclick={(e) => e.stopPropagation()}
                                    use:focusOnMount
                                />
                            {/if}
                        </button>
                        {/if}
                    {/each}
                    </div>
                </div>
                <div class="md:col-span-1" space-y-2>
                    <h5 class="uppercase font-bold text-lg text-center mb-4">
                        <InfoTip 
                            text="If expected adrenaline is enabled, the rotation will show the expected adrenaline value. This accounts for the Impatient perk and
                            [bma:Tsunami Crit Buff].">
                            Adrenaline
                        </InfoTip>
                    </h5>
                    <div class="flex flex-wrap gap-2 justify-center">
                        {#each [
                            { key: SETTINGS.VIGOUR, img: '/gear_icons/shared/ring of vigour.png', title: 'Ring of Vigour' },
                            { key: SETTINGS.FURY_OF_THE_SMALL, img: '/effect_icons/Fury of the Small.png', title: 'Fury of the Small' },
                            { key: SETTINGS.CONSERVATION_OF_ENERGY, img: '/effect_icons/Conservation of Energy.png', title: 'Conservation of Energy' },
                            { key: SETTINGS.HEIGHTENED_SENSES, img: '/effect_icons/Heightened Senses.png', title: 'Heightened Senses' },
                            { key: SETTINGS.EXPECTED_ADRENALINE, img: 'settings_icons/Animal_trait_re-roller.png', title: 'Expected Adrenaline' },
                        ] as toggle}
                            <ToggleButton
                                bind:setting={settings[toggle.key]}
                                img={toggle.img}
                                title={toggle.title}
                                toggle={true}
                                borderColor={activeStyleColor}
                                onchange={updateDamages}
                            />
                        {/each}
                        {#if uiState?.showSuggestions}
                        <ToggleButton
                            bind:setting={uiState.showSuggestions}
                            img="/ability_icons/special/Surge.png"
                            title="Show ability suggestions"
                            toggle={true}
                            borderColor={activeStyleColor}
                            onchange={updateDamages}
                        />
                        {/if}
                    </div>
                </div>
            {:else if tab === 'equipment'}
                <div class="md:col-span-1">
                    <GearSelection {settings} {styleTab} {updateDamages} bind:openDropdown {gearFilter} onFilterChange={setGearFilter} />
                </div>
                {#if !useOwnedGearPerks}
                    <div class="md:col-span-1">
                        <PerkSelection bind:settings {updateDamages} />
                    </div>
                {:else}
                    <div class="md:col-span-1">
                        <h5 class="uppercase font-bold text-lg text-center mb-4">Active Perks</h5>
                        <div class="space-y-2">
                            <div class="flex gap-1 flex-wrap justify-center">
                                {#each weaponPerks as perk}
                                    {@const def = perkDefs[perk.perkKey]}
                                    {#if def}
                                        <ActionIcon type="perk" src={def.icon} size="md" badgeText="{perk.rank}" borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                    {/if}
                                {/each}
                            </div>
                            <div class="flex gap-1 flex-wrap justify-center">
                                {#each bodyPerks as perk}
                                    {@const def = perkDefs[perk.perkKey]}
                                    {#if def}
                                        <ActionIcon type="perk" src={def.icon} size="md" badgeText="{perk.rank}" borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                    {/if}
                                {/each}
                            </div>
                            <div class="flex gap-1 flex-wrap justify-center">
                                {#each legsPerks as perk}
                                    {@const def = perkDefs[perk.perkKey]}
                                    {#if def}
                                        <ActionIcon type="perk" src={def.icon} size="md" badgeText="{perk.rank}" borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                    {/if}
                                {/each}
                            </div>
                            <button
                                class="flex items-center justify-center gap-2 w-full text-xs text-sky-300 hover:text-white border border-sky-300/30 hover:border-sky-300 rounded px-2 py-1.5 mt-2 transition-colors"
                                onclick={() => showGearManager = true}
                            >
                                <img src="/settings_icons/Options_icon.png" alt="" class="w-4 h-4" />
                                Manage Gear
                            </button>
                        </div>
                    </div>
                {/if}
                <div class="md:col-span-1">
                    <FamiliarSelection bind:settings {updateDamages} bind:openDropdown onFamiliarChange={recalcFamiliarAccuracy} />
                </div>
                
            {:else if tab === 'bosses'}
                <div class="md:col-span-1 space-y-4">
                    <BuffSelection settings={settings} updateDamages={updateDamages} styleFilter={styleTab} />
                </div>
                <div class="md:col-span-1 space-y-4">
                    <h5 class="uppercase font-bold text-lg text-center mb-4">Boss Preset</h5>
                    <div class="flex justify-center mb-3">
                        <PillToggle bind:value={bossFilter} options={['popular', 'all']} labels={{ popular: 'Popular', all: 'All' }} onchange={updateBossOptions} />
                    </div>
                    <div class="space-y-4">
                        <Select
                            bind:setting={settings[SETTINGS.BOSS_PRESET]}
                            onchange={() => onBossChange()}
                        />
                        {#if settings[SETTINGS.BOSS_PRESET]?.value && settings[SETTINGS.BOSS_PRESET].value !== 'none'}
                            {@const baseBoss = bossPresets[settings[SETTINGS.BOSS_PRESET].value]}
                            {@const boss = getEffectiveBoss(settings[SETTINGS.BOSS_PRESET].value)}
                            {#if boss}
                                {#if baseBoss?.enrage}
                                    <div class="flex items-center gap-2 pl-2">
                                        <label class="text-xs text-gray-400 whitespace-nowrap">{baseBoss.enrage.label}:</label>
                                        <input type="range"
                                            min={baseBoss.enrage.min}
                                            max={baseBoss.enrage.max}
                                            step={baseBoss.enrage.step ?? 1}
                                            bind:value={enrageValue}
                                            oninput={() => onEnrageChange()}
                                            class="flex-1 h-1 accent-red-500"
                                        />
                                        <input type="number"
                                            min={baseBoss.enrage.min}
                                            max={baseBoss.enrage.max}
                                            step={baseBoss.enrage.step ?? 1}
                                            bind:value={enrageValue}
                                            oninput={() => onEnrageChange()}
                                            class="w-16 text-xs text-center bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-white"
                                        />
                                    </div>
                                {/if}
                                <div class="text-xs text-gray-400 space-y-1 pl-2">
                                    <p>Defence: {boss.defenceLevel} | Armour tier: {boss.armour} ({armourFromTier(boss.armour)})</p>
                                    <p>Affinities — Melee: {Math.round(boss.affinities.melee * 100)}% | Ranged: {Math.round(boss.affinities.ranged * 100)}% | Magic: {Math.round(boss.affinities.magic * 100)}%</p>
                                    {#if boss.weakness !== 'None'}
                                        <p>Weakness: {boss.weakness} ({Math.round(boss.affinities.weakness * 100)}%)</p>
                                    {/if}
                                    {#if boss.health}
                                        {@const totalHeal = (boss.phases ?? []).reduce((sum, p) => sum + (p.heal || 0), 0)}
                                        <p>Health: {boss.health.toLocaleString()}{#if totalHeal > 0} (+{totalHeal.toLocaleString()} heal = {(boss.health + totalHeal).toLocaleString()} total dmg){/if}</p>
                                    {/if}
                                    {#if settings[SETTINGS.FAMILIAR]?.value && settings[SETTINGS.FAMILIAR].value !== 'none'}
                                        <p class="text-amber-400">Familiar hit chance: {settings[SETTINGS.FAMILIAR_ACCURACY]?.value ?? '?'}%</p>
                                    {/if}
                                    {#if boss?.phases?.some(p => p.attackPattern)}
                                        {#each boss.phases as phase, i}
                                            {#if phase.attackPattern}
                                                <p class="text-purple-400 text-xs">P{i + 1}: {phase.attackPattern.cycle.map(a => a.label ?? a.name).join(' → ')}</p>
                                            {/if}
                                        {/each}
                                    {/if}
                                </div>
                            {/if}
                        {/if}
                        <!-- Always-visible boss fields -->
                        <Number
                            bind:setting={settings[SETTINGS.BOSS_PATTERN_START]}
                            onchange={() => updateDamages()}
                            img="/settings_icons/Time.png"
                            step="1"
                            min="-1"
                        />
                        <Number
                            bind:setting={settings[SETTINGS.BOSS_HP]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/target_hp.png"
                            step="1000"
                            min="0"
                            width="90px"
                            compact={true}
                        />
                        <Number
                            bind:setting={settings[SETTINGS.GUARDIANS_TRIUMPH]}
                            onchange={() => updateDamages()}
                            img="/effect_icons/Guardian's_Triumph_Edict_(self_status).png"
                            step="1"
                            min="0"
                        />
                    </div>
                </div>
            {/if}
        </div>
    </form>
    {/if}
</div>

<GearManager bind:show={showGearManager} initialStyle={styleColorMap[styleTab] ?? 'ranged'} />

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
    .stack-edit {
        position: absolute;
        bottom: -24px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 20px;
        font-size: 0.7rem;
        text-align: center;
        background: #1e293b;
        color: white;
        border: 1px solid var(--style-color, #4ade80);
        border-radius: 4px;
        z-index: 10;
        -moz-appearance: textfield;
    }
    .stack-edit::-webkit-inner-spin-button {
        display: none;
    }
    .stack-toggle:hover {
        opacity: 0.7;
    }
    .stack-active {
        opacity: 1;
        border-color: var(--style-color, #4ade80);
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
    .icon-dropdown-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .icon-dropdown-item.active {
        color: var(--style-color, #4ade80);
        font-weight: bold;
    }
</style>