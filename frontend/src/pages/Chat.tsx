import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, MessageCircle } from 'lucide-react';
import { useMCPClient } from '../hooks/use-mcp-client';
import Message from '../components/message';
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

  useEffect(() => {
    // Add welcome message on first load
    if (messages.length === 0) {
      const welcomeMessage: MessageType = {
        id: 'welcome',
        type: 'agent',
        content: `👋 Welcome to your Content Workflow Assistant! I'm here to help you create amazing content for your yoga studio.

Here are some things you can ask me to do:

🎨 **Create Visual Content:**
• "Create a poster for a beginner yoga workshop on Saturday"
• "Design a flyer for our meditation retreat"

📱 **Send Messages:**
• "Send a WhatsApp message about our new class schedule"
• "Post a message about the upcoming wellness event"

📝 **Write Content:**
• "Write a blog post about the benefits of morning yoga"
• "Create an article about stress relief techniques"

🔄 **Complete Workflow:**
• "Create everything for our summer yoga festival"
• "Set up all content for the new meditation class"

Just tell me what you need, and I'll use the right tools to help you!`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

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
        metadata: response.metadata,
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🧘‍♀️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Content Workflow Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your AI-powered content creation partner
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* AI Provider Status */}
            {aiStatus && (
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {aiStatus.currentProvider === 'openai' ? '🤖 OpenAI' : '🧠 Perplexity'}
                </span>
              </div>
            )}
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Welcome to your Content Workflow Assistant! 🧘‍♀️
              </h3>
              <p className="text-base mb-6 max-w-md mx-auto">
                I'm here to help you create engaging content for your yoga studio across all channels. 
                Just describe what you need, and I'll handle the rest!
              </p>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto mb-6">
                <button
                  onClick={() => setInput("Announce Yoga Workshop on Sept 15th at 7 PM – theme: Stress Relief Breathing")}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🎯 Workshop Announcement
                </button>
                <button
                  onClick={() => setInput("Create content for a new yoga class starting next week - focus on mindfulness")}
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🧘‍♀️ New Class Launch
                </button>
              </div>
              
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-700 dark:text-gray-300">💡 Try these examples:</p>
                <div className="space-y-1 text-xs">
                  <p>• "Announce Yoga Workshop on Sept 15th at 7 PM – theme: Stress Relief Breathing"</p>
                  <p>• "Create content for a new meditation class series"</p>
                  <p>• "Promote our weekend wellness retreat"</p>
                </div>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your yoga event or announcement..."
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isProcessing || !isConnected}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="w-6 h-6 text-gray-400">
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={!input.trim() || isProcessing || !isConnected}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Create Content</span>
                </>
              )}
            </button>
            
            {!isConnected && (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Connecting to server...</span>
              </div>
            )}
          </div>
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
