<script lang="ts">
  import { getTexty } from '$lib/content';
  import type { Text } from '$lib/content';
  import TextCard from '$components/TextCard.svelte';
  let items: Text[] = [];
  $: (async () => { items = await getTexty(); })();
</script>

<h1 class="text-2xl font-bold mb-6">Texty</h1>
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {#each items as t}
    <TextCard title={t.title} type={t.type} slug={t.slug} />
  {/each}
</div>

