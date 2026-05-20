<script>
    let { img, icon, text, textColour = 'text-white', shadow = false } = $props();
</script>

<header
    class="flex items-center bg-center bg-cover relative z-0 h-32 md:h-80 mt-0"
    style="background-image:url({img})"
>
    <div class="responsive-container">
        <h1 class="{textColour} text-2xl md:text-4xl xl:text-6xl font-semibold ml-8 mb-0 {shadow ? 'banner-text' : ''}">
            {#if icon}
                <img class="inline w-auto h-[40px] md:h-[128px]" src={icon} alt="" />
            {/if}
            {text}
        </h1>
    </div>
</header>

<style>
    .banner-text {
        text-shadow: 0 4px 20px rgba(94, 0, 63, 0.95), 0 0 8px rgb(0, 0, 0, 0.95);
        font-weight: 700;
        animation: pulse 24s infinite;
    }

    @keyframes pulse {
        0% {
            color: #b2dbee;
            opacity: 1;
        }

        20% {
            color: var(--color-magic);
            opacity: 1;
        }
        40% {
            color: var(--color-necro);
            opacity: 0.9;
        }
        60% {
            color: var(--color-melee);
            opacity: 1;
        }
        80% {
            color: var(--color-ranged);
            opacity: 1;
        }
        100% {
            color: #b2dbee;
            opacity: 1;
        }
    }
</style>