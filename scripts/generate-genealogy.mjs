import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.GENEALOGY_SOURCE
  ? resolve(process.env.GENEALOGY_SOURCE)
  : resolve(root, '../genealogy/data/genealogy.json');
const outputPath = resolve(root, 'static/genealogy.json');
const fullOutputPath = resolve(root, 'static/genealogy-full.json');

const normalizeSurname = (value = '') => value
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .trim()
  .toLocaleLowerCase('cs-CZ');

const isVajdaRecord = (person) => [person.birth_surname, person.married_surname]
  .some((surname) => ['vajda', 'vajdova'].includes(normalizeSurname(surname)));

const givenName = (name = '') => name.trim().split(/\s+/)[0] || 'Neznámý';

const cleanFact = (fact) => {
  const type = String(fact.type ?? '').trim();
  const value = String(fact.value ?? '').trim();
  const place = String(fact.place ?? '').trim();

  if (!type || !value) return null;
  return place ? { type, value, place } : { type, value };
};

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const people = (source.people ?? [])
  .filter(isVajdaRecord)
  .map((person) => ({
    name: givenName(person.name),
    facts: (person.facts ?? []).map(cleanFact).filter(Boolean)
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'cs-CZ'));

await writeFile(outputPath, `${JSON.stringify({ people }, null, 2)}\n`);
const fullPeople = (source.people ?? []).map((person) => ({
  id: person.id,
  name: person.name,
  birthSurname: person.birth_surname ?? '',
  marriedSurname: person.married_surname ?? '',
  birthDate: person.birth_date ?? '',
  birthPlace: person.birth_place ?? '',
  deathDate: person.death_date ?? '',
  deathPlace: person.death_place ?? '',
  father: person.father ?? '',
  mother: person.mother ?? '',
  facts: person.facts ?? []
}));
const marriages = (source.events ?? [])
  .filter((event) => event.event_type === 'Marriage')
  .map((event) => ({
    groomId: event.groom_id ?? '',
    brideId: event.bride_id ?? '',
    date: event.date ?? '',
    place: event.place ?? ''
  }));

await writeFile(fullOutputPath, `${JSON.stringify({ people: fullPeople, marriages }, null, 2)}\n`);
console.log(`Wrote ${people.length} public genealogy records to ${outputPath}`);
