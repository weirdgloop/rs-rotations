import { ToolMode } from '$lib/calc/rotation_builder/ui_material/toolModes.ts';
import { rotationStore } from '$lib/stores/rotationStore.svelte.js';

// UI Constants
const BASE_BAR_ROW_GAP = 30;
const BAR_SIZE = 200;
const EXTRA_BAR_SIZE = 12;
const stackFontSize = 10;
const baseStackOffset = 32;
const stackPadding = 2;
const buffLineWidth = 32;
const buffLineHeight = 6;

// UI store
export const uiStore = $state({
    // Tab management
    activeTab: 'ranged',

    // Tool management
    activeTool: ToolMode.Regular,
    stallingAbility: null,

    // Panel states
    settingsPanelCollapsed: false,
    configSectionCollapsed: true,
    abilityFilter: 'popular', // 'popular' | 'owned' | 'all'
    showSuggestions: { value: false },

    // Extra actions panel
    extraActions: {
        show: false,
        tick: -1,
        tab: 'info',
        infoAbility: null,
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
        hoveredSlot: null,
        validSlot: true
    }
});

// UI actions
export const uiActions = {
    // Tab management
    setActiveTab(tab) {
        uiStore.activeTab = tab;
    },

    // Tool management
    setActiveTool(tool) {
        uiStore.activeTool = tool;
        uiStore.stallingAbility = null;
    },

    setStallingAbility(ability) {
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
        const filters = ['popular', 'owned', 'all'];
        const idx = filters.indexOf(uiStore.abilityFilter);
        uiStore.abilityFilter = filters[(idx + 1) % filters.length];
    },

    // Extra actions panel
    showExtraActions(tick, ability) {
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

    setExtraActionsTab(tab) {
        uiStore.extraActions.tab = tab;
    },

    // Ability bar management
    updateBarIndex(index) {
        uiStore.bar.index = index;
    },

    updateBarLastIndex(index) {
        uiStore.bar.lastIndex = index;
    },

    updateBarRowGap(gap) {
        uiStore.bar.rowGap = gap;
    },

    updateBarLineGap(gap) {
        uiStore.bar.lineGap = gap;
    },

    // Drag and drop management
    setDragDropHoveredSlot(slot) {
        uiStore.dragDrop.hoveredSlot = slot;
    },

    setDragDropValidSlot(valid) {
        uiStore.dragDrop.validSlot = valid;
    },

    clearDragDrop() {
        uiStore.dragDrop.hoveredSlot = null;
        uiStore.dragDrop.validSlot = true;
    },

    // Keyboard shortcuts — ignore when user is typing in an input field
    handleKeypress(event) {
        const el = event.target;
        const tag = el?.tagName;
        if (tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (tag === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') return;

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