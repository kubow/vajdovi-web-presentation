<script lang="ts">
  import { withBase } from '$lib/paths';
  export let title: string;
  export let type: 'poezie' | 'proza' | undefined = undefined;
  export let slug: string;
</script>

<a href={withBase(`/text/${slug}`)} class="group block rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition">
  <div class="p-5 bg-gradient-to-br from-amber-50 to-orange-50">
    <div class="text-4xl mb-3">{type === 'poezie' ? '📜' : '📖'}</div>
    <h3 class="text-lg font-semibold group-hover:underline">{title}</h3>
    {#if type}<p class="text-sm text-gray-600 capitalize">{type}</p>{/if}
  </div>
</a>

