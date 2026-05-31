import { ToolMode } from '$lib/calc/rotation_builder/ui_material/toolModes';
import { abils } from '$lib/data/abilities.ts';
import { calculateTotalDamage, calculateGaussianParameters } from '$lib/calc/rotation_builder/rotation-damage-calculator';
import { rotationStore, rotationActions } from '$lib/stores/rotationStore.svelte.js';
import { uiStore, uiActions } from '$lib/stores/uiStore.svelte.js';
import { settingsStore } from '$lib/stores/settingsStore.svelte.js';
import { notifActions } from '$lib/stores/notificationStore.svelte.js';
import { Logger, LogCategory } from './Logger';
import { gearSwaps, allExtraActions } from '$lib/special/abilities';
import { isExtraAction } from '$lib/calc/rotation_builder/extra-action';
import { getSettingsKeyForItem } from '$lib/calc/rotation_builder/gear-registry';

const logger = Logger.getInstance();
// UI Constants
const BAR_SIZE = 300;
const EXTRA_BAR_SIZE = 12;

/**
 * Convert a raw click payload into an ExtraAction object for storage.
 * - Gear items come as { title, icon } objects from GearChoice
 * - Abilities/prayers/consumables/spells come as string keys from AbilityChoice
 * - Already-converted ExtraAction objects pass through unchanged
 */
function toExtraAction(input) {
    if (isExtraAction(input)) return input;

    // Gear object from GearChoice: { title, value?, icon, slot?, style?, weaponType?, perks? }
    if (typeof input === 'object' && input.title) {
        const value = input.value || input.title;
        // Resolve per-style settings key: try gear registry first (with active style for hybrid items), fall back to legacy gearSwaps
        const slot = getSettingsKeyForItem(value, uiStore.activeTab) || gearSwaps[value] || gearSwaps[input.title];
        // Carry inline perks if present (from owned gear instances)
        const perks = input.perks?.length ? input.perks.map(p => ({ perkKey: p.perkKey, rank: p.rank })) : undefined;
        return {
            type: 'gear',
            value,
            title: input.title,
            icon: input.icon || '',
            ...(slot ? { slot } : {}),
            ...(perks ? { perks } : {}),
        };
    }

    // String key — look up in allExtraActions for icon/title
    if (typeof input === 'string') {
        const info = allExtraActions[input];
        return {
            type: 'ability',
            value: input,
            title: info?.title || input,
            icon: info?.icon || '',
        };
    }

    return input; // fallback — pass through
}

/**
 * Handles ability clicks from the ability selection panel
 * @param {Event} event - The click event
 * @param {string} abilityKey - The key of the ability being clicked
 * @param {boolean} mainBar - Whether this is for the main bar (true) or extra actions (false)
 * @param {Object} stores - Object containing uiStore, rotationStore, notifActions
 * @param {Function} calculateTotalDamageNew - Function to recalculate damage
 * @param {Function} refreshUI - Function to refresh the UI
 */
export function handleAbilityClick(event, abilityKey, mainBar = true, stores, calculateTotalDamageNew, refreshUI) {
    const { uiStore, rotationStore, notifActions } = stores;

    if (uiStore.activeTool === ToolMode.Stall) {
        // Check if ability is channeled
        if (abils[abilityKey].abilityClassification === 'channel') {
            notifActions.showNotification('Sorry!','Channeled abilities cannot be stalled currently.', 'info');
            return;
        }
        uiStore.stallingAbility = abilityKey;
        return;
    }

    let size = mainBar ? BAR_SIZE : EXTRA_BAR_SIZE;
    let idx = mainBar ? uiStore.bar.index : uiStore.extraActions.barIndex;

    if (idx >= size) {
        notifActions.showNotification('Sorry!','You\'re trying to add an ability after the end of the rotation.', 'error');
        return;
    }

    if (mainBar) {
        rotationStore.abilityBar[idx] = abilityKey;
    } else {
        rotationStore.extraActionBar[uiStore.extraActions.tick][idx] = toExtraAction(abilityKey);
    }
    // Immediate update for responsiveness
    calculateTotalDamageNew();
    refreshUI(false);
}

