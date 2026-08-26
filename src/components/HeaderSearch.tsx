"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { indexToolsAndHubs, searchSite, type SearchHit } from "@/lib/search";
import { CATEGORIES, TOOLS } from "@/lib/tools";

const catalog = indexToolsAndHubs(CATEGORIES, TOOLS);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const results = searchSite(query, catalog);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(hit.href);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const hit = results[activeIndex] ?? results[0];
    if (hit) go(hit);
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <form role="search" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="tool-search">
          Find a tool
        </label>
        <div className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2.5">
          <SearchIcon />
          <input
            id="tool-search"
            ref={inputRef}
            type="search"
            value={query}
            autoComplete="off"
            placeholder="Find a tool..."
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
              if (event.key === "ArrowDown" && results.length > 0) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => (index + 1) % results.length);
              }
              if (event.key === "ArrowUp" && results.length > 0) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => (index - 1 + results.length) % results.length);
              }
            }}
          />
          <kbd className="hidden rounded-md border border-line bg-ink px-1.5 py-0.5 font-sans text-[11px] text-muted sm:inline">
            /
          </kbd>
        </div>
      </form>
      {open && query.trim() && results.length > 0 ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-line bg-card py-1 shadow-[0_16px_40px_rgb(0_0_0/0.35)]"
        >
          {results.map((hit, index) => (
            <li key={hit.href} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm ${
                  index === activeIndex ? "bg-surface text-text" : "text-text hover:bg-surface"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(hit)}
              >
                <span className="font-medium">{hit.title}</span>
                <span className="text-xs uppercase tracking-[0.12em] text-mint">
                  {hit.subtitle}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && results.length === 0 ? (
        <p className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
          No matching tool or hub.
        </p>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4 shrink-0 text-muted"
      fill="none"
    >
      <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12.5 12.5 17 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
