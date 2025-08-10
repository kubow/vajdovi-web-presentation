<script lang="ts">
  import type { Person } from '$lib/content';
  import { withBase } from '$lib/paths';
  export let data: { person: Person | null };
</script>

{#if !data.person}
  <p>Not found.</p>
{:else}
  <article class="prose max-w-none">
    <div class="flex flex-col sm:flex-row gap-6 items-start mb-6">
      <img src={withBase(data.person.avatar ?? '/images/people/kuba.png')} alt={data.person.title} class="w-40 h-40 object-cover rounded-2xl" />
      <div>
        <h1 class="text-3xl font-bold">{data.person.title}</h1>
        {#if data.person.role}<p class="text-gray-600">{data.person.role}</p>{/if}
      </div>
    </div>
    {#if data.person.Component}
      <svelte:component this={data.person.Component} />
    {/if}
  </article>
{/if}