<script>
    import { keybindStore, keybindActions } from '$lib/stores/keybindStore.svelte.ts';
    import { rotationStore } from '$lib/stores/rotationStore.svelte.ts';
    import { allExtraActions } from '$lib/special/abilities';
    import { abils } from '$lib/data/abilities';
    import { armour } from '$lib/data/armour';
    import { weapons } from '$lib/data/weapons';

    let { show = $bindable(false), phaseBreaks = [] } = $props();

    // For each sequence index, check if a phase break falls between the previous and current tick
    function getPhaseBreakBefore(i) {
        const tick = sequence.ticks[i];
        const prevTick = i > 0 ? sequence.ticks[i - 1] : -1;
        // Only show once per tick (skip if same tick as previous entry)
        if (i > 0 && tick === prevTick) return null;
        for (const pb of phaseBreaks) {
            if (pb.tick > prevTick && pb.tick <= tick) return pb.label;
        }
        return null;
    }

    let activeView = $state('sequence');

    // Style filters for keyboard view
    const allStyles = ['melee', 'ranged', 'magic', 'necromancy', 'defence', 'shared'];
    let selectedStyles = $state(new Set(allStyles));
    let showHeatmap = $state(false);

    // Combined lookup for titles/icons (abilities + extra actions + gear)
    // Include lowercase aliases so keybind keys (often lowercase) resolve correctly
    let lookup = $derived.by(() => {
        const base = { ...abils, ...allExtraActions };
        // Add armour and weapons by key
        for (const [key, item] of Object.entries(armour)) {
            if (item?.title && !(key in base)) base[key] = item;
        }
        for (const [key, item] of Object.entries(weapons)) {
            if (item?.title && !(key in base)) base[key] = item;
        }
        const result = { ...base };
        for (const [key, val] of Object.entries(base)) {
            const lower = key.toLowerCase();
            if (!(lower in result)) result[lower] = val;
        }
        return result;
    });

    let sequence = $derived(show
        ? keybindActions.generateKeypressSequence(
            rotationStore.abilityBar,
            rotationStore.extraActionBar,
            abils,
            allExtraActions
        )
        : { keys: [], ticks: [] });

    // Alias map: maps user input (lowercased) to keyboard key ID
    const keyAliases = {
        'ins': 'insert', 'pgup': 'pageup', 'pgdn': 'pagedown', 'pgdown': 'pagedown',
        'del': 'delete', 'esc': 'escape',
        'backspace': 'backspace', 'tab': 'tab', 'caps': 'caps', 'enter': 'enter',
        'shift': 'shift', 'ctrl': 'ctrl', 'alt': 'alt', 'space': 'space',
    };
    function resolveKey(rawKey) {
        const k = rawKey.toLowerCase();
        return keyAliases[k] || k;
    }

    // Count how many times each key is pressed in the rotation
    let keyFrequency = $derived.by(() => {
        const freq = {};
        let max = 0;
        for (const keyStr of sequence.keys) {
            const parts = keyStr.split(/\s+/);
            const mainKey = resolveKey(parts[parts.length - 1]);
            freq[mainKey] = (freq[mainKey] || 0) + 1;
            if (freq[mainKey] > max) max = freq[mainKey];
        }
        return { freq, max };
    });

    function heatmapColor(key) {
        if (!showHeatmap || keyFrequency.max === 0) return '';
        const count = keyFrequency.freq[key] || 0;
        if (count === 0) return '';
        const intensity = count / keyFrequency.max;
        // Gradient from cool blue (low) to hot red (high)
        const r = Math.round(255 * intensity);
        const g = Math.round(80 * (1 - intensity));
        const b = Math.round(200 * (1 - intensity));
        return `background: rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.35}); border-color: rgba(${r}, ${g}, ${b}, 0.7);`;
    }

    let plainText = $derived.by(() => {
        const parts = [];
        for (let i = 0; i < sequence.keys.length; i++) {
            const breakLabel = getPhaseBreakBefore(i);
            if (breakLabel) {
                parts.push(`\n--- ${breakLabel} ---\n`);
            }
            parts.push(sequence.keys[i]);
        }
        return parts.join(' \u2192 ');
    });

    // Build a map of key -> ability for the keyboard view
    let keyToAbility = $derived.by(() => {
        const map = {};
        for (const [abilKey, keyStr] of Object.entries(keybindStore.bindings)) {
            if (!keyStr) continue;
            const info = lookup[abilKey];
            if (!info) continue;
            const style = info.mainStyle || info.style || 'shared';
            // Filter by selected styles
            if (!selectedStyles.has(style)) continue;
            // Use the last key part as the keyboard key, resolve aliases
            const parts = keyStr.split(/\s+/);
            const mainKey = resolveKey(parts[parts.length - 1]);
            if (!map[mainKey]) map[mainKey] = [];
            map[mainKey].push({
                abilKey,
                icon: info.icon,
                title: info.title,
                fullBind: keyStr,
                style
            });
        }
        return map;
    });

    // Keyboard layout rows
    const keyboardRows = [
        ['esc', '', 'f1', 'f2', 'f3', 'f4', '', 'f5', 'f6', 'f7', 'f8', '', 'f9', 'f10', 'f11', 'f12'],
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace', '', 'insert', 'home', 'pageup'],
        ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', '', 'delete', 'end', 'pagedown'],
        ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
        ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'rshift'],
        ['ctrl', 'alt', 'space', 'ralt', 'rctrl']
    ];

    // Display labels for special keys
    const keyLabels = {
        'esc': 'Esc', 'backspace': '\u232B', 'tab': 'Tab', 'caps': 'Caps',
        'enter': 'Enter', 'shift': 'Shift', 'rshift': 'Shift',
        'ctrl': 'Ctrl', 'rctrl': 'Ctrl', 'alt': 'Alt', 'ralt': 'Alt',
        'space': 'Space', '\\': '\\',
        'f1': 'F1', 'f2': 'F2', 'f3': 'F3', 'f4': 'F4',
        'f5': 'F5', 'f6': 'F6', 'f7': 'F7', 'f8': 'F8',
        'f9': 'F9', 'f10': 'F10', 'f11': 'F11', 'f12': 'F12',
        'insert': 'Ins', 'home': 'Home', 'pageup': 'PgUp',
        'delete': 'Del', 'end': 'End', 'pagedown': 'PgDn',
    };

    // Width classes for special keys
    const wideKeys = new Set(['backspace', 'tab', 'caps', 'enter', 'shift', 'rshift', 'ctrl', 'rctrl', 'alt', 'ralt']);
    const extraWideKeys = new Set(['space']);

    function copyToClipboard() {
        navigator.clipboard.writeText(plainText);
    }

    function close() {
        show = false;
    }

    function handleOverlayClick(event) {
        if (event.target === event.currentTarget) close();
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') close();
    }

    function getIcon(index) {
        const tick = sequence.ticks[index];
        const mainAbil = rotationStore.abilityBar[tick];
        const extras = rotationStore.extraActionBar[tick];

        let extraCount = 0;
        if (extras) {
            for (const e of extras) {
                if (e != null) extraCount++;
            }
        }

        let firstForTick = index;
        while (firstForTick > 0 && sequence.ticks[firstForTick - 1] === tick) {
            firstForTick--;
        }
        const posInTick = index - firstForTick;

        let abilKey;
        if (posInTick < extraCount) {
            let count = 0;
            for (const e of extras) {
                if (e != null) {
                    if (count === posInTick) { abilKey = e; break; }
                    count++;
                }
            }
        } else {
            abilKey = mainAbil;
        }

        if (abilKey && typeof abilKey === 'object') {
            return abilKey.icon;
        }
        return lookup[abilKey]?.icon;
    }

    function splitKeybind(keyStr) {
        return keyStr.split(/\s+/);
    }
