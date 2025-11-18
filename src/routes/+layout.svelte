<script lang="ts">
	import "../app.css";

	import favicon from "$lib/assets/favicon.svg";
	import MainNav from "$lib/components/MainNav.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Strava Sveltekit Zero</title>
</svelte:head>

<main>
	<MainNav />

	{@render children()}
</main>

<style>
	main {
		border: 2px solid greenyellow;
		height: stretch;
		width: 800px;
		margin-inline: auto;
	}
</style>
