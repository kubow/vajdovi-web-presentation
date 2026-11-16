<script lang="ts">
  import { onMount } from 'svelte';
  import { getPeople } from '#lib/content';
  import { withBase } from '#lib/paths';
  import type { Person as Profile } from '#lib/content';
  import GenealogyTree from '#lib/components/GenealogyTree.svelte';
  import GenealogyFan from '#lib/components/GenealogyFan.svelte';
  import {
    ancestorTree, birthYear, childrenOf, countAncestors, countDescendants, descendantTree,
    displayName, fold, matchesQuery
  } from '#lib/genealogy';
  import type { FullPerson, Marriage, PublicPerson } from '#lib/genealogy';

  type View = 'list' | 'tree' | 'fan';
  type Direction = 'ancestors' | 'descendants';

  const profileForName: Record<string, string> = {
    Jakub: 'kuba', Michaela: 'misa', Viktor: 'viki', Viola: 'violka'
  };
  const factLabel: Record<string, string> = {
    occupation: 'Povolání', residence: 'Bydliště', property: 'Majetek', origin: 'Původ'
  };
  const views: { id: View; label: string }[] = [
    { id: 'list', label: 'Seznam' },
    { id: 'tree', label: 'Strom' },
    { id: 'fan', label: 'Vějíř' }
  ];

  let people: PublicPerson[] = [];
  let profiles: Profile[] = [];
  let marriages: Marriage[] = [];
  let selected: PublicPerson | null = null;
  let query = '';
  let fullMode = false;
  let loaded = false;
  let error = false;

  let view: View = 'list';
  let direction: Direction = 'ancestors';
  let ancestorRoot = '';
  let descendantRoot = '';

  $: results = people.filter((person) => matchesQuery(person, query));
  $: selectedProfile = selected ? profiles.find((profile) => profile.slug === profileForName[selected.name]) : undefined;

  $: fullPeople = fullMode ? (people as FullPerson[]) : [];
  $: byId = new Map(fullPeople.map((person) => [person.id, person]));
  $: highlight = query.trim() ? new Set((results as FullPerson[]).map((person) => person.id)) : null;
  $: rootOptions = [...fullPeople].sort((a, b) => fold(displayName(a)).localeCompare(fold(displayName(b))) || birthYear(a) - birthYear(b));
  $: activeRoot = view === 'tree' && direction === 'descendants' ? descendantRoot : ancestorRoot;
  $: tree = view === 'tree' && activeRoot
    ? (direction === 'ancestors' ? ancestorTree(activeRoot, byId) : descendantTree(activeRoot, byId, fullPeople))
    : null;

  function personSlug(person: PublicPerson) {
    if (fullMode) return (person as FullPerson).id;
    return [person.name, person.years].filter(Boolean).join(' ')
      .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('cs-CZ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function updateUrl(changes: Record<string, string | null>) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(changes)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url);
  }

  function openPerson(person: PublicPerson) {
    selected = person;
    updateUrl({ person: personSlug(person) });
  }

  function closePerson() {
    selected = null;
    updateUrl({ person: null });
  }

  function setView(next: View) {
    view = next;
    updateUrl({ view: next === 'list' ? null : next });
  }

  function setDirection(next: Direction) {
    direction = next;
    updateUrl({ dir: next === 'ancestors' ? null : next });
  }

  function setRoot(id: string) {
    if (view === 'tree' && direction === 'descendants') descendantRoot = id;
    else ancestorRoot = id;
    updateUrl({ root: id });
  }

  /** Re-centres the tree or fan on a person from the detail dialog. */
  function showInChart(person: FullPerson, target: View, targetDirection: Direction = 'ancestors') {
    if (targetDirection === 'descendants') descendantRoot = person.id;
    else ancestorRoot = person.id;
    direction = target === 'fan' ? direction : targetDirection;
    closePerson();
    setView(target);
    updateUrl({ root: person.id, dir: direction === 'ancestors' ? null : direction });
  }

  function marriageDetails(person: FullPerson) {
    return marriages.filter((marriage) => marriage.groomId === person.id || marriage.brideId === person.id)
      .map((marriage) => {
        const partner = byId.get(marriage.groomId === person.id ? marriage.brideId : marriage.groomId);
        return { partner, text: [marriage.date, marriage.place].filter(Boolean).join(' — ') };
      });
  }

  const pickBest = (candidates: FullPerson[], score: (person: FullPerson) => number) =>
    candidates.reduce<{ id: string; score: number; year: number }>((best, person) => {
      const value = score(person);
      const year = birthYear(person);
      return value > best.score || (value === best.score && year < best.year) ? { id: person.id, score: value, year } : best;
    }, { id: '', score: -1, year: Infinity }).id;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    fullMode = params.get('genealogy') === 'full';
    try {
      const [data, customProfiles] = await Promise.all([
        fetch(withBase(fullMode ? '/genealogy-full.json' : '/genealogy.json')).then((response) => {
          if (!response.ok) throw new Error('Unable to load genealogy data');
          return response.json();
        }),
        getPeople()
      ]);
      people = data.people ?? [];
      marriages = data.marriages ?? [];
      profiles = customProfiles;

      if (fullMode) {
        const all = people as FullPerson[];
        const index = new Map(all.map((person) => [person.id, person]));
        const requestedView = params.get('view');
        view = requestedView === 'tree' || requestedView === 'fan' ? requestedView : 'list';
        direction = params.get('dir') === 'descendants' ? 'descendants' : 'ancestors';
        // Defaults: the person with the deepest known ancestry, and the forebear with the most descendants.
        const isFamily = (person: FullPerson) => /^(vajd|waid|wajd)/.test(fold(person.birthSurname));
        // Defaults: the family member with the deepest known ancestry on both sides,
        // and the earliest family forebear with the most descendants.
        ancestorRoot = pickBest(all.filter((person) => isFamily(person) && index.has(person.father) && index.has(person.mother)),
          (person) => countAncestors(person.id, index));
        descendantRoot = pickBest(all.filter((person) => isFamily(person) && !index.has(person.father) && !index.has(person.mother)),
          (person) => countDescendants(person.id, index, all));
        const requestedRoot = params.get('root');
        if (requestedRoot && index.has(requestedRoot)) {
          if (view === 'tree' && direction === 'descendants') descendantRoot = requestedRoot;
          else ancestorRoot = requestedRoot;
        }
      }

      const requestedPerson = params.get('person');
      if (requestedPerson) selected = people.find((person) => personSlug(person) === requestedPerson) ?? null;
    } catch {
      error = true;
    } finally {
      loaded = true;
    }
  });
