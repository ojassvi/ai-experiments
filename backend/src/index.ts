import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { mcpRouter } from './routes/mcp';
import { settingsRouter } from './routes/settings';
import { healthRouter } from './routes/health';

// Load environment variables from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Log environment variables
console.log('🔍 Debug: Environment variables loaded:');
console.log('🔍 PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✅ Set' : '❌ Not set');
console.log('🔍 OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('🔍 AI_PROVIDER:', process.env.AI_PROVIDER || 'Not set');
console.log('🔍 AI_FALLBACK_PROVIDER:', process.env.AI_FALLBACK_PROVIDER || 'Not set');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/mcp', mcpRouter);
app.use('/api/settings', settingsRouter);
app.use('/api', healthRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on port ${PORT}`);
  console.log(`📱 WhatsApp integration: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);

  console.log(`🤖 AI Providers:`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Perplexity: ${process.env.PERPLEXITY_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Primary: ${process.env.AI_PROVIDER || 'openai'}`);
  console.log(`   Fallback: ${process.env.AI_FALLBACK_PROVIDER || 'perplexity'}`);
});
