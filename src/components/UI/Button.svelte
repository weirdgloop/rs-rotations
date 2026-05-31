<script>
    export let onClick = () => {};
    export let variant = 'primary'; // 'primary', 'secondary', 'danger', 'success'
    export let size = 'medium'; // 'small', 'medium', 'large'
    export let disabled = false;
    export let title = '';

    // Variant styles
    const variants = {
        primary: 'bg-[#171d21] text-[#c2ba9e] border border-[#c2ba9e] hover:bg-[#1f282d] ',
        reset: 'bg-[#171d21] text-[#c2ba9e] border border-[#c2ba9e] hover:bg-red-700/40'
    };

    // Size styles
    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg'
    };

    $: buttonClasses = `
        ${variants[variant]}
        ${sizes[size]}
        font-family:roboto, sans-serif;
        font-semibold
        rounded-md
        transition-all
        duration-200
        ease-in-out
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-[#c2ba9e]/50
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:transform-none
        cursor-pointer
        select-none
        inline-flex
        items-center
        justify-center
        min-w-fit
        whitespace-nowrap
        mb-0
    `.trim().replace(/\s+/g, ' ');
</script>

<button
    class={buttonClasses}
    on:click={onClick}
    {disabled}
    {title}
>
    <slot />
</button>