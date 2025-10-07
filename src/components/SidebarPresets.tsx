"use client";

import React, { useEffect, useState } from "react";
import { PRESETS, PresetKey, formatResolution } from "../lib/presets";

type SidebarPresetsProps = {
  selectedKey: PresetKey | null;
  onSelect: (key: PresetKey) => void;
  onApplyCustom?: (text: string) => void;
  className?: string;
};

/* CHANGE: Use centralized typed preset registry.
   Keep explicit order for a predictable UX. */
const ORDER: PresetKey[] = ["instagram", "ghibli", "professional", "other"];

export default function SidebarPresets({
  selectedKey,
  onSelect,
  onApplyCustom,
  className,
}: SidebarPresetsProps): JSX.Element {
  const [customText, setCustomText] = useState("");

  const handleApply = () => {
    const t = customText.trim();
    if (!t) return;
    onApplyCustom?.(t);
    setCustomText("");
  };

  return (
    <aside
      className={[
        "rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 px-2">
        Presets
      </h2>
      <div className="mt-2 grid gap-1">
        {ORDER.map((key) => {
          const p = PRESETS[key];
          const label = p.label;
          const desc = p.desc;
          const active = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={active ? "true" : "false"}
              className={`w-full text-left px-3 py-2 rounded-md transition
                ${
                  active
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800/60"
                }`}
            >
              <div className="text-sm font-medium">{label}</div>
              {desc && <div className="text-xs opacity-80">{desc}</div>}
              {key !== "other" && (
                <div className="mt-1 flex gap-2 text-[10px] text-neutral-600 dark:text-neutral-400">
                  <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                    {p.ratio}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-0.5">
                    {formatResolution(p)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedKey === "other" && (
        <div className="mt-3">
          <label
            htmlFor="custom-preset"
            className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1"
          >
            Custom snippet to append
          </label>
          <textarea
            id="custom-preset"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Describe extra style, format, mood, etc."
            className="w-full h-24 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm p-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              disabled={!customText.trim()}
              className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setCustomText("")}
              className="btn-ghost"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <a
          href="/history"
          className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
        >
          History
        </a>
      </div>
    </aside>
  );
}

/* Sidebar context and mobile/desktop containers + toggle button */

type SidebarCtxState = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarCtx = React.createContext<SidebarCtxState | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(true);

  // Initialize default as open on desktop (md+), closed on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    setOpen(isDesktop);
  }, []);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  return (
    <SidebarCtx.Provider value={{ open, toggle, close }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebar() {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

/**
 * SidebarToggleButton
 * - Uses the provided SVG markup (converted to JSX) as a toggle.
 * - Works on both desktop and mobile. Always visible where mounted.
 */
export function SidebarToggleButton(): JSX.Element {
  const { open, toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={open ? "true" : "false"}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/90 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 group fixed left-4 top-4 z-[60]"
      title={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      <div className="relative">
        {/* First icon (visible when expanded) */}
        <div
          className={`flex items-center justify-center transition ${
            open ? "opacity-100 scale-100" : "opacity-0 scale-75"
          } text-text-300 text-neutral-400`}
          style={{ width: 20, height: 20 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition"
            aria-hidden="true"
          >
            <path d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"></path>
          </svg>
        </div>

        {/* Second icon (visible when collapsed) */}
        <div
          className={`flex items-center justify-center absolute inset-0 transition-all ${
            open ? "opacity-0 scale-75" : "opacity-100 scale-100"
          } text-text-200 text-neutral-300`}
          style={{ width: 20, height: 20 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-all"
            aria-hidden="true"
          >
            <path d="M16.5 3C16.7761 3 17 3.22386 17 3.5V16.5L16.9902 16.6006C16.9437 16.8286 16.7417 17 16.5 17C16.2583 17 16.0563 16.8286 16.0098 16.6006L16 16.5V3.5C16 3.22386 16.2239 3 16.5 3ZM8.12793 5.16504C8.28958 4.98547 8.5524 4.95058 8.75293 5.06836L8.83496 5.12793L13.835 9.62793C13.9403 9.72275 14 9.85828 14 10C14 10.1063 13.9667 10.2093 13.9053 10.2939L13.835 10.3721L8.83496 14.8721C8.62972 15.0568 8.31267 15.0402 8.12793 14.835C7.94322 14.6297 7.95984 14.3127 8.16504 14.1279L12.1963 10.5H3.5C3.22386 10.5 3 10.2761 3 10C3 9.72386 3.22386 9.5 3.5 9.5H12.1963L8.16504 5.87207L8.09766 5.79688C7.95931 5.60979 7.96622 5.34471 8.12793 5.16504Z"></path>
          </svg>
        </div>
      </div>
    </button>
  );
}

/**
 * SidebarDesktop
 * - Fixed desktop sidebar that collapses via translate when closed.
 */
export function SidebarDesktop(props: SidebarPresetsProps): JSX.Element {
  const { open } = useSidebar();
  return (
    <aside
      className={`hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] z-30 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto transform transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarPresets {...props} />
    </aside>
  );
}

/**
 * SidebarDrawer
 * - Mobile drawer + overlay controlled by the same context state.
 */
export function SidebarDrawer(props: SidebarPresetsProps): JSX.Element | null {
  const { open, close } = useSidebar();
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={close}
      />
      <aside
        id="mobile-sidebar"
        className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-3"
        aria-label="Sidebar presets"
      >
        <SidebarPresets {...props} />
      </aside>
    </div>
  );
}
