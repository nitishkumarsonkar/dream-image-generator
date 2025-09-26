"use client";

import React, { useState } from "react";

export type PresetKey = "instagram" | "ghibli" | "professional" | "other";

type SidebarPresetsProps = {
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onApplyCustom?: (text: string) => void;
  className?: string;
};

const PRESET_LABELS: { key: PresetKey; label: string; desc?: string }[] = [
  { key: "instagram", label: "Instagram-ready image", desc: "1080×1350, vibrant, crisp" },
  { key: "ghibli", label: "Ghibli image", desc: "Soft pastels, painterly, whimsical" },
  { key: "professional", label: "Professional image", desc: "Studio-quality, neutral bg" },
  { key: "other", label: "Other (custom)", desc: "Append your own snippet" },
];

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
    <aside className={["rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3", className].filter(Boolean).join(" ")}>
      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 px-2">Presets</h2>
      <div className="mt-2 grid gap-1">
        {PRESET_LABELS.map(({ key, label, desc }) => {
          const active = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={active ? "true" : "false"}
              className={`w-full text-left px-3 py-2 rounded-md transition
                ${active
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800/60"}`}
            >
              <div className="text-sm font-medium">{label}</div>
              {desc && <div className="text-xs opacity-80">{desc}</div>}
            </button>
          );
        })}
      </div>

      {selectedKey === "other" && (
        <div className="mt-3">
          <label htmlFor="custom-preset" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
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
    </aside>
  );
}
