// Helper to get the correct base path for links
import { base } from '$app/paths';

export function withBase(path: string): string {
  return `${base}${path}`.replace(/\/\//g, '/');
}
