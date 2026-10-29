<script lang="ts">
    import { LatestWorker } from '$lib/utils/latestWorker';
    import { snapshotEditorCalculation } from '$lib/calc/rotation_builder/editorCalculation';
    import { timelineRows } from '$lib/calc/rotation_builder/timelineRows';
    import { fightTime } from '$lib/calc/rotation_builder/fightTime';
    import { showTimelineStack } from '$lib/calc/rotation_builder/stackDisplay';
    import { damageBetween } from '$lib/calc/rotation_builder/phaseDamage';
    import ShiftRotation from '$components/RotationBuilder/ShiftRotation.svelte';
    import { tickConditionLabel } from '$lib/calc/rotation_builder/tickEvents';
	import { onMount, onDestroy } from 'svelte';
	import Navbar from '$components/Layout/Navbar.svelte';
    import RotationDamageSummary from '$components/RotationBuilder/RotationDamageSummary.svelte';
    import { ToolMode } from '$lib/calc/rotation_builder/ui_material/toolModes';
    import { abils } from '$lib/data/abilities';
    import { paletteAbilities } from '$lib/data/abilityPalette';
	import { settingsConfig, SETTINGS } from '$lib/calc/settings_rb';
    import RotationSettings from '../../components/Settings/RotationSettings.svelte';
    import AbilityChoice from '../../components/RotationBuilder/AbilityChoice.svelte';
        import ExtraActionsPanel from '../../components/RotationBuilder/ExtraActionsPanel.svelte';
    import DamageDistributionChart from '../../components/RotationBuilder/DamageDistributionChart.svelte';
	import TabButton from '../../components/UI/TabButton.svelte';
    import GradientSeparator from '../../components/UI/GradientSeparator.svelte';

    import Popup from '../../components/UI/Popup.svelte';
    import RotationConfigManager from '../../components/RotationBuilder/RotationConfigManager.svelte';
    import KeybindConfigModal from '../../components/RotationBuilder/KeybindConfigModal.svelte';
    import KeypressOutputModal from '../../components/RotationBuilder/KeypressOutputModal.svelte';
    import { allExtraActions } from '$lib/special/abilities';
    import * as eventHandlers from '$lib/utils/rotationEventHandlers';
    import { uiStore, uiActions } from '$lib/stores/uiStore.svelte.js';
    import { notificationStore, notifActions } from '$lib/stores/notificationStore.svelte.js';
    import { rotationStore, rotationActions } from '$lib/stores/rotationStore.svelte.js';
    import { settingsStore } from '$lib/stores/settingsStore.svelte.js';
    import { getBossPresetWithEnrage, type BossAttack, type BossAttackPattern } from '$lib/data/bosses/boss_presets';
    import { suggestNextAbility, resolveTumekensAsphyxiate, type AbilitySuggestion } from '$lib/calc/rotation_builder/rotation-damage-calculator';

    const filterByStyle = (style) => Object.fromEntries(
        Object.entries(paletteAbilities).filter(([, a]) => a.title && !a.parent && (a.mainStyle === style || a.shared))
    );
    const rangedAbils = filterByStyle('ranged');
    const magicAbils = filterByStyle('magic');
    const meleeAbils = filterByStyle('melee');
    const necroAbils = filterByStyle('necromancy');
	const defAbils = filterByStyle('defence')
	// let defAbils = {...def_abilities};
    let allAbils = {...abils};

    function validRelease(tick) {
        let pending = null;
        for (let i = 0; i < tick; i++) {
            if (rotationStore.stalledAbilities[i]) pending = rotationStore.stalledAbilities[i];
            if (rotationStore.releasedAbilities[i] || rotationStore.abilityBar[i]) pending = null;
        }
        return pending === rotationStore.releasedAbilities[tick];
    }

    function addFromPalette(event, key) {
        const ability = paletteAbilities[key];
        if (ability.offGcd) {
            const tick = uiStore.extraActions.show ? uiStore.extraActions.tick : Math.min(299, uiStore.bar.index);
            uiActions.showExtraActions(tick, rotationStore.abilityBar[tick]);
            uiStore.settingsPanelCollapsed = false;
            if (uiStore.extraActions.barIndex >= 12) {
                notifActions.showNotification('Tick is full', 'Remove an extra action at this tick before adding another.', 'warning');
                return;
            }
            rotationStore.extraActionBar[tick] ??= Array(12).fill(null);
            rotationStore.extraActionBar[tick][uiStore.extraActions.barIndex] = { type: 'ability', value: key, title: ability.title, icon: ability.icon };
            refreshUI();
            return;
        }
        handleAbilityClick(event, ability.actionKey ?? key);
    }
    function dragFromPalette(event, key) {
        const ability = paletteAbilities[key];
        if (uiStore.activeTool === ToolMode.Stall && !ability.offGcd) {
            if (!eventHandlers.canStall(key)) { event.preventDefault(); return; }
            event.dataTransfer.setData('text/plain', JSON.stringify({kind:'stall', ability:key}));
            return;
        }
        handleDragStart(event, ability.actionKey ?? key);
    }

    let abilitySearch = $state('');
    let expandedTicks = $state(60);
    let showFullTimeline = $state(false);
    let showFightTime = $state(false);
    const modes = [
        { value: ToolMode.Regular, label: 'Edit', key: 'E', hint: 'Click an ability to append it. Drag to place or move it. Click a tick to inspect; right-click to remove.' },
        { value: ToolMode.Release, label: 'Release', key: 'R', hint: 'Release appends the held ability at the next GCD tick. Drag its icon to move it; the next ability shares that tick.' },
        { value: ToolMode.Stall, label: 'Stall', key: 'S', hint: 'Click an ability to stall it at the next GCD, or drag it onto a tick. Stall spends or gains adrenaline without hits.' },
        { value: ToolMode.Null, label: 'Null', key: 'N', hint: 'Click ticks to toggle zero damage. Buffs and stacks still apply.' },
        { value: ToolMode.Insert, label: 'Insert ticks', key: 'I', hint: 'Click a tick to insert time before it. Right-click to remove time and shift the rotation left.' }
    ];
    let usedTicks = $derived.by(() => {
        let last = -1;
        for (let i = 0; i < rotationStore.abilityBar.length; i++) {
            if (rotationStore.tickEvents[i] || rotationStore.targetCounts[i] != null || rotationStore.abilityBar[i] || rotationStore.stalledAbilities[i] || rotationStore.releasedAbilities[i] || rotationStore.nulledTicks[i] || rotationStore.extraActionBar[i]?.some(Boolean)) last = i;
        }
        return last + 1;
    });
    let visibleTicks = $derived(showFullTimeline ? rotationStore.abilityBar.length : Math.min(rotationStore.abilityBar.length, Math.max(expandedTicks, Math.ceil((usedTicks + 12) / 30) * 30)));

    // Keybind modal state
    let showKeybindModal = $state(false);
    let showKeypressModal = $state(false);

	// UI Constants
	const stackFontSize = 10;
	const baseStackOffset = 42;
	const stackPadding = 5;
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
        gridRow: number;
        sectionTitle?: string;
        sectionEnd?: number;
		activeBuffs: string[];
		buffIndices: Record<string, number>;
		buffCount: number;  // Reserved lanes through the lowest active buff on this row
		height: number;
		activeStacks: string[];
		stackIndices: Record<string, number>;
	}>>([]);
	let resizeObserver: ResizeObserver | null = null;

	// Allocate buff lanes once for the rotation, independent of wrapping and viewport width.
	function recalculateRowLayout() {
		if (!abilityBarElement) return;

		const containerWidth = abilityBarElement.clientWidth;
		const newColumnsPerRow = Math.max(1, Math.floor(containerWidth / CELL_SIZE));
		columnsPerRow = newColumnsPerRow;

		const totalSlots = visibleTicks;

		const newRowData: typeof rowLayoutData = [];
        const buffLanes: Record<string, number> = {};
        // First activation determines the order; keep that order across every wrapped row.
        const orderedBuffs = Object.keys(rotationStore.buffs)
            .filter(key => rotationStore.buffs[key].activeRows?.length)
            .sort((a, b) => Math.min(...rotationStore.buffs[a].activeRows) - Math.min(...rotationStore.buffs[b].activeRows));
        orderedBuffs.forEach((key, index) => { buffLanes[key] = index; });
        const activeBuffTicks = Object.fromEntries(orderedBuffs.map(key =>
            [key, new Set(rotationStore.buffs[key].activeRows)]));

        for (const row of timelineRows(rotationStore.tickEvents, totalSlots, columnsPerRow)) {
            const { startIndex, endIndex } = row;

			// Find which buffs are active on any tick in this row
			const activeBuffsSet = new Set<string>();
			for (let i = startIndex; i < endIndex; i++) {
				for (const buffKey of orderedBuffs) {
					if (activeBuffTicks[buffKey].has(i)) {
						activeBuffsSet.add(buffKey);
					}
				}
			}

			// Find which stacks are displayed on any tick in this row
			const activeStacksSet = new Set<string>();
			for (let i = startIndex; i < endIndex; i++) {
				for (const stackKey of Object.keys(rotationStore.stacks)) {
					const stack = rotationStore.stacks[stackKey];
					if (stack.idx >= 0 && stack.stackTicks && showTimelineStack(stackKey, i, stack.stackTicks)) {
						activeStacksSet.add(stackKey);
					}
				}
			}

			// Preserve empty lanes when another buff ends or starts on a different row.
			const activeBuffs = [...activeBuffsSet];
			const buffIndices: Record<string, number> = {};
			activeBuffs.forEach(buffKey => {
				buffIndices[buffKey] = buffLanes[buffKey];
			});
            const buffCount = activeBuffs.length ? Math.max(...activeBuffs.map(key => buffLanes[key])) + 1 : 0;

			// Assign compact local indices to active stacks
			const activeStacks = [...activeStacksSet];
			const stackIndices: Record<string, number> = {};
			activeStacks.forEach((stackKey, idx) => {
				stackIndices[stackKey] = idx;
			});

			// Calculate row height: base slot height + space for buffs below + space for stacks below buffs + constant gap
			// Buff bars extend below slot: initial 9px offset + 6px per buff
			const buffSpace = buffCount > 0 ? 9 + buffCount * buffLineHeight : 0;
			// Stacks positioned below buffs: each stack takes ~12px
			const stackSpace = activeStacks.length * (stackFontSize + stackPadding);
			// Additional padding when there's content below the slot
			const contentPadding = (activeBuffs.length > 0 || activeStacks.length > 0) ? 8 : 0;
			// Boss attack pattern row
			const patternSpace = hasAttackPattern ? PATTERN_ROW_HEIGHT + PATTERN_ROW_GAP : 0;
			const height = BASE_ROW_HEIGHT + buffSpace + stackSpace + contentPadding + patternSpace + ROW_GAP;

			newRowData.push({
                ...row,
				startIndex,
				endIndex,
				activeBuffs,
				buffIndices,
				buffCount,
				height,
				activeStacks,
				stackIndices
			});
		}

		rowLayoutData = newRowData;
	}

	// Get the local buff index for a specific tick
	function getBuffLocalIndex(buffKey: string, tickIndex: number): number {
		const rowIndex = rowLayoutData.findIndex(row => tickIndex >= row.startIndex && tickIndex < row.endIndex);
		const rowData = rowLayoutData[rowIndex];
		if (!rowData) return -1;
		return rowData.buffIndices[buffKey] ?? -1;
	}

	// Get the local stack index for a specific tick
	function getStackLocalIndex(stackKey: string, tickIndex: number): number {
		const rowIndex = rowLayoutData.findIndex(row => tickIndex >= row.startIndex && tickIndex < row.endIndex);
		const rowData = rowLayoutData[rowIndex];
		if (!rowData) return -1;
		return rowData.stackIndices[stackKey] ?? -1;
	}

	// Get the local buff count for a specific tick (used for stack positioning)
	function getLocalBuffCount(tickIndex: number): number {
		const rowIndex = rowLayoutData.findIndex(row => tickIndex >= row.startIndex && tickIndex < row.endIndex);
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
		const rowIndex = rowLayoutData.findIndex(row => tickIndex >= row.startIndex && tickIndex < row.endIndex);
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
		return rowLayoutData.flatMap(row => row.sectionTitle ? ['52px', `${row.height}px`] : [`${row.height}px`]).join(' ');
	}

    let draftReady = $state(false);
    let draftTimer;
    let lastDraftSnapshot = '';
    function draftSnapshot() {
        return JSON.stringify({data: rotationActions.getCurrentRotationData(), style: uiStore.activeTab, id: rotationStore.activeRotationId});
    }
    function flushDraft() {
        clearTimeout(draftTimer);
        if (draftReady && draftSnapshot() !== lastDraftSnapshot) {
            if (rotationActions.saveDraft(uiStore.activeTab)) lastDraftSnapshot = draftSnapshot();
        }
    }
    $effect(() => {
        if (!draftReady) return;
        const snapshot = draftSnapshot();
        if (snapshot !== lastDraftSnapshot) {
            clearTimeout(draftTimer);
            draftTimer = setTimeout(flushDraft, 250);
        }
    });

	onMount(() => {
        const draft = rotationActions.restoreDraft();
        if (['ranged', 'magic', 'melee', 'necro', 'defence'].includes(draft?.style)) uiStore.activeTab = draft.style;
        if (draft) refreshUI();
        lastDraftSnapshot = draftSnapshot();
        draftReady = true;
        const onHidden = () => { if (document.visibilityState === 'hidden') flushDraft(); };
        window.addEventListener('pagehide', flushDraft);
        document.addEventListener('visibilitychange', onHidden);
		// Set up ResizeObserver to recalculate on container resize
        let previousWidth = -1;
        resizeObserver = new ResizeObserver(entries => {
            const width = entries[0]?.contentRect.width;
            if (width === previousWidth) return;
            previousWidth = width;
            recalculateRowLayout();
        });

		// Initial calculation after DOM is ready
		setTimeout(() => {
			if (abilityBarElement) {
				resizeObserver?.observe(abilityBarElement);
				recalculateRowLayout();
			}
		}, 0);
        return () => { flushDraft(); window.removeEventListener('pagehide', flushDraft); document.removeEventListener('visibilitychange', onHidden); };
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
	function calculateSynchronously() {
		eventHandlers.calculateTotalDamageNew();

		if (uiStore.showSuggestions.value && rotationStore._finalState && rotationStore._finalSettings) {
			const style = uiStore.activeTab ?? 'melee';
			const styleMap = { ranged: 'ranged', magic: 'magic', melee: 'melee', necro: 'necromancy' };
			const candidates = Object.entries(abils)
				.filter(([, a]) => a.title && !a.parent && a.mainStyle === styleMap[style])
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

    let calculationPending = $state(false);
    let calculationWorker: LatestWorker | undefined;
    let workerFailed = false;
    function calculateTotalDamageNew() {
        if (typeof Worker === 'undefined' || workerFailed) {
            calculateSynchronously();
            return;
        }
        calculationPending = true;
        if (!calculationWorker) {
            try {
                calculationWorker = new LatestWorker(new Worker(
                    new URL('../../lib/calc/rotation_builder/editor.worker.ts', import.meta.url), {type: 'module'}),
                    data => {
                        eventHandlers.calculateTotalDamageNew(data.result);
                        for (const [key, buff] of Object.entries(data.buffs)) Object.assign(rotationStore.buffs[key], buff);
                        for (const [key, ticks] of Object.entries(data.stacks)) rotationStore.stacks[key].stackTicks = ticks;
                        rotationStore.cooldownReady = data.cooldownReady;
                        suggestions = data.suggestions;
                        eventHandlers.refreshUI(false, stores, calculateTotalDamageNew);
                        calculationPending = false;
                    }, error => {
                        console.error(error);
                        calculationWorker?.close();
                        calculationWorker = undefined;
                        workerFailed = true;
                        calculationPending = false;
                        calculateSynchronously();
                        eventHandlers.refreshUI(false, stores, calculateTotalDamageNew);
                    });
            } catch (error) {
                workerFailed = true;
                calculationPending = false;
                calculateSynchronously();
                return;
            }
        }
        // A replaced ability must use its own duration while new results are pending.
        rotationStore.tickMetadata = {};
        calculationWorker.request({input: snapshotEditorCalculation()});
    }
    onDestroy(() => calculationWorker?.close());

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

    function selectMode(mode) {
        if (mode === ToolMode.Release) eventHandlers.appendRelease(stores, calculateTotalDamageNew, refreshUI);
        else uiActions.setActiveTool(mode);
    }
    function handleKeypress(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (target?.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target?.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key.toLowerCase() === 'r') {
            event.preventDefault();
            if (!event.repeat) selectMode(ToolMode.Release);
            return;
        }
        eventHandlers.handleKeypress(event, stores);
    }
    function dragTimelineAction(event, kind, ability, startIndex) {
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', JSON.stringify({kind, ability, startIndex}));
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

            // Prefer simulated timers, including buff reductions and cooldown resets.
            const onCooldown = meta?.cooldownRemaining !== undefined
                ? meta.cooldownRemaining > 0
                : cooldownExpiry[abilKey] && i < cooldownExpiry[abilKey];
            if (onCooldown) {
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

<Navbar />
<svelte:head><title>Rotation builder | RS Analysis</title></svelte:head>
<header class="builder-heading">
    <div><h1>Rotation builder</h1></div>
    <a href="/rs-rot/rotation_builder_guide">Builder guide</a>
</header>

<div class="builder-page">
	<div class="responsive-container {uiStore.activeTool.toLowerCase()}-cursor {uiStore.stallingAbility ? 'stalling' : ''}"
		tabindex="-1"
		role="button"
		onkeydown={handleKeypress}
		style="--stack-font-size: {stackFontSize}px; {uiStore.stallingAbility ? `cursor: url('${allAbils[uiStore.stallingAbility].icon}') 15 15, wait;` : ''}"
    >
		<section class="flex flex-col gap-6">
			<div class="flex flex-row wrapper {uiStore.settingsPanelCollapsed ? 'gap-0' : 'gap-6'} relative">
				<div class="card card-rotation {uiStore.settingsPanelCollapsed ? 'w-full' : 'w-2/3'}">
					{#if uiStore.settingsPanelCollapsed}
                        <button
                            class="expand-button"
                            onclick={() => uiActions.toggleSettingsPanel()}
                        >
                            Settings ←
                        </button>
					{/if}
					<div class="rotation-title-row">
						<h2 class="rotation-header">{bossName === "ROTATION" ? "Your rotation" : bossName}{#if killTime} <em>{killTime}</em>{/if}</h2>
						<button class="reset-btn" onclick={clearRotation} title="Reset rotation">Reset</button>
						<div class="damage-summary"><span class="damage-label">Total damage - all targets</span>
<span class="dmg-total">{Math.round(rotationStore.totalDamage + rotationStore.poisonDamage + rotationStore.familiarDamage + rotationStore.dreadnipDamage + rotationStore.conjureDamage + Object.values(rotationStore.secondaryDamage).reduce((sum, value) => sum + Number(value), 0)).toLocaleString()}</span></div>
					</div>

					<GradientSeparator marginTop="0.0rem" marginBottom="0.75rem" />

                    <RotationDamageSummary {showFightTime} startTick={patternStartTick} />

                    <RotationConfigManager
                        {refreshUI}
                        onOpenKeybinds={() => showKeybindModal = true}
                        onShowKeypresses={() => showKeypressModal = true}
                    />

                    <ul class="style-tabs flex flex-wrap text-sm font-medium text-center items-center">
                        {#each tabs as tab}
                            <TabButton
                                id={tab.id}
                                label={tab.label}
                                badge={tab.badge || ''}
                                isActive={uiStore.activeTab === tab.id}
                                onClick={() => uiActions.setActiveTab(tab.id)}
                            />
                        {/each}
                    </ul>
                    <div class="library-controls">
                        <label class="search-label">Find an ability<input type="search" placeholder="Search this combat style..." bind:value={abilitySearch} /></label>
                        <span class="all-abilities-note">All abilities shown unless you hide them</span>
                    </div>
                    {#each tabs as tab}
                        {#if uiStore.activeTab === tab.id}
                            <AbilityChoice
                                search={abilitySearch}
                                abilities={tab.abilities}
                                handleAbilityClick={addFromPalette}
                                handleDragStart={dragFromPalette}
                                style={tab.id}
                            />
                        {/if}
					{/each}
	                <div class="timeline-heading"><h2>Timeline</h2><label class="time-toggle"><input type="checkbox" bind:checked={showFightTime} /> Fight time (seconds)</label><span role="status">{calculationPending ? 'Updating damage...' : showFightTime ? 'Time from Start Tick; negative = pre-fight' : '1 tick = 0.6 seconds'}</span></div>
                    <div class="edit-toolbar" role="group" aria-label="Editing mode">
                        {#each modes as mode}<button class:active={uiStore.activeTool === mode.value} aria-pressed={uiStore.activeTool === mode.value} onclick={() => selectMode(mode.value)}>{mode.label} <kbd>{mode.key}</kbd></button>{/each}
                    </div>
                    <p class="mode-hint">{modes.find(mode => mode.value === uiStore.activeTool)?.hint}</p>
                    <ShiftRotation {refreshUI} />
                    {#if !usedTicks}<div class="timeline-empty"><strong>Add your first ability above</strong><span>Abilities append at the next available tick. Configure your gear in Settings to get meaningful damage estimates.</span></div>{/if}
                    <div
                        bind:this={abilityBarElement}
						style="grid-template-rows: {getGridTemplateRows()}; grid-template-columns: repeat({columnsPerRow}, {CELL_SIZE}px);"
						class="ability-bar"
					>
                        {#each rowLayoutData as row}
                            {#if row.sectionTitle}<div class="timeline-section-heading" style="grid-column: 1 / -1; grid-row: {row.gridRow - 1}"><strong>{row.sectionTitle}</strong><span>{showFightTime ? `${fightTime(row.startIndex, patternStartTick)} to ${fightTime(row.sectionEnd ?? row.endIndex - 1, patternStartTick)}` : `Ticks ${row.startIndex} to ${row.sectionEnd}`}</span><span>{Math.round(damageBetween(rotationStore.phaseDamagePerTick, row.startIndex, row.sectionEnd ?? row.endIndex - 1)).toLocaleString()} damage</span></div>{/if}
                        {/each}
                        {#each rotationStore.abilityBar.slice(0, visibleTicks) as ability, index (index)}
                            {@const visualRow = rowLayoutData.find(row => index >= row.startIndex && index < row.endIndex)}
                            <button
                                style={visualRow ? `grid-row: ${visualRow.gridRow}; grid-column: ${index - visualRow.startIndex + 1}` : undefined}
                                class="ability-slot"
                                class:highlight-red={uiStore.dragDrop.hoveredSlot === index && !uiStore.dragDrop.validSlot}
                                class:highlight-green={uiStore.dragDrop.hoveredSlot === index && uiStore.dragDrop.validSlot}
                                class:nulled={rotationStore.nulledTicks[index]}
                                class:selected-tick={uiStore.extraActions.show && uiStore.extraActions.tick === index}
                                class:combined-cast={!!ability && !!rotationStore.releasedAbilities[index]}
                                class:has-extra-actions={rotationStore.extraActionBar[index]?.some(action => action !== null)}
                                class:has-damage={damageTicks.has(index)}
                                class:invalid-placement={invalidTicks[index] && ability}
                                class:phase-pause={pauseTickSet.has(index)}
                                class:tick-event={!!rotationStore.tickEvents[index]}
                                title={tickConditionLabel(rotationStore.tickEvents[index])}
                                tabindex="0"
                                aria-label={`Tick ${index}, ${(index * 0.6).toFixed(1)} seconds: ${ability ? allAbils[ability]?.title ?? ability : "empty"}`}
                                onclick={(e) => handleBarLeftClick(e, ability, index)}
                                oncontextmenu={(e) => handleBarRightClick(e, index)}
                                ondrop={(e) => handleDrop(e, index)}
                                ondragover={(e) => allowDrop(e)}
                                ondragenter={(e) => handleDragEnter(e, index)}
                                ondragleave={(e) => handleDragLeave(e, index)}
                            >
                                <span class="cell-number" class:time-number={showFightTime} title={`Tick ${index} · ${fightTime(index, patternStartTick)} from fight start`}>{showFightTime ? fightTime(index, patternStartTick) : index}{rotationStore.tickEvents[index]?.phase ? " P" : rotationStore.tickEvents[index]?.accuracy != null ? " %" : rotationStore.tickEvents[index] ? " *" : ""}</span>
                                {#if ability && allAbils[ability]}
                                    <img class="regular-ability" src={allAbils[ability].icon}
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
                                        draggable="true" ondragstart={(e) => dragTimelineAction(e, 'stall', rotationStore.stalledAbilities[index], index)}
                                        alt="Stalled ability"
                                        title="Stalled: {allAbils[rotationStore.stalledAbilities[index]].title}"
                                    />
                                {/if}
                                {#if rotationStore.stalledAbilities[index]}<span class="stall-label" title="Stalled: adrenaline only">S</span>{/if}
                                {#if rotationStore.releasedAbilities[index] && allAbils[rotationStore.releasedAbilities[index]]}
                                    <img class="released-ability" draggable="true" ondragstart={(e) => dragTimelineAction(e, 'release', rotationStore.releasedAbilities[index], index)} src={allAbils[rotationStore.releasedAbilities[index]].icon} alt="Released ability" title="Release: {allAbils[rotationStore.releasedAbilities[index]].title}" />
                                    <span class="stall-label release-label" class:invalid-release={!validRelease(index)} title={validRelease(index) ? "Release held ability" : "No matching held ability: this release does no damage"}>R</span>
                                {/if}
                                {#if ability && rotationStore.releasedAbilities[index]}<span class="cast-divider" aria-hidden="true"></span>{/if}
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
                                    <div class="extra-action-preview" title={extraActions.map(a => a.title || allExtraActions[a]?.title || a.value || a).join(", ")}>
                                        {#each extraActions.slice(0, 1) as action}
                                            {@const icon = action.icon || allExtraActions[action]?.icon || ''}
                                            {@const title = action.title || allExtraActions[action]?.title || ''}
                                            {#if icon}
                                                <div class="extra-action-icon-box" title={title}>
                                                    <img src={icon} alt={title} />
                                                </div>
                                            {/if}
                                        {/each}
                                        {#if extraActions.length > 1}<span class="extra-count">+{extraActions.length - 1}</span>{/if}
                                    </div>
                                {/if}
                                {#if phaseTickMap.has(index) && !rotationStore.tickEvents[index]?.phase}
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
                                            width: calc(100% + 2px); pointer-events: none;
                                            height: {buffLineHeight}px;
                                            background-color: {rotationStore.buffs[key].colour};
                                            box-sizing: border-box; ">
                                        </div>
                                    {/if}
                                {/each}
                                {#each Object.keys(rotationStore.stacks) as key}
                                    {#if showTimelineStack(key, index, rotationStore.stacks[key].stackTicks) && getStackLocalIndex(key, index) >= 0}
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
                                            {+rotationStore.stacks[key].stackTicks[index].toFixed(key === SETTINGS.ADRENALINE ? 1 : 0)}
                                        </span>
                                        <img src={rotationStore.stacks[key].image}
                                            style="
                                                transform:translateX({2-(30-stackFontSize)/2}px);
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
                    <div class="timeline-footer"><span>Showing {visibleTicks} of 300 ticks</span>
                        {#if visibleTicks < 300}<button onclick={() => expandedTicks = Math.min(300, visibleTicks + 30)}>+ 30 ticks</button>{/if}
                        <label><input type="checkbox" bind:checked={showFullTimeline} /> Show all ticks</label>
                    </div>
                    {#if rotationStore.targetCounts.some(v => v != null)}
                        <div class="tick-help"><strong>Target-count changes</strong>
                            {#each rotationStore.targetCounts as count, tick}{#if count != null}<span> &middot; Tick {tick}: {count} target{count === 1 ? '' : 's'}</span>{/if}{/each}
                        </div>
                    {/if}
                    <details class="results-panel" open><summary>Damage analysis - main target</summary>
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

                    </details>
                </div>
                <div class="overflow-hidden settings-content {uiStore.settingsPanelCollapsed ? 'w-0' : 'w-1/3'}">
                    <div class="xl:w-full lg:w-70 xl:min-w-100 lg:min-w-full">
                        {#if uiStore.extraActions.show}
                            <ExtraActionsPanel
                                {showFightTime}
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
                            <RotationSettings styleTab={uiStore.activeTab === 'defence' ? 'ranged' : uiStore.activeTab} updateDamages={calculateTotalDamageNew} stacks={rotationStore.stacks} uiState={uiStore} refreshUI={refreshUI} />
                        </div>
                    </div>
                </div>
            </div>
            <div class="card card-rotation">
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
                        <strong>Edit</strong> (<strong>E</strong>) is the default for adding, removing, and dragging abilities.
                        <strong>Stall (S)</strong> pays or gains adrenaline without dealing damage or generating hit stacks. Click an ability to stall it at the next GCD, or drag it to a tick. <strong>Release (R)</strong> adds the held ability at the next GCD without paying again. The next ability shares that tick; drag the release icon to move it. A new cast or stall replaces the held ability. Channels and self-cast buffs cannot be stalled. <strong>Edit (E)</strong> returns to normal editing.
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
						<a href="/rs-rot/rotation_builder_guide" class="text-blue-400 hover:underline hover:text-blue-300">
						full guide</a>.
					</p>
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

<style>
    .timeline-section-heading { display: flex; align-items: center; gap: 16px; border-bottom: 1px solid #42565f; color: #cbb780; align-self: start; padding: 4px 0 10px; }
    .timeline-section-heading strong { font-size: 16px; }
    .timeline-section-heading span { color: #9bc6df; font-size: 12px; }
    .stall-label { position: absolute; top: 0; right: 1px; z-index: 3; background: #172126; color: #e9c46a; font-weight: bold; font-size: 11px; padding: 0 2px; }
    .release-label { color: #89ddbb; }
    .invalid-release { color: #ff9988; outline: 1px solid #ff9988; }
    .ability-slot.tick-event { border-top: 3px solid #c8b477; }
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
        color: #4caf50;
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
        cursor: default; /* Default stall cursor */
    }

    .stall-cursor.stalling {
        cursor: default; /* Will be overridden if there's an ability being stalled */
    }

    .null-cursor {
        cursor:
            url('/rs-rot/cursor_icons/abort-icon.svg') 16 16,
            not-allowed;
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
        border: 1px solid #ffd700; outline: 1px solid #ffd700; outline-offset: -1px;
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
        white-space: nowrap;
    }
    .cell-number.time-number { font-size: 10px; }
    .time-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #bed0dc; cursor: pointer; }

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

    .stalled-ability, .released-ability {position:absolute; inset:0; width:100%; height:100%; object-fit:contain; cursor:grab; z-index:1;}
    .combined-cast .regular-ability {clip-path:polygon(100% 0, 100% 100%, 0 100%);}
    .combined-cast .released-ability {clip-path:polygon(0 0, 100% 0, 0 100%);}
    .cast-divider {position:absolute; inset:0; pointer-events:none; z-index:2; background:linear-gradient(135deg, transparent calc(50% - 1px), #e3d6b1 calc(50% - 1px), #e3d6b1 calc(50% + 1px), transparent calc(50% + 1px));}

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
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;
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

    .extra-action-preview {position:absolute; bottom:0; right:0; display:flex; z-index:5; pointer-events:none;}
    .extra-action-icon-box {width:17px; height:17px; border:1px solid #b8a04a; background:#171d21; display:flex; align-items:center; justify-content:center; overflow:hidden;}
    .extra-count {position:absolute; right:17px; bottom:0; font-size:9px; background:#171d21; color:#e3d6b1; padding:0 2px;}

    .extra-action-icon-box img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.708));
    }

    .stall-cursor.stalling {
        cursor: default; /* Will be overridden if there's an ability being stalled */
    }

    .null-cursor {
        cursor:
            url('/rs-rot/cursor_icons/abort-icon.svg') 16 16,
            not-allowed;
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

    .builder-heading { max-width: 1600px; margin: 0 auto; padding: 30px 28px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .builder-heading h1 { font-size: 30px; line-height: 1.3; font-weight: 650; margin: 6px 0; color: #edf1f4; }
    .builder-heading p { color: #a5b3bf; font-size: 14px; }
    .builder-heading .eyebrow { font-size: 10px; letter-spacing: .14em; color: #c7b281; }
    .builder-heading a { color: #d7c293; font-size: 13px; white-space: nowrap; }
    .builder-page .responsive-container { width: 100%; max-width: 1600px; margin: auto; padding: 0 28px 40px; }
    .builder-page .wrapper { align-items: flex-start; gap: 20px; }
    .builder-page .card-rotation { background: #19242d; border: 1px solid #34414b; border-radius: 8px; padding: 22px; min-width: 0; }
    .builder-page .wrapper > .card-rotation { flex: 1; width: auto; }
    .builder-page .settings-content { width: 390px; flex-shrink: 0; border-radius: 8px; top: 16px; }
    .builder-page .settings-content.w-0 { display: none; }
    .builder-page .settings-content > div { min-width: 0; width: 100%; }
    .rotation-header { font-size: 18px; text-transform: none; letter-spacing: 0; }
    .damage-label { font-size: 11px; color: #a5b3bf; }
    .library-controls { display: flex; gap: 12px; margin: 16px 0; }
    .library-controls label { display: grid; gap: 6px; font-size: 11px; color: #b4c1cd; }
    .search-label { flex: 1; }
    .library-controls input, .library-controls select { width: 100%; min-height: 38px; padding: 8px 10px; border: 1px solid #42515d; border-radius: 5px; background: #111d26; color: #e2e9ed; font-size: 13px; }
    .timeline-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; border-top: 1px solid #35434d; margin-top: 20px; padding-top: 20px; }
    .timeline-heading h2 { font-size: 17px; font-weight: 600; }
    .timeline-heading span, .timeline-footer { color: #a5b3bf; font-size: 12px; }
    .edit-toolbar { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0 8px; }
    .edit-toolbar button, .timeline-footer button { border: 1px solid #46545e; border-radius: 4px; padding: 7px 10px; color: #d7e0e7; background: #24313b; font-size: 12px; cursor: pointer; }
    .edit-toolbar button.active { background: #c9b17d; color: #16212a; border-color: #c9b17d; }
    kbd { font: inherit; opacity: .6; margin-left: 8px; }
    .mode-hint { font-size: 12px; color: #b0bec9; min-height: 34px; line-height: 1.6; }
    .timeline-empty { display: flex; flex-direction: column; gap: 5px; padding: 16px; background: #202f39; border-left: 2px solid #c9b17d; margin: 8px 0; font-size: 13px; }
    .timeline-empty span { color: #a8b8c5; font-size: 12px; }
    .timeline-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; padding: 12px 0 20px; }
    .timeline-footer label { display: flex; align-items: center; gap: 6px; }
    .results-panel { border-top: 1px solid #35434d; padding-top: 16px; }
    .results-panel summary { font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
    .ability-slot { background: #121e27; border-color: #445460; }
    .builder-page :global(button:focus-visible), .builder-page :global(input:focus-visible), .builder-page :global(select:focus-visible) { outline: 2px solid #dcc18a; outline-offset: 2px; }
    @media (max-width: 1050px) { .builder-page .settings-content { width: 340px; } .builder-page .responsive-container { padding: 0 16px 30px; } .builder-page .card-rotation { padding: 16px; } }
    @media (max-width: 800px) { .builder-page .wrapper { flex-direction: column; } .builder-page .wrapper > .card-rotation, .builder-page .settings-content { width: 100%; } .builder-page .settings-content { position: static; max-height: none; } .builder-heading { padding: 24px 16px; } .builder-heading h1 { font-size: 25px; } .library-controls { flex-wrap: wrap; } .search-label { min-width: 160px; } .builder-heading > a { display: none; } }


    .all-abilities-note { align-self: end; padding: 10px 0; font-size: 11px; color: #aeb9c1; }
    .builder-page :global(.style-tabs button) { font-size: 15px; text-transform: none; padding: 10px 5px; }
    .builder-page :global(.style-tabs) { margin-top: 12px; border-bottom: 1px solid #3b454c; }
    .builder-page .card-rotation { background: #171d21; color: #d4dce2; }
    .builder-page .timeline-heading { margin-top: 8px; }
.builder-heading { width: 100%; padding-top: 14px; padding-bottom: 14px; } .builder-heading h1 { font-size: 24px; }
</style>
