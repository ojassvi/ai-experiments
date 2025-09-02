import { AIService, AIProvider } from "./ai-service";

import { WhatsAppService } from "./whatsapp-service";
import { MarkdownService } from "./markdown-service";
import { SettingsService } from "./settings-service";

export class MCPService {
  private aiService: AIService;

  private whatsappService: WhatsAppService;
  private markdownService: MarkdownService;
  private settingsService: SettingsService;

  constructor() {
    // Initialize AI service with intelligent provider selection
    const aiConfig = {
      provider: this.selectBestProvider(),
      openaiApiKey: process.env.OPENAI_API_KEY,
      perplexityApiKey: process.env.PERPLEXITY_API_KEY,
      fallbackProvider: this.selectFallbackProvider(),
    };

    this.aiService = new AIService(aiConfig);

    this.whatsappService = new WhatsAppService();
    this.markdownService = new MarkdownService();
    this.settingsService = new SettingsService();
  }

  private selectBestProvider(): AIProvider {
    const hasOpenAI =
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== "your_openai_api_key_here";
    const hasPerplexity =
      process.env.PERPLEXITY_API_KEY &&
      process.env.PERPLEXITY_API_KEY !== "your_perplexity_api_key_here";

    // If both are available, prefer OpenAI
    if (hasOpenAI && hasPerplexity) {
      console.log(
        "🤖 Both OpenAI and Perplexity available, using OpenAI as primary"
      );
      return "openai";
    }

    // If only one is available, use that one
    if (hasOpenAI) {
      console.log("🤖 Only OpenAI available, using OpenAI as primary");
      return "openai";
    }

    if (hasPerplexity) {
      console.log("🤖 Only Perplexity available, using Perplexity as primary");
      return "perplexity";
    }

    // Fallback to OpenAI if neither is properly configured
    console.log(
      "⚠️ No properly configured providers found, defaulting to OpenAI"
    );
    return "openai";
  }

  private selectFallbackProvider(): AIProvider {
    const hasOpenAI =
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== "your_openai_api_key_here";
    const hasPerplexity =
      process.env.PERPLEXITY_API_KEY &&
      process.env.PERPLEXITY_API_KEY !== "your_perplexity_api_key_here";

    // If both are available, use the opposite as fallback
    if (hasOpenAI && hasPerplexity) {
      return "perplexity";
    }

    // If only one is available, no fallback
    if (hasOpenAI) {
      return "openai";
    }

    if (hasPerplexity) {
      return "perplexity";
    }

    // No fallback if neither is configured
    return "openai";
  }

  async analyzeUserIntent(message: string): Promise<{
    intent:
      | "chat"

      | "post_message"
      | "create_blog"
      | "workflow";
    confidence: number;
    description: string;
  }> {
    try {
      const intentPrompt = `Analyze this user message and determine their intent:

Message: "${message}"

Possible intents:
1. "chat" - User wants to have a conversation, ask questions, or get information

3. "post_message" - User wants to send/post a message to WhatsApp or social media
4. "create_blog" - User wants to create a blog post, article, or written content
5. "workflow" - User wants to do multiple things or create a complete workflow

Return a JSON object with:
{
  "intent": "one_of_the_intents_above",
  "confidence": 0.0_to_1.0,
  "description": "brief explanation of why this intent was chosen"
}

Focus on keywords like: message, send, post, share (for message); blog, article, write, content (for blog); multiple, all, everything, workflow (for workflow).`;

      const response = await this.aiService.generateContent(intentPrompt);

      try {
        const parsed = JSON.parse(response);
        return {
          intent: parsed.intent || "chat",
          confidence: parsed.confidence || 0.5,
          description: parsed.description || "Intent analysis completed",
        };
      } catch (parseError) {
        console.error("Failed to parse intent analysis:", parseError);
        // Fallback: simple keyword matching
        const lowerMessage = message.toLowerCase();
        if (
          lowerMessage.includes("message") ||
          lowerMessage.includes("send") ||
          lowerMessage.includes("post")
        ) {
          return {
            intent: "post_message",
            confidence: 0.8,
            description: "Keywords suggest message posting",
          };
        } else if (
          lowerMessage.includes("blog") ||
          lowerMessage.includes("article") ||
          lowerMessage.includes("write")
        ) {
          return {
            intent: "create_blog",
            confidence: 0.8,
            description: "Keywords suggest blog creation",
          };
        } else if (
          lowerMessage.includes("all") ||
          lowerMessage.includes("everything") ||
          lowerMessage.includes("workflow")
        ) {
          return {
            intent: "workflow",
            confidence: 0.8,
            description: "Keywords suggest complete workflow",
          };
        } else {
          return {
            intent: "chat",
            confidence: 0.6,
            description: "Default to chat mode",
          };
        }
      }
    } catch (error) {
      console.error("Error analyzing user intent:", error);
      return {
        intent: "chat",
        confidence: 0.5,
        description: "Error in intent analysis, defaulting to chat",
      };
    }
  }

