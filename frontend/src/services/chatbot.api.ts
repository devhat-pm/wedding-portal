import api from './api';

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface RadaChatRequest {
  message: string;
  session_id: string;
  language: string;
  conversation_history: ChatMessageItem[];
}

export interface RadaChatResponse {
  response: string;
  topic?: string;
  log_id?: string;
}

export interface ChatbotSettings {
  chatbot_name: string;
  greeting_message_en?: string;
  greeting_message_ar?: string;
  suggested_questions_en?: string[];
  suggested_questions_ar?: string[];
}

export interface ChatbotStats {
  total_messages: number;
  unique_sessions: number;
  unanswered_count: number;
  topics: Record<string, number>;
  languages: Record<string, number>;
  helpful_count: number;
  rated_count: number;
  helpful_rate: number;
}

export interface ChatLogEntry {
  id: string;
  guest_id?: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  language: string;
  topic_detected?: string;
  was_helpful?: boolean;
  could_not_answer: boolean;
  created_at: string;
}

export interface ChatLogsResponse {
  total: number;
  logs: ChatLogEntry[];
}

// Guest-facing endpoints
export const sendRadaMessage = async (
  guestToken: string,
  request: RadaChatRequest
): Promise<RadaChatResponse> => {
  const response = await api.post(`/api/chatbot/chat/${guestToken}`, request);
  return response.data;
};

export const getChatbotSettings = async (
  guestToken: string
): Promise<ChatbotSettings> => {
  const response = await api.get(`/api/chatbot/settings/${guestToken}`);
  return response.data;
};

export const submitFeedback = async (
  logId: string,
  wasHelpful: boolean
): Promise<void> => {
  await api.post('/api/chatbot/feedback', { log_id: logId, was_helpful: wasHelpful });
};

// Admin endpoints
export const getAdminChatbotSettings = async (): Promise<ChatbotSettings> => {
  const response = await api.get('/api/chatbot/admin/settings');
  return response.data;
};

export const updateAdminChatbotSettings = async (
  data: Partial<ChatbotSettings>
): Promise<ChatbotSettings> => {
  const response = await api.put('/api/chatbot/admin/settings', data);
  return response.data;
};

export const getChatbotStats = async (): Promise<ChatbotStats> => {
  const response = await api.get('/api/chatbot/admin/stats');
  return response.data;
};

export const getChatLogs = async (
  limit = 50,
  offset = 0,
  sessionId?: string
): Promise<ChatLogsResponse> => {
  const params: Record<string, string | number> = { limit, offset };
  if (sessionId) params.session_id = sessionId;
  const response = await api.get('/api/chatbot/admin/logs', { params });
  return response.data;
};
