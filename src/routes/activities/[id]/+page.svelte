<script lang="ts">
    import { getActivity } from "../data.remote";

    import type { PageProps } from "./$types";

    let { params }: PageProps = $props();
</script>

<p>Show the activity corresponding to {params.id}</p>

<svelte:boundary>
    {@const activity = await getActivity(params.id)}
    <ul>
        <li>
            {activity.name}
        </li>
    </ul>
</svelte:boundary>
