"use client";

import React, { useEffect, useState } from "react";
import { getPromptLibrary, savePrompt, deletePrompt } from "@/utils/supabase/prompt-library";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { User } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase/types";

type PromptLibrary = Database['public']['Tables']['prompt_library']['Row']

export default function PromptLibraryPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [prompts, setPrompts] = useState<PromptLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    loadPrompts();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await getPromptLibrary();
      if (error) {
        console.error('Failed to load prompts:', error);
      } else {
        setPrompts(data || []);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter prompts based on search query
  const filteredPrompts = prompts.filter(prompt => {
    if (!query.trim()) return true;
    const searchTerm = query.toLowerCase();
    return (
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.prompt.toLowerCase().includes(searchTerm) ||
      (prompt.category && prompt.category.toLowerCase().includes(searchTerm))
    );
  });

  const handleAdd = async () => {
    if (!user) {
      alert('Please sign in to save prompts');
      return;
    }

    const titleText = title.trim();
    const promptText = description.trim();
    
    if (!titleText || !promptText) {
      alert('Please fill in both title and prompt');
      return;
    }

    try {
      const { error } = await savePrompt({
        user_id: user.id,
        title: titleText,
        prompt: promptText,
        category: category.trim() || null,
        is_public: isPublic,
      });

      if (error) {
        console.error('Failed to save prompt:', error);
        alert('Failed to save prompt');
      } else {
        setTitle('');
        setDescription('');
        setCategory('');
        setIsPublic(false);
        setIsModalOpen(false);
        loadPrompts(); // Reload prompts
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const { error } = await deletePrompt(id);
      if (error) {
        console.error('Failed to delete prompt:', error);
        alert('Failed to delete prompt');
      } else {
        loadPrompts(); // Reload prompts
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert('Failed to delete prompt');
    }
  };

  const handleUsePrompt = (prompt: string) => {
    // Copy prompt to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      alert('Prompt copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy prompt');
    });
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Prompt Library</h1>
        {user && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Add Prompt
          </button>
        )}
      </div>

      {/* Search */}
      <section className="mt-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts..."
            className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
            aria-label="Search prompts"
          />
        </div>
      </section>

      {/* Results */}
      <section className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              {query.trim() ? 'No prompts found matching your search.' : 'No prompts available.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <article key={prompt.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{prompt.title}</h3>
                    <p className="text-xs text-neutral-500">
                      {new Date(prompt.created_at).toLocaleString()}
                    </p>
                    {prompt.category && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded">
                        {prompt.category}
                      </span>
                    )}
                    {prompt.is_public && (
                      <span className="inline-block mt-1 ml-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded">
                        Public
                      </span>
                    )}
                  </div>
                  {user && user.id === prompt.user_id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(prompt.id)}
                      className="text-xs text-red-600 hover:underline"
                      aria-label={`Delete ${prompt.title}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 flex-1">
                  {prompt.prompt}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUsePrompt(prompt.prompt)}
                    className="px-3 py-1 text-xs bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded hover:opacity-90"
                  >
                    Use Prompt
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Add Prompt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Add New Prompt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  placeholder="Enter prompt title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Prompt
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Enter your prompt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  placeholder="e.g., Art, Photography, Design"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-700"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Make this prompt public
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium rounded-md hover:opacity-90"
              >
                Save Prompt
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}