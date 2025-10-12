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
  className?: string;
}

export default function ImageGenerationHistory({
  onSelectPrompt,
  className,
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
  }, []);

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
          fixed z-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-300 ease-in-out
          ${isOpen ? 'left-[304px] top-[72px]' : 'left-4 top-20'}
        `}
        aria-label={isOpen ? 'Close history' : 'Open history'}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 z-30
          bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800
          shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className || ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 relative">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generation History
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Prompts List */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-neutral-500 dark:text-neutral-400">Loading...</div>
              </div>
            ) : prompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No prompts yet
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Generate images to create history
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {prompts.map((prompt) => {
                  const isDeleting = deletingPromptId === prompt.id;
                  const previewImage = getPreviewImage(prompt);

                  return (
                    <div
                      key={prompt.id}
                      className="group relative rounded-lg transition-colors cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/60 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      onClick={() => !isDeleting && onSelectPrompt(prompt)}
                    >
                      <div className="p-3 pr-10 flex gap-3">
                        {/* Preview Image */}
                        {previewImage && (
                          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium line-clamp-2 text-neutral-900 dark:text-neutral-100">
                            {generateTitle(prompt)}
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {formatDate(prompt.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(prompt.id, e)}
                        disabled={isDeleting}
                        className="absolute right-2 top-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete prompt"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
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
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <button
              onClick={fetchPrompts}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Refreshing...' : 'Refresh History'}
            </button>
            
            {/* View All History Button */}
            <a
              href="/history"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View All History
            </a>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