/**
 * Handles ability clicks for extra actions panel
 * @param {Event} event - The click event
 * @param {string} abilityKey - The key of the ability being clicked
 * @param {Object} stores - Object containing uiStore, rotationStore, notifActions
 * @param {Function} calculateTotalDamageNew - Function to recalculate damage
 * @param {Function} refreshUI - Function to refresh the UI
 */
export function handleAbilityClickExtra(event, abilityKey, stores, calculateTotalDamageNew, refreshUI) {
    handleAbilityClick(event, abilityKey, false, stores, calculateTotalDamageNew, refreshUI);
}

/**
 * Handles drag start events for abilities
 * @param {Event} event - The drag event
 * @param {string} ability - The ability being dragged
 */
export function handleDragStart(event, ability) {
    event.dataTransfer.setData('text/plain', ability);
}

/**
 * Handles drag start events for abilities already on the bar
 * @param {Event} event - The drag event
 * @param {string} ability - The ability being dragged
 * @param {number} startIndex - The starting index of the ability
 */
export function handleDragStartBar(event, ability, startIndex) {
    const dragData = JSON.stringify({ ability, startIndex });
    event.dataTransfer.setData('text/plain', dragData);
}

/**
 * Handles drop events on ability slots
 * @param {Event} event - The drop event
 * @param {number} index - The index where the ability is being dropped
 * @param {Object} stores - Object containing rotationStore, uiActions
 * @param {Function} refreshUI - Function to refresh the UI
 * @param {Function} calculateTotalDamageNew - Function to recalculate damage
 * @param {Object} allAbils - All available abilities
 */
export function handleDrop(event, index, stores, refreshUI, calculateTotalDamageNew, allAbils) {
    event.preventDefault();
    const { rotationStore, uiActions } = stores;

    const abilityKey = event.dataTransfer.getData('text/plain');
    if (allAbils[abilityKey]) {
        rotationStore.abilityBar[index] = abilityKey;
    } else {
        try {
            const dragObj = JSON.parse(event.dataTransfer.getData('text/plain'));
            const swapAbil = rotationStore.abilityBar[index];
            rotationStore.abilityBar[index] = dragObj.ability;
            rotationStore.abilityBar[dragObj.startIndex] = swapAbil;
        } catch (e) {
            console.error('Error parsing drag data:', e);
        }
    }
    uiActions.clearDragDrop();
    refreshUI();
    calculateTotalDamageNew();
}

/**
 * Allows drop events
 * @param {Event} event - The dragover event
 */
export function allowDrop(event) {
    event.preventDefault();
}

/**
 * Handles drag enter events for visual feedback
 * @param {Event} event - The dragenter event
 * @param {number} index - The index being hovered
 * @param {Object} stores - Object containing rotationStore, uiActions
 * @param {Object} allAbils - All available abilities
 */
export function handleDragEnter(event, index, stores, allAbils) {
    const { rotationStore, uiActions } = stores;

    uiActions.setDragDropHoveredSlot(index);
    uiActions.setDragDropValidSlot(true);

    let data = event.dataTransfer.getData('text/plain');
    if (!allAbils[data]) {
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
            if ((index - data.startIndex) <= 2 && index >= data.startIndex) {
                uiActions.setDragDropValidSlot(true);
                return;
            }
        } catch (e) {
            console.error('Error parsing drag data:', e);
        }
    }

    for (let i = index-1; i >= (index - 2); i--) {
        if (i < 0) return;
        if (rotationStore.abilityBar[i] != null) {
            uiActions.setDragDropValidSlot(false);
        }
    }
}

