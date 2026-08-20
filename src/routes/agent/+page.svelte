<script>
    import { SETTINGS } from '$lib/calc/settings_rb';
    import { abils } from '$lib/data/abilities';
    import { findBestRotation, findGreedyRotation, findExpertRotation, QAgent, PPOAgent } from '$lib/calc/rotation-agent';
    import Header from '$components/Layout/Header.svelte';
    import Navbar from '$components/Layout/Navbar.svelte';
    import ActionIcon from '$components/UI/ActionIcon.svelte';
    import RotationSettings from '$components/Settings/RotationSettings.svelte';
    import { settingsStore, initializeSettings } from '$lib/stores/settingsStore.svelte.ts';
    import { rotationStore } from '$lib/stores/rotationStore.svelte.ts';

    initializeSettings();

    let settingsTab = $state('general');
    let settingsOpen = $state(false);

    let style = $state('magic');
    let barSize = $state(50);
    let episodes = $state(1000);
    let running = $state(false);

    let randomResult = $state(null);
    let greedyResult = $state(null);
    let expertResult = $state(null);
    let qResult = $state(null);
    let qBestTraining = $state(null);
    let qProgress = $state([]);
    let randomProgress = $state([]);
    let qStats = $state(null);
    let ppoResult = $state(null);
    let ppoBestTraining = $state(null);
    let ppoProgress = $state([]);
    let ppoStats = $state(null);
    let currentPhase = $state('');

    const styles = ['magic', 'melee', 'ranged', 'necromancy'];

    function adaptSettings() {
        if (!settingsStore.settings) return {};
        return Object.fromEntries(
            Object.entries(settingsStore.settings).map(([key, value]) => [key, value.value])
        );
    }

    async function runAll() {
        running = true;
        randomResult = null;
        greedyResult = null;
        expertResult = null;
        qResult = null;
        qBestTraining = null;
        qProgress = [];
        randomProgress = [];
        qStats = null;
        ppoResult = null;
        ppoBestTraining = null;
        ppoProgress = [];
        ppoStats = null;

        const adapted = adaptSettings();
        const chunkSize = 50;
        await new Promise(r => setTimeout(r, 0));

        // 1. Greedy (instant)
        currentPhase = 'greedy';
        greedyResult = findGreedyRotation(adapted, barSize, style);
        await new Promise(r => setTimeout(r, 0));

        // 2. Expert (instant)
        currentPhase = 'expert';
        expertResult = findExpertRotation(adapted, barSize, style);
        await new Promise(r => setTimeout(r, 0));

        // 3. Random search in chunks (capped at 1000)
        currentPhase = 'random';
        let randomBest = { rotation: [], damage: 0, ticks: barSize };
        const randomEpisodes = Math.min(episodes, 10);
        const randomChunks = Math.ceil(randomEpisodes / chunkSize);
        for (let i = 0; i < randomChunks; i++) {
            const chunk = findBestRotation(adapted, barSize, style, chunkSize);
            if (chunk.damage > randomBest.damage) randomBest = chunk;
            randomProgress = [...randomProgress, { episode: (i + 1) * chunkSize, damage: randomBest.damage }];
            await new Promise(r => setTimeout(r, 0));
        }
        randomResult = randomBest;

        // 4. Q-Learning: pretrain from expert, then RL
        currentPhase = 'qlearn';
        const agent = new QAgent(0.0005, 0.95, 0.5, 0.998, 0.05);
        agent.seedKnowledge(style);
        agent.pretrainFromExpert(adapted, barSize, style, 20, 5);
        await new Promise(r => setTimeout(r, 0));

        const qChunks = Math.ceil(episodes / chunkSize);
        let overallBestTraining = { rotation: [], damage: 0, ticks: barSize };
        for (let i = 0; i < qChunks; i++) {
            const best = agent.train(adapted, barSize, style, chunkSize);
            if (best.damage > overallBestTraining.damage) overallBestTraining = best;
            qProgress = [...qProgress, { episode: (i + 1) * chunkSize, damage: overallBestTraining.damage }];
            await new Promise(r => setTimeout(r, 0));
        }
        qBestTraining = overallBestTraining;

        qResult = agent.exploit(adapted, barSize, style);
        qStats = agent.getStats();

        // 5. PPO: pretrain from expert, then policy gradient
        currentPhase = 'ppo';
        const ppoAgent = new PPOAgent(0.001, 0.002, 0.95, 0.9, 0.2, 4);
        ppoAgent.seedKnowledge(style);
        ppoAgent.pretrainFromExpert(adapted, barSize, style, 20, 5);
        await new Promise(r => setTimeout(r, 0));

        const ppoChunks = Math.ceil(episodes / chunkSize);
        let ppoBest = { rotation: [], damage: 0, ticks: barSize };
        for (let i = 0; i < ppoChunks; i++) {
            const best = ppoAgent.train(adapted, barSize, style, chunkSize);
            if (best.damage > ppoBest.damage) ppoBest = best;
            ppoProgress = [...ppoProgress, { episode: (i + 1) * chunkSize, damage: ppoBest.damage }];
            await new Promise(r => setTimeout(r, 0));
        }
        ppoBestTraining = ppoBest;

        ppoResult = ppoAgent.exploit(adapted, barSize, style);
        ppoStats = ppoAgent.getStats();

        currentPhase = 'done';
        running = false;
    }

    function getAbilityIcon(key) {
        return abils[key]?.icon ?? '';
    }

    function getAbilityTitle(key) {
        return abils[key]?.title ?? key;
    }

    // Learning curve chart data
    let chartData = $derived.by(() => {
        const allDamages = [
            ...qProgress.map(p => p.damage),
            ...ppoProgress.map(p => p.damage),
            ...randomProgress.map(p => p.damage),
            expertResult?.damage ?? 0,
            greedyResult?.damage ?? 0,
        ].filter(d => d > 0);
        if (allDamages.length === 0) return { maxDmg: 1, minDmg: 0, range: 1 };
        const maxDmg = Math.max(...allDamages);
        const minDmg = Math.min(...allDamages) * 0.9; // 10% padding below
        return { maxDmg, minDmg, range: maxDmg - minDmg || 1 };
    });

    let bestDamage = $derived(
        greedyResult && randomResult && qResult
            ? Math.max(greedyResult.damage, randomResult.damage, qResult.damage, expertResult?.damage ?? 0, ppoResult?.damage ?? 0)
            : 1
    );

    function formatRotation(rotation) {
        if (!rotation) return [];
        const items = [];
        let nullCount = 0;
        for (const key of rotation) {
            if (key == null) {
                nullCount++;
            } else {
                if (nullCount > 0) {
                    items.push({ type: 'gap', ticks: nullCount });
                    nullCount = 0;
                }
                items.push({ type: 'ability', key });
            }
        }
        return items;
    }