</script>

{#if show}
    <div
        class="modal-overlay"
        onclick={handleOverlayClick}
        onkeydown={handleKeydown}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
    >
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Keypress Sequence</h2>
                <button class="close-btn" onclick={close}>x</button>
            </div>

            <!-- View tabs -->
            <div class="view-tabs">
                <button class="view-tab" class:active={activeView === 'sequence'} onclick={() => activeView = 'sequence'}>
                    Sequence
                </button>
                <button class="view-tab" class:active={activeView === 'keyboard'} onclick={() => activeView = 'keyboard'}>
                    Keyboard
                </button>
            </div>

            {#if activeView === 'sequence'}
                {#if sequence.keys.length === 0}
                    <div class="empty-msg">No abilities in the rotation, or no keybinds configured.</div>
                {:else}
                    <div class="sequence-display">
                        {#each sequence.keys as key, i}
                            {#if getPhaseBreakBefore(i)}
                                <div class="phase-break">
                                    <span class="phase-break-label">{getPhaseBreakBefore(i)}</span>
                                    <span class="phase-break-line"></span>
                                </div>
                            {/if}
                            <div class="key-item">
                                {#if getIcon(i)}
                                    <img src={getIcon(i)} alt="" class="key-icon" width="40" height="40" />
                                {/if}
                                {#each splitKeybind(key) as part, j}
                                    {#if j > 0}
                                        <span class="key-combo-sep">+</span>
                                    {/if}
                                    <span class="keybind">{part}</span>
                                {/each}
                            </div>
                            {#if i < sequence.keys.length - 1}
                                <span class="arrow">&rarr;</span>
                            {/if}
                        {/each}
                    </div>

                    <div class="plain-text-row">
                        <input type="text" class="plain-text" readonly value={plainText} />
                        <button class="copy-btn" onclick={copyToClipboard}>Copy</button>
                    </div>
                {/if}
            {:else}
                <!-- Style filters -->
                <div class="style-filters">
                    {#each allStyles as style}
                        <label class="style-filter" class:active={selectedStyles.has(style)}>
                            <input
                                type="checkbox"
                                checked={selectedStyles.has(style)}
                                onchange={() => {
                                    const next = new Set(selectedStyles);
                                    if (next.has(style)) next.delete(style);
                                    else next.add(style);
                                    selectedStyles = next;
                                }}
                            />
                            <span class="style-name" style="color: var(--color-{style === 'necromancy' ? 'necro' : style}, #aaa)">
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                            </span>
                        </label>
                    {/each}
                </div>
                <!-- Heatmap toggle -->
                <label class="heatmap-toggle">
                    <input type="checkbox" bind:checked={showHeatmap} />
                    <span>Frequency heatmap</span>
                </label>
                <!-- Keyboard layout view -->
                <div class="keyboard-container">
                    {#each keyboardRows as row}
                        <div class="keyboard-row">
                            {#each row as key}
                                {#if key === ''}
                                    <div class="key-spacer"></div>
                                {:else}
                                    {@const bound = keyToAbility[key]}
                                    {@const freq = keyFrequency.freq[key] || 0}
                                    <div
                                        class="kb-key"
                                        class:wide={wideKeys.has(key)}
                                        class:extra-wide={extraWideKeys.has(key)}
                                        class:has-bind={bound && bound.length > 0}
                                        style={heatmapColor(key)}
                                        title={bound ? bound.map(b => `${b.title} [${b.fullBind}]`).join('\n') + (freq ? `\n${freq} presses` : '') : (freq ? `${freq} presses` : '')}
                                    >
                                        <span class="kb-label">{keyLabels[key] || key.toUpperCase()}</span>
                                        {#if showHeatmap && freq > 0}
                                            <span class="kb-freq">{freq}</span>
                                        {:else if bound && bound.length > 0}
                                            <div class="kb-icons">
                                                {#each bound.slice(0, 2) as b}
                                                    <img src={b.icon} alt={b.title} class="kb-abil-icon ability-icon" />
                                                {/each}
                                                {#if bound.length > 2}
                                                    <span class="kb-overflow">+{bound.length - 2}</span>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    {/each}
                </div>
                <p class="keyboard-hint">Keys with bound abilities are highlighted. Hover for details.</p>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }

    .modal-content {
        background: #171d21;
        border-left: 4px solid #c2ba9e;
        border-radius: 8px;
        padding: 1.25rem;
        width: 1080px;
        max-width: 95vw;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.2s ease-out;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .modal-title {
        font-family: Kumbh Sans, sans-serif;
        font-size: 1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #b2dbee;
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        color: #c2ba9e;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }
    .close-btn:hover {
        background: rgba(194, 186, 158, 0.1);
        color: #fff;
    }

    /* View tabs */
    .view-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 0.75rem;
    }

    .view-tab {
        padding: 5px 14px;
        font-size: 0.8rem;
        font-weight: 500;
        color: #888;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #333;
        border-radius: 4px;
        cursor: pointer;
        font-family: Kumbh Sans, sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .view-tab:hover {
        color: #bbb;
        background: rgba(255, 255, 255, 0.06);
    }
    .view-tab.active {
        color: #fbd38d;
        border-color: #fbd38d;
        background: rgba(251, 211, 141, 0.08);
    }

    /* Sequence view */
    .sequence-display {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        border-radius: 6px;
        margin-bottom: 0.75rem;
        overflow-y: auto;
        max-height: 80vh;
    }

    .phase-break {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 4px 0;
    }

    .phase-break-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: #ef4444;
        white-space: nowrap;
        font-family: Kumbh Sans, sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .phase-break-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, #ef4444, transparent);
    }

    .key-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 6px;
        border-radius: 4px;
    }

    .key-icon {
        border-radius: 3px;
        flex-shrink: 0;
    }

    .keybind {
        display: inline-block;
        font-family: monospace;
        font-weight: 600;
        color: #fbd38d;
        background-color: rgba(45, 45, 45, 0.3);
        padding: 0.2rem 0.5rem;
        border-radius: 0.25rem;
        border-bottom: 2px solid rgba(251, 211, 141, 0.3);
        letter-spacing: 0.03em;
        font-size: 1.1rem;
        white-space: nowrap;
    }

    .key-combo-sep {
        color: #666;
        font-size: 0.9rem;
        margin: 0 2px;
    }

    .arrow {
        color: #666;
        font-size: 1rem;
        margin: 0 4px;
    }

    .plain-text-row {
        display: flex;
        gap: 6px;
    }

    .plain-text {
        flex: 1;
        padding: 6px 8px;
        font-size: 0.8rem;
        font-family: monospace;
        color: #aaa;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #444;
        border-radius: 4px;
        outline: none;
    }

    .copy-btn {
        padding: 6px 14px;
        font-size: 0.8rem;
        font-weight: 500;
        color: #c2ba9e;
        background: rgba(194, 186, 158, 0.1);
        border: 1px solid #c2ba9e;
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
    }
    .copy-btn:hover {
        background: rgba(194, 186, 158, 0.2);
    }

    .empty-msg {
        padding: 1.5rem;
        text-align: center;
        color: #666;
        font-size: 0.9rem;
    }

    .style-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
        padding: 0.4rem 0.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #333;
        border-radius: 6px;
    }

    .style-filter {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        font-size: 0.75rem;
        opacity: 0.5;
        transition: opacity 0.15s;
    }

    .style-filter.active {
        opacity: 1;
    }

    .style-filter input {
        display: none;
    }

    .style-name {
        font-weight: 600;
    }

    /* Keyboard layout */
    .keyboard-container {
        padding: 14px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        overflow-x: auto;
    }

    .keyboard-row {
        display: flex;
        gap: 4px;
        justify-content: center;
    }

    .key-spacer {
        width: 20px;
        flex-shrink: 0;
    }

    .kb-key {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        height: 52px;
        padding: 3px 4px;
        background: #2a2e33;
        border: 1px solid #444;
        border-radius: 5px;
        border-bottom: 2px solid #333;
        cursor: default;
        position: relative;
        flex-shrink: 0;
        gap: 2px;
    }

    .kb-key.wide {
        min-width: 68px;
    }

    .kb-key.extra-wide {
        min-width: 200px;
        flex: 1;
    }

    .kb-key.has-bind {
        border-color: #fbd38d;
        background: rgba(251, 211, 141, 0.08);
        box-shadow: 0 0 6px rgba(251, 211, 141, 0.15);
    }

    .kb-label {
        font-family: monospace;
        font-size: 0.65rem;
        color: #888;
        line-height: 1;
    }

    .kb-key.has-bind .kb-label {
        color: #ccc;
    }

    .kb-icons {
        display: flex;
        gap: 2px;
    }

    .kb-abil-icon {
        border-radius: 2px;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
    }

    .kb-overflow {
        font-size: 0.55rem;
        color: #fbd38d;
        align-self: center;
    }

    .keyboard-hint {
        text-align: center;
        color: #555;
        font-size: 0.7rem;
        margin-top: 8px;
        margin-bottom: 0;
    }

    .heatmap-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 0.4rem;
        cursor: pointer;
        font-size: 0.75rem;
        color: #888;
    }

    .heatmap-toggle input {
        accent-color: #fbd38d;
        cursor: pointer;
    }

    .kb-freq {
        font-size: 0.7rem;
        font-weight: bold;
        color: #fff;
        line-height: 1;
    }

    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
</style>
