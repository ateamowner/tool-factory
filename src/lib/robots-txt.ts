export type RuleKind = "allow" | "disallow";

export type RobotsRule = {
  kind: RuleKind;
  path: string;
};

export type UserAgentGroup = {
  userAgents: string[];
  rules: RobotsRule[];
};

export type RobotsTxtInput = {
  groups: UserAgentGroup[];
  sitemaps: string[];
  llmsTxtUrl?: string;
};

export type LlmsTxtInput = {
  title: string;
  summary: string;
  siteUrl: string;
};

export type RobotsPresetId =
  | "allow-all"
  | "block-all"
  | "block-ai"
  | "allow-google-block-ai";

export const AI_CRAWLERS = [
  { id: "GPTBot", label: "GPTBot" },
  { id: "ChatGPT-User", label: "ChatGPT-User" },
  { id: "OAI-SearchBot", label: "OAI-SearchBot" },
  { id: "ClaudeBot", label: "ClaudeBot" },
  { id: "anthropic-ai", label: "anthropic-ai" },
  { id: "Claude-SearchBot", label: "Claude-SearchBot" },
  { id: "Google-Extended", label: "Google-Extended" },
  { id: "CCBot", label: "CCBot" },
  { id: "Bytespider", label: "Bytespider" },
  { id: "PerplexityBot", label: "PerplexityBot" },
  { id: "Applebot-Extended", label: "Applebot-Extended" },
  { id: "Meta-ExternalAgent", label: "Meta-ExternalAgent" },
  { id: "Amazonbot", label: "Amazonbot" },
] as const;

export const ROBOTS_PRESETS: Record<
  RobotsPresetId,
  { id: RobotsPresetId; label: string }
> = {
  "allow-all": { id: "allow-all", label: "Allow all" },
  "block-all": { id: "block-all", label: "Block all" },
  "block-ai": { id: "block-ai", label: "Block AI crawlers" },
  "allow-google-block-ai": {
    id: "allow-google-block-ai",
    label: "Allow Google, block AI",
  },
};

const AI_USER_AGENTS = AI_CRAWLERS.map((crawler) => crawler.id);

export function normalizeHttpUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizeRobotsPath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("*") || trimmed === "$") {
    return trimmed;
  }
  return `/${trimmed}`;
}

function cleanUserAgents(agents: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const agent of agents) {
    const trimmed = agent.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function cleanRules(rules: RobotsRule[]): RobotsRule[] {
  return rules
    .map((rule) => ({
      kind: rule.kind,
      path: normalizeRobotsPath(rule.path),
    }))
    .filter((rule) => rule.path.length > 0);
}

export function applyRobotsPreset(id: RobotsPresetId): UserAgentGroup[] {
  if (id === "allow-all") {
    return [{ userAgents: ["*"], rules: [{ kind: "allow", path: "/" }] }];
  }

  if (id === "block-all") {
    return [{ userAgents: ["*"], rules: [{ kind: "disallow", path: "/" }] }];
  }

  const publicGroup: UserAgentGroup = {
    userAgents: id === "allow-google-block-ai" ? ["Googlebot"] : ["*"],
    rules: [{ kind: "allow", path: "/" }],
  };

  return [
    publicGroup,
    {
      userAgents: [...AI_USER_AGENTS],
      rules: [{ kind: "disallow", path: "/" }],
    },
  ];
}

export function appendAiCrawlerGroup(
  groups: UserAgentGroup[],
  userAgent: string,
): UserAgentGroup[] {
  const agent = userAgent.trim();
  if (!agent) return groups;

  const alreadyBlocked = groups.some((group) => {
    const agents = cleanUserAgents(group.userAgents);
    const rules = cleanRules(group.rules);
    return (
      agents.includes(agent) &&
      rules.some((rule) => rule.kind === "disallow" && rule.path === "/")
    );
  });
  if (alreadyBlocked) return groups;

  return [
    ...groups,
    { userAgents: [agent], rules: [{ kind: "disallow", path: "/" }] },
  ];
}

export function buildRobotsTxt(input: RobotsTxtInput): string {
  const blocks: string[] = [];
  const llmsTxtUrl = normalizeHttpUrl(input.llmsTxtUrl ?? "");
  if (llmsTxtUrl) {
    blocks.push(`# llms.txt: ${llmsTxtUrl}`);
  }

  for (const group of input.groups) {
    const userAgents = cleanUserAgents(group.userAgents);
    const rules = cleanRules(group.rules);
    if (userAgents.length === 0) continue;

    const lines = [
      ...userAgents.map((agent) => `User-agent: ${agent}`),
      ...rules.map(
        (rule) => `${rule.kind === "allow" ? "Allow" : "Disallow"}: ${rule.path}`,
      ),
    ];
    blocks.push(lines.join("\n"));
  }

  const sitemaps = input.sitemaps
    .map((value) => normalizeHttpUrl(value))
    .filter(Boolean);
  if (sitemaps.length > 0) {
    blocks.push(sitemaps.map((url) => `Sitemap: ${url}`).join("\n"));
  }

  return blocks.join("\n\n");
}

export function buildLlmsTxt(input: LlmsTxtInput): string {
  const title = input.title.trim() || "Site";
  const summary = input.summary.trim();
  const siteUrl = normalizeHttpUrl(input.siteUrl);
  const lines = [`# ${title}`, ""];

  if (summary) {
    lines.push(`> ${summary}`, "");
  }

  if (siteUrl) {
    lines.push("## Docs", `- [${title}](${siteUrl})`);
  }

  return lines.join("\n").trim();
}
