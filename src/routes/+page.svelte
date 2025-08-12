<script lang="ts">
  import { getPeople, getArt } from '$lib/content';
  import type { Person, Art } from '$lib/content';
  import PersonCard from '$components/PersonCard.svelte';
  import ArtCard from '$components/ArtCard.svelte';
    import ArchCard from '$components/ArchCard.svelte';

  let people: Person[] = [];
  let art: Art[] = [];
  $: (async () => {
    people = (await getPeople()).slice(0, 6);
    art = (await getArt()).slice(0, 6);
  })();
</script>

<section class="space-y-8">
  <header class="text-center space-y-3">
    <h1 class="text-3xl font-bold">Portfolio Rodiny Vajdovi</h1>
    <p class="text-gray-600">Lidé • Koníčky • Umění</p>
  </header>

  <h2 class="text-xl font-semibold mt-8">Lidé</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
    {#each people as p}
      <PersonCard name={p.title} role={p.role} avatar={p.avatar} slug={p.slug} />
    {/each}
  </div>

  <h2 class="text-xl font-semibold mt-10">Obrazy</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
    {#each art as a}
      <ArtCard title={a.title} year={a.year} image={a.image} slug={a.slug} />
    {/each}
  </div>

  <h2 class="text-xl font-semibold mt-10">Instalace</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
    {#each art as a}
      <ArchCard title={a.title} year={a.year} image={a.image} slug={a.slug} />
    {/each}
  </div>
</section>