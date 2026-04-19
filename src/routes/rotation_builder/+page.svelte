<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Navbar from '$components/Layout/Navbar.svelte';
	import Header from '$components/Layout/Header.svelte';
    import { abils } from '$lib/data/abilities';
	import { settingsConfig, SETTINGS } from '$lib/calc/settings_rb';
    import RotationSettings from '../../components/Settings/RotationSettings.svelte';
    import AbilityChoice from '../../components/RotationBuilder/AbilityChoice.svelte';
        import ExtraActionsPanel from '../../components/RotationBuilder/ExtraActionsPanel.svelte';
    import DamageDistributionChart from '../../components/RotationBuilder/DamageDistributionChart.svelte';
	import TabButton from '../../components/UI/TabButton.svelte';
    import GradientSeparator from '../../components/UI/GradientSeparator.svelte';
    import PillToggle from '../../components/UI/PillToggle.svelte';
    import Popup from '../../components/UI/Popup.svelte';
    import RotationConfigManager from '../../components/RotationBuilder/RotationConfigManager.svelte';
    import KeybindConfigModal from '../../components/RotationBuilder/KeybindConfigModal.svelte';
    import KeypressOutputModal from '../../components/RotationBuilder/KeypressOutputModal.svelte';
    import { allExtraActions } from '$lib/special/abilities';
    import * as eventHandlers from '$lib/utils/rotationEventHandlers';
    import { uiStore, uiActions } from '$lib/stores/uiStore.svelte.js';
    import { notificationStore, notifActions } from '$lib/stores/notificationStore.svelte.js';
    import { rotationStore } from '$lib/stores/rotationStore.svelte.js';
    import { settingsStore } from '$lib/stores/settingsStore.svelte.js';
    import { getBossPresetWithEnrage, type BossAttack, type BossAttackPattern } from '$lib/data/bosses/boss_presets';
    import { suggestNextAbility, resolveTumekensAsphyxiate, type AbilitySuggestion } from '$lib/calc/rotation_builder/rotation-damage-calculator';


    const filterByStyle = (style) => Object.fromEntries(
        Object.entries(abils).filter(([, a]) => a.title && a.mainStyle === style)
    );
    const rangedAbils = filterByStyle('ranged');
    const magicAbils = filterByStyle('magic');
    const meleeAbils = filterByStyle('melee');
    const necroAbils = filterByStyle('necromancy');
	const defAbils = filterByStyle('defence')
	// let defAbils = {...def_abilities};
    let allAbils = {...abils};

    // Keybind modal state
    let showKeybindModal = $state(false);
    let showKeypressModal = $state(false);

	// UI Constants
	const stackFontSize = 10;
	const baseStackOffset = 42;
	const stackPadding = 5;
	const buffLineWidth = 42;
	const buffLineHeight = 6;
	const CELL_SIZE = 40;
	const BASE_ROW_HEIGHT = 40;
	const ROW_GAP = 20; // Constant gap between all rows

	// Phase/kill markers from calc engine (single source of truth)
	let phaseMarkers = $derived(rotationStore.phaseTransitions.map(pt => ({
		tick: pt.tick,
		label: pt.label,
		hp: pt.hp,
		...(pt.pause > 0 && pt.phaseIdx < (getEffectiveBoss()?.phases?.length ?? 1) - 1
			? { pauseEnd: pt.tick + pt.pause } : {})
	})));
	let phaseTickMap = $derived(new Map(phaseMarkers.map(m => [m.tick, m])));
	// Set of ticks that fall within a phase pause (boss invulnerable)
	let pauseTickSet = $derived.by(() => {
		const s = new Set<number>();
		for (const m of phaseMarkers) {
			if (m.pauseEnd != null) {
				for (let t = m.tick + 1; t <= m.pauseEnd; t++) s.add(t);
			}
		}
		return s;
	});

	// Boss pattern start tick
	let patternStartTick = $derived(settingsStore.settings[SETTINGS.BOSS_PATTERN_START]?.value ?? -1);

	let bossName = $derived.by(() => {
		const val = settingsStore.settings[SETTINGS.BOSS_PRESET]?.value;
		return val && val !== 'none' ? val : 'ROTATION';
	});
	let killTime = $derived.by(() => {
		const killMarker = phaseMarkers.find(m => m.label === 'Kill');
		if (!killMarker) return null;
		const startTick = patternStartTick >= 0 ? patternStartTick : 0;
		const ticks = killMarker.tick - startTick;
		const totalSeconds = ticks * 0.6;
		const mins = Math.floor(totalSeconds / 60);
		const secs = (totalSeconds % 60).toFixed(1);
		return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
	});

	// Dynamic row layout state
	let abilityBarElement: HTMLElement | null = null;
	let columnsPerRow = $state(20); // Default, will be calculated
	let rowLayoutData = $state<Array<{
		startIndex: number;
		endIndex: number;
		activeBuffs: string[];
		buffIndices: Record<string, number>;
		buffCount: number;  // Number of active buffs on this row (for stack positioning)
		height: number;
		activeStacks: string[];
		stackIndices: Record<string, number>;
	}>>([]);
	let resizeObserver: ResizeObserver | null = null;

	// Calculate which buffs are active on each visual row and assign compact indices
	function recalculateRowLayout() {
		if (!abilityBarElement) return;

		const containerWidth = abilityBarElement.clientWidth;
		const newColumnsPerRow = Math.max(1, Math.floor(containerWidth / CELL_SIZE));
		columnsPerRow = newColumnsPerRow;

		const totalSlots = rotationStore.abilityBar.length;
		const numRows = Math.ceil(totalSlots / columnsPerRow);
		const newRowData: typeof rowLayoutData = [];

		for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
			const startIndex = rowIndex * columnsPerRow;
			const endIndex = Math.min(startIndex + columnsPerRow, totalSlots);

			// Find which buffs are active on any tick in this row
			const activeBuffsSet = new Set<string>();
			for (let i = startIndex; i < endIndex; i++) {
				for (const buffKey of Object.keys(rotationStore.buffs)) {
					const buff = rotationStore.buffs[buffKey];
					if (buff.activeRows && buff.activeRows.includes(i)) {
						activeBuffsSet.add(buffKey);
					}
				}
			}

			// Find which stacks are displayed on any tick in this row
			const activeStacksSet = new Set<string>();
			for (let i = startIndex; i < endIndex; i++) {
				for (const stackKey of Object.keys(rotationStore.stacks)) {
					const stack = rotationStore.stacks[stackKey];
					if (stack.idx >= 0 && stack.stackTicks && showStack(i, stack.stackTicks)) {
						activeStacksSet.add(stackKey);
					}
				}
			}

			// Assign compact local indices to active buffs (0, 1, 2...)
			const activeBuffs = [...activeBuffsSet];
			const buffIndices: Record<string, number> = {};
			activeBuffs.forEach((buffKey, idx) => {
				buffIndices[buffKey] = idx;
			});

			// Assign compact local indices to active stacks
			const activeStacks = [...activeStacksSet];
			const stackIndices: Record<string, number> = {};
			activeStacks.forEach((stackKey, idx) => {
				stackIndices[stackKey] = idx;
			});

			// Calculate row height: base slot height + space for buffs below + space for stacks below buffs + constant gap
			// Buff bars extend below slot: initial 9px offset + 6px per buff
			const buffSpace = activeBuffs.length > 0 ? 9 + activeBuffs.length * buffLineHeight : 0;
			// Stacks positioned below buffs: each stack takes ~12px
			const stackSpace = activeStacks.length * (stackFontSize + stackPadding);
			// Additional padding when there's content below the slot
			const contentPadding = (activeBuffs.length > 0 || activeStacks.length > 0) ? 8 : 0;
			// Boss attack pattern row
			const patternSpace = hasAttackPattern ? PATTERN_ROW_HEIGHT + PATTERN_ROW_GAP : 0;
			const height = BASE_ROW_HEIGHT + buffSpace + stackSpace + contentPadding + patternSpace + ROW_GAP;

			newRowData.push({
				startIndex,
				endIndex,
				activeBuffs,
				buffIndices,
				buffCount: activeBuffs.length,
				height,
				activeStacks,
				stackIndices
			});
		}

		rowLayoutData = newRowData;
	}

	// Get the local buff index for a specific tick
	function getBuffLocalIndex(buffKey: string, tickIndex: number): number {
		const rowIndex = Math.floor(tickIndex / columnsPerRow);
		const rowData = rowLayoutData[rowIndex];
		if (!rowData) return -1;
		return rowData.buffIndices[buffKey] ?? -1;
	}

	// Get the local stack index for a specific tick
	function getStackLocalIndex(stackKey: string, tickIndex: number): number {
		const rowIndex = Math.floor(tickIndex / columnsPerRow);
		const rowData = rowLayoutData[rowIndex];
		if (!rowData) return -1;
		return rowData.stackIndices[stackKey] ?? -1;
	}

	// Get the local buff count for a specific tick (used for stack positioning)
	function getLocalBuffCount(tickIndex: number): number {
		const rowIndex = Math.floor(tickIndex / columnsPerRow);
		const rowData = rowLayoutData[rowIndex];
		if (!rowData) return 0;
		return rowData.buffCount;
	}

	// Calculate the vertical offset for stacks based on local buff count
	function getStackTopOffset(tickIndex: number, localStackIdx: number): number {
		const localBuffCount = getLocalBuffCount(tickIndex);
		// Stacks are positioned below the slot and below any buff bars
		// baseStackOffset (32) accounts for the slot height + some padding
		// Then we add space for buff bars (buffLineHeight per buff + initial offset)
		const buffSpace = localBuffCount > 0 ? (buffLineHeight * 1.5) + (localBuffCount * buffLineHeight) : 0;
		return baseStackOffset + buffSpace + 3 + (stackFontSize + stackPadding) * localStackIdx;
	}

	// Calculate the vertical offset for the boss attack pattern row
	function getPatternTopOffset(tickIndex: number): number {
		const localBuffCount = getLocalBuffCount(tickIndex);
		const rowIndex = Math.floor(tickIndex / columnsPerRow);
		const rowData = rowLayoutData[rowIndex];
		const localStackCount = rowData ? rowData.activeStacks.length : 0;
		const buffSpace = localBuffCount > 0 ? (buffLineHeight * 1.5) + (localBuffCount * buffLineHeight) : 0;
		const stackSpace = localStackCount * (stackFontSize + stackPadding);
		return baseStackOffset + buffSpace + stackSpace + 5;
	}

	// Get default color for a boss attack type
	function getAttackColor(attack: BossAttack): string {
		if (attack.color) return attack.color;
		switch (attack.type) {
			case 'auto': return '#4a5568';
			case 'special': return '#e74c3c';
			case 'mechanic': return '#8e44ad';
			default: return '#4a5568';
		}
	}

	// Get the effective boss preset accounting for enrage
	function getEffectiveBoss() {
		if (!settingsStore.initialized) return null;
		const bossKey = settingsStore.settings[SETTINGS.BOSS_PRESET]?.value;
		if (!bossKey || bossKey === 'none') return null;
		const enrage = settingsStore.settings[SETTINGS.BOSS_ENRAGE]?.value ?? 0;
		return getBossPresetWithEnrage(bossKey, enrage);
	}

	// Get boss health from selected preset (if any)
	function getBossHealth(): number | null {
		return getEffectiveBoss()?.health ?? null;
	}

	// Boss attack pattern constants
	const PATTERN_ROW_HEIGHT = 18;
	const PATTERN_ROW_GAP = 2;

	/** Flatten a boss attack cycle into an array of per-tick entries */
	function flattenAttackCycle(pattern: BossAttackPattern): Array<{ attack: BossAttack; tickInAttack: number; totalTicks: number }> {
		const flat: Array<{ attack: BossAttack; tickInAttack: number; totalTicks: number }> = [];
		for (const attack of pattern.cycle) {
			const count = attack.count ?? 1;
			const totalTicks = attack.ticks * count;
			for (let t = 0; t < totalTicks; t++) {
				flat.push({ attack, tickInAttack: t, totalTicks });
			}
		}
		return flat;
	}

	// Derived: flattened patterns per phase for current boss
	let flattenedPatterns = $derived.by(() => {
		const boss = getEffectiveBoss();
		if (!boss?.phases?.length) return [];
		return boss.phases.map(phase =>
			phase.attackPattern ? flattenAttackCycle(phase.attackPattern) : []
		);
	});

	// Derived: whether boss has any attack pattern
	let hasAttackPattern = $derived(flattenedPatterns.some(f => f.length > 0));

	/** Determine which phase index a tick falls in and how many ticks into that phase */
	function getPhaseAtTick(tick: number): { phaseIndex: number; ticksIntoPhaseCycle: number } {
		// Phase markers mark the END of a phase (transition points)
		// Before first marker = phase 0, after marker[0] = phase 1, etc.
		let phaseIndex = 0;
		let phaseStartTick = settingsStore.settings[SETTINGS.BOSS_PATTERN_START]?.value ?? 0;

		for (const marker of phaseMarkers) {
			const resumeTick = (marker.pauseEnd ?? marker.tick) + 1;
			if (tick >= resumeTick) {
				phaseIndex++;
				phaseStartTick = resumeTick;
			} else {
				break;
			}
		}

		return { phaseIndex, ticksIntoPhaseCycle: tick - phaseStartTick };
	}

	/** Get the boss attack at a given ability bar tick, accounting for phase and pattern start offset */
	function getBossAttackAtTick(tick: number): { attack: BossAttack; tickInAttack: number; totalTicks: number; isStart: boolean } | null {
		if (!flattenedPatterns.length) return null;

		const startTick = settingsStore.settings[SETTINGS.BOSS_PATTERN_START]?.value ?? 0;
		if (tick < startTick) return null;

		// During a pause, no boss attacks
		if (pauseTickSet.has(tick)) return null;

		const { phaseIndex, ticksIntoPhaseCycle } = getPhaseAtTick(tick);

		// Use the pattern for this phase, or fall back to the last defined pattern
		const patternIdx = Math.min(phaseIndex, flattenedPatterns.length - 1);
		const flat = flattenedPatterns[patternIdx];
		if (!flat?.length) return null;

		if (ticksIntoPhaseCycle < 0) return null;

		const idx = ticksIntoPhaseCycle % flat.length;
		const entry = flat[idx];
		return { ...entry, isStart: entry.tickInAttack % entry.attack.ticks === 0 };
	}


	// Generate CSS for grid-template-rows based on calculated row heights
	function getGridTemplateRows(): string {
		if (rowLayoutData.length === 0) return '';
		return rowLayoutData.map(row => `${row.height}px`).join(' ');
	}

	onMount(() => {
		// Set up ResizeObserver to recalculate on container resize
		resizeObserver = new ResizeObserver(() => {
			recalculateRowLayout();
		});

		// Initial calculation after DOM is ready
		setTimeout(() => {
			if (abilityBarElement) {
				resizeObserver?.observe(abilityBarElement);
				recalculateRowLayout();
			}
		}, 0);
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});

	// Recalculate row layout when buffs change
	$effect(() => {
		// Track changes to buff activeRows
		const _trigger = Object.keys(rotationStore.buffs).map(k =>
			rotationStore.buffs[k].activeRows?.length ?? 0
		);
		recalculateRowLayout();
	});

	const tabs = [
		{ id: 'ranged', label: 'Ranged', abilities: rangedAbils },
		{ id: 'magic', label: 'Magic', abilities: magicAbils },
		{ id: 'melee', label: 'Melee', abilities: meleeAbils, badge: 'beta' },
		{ id: 'necro', label: 'Necro', abilities: necroAbils, badge: 'beta' },
		{ id: 'defence', label: 'Defence', abilities: defAbils, badge: 'beta'}
	];

	// Create stores object for event handlers
	const stores = {
		uiStore,
		rotationStore,
		settingsStore,
		uiActions,
		notifActions
	};

	// Ability suggestions
	let suggestions: AbilitySuggestion[] = $state([]);
	let suggestionsCollapsed = $state(false);

	// Wrapper functions for event handlers
	function calculateTotalDamageNew() {
		eventHandlers.calculateTotalDamageNew();

		if (uiStore.showSuggestions.value && rotationStore._finalState && rotationStore._finalSettings) {
			const style = uiStore.activeTab ?? 'melee';
			const styleMap = { ranged: 'ranged', magic: 'magic', melee: 'melee', necro: 'necromancy' };
			const candidates = Object.entries(abils)
				.filter(([, a]) => a.title && a.mainStyle === styleMap[style])
				.map(([key]) => key);
			suggestions = suggestNextAbility(
				rotationStore._finalState,
				rotationStore._finalSettings,
				candidates
			);
		} else if (!uiStore.showSuggestions.value) {
			suggestions = [];
		}
	}

	function refreshUI(calcDmg = true) {
		eventHandlers.refreshUI(calcDmg, stores, calculateTotalDamageNew);
	}

	function clearRotation() {
		eventHandlers.clearRotation(stores, refreshUI, calculateTotalDamageNew);
	}

	//UI functions
	//TODO handle this differently
    function handleAbilityClick(event, abilityKey, mainBar = true) {
		eventHandlers.handleAbilityClick(event, abilityKey, mainBar, stores, calculateTotalDamageNew, refreshUI);
    }

	function handleAbilityClickExtra(event, abilityKey) {
		eventHandlers.handleAbilityClickExtra(event, abilityKey, stores, calculateTotalDamageNew, refreshUI);
    }

    // Wrapper functions for remaining event handlers
    function handleDragStart(event, ability) {
        eventHandlers.handleDragStart(event, ability);
    }

    function handleDrop(event, index) {
        eventHandlers.handleDrop(event, index, stores, refreshUI, calculateTotalDamageNew, allAbils);
    }

	function handleDragStartBar(event, ability, startIndex) {
        eventHandlers.handleDragStartBar(event, ability, startIndex);
    }

    function allowDrop(event) {
        eventHandlers.allowDrop(event);
    }

	function handleDragEnter(event, index) {
		eventHandlers.handleDragEnter(event, index, stores, allAbils);
    }

    function handleDragLeave(event, index) {
        eventHandlers.handleDragLeave(event, index, stores);
    }

	function handleBarLeftClick(event, ability, index) {
		eventHandlers.handleBarLeftClick(event, ability, index, stores, refreshUI, calculateTotalDamageNew);
    }

    function handleBarRightClick(event, index, innerIdx = null) {
        eventHandlers.handleBarRightClick(event, index, innerIdx, stores, refreshUI, calculateTotalDamageNew);
    }



    function handleKeypress(event: KeyboardEvent) {
        eventHandlers.handleKeypress(event, stores);
    }

    function focusOnMount(node: HTMLElement) {
        requestAnimationFrame(() => node.focus());
    }

    // Helper functions
    function showStack(idx: number, arr) {
        if (idx == 0) {
            return true;
        }
        else {
            return !(arr[idx] == arr[idx-1]);
        }
    }

    /**
     * Checks if a buff is active at a given tick
     * @param key - The key of the buff to check
     * @param tick - The tick to check
     */
    function buffActive(key: string, tick: number) {
        return rotationStore.buffs[key]?.activeRows.includes(tick) ?? false;
    }

    // Resolve ability key, handling Tumeken's Asphyxiate swap etc.
    function resolveAbility(abilKey: string): string {
        const s = settingsStore.settings;
        const flat: Record<string, any> = {};
        for (const k of [SETTINGS.MAGIC_HELMET, SETTINGS.MAGIC_BODY, SETTINGS.MAGIC_LEGS, SETTINGS.MAGIC_BOOTS, SETTINGS.MAGIC_GLOVES]) {
            flat[k] = s[k]?.value;
        }
        return resolveTumekensAsphyxiate(abilKey, flat);
    }

    // Get effective duration for an ability (explicit duration, or inferred from hits keys for channels)
    function getAbilityDuration(abil: any): number {
        if (typeof abil.duration === 'number') return abil.duration;
        if (abil.abilityClassification === 'channel' && abil.hits) {
            return Math.max(...Object.keys(abil.hits).map(Number));
        }
        return 3;
    }

    // Derive invalid ability placements: GCD violations and cooldown violations
    // Maps tick index → reason string
    let invalidTicks: Record<number, string> = $derived.by(() => {
        const map: Record<number, string> = {};
        const bar = rotationStore.abilityBar;
        let nextGcdTick = 0; // earliest tick the next ability can be placed
        const cooldownExpiry: Record<string, number> = {}; // abilKey → tick when off cooldown

        for (let i = 0; i < bar.length; i++) {
            const abilKey = bar[i];
            if (!abilKey) continue;
            // Use resolved ability from tickMetadata if available (accounts for runtime swaps)
            const meta = rotationStore.tickMetadata?.[i];
            const resolved = meta?.resolvedAbility ?? resolveAbility(abilKey);
            const abil = abils[resolved];
            if (!abil) continue;

            // Check GCD violation
            if (i < nextGcdTick) {
                map[i] = 'GCD active';
            }

            // Check cooldown violation (use original key for cooldown tracking)
            if (cooldownExpiry[abilKey] && i < cooldownExpiry[abilKey]) {
                const existing = map[i];
                map[i] = existing ? `${existing} + On cooldown` : 'On cooldown';
            }

            // Update GCD: minimum 3 ticks, or ability duration if channelled
            const duration = meta?.duration ?? getAbilityDuration(abil);
            const gcd = Math.max(3, duration);
            nextGcdTick = i + gcd;

            // Update cooldown expiry (use original key so same-ability checks work)
            const cdSeconds = abil.cooldown ?? 0;
            if (cdSeconds > 0) {
                const cdTicks = Math.round(cdSeconds / 0.6);
                cooldownExpiry[abilKey] = i + cdTicks;
            }
        }
        return map;
    });

    // Derive which ticks are channel continuation ticks (not the cast tick itself)
    // Maps tick index → { ability key, icon } of the ability being channelled
    let channelTicks: Record<number, { key: string; icon: string }> = $derived.by(() => {
        const map: Record<number, { key: string; icon: string }> = {};
        const bar = rotationStore.abilityBar;
        for (let i = 0; i < bar.length; i++) {
            const abilKey = bar[i];
            if (!abilKey) continue;
            // Use the resolved ability from tickMetadata if available (accounts for runtime swaps like Endless Assault)
            const meta = rotationStore.tickMetadata?.[i];
            const resolved = meta?.resolvedAbility ?? resolveAbility(abilKey);
            const abil = abils[resolved];
            if (!abil || abil.abilityClassification !== 'channel') continue;
            const duration = meta?.duration ?? getAbilityDuration(abil);
            // Mark ticks after the cast tick as channel ticks (up to duration or next ability)
            for (let t = i + 1; t < i + duration && t < bar.length; t++) {
                if (bar[t] != null) break; // Channel cancelled by next ability
                map[t] = { key: resolved, icon: abil.icon ?? '' };
            }
        }
        return map;
    });

    // Set of ticks where damage hitsplats land (from distributionStats)
    let damageTicks: Set<number> = $derived.by(() => {
        const s = new Set<number>();
        if (!rotationStore.distributionStats) return s;
        for (const stat of rotationStore.distributionStats) {
            if (stat.source) continue; // skip familiar/poison/etc — only ability damage
            s.add(stat.tick);
        }
        return s;
    });
