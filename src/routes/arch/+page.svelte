<script lang="ts">
  import { getArch } from '$lib/content';
  import type { Arch } from '$lib/content';
  import ArchCard from '$components/ArchCard.svelte';
  let items: Arch[] = [];
  $: (async () => { items = await getArch(); })();
</script>

<h1 class="text-3xl font-bold mb-6">Instalace</h1>
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {#each items as a}
    <ArchCard title={a.title} image={a.image} year={a.year} slug={a.slug} />
  {/each}
</div>