</script>

<section class="space-y-6">
  <header class="space-y-2">
    <h1 class="text-3xl font-bold">Lidé</h1>
    <p class="text-gray-600">Vyhledávání ve veřejně dostupných rodinných faktech.</p>
  </header>

  <div class="flex flex-wrap items-center gap-3">
    <input bind:value={query} class="w-full sm:w-96 border rounded-xl px-3 py-2" placeholder="Hledat jméno, příjmení, místo nebo fakt…" type="search" />
    {#if fullMode && loaded && !error}
      <div class="inline-flex rounded-xl border p-1 text-sm" role="tablist" aria-label="Zobrazení">
        {#each views as option}
          <button
            type="button"
            role="tab"
            aria-selected={view === option.id}
            class="rounded-lg px-3 py-1.5 transition {view === option.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}"
            on:click={() => setView(option.id)}
          >{option.label}</button>
        {/each}
      </div>
    {/if}
  </div>

  {#if !loaded}
    <p class="text-gray-600">Načítám záznamy…</p>
  {:else if error}
    <p class="text-gray-600">Záznamy se nepodařilo načíst.</p>
  {:else if fullMode && view !== 'list'}
    <div class="flex flex-wrap items-center gap-3 text-sm">
      <label class="flex items-center gap-2">
        <span class="text-gray-600">{view === 'tree' && direction === 'descendants' ? 'Od předka' : 'Osoba'}</span>
        <select class="border rounded-lg px-2 py-1.5 max-w-[16rem]" value={activeRoot} on:change={(event) => setRoot(event.currentTarget.value)}>
          {#each rootOptions as person}
            <option value={person.id}>{displayName(person)}{person.years ? ` (${person.years})` : ''}</option>
          {/each}
        </select>
      </label>
      {#if view === 'tree'}
        <div class="inline-flex rounded-lg border p-0.5">
          <button type="button" class="rounded-md px-2.5 py-1 {direction === 'ancestors' ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}" aria-pressed={direction === 'ancestors'} on:click={() => setDirection('ancestors')}>Předkové</button>
          <button type="button" class="rounded-md px-2.5 py-1 {direction === 'descendants' ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}" aria-pressed={direction === 'descendants'} on:click={() => setDirection('descendants')}>Potomci</button>
        </div>
      {/if}
      {#if highlight}
        <span class="text-gray-500">Zvýrazněno: {highlight.size}</span>
      {/if}
    </div>

    {#if view === 'tree'}
      {#if tree}
        <GenealogyTree {tree} {direction} {byId} {marriages} {highlight} onSelect={openPerson} />
      {:else}
        <p class="text-gray-600">Pro tuto osobu není co zobrazit.</p>
      {/if}
    {:else}
      <GenealogyFan rootId={ancestorRoot} {byId} {highlight} onSelect={openPerson} />
    {/if}
  {:else}
    {#if !results.length}
      <p class="text-gray-600">Nic nenalezeno.</p>
    {/if}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {#each results as person}
        <button type="button" class="group rounded-2xl border p-5 shadow-sm hover:shadow-md transition text-center" on:click={() => openPerson(person)}>
          <svg class="w-14 h-14 mx-auto mb-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 8a7 7 0 1 1 14 0H3Z" /></svg>
          <h2 class="text-lg font-semibold group-hover:underline">{fullMode ? displayName(person as FullPerson) : person.name}</h2>
          {#if person.years}<p class="text-sm text-gray-500">{person.years}</p>{/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if selected}
    <div class="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center" role="presentation" on:click|self={closePerson}>
    <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-5" role="dialog" aria-modal="true" aria-label="Detail osoby" tabindex="-1">
      <div class="flex items-start gap-4">
        <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 8a7 7 0 1 1 14 0H3Z" /></svg>
        <div><h2 class="text-2xl font-bold">{fullMode ? displayName(selected as FullPerson) : selected.name}</h2>{#if selected.years}<p class="text-gray-500">{selected.years}</p>{/if}<button type="button" class="text-sm text-gray-600 hover:underline" on:click={closePerson}>Zavřít</button></div>
      </div>
      {#if fullMode}
        {@const person = selected as FullPerson}
        {@const parents = [byId.get(person.father), byId.get(person.mother)].filter((parent) => parent !== undefined)}
        {@const children = childrenOf(person.id, fullPeople)}
        <dl class="grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt class="font-medium">Narození</dt><dd class="text-gray-600">{[person.birthDate, person.birthPlace].filter(Boolean).join(' — ') || 'Neuvedeno'}</dd></div>
          <div><dt class="font-medium">Úmrtí</dt><dd class="text-gray-600">{[person.deathDate, person.deathPlace].filter(Boolean).join(' — ') || 'Neuvedeno'}</dd></div>
          {#if parents.length}
            <div><dt class="font-medium">Rodiče</dt>{#each parents as parent}<dd><button type="button" class="text-gray-600 hover:underline text-left" on:click={() => openPerson(parent)}>{displayName(parent)}{parent.years ? ` (${parent.years})` : ''}</button></dd>{/each}</div>
          {/if}
          {#if children.length}
            <div><dt class="font-medium">Děti</dt>{#each children as child}<dd><button type="button" class="text-gray-600 hover:underline text-left" on:click={() => openPerson(child)}>{displayName(child)}{child.years ? ` (${child.years})` : ''}</button></dd>{/each}</div>
          {/if}
          {#if marriageDetails(person).length}
            <div class="sm:col-span-2"><dt class="font-medium">Sňatky</dt>{#each marriageDetails(person) as marriage}<dd class="text-gray-600">{#if marriage.partner}{@const partner = marriage.partner}<button type="button" class="hover:underline" on:click={() => openPerson(partner)}>{displayName(partner)}</button>{/if}{marriage.text ? `${marriage.partner ? ' — ' : ''}${marriage.text}` : ''}</dd>{/each}</div>
          {/if}
        </dl>
        <div class="flex flex-wrap gap-2 text-sm">
          <button type="button" class="rounded-lg border px-3 py-1.5 hover:bg-gray-100" on:click={() => showInChart(person, 'tree', 'ancestors')}>Strom předků</button>
          {#if children.length}<button type="button" class="rounded-lg border px-3 py-1.5 hover:bg-gray-100" on:click={() => showInChart(person, 'tree', 'descendants')}>Strom potomků</button>{/if}
          <button type="button" class="rounded-lg border px-3 py-1.5 hover:bg-gray-100" on:click={() => showInChart(person, 'fan')}>Vějíř předků</button>
        </div>
      {/if}
      {#if selected.facts.length}<dl class="space-y-2 text-sm">{#each selected.facts as fact}<div><dt class="font-medium">{factLabel[fact.type] ?? fact.type}</dt><dd class="text-gray-600">{fact.value}{fact.place ? ` — ${fact.place}` : ''}</dd></div>{/each}</dl>{/if}
      {#if selectedProfile}
        <div class="prose max-w-none"><svelte:component this={selectedProfile.Component} /></div>
        {#if selectedProfile.featured_art?.length}<section><h3 class="text-xl font-semibold mb-3">Obrazy</h3>{#each selectedProfile.featured_art as item}<a class="block text-gray-600 hover:underline" href={withBase(`/art/${item.slug}`)}>{item.caption ?? item.slug}</a>{/each}</section>{/if}
        {#if selectedProfile.featured_texty?.length}<section><h3 class="text-xl font-semibold mb-3">Texty</h3>{#each selectedProfile.featured_texty as item}<a class="block text-gray-600 hover:underline" href={withBase(`/text/${item.slug}`)}>{item.caption ?? item.slug}</a>{/each}</section>{/if}
        <section><h3 class="text-xl font-semibold mb-3">Instalace</h3><a class="text-gray-600 hover:underline" href={withBase('/arch')}>Zobrazit instalace</a></section>
      {/if}
    </div>
    </div>
  {/if}
</section>
