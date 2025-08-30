import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, MessageCircle } from 'lucide-react';
import { useMCPClient } from '../hooks/useMCPClient';
import Message from '../components/Message';
import { MessageType, AIProviderStatus } from '../types';

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIProviderStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isConnected } = useMCPClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isConnected) {
      fetchAIStatus();
    }
  }, [isConnected]);

  const fetchAIStatus = async () => {
    try {
      const response = await fetch('/api/mcp/ai-status');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data);
      }
    } catch (error) {
      // Silently handle AI status fetch errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await sendMessage(input.trim());
      
      const agentMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.message,
        timestamp: new Date(),
        tasks: response.tasks,
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Workflow Chat
          </h2>
          <div className="flex items-center space-x-4">
            {/* AI Provider Status */}
            {aiStatus && (
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI: {aiStatus.currentProvider === 'openai' ? '🤖 OpenAI' : '🧠 Perplexity'}
                </span>
              </div>
            )}
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Welcome to your Yoga Studio Content Workflow!</p>
              <p className="text-sm mt-2">
                Describe an event or announcement, and I'll help you create content across all channels.
              </p>
              <div className="mt-4 text-xs space-y-1">
                <p>💡 Example: "Announce Yoga Workshop on Sept 15th at 7 PM – theme: Stress Relief Breathing"</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          
          {isProcessing && (
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span>Processing your request...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your yoga event or announcement..."
            className="input-field flex-1"
            disabled={isProcessing || !isConnected}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing || !isConnected}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Not connected to MCP server. Please check your backend connection and refresh the page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
