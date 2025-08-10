<script lang="ts">
  // Explicit prop types with defaults to avoid implicit 'any'
  export let title: string;
  export let image: string | undefined = undefined;
  export let year: string | number | undefined = undefined;
  export let slug: string;
</script>

<a href={`/art/${slug}`} class="group block rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition">
  <img src={image ?? '/images/art/placeholder.png'} alt={title} class="w-full h-52 object-cover" />
  <div class="p-4">
    <h3 class="text-lg font-semibold group-hover:underline">{title}</h3>
    {#if year}<p class="text-sm text-gray-600">{year}</p>{/if}
  </div>
</a>