import OpenAI from 'openai';
import { Perplexity } from '@perplexity/ai';

export type AIProvider = 'openai' | 'perplexity';

export interface AIServiceConfig {
  provider: AIProvider;
  openaiApiKey?: string;
  perplexityApiKey?: string;
  fallbackProvider?: AIProvider;
}

export class AIService {
  private openai: OpenAI | null = null;
  private perplexity: Perplexity | null = null;
  private config: AIServiceConfig;
  private currentProvider: AIProvider;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.currentProvider = config.provider;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    if (this.config.openaiApiKey) {
      try {
        this.openai = new OpenAI({
          apiKey: this.config.openaiApiKey,
        });
        console.log('✅ OpenAI service initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize OpenAI:', error);
      }
    }

    // Initialize Perplexity
    if (this.config.perplexityApiKey) {
      try {
        this.perplexity = new Perplexity({
          apiKey: this.config.perplexityApiKey,
        });
        console.log('✅ Perplexity AI service initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Perplexity:', error);
      }
    }

    // Validate current provider
    if (!this.isProviderAvailable(this.currentProvider)) {
      if (this.config.fallbackProvider && this.isProviderAvailable(this.config.fallbackProvider)) {
        console.log(`⚠️ Primary provider ${this.currentProvider} not available, falling back to ${this.config.fallbackProvider}`);
        this.currentProvider = this.config.fallbackProvider;
      } else {
        const availableProvider = this.getAvailableProvider();
        if (availableProvider) {
          console.log(`⚠️ No configured providers available, using ${availableProvider}`);
          this.currentProvider = availableProvider;
        } else {
          throw new Error('No AI providers available. Please configure OpenAI or Perplexity API keys.');
        }
      }
    }
  }

  private isProviderAvailable(provider: AIProvider): boolean {
    switch (provider) {
      case 'openai':
        return this.openai !== null;
      case 'perplexity':
        return this.perplexity !== null;
      default:
        return false;
    }
  }

  private getAvailableProvider(): AIProvider | null {
    if (this.openai) return 'openai';
    if (this.perplexity) return 'perplexity';
    return null;
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      switch (this.currentProvider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt);
        case 'perplexity':
          return await this.generateWithPerplexity(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error(`Error with ${this.currentProvider}:`, error);
      
      // Try fallback provider
      if (this.config.fallbackProvider && this.currentProvider !== this.config.fallbackProvider) {
        console.log(`🔄 Trying fallback provider: ${this.config.fallbackProvider}`);
        this.currentProvider = this.config.fallbackProvider;
        return await this.generateContent(prompt);
      }
      
      throw error;
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI service not initialized');
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content creator specializing in yoga and wellness content. Create engaging, informative, and well-structured content based on the user\'s requirements.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    return content;
  }

  private async generateWithPerplexity(prompt: string): Promise<string> {
    if (!this.perplexity) {
      throw new Error('Perplexity AI service not initialized');
    }

    const response = await this.perplexity.chat({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content creator specializing in yoga and wellness content. Create engaging, informative, and well-structured content based on the user\'s requirements.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from Perplexity AI');
    }

    return content;
  }

  async generatePosterContent(eventDescription: string): Promise<{
    title: string;
    subtitle: string;
    details: string;
    colors: string[];
    layout: string;
  }> {
    const prompt = `Create a yoga studio poster design specification for: ${eventDescription}
    
    Return a valid JSON object with these exact fields:
    {
      "title": "Event title (max 40 characters)",
      "subtitle": "Brief description (max 60 characters)",
      "details": "Key event details (max 120 characters)",
      "colors": ["primary color", "secondary color", "accent color"],
      "layout": "Layout description (e.g., 'centered with image above text')"
    }
    
    Make it professional, inviting, and wellness-focused.`;

    const content = await this.generateContent(prompt);
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      
      // Validate required fields
      if (!parsed.title || !parsed.subtitle || !parsed.details || !parsed.colors || !parsed.layout) {
        throw new Error('Invalid JSON structure');
      }
      
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback: create a basic structure
      return {
        title: 'Yoga Workshop',
        subtitle: 'Join us for a transformative experience',
        details: eventDescription.substring(0, 120),
        colors: ['#4F46E5', '#10B981', '#F59E0B'],
        layout: 'centered with calming imagery',
      };
    }
  }

  async generateWhatsAppMessage(eventDescription: string): Promise<string> {
    const prompt = `Create a WhatsApp message for a yoga studio event: ${eventDescription}
    
    Requirements:
    - Casual, friendly tone
    - Keep under 160 characters if possible
    - Include key event details
    - Add a call-to-action
    - Use emojis appropriately (max 3-4 emojis)
    
    Return only the message text, no additional formatting or quotes.`;

    return await this.generateContent(prompt);
  }

  async generateMarkdownPost(eventDescription: string): Promise<string> {
    const prompt = `Create a website blog post for a yoga studio event: ${eventDescription}
    
    Requirements:
    - SEO-friendly title and content
    - Include frontmatter with title, date, tags, description
    - Professional but warm tone
    - Include event details, benefits, and registration info
    - Use proper markdown formatting
    - 300-500 words
    
    Format the frontmatter exactly like this:
    ---
    title: "Event Title"
    date: "YYYY-MM-DD"
    tags: ["yoga", "workshop", "wellness"]
    description: "Brief description for SEO"
    ---
    
    Then include the full blog post content below.`;

    return await this.generateContent(prompt);
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      openai: this.openai !== null,
      perplexity: this.perplexity !== null,
    };
  }

  switchProvider(provider: AIProvider): void {
    if (this.isProviderAvailable(provider)) {
      this.currentProvider = provider;
      console.log(`🔄 Switched to ${provider} provider`);
    } else {
      throw new Error(`Provider ${provider} is not available`);
    }
  }
}
