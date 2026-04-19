<script>
    import {
        FlexRender,
        createTable,
        getCoreRowModel,
        getSortedRowModel
    } from '@tanstack/svelte-table';
    import { ownedItemsStore } from '$lib/stores/ownedItemsStore.svelte.js';
    import PillToggle from '$components/UI/PillToggle.svelte';
    import AbilityOwnershipModal from './AbilityOwnershipModal.svelte';

    let { data, columns, style = 'magic' } = $props();
    let showOwnershipModal = $state(false);

    let abilityFilter = $state('popular');
    let sorting = $state([]);

    let filteredData = $derived(
        abilityFilter === 'all' ? data :
        abilityFilter === 'owned' ? data.filter(d => ownedItemsStore.ownedAbilities.has(d.key)) :
        data.filter(d => d.common !== false)
    );

    const setSorting = updater => {
        if (updater instanceof Function) {
            sorting = updater(sorting);
        } else {
            sorting = updater;
        }
        options = {
            ...options,
            state: {
                ...options.state,
                sorting
            }
        };
    };

    let options = $derived({
        data: filteredData,
        columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    let table = $derived(createTable(options));

    async function copyCSV() {
        let csv = '';
        csv += columns.map(col => col.header).join(',') + '\n';
        table.getRowModel().rows.forEach(row => {
            csv += columns.map((col, index) => index === 0 ? row.original[col.accessorKey].title : row.original[col.accessorKey]).join(',') + '\n';
        });

        try {
            await navigator.clipboard.writeText(csv);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
</script>

<div class="flex items-center justify-end mb-2 gap-2">
    <button
        class="edit-owned-btn"
        onclick={() => showOwnershipModal = true}
        title="Edit owned abilities"
    >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    </button>
    <PillToggle bind:value={abilityFilter} />
</div>

<AbilityOwnershipModal bind:show={showOwnershipModal} {style} />

<table class="w-full">
    <thead>
    {#each table.getHeaderGroups() as headerGroup}
        <tr>
            {#each headerGroup.headers as header}
                <th colSpan={header.colSpan}>
                    {#if !header.isPlaceholder}
                        <button
                            class:cursor-pointer={header.column.getCanSort()}
                            class:select-none={header.column.getCanSort()}
                            onclick={header.column.getToggleSortingHandler()}
                        >
                            <FlexRender content={header.column.columnDef.header} context={header.getContext()}/>
                            {#if header.column.getIsSorted().toString() === 'asc'}
                                🔼
                            {:else if header.column.getIsSorted().toString() === 'desc'}
                                🔽
                            {/if}
                        </button>
                    {/if}
                </th>
            {/each}
        </tr>
    {/each}
    </thead>
    <tbody>
    {#each table.getRowModel().rows as row}
        <tr>
            {#each row.getVisibleCells() as cell}
                <td {...cell.column.columnDef.meta}>
                    <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                </td>
            {/each}
        </tr>
    {/each}
    </tbody>
    <tfoot>
    {#each table.getFooterGroups() as footerGroup}
        <tr>
            {#each footerGroup.headers as header}
                <th colSpan={header.colSpan}>
                    {#if !header.isPlaceholder}
                        <FlexRender content={header.column.columnDef.footer} context={header.getContext()}/>
                    {/if}
                </th>
            {/each}
        </tr>
    {/each}
    </tfoot>
</table>

<button onclick={copyCSV}>
    <img class="w-auto h-[64px]" src="/csv.png" alt="copy-to-csv" />
</button>

<style>
    .edit-owned-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: #888;
        background: transparent;
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    .edit-owned-btn:hover {
        color: #ccc;
        border-color: #777;
    }
</style>
