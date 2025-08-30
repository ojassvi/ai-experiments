import { Router, Request, Response } from 'express';
import { SettingsService } from '../services/settingsService';
import { MCPService } from '../services/mcpService';

const router = Router();
const settingsService = new SettingsService();
const mcpService = new MCPService();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const envStatus = await settingsService.getEnvironmentSettings();
    const aiStatus = mcpService.getAIProviderStatus();
    const currentAIProvider = mcpService.getCurrentAIProvider();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        node: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      },
      services: {
        openai: envStatus.openai ? 'configured' : 'not_configured',
        twilio: envStatus.twilio ? 'configured' : 'not_configured',
        canva: envStatus.canva ? 'configured' : 'not_configured',
      },
      ai: {
        currentProvider: currentAIProvider,
        providers: aiStatus,
        primaryProvider: process.env.AI_PROVIDER || 'openai',
        fallbackProvider: process.env.AI_FALLBACK_PROVIDER || 'perplexity',
      },
    };
    
    res.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req: Request, res: Response) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };
