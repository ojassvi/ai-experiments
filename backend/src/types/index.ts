export interface TaskResult {
  id: string;
  type: 'create_poster' | 'generate_whatsapp_message' | 'generate_markdown_post';
  status: 'completed' | 'failed' | 'processing';
  result?: any;
  error?: string;
  metadata?: {
    posterUrl?: string;
    whatsappMessage?: string;
    markdownFile?: string;
    [key: string]: any;
  };
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

export interface PosterDesignSpec {
  title: string;
  subtitle: string;
  details: string;
  colors: string[];
  layout: string;
}

export interface WhatsAppMessageResult {
  messageId: string;
  status: string;
  to: string;
  success: boolean;
}

export interface MarkdownPostResult {
  filename: string;
  filePath: string;
  title: string;
  date: string;
}

export interface EnvironmentStatus {
  openai: boolean;
  twilio: boolean;
  canva: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: {
    node: string;
    platform: string;
    memory: NodeJS.MemoryUsage;
  };
  services: {
    openai: 'configured' | 'not_configured';
    twilio: 'configured' | 'not_configured';
    canva: 'configured' | 'not_configured';
  };
}
