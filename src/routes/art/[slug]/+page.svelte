<script lang="ts">
  import type { Art } from '$lib/content';
  import { withBase } from '$lib/paths';
  export let data: { art: Art | null };
</script>

{#if !data.art}
  <p>Not found.</p>
{:else}
  <article class="prose max-w-none">
    <img src={withBase(data.art.image ?? '/images/art/placeholder.png')} alt={data.art.title} class="w-full rounded-2xl mb-6" />
    <h1 class="text-3xl font-bold">{data.art.title}</h1>
    {#if data.art.year}<p class="text-gray-600">{data.art.year}</p>{/if}
    {#if data.art.Component}
      <svelte:component this={data.art.Component} />
    {/if}
  </article>
{/if}