<script lang="ts">
    import ActivitiesTable from "$lib/components/ActivitiesTable.svelte";
    import Button from "$lib/components/Button.svelte";
    import {
        getActivities,
        fetchLatestActivities,
        deleteStravaActivities,
    } from "./data.remote";

    const fetchActivities = async () => {
        console.log("get some activities please");

        await fetchLatestActivities();

        // finally need to refresh the query
        getActivities().refresh();
    };

    const deleteActivities = async () => {
        await deleteStravaActivities();

        getActivities().refresh();
    };
</script>

<p>Lets get some activities!</p>

<Button onclick={fetchActivities}>Get Activities from strava</Button>
<Button onclick={deleteActivities}>Delete Activities</Button>

<svelte:boundary>
    {@const activities = await getActivities()}

    <ActivitiesTable {activities} />

    {#snippet pending()}
        <div>LOADING...</div>
    {/snippet}
</svelte:boundary>
