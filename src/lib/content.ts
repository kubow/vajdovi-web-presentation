import type { ComponentType } from 'svelte';

export type Person = {
  slug: string;
  title: string;
  role?: string;
  avatar?: string;
  hobbies?: string[];
  links?: Record<string, string>;
  featured_art?: { slug: string; caption?: string }[];
  featured_texty?: { slug: string; caption?: string }[];
  Component?: ComponentType;
};

export type Art = {
  slug: string;
  title: string;
  image?: string;
  year?: string | number;
  author?: string;
  tags?: string[];
  Component?: ComponentType;
};

export type Arch = {
  slug: string;
  title: string;
  image?: string;
  year?: string | number;
  author?: string;
  tags?: string[];
  Component?: ComponentType;
};

export type Hobby = {
  slug: string;
  title: string;
  Component?: ComponentType;
};

export type Text = {
  slug: string;
  title: string;
  type?: 'poezie' | 'proza';
  author?: string;
  year?: string | number;
  tags?: string[];
  Component?: ComponentType;
};

const peopleModules = import.meta.glob('/src/content/people/*.md', { eager: true }) as Record<string, { metadata: any; default: ComponentType }>;
const artModules    = import.meta.glob('/src/content/art/*.md',    { eager: true }) as Record<string, { metadata: any; default: ComponentType }>;
const archModules   = import.meta.glob('/src/content/arch/*.md',   { eager: true }) as Record<string, { metadata: any; default: ComponentType }>; 
const hobbyModules  = import.meta.glob('/src/content/hobbies/*.md',{ eager: true }) as Record<string, { metadata: any; default: ComponentType }>;
const textyModules  = import.meta.glob('/src/content/text/*.md',  { eager: true }) as Record<string, { metadata: any; default: ComponentType }>;

const slugFrom = (path: string) => path.split('/').pop()!.replace(/\.md$/, '');

export async function getPeople(): Promise<Person[]> {
  return Object.entries(peopleModules)
    .map(([path, mod]) => ({ slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Person))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArch(): Promise<Arch[]> {
  return Object.entries(archModules)
    .map(([path, mod]) => ({ slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Arch))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArchItem(slug: string): Promise<Arch | null> {
  const entry = Object.entries(archModules).find(([p]) => p.endsWith(`/${slug}.md`));
  if (!entry) return null;
  const [path, mod] = entry;
  return { slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Arch;
}


export async function getArt(): Promise<Art[]> {
  return Object.entries(artModules)
    .map(([path, mod]) => ({ slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Art))
    .sort((a, b) => String(b.year ?? '').localeCompare(String(a.year ?? '')));
}

export async function getArtItem(slug: string): Promise<Art | null> {
  const entry = Object.entries(artModules).find(([p]) => p.endsWith(`/${slug}.md`));
  if (!entry) return null;
  const [path, mod] = entry;
  return { slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Art;
}

export async function getHobbies(): Promise<Hobby[]> {
  return Object.entries(hobbyModules)
    .map(([path, mod]) => ({ slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Hobby))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPerson(slug: string): Promise<Person | null> {
  const entry = Object.entries(peopleModules).find(([p]) => p.endsWith(`/${slug}.md`));
  if (!entry) return null;
  const [path, mod] = entry;
  return { slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Person;
}

export async function getTexty(): Promise<Text[]> {
  return Object.entries(textyModules)
    .map(([path, mod]) => ({ slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Text))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getTextItem(slug: string): Promise<Text | null> {
  const entry = Object.entries(textyModules).find(([p]) => p.endsWith(`/${slug}.md`));
  if (!entry) return null;
  const [path, mod] = entry;
  return { slug: slugFrom(path), Component: mod.default, ...mod.metadata } as Text;
}
