<script lang="ts">
  import { tick } from 'svelte';
  import { displayName, flattenTree, layoutTree, spousesOf } from '#lib/genealogy';
  import type { FullPerson, Marriage, TreeNode } from '#lib/genealogy';

  export let tree: TreeNode;
  export let direction: 'ancestors' | 'descendants' = 'ancestors';
  export let byId: Map<string, FullPerson>;
  export let marriages: Marriage[] = [];
  /** Ids matching the current search; null when there is no search. */
  export let highlight: Set<string> | null = null;
  export let onSelect: (person: FullPerson) => void = () => {};

  const nodeWidth = 168;
  const columnGap = 30;
  const rowGap = 8;
  const pad = 8;

  let scroller: HTMLDivElement;

  $: nodeHeight = direction === 'descendants' ? 56 : 42;
  $: layout = layoutTree(tree);
  $: nodes = flattenTree(tree);
  $: width = (layout.depth + 1) * (nodeWidth + columnGap) - columnGap + pad * 2;
  $: height = Math.max(1, layout.rows) * (nodeHeight + rowGap) - rowGap + pad * 2;

  // Bring the root person into view whenever the tree changes (it sits mid-height in a tall tree).
  $: if (scroller && tree) tick().then(() => {
    scroller.scrollTo({ top: Math.max(0, y(tree) + nodeHeight / 2 - scroller.clientHeight / 2), left: 0 });
  });

  const x = (node: TreeNode) => pad + node.depth * (nodeWidth + columnGap);
  $: y = (node: TreeNode) => pad + node.row * (nodeHeight + rowGap);

  function link(parent: TreeNode, child: TreeNode) {
    const x1 = x(parent) + nodeWidth;
    const y1 = y(parent) + nodeHeight / 2;
    const x2 = x(child);
    const y2 = y(child) + nodeHeight / 2;
    const mid = x1 + columnGap / 2;
    return `M${x1},${y1} H${mid} V${y2} H${x2}`;
  }

  const fill = (person: FullPerson) => person.sex === 'M' ? '#eff6ff' : person.sex === 'F' ? '#fff1f2' : '#f9fafb';
  const stroke = (person: FullPerson) => person.sex === 'M' ? '#93c5fd' : person.sex === 'F' ? '#fda4af' : '#d1d5db';
  const clip = (text: string, max: number) => text.length > max ? `${text.slice(0, max - 1)}…` : text;
  const dimmed = (person: FullPerson) => highlight !== null && !highlight.has(person.id);
</script>

<div bind:this={scroller} class="overflow-auto rounded-2xl border bg-white max-h-[75vh]">
  <svg {width} {height} viewBox="0 0 {width} {height}" role="group" aria-label={direction === 'ancestors' ? 'Strom předků' : 'Strom potomků'} class="block font-sans">
    {#each nodes as node}
      {#each node.children as child}
        <path d={link(node, child)} fill="none" stroke="#d1d5db" stroke-width="1.5" />
      {/each}
    {/each}
    {#each nodes as node (node.person.id + ':' + node.depth + ':' + node.row)}
      {@const person = node.person}
      {@const spouses = direction === 'descendants' ? spousesOf(person.id, byId, marriages) : []}
      <g
        class="cursor-pointer outline-none [&:hover>rect]:stroke-gray-500 [&:focus-visible>rect]:stroke-gray-900"
        transform="translate({x(node)},{y(node)})"
        opacity={dimmed(person) ? 0.3 : 1}
        role="button"
        tabindex="0"
        aria-label={displayName(person)}
        on:click={() => onSelect(person)}
        on:keydown={(event) => (event.key === 'Enter' || event.key === ' ') && (event.preventDefault(), onSelect(person))}
      >
        <rect width={nodeWidth} height={nodeHeight} rx="10" fill={fill(person)} stroke={stroke(person)} stroke-width={highlight?.has(person.id) ? 3 : 1.5} />
        <text x="10" y="17" font-size="13" font-weight="600" fill="#111827">{clip(displayName(person), 24)}</text>
        <text x="10" y="32" font-size="11" fill="#6b7280">{person.years || '—'}</text>
        {#if spouses.length}
          <text x="10" y="47" font-size="11" fill="#6b7280">⚭ {clip(spouses.map(displayName).join(', '), 25)}</text>
        {/if}
      </g>
    {/each}
  </svg>
</div>
