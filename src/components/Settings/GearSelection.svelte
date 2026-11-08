<script>
    import QuiverSetup from './QuiverSetup.svelte';
    import { weaponSelectionUpdates } from '$lib/data/equipmentSlots';
    import EquipmentSlots from './EquipmentSlots.svelte';
    import { settingsActions } from '$lib/stores/settingsStore.svelte.js';
    import { weapons } from '$lib/data/weapons';
    let { settings, styleTab, updateDamages, openDropdown = $bindable(null), gearFilter, onFilterChange } = $props();
    let values = $derived.by(() => {
        const result = Object.fromEntries(Object.entries(settings).map(([key, entry]) => [key, entry?.value]));
        const prefix = styleTab === 'necromancy' ? 'necro' : styleTab;
        const mh = `${prefix} main-hand weapon`;
        if (result[`weapon type ${prefix}`] === 'two-hand' && weapons[result[mh]]?.['weapon type'] !== 'two-hand') result[mh] = result[`${prefix} two-hand weapon`];
        return result;
    });
    function select(action) {
        settings[action.slot] ??= {value:'none'};
        settings[action.slot].value = action.value;
        settings._gearInstances ??= {value:{}};
        settings._gearInstances.value[action.slot] = {itemKey:action.value, instanceId:action.instanceId, instanceIndex:action.instanceIndex, label:action.label, perks:action.perks};
        for (const [key, value] of Object.entries(weaponSelectionUpdates(action.slot, action.value))) {
            settings[key] ??= {value}; settings[key].value = value;
            if (key.endsWith('weapon')) settings._gearInstances.value[key] = {...settings._gearInstances.value[action.slot]};
        }
        settingsActions.saveSettings(); updateDamages();
    }
</script>
<EquipmentSlots {values} instances={settings._gearInstances?.value ?? {}} style={styleTab} onselect={select} />

{#if styleTab === "ranged"}<QuiverSetup {settings} onchange={updateDamages} />{/if}
