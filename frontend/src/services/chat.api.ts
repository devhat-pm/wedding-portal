import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  wedding_id?: string;
  guest_token?: string;
}

export const sendChatMessage = async (request: ChatRequest): Promise<string> => {
  const response = await api.post('/api/chat/', request);
  return response.data.response;
};

export const streamChatMessage = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: () => void
) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          onComplete();
          return;
        }
        onChunk(data);
      }
    }
  }
};
