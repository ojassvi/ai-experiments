import { useState, useEffect, useCallback } from 'react';
import { MCPResponse } from '../types';

export const useMCPClient = () => {
  const [isConnected, setIsConnected] = useState(false);

  // Check connection status
  const checkConnection = useCallback(async () => {
    const response = await fetch('/api/health').catch(() => ({ ok: false }));
    setIsConnected(response.ok);
  }, []);

  // Send message to MCP server
  const sendMessage = useCallback(async (message: string): Promise<MCPResponse> => {
    try {
      const response = await fetch('/api/mcp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Log error for debugging (in production, this could be sent to a logging service)
      throw error;
    }
  }, []);

  // Check connection on mount and set up interval
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    sendMessage,
    isConnected,
    checkConnection,
  };
};
