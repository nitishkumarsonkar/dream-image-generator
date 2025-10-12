'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import AuthGuard from '@/components/AuthGuard';
import ChatHistory from '@/components/ChatHistory';
import MarkdownText from '@/components/MarkdownText';

interface Message {
  role: 'user' | 'model';
  content: string;
}

// LocalStorage keys
const STORAGE_KEY_SESSION_ID = 'chat_current_session_id';
const STORAGE_KEY_MESSAGES = 'chat_current_messages';
const STORAGE_KEY_FINAL_PROMPT = 'chat_current_final_prompt';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session from localStorage or create new
  useEffect(() => {
    if (isInitialized) return;
    
    const storedSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const storedFinalPrompt = localStorage.getItem(STORAGE_KEY_FINAL_PROMPT);

    if (storedSessionId && storedMessages) {
      // Restore previous session
      setSessionId(storedSessionId);
      setMessages(JSON.parse(storedMessages));
      setFinalPrompt(storedFinalPrompt || '');
    } else {
      // Create new session
      setSessionId(uuidv4());
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Persist current conversation to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || !sessionId) return;
    
    localStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEY_FINAL_PROMPT, finalPrompt);
  }, [messages, sessionId, finalPrompt, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // Add user message to state
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const modelResponse = data.response;

      // Check if this is the final prompt
      if (modelResponse.startsWith('FINAL_PROMPT:')) {
        const prompt = modelResponse.replace('FINAL_PROMPT:', '').trim();
        setFinalPrompt(prompt);
        // Don't add the FINAL_PROMPT message to chat history
      } else {
        // Add model's conversational response to state
        setMessages((prev) => [...prev, { role: 'model', content: modelResponse }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateImage = () => {
    // Navigate to home page with the final prompt
    router.push(`/?prompt=${encodeURIComponent(finalPrompt)}`);
  };

  const handleStartOver = () => {
    setMessages([]);
    setFinalPrompt('');
    setSessionId(uuidv4());
  };

  const handleNewChat = async () => {
    // Save current session to database if there are messages
    if (messages.length > 0) {
      try {
        const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'Untitled';
        const title = firstUserMessage.slice(0, 50);
        
        await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            title,
            finalPrompt: finalPrompt || null,
          }),
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    // Clear current conversation and create new session
    setMessages([]);
    setFinalPrompt('');
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY_SESSION_ID);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_FINAL_PROMPT);
  };

  const handleSelectSession = async (selectedSessionId: string) => {
    // Save current session first if there are messages
    if (messages.length > 0 && sessionId !== selectedSessionId) {
      try {
        const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'Untitled';
        const title = firstUserMessage.slice(0, 50);
        
        await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            title,
            finalPrompt: finalPrompt || null,
          }),
        });
      } catch (error) {
        console.error('Error saving current session:', error);
      }
    }

    // Load selected session
    try {
      const response = await fetch(`/api/chat/sessions/${selectedSessionId}`);
      if (!response.ok) throw new Error('Failed to load session');
      
      const data = await response.json();
      setSessionId(selectedSessionId);
      setMessages(data.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })));
      setFinalPrompt(data.session.final_prompt || '');
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Failed to load conversation');
    }
  };

  const handleDeleteSession = (deletedSessionId: string) => {
    // If the deleted session is the current one, start a new chat
    if (deletedSessionId === sessionId) {
      handleNewChat();
    }
  };

  return (
    <AuthGuard>
      {/* Chat History Sidebar */}
      <ChatHistory
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
      
      {/* Added pt-16 to account for fixed header */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        {/* Changed h-screen to h-[calc(100vh-4rem)] to account for header */}
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
          {/* Header with New Chat Button */}
          <div className="mb-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1"></div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1">
                AI Image Prompt Assistant
              </h1>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Let's refine your image idea into a detailed prompt
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
            {messages.length === 0 && !finalPrompt && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p className="text-lg mb-2">👋 Welcome!</p>
                <p>Tell me about the image you want to create, and I'll help you craft the perfect prompt.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <MarkdownText content={message.content} />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Final Prompt Display */}
          {finalPrompt && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 border-2 border-green-500 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                ✨ Final Prompt Ready!
              </h3>
              <p className="text-gray-800 dark:text-gray-200 mb-4">{finalPrompt}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateImage}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  🎨 Generate Image
                </button>
                <button
                  onClick={handleStartOver}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!finalPrompt && (
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your image idea..."
                className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 rounded-lg transition-colors"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
