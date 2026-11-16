<script lang="ts">
  import { onMount } from 'svelte';
  import { getPeople } from '#lib/content';
  import { withBase } from '#lib/paths';
  import type { Person as Profile } from '#lib/content';

  type Fact = { type: string; value: string; place?: string };
  type PublicPerson = { name: string; years?: string; facts: Fact[] };
  type FullPerson = PublicPerson & {
    id: string; birthSurname: string; marriedSurname: string; birthDate: string;
    birthPlace: string; deathDate: string; deathPlace: string; father: string; mother: string;
  };
  type Marriage = { groomId: string; brideId: string; date: string; place: string };

  const profileForName: Record<string, string> = {
    Jakub: 'kuba', Michaela: 'misa', Viktor: 'viki', Viola: 'violka'
  };
  const factLabel: Record<string, string> = {
    occupation: 'Povolání', residence: 'Bydliště', property: 'Majetek', origin: 'Původ'
  };

  let people: PublicPerson[] = [];
  let profiles: Profile[] = [];
  let marriages: Marriage[] = [];
  let selected: PublicPerson | null = null;
  let query = '';
  let fullMode = false;
  let loaded = false;
  let error = false;

  $: normalizedQuery = query.trim().toLocaleLowerCase('cs-CZ');
  $: results = people.filter((person) => !normalizedQuery || [person.name, person.years ?? '', ...person.facts.flatMap((fact) => [fact.type, fact.value, fact.place ?? ''])]
    .some((value) => value.toLocaleLowerCase('cs-CZ').includes(normalizedQuery)));
  $: selectedProfile = selected ? profiles.find((profile) => profile.slug === profileForName[selected.name]) : undefined;

  function displayName(person: FullPerson) {
    return [person.name, person.birthSurname || person.marriedSurname].filter(Boolean).join(' ');
  }

  function personSlug(person: PublicPerson) {
    return [person.name, person.years].filter(Boolean).join(' ')
      .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('cs-CZ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function openPerson(person: PublicPerson) {
    selected = person;
    const url = new URL(window.location.href);
    url.searchParams.set('person', personSlug(person));
    window.history.replaceState(window.history.state, '', url);
  }

  function closePerson() {
    selected = null;
    const url = new URL(window.location.href);
    url.searchParams.delete('person');
    window.history.replaceState(window.history.state, '', url);
  }

  function marriageDetails(person: FullPerson) {
    return marriages.filter((marriage) => marriage.groomId === person.id || marriage.brideId === person.id)
      .map((marriage) => {
        const partnerId = marriage.groomId === person.id ? marriage.brideId : marriage.groomId;
        const partner = people.find((candidate) => (candidate as FullPerson).id === partnerId) as FullPerson | undefined;
        return [partner ? displayName(partner) : '', marriage.date, marriage.place].filter(Boolean).join(' — ');
      });
  }

  onMount(async () => {
    fullMode = new URLSearchParams(window.location.search).get('genealogy') === 'full';
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
      const requestedPerson = new URLSearchParams(window.location.search).get('person');
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

  <input bind:value={query} class="w-full sm:w-96 border rounded-xl px-3 py-2" placeholder="Hledat jméno nebo fakt…" type="search" />

  {#if !loaded}
    <p class="text-gray-600">Načítám záznamy…</p>
  {:else if error}
    <p class="text-gray-600">Záznamy se nepodařilo načíst.</p>
  {:else}
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
        <dl class="grid sm:grid-cols-2 gap-3 text-sm"><div><dt class="font-medium">Narození</dt><dd class="text-gray-600">{[person.birthDate, person.birthPlace].filter(Boolean).join(' — ') || 'Neuvedeno'}</dd></div><div><dt class="font-medium">Úmrtí</dt><dd class="text-gray-600">{[person.deathDate, person.deathPlace].filter(Boolean).join(' — ') || 'Neuvedeno'}</dd></div>{#if marriageDetails(person).length}<div class="sm:col-span-2"><dt class="font-medium">Sňatky</dt>{#each marriageDetails(person) as marriage}<dd class="text-gray-600">{marriage}</dd>{/each}</div>{/if}</dl>
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
