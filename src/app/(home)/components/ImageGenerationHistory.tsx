'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface PromptHistoryItem {
  id: string;
  prompt_text: string | null;
  created_at: string;
  prompt_images?: Array<{ image_url: string; image_type: 'input' | 'output' }>;
}

interface ImageGenerationHistoryProps {
  onSelectPrompt: (promptData: PromptHistoryItem) => void;
  onNewChat?: () => void;
  className?: string;
  onOpenChange?: (isOpen: boolean) => void; // Add this to communicate state up
}

export default function ImageGenerationHistory({
  onSelectPrompt,
  onNewChat,
  className,
  onOpenChange,
}: ImageGenerationHistoryProps): JSX.Element {
  const [prompts, setPrompts] = useState<PromptHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null);

  // Fetch prompts from the database
  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPrompts([]);
        return;
      }

      const { data, error } = await supabase
        .from('prompt')
        .select(`
          id,
          prompt_text,
          created_at,
          prompt_images (
            image_url,
            image_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching prompts:', error);
        return;
      }

      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize default state based on screen size
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    setIsOpen(isDesktop);
    onOpenChange?.(isDesktop);
  }, []);

  // Sync state changes with parent
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen]);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDelete = async (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent prompt selection when clicking delete
    
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    setDeletingPromptId(promptId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('prompt')
        .delete()
        .eq('id', promptId);

      if (error) {
        throw new Error('Failed to delete prompt');
      }

      // Remove from local state
      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt');
    } finally {
      setDeletingPromptId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const generateTitle = (prompt: PromptHistoryItem) => {
    if (prompt.prompt_text) {
      return prompt.prompt_text.slice(0, 60) + (prompt.prompt_text.length > 60 ? '...' : '');
    }
    return 'Untitled prompt';
  };

  const getPreviewImage = (prompt: PromptHistoryItem) => {
    const outputImages = prompt.prompt_images?.filter(img => img.image_type === 'output') || [];
    return outputImages[0]?.image_url || null;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-primary-200 dark:border-primary-800 rounded-lg p-2 shadow-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-300 ease-in-out hover:scale-110
          ${isOpen ? 'left-[304px] top-[72px]' : 'left-4 top-20'}
        `}
        aria-label={isOpen ? 'Close history' : 'Open history'}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-primary-700 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 z-30
          bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-r border-neutral-200/50 dark:border-neutral-800/50
          shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className || ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50 flex flex-col gap-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              History
              <span className="text-xs normal-case bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full font-medium ml-auto">
                {prompts.length}
              </span>
            </h2>
          </div>

          {/* Prompts List */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-neutral-500 dark:text-neutral-400 text-sm">Loading...</div>
                </div>
              </div>
            ) : prompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-50 to-neutral-50 dark:from-primary-900/20 dark:to-neutral-900/20 flex items-center justify-center mb-4 ring-1 ring-inset ring-primary-100 dark:ring-primary-800/30">
                  <svg className="w-10 h-10 text-primary-300 dark:text-primary-700 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  No creations yet
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Start generating to see your history build up here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {prompts.map((prompt) => {
                  const isDeleting = deletingPromptId === prompt.id;
                  const previewImage = getPreviewImage(prompt);

                  return (
                    <div
                      key={prompt.id}
                      className="group relative rounded-lg transition-all duration-300 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-950/30 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-soft"
                      onClick={() => !isDeleting && onSelectPrompt(prompt)}
                    >
                      <div className="p-3 pr-10 flex gap-3">
                        {/* Preview Image */}
                        {previewImage && (
                          <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-950/50 dark:to-accent-950/50 ring-2 ring-primary-200 dark:ring-primary-800">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold line-clamp-2 text-neutral-900 dark:text-neutral-100">
                            {generateTitle(prompt)}
                          </h3>
                          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5 font-medium">
                            {formatDate(prompt.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(prompt.id, e)}
                        disabled={isDeleting}
                        className="absolute right-2 top-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete prompt"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 text-neutral-400 hover:text-red-500 dark:hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="p-3 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm grid grid-cols-2 gap-2">
            <button
              onClick={fetchPrompts}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Refresh History"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <a
              href="/history"
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
            >
              <span>View All</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
