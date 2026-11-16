<script lang="ts">
  import { onMount } from 'svelte';
  import { withBase } from '#lib/paths';
  type Installation = { title: string; category: string; icon: string; href: string };
  let items: Installation[] = [];
  $: groups = [
    { title: 'Domy, prostory', category: 'Prostor' },
    { title: 'Sochy', category: 'Socha' }
  ].map((group) => ({ ...group, items: items.filter((item) => item.category === group.category) }));
  onMount(async () => {
    const response = await fetch(withBase('/installations.json'));
    if (response.ok) items = (await response.json()).installations ?? [];
  });
</script>

<section class="space-y-8">
  <h1 class="text-3xl font-bold">Instalace</h1>
  {#each groups as group}
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">{group.title}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {#each group.items as item}
          <a class="group block rounded-2xl border p-5 shadow-sm hover:shadow-md transition" href={item.href} target="_blank" rel="noreferrer">
            <div class="text-5xl text-center mb-4">{item.icon}</div>
            <h3 class="text-lg font-semibold group-hover:underline">{item.title}</h3>
            <p class="mt-2 text-sm text-gray-600">Otevřít projekt</p>
          </a>
        {/each}
      </div>
    </section>
  {/each}
</section>
