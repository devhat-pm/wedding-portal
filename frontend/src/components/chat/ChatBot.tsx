import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Avatar, Spin, Typography, Space } from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, ChatMessage } from '../../services/chat.api';
import './ChatBot.css';

const { Text } = Typography;

interface ChatBotProps {
  weddingId?: string;
  guestToken?: string;
  position?: 'bottom-right' | 'bottom-left';
  isGuestPortal?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({
  weddingId,
  guestToken,
  position = 'bottom-right',
  isGuestPortal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your wedding assistant. I can help you with RSVPs, travel info, dress codes, activities, or any other questions. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

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
      const response = await sendChatMessage({
        message: currentInput,
        conversation_history: messages,
        wedding_id: weddingId,
        guest_token: guestToken,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting. Please try again or contact the wedding organizers.",
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

  const handleQuickQuestion = (q: string) => {
    setInputValue(q);
  };

  useEffect(() => {
    if (inputValue && messages.length <= 2) {
      // Auto-send quick questions
      const isQuickQ = quickQuestions.includes(inputValue);
      if (isQuickQ) {
        handleSend();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const quickQuestions = [
    'How do I RSVP?',
    "What's the dress code?",
    'Tell me about activities',
    'Hotel recommendations',
  ];

  const containerClass = `chatbot-container ${position}${isGuestPortal ? ' guest-portal' : ''}`;

  return (
    <div className={containerClass}>
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

      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="chatbot-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <Space>
                <Avatar icon={<RobotOutlined />} style={{ background: '#7B756D' }} />
                <div>
                  <Text strong style={{ color: '#F3F1ED' }}>
                    Wedding Assistant
                  </Text>
                  <br />
                  <Text style={{ color: '#D6C7B8', fontSize: 12 }}>Powered by AI</Text>
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
                      transition={{ delay: index * 0.05 }}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar
                          size="small"
                          icon={<RobotOutlined />}
                          style={{ background: '#B7A89A', marginRight: 8, flexShrink: 0 }}
                        />
                      )}
                      <div className={`message-bubble ${msg.role}`}>{msg.content}</div>
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
                        <span style={{ marginLeft: 8 }}>Thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 2 && (
                  <div className="quick-questions">
                    {quickQuestions.map((q, i) => (
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

export default ChatBot;
