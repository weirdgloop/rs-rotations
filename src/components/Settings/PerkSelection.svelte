<script>
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { PERKS, } from '$lib/data/perks';
    import ToggleButton from '../UI/ToggleButton.svelte';

    let { settings, updateDamages } = $props();

    const perksInfo = [
        { key: PERKS.PRECISE, img: '/rs-rot/effect_icons/perks/Precise.webp', title: 'Precise', step: 1, max: 6 },
        { key: PERKS.ERUPTIVE, img: '/rs-rot/effect_icons/perks/Eruptive.webp', title: 'Eruptive', step: 1, max: 4 },
        { key: PERKS.EQ_PERK, img: '/rs-rot/effect_icons/perks/Equilibrium.png', title: 'Equilibrium', step: 1, max: 4 },
        { key: PERKS.CAROMING, img: '/rs-rot/effect_icons/perks/caroming.png', title: 'Caroming', step: 1, max: 4 },
        { key: PERKS.BITING, img: '/rs-rot/effect_icons/perks/Biting.webp', title: 'Biting', step: 1, max: 4 },
        { key: PERKS.AFTERSHOCK, img: '/rs-rot/effect_icons/perks/Aftershock.png', title: 'Aftershock', step: 1, max: 4 },
        { key: PERKS.GENOCIDAL, img: '/rs-rot/effect_icons/perks/genocidal.png', title: 'Genocidal %', step: 0.1, max: 4.9 },
        { key: PERKS.FLANKING, img: '/rs-rot/effect_icons/perks/Flanking.webp', title: 'Flanking', step: 1, max: 4 },
        { key: PERKS.LUNGING, img: '/rs-rot/effect_icons/perks/Lunging.webp', title: 'Lunging', step: 1, max: 4 },
        { key: PERKS.ULTIMATUMS, img: '/rs-rot/effect_icons/perks/ultimatums.png', title: 'Ultimatums', step: 1, max: 4 },
        { key: SETTINGS.LVL20ARMOUR, img: '/rs-rot/effect_icons/perks/level-20.png', title: 'Level 20 Armour', toggle: true },
        { key: PERKS.IMPATIENT, img: '/rs-rot/effect_icons/perks/Impatient.png', title: 'Impatient', step: 1, max: 4 },
        { key: PERKS.CRACKLING, img: '/rs-rot/effect_icons/perks/Crackling.png', title: 'Crackling', step: 1, max: 4 },
        { key: PERKS.INVIGORATING, img: '/rs-rot/effect_icons/perks/Invigorating.png', title: 'Invigorating', step: 1, max: 4 },
        { key: PERKS.SLAYER_PERK_UNDEAD, img: '/rs-rot/effect_icons/perks/25px-Undead_Slayer.webp', title: 'Undead Slayer', toggle: true },
        { key: PERKS.SLAYER_PERK_DRAGON, img: '/rs-rot/effect_icons/perks/dragon_slayer_perk.png', title: 'Dragon Slayer', toggle: true },
        { key: PERKS.SLAYER_PERK_DEMON, img: '/rs-rot/effect_icons/perks/demon_slayer_perk.webp', title: 'Demon Slayer', toggle: true },
    ];

    const ruthlessPerks = [
        { key: SETTINGS.RUTHLESS_RANK, img: '/rs-rot/effect_icons/perks/Ruthless.webp', title: 'Ruthless Rank', label: 'Rank', step: 1, max: 3 },
        { key: SETTINGS.RUTHLESS_STACKS, img: '/rs-rot/effect_icons/perks/Ruthless.webp', title: 'Ruthless Stacks', label: 'Stacks', step: 1, max: 5 },
    ];
</script>

<h5 class="uppercase font-bold text-lg text-center mb-4">Perks</h5>
<div class="flex flex-wrap gap-2 justify-center mb-3">
    {#each perksInfo as perk}
        {#if settings[perk.key] != null}
            <ToggleButton
                bind:setting={settings[perk.key]}
                img={perk.img}
                title={perk.title}
                toggle={perk.toggle ?? false}
                step={perk.step ?? 1}
                max={perk.max}
                onchange={updateDamages}
            />
        {/if}
    {/each}
    {#each ruthlessPerks as perk}
        {#if settings[perk.key] != null}
            <ToggleButton
                bind:setting={settings[perk.key]}
                img={perk.img}
                title={perk.title}
                step={perk.step}
                max={perk.max}
                label={perk.label}
                onchange={updateDamages}
            />
        {/if}
    {/each}
</div>
