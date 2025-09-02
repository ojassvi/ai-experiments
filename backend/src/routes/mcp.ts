import { Router, Request, Response } from 'express';
import { MCPService } from '../services/mcp-service';
import { TaskResult } from '../types';

const router = Router();
const mcpService = new MCPService();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    console.log(`🤖 Processing MCP request: ${message}`);

    // Initialize tasks
    const tasks: TaskResult[] = [
      {
        id: '1',
        type: 'create_poster',
        status: 'processing',
      },
      {
        id: '2',
        type: 'generate_whatsapp_message',
        status: 'processing',
      },
      {
        id: '3',
        type: 'generate_markdown_post',
        status: 'processing',
      },
    ];

    // Send initial response
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    });

    // Process tasks asynchronously
    const processTasks = async () => {
      try {
        // Task 1: Create Poster
        console.log('🎨 Starting poster creation...');
        const posterResult = await mcpService.createPoster(message);
        tasks[0].status = 'completed';
        tasks[0].metadata = { posterUrl: posterResult.url };
        console.log('✅ Poster created successfully');

        // Task 2: Generate WhatsApp Message
        console.log('📱 Starting WhatsApp message generation...');
        const whatsappResult = await mcpService.generateWhatsAppMessage(message);
        tasks[1].status = 'completed';
        tasks[1].metadata = { whatsappMessage: whatsappResult.message };
        console.log('✅ WhatsApp message generated and sent');

        // Task 3: Generate Markdown Post
        console.log('📝 Starting markdown post generation...');
        const markdownResult = await mcpService.generateMarkdownPost(message);
        tasks[2].status = 'completed';
        tasks[2].metadata = { markdownFile: markdownResult.filename };
        console.log('✅ Markdown post generated');

        // Send final response
        const finalResponse = {
          message: `🎉 Content workflow completed successfully! I've created:\n\n` +
            `✅ **Poster**: [View your poster](${posterResult.url})\n` +
            `✅ **WhatsApp Message**: Sent to your configured number\n` +
            `✅ **Website Post**: Created as ${markdownResult.filename}\n\n` +
            `All content has been generated and distributed across your channels.`,
          tasks,
        };

        res.write(JSON.stringify(finalResponse));
        res.end();

      } catch (error) {
        console.error('❌ Error processing tasks:', error);
        
        // Mark failed tasks
        tasks.forEach(task => {
          if (task.status === 'processing') {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Unknown error occurred';
          }
        });

        const errorResponse = {
          message: '❌ Some tasks failed to complete. Please check the task details below.',
          tasks,
        };

        res.write(JSON.stringify(errorResponse));
        res.end();
      }
    };

    // Start processing
    processTasks();

  } catch (error) {
    console.error('❌ MCP chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process your request. Please try again.',
    });
  }
});

// Get MCP capabilities
router.get('/capabilities', (req: Request, res: Response) => {
  const capabilities = {
    name: 'yoga-studio-workflow',
    version: '1.0.0',
    capabilities: [
      {
        name: 'create_poster',
        description: 'Create a poster in Canva using the provided event description',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Description of the yoga event or announcement',
            },
          },
          required: ['description'],
        },
      },
      {
        name: 'generate_whatsapp_message',
        description: 'Generate and send a WhatsApp message for the event',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Description of the yoga event or announcement',
            },
          },
          required: ['description'],
        },
      },
      {
        name: 'generate_markdown_post',
        description: 'Generate a markdown post for the website with frontmatter',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Description of the yoga event or announcement',
            },
          },
          required: ['description'],
        },
      },
    ],
  };

  res.json(capabilities);
});

// Get AI provider status
router.get('/ai-status', (req: Request, res: Response) => {
  try {
    const providerStatus = mcpService.getAIProviderStatus();
    const currentProvider = mcpService.getCurrentAIProvider();
    
    res.json({
      currentProvider,
      providers: providerStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting AI status:', error);
    res.status(500).json({ error: 'Failed to get AI provider status' });
  }
});

// Switch AI provider
router.post('/ai-switch', (req: Request, res: Response) => {
  try {
    const { provider } = req.body;
    
    if (!provider || !['openai', 'perplexity'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider. Must be "openai" or "perplexity"' });
    }
    
    mcpService.switchAIProvider(provider as 'openai' | 'perplexity');
    
    res.json({
      message: `Switched to ${provider} provider`,
      currentProvider: mcpService.getCurrentAIProvider(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error switching AI provider:', error);
    res.status(500).json({ error: 'Failed to switch AI provider' });
  }
});

export { router as mcpRouter };
