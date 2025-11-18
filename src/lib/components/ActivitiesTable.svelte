<script lang="ts">
    import { goto } from "$app/navigation";
    type Props = {
        activities: Array<any>;
    };
    import { columns } from "./activities-utils";
    let { activities }: Props = $props();

    console.log({ columns });

    const handleRowClick = (id: string) => {
        // console.log("clicked on row", id);
        goto(`/activities/${id}`);
    };
</script>

<table class="w-full activities-table" style={"tableLayout: fixed"}>
    <thead>
        <tr>
            {#each columns as column}
                <th>{column.header}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each activities as activity}
            <tr
                onclick={() => handleRowClick(activity.id)}
                class="cursor-pointer"
            >
                {#each columns as column}
                    <td>{activity[column.accessorKey]}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
