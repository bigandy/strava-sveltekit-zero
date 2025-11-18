<script lang="ts">
    import ActivitiesTable from "$lib/components/ActivitiesTable.svelte";
    import Button from "$lib/components/Button.svelte";
    import {
        getActivities,
        fetchLatestActivities,
        deleteStravaActivities,
        fetchAllStravaActivities,
    } from "./data.remote";

    const getLatestActivities = async () => {
        console.log("get some activities please");

        await fetchLatestActivities();

        // finally need to refresh the query
        getActivities().refresh();
    };

    const deleteActivities = async () => {
        await deleteStravaActivities();

        getActivities().refresh();
    };

    const getAllStravaActivities = async () => {
        await fetchAllStravaActivities();

        getActivities().refresh();
    };

    import { z } from "$lib/zero.svelte";
    // import { activities } from "$lib/server/db/schema";
    // Basic: always enabled; materializes immediately
    const zActivities = z.createQuery(
        z.query.activities.orderBy("start", "desc"),
    );
</script>

<p>Lets get some activities!</p>

<Button onclick={getLatestActivities}>Get Lastest Activities from strava</Button
>

<Button onclick={getAllStravaActivities}>Get All Strava Activities</Button>

<Button onclick={deleteActivities}>Delete Activities</Button>

<!-- <svelte:boundary>
    {@const activities = await getActivities()}

    <ActivitiesTable {activities} />

    {#snippet pending()}
        <div>LOADING...</div>
    {/snippet}
</svelte:boundary> -->

<svelte:boundary>
    {@const activities = await zActivities.data}

    <p>Activities Count: {activities.length}</p>

    <ActivitiesTable {activities} />

    {#snippet pending()}
        <div>LOADING...</div>
    {/snippet}
</svelte:boundary>
