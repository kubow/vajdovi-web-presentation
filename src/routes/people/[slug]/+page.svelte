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

    {#if data.person.featured_art && data.person.featured_art.length > 0}
      <h2 class="text-xl font-semibold mt-8 mb-4">Obrazy</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 not-prose">
        {#each data.person.featured_art as art}
          <a href={withBase(`/art/${art.slug}`)} class="group block rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition">
            <div class="p-3 bg-gradient-to-br from-blue-50 to-indigo-50">
              <span class="text-2xl">🎨</span>
              <p class="text-sm font-medium mt-1 group-hover:underline">{art.caption || art.slug}</p>
            </div>
          </a>
        {/each}
      </div>
    {/if}

    {#if data.person.featured_texty && data.person.featured_texty.length > 0}
      <h2 class="text-xl font-semibold mt-8 mb-4">Texty</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 not-prose">
        {#each data.person.featured_texty as text}
          <a href={withBase(`/text/${text.slug}`)} class="group block rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition">
            <div class="p-3 bg-gradient-to-br from-amber-50 to-orange-50">
              <span class="text-2xl">📜</span>
              <p class="text-sm font-medium mt-1 group-hover:underline">{text.caption || text.slug}</p>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </article>
{/if}