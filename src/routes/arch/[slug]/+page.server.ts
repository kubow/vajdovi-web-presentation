import { getArchItem } from '$lib/content';
import type { Arch } from '$lib/content';

export const entries = async () => {
  return [{ slug: 'example' }];
};

export const load = async ({ params }) => {
  const art = await getArchItem(params.slug);
  if (art) {
    // Remove the Component property for serialization
    const { Component, ...artData } = art;
    return { art: artData as Omit<Arch, 'Component'> };
  }
  return { art: null };
};
