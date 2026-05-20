<script>
    export let marginTop = '1.0rem';
    export let marginBottom = '1.0rem';
    export let color = '156, 163, 175'; // RGB values for gray-400
    export let opacity = '0.4';
    export let height = '1px';
</script>

<div
    class="gradient-separator"
    style="
        margin-top: {marginTop};
        margin-bottom: {marginBottom};
        height: {height};
        background: linear-gradient(to right, transparent, rgba({color}, {opacity}), transparent);
    "
></div>

<style>
    .gradient-separator {
        position: relative;
    }
</style>