</script>

<svelte:head>
    <title>Rotation Agent</title>
</svelte:head>

<Navbar />
<Header title="Rotation Agent" />

<div class="max-w-screen-xl mx-auto px-4 py-6">
    <!-- Controls -->
    <div class="card mb-4">
        <div class="flex flex-wrap gap-4 items-end">
            <div>
                <label class="text-xs text-gray-400 block mb-1">Style</label>
                <select class="bg-gray-700 text-white rounded px-3 py-2 text-sm" bind:value={style}>
                    {#each styles as s}
                        <option value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label class="text-xs text-gray-400 block mb-1">Bar Size</label>
                <input type="number" class="bg-gray-700 text-white rounded px-3 py-2 text-sm w-20" bind:value={barSize} min="10" max="200" />
            </div>
            <div>
                <label class="text-xs text-gray-400 block mb-1">Episodes</label>
                <input type="number" class="bg-gray-700 text-white rounded px-3 py-2 text-sm w-24" bind:value={episodes} min="100" max="10000" step="100" />
            </div>
            <button
                class="bg-sky-700 hover:bg-sky-600 text-white rounded px-4 py-2 text-sm transition-colors disabled:opacity-50"
                onclick={runAll}
                disabled={running}
            >
                {running ? 'Running...' : 'Compare Agents'}
            </button>
        </div>
    </div>

    <!-- Settings -->
    <div class="card mb-4">
        <button
            class="w-full flex items-center justify-between text-sm text-gray-300 hover:text-white transition-colors"
            onclick={() => settingsOpen = !settingsOpen}
        >
            <span class="font-semibold uppercase text-xs tracking-wide">Settings</span>
            <span class="text-gray-500 text-xs">{settingsOpen ? 'Hide' : 'Show'}</span>
        </button>
        {#if settingsOpen}
            <div class="mt-4">
                <RotationSettings
                    bind:tab={settingsTab}
                    updateDamages={() => {}}
                    stacks={rotationStore.stacks}
                />
            </div>
        {/if}
    </div>

    <!-- Results Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <!-- Greedy -->
        <div class="card">
            <h3 class="text-xs uppercase font-semibold mb-2" style="color: #f59e0b;">Greedy</h3>
            {#if greedyResult}
                <div class="text-2xl font-bold text-white mb-2">{greedyResult.damage.toLocaleString()}</div>
                <div class="text-xs text-gray-400 mb-3">1 episode (simulates each option)</div>
                <div class="flex flex-wrap gap-0.5">
                    {#each formatRotation(greedyResult.rotation) as item}
                        {#if item.type === 'ability'}
                            <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                        {:else}
                            <span class="text-gray-700 text-xs px-0.5">·</span>
                        {/if}
                    {/each}
                </div>
            {:else if running}
                <div class="text-gray-500 text-sm">Running...</div>
            {/if}
        </div>

        <!-- Expert -->
        <div class="card">
            <h3 class="text-xs uppercase font-semibold mb-2" style="color: #d946ef;">Expert</h3>
            {#if expertResult}
                <div class="text-2xl font-bold text-white mb-2">{expertResult.damage.toLocaleString()}</div>
                <div class="text-xs text-gray-400 mb-3">Rule-based (magic priorities)</div>
                <div class="flex flex-wrap gap-0.5">
                    {#each formatRotation(expertResult.rotation) as item}
                        {#if item.type === 'ability'}
                            <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                        {:else}
                            <span class="text-gray-700 text-xs px-0.5">·</span>
                        {/if}
                    {/each}
                </div>
            {:else if running}
                <div class="text-gray-500 text-sm">Running...</div>
            {/if}
        </div>

        <!-- Random -->
        <div class="card">
            <h3 class="text-xs uppercase font-semibold mb-2" style="color: #3b82f6;">Random Search</h3>
            {#if randomResult || randomProgress.length > 0}
                <div class="text-2xl font-bold text-white mb-2">{(randomResult?.damage ?? randomProgress[randomProgress.length - 1]?.damage ?? 0).toLocaleString()}</div>
                <div class="text-xs text-gray-400 mb-1">{randomProgress[randomProgress.length - 1]?.episode ?? 0} / {episodes} episodes</div>
                {#if currentPhase === 'random'}
                    <div class="w-full bg-gray-700 rounded-full h-1 mb-3">
                        <div class="bg-blue-500 h-1 rounded-full transition-all" style="width: {(randomProgress.length / Math.ceil(episodes / 50)) * 100}%"></div>
                    </div>
                {/if}
                {#if randomResult}
                <div class="flex flex-wrap gap-0.5">
                    {#each formatRotation(randomResult.rotation) as item}
                        {#if item.type === 'ability'}
                            <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                        {:else}
                            <span class="text-gray-700 text-xs px-0.5">·</span>
                        {/if}
                    {/each}
                </div>
                {/if}
            {:else if running}
                <div class="text-gray-500 text-sm">Searching...</div>
            {/if}
        </div>

        <!-- Q-Learning -->
        <div class="card">
            <h3 class="text-xs uppercase font-semibold mb-2" style="color: #10b981;">Q-Learning</h3>
            {#if qResult || qProgress.length > 0}
                <div class="text-2xl font-bold text-white mb-2">{(qResult?.damage ?? qProgress[qProgress.length - 1]?.damage ?? 0).toLocaleString()}</div>
                <div class="text-xs text-gray-400 mb-1">
                    {qProgress[qProgress.length - 1]?.episode ?? 0} / {episodes} episodes
                    {#if qStats}
                        · {qStats.actions} actions · ε={qStats.epsilon} · buf={qStats.bufferSize}
                    {/if}
                </div>
                {#if currentPhase === 'qlearn'}
                    <div class="w-full bg-gray-700 rounded-full h-1 mb-3">
                        <div class="bg-emerald-500 h-1 rounded-full transition-all" style="width: {(qProgress.length / Math.ceil(episodes / 50)) * 100}%"></div>
                    </div>
                {/if}
                {#if qResult}
                    <div class="text-xs text-gray-400 mt-2 mb-1">Learned policy:</div>
                    <div class="flex flex-wrap gap-0.5">
                        {#each formatRotation(qResult.rotation) as item}
                            {#if item.type === 'ability'}
                                <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                            {:else}
                                <span class="text-gray-700 text-xs px-0.5">·</span>
                            {/if}
                        {/each}
                    </div>
                {/if}
                {#if qBestTraining && qBestTraining.damage > (qResult?.damage ?? 0)}
                    <div class="text-xs text-gray-400 mt-2 mb-1">Best during training ({qBestTraining.damage.toLocaleString()}):</div>
                    <div class="flex flex-wrap gap-0.5">
                        {#each formatRotation(qBestTraining.rotation) as item}
                            {#if item.type === 'ability'}
                                <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                            {:else}
                                <span class="text-gray-700 text-xs px-0.5">·</span>
                            {/if}
                        {/each}
                    </div>
                {/if}
            {:else if running}
                <div class="text-gray-500 text-sm">Training...</div>
            {/if}
        </div>

        <!-- PPO -->
        <div class="card">
            <h3 class="text-xs uppercase font-semibold mb-2" style="color: #ec4899;">PPO</h3>
            {#if ppoResult || ppoProgress.length > 0}
                <div class="text-2xl font-bold text-white mb-2">{(ppoResult?.damage ?? ppoProgress[ppoProgress.length - 1]?.damage ?? 0).toLocaleString()}</div>
                <div class="text-xs text-gray-400 mb-1">
                    {ppoProgress[ppoProgress.length - 1]?.episode ?? 0} / {episodes} episodes
                    {#if ppoStats}
                        · {ppoStats.actions} actions
                    {/if}
                </div>
                {#if currentPhase === 'ppo'}
                    <div class="w-full bg-gray-700 rounded-full h-1 mb-3">
                        <div class="bg-pink-500 h-1 rounded-full transition-all" style="width: {(ppoProgress.length / Math.ceil(episodes / 50)) * 100}%"></div>
                    </div>
                {/if}
                {#if ppoResult}
                    <div class="text-xs text-gray-400 mt-2 mb-1">Learned policy:</div>
                    <div class="flex flex-wrap gap-0.5">
                        {#each formatRotation(ppoResult.rotation) as item}
                            {#if item.type === 'ability'}
                                <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                            {:else}
                                <span class="text-gray-700 text-xs px-0.5">·</span>
                            {/if}
                        {/each}
                    </div>
                {/if}
                {#if ppoBestTraining && ppoBestTraining.damage > (ppoResult?.damage ?? 0)}
                    <div class="text-xs text-gray-400 mt-2 mb-1">Best during training ({ppoBestTraining.damage.toLocaleString()}):</div>
                    <div class="flex flex-wrap gap-0.5">
                        {#each formatRotation(ppoBestTraining.rotation) as item}
                            {#if item.type === 'ability'}
                                <ActionIcon type="ability" src={getAbilityIcon(item.key)} size="sm" title={getAbilityTitle(item.key)} />
                            {:else}
                                <span class="text-gray-700 text-xs px-0.5">·</span>
                            {/if}
                        {/each}
                    </div>
                {/if}
            {:else if running}
                <div class="text-gray-500 text-sm">Training...</div>
            {/if}
        </div>
    </div>

    <!-- Comparison -->
    {#if greedyResult && randomResult && qResult}
        <div class="card mt-4">
            <h3 class="text-xs uppercase font-semibold text-gray-400 mb-3">Comparison</h3>
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <span class="text-xs w-24" style="color: #f59e0b;">Greedy</span>
                    <div class="flex-1 bg-gray-700 rounded-full h-3">
                        <div class="h-3 rounded-full" style="width: {(greedyResult.damage / bestDamage) * 100}%; background-color: #f59e0b;"></div>
                    </div>
                    <span class="text-xs text-white w-20 text-right">{greedyResult.damage.toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs w-24" style="color: #d946ef;">Expert</span>
                    <div class="flex-1 bg-gray-700 rounded-full h-3">
                        <div class="h-3 rounded-full" style="width: {((expertResult?.damage ?? 0) / bestDamage) * 100}%; background-color: #d946ef;"></div>
                    </div>
                    <span class="text-xs text-white w-20 text-right">{(expertResult?.damage ?? 0).toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs w-24" style="color: #3b82f6;">Random</span>
                    <div class="flex-1 bg-gray-700 rounded-full h-3">
                        <div class="h-3 rounded-full" style="width: {(randomResult.damage / bestDamage) * 100}%; background-color: #3b82f6;"></div>
                    </div>
                    <span class="text-xs text-white w-20 text-right">{randomResult.damage.toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs w-24" style="color: #10b981;">Q-Learning</span>
                    <div class="flex-1 bg-gray-700 rounded-full h-3">
                        <div class="h-3 rounded-full" style="width: {(qResult.damage / bestDamage) * 100}%; background-color: #10b981;"></div>
                    </div>
                    <span class="text-xs text-white w-20 text-right">{qResult.damage.toLocaleString()}</span>
                </div>
                {#if ppoResult}
                <div class="flex items-center gap-3">
                    <span class="text-xs w-24" style="color: #ec4899;">PPO</span>
                    <div class="flex-1 bg-gray-700 rounded-full h-3">
                        <div class="h-3 rounded-full" style="width: {(ppoResult.damage / bestDamage) * 100}%; background-color: #ec4899;"></div>
                    </div>
                    <span class="text-xs text-white w-20 text-right">{ppoResult.damage.toLocaleString()}</span>
                </div>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Learning Curve -->
    {#if qProgress.length > 1 || randomProgress.length > 1 || ppoProgress.length > 1}
        <div class="card mt-4">
            <h3 class="text-xs uppercase font-semibold text-gray-400 mb-3">Learning Curve</h3>
            <svg viewBox="0 0 600 170" class="w-full" style="max-height: 200px;">
                <!-- Grid lines -->
                {#each [0, 0.25, 0.5, 0.75, 1] as frac}
                    <line x1="0" y1={150 - frac * 150} x2={600} y2={150 - frac * 150} stroke="rgba(255,255,255,0.05)" />
                    <text x="2" y={150 - frac * 150 - 2} fill="#666" font-size="8">{Math.round(chartData.minDmg + frac * chartData.range).toLocaleString()}</text>
                {/each}

                <!-- Expert baseline -->
                {#if expertResult}
                    {@const ey = 150 - ((expertResult.damage - chartData.minDmg) / chartData.range) * 150}
                    <line x1="0" y1={ey} x2={600} y2={ey} stroke="#d946ef" stroke-dasharray="4 4" opacity="0.5" />
                    <text x={560} y={ey - 3} fill="#d946ef" font-size="8">Expert</text>
                {/if}

                <!-- Greedy baseline -->
                {#if greedyResult}
                    {@const gy = 150 - ((greedyResult.damage - chartData.minDmg) / chartData.range) * 150}
                    <line x1="0" y1={gy} x2={600} y2={gy} stroke="#f59e0b" stroke-dasharray="4 4" opacity="0.5" />
                    <text x={558} y={gy - 3} fill="#f59e0b" font-size="8">Greedy</text>
                {/if}

                <!-- Random progress line -->
                {#if randomProgress.length > 1}
                    <polyline
                        fill="none"
                        stroke="#3b82f6"
                        stroke-width="2"
                        points={randomProgress.map((p, i) =>
                            `${(i / (randomProgress.length - 1)) * 600},${150 - ((p.damage - chartData.minDmg) / chartData.range) * 150}`
                        ).join(' ')}
                    />
                {/if}

                <!-- Q-Learning progress line -->
                {#if qProgress.length > 1}
                    <polyline
                        fill="none"
                        stroke="#10b981"
                        stroke-width="2"
                        points={qProgress.map((p, i) =>
                            `${(i / (qProgress.length - 1)) * 600},${150 - ((p.damage - chartData.minDmg) / chartData.range) * 150}`
                        ).join(' ')}
                    />
                {/if}

                <!-- PPO progress line -->
                {#if ppoProgress.length > 1}
                    <polyline
                        fill="none"
                        stroke="#ec4899"
                        stroke-width="2"
                        points={ppoProgress.map((p, i) =>
                            `${(i / (ppoProgress.length - 1)) * 600},${150 - ((p.damage - chartData.minDmg) / chartData.range) * 150}`
                        ).join(' ')}
                    />
                {/if}

                <!-- Legend -->
                <text x={300} y={165} fill="#666" font-size="9" text-anchor="middle">Episodes</text>
            </svg>
        </div>
    {/if}
</div>
