import { getArtItem } from '$lib/content';
import type { Art } from '$lib/content';

export const load = async ({ params }) => {
  const art = await getArtItem(params.slug);
  return { art } satisfies { art: Art | null };
};

