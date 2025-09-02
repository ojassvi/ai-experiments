# AI SDK Integration with Perplexity.ai

This backend now uses the [AI SDK](https://ai-sdk.dev/) to integrate with Perplexity.ai for AI-powered content generation.

## Features

- ✅ **AI SDK Core**: Unified API for text generation
- ✅ **Perplexity.ai Integration**: Access to Llama 3.1 Sonar models
- ✅ **Fallback Support**: Automatic fallback to OpenAI if Perplexity fails
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Environment-based Configuration**: Secure API key management

## Setup

### 1. Install Dependencies

The required packages are already installed:

```bash
npm install ai @ai-sdk/perplexity
```

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# AI Provider Configuration
AI_PROVIDER=perplexity
AI_FALLBACK_PROVIDER=openai

# Perplexity AI API Key (Required)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# OpenAI API Key (Optional, used as fallback)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get Your Perplexity API Key

1. Visit [Perplexity.ai Settings](https://www.perplexity.ai/settings/api)
2. Generate a new API key
3. Copy the key to your `.env` file

## Usage

### Basic Text Generation

```typescript
import { AIService } from './services/ai-service';

const aiService = new AIService({
  provider: 'perplexity',
  perplexityApiKey: process.env.PERPLEXITY_API_KEY,
  fallbackProvider: 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
});

// Generate content
const content = await aiService.generateContent('Write a yoga workshop description');
```

### Available Models

The AI SDK supports various Perplexity models:

- `llama-3.1-sonar-small-128k-online` (default)
- `llama-3.1-sonar-medium-128k-online`
- `llama-3.1-sonar-large-128k-online`
- `llama-3.1-sonar-small-128k`
- `llama-3.1-sonar-medium-128k`
- `llama-3.1-sonar-large-128k`

### Switching Models

```typescript
// In your AI service
const { text } = await generateText({
  model: perplexity('llama-3.1-sonar-medium-128k-online'),
  prompt: 'Your prompt here',
});
```

## API Endpoints

### Check AI Provider Status

```bash
GET /api/mcp/ai-status
```

Response:
```json
{
  "currentProvider": "perplexity",
  "providers": {
    "openai": true,
    "perplexity": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Switch AI Provider

```bash
POST /api/mcp/ai-switch
Content-Type: application/json

{
  "provider": "perplexity"
}
```

## Testing

### Test the Integration

Run the test script to verify everything is working:

```bash
# Set your API key
export PERPLEXITY_API_KEY=your_key_here

# Run the test
node test-ai-sdk.js
```

### Expected Output

```
🧪 Testing AI SDK with Perplexity...
✅ API key found, testing generation...
✅ AI SDK test successful!
📝 Generated text: [Generated content will appear here]
```

## Error Handling

The service includes comprehensive error handling:

- **API Key Validation**: Checks for required API keys
- **Fallback Support**: Automatically switches to OpenAI if Perplexity fails
- **Detailed Logging**: Console logs for debugging
- **Graceful Degradation**: Continues operation with available providers

## Configuration Options

### AI Service Configuration

```typescript
interface AIServiceConfig {
  provider: 'openai' | 'perplexity';
  openaiApiKey?: string;
  perplexityApiKey?: string;
  fallbackProvider?: 'openai' | 'perplexity';
}
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `AI_PROVIDER` | Primary AI provider | No | `openai` |
| `AI_FALLBACK_PROVIDER` | Fallback provider | No | `perplexity` |
| `PERPLEXITY_API_KEY` | Perplexity API key | Yes* | - |
| `OPENAI_API_KEY` | OpenAI API key | No | - |

*Required if using Perplexity as primary or fallback provider

## Troubleshooting

### Common Issues

1. **"Perplexity API key not configured"**
   - Ensure `PERPLEXITY_API_KEY` is set in your `.env` file
   - Check that the environment variable is loaded

2. **"AI SDK test failed"**
   - Verify your API key is valid
   - Check your internet connection
   - Ensure you have sufficient API credits

3. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript compilation with `npm run build`

### Debug Mode

Enable detailed logging by setting the log level:

```typescript
// In your service
console.log('🔍 Debug: API key length:', this.config.perplexityApiKey?.length);
console.log('🔍 Debug: Current provider:', this.currentProvider);
```

## Performance

- **Response Time**: Typically 2-5 seconds for content generation
- **Rate Limits**: Respects Perplexity.ai rate limits
- **Caching**: Consider implementing response caching for repeated requests
- **Concurrent Requests**: Supports multiple simultaneous requests

## Security

- **API Key Protection**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for local development
- **Input Validation**: All user inputs are validated and sanitized
- **Error Sanitization**: Error messages don't expose sensitive information

## Migration from @perplexity/ai

This implementation replaces the previous `@perplexity/ai` package with the AI SDK:

### Before (Old Implementation)
```typescript
import { Perplexity } from '@perplexity/ai';

const perplexity = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY,
});

const response = await perplexity.chat({
  model: 'llama-3.1-sonar-small-128k-online',
  messages: [...],
});
```

### After (AI SDK Implementation)
```typescript
import { generateText } from 'ai';
import { perplexity } from '@ai-sdk/perplexity';

const { text } = await generateText({
  model: perplexity('llama-3.1-sonar-small-128k-online'),
  prompt: 'Your prompt here',
});
```

## Support

- **AI SDK Documentation**: [https://ai-sdk.dev/](https://ai-sdk.dev/)
- **Perplexity.ai API**: [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
- **GitHub Issues**: Report bugs and feature requests in the project repository

## License

This integration follows the same license as the AI SDK and Perplexity.ai terms of service.
