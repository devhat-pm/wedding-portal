import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Avatar, Spin, Typography, Space, Tooltip } from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
  ExpandOutlined,
  MinusOutlined,
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  sendRadaMessage,
  getChatbotSettings,
  submitFeedback,
  type ChatMessageItem,
  type ChatbotSettings,
} from '../../services/chatbot.api';
import './ChatBot.css';

const { Text } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  logId?: string;
  feedback?: 'helpful' | 'not_helpful';
}

interface RadaChatbotProps {
  guestToken: string;
  guestName?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const RadaChatbot: React.FC<RadaChatbotProps> = ({
  guestToken,
  guestName,
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const language = 'en';
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [sessionId] = useState(generateSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Fetch chatbot settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getChatbotSettings(guestToken);
        setSettings(data);
      } catch {
        // Use defaults
      }
    };
    fetchSettings();
  }, [guestToken]);

  // Set initial greeting message when settings load
  useEffect(() => {
    if (settings && messages.length === 0) {
      const greeting = settings.greeting_message_en;

      const name = settings.chatbot_name || 'Rada';
      const defaultGreeting = `Hello${guestName ? ` ${guestName}` : ''}! I'm ${name}, your wedding assistant. How can I help you today?`;

      setMessages([
        {
          role: 'assistant',
          content: greeting || defaultGreeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [settings, language, guestName, messages.length]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const history: ChatMessageItem[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendRadaMessage(guestToken, {
        message: currentInput,
        session_id: sessionId,
        language,
        conversation_history: history,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        logId: result.log_id,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorContent = "I'm sorry, I'm having trouble connecting. Please try again.";

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = async (q: string) => {
    setInputValue(q);
    // Let the user see the question then auto-send
    setTimeout(async () => {
      const userMessage: ChatMessage = {
        role: 'user',
        content: q,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const history: ChatMessageItem[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const result = await sendRadaMessage(guestToken, {
          message: q,
          session_id: sessionId,
          language,
          conversation_history: history,
        });

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.response,
            timestamp: new Date(),
            logId: result.log_id,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleFeedback = async (messageIndex: number, helpful: boolean) => {
    const msg = messages[messageIndex];
    if (!msg.logId) return;

    try {
      await submitFeedback(msg.logId, helpful);
      setMessages((prev) =>
        prev.map((m, i) =>
          i === messageIndex ? { ...m, feedback: helpful ? 'helpful' : 'not_helpful' } : m
        )
      );
    } catch {
      // Silently fail
    }
  };

  const suggestedQuestions =
    settings?.suggested_questions_en || [
      "What's the schedule?",
      'Where is the venue?',
      'How do I RSVP?',
      'Hotel recommendations?',
    ];

  const chatbotName = settings?.chatbot_name || 'Rada';

  return (
    <div className={`chatbot-container ${position} guest-portal`}>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<MessageOutlined />}
              onClick={() => setIsOpen(true)}
              className="chatbot-toggle-btn"
              style={{
                width: 60,
                height: 60,
                background: '#B7A89A',
                border: 'none',
                boxShadow: '0 4px 20px rgba(183, 168, 154, 0.4)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ direction: 'ltr' }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <Space>
                <Avatar icon={<RobotOutlined />} style={{ background: '#7B756D' }} />
                <div>
                  <Text strong style={{ color: '#F3F1ED' }}>
                    {chatbotName}
                  </Text>
                  <br />
                  <Text style={{ color: '#D6C7B8', fontSize: 12 }}>
                    Wedding Assistant
                  </Text>
                </div>
              </Space>
              <Space>
                <Button
                  type="text"
                  icon={isMinimized ? <ExpandOutlined /> : <MinusOutlined />}
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{ color: '#F3F1ED' }}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setIsOpen(false)}
                  className="chatbot-close-btn"
                  style={{ color: '#F3F1ED' }}
                />
              </Space>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="chatbot-messages">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      className={`chat-message ${msg.role}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar
                          size="small"
                          icon={<RobotOutlined />}
                          style={{ background: '#B7A89A', marginRight: 8, flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <div className={`message-bubble ${msg.role}`}>{msg.content}</div>
                        {/* Feedback buttons for assistant messages */}
                        {msg.role === 'assistant' && msg.logId && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, marginLeft: 4 }}>
                            <Button
                              type="text"
                              size="small"
                              icon={msg.feedback === 'helpful' ? <LikeFilled style={{ color: '#52c41a' }} /> : <LikeOutlined />}
                              onClick={() => handleFeedback(index, true)}
                              style={{ fontSize: 11, padding: '0 4px', height: 22, color: '#9A9187' }}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={msg.feedback === 'not_helpful' ? <DislikeFilled style={{ color: '#ff4d4f' }} /> : <DislikeOutlined />}
                              onClick={() => handleFeedback(index, false)}
                              style={{ fontSize: 11, padding: '0 4px', height: 22, color: '#9A9187' }}
                            />
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ background: '#9A9187', marginLeft: 8, flexShrink: 0 }}
                        />
                      )}
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="chat-message assistant">
                      <Avatar
                        size="small"
                        icon={<RobotOutlined />}
                        style={{ background: '#B7A89A', marginRight: 8, flexShrink: 0 }}
                      />
                      <div className="message-bubble assistant typing">
                        <Spin size="small" />
                        <span style={{ marginLeft: 8 }}>
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 2 && (
                  <div className="quick-questions">
                    {suggestedQuestions.map((q, i) => (
                      <Button
                        key={i}
                        size="small"
                        onClick={() => handleQuickQuestion(q)}
                        style={{
                          background: '#E5CEC0',
                          border: 'none',
                          color: '#7B756D',
                          borderRadius: 16,
                          fontSize: 12,
                        }}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="chatbot-input">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your question..."
                    disabled={isLoading}
                    suffix={
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        loading={isLoading}
                        disabled={!inputValue.trim()}
                        size="small"
                        style={{
                          background: inputValue.trim() ? '#B7A89A' : '#D6C7B8',
                          border: 'none',
                          borderRadius: 8,
                        }}
                      />
                    }
                    style={{
                      borderRadius: 24,
                      padding: '8px 16px',
                    }}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RadaChatbot;
