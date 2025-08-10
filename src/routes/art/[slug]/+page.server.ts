// Explicitly list the art slugs based on files actually present
import { getArtItem } from '$lib/content';
import type { Art } from '$lib/content';

export const entries = async () => {
  return [{ slug: 'example' }];
};

export const load = async ({ params }) => {
  const art = await getArtItem(params.slug);
  if (art) {
    // Remove the Component property for serialization
    const { Component, ...artData } = art;
    return { art: artData as Omit<Art, 'Component'> };
  }
  return { art: null };
};