</script>

<style>
	.rotation-title-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.rotation-header {
		margin: 0;
	}

	.reset-btn {
		padding: 2px 10px;
		font-size: 0.7rem;
		font-weight: 500;
		color: #999;
		background: none;
		border: 1px solid #555;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.reset-btn:hover {
		color: #ff6b6b;
		border-color: #ff6b6b;
		background: rgba(255, 0, 0, 0.08);
	}

	.suggestions-floating {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 58.333%;
		z-index: 50;
		pointer-events: auto;
		display: flex;
		justify-content: center;
	}
	.suggestions-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		background: rgba(23, 29, 33, 0.97);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-bottom: none;
		border-radius: 12px 12px 0 0;
		backdrop-filter: blur(10px);
		box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
	}
	.suggestions-label {
		font-size: 0.85rem;
		color: #888;
		margin-right: 4px;
		white-space: nowrap;
	}
	.suggestions-tab {
		padding: 5px 18px;
		font-size: 0.8rem;
		color: #888;
		background: rgba(23, 29, 33, 0.97);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-bottom: none;
		border-radius: 10px 10px 0 0;
		cursor: pointer;
		backdrop-filter: blur(10px);
	}
	.suggestions-tab:hover {
		color: #ccc;
	}
	.suggestions-collapse {
		padding: 3px 8px;
		font-size: 0.7rem;
		color: #666;
		background: none;
		border: none;
		cursor: pointer;
		margin-left: 6px;
	}
	.suggestions-collapse:hover {
		color: #ccc;
	}
	.suggestion-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 4px;
		border-radius: 5px;
		cursor: pointer;
		background: none;
		border: 1px solid transparent;
		transition: all 0.15s;
	}
	.suggestion-btn:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.25);
	}
	.suggestion-icon {
		width: 34px;
		height: 34px;
		border-radius: 4px;
	}
	.suggestion-dmg {
		font-size: 0.65rem;
		color: #4CAF50;
		font-weight: bold;
		line-height: 1;
	}


	.damage-summary {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}

	.dmg-total {
		font-size: 0.95rem;
		font-weight: 700;
		color: #fff;
	}

	.dmg-breakdown {
		font-size: 0.75rem;
		color: #888;
	}

	.dmg-val {
		font-weight: 600;
		color: #ccc;
	}

	.dmg-val.poison {
		color: var(--color-poison);
	}

	.dmg-val.familiar {
		color: var(--color-familiar);
	}

	.dmg-val.dreadnip {
		color: var(--color-dreadnip);
	}

	.dmg-val.conjure {
		color: var(--color-conjure);
	}

	.responsive-container {
		margin-left: 0% !important;
		margin-right: 0% !important;
		padding-left: 1.5% !important;
		padding-right: 1.5% !important;
		max-width: 100% !important;
	}

	.extra-action-section {
		border: 2px solid #ffff00df;
		margin-top: 5%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.regular-cursor {
		cursor: default; /* Cursor for regular tool */
	}

	.regular-cursor .ability-slot {
		cursor: pointer !important; /* Only show pointer in regular mode */
	}

	.regular-cursor .ability-slot:hover {
		cursor: pointer !important;
	}

	.stall-cursor {
		cursor: wait; /* Default stall cursor */
	}

	.stall-cursor.stalling {
		cursor: wait; /* Will be overridden if there's an ability being stalled */
	}

	.null-cursor {
		cursor: url('/cursor_icons/abort-icon.svg') 16 16, not-allowed;
	}

	.insert-cursor {
		cursor: cell;
	}

	.ability-bar {
		display: grid;
		/* grid-template-columns and grid-template-rows set dynamically via inline style */
		column-gap: 0;
		row-gap: 0;
		position: relative;
		padding-top: 25px;
	}

	.ability-slot {
		position: relative;
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		border: 1px solid #878787;
		box-sizing: border-box;
		cursor: inherit !important;
		transition: all 0.1s ease;
	}

	.ability-slot:hover {
		cursor: inherit !important;
		border: 1px solid #c5c5c5;
		box-shadow: 0 0 3px rgba(255, 255, 255, 0.572);
		z-index: 3;
	}

	.ability-slot.invalid-placement {
		border: 1px solid #ef4444;
		box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.4);
	}

	.ability-slot.invalid-placement > img:first-of-type {
		opacity: 0.5;
	}

	.ability-slot .channel-ghost {
		width: 100%;
		height: 100%;
		opacity: 0.3;
		filter: grayscale(50%);
		pointer-events: none;
	}

	.ability-slot.nulled::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: repeating-linear-gradient(
			45deg,
			rgba(255, 0, 0, 0.55),
			rgba(255, 0, 0, 0.55) 2px,
			transparent 3px,
			transparent 6px
		);
		pointer-events: none;
		z-index: 1;
	}

	.ability-slot.selected-tick {
		border: 2px solid #ffd700;
		box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
		z-index: 3;
	}

	.ability-slot.has-extra-actions::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 2px;
		right: 2px;
		height: 2px;
		background-color: #b8a04a;
		z-index: 2;
	}

	.ability-slot.has-damage {
		border-top: 2px solid #a65a5a;
	}

	.cell-number {
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px; 
		color: #bababa;
	}

	.stacks-text {
		position: absolute;
		top: +38px;
		left: auto;
		transform: translateX(+50%);
		font-size: var(--stack-font-size);
	}

	.stacks-icon {
		position: absolute;
		width: 12px;
		height: 12px;
		transform: translateX(-70%) translateY(32px);
	}

	.boss-attack-cell {
		position: absolute;
		left: 0;
		width: 100%;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		pointer-events: auto;
		z-index: 2;
		box-sizing: border-box;
	}

	.boss-attack-label {
		font-size: 0.55rem;
		color: white;
		font-weight: bold;
		padding-left: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: clip;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.phase-marker {
		position: absolute;
		top: -2px;
		right: -2px;
		bottom: -2px;
		width: 3px;
		background: #ef4444;
		z-index: 4;
		pointer-events: none;
	}

	.phase-label {
		position: absolute;
		top: -14px;
		right: -2px;
		font-size: 0.5rem;
		color: #ef4444;
		font-weight: bold;
		white-space: nowrap;
		pointer-events: none;
	}

	.pattern-start-marker {
		position: absolute;
		top: -2px;
		left: -2px;
		bottom: -2px;
		width: 3px;
		background: #3b82f6;
		z-index: 4;
		pointer-events: none;
	}

	.pattern-start-label {
		position: absolute;
		top: -14px;
		left: -2px;
		font-size: 0.5rem;
		color: #3b82f6;
		font-weight: bold;
		white-space: nowrap;
		pointer-events: none;
	}

	.phase-pause {
		background: repeating-linear-gradient(
			45deg,
			transparent,
			transparent 3px,
			rgba(239, 68, 68, 0.15) 3px,
			rgba(239, 68, 68, 0.15) 6px
		) !important;
	}

	.highlight-red {
		border: 1px solid rgba(255, 51, 0, 0.789);
	}

	.highlight-green {
		border: 1px solid rgba(0, 231, 54, 0.789);
	}

	.stalled-ability {
		position: absolute;
		top: 0;
		right: 0;
		width: 55%;
		height: 55%;
		opacity: 0.8;
		border: 1px solid #ffff72;
		box-sizing: border-box;
		z-index: 2;
	}

	.cooldown-ready-container {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
		pointer-events: none;
	}

	.cooldown-ready-container.has-overflow {
		pointer-events: auto;
		cursor: pointer;
	}

	.cooldown-ready-icon {
		position: absolute;
		bottom: 0px;
		left: 0px;
		width: 55%;
		height: 55%;
		border: 1px solid #00e736;
		opacity: 0.8;
		z-index: 2;
		pointer-events: none;
		transform-origin: bottom left;
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	/* Hide extra icons by default, collapsed to first icon position */
	.cooldown-ready-container .cooldown-ready-icon:not(:first-of-type) {
		opacity: 0;
		transform: translateY(100%) scale(0.6);
	}

	/* On hover, reveal all icons at full size */
	.cooldown-ready-container:hover .cooldown-ready-icon {
		transform: scale(1.15);
	}

	.cooldown-ready-container:hover .cooldown-ready-icon:not(:first-of-type) {
		opacity: 0.9;
	}

	.cooldown-overflow {
		position: absolute;
		left: 0;
		font-size: 0.5rem;
		color: #00e736;
		background: rgba(0, 0, 0, 0.6);
		padding: 0 2px;
		border-radius: 2px;
		z-index: 3;
		pointer-events: none;
		line-height: 1;
		transition: opacity 0.15s ease;
	}

	/* Hide the +N label on hover since all icons are shown */
	.cooldown-ready-container:hover .cooldown-overflow {
		opacity: 0;
	}

	/* Extra action preview icons (above slot, shown on hover) */
	.extra-action-preview {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1px;
		z-index: 4;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s ease;
		padding-bottom: 2px;
	}

	.ability-slot:hover .extra-action-preview {
		opacity: 1;
	}

	.extra-action-icon-box {
		width: 27px;
		height: 27px;
		min-width: 27px;
		min-height: 27px;
		border: 1px solid #b8a04a;
		background: rgba(23, 29, 33, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		pointer-events: none;
	}

	.extra-action-icon-box img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.708));
	}

	.stall-cursor.stalling {
		cursor: wait; /* Will be overridden if there's an ability being stalled */
	}

	.null-cursor {
		cursor: url('/cursor_icons/abort-icon.svg') 16 16, not-allowed; 
	}

	.settings-panel {
		transition: all 0.3s ease;
		min-width: 0;
	}

	.settings-panel.collapsed {
		flex-basis: 0;
		width: 0;
		padding: 0;
		margin: 0;
		visibility: hidden;
		opacity: 0;
	}

	.settings-content {
		position: sticky;
		top: 1rem;
		max-height: calc(100vh - 2rem);
		overflow-y: auto;
	}

	.card-rotation {
		height: fit-content;
	}

	:global(.credits) {
		margin-top: 3rem;
		padding: 1.5rem 2rem;
		border-top: 1px solid #333;
		color: var(--color-text-secondary);
		font-size: 0.8rem;
	}

	:global(.credits h4) {
		margin: 0 0 0.5rem 0;
		color: var(--color-text-secondary);
		font-size: 0.85rem;
		font-weight: 600;
	}

	:global(.credits ul) {
		margin: 0;
		padding-left: 1.2rem;
		list-style: disc;
	}

	:global(.credits li) {
		margin-bottom: 0.25rem;
	}

	:global(.credits a) {
		color: var(--color-info);
		text-decoration: none;
	}

	:global(.credits a:hover) {
		text-decoration: underline;
	}
