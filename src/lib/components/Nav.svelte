<script lang="ts">
  import { withBase } from '$lib/paths';
  export let current: string = '';
  const links = [
    { href: '/', label: 'home' },
    { href: '/people', label: 'Lidé' },
    { href: '/art', label: 'Obrazy' },
    { href: '/arch', label: 'Instalace' },
    { href: '/text', label: 'Texty' }
  ];
</script>

<nav class="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
  <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
    <a href={withBase('/')} class="font-semibold text-lg">Vajdovi.cz</a>
    <div class="ml-auto flex gap-3">
      {#each links as l}
        {#if l.href === '/'}
          <a href={withBase(l.href)} class="px-3 py-1.5 rounded-full hover:bg-gray-100 flex items-center justify-center {current===l.href ? 'bg-gray-200' : ''}" aria-label="Domů">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v5a2 2 0 0 0 2 2h2a1 1 0 0 0 1-1v-3h2v3a1 1 0 0 0 1 1h2a2 2 0 0 0 2-2v-5h1a1 1 0 0 0 .707-1.707l-7-7Z" /></svg>
          </a>
        {:else if l.href === '/people'}
          <a href={withBase(l.href)} class="px-3 py-1.5 rounded-full hover:bg-gray-100 flex items-center justify-center {current===l.href ? 'bg-gray-200' : ''}" aria-label="Lidé">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 8a7 7 0 1 1 14 0H3Z" /></svg>
          </a>
        {:else}
          <a href={withBase(l.href)} class="px-3 py-1.5 rounded-full hover:bg-gray-100 {current===l.href ? 'bg-gray-200' : ''}">{l.label}</a>
        {/if}
      {/each}
    </div>
  </div>
</nav>