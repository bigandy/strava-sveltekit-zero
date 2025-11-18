<script lang="ts">
    import type { Snippet } from "svelte";
    import clsx from "clsx";

    type Props = {
        loading?: boolean;
        className?: string;
        onclick: () => void;
        onkeydown?: () => void;
        children: Snippet;
    };

    let { loading, className, onclick, onkeydown, children }: Props = $props();
</script>

<button
    {onclick}
    {onkeydown}
    class={clsx(
        `bg-strava hover:bg-strava-hover p-4 rounded-sm text-white cursor-pointer disabled:bg-red-100  ${className}`,
        {
            "bg-red-200": loading,
        },
    )}
>
    {@render children?.()}
</button>
