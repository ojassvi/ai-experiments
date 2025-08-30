export interface TaskResult {
  id: string;
  type: 'create_poster' | 'generate_whatsapp_message' | 'generate_markdown_post';
  status: 'completed' | 'failed' | 'processing';
  result?: unknown;
  error?: string;
  metadata?: {
    posterUrl?: string;
    whatsappMessage?: string;
    markdownFile?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface MessageType {
  id: string;
  type: 'user' | 'agent' | 'error';
  content: string;
  timestamp: Date;
  tasks?: TaskResult[];
}

export interface MCPResponse {
  message: string;
  tasks: TaskResult[];
}

export interface Settings {
  whatsapp: {
    apiKey: string;
    sid: string;
    phoneNumber: string;
  };
  canva: {
    apiKey: string;
  };
}

export interface APIConfig {
  whatsapp: {
    apiKey: string;
    sid: string;
    phoneNumber: string;
  };
  canva: {
    apiKey: string;
  };
}

export interface AIProviderStatus {
  currentProvider: 'openai' | 'perplexity';
  providers: {
    openai: boolean;
    perplexity: boolean;
  };
  primaryProvider: string;
  fallbackProvider: string;
  timestamp: string;
}