  async handleUserRequest(message: string): Promise<{
    response: string;
    tasks?: any[];
    metadata?: any;
  }> {
    try {
      // First, analyze user intent
      const intent = await this.analyzeUserIntent(message);
      console.log(
        `🎯 User intent detected: ${intent.intent} (confidence: ${intent.confidence})`
      );

      // Route to appropriate handler based on intent
      switch (intent.intent) {


        case "post_message":
          return await this.handleMessagePosting(message);

        case "create_blog":
          return await this.handleBlogCreation(message);

        case "workflow":
          return await this.handleCompleteWorkflow(message);

        case "chat":
        default:
          return await this.handleChatRequest(message);
      }
    } catch (error) {
      console.error("Error handling user request:", error);
      return {
        response: `I'm sorry, I encountered an error processing your request: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again or rephrase your request.`,
      };
    }
  }



  private async handleMessagePosting(message: string) {
    const whatsappResult = await this.generateWhatsAppMessage(message);
    return {
      response: `📱 I've generated and sent a WhatsApp message for you!\n\n**Message sent:**\n${whatsappResult.message}\n\nThe message has been sent to your configured WhatsApp number with appropriate emojis and a call-to-action.`,
      metadata: { whatsappMessage: whatsappResult.message },
    };
  }

  private async handleBlogCreation(message: string) {
    const markdownResult = await this.generateMarkdownPost(message);
    return {
      response: `📝 I've created a blog post for you!\n\n**File created:** ${markdownResult.filename}\n\nThe blog post includes:\n• SEO-optimized title and content\n• Professional frontmatter with tags and description\n• Engaging content about your event\n• Proper markdown formatting\n\nYou can find the file in your content directory and publish it to your website.`,
      metadata: { markdownFile: markdownResult.filename },
    };
  }

  private async handleCompleteWorkflow(message: string) {
    const workflowResult = await this.processWorkflow(message);
    return {
      response: `🎉 Complete workflow completed! I've created everything you need:\n\n✅ **WhatsApp Message**: Sent to your configured number\n✅ **Website Post**: Created as ${workflowResult.markdown.filename}\n\nAll content has been generated and distributed across your channels. Your yoga studio event is now fully promoted!`,
      tasks: [
        {
          type: "whatsapp",
          status: "completed",
          message: "Message sent successfully",
        },
        {
          type: "blog",
          status: "completed",
          filename: workflowResult.markdown.filename,
        },
      ],
    };
  }

  private async handleChatRequest(message: string) {
    // For chat requests, provide helpful information about capabilities
    const response = await this.aiService
      .generateContent(`You are a helpful yoga studio content assistant. The user said: "${message}". 

Provide a helpful, informative response. If they seem to want to create content, suggest using specific commands like:

- "Send a message about [event]" for WhatsApp messages  
- "Write a blog post about [topic]" for written content
- "Create everything for [event]" for complete workflow

Keep your response friendly, professional, and focused on yoga/wellness content creation.`);

    return {
      response: response,
    };
  }



  async generateWhatsAppMessage(
    description: string
  ): Promise<{ message: string }> {
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
      console.error("Error generating WhatsApp message:", error);
      throw new Error(
        `Failed to generate WhatsApp message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateMarkdownPost(
    description: string
  ): Promise<{ filename: string }> {
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

      const markdownContent = await this.aiService.generateContent(
        markdownPrompt
      );

      // Save as markdown file
      const filename = await this.markdownService.savePost(
        markdownContent,
        description
      );

      return { filename };
    } catch (error) {
      console.error("Error generating markdown post:", error);
      throw new Error(
        `Failed to generate markdown post: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async processWorkflow(description: string): Promise<{
    whatsapp: { message: string };
    markdown: { filename: string };
  }> {
    try {
      // Process all tasks in parallel for better performance
      const [whatsappResult, markdownResult] = await Promise.all([
        this.generateWhatsAppMessage(description),
        this.generateMarkdownPost(description),
      ]);

      return {
        whatsapp: whatsappResult,
        markdown: markdownResult,
      };
    } catch (error) {
      console.error("Error processing workflow:", error);
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
