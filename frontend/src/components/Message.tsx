import React from 'react';
import { MessageType } from '../types';
import { CheckCircle, AlertCircle, Clock, ExternalLink, FileText, MessageSquare, ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'create_poster':
        return <ImageIcon className="w-4 h-4" />;
      case 'generate_whatsapp_message':
        return <MessageSquare className="w-4 h-4" />;
      case 'generate_markdown_post':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTaskTitle = (type: string) => {
    switch (type) {
      case 'create_poster':
        return 'Poster Creation';
      case 'generate_whatsapp_message':
        return 'WhatsApp Message';
      case 'generate_markdown_post':
        return 'Website Post';
      default:
        return 'Task';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    if (isUser) {
      // User messages are always plain text
      return <p className="text-sm">{message.content}</p>;
    } else {
      // AI messages may contain markdown, so render them properly
      return (
        <div className="chat-message-prose">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Customize link rendering to open in new tab
              a: ({ node, ...props }: any) => (
                <a 
                  {...props} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                />
              ),
              // Customize code blocks
              code: ({ children, className, ...props }: any) => {
                const isInline = !className || !className.includes('language-');
                return isInline ? (
                  <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" />
                ) : (
                  <code {...props} className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto" />
                );
              },
              // Customize blockquotes
              blockquote: ({ node, ...props }: any) => (
                <blockquote {...props} className="border-l-4 border-purple-500 pl-4 italic text-gray-700 dark:text-gray-300" />
              ),
              // Customize lists
              ul: ({ node, ...props }: any) => (
                <ul {...props} className="list-disc list-inside space-y-1" />
              ),
              ol: ({ node, ...props }: any) => (
                <ol {...props} className="list-decimal list-inside space-y-1" />
              ),
              // Customize headings
              h1: ({ node, ...props }: any) => (
                <h1 {...props} className="text-lg font-bold text-gray-900 dark:text-gray-100" />
              ),
              h2: ({ node, ...props }: any) => (
                <h2 {...props} className="text-base font-semibold text-gray-900 dark:text-gray-100" />
              ),
              h3: ({ node, ...props }: any) => (
                <h3 {...props} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
            : isError
            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {renderMessageContent()}
            <p className={`text-xs mt-1 opacity-70 ${isUser ? 'text-primary-100' : ''}`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>

        {/* Task Results */}
        {message.tasks && message.tasks.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Content Creation Progress
            </div>
            {message.tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  task.status === 'completed'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-sm'
                    : task.status === 'failed'
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700 shadow-sm'
                    : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getTaskTitle(task.type)}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {task.status === 'completed' ? '✅ Completed' : 
                         task.status === 'failed' ? '❌ Failed' : '⏳ Processing...'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                  </div>
                </div>

                {task.status === 'completed' && task.metadata && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    {task.type === 'create_poster' && task.metadata.posterUrl && (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🎨 Poster Created</span>
                        </div>
                        <a
                          href={task.metadata.posterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <span>View Poster</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {task.type === 'generate_whatsapp_message' && task.metadata.whatsappMessage && (
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📱 WhatsApp Message</span>
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Sent</span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-2 rounded border-l-4 border-green-500">
                          {task.metadata.whatsappMessage}
                        </p>
                      </div>
                    )}

                    {task.type === 'generate_markdown_post' && task.metadata.markdownFile && (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📝 Website Post</span>
                        </div>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-mono">
                          {task.metadata.markdownFile}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {task.status === 'failed' && task.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Error: {task.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
