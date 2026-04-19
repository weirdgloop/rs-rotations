<script>
    import { renderComponent } from '@tanstack/svelte-table';

    import { SETTINGS, settingsConfig } from '$lib/calc/settings_rb';
    import { calculateSingleAbilityDamage } from '$lib/calc/unified-damage-calculator';
    import { ABILITIES, abils } from '$lib/data/abilities.ts';

    const excludedAbilities = new Set([ABILITIES.SUNSHINE, ABILITIES.GREATER_SUNSHINE, ABILITIES.TUMEKEN_ASPHYXIATE]);
    
    // const excludedAbilities = new Set([ABILITIES.SUNSHINE, ABILITIES.GREATER_SUNSHINE]);


    const abilities = Object.fromEntries(
        Object.entries(abils).filter(([key, a]) =>
            a.title && a.mainStyle === 'magic' &&
            a.abilityClassification !== 'conjure' &&
            a.abilityClassification !== 'self cast' &&
            !excludedAbilities.has(key)
        )
    );

    import { SettingsCombatStyles } from '$lib/calc/rotation_builder/types/SettingsCombatStyles.ts';

    import AbilityDamageTable from '$components/AbilityDamageTable/AbilityDamageTable.svelte';
    import AbilityInfo from '$components/AbilityInfo/AbilityInfo.svelte';
    import Header from '$components/Layout/Header.svelte';
    import Navbar from '$components/Layout/Navbar.svelte';
    import Checkbox from '$components/Settings/Checkbox.svelte';
    import FamiliarSelection from '$components/Settings/FamiliarSelection.svelte';
    import GearSelection from '$components/Settings/GearSelection.svelte';
    import GearManager from '$components/Settings/GearManager.svelte';
    import ActionIcon from '$components/UI/ActionIcon.svelte';
    import { perks as perkDefs } from '$lib/data/perks';
    import { STYLE_COLORS } from '$lib/utils/colors';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import { weapons } from '$lib/data/weapons';

    let showGearManager = $state(false);
    import Number from '$components/Settings/Number.svelte';
    import PerkSelection from '$components/Settings/PerkSelection.svelte';
    import Select from '$components/Settings/Select.svelte';

    let openDropdown = $state(null);

    let tab = $state('general');

    let damages = $state(Object.entries(abilities).map(([key, value]) => ({
        key,
        ...value,
        abilityInfo: {
            title: value.title,
            src: value.icon
        },
        regular: 0,
        sunshine: 0,
    })));

    let storedSettings = {};
    if (typeof localStorage !== 'undefined') {
        storedSettings = JSON.parse(localStorage.getItem('settings_magic_rb')) || {};
    }

    let settings = $state(
        Object.fromEntries(
            Object.entries(settingsConfig).map(([key, value]) => [
                key,
                {
                    ...value,
                    key,
                    value: storedSettings[key]?.value ?? value.default?.magic ?? value.default
                }
            ])
        )
    );

    let gearFilter = $derived(settings[SETTINGS.GEAR_FILTER]?.value ?? 'popular');
    let useOwnedGearPerks = $derived(gearFilter === 'owned');

    function getEquippedPerks(settingsKey) {
        const itemKey = settings[settingsKey]?.value;
        if (!itemKey || itemKey === 'none' || itemKey.startsWith('custom')) return [];
        const instances = ownedItemsStore.ownedGear.get(itemKey);
        if (!instances || instances.length === 0) return [];
        const gearInstances = settings['_gearInstances']?.value;
        const instanceInfo = gearInstances?.[settingsKey];
        const idx = instanceInfo?.instanceIndex ?? 0;
        return instances[idx]?.perks ?? instances[0]?.perks ?? [];
    }

    let weaponPerks = $derived.by(() => {
        if (!useOwnedGearPerks) return [];
        const mhVal = settings[SETTINGS.MAGIC_MH]?.value;
        const is2h = mhVal && weapons[mhVal]?.['weapon type'] === 'two-hand';
        const mhPerks = getEquippedPerks(SETTINGS.MAGIC_MH);
        const ohPerks = is2h ? [] : getEquippedPerks(SETTINGS.MAGIC_OH);
        return [...mhPerks, ...ohPerks];
    });
    let bodyPerks = $derived.by(() => useOwnedGearPerks ? getEquippedPerks(SETTINGS.MAGIC_BODY) : []);
    let legsPerks = $derived.by(() => useOwnedGearPerks ? getEquippedPerks(SETTINGS.MAGIC_LEGS) : []);

    function saveSettings() {
        if (typeof localStorage !== 'undefined') {
            const settingsToSave = Object.fromEntries(
                Object.entries(settings).map(([key, value]) => [key, { value: value.value }])
            );
            localStorage.setItem('settings_magic_rb', JSON.stringify(settingsToSave));
        }
    }

    $effect(() => {
        if (settings) saveSettings();
    });

    const updateDamages = () => {
        const adaptedSettings = Object.fromEntries(
            Object.entries(settings).map(([key, value]) => [key, value.value])
        );

        damages = damages.map(ability => {
            adaptedSettings['ability'] = ability.key;

            const regular = calculateSingleAbilityDamage(adaptedSettings, {
                ability: ability.key
            });
            const sunshine = calculateSingleAbilityDamage(adaptedSettings, {
                ability: ability.key,
                buffs: { sunshine: true }
            });

            ability.regular = Math.round(regular.expected);
            ability.sunshine = Math.round(sunshine.expected);

            return ability;
        })
    }

    updateDamages()

    const sortAbilities = (rowA, rowB) => {
        const nameA = rowA.original.abilityInfo.title;
        const nameB = rowB.original.abilityInfo.title;
        return nameA.localeCompare(nameB);
    }

    const columns = [
        {
            accessorKey: 'abilityInfo',
            header: 'Ability',
            cell: ({ cell }) => renderComponent(AbilityInfo, { abilityInfo: cell.getValue() }),
            sortingFn: sortAbilities,
            sortDescFirst: false,
        },
        {
            accessorKey: 'regular',
            header: 'Regular',
            sortDescFirst: true,
            meta: {
                class: "text-center"
            }
        },
        {
            accessorKey: 'sunshine',
            header: 'Sunshine',
            sortDescFirst: true,
            meta: {
                class: "text-center"
            }
        },
    ];
