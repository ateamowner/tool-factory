import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_URL,
} from "../src/lib/indexnow.ts";
import { toPublicUrl } from "../src/lib/site.ts";
import { CATEGORIES, TOOLS } from "../src/lib/tools.ts";

const host = "ateamkit.com";
const urlList = [
  toPublicUrl("/"),
  ...Object.values(CATEGORIES).map((category) => toPublicUrl(category.href)),
  ...TOOLS.map((tool) => toPublicUrl(tool.href)),
];

async function waitForKeyFile(): Promise<void> {
  if (process.env.INDEXNOW_SKIP_WAIT === "1") return;

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const response = await fetch(INDEXNOW_KEY_URL);
      if (response.ok && (await response.text()).trim() === INDEXNOW_KEY) {
        return;
      }
    } catch {
      // Pages/Fastly can lag right after deploy.
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  throw new Error(`IndexNow key file is not live yet: ${INDEXNOW_KEY_URL}`);
}

const payload = {
  host,
  key: INDEXNOW_KEY,
  keyLocation: INDEXNOW_KEY_URL,
  urlList,
};

await waitForKeyFile();

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const body = await response.text();
console.log(`IndexNow ${response.status} ${INDEXNOW_ENDPOINT}`);
console.log(`keyLocation ${INDEXNOW_KEY_URL}`);
console.log(`urlCount ${urlList.length}`);
if (body) console.log(body);

if (response.status !== 200 && response.status !== 202) {
  process.exit(1);
}
