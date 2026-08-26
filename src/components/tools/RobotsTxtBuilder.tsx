"use client";

import { useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  AI_CRAWLERS,
  ROBOTS_PRESETS,
  appendAiCrawlerGroup,
  applyRobotsPreset,
  buildLlmsTxt,
  buildRobotsTxt,
  type RobotsPresetId,
  type RuleKind,
  type UserAgentGroup,
} from "@/lib/robots-txt";

type DraftRule = {
  id: string;
  kind: RuleKind;
  path: string;
};

type DraftGroup = {
  id: string;
  userAgent: string;
  rules: DraftRule[];
};

const defaultGroups: DraftGroup[] = [
  {
    id: "group-1",
    userAgent: "*",
    rules: [
      { id: "rule-1", kind: "allow", path: "/" },
      { id: "rule-2", kind: "disallow", path: "/private" },
    ],
  },
];

function toGroups(drafts: DraftGroup[]): UserAgentGroup[] {
  return drafts.map((group) => ({
    userAgents: group.userAgent.split(/[\n,]+/),
    rules: group.rules.map((rule) => ({ kind: rule.kind, path: rule.path })),
  }));
}

function fromGroups(groups: UserAgentGroup[], start: number): DraftGroup[] {
  return groups.map((group, groupIndex) => ({
    id: `group-${start + groupIndex}`,
    userAgent: group.userAgents.join(", "),
    rules: group.rules.map((rule, ruleIndex) => ({
      id: `rule-${start + groupIndex}-${ruleIndex}`,
      kind: rule.kind,
      path: rule.path,
    })),
  }));
}

