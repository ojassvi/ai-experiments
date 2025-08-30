import React from 'react';
import { MessageType } from '../types';
import { CheckCircle, AlertCircle, Clock, ExternalLink, FileText, MessageSquare, ImageIcon } from 'lucide-react';

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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary-600 text-white'
            : isError
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1 opacity-70 ${isUser ? 'text-primary-100' : ''}`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>

        {/* Task Results */}
        {message.tasks && message.tasks.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border ${
                  task.status === 'completed'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : task.status === 'failed'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTaskIcon(task.type)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getTaskTitle(task.type)}
                    </span>
                  </div>
                  {getStatusIcon(task.status)}
                </div>

                {task.status === 'completed' && task.metadata && (
                  <div className="space-y-2">
                    {task.type === 'create_poster' && task.metadata.posterUrl && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Poster:</span>
                        <a
                          href={task.metadata.posterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                        >
                          <span>View Poster</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {task.type === 'generate_whatsapp_message' && task.metadata.whatsappMessage && (
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Message:</span>
                        <p className="text-xs text-gray-800 dark:text-gray-200 mt-1">
                          {task.metadata.whatsappMessage}
                        </p>
                      </div>
                    )}

                    {task.type === 'generate_markdown_post' && task.metadata.markdownFile && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">File:</span>
                        <span className="text-xs text-gray-800 dark:text-gray-200 font-mono">
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
