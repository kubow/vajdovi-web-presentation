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
  .some((surname) => ['vajda', 'vajdova', 'waida', 'waidova', 'wajda', 'wajdova'].includes(normalizeSurname(surname)));

const givenName = (name = '') => name.trim().split(/\s+/)[0] || 'Neznámý';

const cleanFact = (fact) => {
  const type = String(fact.type ?? '').trim();
  const value = String(fact.value ?? '').trim();
  const place = String(fact.place ?? '').trim();

  if (!type || !value) return null;
  return place ? { type, value, place } : { type, value };
};

const LIVING_MAX_AGE = 110;
const currentYear = new Date().getFullYear();

// Turns raw date strings ("1854-09-15", "c. 1803 (age 35 ...)", "c. 1775–1785 (est. ...)") into a display year.
const parseYear = (value = '') => {
  const text = String(value ?? '').trim();
  const years = [...text.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)].map((match) => Number(match[1]));
  if (!years.length) return null;
  const range = /^c\.\s*\d{4}\s*[–-]\s*\d{4}/.test(text);
  const year = range ? Math.round((years[0] + years[1]) / 2) : years[0];
  const approximate = /^c\./.test(text) || (!/^\d{4}-\d{2}-\d{2}/.test(text) && /est/.test(text));
  return { year, label: approximate ? `c. ${year}` : String(year) };
};

const isLiving = (person) => {
  if (parseYear(person.death_date)) return false;
  const birth = parseYear(person.birth_date);
  return !birth || currentYear - birth.year <= LIVING_MAX_AGE;
};

const lifeYears = (person) => {
  const birth = parseYear(person.birth_date);
  const death = parseYear(person.death_date);
  if (!birth && !death) return '';
  return `${birth?.label ?? '?'}–${death?.label ?? '?'}`;
};

const birthYear = (person) => parseYear(person.birth_date)?.year ?? 0;

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const people = (source.people ?? [])
  .filter(isVajdaRecord)
  .map((person) => ({
    name: givenName(person.name),
    years: isLiving(person) ? '' : lifeYears(person),
    sortYear: birthYear(person),
    facts: (person.facts ?? []).map(cleanFact).filter(Boolean)
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'cs-CZ') || a.sortYear - b.sortYear)
  .map(({ sortYear, ...person }) => person);

await writeFile(outputPath, `${JSON.stringify({ people }, null, 2)}\n`);
const fullPeople = (source.people ?? []).map((person) => ({
  id: person.id,
  name: person.name,
  years: lifeYears(person),
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