/**
 * Handles drag leave events
 * @param {Event} event - The dragleave event
 * @param {number} index - The index being left
 * @param {Object} stores - Object containing uiStore, uiActions
 */
export function handleDragLeave(event, index, stores) {
    const { uiStore, uiActions } = stores;

    if (uiStore.dragDrop.hoveredSlot === index) {
        uiActions.setDragDropHoveredSlot(null);
    }
}

/**
 * Handles left clicks on ability bar slots
 * @param {Event} event - The click event
 * @param {string} ability - The ability in the slot
 * @param {number} index - The index of the slot
 * @param {Object} stores - Object containing uiStore, rotationStore, uiActions
 * @param {Function} refreshUI - Function to refresh the UI
 */
export function handleBarLeftClick(event, ability, index, stores, refreshUI, calculateTotalDamageNew) {
    const { uiStore, rotationStore, uiActions } = stores;

    event.currentTarget.focus();

    if (uiStore.activeTool === ToolMode.Insert) {
        notifActions.showInputPrompt(
            'Insert Ticks',
            `Insert empty ticks before tick ${index}. Everything from tick ${index} onward will shift right.`,
            'Number of ticks (e.g. 3)',
            (value) => {
                const count = parseInt(value);
                if (count > 0) {
                    rotationActions.insertTicks(index, count);
                    refreshUI();
                    calculateTotalDamageNew();
                }
            }
        );
        return;
    }

    if (uiStore.activeTool === ToolMode.Null) {
        rotationStore.nulledTicks[index] = !rotationStore.nulledTicks[index];
        refreshUI();
        return;
    }

    if (uiStore.activeTool === ToolMode.Stall) {
        if (rotationStore.stalledAbilities[index]) {
            rotationStore.stalledAbilities[index] = null;
        } else if (uiStore.stallingAbility) {
            rotationStore.stalledAbilities[index] = uiStore.stallingAbility;
            uiActions.clearStallingAbility();
        } else {
            // Find the last non-null ability before this tick
            let stalledAbility = null;
            for (let i = index - 1; i >= 0; i--) {
                if (rotationStore.abilityBar[i]) {
                    stalledAbility = rotationStore.abilityBar[i];
                    break;
                }
            }
            if (stalledAbility) {
                rotationStore.stalledAbilities[index] = stalledAbility;
            }
        }
        refreshUI();
        return;
    }

    // Regular tool mode - handle extra actions panel
    if (!rotationStore.extraActionBar[index]){
        rotationStore.extraActionBar[index] = Array(EXTRA_BAR_SIZE).fill(null);
    }

    if (uiStore.extraActions.show) {
        if (index == uiStore.extraActions.tick) {
            uiActions.hideExtraActions();
        }
        else {
            uiActions.showExtraActions(index, ability);
        }
    }
    else {
        uiActions.showExtraActions(index, ability);
    }
}

/**
 * Handles right clicks on ability bar slots
 * @param {Event} event - The contextmenu event
 * @param {number} index - The index of the slot
 * @param {number} innerIdx - The inner index for extra actions (optional)
 * @param {Object} stores - Object containing rotationStore
 * @param {Function} refreshUI - Function to refresh the UI
 * @param {Function} calculateTotalDamageNew - Function to recalculate damage
 */
export function handleBarRightClick(event, index, innerIdx = null, stores, refreshUI, calculateTotalDamageNew) {
    const { rotationStore, uiStore } = stores;

    event.preventDefault();

    if (uiStore.activeTool === ToolMode.Insert) {
        notifActions.showInputPrompt(
            'Remove Ticks',
            `Remove ticks starting at tick ${index}. Everything after will shift left.`,
            'Number of ticks (e.g. 3)',
            (value) => {
                const count = parseInt(value);
                if (count > 0) {
                    rotationActions.removeTicks(index, count);
                    refreshUI();
                    calculateTotalDamageNew();
                }
            }
        );
        return;
    }

    if (innerIdx != null) {
        rotationStore.extraActionBar[index][innerIdx] = null;
    }
    else {
        rotationStore.abilityBar[index] = null;
    }
    refreshUI();
    calculateTotalDamageNew();
}