</style>

<Navbar />
<Header img="/range_background.png" text="Rotation Calculator Beta" icon="/style_icons/rota_icon.svg" />

<div class="space-y-14 mt-10 z-20">
	<div class="responsive-container {uiStore.activeTool.toLowerCase()}-cursor {uiStore.stallingAbility ? 'stalling' : ''}" 
		tabindex="-1" 
		role="button" 
		onkeydown={handleKeypress}
		style="--stack-font-size: {stackFontSize}px; {uiStore.stallingAbility ? `cursor: url('${allAbils[uiStore.stallingAbility].icon}') 15 15, wait;` : ''}">
		<section class="grid grid-cols-12 gap-6 auto-rows-min">
			<div class="col-span-{uiStore.settingsPanelCollapsed ? '12' : '8'} relative">
				<div class="card card-rotation">
					{#if uiStore.settingsPanelCollapsed}
						<button 
							class="expand-button"
							onclick={() => uiActions.toggleSettingsPanel()}
						>
							Settings ←
						</button>
					{/if}
					<div class="rotation-title-row">
						<h1 class="rotation-header">{bossName}{#if killTime} <em>{killTime}</em>{/if}</h1>
						<button class="reset-btn" onclick={clearRotation} title="Reset rotation">Reset</button>
						<div class="damage-summary">
								<span class="dmg-total">{(rotationStore.totalDamage + rotationStore.poisonDamage + rotationStore.familiarDamage + rotationStore.dreadnipDamage + rotationStore.conjureDamage).toLocaleString()}</span>
								{#if rotationStore.totalDamage > 0 || rotationStore.poisonDamage > 0 || rotationStore.familiarDamage > 0 || rotationStore.dreadnipDamage > 0 || rotationStore.conjureDamage > 0}
									<span class="dmg-breakdown">(<span class="dmg-val">{rotationStore.totalDamage.toLocaleString()}</span>{#if rotationStore.poisonDamage > 0} + <span class="dmg-val poison">{rotationStore.poisonDamage.toLocaleString()}</span>{/if}{#if rotationStore.familiarDamage > 0} + <span class="dmg-val familiar">{rotationStore.familiarDamage.toLocaleString()}</span>{/if}{#if rotationStore.dreadnipDamage > 0} + <span class="dmg-val dreadnip">{rotationStore.dreadnipDamage.toLocaleString()}</span>{/if}{#if rotationStore.conjureDamage > 0} + <span class="dmg-val conjure">{rotationStore.conjureDamage.toLocaleString()}</span>{/if})</span>
								{/if}
							</div>
					</div>

					<GradientSeparator marginTop="0.0rem" marginBottom="1.5rem" />

					<!-- Damage Distribution Chart -->
					<DamageDistributionChart
						distributionStats={rotationStore.distributionStats}
						totalDamage={rotationStore.totalDamage}
						poisonDamage={rotationStore.poisonDamage}
						familiarDamage={rotationStore.familiarDamage}
						dreadnipDamage={rotationStore.dreadnipDamage}
						conjureDamage={rotationStore.conjureDamage}
						poisonPerTick={rotationStore.poisonPerTick}
						familiarPerTick={rotationStore.familiarPerTick}
						familiarVariancePerTick={rotationStore.familiarVariancePerTick}
						dreadnipPerTick={rotationStore.dreadnipPerTick}
						dreadnipVariancePerTick={rotationStore.dreadnipVariancePerTick}
						conjurePerTick={rotationStore.conjurePerTick}
						conjureVariancePerTick={rotationStore.conjureVariancePerTick}
						{allAbils}
						familiarKey={settingsStore.settings[SETTINGS.FAMILIAR]?.value ?? 'none'}
						phaseTransitions={rotationStore.phaseTransitions}
						barSize={uiStore.bar.size}
						patternStartTick={settingsStore.settings[SETTINGS.BOSS_PATTERN_START]?.value ?? -1}
						hasBossPreset={settingsStore.settings[SETTINGS.BOSS_PRESET]?.value && settingsStore.settings[SETTINGS.BOSS_PRESET]?.value !== 'none'}
					/>
                    <RotationConfigManager
                        {refreshUI}
                        onOpenKeybinds={() => showKeybindModal = true}
                        onShowKeypresses={() => showKeypressModal = true}
                    />
					
                    <ul class="flex flex-wrap flex-col md:flex-row text-sm font-medium text-center items-center">
                        {#each tabs as tab}
                            <TabButton
                                id={tab.id}
                                label={tab.label}
                                badge={tab.badge || ''}
                                isActive={uiStore.activeTab === tab.id}
                                onClick={() => uiActions.setActiveTab(tab.id)}
                            />
                        {/each}
                        <li class="ml-auto mr-2">
                            <PillToggle
                                value={uiStore.abilityFilter}
                                onchange={() => uiActions.cycleAbilityFilter()}
                            />
                        </li>
                    </ul>
					<br>
                    {#each tabs as tab}
                        {#if uiStore.activeTab === tab.id}
                            <AbilityChoice
                                abilities={tab.abilities}
                                handleAbilityClick={handleAbilityClick}
									handleDragStart={handleDragStart}
                                style={tab.id}
                                filter={uiStore.abilityFilter}
											/>
										{/if}
								{/each}
	                    <div
						bind:this={abilityBarElement}
						style="grid-template-rows: {getGridTemplateRows()}; grid-template-columns: repeat({columnsPerRow}, {CELL_SIZE}px);"
						class="ability-bar"
					>
                        {#each rotationStore.abilityBar as ability, index (index)}
                            <button
                                class="ability-slot"
                                class:highlight-red={uiStore.dragDrop.hoveredSlot === index && !uiStore.dragDrop.validSlot}
                                class:highlight-green={uiStore.dragDrop.hoveredSlot === index && uiStore.dragDrop.validSlot}
                                class:nulled={rotationStore.nulledTicks[index]}
                                class:selected-tick={uiStore.extraActions.show && uiStore.extraActions.tick === index}
                                class:has-extra-actions={rotationStore.extraActionBar[index]?.some(action => action !== null)}
                                class:has-damage={damageTicks.has(index)}
                                class:invalid-placement={invalidTicks[index] && ability}
                                class:phase-pause={pauseTickSet.has(index)}
                                tabindex="0"
                                aria-label="Ability slot"
                                onclick={(e) => handleBarLeftClick(e, ability, index)}
                                oncontextmenu={(e) => handleBarRightClick(e, index)}
                                ondrop={(e) => handleDrop(e, index)}
                                ondragover={(e) => allowDrop(e)}
                                ondragenter={(e) => handleDragEnter(e, index)}
                                ondragleave={(e) => handleDragLeave(e, index)}
                            >
                                <span class="cell-number">{index}</span>
                                {#if ability && allAbils[ability]}
                                    <img src={allAbils[ability].icon}
                                        alt={allAbils[ability].title}
                                        style="width: 100%; height: 100%;"
                                        title="{allAbils[ability].title}{invalidTicks[index] ? ` (${invalidTicks[index]})` : ''}"
                                        draggable="true"
                                        ondragstart={(e) => handleDragStartBar(e, ability, index)}
                                    />
                                {:else if ability}
                                    <span class="cell-number" title="Unknown: {ability}" style="font-size: 0.5rem; color: #f66;">?</span>
                                {:else if channelTicks[index]}
                                    <img src={channelTicks[index].icon}
                                        alt="Channelling"
                                        class="channel-ghost"
                                        title="Channelling: {allAbils[channelTicks[index].key]?.title}"
                                    />
                                {/if}
                                {#if rotationStore.stalledAbilities[index] && allAbils[rotationStore.stalledAbilities[index]]}
                                    <img
                                        class="stalled-ability"
                                        src={allAbils[rotationStore.stalledAbilities[index]].icon}
                                        alt="Stalled ability"
                                        title="Stalled: {allAbils[rotationStore.stalledAbilities[index]].title}"
                                    />
                                {/if}
                                {#if rotationStore.cooldownReady[index]}
                                    {@const cdList = rotationStore.cooldownReady[index]}
                                    <div class="cooldown-ready-container" class:has-overflow={cdList.length > 1}>
                                        {#each cdList as readyAbilKey, cdIdx}
                                            {@const abilInfo = allExtraActions[readyAbilKey] || allAbils[readyAbilKey]}
                                            {#if abilInfo?.icon}
                                                <img
                                                    class="cooldown-ready-icon"
                                                    src={abilInfo.icon}
                                                    alt="Off cooldown"
                                                    title="{abilInfo.title} ready"
                                                    style="bottom: {2 + cdIdx * 22}px;"
                                                />
                                            {/if}
                                        {/each}
                                        {#if cdList.length > 1}
                                            <span class="cooldown-overflow" style="bottom: {2 + 1 * 16}px;">+{cdList.length - 1}</span>
                                        {/if}
                                    </div>
                                {/if}
                                {#if rotationStore.extraActionBar[index]?.some(a => a !== null)}
                                    {@const extraActions = rotationStore.extraActionBar[index].filter(a => a !== null)}
                                    <div class="extra-action-preview">
                                        {#each extraActions as action}
                                            {@const icon = action.icon || allExtraActions[action]?.icon || ''}
                                            {@const title = action.title || allExtraActions[action]?.title || ''}
                                            {#if icon}
                                                <div class="extra-action-icon-box" title={title}>
                                                    <img src={icon} alt={title} />
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                {/if}
                                {#if phaseTickMap.has(index)}
                                    {@const marker = phaseTickMap.get(index)}
                                    <div class="phase-marker" title="{marker.label} @ tick {marker.tick} ({marker.hp.toLocaleString()} total dmg)">
                                        <span class="phase-label">{marker.label}</span>
                                    </div>
                                {/if}
                                {#if index === patternStartTick}
                                    <div class="pattern-start-marker" title="Start (tick {index})">
                                        <span class="pattern-start-label">Start</span>
                                    </div>
                                {/if}
                                {#each Object.keys(rotationStore.buffs) as key}
                                    {#if buffActive(key, index) && getBuffLocalIndex(key, index) >= 0}
                                        <div title="{rotationStore.buffs[key].title}"
                                            style="
                                            position: absolute;
                                            bottom: {-(buffLineHeight * 1.5) - (buffLineHeight * getBuffLocalIndex(key, index))}px;
                                            left: -1px;
                                            width: {buffLineWidth}px;
                                            height: {buffLineHeight}px;
                                            background-color: {rotationStore.buffs[key].colour};
                                            box-sizing: border-box; ">
                                        </div>
                                    {/if}
                                {/each}
                                {#each Object.keys(rotationStore.stacks) as key}
                                    {#if showStack(index, rotationStore.stacks[key].stackTicks) && getStackLocalIndex(key, index) >= 0}
                                        {@const localStackIdx = getStackLocalIndex(key, index)}
                                        {@const stackTop = getStackTopOffset(index, localStackIdx)}
                                        <span
                                            title="{rotationStore.stacks[key].title}"
                                            style="
                                                transform: translateX(0px);
                                                top: {stackTop}px;
                                                left: {stackFontSize+stackPadding*2}px;
                                                color: {rotationStore.stacks[key].colour};
                                                "
                                            class="stacks-text"
                                        >
                                            {+rotationStore.stacks[key].stackTicks[index].toFixed(0)}
                                        </span>
                                        <img src={rotationStore.stacks[key].image}
                                            style=
                                                "transform:translateX({2-(30-stackFontSize)/2}px);
                                                top: {stackTop + 3}px;
                                                height: {stackFontSize}px;
                                                width: {stackFontSize}px;
                                                "
                                            class="stacks-icon"
                                            title={rotationStore.stacks[key].title}
                                            alt={rotationStore.stacks[key].title}
                                        />
                                    {/if}
                                {/each}
                                {#if hasAttackPattern}
                                    {@const patternEntry = getBossAttackAtTick(index)}
                                    {#if patternEntry?.isStart}
                                        {@const patternTop = getPatternTopOffset(index)}
                                        {@const color = getAttackColor(patternEntry.attack)}
                                        <div
                                            class="boss-attack-cell"
                                            style="
                                                top: {patternTop}px;
                                                background-color: {color};
                                                opacity: {patternEntry.attack.type === 'auto' ? 0.6 : 0.85};
                                            "
                                            title="{patternEntry.attack.name}{patternEntry.attack.variants ? ` (or ${patternEntry.attack.variants[1]})` : ''}"
                                        >
                                            <span class="boss-attack-label">{patternEntry.attack.label ?? patternEntry.attack.name.slice(0, 4)}</span>
                                        </div>
                                    {/if}
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="settings-panel col-span-{uiStore.settingsPanelCollapsed ? '0' : '4'} {uiStore.settingsPanelCollapsed ? 'collapsed' : ''}"
				style={uiStore.settingsPanelCollapsed ? 'visibility: hidden; height: 0; margin: 0;' : ''}>
                <div class="settings-content">
                    {#if uiStore.extraActions.show}
                        <ExtraActionsPanel
                            uiState={uiStore}
                            gameState={rotationStore}
                            {allAbils}
                            {handleAbilityClickExtra}
                            {handleDragStart}
                            {handleBarRightClick}
                            {handleDragStartBar}
                            extraActions={uiStore.extraActions}
                            closeExtraActions={() => uiActions.hideExtraActions()}
                            setExtraActionsTab={(tab) => uiActions.setExtraActionsTab(tab)}
                            onRemoveAbility={() => refreshUI()}
                            onToggleNull={() => refreshUI()}
                            onRefreshUI={() => refreshUI()}
                        />
                    {/if}
                    <div class:hidden={uiStore.extraActions.show}>
                        <RotationSettings updateDamages={calculateTotalDamageNew} stacks={rotationStore.stacks} uiState={uiStore} refreshUI={refreshUI} />
                    </div>
                </div>
            </div>
            <div class="col-span-12 mt-8">
                <div class="grid grid-cols-2 gap-6">
					<div class="card card-rotation col-span-2">
					<h2 class="card-title pb-5">User Guide</h2>

					<!-- Getting Started -->
					<div class="pb-4">
						<h3 class="text-sm font-bold text-[#C2BA9E] uppercase tracking-wide mb-2">Getting Started</h3>
						<p class="text-sm leading-relaxed">
							Configure your gear, levels, and perks in the <strong>Settings</strong> panel on the right &mdash; these define your ability damage, hit chance, and weapon effects.
							Select a combat style tab to see available abilities, then <strong>left click</strong> to add them to the bar, <strong>drag</strong> to place on specific ticks, or <strong>right click</strong> a slot to remove it.
							<br><br>
							As you build your rotation, the calculator tracks <strong>buffs</strong> (coloured bars below the timeline), <strong>stacks</strong> (icons with values), <strong>cooldowns</strong> (greyed-out with a green border when ready), and <strong>adrenaline</strong>.
							The <strong>damage plot</strong> below the bar shows cumulative damage over time, broken down by source.
						</p>
					</div>

					<!-- Advanced Features -->
					<div class="pb-4">
						<h3 class="text-sm font-bold text-[#C2BA9E] uppercase tracking-wide mb-2">Advanced Features</h3>

						<p class="text-sm leading-relaxed mt-2">
							<strong>Tool Modes</strong> &mdash; switch between 4 modes via the toolbar or keyboard:
							<strong>Regular</strong> (<strong>R</strong>) is the default for adding, removing, and dragging abilities.
							<strong>Stall</strong> (<strong>S</strong>) lets you select an ability to stall, then click a tick to place it (click again to remove; channelled abilities cannot be stalled).
							<strong>Null</strong> (<strong>N</strong>) marks ticks as nulled &mdash; 0 damage but buffs and stacks still apply (e.g. boss phase transitions).
							<strong>Insert</strong> (<strong>I</strong>) left-click a tick to insert empty ticks (shifting everything right), right-click to remove ticks (shifting everything left).
						</p>

						<p class="text-sm leading-relaxed mt-2">
							<strong>Extra Actions</strong> &mdash; click any tick on the bar to open the extra actions panel. Add off-GCD abilities (Ingenuity, Limitless, prayers, etc.), consumables (adrenaline potions, vulnerability bombs), and gear swaps (weapons, armour, EoFs) to any tick. Each tick has up to 12 extra action slots.
						</p>

						<p class="text-sm leading-relaxed mt-2">
							<strong>Familiars</strong> &mdash; select a combat familiar in settings (Ripper Demon, Kal'gerion Demon, Steel Titan). The familiar attacks automatically based on its attack rate. If scrolls are enabled, it uses special attacks when it has enough spec points. Spec points regenerate over time and are boosted by Summoning Renewal, Prism of Restoration, Spirit Cape, and Spirit Weed Incense. Familiars stop attacking after your last ability.
						</p>

						<p class="text-sm leading-relaxed mt-2">
							<strong>Poison</strong> &mdash; enable weapon poison in settings. Poison damage scales with Bik arrow stacks and is tracked separately in the damage breakdown and plot.
						</p>

						<p class="text-sm leading-relaxed mt-2">
							<strong>Keybinds</strong> &mdash; open the keybind config to assign keys to abilities, gear, and consumables. Use the keypress output modal to view your rotation as a key sequence or a visual keyboard layout.
						</p>

						<p class="text-sm leading-relaxed mt-2">
							<strong>Save / Load</strong> &mdash; save your rotation and settings to a named slot. Rotations are stored in your browser's local storage.
						</p>
					</div>

					<div class="pb-3">
						<p class="text-sm">
							Please report any bugs or errors in the RSA discord. For a more comprehensive guide, check out our
							<a href="/rotation_builder_guide" class="text-blue-400 hover:underline hover:text-blue-300">
							full guide</a>.
						</p>
					</div>
					</div>
				</div>
            </div>
		</section>
	</div>
</div>

<!-- Credits -->
<footer class="credits">
	<div class="credits-content">
		<h4>Credits & Resources</h4>
		<ul>
			<li>Created by <i>Lo Sugar</i> and <i>Akritia</i>.</li>
			<li>Game data and ability icons from <a href="https://runescape.wiki" target="_blank" rel="noopener">The RuneScape Wiki</a>, licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank" rel="noopener">CC BY-NC-SA 3.0</a></li>
			<li>Familiar calculations courtesy of the PVME/RS MATH Familiar Damage sheet </li>
			<li>RuneScape is a registered trademark of <a href="https://www.jagex.com" target="_blank" rel="noopener">Jagex Ltd</a></li>
		</ul>
	</div>
</footer>

<!-- Save and Load dialogs are now handled by Popup components -->

<!-- Notification Popup -->
<Popup 
    bind:show={notificationStore.notification.show}
    title={notificationStore.notification.title}
    message={notificationStore.notification.message}
    type={notificationStore.notification.type}
/>

<!-- Confirmation Dialog -->
<Popup 
    bind:show={notificationStore.confirmationDialog.show}
    title={notificationStore.confirmationDialog.title}
    message={notificationStore.confirmationDialog.message}
    type="warning"
    confirmText="Confirm"
    cancelText="Cancel"
    on:confirm={() => {
        if (notificationStore.confirmationDialog.onConfirm) notificationStore.confirmationDialog.onConfirm();
        notifActions.hideConfirmation();
    }}
    on:cancel={() => {
        if (notificationStore.confirmationDialog.onCancel) notificationStore.confirmationDialog.onCancel();
        notifActions.hideConfirmation();
    }}
/>

<!-- Input Prompt Dialog -->
<Popup 
    bind:show={notificationStore.inputPrompt.show}
    title={notificationStore.inputPrompt.title}
    message={notificationStore.inputPrompt.message}
    type="info"
    confirmText="Submit"
    cancelText="Cancel"
    on:confirm={() => {
        if (notificationStore.inputPrompt.onSubmit && notificationStore.inputPrompt.value.trim()) {
            notificationStore.inputPrompt.onSubmit(notificationStore.inputPrompt.value.trim());
        }
        notifActions.hideInputPrompt();
    }}
    on:cancel={() => {
        if (notificationStore.inputPrompt.onCancel) notificationStore.inputPrompt.onCancel();
        notifActions.hideInputPrompt();
    }}
>
    <input
        type="text"
        bind:value={notificationStore.inputPrompt.value}
        placeholder={notificationStore.inputPrompt.placeholder}
        onkeydown={(e) => e.key === 'Enter' && notificationStore.inputPrompt.value.trim() && notificationStore.inputPrompt.onSubmit && notificationStore.inputPrompt.onSubmit(notificationStore.inputPrompt.value.trim())}
        use:focusOnMount
        style="width: 100%; padding: 0.5rem; border: 1px solid #555; border-radius: 4px; background: #1a1a1a; color: #fff; font-size: 0.9rem;"
    />
</Popup>

<KeybindConfigModal
    bind:show={showKeybindModal}
/>

<KeypressOutputModal
    bind:show={showKeypressModal}
    phaseBreaks={phaseMarkers.map(m => ({ tick: (m.pauseEnd ?? m.tick) + 1, label: m.label }))}
/>

<!-- Floating Ability Suggestions Bar -->
{#if suggestions.length > 0}
	<div class="suggestions-floating" class:collapsed={suggestionsCollapsed}>
		{#if suggestionsCollapsed}
			<button class="suggestions-tab" onclick={() => suggestionsCollapsed = false}>
				▲ Suggestions
			</button>
		{:else}
			<div class="suggestions-bar">
				<span class="suggestions-label">Next:</span>
				{#each suggestions.slice(0, 10) as suggestion}
					<button
						class="suggestion-btn"
						title="{suggestion.title}: +{suggestion.damage.toLocaleString()} damage"
						onclick={(e) => handleAbilityClick(e, suggestion.key)}
					>
						<img src={suggestion.icon} alt={suggestion.title} class="suggestion-icon" />
						<span class="suggestion-dmg">+{suggestion.damage >= 1000 ? Math.round(suggestion.damage / 1000) + 'K' : suggestion.damage}</span>
					</button>
				{/each}
				<button class="suggestions-collapse" onclick={() => suggestionsCollapsed = true} title="Collapse">▼</button>
			</div>
		{/if}
	</div>
{/if}