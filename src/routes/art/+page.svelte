<script lang="ts">
  import { getArt } from '$lib/content';
  import type { Art } from '$lib/content';
  import ArtCard from '$components/ArtCard.svelte';
  let items: Art[] = [];
  $: (async () => { items = await getArt(); })();
</script>

<h1 class="text-2xl font-bold mb-6">Umění</h1>
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {#each items as a}
    <ArtCard title={a.title} image={a.image} year={a.year} slug={a.slug} />
  {/each}
</div>