</script>

<Navbar />
<Header img="/magic_background.png" text="Magic Calculator" icon="/style_icons/magic-white.svg" />

<div class="space-y-14 mt-10 z-20">
    <div class="responsive-container">
        <section class="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
            <div class="xl:col-span-6 xl:row-start-1 xl:row-span-4">
                <div class="card card-magic">
                    <h1 class="main-header mb-6 ml-3">Damage Values</h1>
                    <div class="table-container">
                        <AbilityDamageTable data={damages} columns={columns} style="magic" />
                    </div>
                </div>
            </div>

            <div class="xl:col-span-6 xl:row-start-1 xl:row-span-1 card card-magic">
                <ul class="flex flex-wrap flex-col md:flex-row text-sm font-medium text-center">
                    <li class="grow me-2">
                        <button
                            onclick={() => (tab = 'general')}
                            class:text-[#968A5C]={tab === 'general'}
                            class="text-[#C2BA9E] font-bold text-2xl text-link uppercase inline-block hover:text-[#968A5C]"
                        >
                            General
                        </button>
                    </li>
                    <li class="grow me-2">
                        <button
                            onclick={() => (tab = 'equipment')}
                            class:text-[#968A5C]={tab === 'equipment'}
                            class="text-[#C2BA9E] font-bold text-2xl text-link uppercase inline-block hover:text-[#968A5C]"
                        >
                            Equipment
                        </button>
                    </li>
                    <li class="grow me-2">
                        <button
                            onclick={() => (tab = 'bosses')}
                            class:text-[#968A5C]={tab === 'bosses'}
                            class="text-[#C2BA9E] font-bold text-2xl text-link uppercase inline-block hover:text-[#968A5C]"
                        >
                            Bosses
                        </button>
                    </li>
                </ul>
                <form class="w-full">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                        {#if tab === 'general'}
                            <div class="md:col-span-1 space-y-2">
                                <h5 class="uppercase font-bold text-lg text-center">General</h5>
                                <Select
                                    bind:setting={settings[SETTINGS.MODE]}
                                    onchange={() => updateDamages()}
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.DAMAGE_PER_UNIT]}
                                    onchange={() => updateDamages()}
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.DAMAGE_UNITS]}
                                    onchange={() => updateDamages()}
                                />
                                <!-- <Number
                                    bind:setting={settings[SETTINGS.HIT_COUNTER_START]}
                                    onchange={() => updateDamages()}
                                    step="1"
                                    max="100"
                                    min="0"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.HIT_COUNTER_END]}
                                    onchange={() => updateDamages()}
                                    step="1"
                                    max="100"
                                    min="0"
                                /> -->
                                <Number
                                    bind:setting={settings[SETTINGS.ESSENCE_CORRUPTION]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/essence_corruption.png"
                                    step="1"
                                    max="100"
                                    min="0"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.INSTABILITY]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/instability.png"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.TARGET_HP_PERCENT]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/target_hp.png"
                                    step="1"
                                    max="100"
                                    min="0"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.MAGIC_LEVEL]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic.png"
                                    step="1"
                                    max="150"
                                    min="1"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.REAPER_CREW]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/death.png"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.HIT_CHANCE]}
                                    onchange={() => updateDamages()}
                                    img="/settings_icons/Zero_weakness_icon.png"
                                    step="1"
                                    max="100"
                                    min="0"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.HITCAP]}
                                    onchange={() => updateDamages()}
                                />
                            </div>
                            <div class="md:col-span-1 space-y-2">
                                <h5 class="uppercase font-bold text-lg text-center">
                                    Applies to dots
                                </h5>
                                <Select
                                    bind:setting={settings[SETTINGS.VULN]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Vulnerability_icon.webp"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.INFERNAL_PUZZLE_BOX]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/infernal_puzzlebox.png"
                                    step="1"
                                    max="6"
                                    min="0"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.CRYPTBLOOM]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/Cryptbloom_helm.png"
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.SLAYER_SIGIL]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/Undead_slayer_sigil_detail.png"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.NOPE]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/nopenopenope.png"
                                    step="1"
                                    max="3"
                                    min="0"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.HAUNTED]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/haunted.png"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.HAUNTED_AD]}
                                    onchange={() => updateDamages()}
                                    step="1"
                                    max="9999"
                                    min="0"
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.CHAIN_MODIFIER]}
                                    onchange={() => updateDamages()}
                                /> 
                            </div>
                            <div class="md:col-span-1 space-y-2">
                                <h5 class="uppercase font-bold text-lg text-center">
                                    Applies to regular abilities only
                                </h5>
                                <Checkbox
                                    bind:setting={settings[SETTINGS.CONFLAGRATE]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/conflagrate.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.KERAPACS_WRIST_WRAPS]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/kerapac_wristwraps.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.ENCHANTMENT_OF_FLAMES]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Enchantment_of_flames_detail.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.CONC_CRIT]}
                                    onchange={() => updateDamages()}
                                    img="/ability_icons/magic/30x30/concentrated_blast.png"
                                    title="Conc Crit"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.GCONC_CRIT]}
                                    onchange={() => updateDamages()}
                                    img="/ability_icons/magic/30x30/greater_concentrated_blast.png"
                                    title="GConc Crit"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.CONC_CRIT_AC]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Conc_AC.png"
                                    title="Conc Crit (AC)"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.GCONC_CRIT_AC]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/GConc_AC.png"
                                    title="GConc Crit (AC)"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.STONE_OF_JAS]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/stone_of_jas.png"
                                    step="1"
                                    max="6"
                                    min="0"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.DRACONIC_FRUIT]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/draconic_fruit.png"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.RUBY_AURORA]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/Ruby_Aurora_icon.webp"
                                    step="1"
                                    max="3"
                                    min="0"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.GRAVITATE]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/gravitate.png"
                                    step="1"
                                    max="20"
                                    min="0"
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.MAGIC_PRAYER]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/Prayer.webp"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.DIVINE_RAGE]}
                                    onchange={() => updateDamages()}
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.ECLIPSED_SOUL]}
                                    onchange={() => updateDamages()}
                                />
                            </div>
                            <div class="md:col-span-1 space-y-2">
                                <h5 class="uppercase font-bold text-lg text-center">Part 2</h5>
                                <Number
                                    bind:setting={settings[SETTINGS.BLOOD_TITHE]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/blood_tithe.png"
                                    step="1"
                                    max="12"
                                    min="0"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.REVENGE]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/revenge.png"
                                    step="1"
                                    max="10"
                                    min="0"
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.SLAYER_HELM]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/slayer_helmet.png"
                                />
                                <Select
                                    bind:setting={settings[SETTINGS.GUARDHOUSE]}
                                    onchange={() => updateDamages()}
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.SWIFTNESS_OF_THE_AVIANSIE]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/swiftness_of_the_avianse.png"
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.BERSERKERS_FURY]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/berserkers_fury.png"
                                    step="0.5"
                                    max="5.5"
                                    min="0"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.SMOKE_CLOUD]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/smoke_cloud.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.CHANNELLED_MIGHT]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Channelled_Might.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.GREATER_CHANNELLED_MIGHT]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Channelled_Might.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.ANIMA_CHARGED]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Anima_Charged.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.BLAST_INFUSED]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Blast_Infused.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.COMBUSTED]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/magic/Combusted_(status).png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.TELOS_RED_BEAM]}
                                    onchange={() => updateDamages()}
                                    img="effect_icons/Red_virus.png"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.TELOS_BLACK_BEAM]}
                                    onchange={() => updateDamages()}
                                    img="effect_icons/Black_virus.png"
                                />
                            </div>
                        {:else if tab === 'equipment'}
                            <div class="md:col-span-1">
                                <GearSelection {settings} styleTab={SettingsCombatStyles.MAGIC} {updateDamages} bind:openDropdown />
                            </div>
                            {#if !useOwnedGearPerks}
                                <div class="md:col-span-1">
                                    <PerkSelection {settings} {updateDamages} />
                                </div>
                            {:else}
                                <div class="md:col-span-1">
                                    <h5 class="uppercase font-bold text-lg text-center mb-4">Active Perks</h5>
                                    <div class="space-y-2">
                                        <div class="flex gap-1 flex-wrap justify-center">
                                            {#each weaponPerks as perk}
                                                {@const def = perkDefs[perk.perkKey]}
                                                {#if def}
                                                    <ActionIcon type="perk" src={def.icon} size="md" badgeText={perk.rank} borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                                {/if}
                                            {/each}
                                        </div>
                                        <div class="flex gap-1 flex-wrap justify-center">
                                            {#each bodyPerks as perk}
                                                {@const def = perkDefs[perk.perkKey]}
                                                {#if def}
                                                    <ActionIcon type="perk" src={def.icon} size="md" badgeText={perk.rank} borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                                {/if}
                                            {/each}
                                        </div>
                                        <div class="flex gap-1 flex-wrap justify-center">
                                            {#each legsPerks as perk}
                                                {@const def = perkDefs[perk.perkKey]}
                                                {#if def}
                                                    <ActionIcon type="perk" src={def.icon} size="md" badgeText={perk.rank} borderColor={STYLE_COLORS.perks} title="{def.name} {perk.rank}" />
                                                {/if}
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                            <div class="md:col-span-1">
                                <FamiliarSelection {settings} {updateDamages} bind:openDropdown />
                            </div>
                            <button
                                class="flex items-center justify-center gap-2 w-full text-xs text-sky-300 hover:text-white border border-sky-300/30 hover:border-sky-300 rounded px-2 py-1.5 mt-2 transition-colors"
                                onclick={() => showGearManager = true}
                            >
                                <img src="/settings_icons/Options_icon.png" alt="" class="w-4 h-4" />
                                Manage Gear
                            </button>
                            <GearManager bind:show={showGearManager} initialStyle="magic" />
                        {:else if tab === 'bosses'}
                            <div class="md:col-span-1 space-y-2">
                                <Checkbox
                                    bind:setting={settings[SETTINGS.GUARDIANS_TRIUMPH]}
                                    onchange={() => updateDamages()}
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.BALANCE_OF_POWER]}
                                    onchange={() => updateDamages()}
                                    img="/effect_icons/bosses/Balance_of_Power_Edict_(self_status).png"
                                    step="1"
                                    min="0"
                                    max="6"
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.SWORD_OF_EDICTS]}
                                    onchange={() => updateDamages()}
                                />
                                <Checkbox
                                    bind:setting={settings[SETTINGS.INNER_CHAOS]}
                                    onchange={() => updateDamages()}
                                />
                                <Number
                                    bind:setting={settings[SETTINGS.ZAMORAK_CHOKE_STACKS]}
                                    onchange={() => updateDamages()}
                                    step="1"
                                    min="0"
                                    max="20"
                                />
                            </div>
                        {/if}
                    </div>
                </form>
            </div>

            <div class="xl:col-span-6 xl:row-start-2 xl:col-start-7">
                <div class="flex flex-col">
                    <div class="card card-magic">
                        <div class="card-title pb-5">User Guide</div>
                        <div class="pb-5">
                            To custom filter shown abilities, you can use the button in the top right of the ability panel to
                            select relevant abilities to you, then toggle the filter to "Owned" to only show abilities you have selected.

                
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>