/**
 * Handles keyboard events
 * @param {Event} event - The keydown event
 * @param {Object} stores - Object containing uiActions
 */
export function handleKeypress(event, stores) {
    const { uiActions } = stores;
    uiActions.handleKeypress(event);
}

/**
 * Clears the entire rotation
 * @param {Object} stores - Object containing rotationStore
 * @param {Function} refreshUI - Function to refresh the UI
 * @param {Function} calculateTotalDamageNew - Function to recalculate damage
 */
export function clearRotation(stores, refreshUI, calculateTotalDamageNew) {
    const { rotationStore } = stores;

    rotationStore.abilityBar = Array(BAR_SIZE).fill(null);
    rotationStore.extraActionBar = Array(BAR_SIZE).fill(null);
    rotationStore.nulledTicks = Array(BAR_SIZE).fill(false);
    rotationStore.stalledAbilities = Array(BAR_SIZE).fill(null);
    rotationStore.totalDamage = 0;

    // Reset stacks
    for (let i = 0; i < BAR_SIZE; i++) {
        rotationStore.stacks['icy chill stacks'].stackTicks[i] = 0;
        rotationStore.stacks['perfect equilibrium stacks'].stackTicks[i] = 0;
    }

    // Reset buffs
    for (let key in rotationStore.buffs) {
        if (Object.hasOwnProperty.call(rotationStore.buffs, key)) {
            rotationStore.buffs[key].buffTicks = Array(BAR_SIZE).fill(0);
        }
    }

    refreshUI();
    calculateTotalDamageNew();
}

/**
 * Refreshes the UI by updating pointers, recalculating stacks, and recalculating buff bars
 * @param {boolean} calcDmg - Whether to recalculate damage
 * @param {Object} stores - Object containing uiStore, rotationStore, uiActions
 * @param {Function} calculateTotalDamageNew - Function to recalculate damage
 */
export function refreshUI(calcDmg = true, stores, calculateTotalDamageNew) {
    const { uiStore, rotationStore, uiActions } = stores;

    // UI Constants
    const BASE_BAR_ROW_GAP = 30;
    const stackFontSize = 10;
    const stackPadding = 2;
    const buffLineHeight = 6;

    //Update ability bar pointer
    uiActions.updateBarLastIndex(0);
    for (let i = 0; i < BAR_SIZE; i++) {
        if (rotationStore.abilityBar[i] != null) {
            uiActions.updateBarLastIndex(i);
        }
    }
    uiActions.updateBarIndex(uiStore.bar.lastIndex);
    const lastIdx = uiStore.bar.lastIndex;
    const meta = rotationStore.tickMetadata?.[lastIdx];
    if (meta) {
        // Use pipeline-resolved duration (accounts for gear swaps, Tumeken's, etc.)
        uiActions.updateBarIndex(lastIdx + meta.duration);
    } else if (rotationStore.abilityBar[lastIdx]) {
        // Fallback: read duration from static ability data
        const abilToAdd = abils[rotationStore.abilityBar[lastIdx]];
        uiActions.updateBarIndex(lastIdx + (abilToAdd?.['duration'] || 3));
    }

    //Update extra action bar pointer
    uiStore.extraActions.barIndex = 0;
    if (uiStore.extraActions.show && rotationStore.extraActionBar[uiStore.extraActions.tick]) {
        const extraBar = rotationStore.extraActionBar[uiStore.extraActions.tick];
        for (let i = 0; i < EXTRA_BAR_SIZE; i++) {
            if (extraBar[i] == null) {
                uiStore.extraActions.barIndex = i;
                break;
            }
            // If all slots are filled, point past the end
            if (i === EXTRA_BAR_SIZE - 1) {
                uiStore.extraActions.barIndex = EXTRA_BAR_SIZE;
            }
        }
    }

    //Handle stacks
    let i = 0;
    uiActions.updateBarRowGap(BASE_BAR_ROW_GAP);
    for (let key in rotationStore.stacks) {
        let displaySetting = rotationStore.stacks[key]['displaySetting'];
        let disp = stores.settingsStore.settings[displaySetting];
        // Only show stacks that are toggled on AND have at least one non-zero value
        const hasNonZero = rotationStore.stacks[key].stackTicks?.some(v => v !== 0);
        if (disp['value'] && hasNonZero) {
            rotationStore.stacks[key]['idx'] = i;
            uiActions.updateBarRowGap(uiStore.bar.rowGap + (stackFontSize + stackPadding));
            i++;
        } else {
            rotationStore.stacks[key]['idx'] = -1;
        }
    }

    //handle buff indicator bars
    i = 0;
    uiActions.updateBarLineGap(0);
    for (let key in rotationStore.buffs) {
        if (rotationStore.buffs[key].activeRows && rotationStore.buffs[key].activeRows.length > 0) {
            rotationStore.buffs[key].idx = i;
            uiActions.updateBarRowGap(uiStore.bar.rowGap + buffLineHeight);
            uiActions.updateBarLineGap(uiStore.bar.lineGap + buffLineHeight);
            i++;
        } else {
            rotationStore.buffs[key].idx = -1;
        }
    }

    if (calcDmg) {
        calculateTotalDamageNew();
    }
}

