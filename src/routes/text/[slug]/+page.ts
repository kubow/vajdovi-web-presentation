import { getTextItem } from '$lib/content';
import type { Text } from '$lib/content';

export const load = async ({ params }) => {
  const text = await getTextItem(params.slug);
  return { text } satisfies { text: Text | null };
};

