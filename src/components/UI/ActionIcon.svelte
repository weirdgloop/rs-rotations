<script>
    import { getGearBadge } from '$lib/utils/gearVariants';
    import { getEquipmentIcon } from '$lib/data/equipment';

    let {
        /** The item/ability key or icon path */
        value = 'none',
        /** Icon source — if provided, used directly instead of resolving from value+folder */
        src = '',
        /** Gear icon folder (only used when src is not provided) */
        folder = 'shared',
        /** Fallback icon path */
        fallback = '',
        /** Size preset: 'xsm' (20px), 'sm' (24px), 'md' (30px), 'lg' (36px) */
        size = 'md',
        /** Show active state (green border) */
        active = false,
        /** Custom border colour (overrides active state) */
        borderColor = '',
        /** Bare mode: just image + badge, no button wrapper */
        bare = false,
        /** Action type: 'gear' shows variant badges, others don't */
        type = 'gear',
        /** Custom badge text (e.g. perk rank). Overrides auto-detected gear badge. */
        badgeText = '',
        /** Tooltip text */
        title = '',
        onclick = undefined,
        oncontextmenu = undefined,
        ondragstart = undefined,
        draggable = false,
    } = $props();

    const sizes = {
        xsm: { icon: 20, badge: 14, pad: 2 },
        sm: { icon: 24, badge: 14, pad: 2 },
        md: { icon: 30, badge: 14, pad: 4 },
        lg: { icon: 36, badge: 16, pad: 4 },
    };

    let s = $derived(sizes[size] || sizes.md);

    let iconSrc = $derived.by(() => {
        if (src) return src;
        if (!value || value === 'none') return fallback;
        if (type === 'gear') {
            return getEquipmentIcon(value, fallback);
        }
        return fallback;
    });

    let fallbackSrc = $derived.by(() => {
        if (!value || value === 'none' || type !== 'gear') return fallback;
        return getEquipmentIcon(value, fallback);
    });

    // Badge: custom badgeText takes priority, then gear variant auto-detection
    let badge = $derived(
        badgeText ? { text: badgeText } :
        type === 'gear' ? getGearBadge(value) : null
    );

    let errorAttempt = $state(0);
    $effect(() => { iconSrc; errorAttempt = 0; });

    function handleError(e) {
        errorAttempt++;
        if (errorAttempt === 1 && fallbackSrc && fallbackSrc !== iconSrc) {
            e.target.src = fallbackSrc;
        } else if (errorAttempt <= 2 && fallback && fallback !== fallbackSrc && fallback !== iconSrc) {
            e.target.src = fallback;
        }
        // else: give up, leave broken image — no more retries
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if bare}
<span class="action-icon-bare" style="position: relative; display: inline-flex;">
    <img
        src={iconSrc}
        alt={title}
        style="width: {s.icon}px; height: {s.icon}px;"
        class="action-icon-img"
        onerror={handleError}
    />
    {#if badge?.img}
        <img src={badge.img} alt="" class="action-icon-badge-img" style="width: {s.badge}px; height: {s.badge}px;" />
    {:else if badge?.text}
        <span class="action-icon-badge-text" style="font-size: {s.badge * 0.6}px;">{badge.text}</span>
    {/if}
</span>
{:else}
<button
    class="action-icon"
    class:action-icon-active={active && !borderColor}
    style="padding: {s.pad}px;{borderColor ? ` border-color: ${borderColor};` : ''}"
    {title}
    {onclick}
    {oncontextmenu}
    type="button"
>
    <img
        src={iconSrc}
        alt={title}
        style="width: {s.icon}px; height: {s.icon}px;"
        class="action-icon-img"
        onerror={handleError}
        draggable={draggable ? 'true' : 'false'}
        {ondragstart}
    />
    {#if badge?.img}
        <img
            src={badge.img}
            alt=""
            class="action-icon-badge-img"
            style="width: {s.badge}px; height: {s.badge}px;"
        />
    {:else if badge?.text}
        <span
            class="action-icon-badge-text"
            style="font-size: {s.badge * 0.6}px;"
        >{badge.text}</span>
    {/if}
</button>
{/if}

<style>
    .action-icon {
        position: relative;
        border: 2px solid transparent;
        border-radius: 6px;
        opacity: 1.0;
        cursor: pointer;
        transition: all 0.15s ease;
        background: rgba(255, 255, 255, 0.0);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .action-icon:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .action-icon-active {
        opacity: 1;
        border-color: #4ade80;
    }

    .action-icon-img {
        object-fit: contain;
        filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
    }

    .action-icon-badge-img {
        filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.8));
        position: absolute;
        bottom: -2px;
        right: -2px;
        border-radius: 3px;
        pointer-events: none;
    }

    .action-icon-badge-text {
        position: absolute;
        bottom: -2px;
        right: -2px;
        font-weight: bold;
        color: white;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 3px;
        padding: 0 3px;
        line-height: 1.2;
        pointer-events: none;
    }
</style>
