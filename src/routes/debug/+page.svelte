<script>
    import { traceDamageCalculation, traceRotationDamage } from '$lib/calc/damage-trace';
    import { ABILITIES, abils } from '$lib/data/abilities';

    import Header from '$components/Layout/Header.svelte';
    import Navbar from '$components/Layout/Navbar.svelte';
    import RotationSettings from '$components/Settings/RotationSettings.svelte';
    import GearManager from '$components/Settings/GearManager.svelte';

    import { rotationStore } from '$lib/stores/rotationStore.svelte.ts';
    import { initializeSettings, settingsStore } from '$lib/stores/settingsStore.svelte.ts';
    import { SETTINGS } from '$lib/calc/settings_rb';

    initializeSettings();

    const BAR_SIZE = 20;

    // All abilities with titles, sorted by style then name
    const allAbilities = Object.entries(abils)
        .filter(([key, a]) => a.title && a.abilityClassification !== 'self cast')
        .sort((a, b) => {
            const styleCmp = (a[1].mainStyle ?? '').localeCompare(b[1].mainStyle ?? '');
            if (styleCmp !== 0) return styleCmp;
            return a[1].title.localeCompare(b[1].title);
        });

    // Group abilities by style for the dropdown
    const styleGroups = {};
    for (const [key, a] of allAbilities) {
        const style = a.mainStyle ?? 'other';
        if (!styleGroups[style]) styleGroups[style] = [];
        styleGroups[style].push({ key, title: a.title });
    }

    // Mode: 'single' or 'rotation'
    let mode = $state('rotation');

    // Single ability mode
    let selectedAbility = $state(ABILITIES.REND);

    // Rotation mode — mini bar
    let miniBar = $state(Array(BAR_SIZE).fill(null));
    let selectedSlot = $state(0);

    let traceSteps = $state([]);
    let traceHits = $state([]);
    let calcResult = $state(0);
    let settingsTab = $state('general');
    let showGearManager = $state(false);

    function adaptSettings() {
        if (!settingsStore.settings) return {};
        return Object.fromEntries(
            Object.entries(settingsStore.settings).map(([key, value]) => [key, value.value])
        );
    }

    function updateTrace() {
        const adapted = adaptSettings();
        if (!adapted || Object.keys(adapted).length === 0) return;

        if (mode === 'single') {
            const { steps, hits, result } = traceDamageCalculation(adapted, selectedAbility, true);
            traceSteps = steps;
            traceHits = hits;
            calcResult = result;
        } else {
            // Derive combat style from the first placed ability
            const firstAbil = miniBar.find(a => a != null);
            adapted['_combatStyle'] = firstAbil ? (abils[firstAbil]?.mainStyle ?? 'magic') : 'magic';
            const { steps, hits, result } = traceRotationDamage(adapted, [...miniBar], BAR_SIZE);
            traceSteps = steps;
            traceHits = hits;
            calcResult = result;
        }
    }

    function placeAbility(abilKey) {
        miniBar[selectedSlot] = abilKey;
        // Auto-advance to next valid slot (skip channelled duration)
        const abil = abils[abilKey];
        const duration = typeof abil?.duration === 'number' ? abil.duration : 3;
        const nextSlot = selectedSlot + Math.max(3, duration);
        if (nextSlot < BAR_SIZE) selectedSlot = nextSlot;
        miniBar = [...miniBar]; // trigger reactivity
        updateTrace();
    }

    function clearSlot(index) {
        miniBar[index] = null;
        miniBar = [...miniBar];
        updateTrace();
    }

    function clearMiniBar() {
        miniBar = Array(BAR_SIZE).fill(null);
        selectedSlot = 0;
        updateTrace();
    }

    updateTrace();

    // Compute totals for the hits table
    let hitTotals = $derived.by(() => {
        if (traceHits.length === 0) return null;
        return {
            min: traceHits.reduce((sum, h) => sum + h.min, 0),
            max: traceHits.reduce((sum, h) => sum + h.max, 0),
            critMin: traceHits.reduce((sum, h) => sum + h.critMin, 0),
            critMax: traceHits.reduce((sum, h) => sum + h.critMax, 0),
        };
    });

    // Count placed abilities for the rotation summary
    let placedAbilities = $derived(miniBar.filter(a => a != null));
