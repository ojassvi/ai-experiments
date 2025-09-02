import { AIService, AIProvider } from './ai-service';
import { CanvaService } from './canva-service';
import { WhatsAppService } from './whatsapp-service';
import { MarkdownService } from './markdown-service';
import { SettingsService } from './settings-service';

export class MCPService {
  private aiService: AIService;
  private canvaService: CanvaService;
  private whatsappService: WhatsAppService;
  private markdownService: MarkdownService;
  private settingsService: SettingsService;

  constructor() {
    // Initialize AI service with configuration
    const aiConfig = {
      provider: (process.env.AI_PROVIDER as AIProvider) || 'openai',
      openaiApiKey: process.env.OPENAI_API_KEY,
      perplexityApiKey: process.env.PERPLEXITY_API_KEY,
      fallbackProvider: (process.env.AI_FALLBACK_PROVIDER as AIProvider) || 'perplexity',
    };
    
    this.aiService = new AIService(aiConfig);
    this.canvaService = new CanvaService();
    this.whatsappService = new WhatsAppService();
    this.markdownService = new MarkdownService();
    this.settingsService = new SettingsService();
  }

  async createPoster(description: string): Promise<{ url: string }> {
    try {
      // Generate poster content using LLM
      const posterPrompt = `Create a yoga studio poster for: ${description}
      
      Requirements:
      - Professional and inviting design
      - Include event details clearly
      - Use calming, wellness-focused language
      - Suggest appropriate colors and layout
      
      Return a JSON object with:
      - title: Event title
      - subtitle: Brief description
      - details: Key event details
      - colors: Suggested color scheme
      - layout: Layout suggestions`;

      const posterContent = await this.aiService.generateContent(posterPrompt);
      
      // Create poster in Canva
      const posterUrl = await this.canvaService.createPoster(posterContent);
      
      return { url: posterUrl };
    } catch (error) {
      console.error('Error creating poster:', error);
      throw new Error(`Failed to create poster: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWhatsAppMessage(description: string): Promise<{ message: string }> {
    try {
      // Generate WhatsApp message using LLM
      const whatsappPrompt = `Create a WhatsApp message for a yoga studio event: ${description}
      
      Requirements:
      - Casual, friendly tone
      - Keep under 160 characters if possible
      - Include key event details
      - Add a call-to-action
      - Use emojis appropriately
      
      Return only the message text, no additional formatting.`;

      const message = await this.aiService.generateContent(whatsappPrompt);
      
      // Send message via WhatsApp
      await this.whatsappService.sendMessage(message);
      
      return { message };
    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
      throw new Error(`Failed to generate WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateMarkdownPost(description: string): Promise<{ filename: string }> {
    try {
      // Generate markdown content using LLM
      const markdownPrompt = `Create a website blog post for a yoga studio event: ${description}
      
      Requirements:
      - SEO-friendly title and content
      - Include frontmatter with title, date, tags, description
      - Professional but warm tone
      - Include event details, benefits, and registration info
      - Use proper markdown formatting
      - 300-500 words
      
      Return the complete markdown content with frontmatter.`;

      const markdownContent = await this.aiService.generateContent(markdownPrompt);
      
      // Save as markdown file
      const filename = await this.markdownService.savePost(markdownContent, description);
      
      return { filename };
    } catch (error) {
      console.error('Error generating markdown post:', error);
      throw new Error(`Failed to generate markdown post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processWorkflow(description: string): Promise<{
    poster: { url: string };
    whatsapp: { message: string };
    markdown: { filename: string };
  }> {
    try {
      // Process all tasks in parallel for better performance
      const [posterResult, whatsappResult, markdownResult] = await Promise.all([
        this.createPoster(description),
        this.generateWhatsAppMessage(description),
        this.generateMarkdownPost(description),
      ]);

      return {
        poster: posterResult,
        whatsapp: whatsappResult,
        markdown: markdownResult,
      };
    } catch (error) {
      console.error('Error processing workflow:', error);
      throw error;
    }
  }

  getAIProviderStatus() {
    return this.aiService.getProviderStatus();
  }

  getCurrentAIProvider() {
    return this.aiService.getCurrentProvider();
  }

  switchAIProvider(provider: AIProvider) {
    this.aiService.switchProvider(provider);
  }
}
