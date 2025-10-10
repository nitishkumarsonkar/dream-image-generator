'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import AuthGuard from '@/components/AuthGuard';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

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

  return (
    <AuthGuard>
      {/* Added pt-16 to account for fixed header */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        {/* Changed h-screen to h-[calc(100vh-4rem)] to account for header */}
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Image Prompt Assistant
            </h1>
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
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
