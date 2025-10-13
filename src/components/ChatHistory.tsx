'use client';

import React, { useEffect, useState } from 'react';

interface ChatSession {
  id: string;
  title: string | null;
  final_prompt: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  className?: string;
}

export default function ChatHistory({
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  className,
}: ChatHistoryProps): JSX.Element {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // Fetch sessions from the API
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent session selection when clicking delete
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    setDeletingSessionId(sessionId);
    try {
      const response = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Remove from local state
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      // Call optional callback
      onDeleteSession?.(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeletingSessionId(null);
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

  const generateTitle = (session: ChatSession) => {
    if (session.title) return session.title;
    if (session.final_prompt) {
      return session.final_prompt.slice(0, 40) + (session.final_prompt.length > 40 ? '...' : '');
    }
    return 'Untitled conversation';
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

      {/* Sidebar */}
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
          <div className="p-4 border-b border-neutral-200/50 dark:border-neutral-800/50 relative bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat History
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-neutral-500 dark:text-neutral-400 text-sm">Loading...</div>
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-950/30 dark:to-accent-950/30 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  No conversations yet
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Start chatting to create history
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  const isDeleting = deletingSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      className={`
                        group relative rounded-lg transition-all duration-300 cursor-pointer
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-950/40 dark:to-accent-950/40 border-2 border-primary-300 dark:border-primary-700 shadow-soft'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700'
                        }
                      `}
                      onClick={() => !isDeleting && onSelectSession(session.id)}
                    >
                      <div className="p-3 pr-10">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`
                              text-sm font-semibold line-clamp-2
                              ${
                                isActive
                                  ? 'text-primary-900 dark:text-primary-100'
                                  : 'text-neutral-900 dark:text-neutral-100'
                              }
                            `}
                          >
                            {generateTitle(session)}
                          </h3>
                        </div>
                        <p className={`text-xs mt-1.5 font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {formatDate(session.updated_at)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        disabled={isDeleting}
                        className={`
                          absolute right-2 top-3 p-1.5 rounded-lg
                          opacity-0 group-hover:opacity-100 transition-all duration-300
                          hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        aria-label="Delete conversation"
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
          <div className="p-3 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50 dark:bg-neutral-900/50">
            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm font-semibold text-primary-700 dark:text-primary-300 bg-white dark:bg-neutral-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 border border-primary-200 dark:border-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-soft"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh History
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
