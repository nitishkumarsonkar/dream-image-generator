/**
 * Type definitions for the AI Chat feature
 */

export interface ChatMessage {
  id?: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'model';
  content: string;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatAPIRequest {
  message: string;
  sessionId: string;
}

export interface ChatAPIResponse {
  response: string;
  sessionId: string;
}

export interface ChatAPIError {
  error: string;
  details?: string;
}
