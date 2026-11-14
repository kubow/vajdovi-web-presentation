// Helper to get the correct base path for links
import { resolve } from '$app/paths';

export function withBase(path: string): string {
  return resolve(path);
}
