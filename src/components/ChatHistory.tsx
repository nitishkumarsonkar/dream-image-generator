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
        className="fixed left-4 top-20 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? 'Close history' : 'Open history'}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 z-30
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className || ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat History
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Start chatting to create history
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  const isDeleting = deletingSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      className={`
                        group relative rounded-lg transition-colors cursor-pointer
                        ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                        }
                      `}
                      onClick={() => !isDeleting && onSelectSession(session.id)}
                    >
                      <div className="p-3 pr-10">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`
                              text-sm font-medium line-clamp-2
                              ${
                                isActive
                                  ? 'text-blue-900 dark:text-blue-100'
                                  : 'text-gray-900 dark:text-gray-100'
                              }
                            `}
                          >
                            {generateTitle(session)}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(session.updated_at)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        disabled={isDeleting}
                        className={`
                          absolute right-2 top-3 p-1.5 rounded-md
                          opacity-0 group-hover:opacity-100 transition-opacity
                          hover:bg-red-50 dark:hover:bg-red-900/20
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        aria-label="Delete conversation"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Refreshing...' : 'Refresh History'}
            </button>
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
