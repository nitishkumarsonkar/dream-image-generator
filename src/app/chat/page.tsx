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
      
      {/* Main Chat Container */}
      <div className="min-h-screen pt-16">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)] flex flex-col">
          {/* Header with New Chat Button */}
          <div className="mb-6 text-center animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent flex-1 whitespace-nowrap">
                AI Prompt Assistant
              </h1>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>
              </div>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Let's refine your image idea into a detailed, perfect prompt
            </p>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto glass-card p-6 mb-6 animate-slide-up">
            {messages.length === 0 && !finalPrompt && (
              <div className="text-center text-neutral-500 dark:text-neutral-400 mt-12 animate-fade-in">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Welcome to AI Assistant!</p>
                <p className="text-base max-w-md mx-auto">Tell me about the image you want to create, and I'll help you craft the perfect prompt.</p>
                <div className="mt-8 grid gap-3 max-w-lg mx-auto text-left">
                  <div className="p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-200 dark:border-primary-800">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">💡 <span className="font-medium">Tip:</span> Be specific about style, mood, colors, and composition</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 shadow-soft ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700'
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
              <div className="flex justify-start mb-4 animate-fade-in">
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-soft">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Final Prompt Display */}
          {finalPrompt && (
            <div className="mb-6 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border-2 border-primary-300 dark:border-primary-700 rounded-xl shadow-lg animate-slide-up">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white text-xl">
                  ✨
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-2">
                    Final Prompt Ready!
                  </h3>
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed bg-white/50 dark:bg-neutral-900/50 p-4 rounded-lg">
                    {finalPrompt}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateImage}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🎨</span>
                  Generate Image
                </button>
                <button
                  onClick={handleStartOver}
                  className="px-6 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg border border-neutral-300 dark:border-neutral-600 transition-all duration-300 hover:scale-105"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!finalPrompt && (
            <div className="flex gap-3 animate-slide-up">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your image idea in detail..."
                className="flex-1 resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 shadow-soft"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 disabled:from-neutral-400 disabled:to-neutral-400 disabled:cursor-not-allowed text-white font-semibold px-8 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
