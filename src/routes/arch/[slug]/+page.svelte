<script lang="ts">
  import type { Arch } from '$lib/content';
  export let data: { arch: Arch | null };
</script>

{#if !data.arch}
  <p>Not found.</p>
{:else}
  <article class="prose max-w-none">
    <img src={data.arch.image ?? ''} alt={data.arch.title} class="w-full rounded-2xl mb-6" />
    <h1 class="text-3xl font-bold">{data.arch.title}</h1>
    {#if data.arch.year}<p class="text-gray-600">{data.arch.year}</p>{/if}
    {#if data.arch.Component}
      <svelte:component this={data.arch.Component} />
    {/if}
  </article>
{/if}
