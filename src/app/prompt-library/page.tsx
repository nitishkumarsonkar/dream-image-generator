"use client";

import React, { useEffect, useState } from "react";
import { getPromptLibrary, savePrompt, savePromptWithImages, deletePrompt, getLibraryItemWithImages, getUserLikes, toggleLike } from "@/utils/supabase/prompt-library";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { User } from "@supabase/supabase-js";
import { Database } from "@/utils/supabase/types";
import ImageUploadModal from "./components/ImageUploadModal";

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
  const [promptImages, setPromptImages] = useState<Record<string, { inputs: string[]; outputs: string[] }>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptLibrary | null>(null);
  const [selectedPromptImages, setSelectedPromptImages] = useState<{ inputs: string[]; outputs: string[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likingPrompt, setLikingPrompt] = useState<Set<string>>(new Set());
  const [inputImages, setInputImages] = useState<File[]>([]);
  const [outputImages, setOutputImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUser();
  }, []);

  // Reload prompts when user changes
  useEffect(() => {
    if (mounted) {
      loadPrompts();
    }
  }, [user, mounted]);

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
        setLikedIds(new Set());
      } else if (data instanceof Set) {
        setLikedIds(data);
      } else {
        setLikedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to load user likes:', error);
      setLikedIds(new Set());
    }
  };

  const loadPrompts = async () => {
    try {
      setLoading(true);
      // Pass user ID to get both user's own prompts and public prompts
      const { data, error } = await getPromptLibrary(user?.id);
      if (error) {
        console.error('Failed to load prompts:', error);
      } else {
        setPrompts(data || []);
        
        // Load images for all prompts
        const imagesMap: Record<string, { inputs: string[]; outputs: string[] }> = {};
        await Promise.all((data || []).map(async (prompt) => {
          const { data: promptData } = await getLibraryItemWithImages(prompt.id);
          if (promptData?.images) {
            imagesMap[prompt.id] = promptData.images;
          }
        }));
        setPromptImages(imagesMap);
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

    setIsSaving(true);

    try {
      // If there are images, use the new function
      if (inputImages.length > 0 || outputImages.length > 0) {
        const { error } = await savePromptWithImages(
          {
            user_id: user.id,
            title: titleText,
            prompt: promptText,
            category: category.trim() || null,
            is_public: isPublic,
          },
          inputImages,
          outputImages
        );

        if (error) {
          console.error('Failed to save prompt with images:', error);
          alert('Failed to save prompt');
        } else {
          setTitle('');
          setDescription('');
          setCategory('');
          setIsPublic(false);
          setInputImages([]);
          setOutputImages([]);
          setIsModalOpen(false);
          loadPrompts(); // Reload prompts
        }
      } else {
        // Use the original function for prompts without images
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
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt');
    } finally {
      setIsSaving(false);
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Public Prompt's Library</h1>
        {user && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Prompt
          </button>
        )}
      </div>

      {/* Search */}
      <section className="mt-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts by title, description, or category..."
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              aria-label="Search prompts"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mt-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <svg className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              {query.trim() ? 'No prompts found matching your search.' : 'No prompts available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <article key={prompt.id} className="glass-card p-4 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20" onClick={() => handleShowDetails(prompt)}>
                {promptImages[prompt.id]?.outputs?.length > 0 ? (
                  <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                    <img
                      src={promptImages[prompt.id].outputs[0]}
                      alt={`Generated image for ${prompt.title}`}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full mb-4 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                    <div className="text-center">
                      <svg className="mx-auto h-10 w-10 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">No image</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{prompt.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {prompt.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-md">
                          {prompt.category}
                        </span>
                      )}
                      {prompt.is_public && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 p-2 ${user ? 'cursor-pointer' : 'cursor-default'}`}>
                      {user ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLike(prompt.id);
                          }}
                          disabled={likingPrompt.has(prompt.id)}
                          className={`flex items-center gap-1 p-1.5 rounded-lg transition-all ${
                            likedIds.has(prompt.id)
                              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <svg
                            className="w-4 h-4"
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
                        </button>
                      ) : (
                        <svg
                          className="w-4 h-4 text-neutral-600 dark:text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.0 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{prompt.like_count || 0}</span>
                    </div>
                    {user?.id === prompt.user_id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(prompt.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label={`Delete ${prompt.title}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Add Prompt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 px-6 py-4 border-b border-primary-200 dark:border-primary-800 rounded-t-xl">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Add New Prompt</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter prompt title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Prompt
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                  rows={4}
                  placeholder="Enter your prompt"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="e.g., Art, Photography, Design"
                />
              </div>
              
              {/* Input Images Upload */}
              <ImageUploadModal
                title="Input Images (optional)"
                onImagesSelected={setInputImages}
                onRemove={(index) => setInputImages(prev => prev.filter((_, i) => i !== index))}
                selectedFiles={inputImages}
                maxImages={5}
                maxSizeMB={5}
              />
              
              {/* Output/Generated Images Upload */}
              <ImageUploadModal
                title="Generated Images (optional)"
                onImagesSelected={setOutputImages}
                onRemove={(index) => setOutputImages(prev => prev.filter((_, i) => i !== index))}
                selectedFiles={outputImages}
                maxImages={5}
                maxSizeMB={5}
              />
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500/50"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  Make this prompt public
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-neutral-900 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 rounded-b-xl flex gap-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Prompt'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setInputImages([]);
                  setOutputImages([]);
                }}
                disabled={isSaving}
                className="flex-1 border-2 border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 px-6 py-4 border-b border-primary-200 dark:border-primary-800 rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{selectedPrompt.title}</h2>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Prompt
                </label>
                <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-lg text-sm whitespace-pre-wrap border border-neutral-200 dark:border-neutral-700">
                  {selectedPrompt.prompt}
                </div>
              </div>

              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Loading images...</p>
                </div>
              ) : selectedPromptImages && (
                <>
                  {selectedPromptImages.inputs.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
                        Input Images
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {selectedPromptImages.inputs.map((url, idx) => (
                          <a key={`input-${idx}`} href={url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all hover:shadow-lg transform hover:scale-105">
                            <img src={url} alt={`Input ${idx + 1}`} className="w-full h-24 object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPromptImages.outputs.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
                        Generated Images
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {selectedPromptImages.outputs.map((url, idx) => (
                          <a key={`output-${idx}`} href={url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all hover:shadow-lg transform hover:scale-105">
                            <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-24 object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPromptImages.inputs.length === 0 && selectedPromptImages.outputs.length === 0 && (
                    <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                      <svg className="mx-auto h-10 w-10 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                        No images available for this prompt.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-neutral-900 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 rounded-b-xl flex gap-3">
              <button
                type="button"
                onClick={() => handleUsePrompt(selectedPrompt.prompt)}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white px-4 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Prompt
              </button>
              
              <button
                type="button"
                onClick={() => handleToggleLike(selectedPrompt.id)}
                disabled={likingPrompt.has(selectedPrompt.id)}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all duration-300 ${
                  likedIds.has(selectedPrompt.id)
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border-red-300 dark:from-red-950/30 dark:to-pink-950/30 dark:text-red-400 dark:border-red-700 shadow-lg shadow-red-500/20'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50 hover:border-primary-300 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:border-primary-700'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105`}
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
                className="flex-1 border-2 border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
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