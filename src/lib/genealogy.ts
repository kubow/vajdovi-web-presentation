export type Fact = { type: string; value: string; place?: string; date?: string };
export type PublicPerson = { name: string; years?: string; surnames?: string[]; facts: Fact[] };
export type FullPerson = PublicPerson & {
  id: string; sex: string; birthSurname: string; marriedSurname: string; birthDate: string;
  birthPlace: string; deathDate: string; deathPlace: string; father: string; mother: string;
};
export type Marriage = { groomId: string; brideId: string; date: string; place: string };

export type TreeNode = {
  person: FullPerson;
  children: TreeNode[];
  depth: number;
  /** Row position in leaf units, filled in by layoutTree. */
  row: number;
};

/** Lower-case, diacritics-free form used for search matching ("Vajdová" ~ "vajdova"). */
export const fold = (value = '') => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('cs-CZ');

export const displayName = (person: FullPerson) =>
  [person.name, person.birthSurname || person.marriedSurname].filter(Boolean).join(' ');

/** Every field a visitor might search by: names, surnames, years, dates, places and facts. */
export function searchText(person: PublicPerson | FullPerson) {
  const full = person as Partial<FullPerson>;
  return fold([
    person.name, person.years, ...(person.surnames ?? []), full.birthSurname, full.marriedSurname,
    full.birthDate, full.birthPlace, full.deathDate, full.deathPlace,
    ...person.facts.flatMap((fact) => [fact.value, fact.place, fact.date])
  ].filter(Boolean).join(' \u0001 '));
}

/** All whitespace-separated terms must match, so "anna waida" narrows instead of widening. */
export function matchesQuery(person: PublicPerson | FullPerson, query: string) {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const text = searchText(person);
  return terms.every((term) => text.includes(term));
}

export const birthYear = (person: FullPerson) => Number(person.years?.match(/\d{4}/)?.[0] ?? 0);

export function ancestorTree(rootId: string, byId: Map<string, FullPerson>, maxDepth = 12): TreeNode | null {
  const build = (id: string, depth: number, seen: Set<string>): TreeNode | null => {
    const person = byId.get(id);
    if (!person || seen.has(id) || depth > maxDepth) return null;
    const next = new Set(seen).add(id);
    const children = [person.father, person.mother]
      .map((parentId) => build(parentId, depth + 1, next))
      .filter((node): node is TreeNode => node !== null);
    return { person, children, depth, row: 0 };
  };
  return build(rootId, 0, new Set());
}

export function childrenOf(id: string, people: FullPerson[]) {
  return people.filter((person) => person.father === id || person.mother === id)
    .sort((a, b) => birthYear(a) - birthYear(b));
}

export function descendantTree(rootId: string, byId: Map<string, FullPerson>, people: FullPerson[], maxDepth = 12): TreeNode | null {
  const build = (id: string, depth: number, seen: Set<string>): TreeNode | null => {
    const person = byId.get(id);
    if (!person || seen.has(id) || depth > maxDepth) return null;
    const next = new Set(seen).add(id);
    const children = childrenOf(id, people)
      .map((child) => build(child.id, depth + 1, next))
      .filter((node): node is TreeNode => node !== null);
    return { person, children, depth, row: 0 };
  };
  return build(rootId, 0, new Set());
}

/** Simple tidy layout: leaves take consecutive rows, parents sit centred on their children. */
export function layoutTree(root: TreeNode) {
  let rows = 0;
  let depth = 0;
  const visit = (node: TreeNode) => {
    depth = Math.max(depth, node.depth);
    if (!node.children.length) {
      node.row = rows++;
      return;
    }
    node.children.forEach(visit);
    node.row = (node.children[0].row + node.children[node.children.length - 1].row) / 2;
  };
  visit(root);
  return { rows, depth };
}

export function flattenTree(root: TreeNode) {
  const nodes: TreeNode[] = [];
  const visit = (node: TreeNode) => { nodes.push(node); node.children.forEach(visit); };
  visit(root);
  return nodes;
}

export function countAncestors(id: string, byId: Map<string, FullPerson>) {
  const tree = ancestorTree(id, byId);
  return tree ? flattenTree(tree).length - 1 : 0;
}

export function countDescendants(id: string, byId: Map<string, FullPerson>, people: FullPerson[]) {
  const tree = descendantTree(id, byId, people);
  return tree ? flattenTree(tree).length - 1 : 0;
}

export function spousesOf(id: string, byId: Map<string, FullPerson>, marriages: Marriage[]) {
  return marriages
    .filter((marriage) => marriage.groomId === id || marriage.brideId === id)
    .map((marriage) => byId.get(marriage.groomId === id ? marriage.brideId : marriage.groomId))
    .filter((person): person is FullPerson => Boolean(person));
}
