<script lang="ts">
  import { withBase } from '#lib/paths';

  const sections = [
    { href: '/people', title: 'Lidé', description: 'Rodinné záznamy a dostupná fakta', icon: '👥' },
    { href: '/art', title: 'Obrazy', description: 'Kresby a digitální tvorba', icon: '🎨' },
    { href: '/arch', title: 'Instalace', description: 'Domy, prostory a sochy', icon: '🗿' },
    { href: '/text', title: 'Texty', description: 'Poezie a próza', icon: '📜' }
  ];
</script>

<section class="space-y-8">
  <header class="text-center space-y-3">
    <h1 class="text-3xl font-bold">Portfolio Rodiny Vajdovi</h1>
    <p class="text-gray-600">Lidé • Koníčky • Umění</p>
  </header>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    {#each sections as section}
      <a href={withBase(section.href)} class="group block rounded-2xl border p-6 shadow-sm hover:shadow-md transition text-center">
        <div class="text-5xl mb-4">{section.icon}</div>
        <h2 class="text-xl font-semibold group-hover:underline">{section.title}</h2>
        <p class="mt-2 text-sm text-gray-600">{section.description}</p>
      </a>
    {/each}
  </div>
</section>
