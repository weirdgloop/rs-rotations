<script>
    import { createEventDispatcher } from 'svelte';
    import Button from './Button.svelte';

    const dispatch = createEventDispatcher();

    // Props
    export let show = false;
    export let title = '';
    export let message = '';
    export let type = 'info'; // 'info', 'warning', 'error', 'success'
    export let confirmText = 'Confirm';
    export let cancelText = 'Cancel';

    // Auto-determined props based on type
    $: showCancel = type !== 'success' && type !== 'error';
    $: showConfirm = type !== 'success' && type !== 'error';
    $: autoClose = type === 'success';
    $: autoCloseDelay = 4000;

    // Type-specific styles
    const typeStyles = {
        info: {
            borderColor: '#c2ba9e',
            icon: 'ℹ️'
        },
        warning: {
            borderColor: '#fbbf24',
            icon: '⚠️'
        },
        error: {
            borderColor: '#ef4444',
            icon: '❌'
        },
        success: {
            borderColor: '#10b981',
            icon: '✅'
        }
    };

    let currentType = typeStyles[type];
    let isClosing = false;

    // Auto-close functionality
    let autoCloseTimer;

    $: if (show && autoClose && !showCancel) {
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
        autoCloseTimer = setTimeout(() => {
            close();
        }, autoCloseDelay);
    }

    $: if (type && typeStyles[type]) {
        currentType = typeStyles[type];
    }

    function close() {
        if (type === 'success') {
            // For success notifications, start fade-out animation
            isClosing = true;
            setTimeout(() => {
                show = false;
                isClosing = false;
                dispatch('close');
            }, 400); // Match the animation duration
        } else {
            // For other types, close immediately
            show = false;
            dispatch('close');
        }

        if (autoCloseTimer) {
            clearTimeout(autoCloseTimer);
            autoCloseTimer = null;
        }
    }

    function confirm() {
        dispatch('confirm');
        close();
    }

    function cancel() {
        dispatch('cancel');
        close();
    }

    function handleOverlayClick(event) {
        if (event.target === event.currentTarget) {
            close();
        }
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') {
            close();
        } else if (event.key === 'Enter' && showConfirm) {
            confirm();
        }
    }
</script>

{#if show}
    <div
        class="popup-overlay {type === 'success' ? 'popup-overlay-bottom-right' : ''}"
        on:click={handleOverlayClick}
        on:keydown={handleKeydown}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        aria-describedby="popup-message"
    >
        <div
            class="popup-content {type === 'success' ? 'popup-content-bottom-right' : ''} {isClosing ? 'popup-content-closing' : ''}"
            style="border-left-color: {currentType.borderColor}"
        >
            <div class="popup-header">
                <div class="popup-title-section">
                    <span class="popup-icon">{currentType.icon}</span>
                    <h2 id="popup-title" class="popup-title">{title}</h2>
                </div>
                {#if type !== 'success'}
                    <button
                        class="popup-close-btn"
                        on:click={close}
                        aria-label="Close dialog"
                    >
                        ×
                    </button>
                {/if}
            </div>

            {#if message}
                <div id="popup-message" class="popup-message">
                    {message}
                </div>
            {/if}

            <div class="popup-content-slot">
                <slot />
            </div>

            {#if showConfirm || showCancel}
                <div class="popup-actions">
                    {#if showCancel}
                        <Button
                            onClick={cancel}
                            variant="secondary"
                            size="medium"
                        >
                            {cancelText}
                        </Button>
                    {/if}
                    {#if showConfirm}
                        <Button
                            onClick={confirm}
                            variant="primary"
                            size="medium"
                        >
                            {confirmText}
                        </Button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        backdrop-filter: blur(2px);
    }

    .popup-overlay-bottom-right {
        background: transparent;
        backdrop-filter: none;
        justify-content: flex-end;
        align-items: flex-end;
        pointer-events: none;
    }

    .popup-content {
        background: #171d21;
        border-left: 8px solid;
        border-radius: 8px;
        padding: 1.5rem;
        min-width: 400px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        animation: popupSlideIn 0.2s ease-out;
    }

    .popup-content-bottom-right {
        min-width: 300px;
        max-width: 400px;
        margin: 1rem;
        pointer-events: auto;
        animation: popupSlideInBottomRight 0.4s ease-out;
    }

    .popup-content-closing {
        animation: popupFadeOut 0.4s ease-in forwards;
    }

    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .popup-title-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .popup-icon {
        font-size: 1.25rem;
        line-height: 1;
    }

    .popup-title {
        font-family: Kumbh Sans, sans-serif;
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #b2dbee;
        margin: 0;
    }

    .popup-close-btn {
        background: none;
        border: none;
        color: #c2ba9e;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.2s ease;
        margin-left: 0.5rem;
    }

    .popup-close-btn:hover {
        background: rgba(194, 186, 158, 0.1);
        color: #fff;
    }

    .popup-message {
        color: #b2dbee;
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 1rem;
    }

    .popup-content-slot {
        margin-bottom: 1rem;
    }

    .popup-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }

    @keyframes popupSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes popupSlideInBottomRight {
        from {
            opacity: 0;
            transform: translateX(100%) translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
        }
    }

    @keyframes popupFadeOut {
        from {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateX(100%) translateY(20px) scale(0.95);
        }
    }

    @media (max-width: 640px) {
        .popup-content {
            min-width: 90vw;
            margin: 1rem;
        }

        .popup-content-bottom-right {
            min-width: calc(100vw - 2rem);
            max-width: calc(100vw - 2rem);
            margin: 1rem;
        }

        .popup-actions {
            flex-direction: column;
        }

        .popup-actions > :global(*) {
            width: 100%;
        }
    }
</style>