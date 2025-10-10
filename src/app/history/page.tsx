"use client";

import React, { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import { savePrompt } from '@/utils/supabase/prompt-library';
import { getCurrentUser } from '@/utils/supabase/auth/user';
import { User } from '@supabase/supabase-js';

type Theme = "light" | "dark";

function getSystemPreference(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

type PromptRow = {
  id: string;
  prompt_text: string | null;
  created_at: string;
  prompt_images?: Array<{ image_url: string; image_type: 'input' | 'output' }>
};

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [addingToLibrary, setAddingToLibrary] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize theme synchronization
    const stored = (typeof window !== "undefined" && window.localStorage.getItem("theme")) as Theme | null;
    const initial = stored ?? getSystemPreference();
    applyTheme(initial);
    
    loadUser();
  }, []);

  useEffect(() => {
    // Listen for theme changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue as Theme;
        applyTheme(newTheme);
      }
    };

    // Listen for theme changes in the same tab
    window.addEventListener('storage', handleStorageChange);

    // Also listen for direct DOM changes (when ThemeToggle updates the class)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('dark')) {
            // Dark mode is active - ensure theme is applied
            applyTheme('dark');
          } else {
            // Light mode is active - ensure theme is applied
            applyTheme('light');
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await loadPrompts(currentUser.id);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('prompt')
        .select('id,prompt_text,created_at,prompt_images(image_url,image_type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to load prompts:', error);
      } else {
        setPrompts(data || []);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  };

  const handleAddToLibrary = async (promptId: string, promptText: string) => {
    if (!user) return;
    
    setAddingToLibrary(prev => new Set(prev).add(promptId));
    
    try {
      const title = promptText.slice(0, 64) + (promptText.length > 64 ? '...' : '');
      const { error } = await savePrompt({
        user_id: user.id,
        title,
        prompt: promptText,
        is_public: true,
        source_prompt_id: promptId,
      });

      if (error) {
        console.error('Failed to add to library:', error);
        alert('Failed to add to library');
      } else {
        alert('Added to library successfully!');
      }
    } catch (error) {
      console.error('Failed to add to library:', error);
      alert('Failed to add to library');
    } finally {
      setAddingToLibrary(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="app-container px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20">
        <div className="app-container px-6">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">History</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              You need to be signed in to view your history.
            </p>
            <div className="mt-4">
              <a
                href="/sign-in"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md dark:bg-white dark:text-black"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="app-container px-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">History</h1>
        {prompts.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No history yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4">
            {prompts.map((r) => {
              const inputs = (r.prompt_images || []).filter((i) => i.image_type === 'input');
              const outputs = (r.prompt_images || []).filter((i) => i.image_type === 'output');
              const date = new Date(r.created_at);
              const dateStr = date.toLocaleString();
              const isAdding = addingToLibrary.has(r.id);
              return (
                <li key={r.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{dateStr}</div>
                      <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200 break-words whitespace-pre-wrap">
                        {r.prompt_text || ''}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => r.prompt_text && handleAddToLibrary(r.id, r.prompt_text)}
                        disabled={isAdding || !r.prompt_text}
                        className="px-3 py-1.5 text-xs rounded-md border bg-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        {isAdding ? 'Adding...' : 'Add to Library'}
                      </button>
                    </div>
                  </div>

                  {inputs.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Inputs</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {inputs.map((img, idx) => (
                          <a key={`in-${idx}`} href={img.image_url} target="_blank" rel="noreferrer" className="block rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
                            <img src={img.image_url} alt={`Input ${idx + 1} — ${r.prompt_text || ''}`} className="h-24 w-24 object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {outputs.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Outputs</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {outputs.map((img, idx) => (
                          <a key={`out-${idx}`} href={img.image_url} target="_blank" rel="noreferrer" className="block rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
                            <img src={img.image_url} alt={`Output ${idx + 1} — ${r.prompt_text || ''}`} className="h-24 w-24 object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}


