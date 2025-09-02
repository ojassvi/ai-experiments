import { Router, Request, Response } from 'express';
import { MCPService } from '../services/mcp-service';
import { TaskResult } from '../types';

const router = Router();
let mcpService: MCPService | null = null;

// Lazy initialization of MCPService
const getMCPService = (): MCPService => {
  if (!mcpService) {
    mcpService = new MCPService();
  }
  return mcpService;
};

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    console.log(`🤖 Processing MCP request: ${message}`);

    // Use intelligent task routing based on user intent
    const result = await getMCPService().handleUserRequest(message);
    
    // Send response
    res.json({
      message: result.response,
      tasks: result.tasks || [],
      metadata: result.metadata || {},
      timestamp: new Date().toISOString(),
    });

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
    const providerStatus = getMCPService().getAIProviderStatus();
    const currentProvider = getMCPService().getCurrentAIProvider();
    
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
    
    getMCPService().switchAIProvider(provider as 'openai' | 'perplexity');
    
    res.json({
      message: `Switched to ${provider} provider`,
      currentProvider: getMCPService().getCurrentAIProvider(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error switching AI provider:', error);
    res.status(500).json({ error: 'Failed to switch AI provider' });
  }
});

// Complete workflow endpoint
router.post('/workflow', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required and must be a string' });
    }

    console.log(`🔄 Processing complete workflow for: ${description}`);

    const result = await getMCPService().processWorkflow(description);
    
    res.json({
      message: `🎉 Complete workflow completed successfully! I've created:\n\n` +
        `✅ **WhatsApp Message**: Sent to your configured number\n` +
        `✅ **Website Post**: Created as ${result.markdown.filename}\n\n` +
        `All content has been generated and distributed across your channels.`,
      tasks: [
        { type: 'whatsapp', status: 'completed', message: 'Message sent successfully' },
        { type: 'blog', status: 'completed', filename: result.markdown.filename }
      ],
      metadata: {
        markdownFile: result.markdown.filename
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Workflow error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process workflow. Please try again.',
    });
  }
});

export { router as mcpRouter };
