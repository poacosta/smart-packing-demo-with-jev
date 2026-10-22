import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

const ART_EXTENSIONS = new Set([".png", ".webp", ".svg", ".jpg", ".jpeg"]);

/**
 * Maps item ids to the illustrations dropped into public/items/<id>.<ext>.
 * Items without a file fall back to their emoji placeholder.
 */
export async function getItemArt(): Promise<Record<string, string>> {
  "use cache";
  const dir = path.join(process.cwd(), "public", "items");
  const files = await readdir(dir).catch(() => [] as string[]);
  const art: Record<string, string> = {};
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ART_EXTENSIONS.has(ext)) art[path.basename(file, ext)] = `/items/${file}`;
  }
  return art;
}
