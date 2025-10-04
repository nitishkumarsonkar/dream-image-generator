"use client";

import React, { useState } from "react";
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
