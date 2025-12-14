<script lang="ts">
  import type { Text } from '$lib/content';
  export let data: { text: Text | null };
</script>

{#if !data.text}
  <p>Not found.</p>
{:else}
  <article class="prose max-w-none">
    <div class="text-6xl mb-4">{data.text.type === 'poezie' ? '📜' : '📖'}</div>
    <h1 class="text-3xl font-bold">{data.text.title}</h1>
    {#if data.text.type}<p class="text-gray-600 capitalize">{data.text.type}</p>{/if}
    {#if data.text.Component}
      <svelte:component this={data.text.Component} />
    {/if}
  </article>
{/if}

