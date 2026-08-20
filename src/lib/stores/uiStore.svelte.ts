import { ToolMode } from '$lib/calc/rotation_builder/ui_material/toolModes.ts';
import { rotationStore } from '$lib/stores/rotationStore.svelte.ts';

// UI Constants
const BASE_BAR_ROW_GAP = 30;
const BAR_SIZE = 200;

export type CombatTab = 'ranged' | 'magic' | 'melee' | 'necro' | 'defence';
export type AbilityFilter = 'popular' | 'owned' | 'all';
export type ExtraActionsTab = string;

// UI store
export const uiStore = $state({
    // Tab management
    activeTab: 'ranged' as CombatTab,

    // Tool management
    activeTool: ToolMode.Regular as ToolMode,
    stallingAbility: null as string | null,

    // Panel states
    settingsPanelCollapsed: false,
    configSectionCollapsed: true,
    abilityFilter: 'popular' as AbilityFilter,
    showSuggestions: { value: false },

    // Extra actions panel
    extraActions: {
        show: false,
        tick: -1,
        tab: 'info' as ExtraActionsTab,
        infoAbility: null as string | null,
        barIndex: 0
    },

    // Ability bar state
    bar: {
        size: BAR_SIZE,
        index: 0,
        lastIndex: 0,
        rowGap: BASE_BAR_ROW_GAP,
        lineGap: 0
    },

    // Drag and drop state
    dragDrop: {
        hoveredSlot: null as number | null,
        validSlot: true
    }
});

// UI actions
export const uiActions = {
    // Tab management
    setActiveTab(tab: string) {
        uiStore.activeTab = tab as CombatTab;
    },

    // Tool management
    setActiveTool(tool: ToolMode) {
        uiStore.activeTool = tool;
        uiStore.stallingAbility = null;
    },

    setStallingAbility(ability: string | null) {
        uiStore.stallingAbility = ability;
    },

    clearStallingAbility() {
        uiStore.stallingAbility = null;
    },

    // Panel management
    toggleSettingsPanel() {
        uiStore.settingsPanelCollapsed = !uiStore.settingsPanelCollapsed;
    },

    toggleConfigSection() {
        uiStore.configSectionCollapsed = !uiStore.configSectionCollapsed;
    },

    cycleAbilityFilter() {
        const filters: AbilityFilter[] = ['popular', 'owned', 'all'];
        const idx = filters.indexOf(uiStore.abilityFilter);
        uiStore.abilityFilter = filters[(idx + 1) % filters.length];
    },

    // Extra actions panel
    showExtraActions(tick: number, ability: string | null) {
        uiStore.extraActions.show = true;
        uiStore.extraActions.tick = tick;
        uiStore.extraActions.infoAbility = ability;
        // Find the first empty slot in the extra action bar for this tick
        const extraBar = rotationStore.extraActionBar[tick];
        let idx = 0;
        if (extraBar) {
            while (idx < extraBar.length && extraBar[idx] != null) {
                idx++;
            }
        }
        uiStore.extraActions.barIndex = idx;
    },

    hideExtraActions() {
        uiStore.extraActions.show = false;
        uiStore.extraActions.tick = -1;
        uiStore.extraActions.infoAbility = null;
        uiStore.extraActions.barIndex = 0;
    },

    setExtraActionsTab(tab: ExtraActionsTab) {
        uiStore.extraActions.tab = tab;
    },

    // Ability bar management
    updateBarIndex(index: number) {
        uiStore.bar.index = index;
    },

    updateBarLastIndex(index: number) {
        uiStore.bar.lastIndex = index;
    },

    updateBarRowGap(gap: number) {
        uiStore.bar.rowGap = gap;
    },

    updateBarLineGap(gap: number) {
        uiStore.bar.lineGap = gap;
    },

    // Drag and drop management
    setDragDropHoveredSlot(slot: number | null) {
        uiStore.dragDrop.hoveredSlot = slot;
    },

    setDragDropValidSlot(valid: boolean) {
        uiStore.dragDrop.validSlot = valid;
    },

    clearDragDrop() {
        uiStore.dragDrop.hoveredSlot = null;
        uiStore.dragDrop.validSlot = true;
    },

    // Keyboard shortcuts — ignore when user is typing in an input field
    handleKeypress(event: KeyboardEvent) {
        const el = event.target as HTMLElement | null;
        const tag = el?.tagName;
        if (tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (tag === 'INPUT' && (el as HTMLInputElement).type !== 'checkbox' && (el as HTMLInputElement).type !== 'radio') return;

        switch (event.key) {
            case "r":
                this.setActiveTool(ToolMode.Regular);
                break;
            case "s":
                if (uiStore.activeTool == ToolMode.Stall) {
                    this.setActiveTool(ToolMode.Regular)
                }
                else {
                    this.setActiveTool(ToolMode.Stall);
                }
                break;
            case "n":
                if (uiStore.activeTool == ToolMode.Null) {
                    this.setActiveTool(ToolMode.Regular)
                }
                else {
                    this.setActiveTool(ToolMode.Null);
                }
                break;
            case "i":
                if (uiStore.activeTool == ToolMode.Insert) {
                    this.setActiveTool(ToolMode.Regular)
                }
                else {
                    this.setActiveTool(ToolMode.Insert);
                }
                break;
            case "1":
                this.setActiveTab("ranged");
                break;
            case "2":
                this.setActiveTab("magic");
                break;
            case "3":
                this.setActiveTab("melee");
                break;
            case "4":
                this.setActiveTab("necro");
                break;
            case "5":
                this.setActiveTab("defence");
                break;
        }
    }
};
