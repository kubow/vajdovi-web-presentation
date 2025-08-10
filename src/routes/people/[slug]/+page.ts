import { getPerson } from '$lib/content';
import type { Person } from '$lib/content';

export const load = async ({ params }) => {
  const person = await getPerson(params.slug);
  return { person } satisfies { person: Person | null };
};