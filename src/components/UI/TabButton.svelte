<script>
    export let isActive = false;
    export let onClick = () => {};
    export let label = '';
    export let id = '';
    export let badge = '';

    // Color mapping for different tab types
    const colorMap = {
        'ranged': {
            active: 'text-green-500',
            hover: 'hover:text-green-400/80',
            activePress: 'active:text-green-600'
        },
        'magic': {
            active: 'text-blue-500',
            hover: 'hover:text-blue-400/80',
            activePress: 'active:text-blue-600'
        },
        'melee': {
            active: 'text-red-500',
            hover: 'hover:text-red-400/80',
            activePress: 'active:text-red-600'
        },
        'necro': {
            active: 'text-violet-500',
            hover: 'hover:text-violet-400/80',
            activePress: 'active:text-violet-600'
        },
        'defence': {
            active: 'text-green-300',
            hover: 'hover:text-gray-200',
            activePress: 'active:text-gray-400'
        },
        // Settings tabs
        'general': {
            active: 'text-cyan-500',
            hover: 'hover:text-cyan-400/80',
            activePress: 'active:text-cyan-600'
        },
        'bosses': {
            active: 'text-amber-500',
            hover: 'hover:text-amber-400/80',
            activePress: 'active:text-amber-600'
        },
        'equipment': {
            active: 'text-pink-500',
            hover: 'hover:text-pink-400/80',
            activePress: 'active:text-pink-600'
        },
        // Default fallback
        'default': {
            active: 'text-fuchsia-500',
            hover: 'hover:text-[#968A5C]',
            activePress: 'active:text-[#968A5C]'
        }
    };

    $: colors = colorMap[id] || colorMap['default'];
</script>

<li class="grow me-2">
    <button
        on:click={onClick}
        class:text-green-500={isActive && id === 'ranged'}
        class:text-blue-500={isActive && id === 'magic'}
        class:text-red-500={isActive && id === 'melee'}
        class:text-violet-500={isActive && id === 'necro'}
        class:text-gray-200={isActive && id === 'defence'}
        class:text-cyan-500={isActive && id === 'general'}
        class:text-amber-500={isActive && id === 'bosses'}
        class:text-pink-500={isActive && id === 'equipment'}
        class:text-[#968A5C]={isActive && !['ranged', 'magic', 'melee', 'necro', 'defence', 'general', 'equipment', 'bosses'].includes(id)}
        class="text-[#C2BA9E] font-bold text-2xl text-link uppercase inline-block {colors.activePress} active:scale-95 transition-all duration-200 ease-in-out {!isActive ? colors.hover : ''}"
    >{label}{#if badge}<sup class="text-xs opacity-60 ml-0.5">{badge}</sup>{/if}</button>
</li>