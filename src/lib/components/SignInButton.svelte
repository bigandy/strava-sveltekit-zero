<script lang="ts">
    import { signIn } from "$lib/auth-client";
    import Button from "$lib/components/Button.svelte";

    const handleClick = async () => {
        await signIn.oauth2({
            providerId: "strava",
            requestSignUp: false,
        });
    };
</script>

<Button onclick={handleClick}>Sign In</Button>
