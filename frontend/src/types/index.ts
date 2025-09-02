export interface TaskResult {
  id: string;
  type: 'generate_whatsapp_message' | 'generate_markdown_post';
  status: 'completed' | 'failed' | 'processing';
  result?: unknown;
  error?: string;
  metadata?: {
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
  metadata?: {
    whatsappMessage?: string;
    markdownFile?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface MCPResponse {
  message: string;
  tasks: TaskResult[];
  metadata?: {
    whatsappMessage?: string;
    markdownFile?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface Settings {
  whatsapp: {
    apiKey: string;
    sid: string;
    phoneNumber: string;
  };
}

export interface APIConfig {
  whatsapp: {
    apiKey: string;
    sid: string;
    phoneNumber: string;
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