/**
 * Calculates total damage using the new damage calculator
 * @param {Object} stores - Object containing rotationStore, settingsStore
 */
export function calculateTotalDamageNew() {

    logger.log(LogCategory.ROTATION, 'Starting damage calculation...');
    logger.log(LogCategory.ROTATION, 'Settings store initialized:', settingsStore.initialized);
    logger.log(LogCategory.ROTATION, 'Settings store settings:', settingsStore.settings);
    logger.log(LogCategory.ROTATION, 'Rotation store ability bar:', rotationStore.abilityBar);

    const dmgResult = calculateTotalDamage(BAR_SIZE);

    logger.log(LogCategory.ROTATION, 'Damage calculation result:', dmgResult);

    rotationStore.totalDamage = dmgResult.regularDamage;
    rotationStore.poisonDamage = dmgResult.poisonDamage;
    rotationStore.familiarDamage = dmgResult.familiarDamage;
    rotationStore.dreadnipDamage = dmgResult.dreadnipDamage || 0;
    rotationStore.conjureDamage = dmgResult.conjureDamage || 0;
    rotationStore.distributionStats = dmgResult.distributionStats;
    rotationStore.poisonPerTick = dmgResult.poisonPerTick || [];
    rotationStore.familiarPerTick = dmgResult.familiarPerTick || [];
    rotationStore.dreadnipPerTick = dmgResult.dreadnipPerTick || [];
    rotationStore.conjurePerTick = dmgResult.conjurePerTick || [];
    rotationStore.phaseTransitions = dmgResult.phaseTransitions || [];
    rotationStore._finalState = dmgResult._finalState;
    rotationStore._finalSettings = dmgResult._finalSettings;
    rotationStore.tickMetadata = dmgResult.tickMetadata || {};

    // Calculate Gaussian parameters for more accurate damage modeling
    const gaussianParams = calculateGaussianParameters(rotationStore.distributionStats);
    logger.log(LogCategory.ROTATION, 'Total Damage = ' + rotationStore.totalDamage +
        ' (Poison Damage = ' + rotationStore.poisonDamage + '; ' +
        'Familiar Damage = ' + rotationStore.familiarDamage + ')' +
        ' | Gaussian Model: Mean = ' + Math.round(gaussianParams.mean) +
        ', StdDev = ' + Math.round(gaussianParams.stdDev)
    );
}