<script lang="ts">
  import { getPeople } from '$lib/content';
  import type { Person } from '$lib/content';
  import PersonCard from '$components/PersonCard.svelte';
  let people: Person[] = [];
  $: (async () => { people = await getPeople(); })();
  let q = '';
</script>

<h1 class="text-2xl font-bold mb-6">Lidé</h1>
<input bind:value={q} placeholder="Search name or role…"
       class="w-full sm:w-80 border rounded-xl px-3 py-2 mb-6" />
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {#each people.filter(p => (p.title + (p.role ?? '')).toLowerCase().includes(q.toLowerCase())) as p}
    <PersonCard name={p.title} role={p.role} avatar={p.avatar} slug={p.slug} />
  {/each}
</div>