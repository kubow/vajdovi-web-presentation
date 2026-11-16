import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.INSTALLATIONS_SOURCE
  ? resolve(process.env.INSTALLATIONS_SOURCE)
  : resolve(root, '../kids-projects/arch/README.md');
const repositoryUrl = 'https://github.com/kubow/kids-projects';
const readme = await readFile(sourcePath, 'utf8');
const section = (name) => readme.split(`# ${name}`)[1]?.split('\n# ')[0] ?? '';
const listItems = (text) => text.split('\n')
  .filter((line) => line.startsWith('- '))
  .map((line) => {
    const content = line.slice(2).replace(/^\p{Extended_Pictographic}\s*/u, '');
    const link = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
    return { title: (link?.[1] ?? content).trim(), path: link?.[2] };
  });

const installations = [
  ...listItems(section('Domy, prostory')).map((item) => ({
    ...item, category: 'Prostor', icon: '🏠', href: item.path ? `${repositoryUrl}/blob/main/arch/${item.path}` : `${repositoryUrl}/tree/main/arch`
  })),
  ...listItems(section('Sochy')).map((item) => ({
    ...item, category: 'Socha', icon: '🗿', href: `${repositoryUrl}/tree/main/arch`
  }))
];

for (const installation of installations) {
  installation.people = ['Jakub', 'Viola', 'Viktor'];
}

await writeFile(resolve(root, 'static/installations.json'), `${JSON.stringify({ installations }, null, 2)}\n`);
console.log(`Wrote ${installations.length} installations`);
