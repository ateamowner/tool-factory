import { access, copyFile, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "out";

/**
 * Next.js `output: 'export'` writes `route.html` plus a `route/` folder for
 * RSC payloads. GitHub Pages treats that folder as a directory and will not
 * serve `route.html` at `/route`. Copy the HTML to `route/index.html` so the
 * existing GSC paths keep working.
 *
 * Also rewrite `.nojekyll` at the artifact root so Jekyll cannot hide `_next`
 * or skip serving `index.html` at `/`.
 */
async function ensureRootIndex() {
  await writeFile(join(root, ".nojekyll"), "");
  try {
    await access(join(root, "index.html"));
  } catch {
    throw new Error("GitHub Pages needs out/index.html to serve /");
  }
}

/** Next metadata emits origin-only canonicals as `https://ateamkit.com` (no slash). */
async function ensureHomepageCanonical() {
  const file = join(root, "index.html");
  const html = await readFile(file, "utf8");
  const next = html
    .replaceAll(
      '<link rel="canonical" href="https://ateamkit.com"/>',
      '<link rel="canonical" href="https://ateamkit.com/"/>',
    )
    .replaceAll(
      '\\"rel\\":\\"canonical\\",\\"href\\":\\"https://ateamkit.com\\"',
      '\\"rel\\":\\"canonical\\",\\"href\\":\\"https://ateamkit.com/\\"',
    );
  if (next === html || !next.includes('href="https://ateamkit.com/"')) {
    throw new Error("Expected homepage canonical https://ateamkit.com/");
  }
  await writeFile(file, next);
}

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

await ensureRootIndex();
await ensureHomepageCanonical();
await ensureIndexHtml(root);