export function RobotsTxtBuilder() {
  const [groups, setGroups] = useState<DraftGroup[]>(defaultGroups);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [showLlms, setShowLlms] = useState(false);
  const [llmsTxtUrl, setLlmsTxtUrl] = useState("");
  const [llmsTitle, setLlmsTitle] = useState("");
  const [llmsSummary, setLlmsSummary] = useState("");
  const nextId = useRef(10);

  function takeId(prefix: string) {
    nextId.current += 1;
    return `${prefix}-${nextId.current}`;
  }

  const robotsText = useMemo(
    () =>
      buildRobotsTxt({
        groups: toGroups(groups),
        sitemaps: sitemap
          .split(/\n+/)
          .map((value) => value.trim())
          .filter(Boolean),
        llmsTxtUrl: showLlms ? llmsTxtUrl : "",
      }),
    [groups, sitemap, showLlms, llmsTxtUrl],
  );

  const llmsText = useMemo(
    () =>
      showLlms
        ? buildLlmsTxt({
            title: llmsTitle,
            summary: llmsSummary,
            siteUrl: llmsTxtUrl.replace(/\/llms\.txt$/i, "") || sitemap.replace(/\/sitemap\.xml$/i, ""),
          })
        : "",
    [showLlms, llmsTitle, llmsSummary, llmsTxtUrl, sitemap],
  );

  function applyPreset(id: RobotsPresetId) {
    const start = nextId.current + 1;
    nextId.current += 20;
    setGroups(fromGroups(applyRobotsPreset(id), start));
  }

  function addAiCrawler(userAgent: string) {
    setGroups((current) => {
      const next = appendAiCrawlerGroup(toGroups(current), userAgent);
      if (next.length === current.length) return current;
      const added = next[next.length - 1];
      return [
        ...current,
        {
          id: takeId("group"),
          userAgent: added.userAgents.join(", "),
          rules: added.rules.map((rule) => ({
            id: takeId("rule"),
            kind: rule.kind,
            path: rule.path,
          })),
        },
      ];
    });
  }

  function updateGroup(id: string, patch: Partial<Pick<DraftGroup, "userAgent">>) {
    setGroups((current) =>
      current.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    );
  }

  function updateRule(groupId: string, ruleId: string, patch: Partial<DraftRule>) {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...patch } : rule,
              ),
            }
          : group,
      ),
    );
  }

  function addRule(groupId: string) {
    const id = takeId("rule");
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: [...group.rules, { id, kind: "disallow", path: "" }],
            }
          : group,
      ),
    );
  }

  function removeRule(groupId: string, ruleId: string) {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.length > 1
                ? group.rules.filter((rule) => rule.id !== ruleId)
                : group.rules,
            }
          : group,
      ),
    );
  }

  function addGroup() {
    const id = takeId("group");
    const ruleId = takeId("rule");
    setGroups((current) => [
      ...current,
      { id, userAgent: "", rules: [{ id: ruleId, kind: "disallow", path: "" }] },
    ]);
  }

  function removeGroup(id: string) {
    setGroups((current) => (current.length > 1 ? current.filter((group) => group.id !== id) : current));
  }

  function downloadFile(filename: string, value: string) {
    if (!value) return;
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
        <form
          className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <fieldset>
            <legend className="sr-only">Presets</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROBOTS_PRESETS) as RobotsPresetId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => applyPreset(id)}
                  className="chip inline-flex hover:border-mint/40"
                >
                  {ROBOTS_PRESETS[id].label}
                </button>
              ))}
            </div>
          </fieldset>

          {groups.map((group, index) => (
            <fieldset
              key={group.id}
              className="space-y-3 rounded-[12px] border border-line p-3 sm:p-4"
            >
              <legend className="px-1 text-xs text-muted">
                User-agent group {index + 1}
              </legend>
              <label className="block text-sm" htmlFor={`${group.id}-ua`}>
                <span className="mb-2 block text-xs text-muted">User-agent</span>
                <input
                  id={`${group.id}-ua`}
                  type="text"
                  autoComplete="off"
                  value={group.userAgent}
                  onChange={(event) =>
                    updateGroup(group.id, { userAgent: event.target.value })
                  }
                  className="input-field"
                  placeholder="* or GPTBot, ClaudeBot"
                />
              </label>
              <p className="text-xs leading-5 text-muted">
                Separate several agents with commas to share the same rules.
              </p>
              <div className="space-y-3">
                {group.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto]"
                  >
                    <label className="block text-sm" htmlFor={`${rule.id}-kind`}>
                      <span className="sr-only">Rule type</span>
                      <select
                        id={`${rule.id}-kind`}
                        value={rule.kind}
                        onChange={(event) =>
                          updateRule(group.id, rule.id, {
                            kind: event.target.value as RuleKind,
                          })
                        }
                        className="input-field"
                      >
                        <option value="allow">Allow</option>
                        <option value="disallow">Disallow</option>
                      </select>
                    </label>
                    <label className="block text-sm" htmlFor={`${rule.id}-path`}>
                      <span className="sr-only">Path</span>
                      <input
                        id={`${rule.id}-path`}
                        type="text"
                        autoComplete="off"
                        value={rule.path}
                        onChange={(event) =>
                          updateRule(group.id, rule.id, { path: event.target.value })
                        }
                        className="input-field"
                        placeholder="/admin"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRule(group.id, rule.id)}
                      disabled={group.rules.length === 1}
                      className="btn-secondary"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addRule(group.id)}
                  className="btn-secondary"
                >
                  Add rule
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  disabled={groups.length === 1}
                  className="btn-secondary"
                >
                  Remove group
                </button>
              </div>
            </fieldset>
          ))}

          <button type="button" onClick={addGroup} className="btn-secondary">
            Add user-agent group
          </button>

          <fieldset>
            <legend className="mb-2 block text-xs text-muted">Add AI crawler block</legend>
            <div className="flex flex-wrap gap-2">
              {AI_CRAWLERS.map((crawler) => (
                <button
                  key={crawler.id}
                  type="button"
                  onClick={() => addAiCrawler(crawler.id)}
                  className="chip inline-flex hover:border-mint/40"
                >
                  {crawler.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm" htmlFor="sitemap-url">
            <span className="mb-2 block text-xs text-muted">Sitemap URL</span>
            <input
              id="sitemap-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={sitemap}
              onChange={(event) => setSitemap(event.target.value)}
              className="input-field"
              placeholder="https://example.com/sitemap.xml"
            />
          </label>

          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={showLlms}
              onChange={(event) => setShowLlms(event.target.checked)}
              className="mt-1 size-4 accent-mint"
            />
            <span>Include optional llms.txt extras</span>
          </label>

          {showLlms ? (
            <div className="space-y-4 border-t border-line pt-4">
              <label className="block text-sm" htmlFor="llms-url">
                <span className="mb-2 block text-xs text-muted">llms.txt URL</span>
                <input
                  id="llms-url"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={llmsTxtUrl}
                  onChange={(event) => setLlmsTxtUrl(event.target.value)}
                  className="input-field"
                  placeholder="https://example.com/llms.txt"
                />
              </label>
              <label className="block text-sm" htmlFor="llms-title">
                <span className="mb-2 block text-xs text-muted">Site title for llms.txt</span>
                <input
                  id="llms-title"
                  type="text"
                  autoComplete="off"
                  value={llmsTitle}
                  onChange={(event) => setLlmsTitle(event.target.value)}
                  className="input-field"
                  placeholder="Example"
                />
              </label>
              <label className="block text-sm" htmlFor="llms-summary">
                <span className="mb-2 block text-xs text-muted">Short description</span>
                <textarea
                  id="llms-summary"
                  value={llmsSummary}
                  onChange={(event) => setLlmsSummary(event.target.value)}
                  rows={3}
                  className="input-field min-h-24"
                  placeholder="What AI crawlers should know about this site."
                />
              </label>
            </div>
          ) : null}

          <p className="text-sm leading-6 text-muted">
            Preview and download stay in the browser. Nothing is uploaded.
          </p>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section
            className="rounded-2xl border border-line bg-card p-5"
            aria-live="polite"
          >
            <h2 className="text-lg font-semibold">robots.txt preview</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-6 text-mint">
              {robotsText || "Add a user-agent group to preview robots.txt."}
            </pre>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CopyButton
                value={robotsText}
                label="Copy robots.txt"
                disabled={!robotsText}
                showStatus
              />
              <button
                type="button"
                onClick={() => downloadFile("robots.txt", robotsText)}
                disabled={!robotsText}
                className="btn-secondary"
              >
                Download
              </button>
            </div>
          </section>

          {showLlms ? (
            <section className="rounded-2xl border border-line bg-card p-5">
              <h2 className="text-lg font-semibold">llms.txt extras</h2>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-6 text-mint">
                {llmsText || "Add a title or llms.txt URL to preview."}
              </pre>
              <div className="mt-4">
                <CopyButton
                  value={llmsText}
                  label="Copy llms.txt"
                  disabled={!llmsText}
                />
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
