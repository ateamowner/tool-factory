import { copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = "out";

/**
 * Next.js `output: 'export'` writes `route.html` plus a `route/` folder for
 * RSC payloads. GitHub Pages treats that folder as a directory and will not
 * serve `route.html` at `/route`. Copy the HTML to `route/index.html` so the
 * existing GSC paths keep working.
 */
async function ensureIndexHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  for (const name of dirs) {
    if (name === "_next") continue;
    const sibling = `${name}.html`;
    if (files.has(sibling)) {
      await copyFile(join(dir, sibling), join(dir, name, "index.html"));
    }
    await ensureIndexHtml(join(dir, name));
  }
}

await ensureIndexHtml(root);