</script>

<svelte:head>
    <title>Debug: Damage Trace</title>
</svelte:head>

<Navbar />
<Header title="Debug: Damage Trace" />

<div class="space-y-6 mt-6">
    <div class="responsive-container">
        <section class="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
            <!-- Trace Output -->
            <div class="xl:col-span-7 xl:row-start-1">
                <!-- Mode Selector -->
                <div class="card mb-4">
                    <div class="flex items-center gap-3 mb-4">
                        <button
                            class="px-3 py-1.5 rounded text-sm font-semibold transition-colors {mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}"
                            onclick={() => { mode = 'single'; updateTrace(); }}
                        >Single Ability</button>
                        <button
                            class="px-3 py-1.5 rounded text-sm font-semibold transition-colors {mode === 'rotation' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}"
                            onclick={() => { mode = 'rotation'; updateTrace(); }}
                        >Mini Rotation</button>
                    </div>

                    {#if mode === 'single'}
                        <!-- Single ability selector -->
                        <div class="flex items-center gap-4 flex-wrap">
                            <label class="text-gray-300 text-sm font-semibold">Ability</label>
                            <select
                                class="bg-gray-700 text-white rounded px-3 py-2 text-sm grow"
                                bind:value={selectedAbility}
                                onchange={updateTrace}
                            >
                                {#each Object.entries(styleGroups) as [style, abilities]}
                                    <optgroup label={style.charAt(0).toUpperCase() + style.slice(1)}>
                                        {#each abilities as a}
                                            <option value={a.key}>{a.title}</option>
                                        {/each}
                                    </optgroup>
                                {/each}
                            </select>
                            {#if abils[selectedAbility]?.icon}
                                <img src={abils[selectedAbility].icon} alt="" class="w-8 h-8 ability-icon" />
                            {/if}
                        </div>
                    {:else}
                        <!-- Mini rotation bar -->
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-gray-300 text-sm font-semibold">Rotation ({BAR_SIZE} ticks)</span>
                            <button
                                class="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
                                onclick={clearMiniBar}
                            >Clear All</button>
                        </div>
                        <div class="mini-bar">
                            {#each miniBar as abil, i}
                                <button
                                    class="mini-slot"
                                    class:mini-slot-selected={selectedSlot === i}
                                    class:mini-slot-filled={abil != null}
                                    onclick={() => selectedSlot = i}
                                    oncontextmenu={(e) => { e.preventDefault(); clearSlot(i); }}
                                    title={abil ? `${abils[abil]?.title ?? abil} (right-click to remove)` : `Tick ${i}`}
                                >
                                    <span class="mini-tick-num">{i}</span>
                                    {#if abil && abils[abil]}
                                        <img src={abils[abil].icon} alt={abils[abil].title} class="mini-icon ability-icon" />
                                    {/if}
                                </button>
                            {/each}
                        </div>
                        <!-- Ability picker for rotation mode -->
                        <div class="mt-3">
                            <select
                                class="bg-gray-700 text-white rounded px-3 py-2 text-sm w-full"
                                onchange={(e) => { if (e.target.value) { placeAbility(e.target.value); e.target.value = ''; } }}
                            >
                                <option value="">Place ability at tick {selectedSlot}...</option>
                                {#each Object.entries(styleGroups) as [style, abilities]}
                                    <optgroup label={style.charAt(0).toUpperCase() + style.slice(1)}>
                                        {#each abilities as a}
                                            <option value={a.key}>{a.title}</option>
                                        {/each}
                                    </optgroup>
                                {/each}
                            </select>
                        </div>
                    {/if}
                </div>

                <!-- Result Banner -->
                <div class="card mb-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-gray-400 text-sm">Total Damage:</span>
                            <span class="text-white text-2xl font-bold ml-2">{calcResult}</span>
                        </div>
                        <div class="text-gray-400 text-sm text-right">
                            {#if mode === 'single'}
                                <div>{abils[selectedAbility]?.title ?? selectedAbility}</div>
                                <div class="text-xs">{abils[selectedAbility]?.mainStyle} — {abils[selectedAbility]?.abilityClassification} — {abils[selectedAbility]?.abilityType}</div>
                            {:else}
                                <div>{placedAbilities.length} abilities</div>
                                <div class="text-xs">{placedAbilities.map(k => abils[k]?.title ?? k).join(' → ')}</div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Hits Table -->
                {#if traceHits.length > 0}
                    <div class="card mb-4">
                        <h4 class="text-gray-400 text-xs uppercase font-semibold mb-2">
                            Hits ({traceHits.length})
                        </h4>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-600">
                                        <th class="py-2 px-2 text-left text-gray-400 text-xs uppercase">Hit</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">AD</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">Min</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">Max</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">Crit %</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">Crit Dmg</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">Crit Min</th>
                                        <th class="py-2 px-2 text-right text-gray-400 text-xs uppercase">Crit Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each traceHits as hit, i}
                                        <tr class="border-b border-gray-700/50 hover:bg-gray-800/50">
                                            <td class="py-1.5 px-2 text-gray-300 text-xs">{abils[hit.ability]?.title ?? hit.ability}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hit.boostedAD}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hit.min}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hit.max}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{(hit.critChance * 100).toFixed(1)}%</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">+{(hit.critDamageBonus * 100).toFixed(1)}%</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hit.critMin}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hit.critMax}</td>
                                        </tr>
                                    {/each}
                                    {#if traceHits.length > 1 && hitTotals}
                                        <tr class="border-t-2 border-gray-500 font-semibold">
                                            <td class="py-1.5 px-2 text-gray-200 text-xs">Total</td>
                                            <td class="py-1.5 px-2"></td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hitTotals.min}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hitTotals.max}</td>
                                            <td class="py-1.5 px-2"></td>
                                            <td class="py-1.5 px-2"></td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hitTotals.critMin}</td>
                                            <td class="py-1.5 px-2 text-white font-mono text-sm text-right">{hitTotals.critMax}</td>
                                        </tr>
                                    {/if}
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/if}

                <!-- Pipeline Steps -->
                {#if traceSteps.length > 0}
                    <div class="card">
                        <h4 class="text-gray-400 text-xs uppercase font-semibold mb-2">Pipeline</h4>
                        <table class="w-full">
                            <tbody>
                                {#each traceSteps as step}
                                    <tr class="border-b border-gray-700/50 hover:bg-gray-800/50">
                                        <td class="py-1.5 px-3 text-gray-300 text-sm w-1/4">{step.label}</td>
                                        <td class="py-1.5 px-3 text-white font-mono text-sm text-right w-1/6">{step.value}</td>
                                        <td class="py-1.5 px-3 text-gray-500 text-xs">{step.explanation}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>

            <!-- Settings Panel -->
            <div class="xl:col-span-5 xl:row-start-1">
                <div class="card mb-4">
                    <button
                        class="w-full text-sm text-[#b2dbee] hover:text-white border border-[#b2dbee]/30 hover:border-[#b2dbee] rounded px-3 py-2 transition-colors"
                        onclick={() => showGearManager = true}
                    >
                        Manage Gear
                    </button>
                </div>
                <div class="card">
                    <RotationSettings
                        bind:tab={settingsTab}
                        updateDamages={updateTrace}
                        stacks={rotationStore.stacks}
                    />
                </div>
            </div>
        </section>
    </div>
</div>

<GearManager bind:show={showGearManager} />

<style>
    .mini-bar {
        display: flex;
        gap: 2px;
        flex-wrap: wrap;
    }

    .mini-slot {
        position: relative;
        width: 34px;
        height: 34px;
        border: 1px solid #555;
        border-radius: 3px;
        background: #1a1a2e;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.1s ease;
    }

    .mini-slot:hover {
        border-color: #888;
    }

    .mini-slot-selected {
        border: 2px solid #ffd700;
        box-shadow: 0 0 6px rgba(255, 215, 0, 0.4);
    }

    .mini-slot-filled {
        background: #2a2a3e;
    }

    .mini-tick-num {
        position: absolute;
        top: 0;
        left: 2px;
        font-size: 7px;
        color: #666;
        pointer-events: none;
        z-index: 1;
    }

    .mini-icon {
        width: 28px;
        height: 28px;
        pointer-events: none;
    }
</style>
