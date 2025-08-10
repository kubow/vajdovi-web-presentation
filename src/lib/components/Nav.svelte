<script lang="ts">
  import { withBase } from '$lib/paths';
  export let current: string = '';
  const links = [
    { href: '/', label: 'Hlavní strana' },
    { href: '/people', label: 'Lidé' },
    { href: '/art', label: 'Umění' }
  ];
</script>

<nav class="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
  <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
    <a href={withBase('/')} class="font-semibold text-lg">Rodina Vajdovi.cz</a>
    <div class="ml-auto flex gap-3">
      {#each links as l}
        <a href={withBase(l.href)} class="px-3 py-1.5 rounded-full hover:bg-gray-100 {current===l.href ? 'bg-gray-200' : ''}">{l.label}</a>
      {/each}
    </div>
  </div>
</nav>