<script lang="ts">
  import { withBase } from '$lib/paths';
  // Explicit prop types with defaults to avoid implicit 'any'
  export let name: string;
  export let role: string | undefined = undefined;
  export let avatar: string | undefined = undefined;
  export let slug: string;
</script>

<a href={`/people/${slug}`} class="group block rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition">
  <img src={withBase(avatar ?? '/images/people/placeholder.png')} alt={name} class="w-full h-52 object-cover" />
  <div class="p-4">
    <h3 class="text-lg font-semibold group-hover:underline">{name}</h3>
    {#if role}<p class="text-sm text-gray-600">{role}</p>{/if}
  </div>
</a>