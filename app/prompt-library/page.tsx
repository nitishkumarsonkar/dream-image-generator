"use client";

import React, { useEffect, useState } from "react";
import { getPromptLibrary, savePrompt, deletePrompt, getLibraryItemWithImages, getUserLikes, toggleLike } from "@/utils/supabase/prompt-library";
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptLibrary | null>(null);
  const [selectedPromptImages, setSelectedPromptImages] = useState<{ inputs: string[]; outputs: string[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likingPrompt, setLikingPrompt] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    loadPrompts();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadUserLikes();
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadUserLikes = async () => {
    try {
      const { data, error } = await getUserLikes();
      if (error) {
        console.error('Failed to load user likes:', error);
      } else {
        setLikedIds(data || new Set());
      }
    } catch (error) {
      console.error('Failed to load user likes:', error);
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

  const handleShowDetails = async (prompt: PromptLibrary) => {
    setSelectedPrompt(prompt);
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    
    try {
      const { data, error } = await getLibraryItemWithImages(prompt.id);
      if (error) {
        console.error('Failed to load prompt details:', error);
        setSelectedPromptImages({ inputs: [], outputs: [] });
      } else {
        setSelectedPromptImages(data?.images || { inputs: [], outputs: [] });
      }
    } catch (error) {
      console.error('Failed to load prompt details:', error);
      setSelectedPromptImages({ inputs: [], outputs: [] });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleLike = async (promptId: string) => {
    if (!user) {
      alert('Please sign in to like prompts');
      return;
    }

    setLikingPrompt(prev => new Set(prev).add(promptId));
    
    try {
      const { error } = await toggleLike(promptId);
      if (error) {
        console.error('Failed to toggle like:', error);
        alert('Failed to update like');
      } else {
        // Optimistic update
        const isLiked = likedIds.has(promptId);
        setLikedIds(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(promptId);
          } else {
            newSet.add(promptId);
          }
          return newSet;
        });
        
        // Update the prompt's like_count in the local state
        setPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, like_count: isLiked ? p.like_count - 1 : p.like_count + 1 }
            : p
        ));
        
        // Update selected prompt if it's the same one
        if (selectedPrompt && selectedPrompt.id === promptId) {
          setSelectedPrompt(prev => prev ? {
            ...prev,
            like_count: isLiked ? prev.like_count - 1 : prev.like_count + 1
          } : null);
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('Failed to update like');
    } finally {
      setLikingPrompt(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    }
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
              <article key={prompt.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowDetails(prompt)}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(prompt.id);
                      }}
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
                <div className="mt-4 flex gap-2 items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUsePrompt(prompt.prompt);
                    }}
                    className="px-3 py-1 text-xs bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded hover:opacity-90"
                  >
                    Use Prompt
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(prompt.id);
                    }}
                    disabled={likingPrompt.has(prompt.id)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                      likedIds.has(prompt.id)
                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <svg 
                      className="w-3 h-3" 
                      fill={likedIds.has(prompt.id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                    <span>{prompt.like_count || 0}</span>
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

      {/* Details Modal */}
      {detailsModalOpen && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{selectedPrompt.title}</h2>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Prompt
                </label>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md text-sm whitespace-pre-wrap">
                  {selectedPrompt.prompt}
                </div>
              </div>

              {loadingDetails ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading images...</p>
                </div>
              ) : selectedPromptImages && (
                <>
                  {selectedPromptImages.inputs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Input Images
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPromptImages.inputs.map((url, idx) => (
                          <a key={`input-${idx}`} href={url} target="_blank" rel="noreferrer" className="block rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
                            <img src={url} alt={`Input ${idx + 1}`} className="h-24 w-24 object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPromptImages.outputs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Generated Images
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPromptImages.outputs.map((url, idx) => (
                          <a key={`output-${idx}`} href={url} target="_blank" rel="noreferrer" className="block rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
                            <img src={url} alt={`Generated ${idx + 1}`} className="h-24 w-24 object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPromptImages.inputs.length === 0 && selectedPromptImages.outputs.length === 0 && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                      No images available for this prompt.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleUsePrompt(selectedPrompt.prompt)}
                className="flex-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium rounded-md hover:opacity-90"
              >
                Use Prompt
              </button>
              
              <button
                type="button"
                onClick={() => handleToggleLike(selectedPrompt.id)}
                disabled={likingPrompt.has(selectedPrompt.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  likedIds.has(selectedPrompt.id)
                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={likedIds.has(selectedPrompt.id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                <span>{selectedPrompt.like_count || 0}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="flex-1 border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}