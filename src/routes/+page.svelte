<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import Button from "$lib/components/Button.svelte";
    import SignInButton from "$lib/components/SignInButton.svelte";

    const session = authClient.useSession();

    $effect(() => {
        console.log({ data: $session.data });
    });
</script>

<div
    class="min-h-[80vh] flex items-center justify-center overflow-hidden no-visible-scrollbar px-6 md:px-0"
>
    <main class="flex flex-col gap-4 row-start-2 items-center justify-center">
        <div class="flex flex-col gap-1">
            <h3
                class="font-bold text-4xl text-black dark:text-white text-center"
            >
                Better Auth.
            </h3>

            <div class=" mt-2 mx-auto">
                {#if $session.data}
                    <Button
                        className="rounded-none"
                        onclick={async () => {
                            await authClient.signOut();
                        }}>Sign Out</Button
                    >
                    <h2>{$session.data.user.name}</h2>
                    <img
                        src={$session.data.user?.image}
                        height="124"
                        width="124"
                        class="rounded-sm my-4"
                        alt="user avatar"
                    />
                {:else}
                    <SignInButton />
                {/if}
            </div>
        </div>
    </main>
</div>
