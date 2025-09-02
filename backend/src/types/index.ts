export interface TaskResult {
  id: string;
  type: 'generate_whatsapp_message' | 'generate_markdown_post';
  status: 'completed' | 'failed' | 'processing';
  result?: any;
  error?: string;
  metadata?: {
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
}

export interface APIConfig {
  whatsapp: {
    apiKey: string;
    sid: string;
    phoneNumber: string;
  };
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
  };
}
