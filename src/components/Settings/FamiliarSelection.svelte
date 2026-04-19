<script>
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { familiars } from '$lib/data/familiars';
    import { DAMAGE_SOURCE_COLORS } from '$lib/utils/colors';
    import ToggleButton from '../UI/ToggleButton.svelte';

    let { settings, updateDamages, openDropdown = $bindable(null), onFamiliarChange = null } = $props();
    const familiarColor = DAMAGE_SOURCE_COLORS.familiar;

    function onFamiliarChanged() {
        if (onFamiliarChange) onFamiliarChange();
        updateDamages();
    }

    const spiritWeedCycle = [
        SETTINGS.SPIRIT_WEED_INCENSE_VALUES.NONE,
        SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL1,
        SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL2,
        SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL3,
        SETTINGS.SPIRIT_WEED_INCENSE_VALUES.LVL4,
    ];

    const showScrollOptions = $derived(
        settings[SETTINGS.FAMILIAR]?.value === SETTINGS.FAMILIAR_VALUES.RIPPER_DEMON ||
        settings[SETTINGS.FAMILIAR]?.value === SETTINGS.FAMILIAR_VALUES.STEEL_TITAN
    );

    function scrollIcon(value) {
        return settings[SETTINGS.FAMILIAR]?.value === SETTINGS.FAMILIAR_VALUES.RIPPER_DEMON
            ? '/familiars/scrolls/Ripper_Demon_scroll_(Death_From_Above).png'
            : '/familiars/scrolls/Steel_Titan_scroll_(Steel_of_Legends).png';
    }
</script>

<h5 class="uppercase font-bold text-lg text-center mb-4">Familiars</h5>
<div class="flex flex-wrap gap-2 justify-center mb-3">
    <ToggleButton
        bind:setting={settings[SETTINGS.FAMILIAR]}
        img={(v) => familiars[v]?.icon ?? '/effect_icons/familiar.png'}
        title="Familiar"
        options={settings[SETTINGS.FAMILIAR]?.options ?? []}
        bind:openId={openDropdown}
        id={SETTINGS.FAMILIAR}
        borderColor={familiarColor}
        onchange={onFamiliarChanged}
    />
    <ToggleButton
        bind:setting={settings[SETTINGS.KALG_SPEC]}
        img="/effect_icons/crit_i_kal.png"
        title="Kal'gerion Spec"
        toggle={true}
        borderColor={familiarColor}
        onchange={updateDamages}
    />
    {#if showScrollOptions}
        <ToggleButton
            bind:setting={settings[SETTINGS.USE_FAMILIAR_SCROLLS]}
            img={scrollIcon}
            title="Use Familiar Scrolls"
            toggle={true}
            borderColor={familiarColor}
            onchange={updateDamages}
        />
        <ToggleButton
            bind:setting={settings[SETTINGS.SPIRIT_CAPE]}
            img="/effect_icons/Spirit_cape.png"
            title="Spirit Cape"
            toggle={true}
            borderColor={familiarColor}
            onchange={updateDamages}
        />
        <ToggleButton
            bind:setting={settings[SETTINGS.SUMMONING_RENEWAL]}
            img="/effect_icons/Summoning_renewal_(4).png"
            title="Summoning Renewal"
            toggle={true}
            borderColor={familiarColor}
            onchange={updateDamages}
        />
        <ToggleButton
            bind:setting={settings[SETTINGS.SPIRIT_WEED_INCENSE]}
            img="/effect_icons/Spirit_weed_incense_sticks.png"
            title="Spirit Weed Incense (click to cycle)"
            cycle={spiritWeedCycle}
            borderColor={familiarColor}
            onchange={updateDamages}
        />
        <ToggleButton
            bind:setting={settings[SETTINGS.PRISM_OF_RESTORATION]}
            img="/effect_icons/Prism_of_Restoration_icon.png"
            title="Prism of Restoration"
            toggle={true}
            borderColor={familiarColor}
            onchange={updateDamages}
        />
    {/if}
</div>
