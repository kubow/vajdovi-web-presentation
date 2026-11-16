<script lang="ts">
  import { displayName } from '#lib/genealogy';
  import type { FullPerson } from '#lib/genealogy';

  export let rootId: string;
  export let byId: Map<string, FullPerson>;
  /** Ids matching the current search; null when there is no search. */
  export let highlight: Set<string> | null = null;
  export let onSelect: (person: FullPerson) => void = () => {};

  const maxGenerations = 9;
  const centerRadius = 58;
  // Ring widths per generation (1 = parents); later rings are wider because their labels run radially.
  const ringWidths = [0, 72, 72, 92, 104, 104, 100, 96, 92];
  const span = 240;
  const start = -90 - span / 2;

  const zoomLevels = [1, 1.5, 2, 3];
  let zoom = 0;

  type Slot = { person: FullPerson; generation: number; index: number };

  $: slots = collect(rootId, byId);
  $: generations = Math.min(maxGenerations, Math.max(1, ...slots.map((slot) => slot.generation + 1)));
  $: radii = ringWidths.slice(0, generations).reduce<number[]>((acc, width, g) => [...acc, g === 0 ? centerRadius : acc[g - 1] + width], []);
  $: outer = radii[radii.length - 1] ?? centerRadius;
  $: bottom = Math.max(centerRadius, outer * Math.sin(((start + span) * Math.PI) / 180));
  $: viewBox = `${-outer - 6} ${-outer - 6} ${outer * 2 + 12} ${outer + bottom + 12}`;
  $: emptySlots = emptyPositions(slots, generations);

  function collect(id: string, people: Map<string, FullPerson>) {
    const result: Slot[] = [];
    const visit = (personId: string, generation: number, index: number, seen: Set<string>) => {
      const person = people.get(personId);
      if (!person || seen.has(personId) || generation >= maxGenerations) return;
      result.push({ person, generation, index });
      const next = new Set(seen).add(personId);
      visit(person.father, generation + 1, index * 2, next);
      visit(person.mother, generation + 1, index * 2 + 1, next);
    };
    visit(id, 0, 0, new Set());
    return result;
  }

  // Grey placeholders only directly above known people, so the chart shows where research can continue.
  function emptyPositions(filled: Slot[], gens: number) {
    const taken = new Set(filled.map((slot) => `${slot.generation}:${slot.index}`));
    return filled
      .filter((slot) => slot.generation + 1 < gens)
      .flatMap((slot) => [slot.index * 2, slot.index * 2 + 1].map((index) => ({ generation: slot.generation + 1, index })))
      .filter((slot) => !taken.has(`${slot.generation}:${slot.index}`));
  }

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const point = (r: number, deg: number) => `${(r * Math.cos(rad(deg))).toFixed(2)},${(r * Math.sin(rad(deg))).toFixed(2)}`;

  function angles(generation: number, index: number) {
    const step = span / 2 ** generation;
    return [start + index * step, start + (index + 1) * step];
  }

  function segment(generation: number, index: number) {
    const [a0, a1] = angles(generation, index);
    const r1 = radii[generation - 1];
    const r2 = radii[generation];
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${point(r2, a0)} A${r2},${r2} 0 ${large} 1 ${point(r2, a1)} L${point(r1, a1)} A${r1},${r1} 0 ${large} 0 ${point(r1, a0)} Z`;
  }

  function label(generation: number, index: number) {
    const [a0, a1] = angles(generation, index);
    const mid = (a0 + a1) / 2;
    const r = (radii[generation - 1] + radii[generation]) / 2;
    const [cx, cy] = [r * Math.cos(rad(mid)), r * Math.sin(rad(mid))];
    // Inner rings: text follows the arc. Outer rings: text runs along the radius, flipped on the left so it stays upright.
    const tangential = generation <= 2;
    const rotate = tangential ? mid + 90 : Math.cos(rad(mid)) < 0 ? mid + 180 : mid;
    const arcLength = (rad(a1 - a0) * r);
    const room = tangential ? arcLength : ringWidths[generation];
    const thickness = tangential ? ringWidths[generation] : arcLength;
    return { transform: `translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rotate.toFixed(2)})`, room, thickness };
  }

  const fontSize = (thickness: number) => Math.max(7, Math.min(12, thickness * 0.38));
  const fit = (text: string, room: number, size: number) => {
    const max = Math.max(3, Math.floor((room - 8) / (size * 0.56)));
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  };

  // Paternal half in blues, maternal half in warm tones, fading outwards.
  function colour(generation: number, index: number) {
    const paternal = index < 2 ** (generation - 1);
    const hue = paternal ? 212 : 16;
    const light = 88 + Math.min(generation, 8) * 0.9;
    return `hsl(${hue} ${paternal ? 70 : 75}% ${light}%)`;
  }

  const dimmed = (person: FullPerson) => highlight !== null && !highlight.has(person.id);
  const activate = (event: KeyboardEvent, person: FullPerson) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(person); }
  };
</script>

<div class="relative rounded-2xl border bg-white">
  <div class="absolute right-2 top-2 z-10 inline-flex rounded-lg border bg-white/90 text-sm shadow-sm">
    <button type="button" class="px-2.5 py-1 hover:bg-gray-100 disabled:opacity-40" aria-label="Oddálit" disabled={zoom === 0} on:click={() => (zoom -= 1)}>−</button>
    <span class="px-1.5 py-1 tabular-nums text-gray-600">{zoomLevels[zoom]}×</span>
    <button type="button" class="px-2.5 py-1 hover:bg-gray-100 disabled:opacity-40" aria-label="Přiblížit" disabled={zoom === zoomLevels.length - 1} on:click={() => (zoom += 1)}>+</button>
  </div>
  <div class="overflow-auto max-h-[80vh] p-2">
  <svg {viewBox} style="width: {zoomLevels[zoom] * 100}%" class="block h-auto font-sans" role="group" aria-label="Vějířový graf předků">
    {#each emptySlots as slot}
      <path d={segment(slot.generation, slot.index)} fill="#f9fafb" stroke="#e5e7eb" stroke-width="1" />
    {/each}
    {#each slots as slot (slot.generation + ':' + slot.index)}
      {@const person = slot.person}
      {#if slot.generation === 0}
        <g class="cursor-pointer outline-none" role="button" tabindex="0" aria-label={displayName(person)} opacity={dimmed(person) ? 0.3 : 1} on:click={() => onSelect(person)} on:keydown={(event) => activate(event, person)}>
          <circle r={centerRadius - 2} fill="#f3f4f6" stroke={highlight?.has(person.id) ? '#111827' : '#9ca3af'} stroke-width={highlight?.has(person.id) ? 3 : 1.5} />
          <text text-anchor="middle" y="-2" font-size="13" font-weight="600" fill="#111827">{fit(person.name, 110, 13)}</text>
          <text text-anchor="middle" y="15" font-size="10" fill="#6b7280">{person.years || ''}</text>
        </g>
      {:else}
        {@const meta = label(slot.generation, slot.index)}
        {@const size = fontSize(meta.thickness)}
        <g class="cursor-pointer outline-none [&:hover>path]:stroke-gray-600 [&:focus-visible>path]:stroke-gray-900" role="button" tabindex="0" aria-label={displayName(person)} opacity={dimmed(person) ? 0.3 : 1} on:click={() => onSelect(person)} on:keydown={(event) => activate(event, person)}>
          <title>{displayName(person)}{person.years ? ` (${person.years})` : ''}</title>
          <path d={segment(slot.generation, slot.index)} fill={colour(slot.generation, slot.index)} stroke={highlight?.has(person.id) ? '#111827' : '#ffffff'} stroke-width={highlight?.has(person.id) ? 2.5 : 1.5} />
          <g transform={meta.transform}>
            {#if meta.thickness >= 26 && person.years}
              <text text-anchor="middle" y={-size * 0.15} font-size={size} font-weight="600" fill="#1f2937">{fit(displayName(person), meta.room, size)}</text>
              <text text-anchor="middle" y={size * 1.05} font-size={size * 0.85} fill="#4b5563">{fit(person.years, meta.room, size * 0.85)}</text>
            {:else}
              <text text-anchor="middle" dominant-baseline="central" font-size={size} font-weight="600" fill="#1f2937">{fit(displayName(person), meta.room, size)}</text>
            {/if}
          </g>
        </g>
      {/if}
    {/each}
  </svg>
  </div>
</div>
