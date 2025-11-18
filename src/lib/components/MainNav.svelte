<script lang="ts">
    import { page } from "$app/state";

    const currentPage = page.url.pathname;

    const pages = [
        {
            url: "/",
            title: "Home",
        },
        {
            url: "/about",
            title: "About",
        },
        {
            url: "/activities",
            title: "Activities",
        },
    ];
</script>

<nav>
    {#each pages as { url, title } (url)}
        <a href={url} class={`${currentPage === url && "underline"}`}>
            {title}
        </a>
    {/each}
</nav>
