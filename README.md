# 🧘‍♀️ Yoga Studio Content Workflow

A comprehensive MCP (Model Context Protocol) client + agent workflow that automates content creation for yoga studios across multiple channels.

## 🎯 Features

- **🎨 Canva Integration**: Automatically create professional posters for yoga events
- **📱 WhatsApp Business API**: Send personalized messages to your community
- **📝 Website Content**: Generate SEO-friendly markdown posts with frontmatter
- **🤖 AI-Powered**: Uses OpenAI GPT-4 or Perplexity AI for intelligent content generation
- **🌓 Dark/Light Mode**: Beautiful, responsive UI with system preference detection
- **🔐 Secure**: Encrypted storage of API keys and sensitive data
- **📱 Responsive**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js Backend│    │  External APIs  │
│                 │    │                 │    │                 │
│ • Chat Interface│◄──►│ • MCP Server    │◄──►│ • OpenAI GPT-4  │
│ • Settings Page │    │ • Task Orchestr.│    │ • Canva API     │
│ • Dark/Light    │    │ • API Services  │    │ • Twilio WhatsApp│
│ • Responsive UI │    │ • File Storage  │    │ • File System   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key OR Perplexity AI API key (or both for fallback)
- Twilio account (for WhatsApp Business API)
- Canva Developer account (optional, for real poster creation)

### 1. Clone and Install

```bash
git clone <repository-url>
cd social-media-workflow
npm run install:all
```

### 2. Environment Setup

```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your API keys
```

### 3. Start Development Servers

```bashm he prot as we
a wellll
# From root directory
npm run dev
```

This starts both:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## ⚙️ Configuration

### Required Environment Variables

```bash
# AI Provider Configuration
AI_PROVIDER=openai  # Options: openai, perplexity
AI_FALLBACK_PROVIDER=perplexity  # Fallback if primary fails

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Perplexity AI Configuration
PERPLEXITY_API_KEY=your_perplexity_api_key

# Twilio (Required for WhatsApp)
TWILIO_ACCOUNT_SID=ACyour-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Canva (Optional - falls back to simulation)
CANVA_API_KEY=your-canva-api-key

# Security
ENCRYPTION_KEY=your-32-char-encryption-key
```

### API Key Setup

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. **Perplexity AI**: Get your API key from [Perplexity AI](https://www.perplexity.ai/settings/api)
3. **Twilio**: Sign up at [Twilio](https://www.twilio.com/) and enable WhatsApp Business API
4. **Canva**: Apply for developer access at [Canva Developers](https://www.canva.dev/)

## 💡 Usage Example

### Input
```
"Announce Yoga Workshop on Sept 15th at 7 PM – theme: Stress Relief Breathing"
```

### Output
The system automatically:

1. **🎨 Creates a Poster** (Canva)
   - Generates design specifications using AI
   - Creates poster with appropriate colors and layout
   - Returns shareable link

2. **📱 Sends WhatsApp Message**
   - Generates casual, friendly message
   - Sends via Twilio WhatsApp Business API
   - Confirms delivery status

3. **📝 Creates Website Post**
   - Generates SEO-friendly markdown content
   - Includes frontmatter (title, date, tags, description)
   - Saves to `./content/events/2025-09-15-stress-relief-breathing.md`

## 🔧 MCP Capabilities

### AI Provider Management
- **Provider Selection**: Choose between OpenAI GPT-4 and Perplexity AI
- **Automatic Fallback**: Seamlessly switch providers if one fails
- **Real-time Switching**: Change providers via API endpoints
- **Status Monitoring**: View current provider and availability

### 1. `create_poster`
- **Purpose**: Create professional yoga event posters
- **Input**: Event description
- **Output**: Canva poster URL
- **AI Enhancement**: Intelligent design suggestions

### 2. `generate_whatsapp_message`
- **Purpose**: Create and send WhatsApp messages
- **Input**: Event description
- **Output**: Sent message confirmation
- **AI Enhancement**: Casual, engaging tone optimization

### 3. `generate_markdown_post`
- **Purpose**: Create website blog posts
- **Input**: Event description
- **Output**: Markdown file with frontmatter
- **AI Enhancement**: SEO optimization and professional content

## 🎨 Frontend Features

- **Chat Interface**: Intuitive conversation flow
- **Real-time Updates**: Live task status tracking
- **Responsive Design**: Works on all devices
- **Theme Toggle**: Light/dark mode with system preference detection
- **Settings Management**: Secure API key configuration
- **Task Results**: Visual feedback for all completed tasks

## 🔒 Security Features

- **Encrypted Storage**: API keys encrypted using AES-256-CBC
- **Environment Variables**: Sensitive data never exposed in code
- **Input Validation**: Comprehensive validation of all inputs
- **CORS Protection**: Secure cross-origin resource sharing
- **Helmet Security**: Express.js security middleware

## 📁 Project Structure

```
social-media-workflow/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── content/                  # Generated markdown files
│   └── events/
├── package.json             # Root workspace config
└── README.md
```

## 🧪 Development

### AI Provider Endpoints
- `GET /api/mcp/ai-status` - Get current AI provider status
- `POST /api/mcp/ai-switch` - Switch between AI providers
- `GET /api/health` - Health check with AI provider information

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev          # Start with tsx watch
npm run build        # Build TypeScript
npm run start        # Run production build
npm run lint         # Run ESLint
```

### Testing the Workflow

1. **Start both servers**: `npm run dev`
2. **Open frontend**: http://localhost:3000
3. **Configure API keys** in Settings page
4. **Test workflow** in Chat page
5. **Check generated files** in `./content/events/`

## 🚀 Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
cd backend
npm run build
npm run start
# Use PM2 or similar for process management
```

### Environment Variables
Ensure all required environment variables are set in production:
- `AI_PROVIDER` (openai or perplexity)
- `AI_FALLBACK_PROVIDER` (fallback provider)
- `OPENAI_API_KEY` (if using OpenAI)
- `PERPLEXITY_API_KEY` (if using Perplexity AI)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `CANVA_API_KEY`
- `ENCRYPTION_KEY`

## 🔮 Future Enhancements

- **Instagram Integration**: Auto-post to Instagram
- **Email Marketing**: Newsletter integration
- **Analytics Dashboard**: Track content performance
- **Template Library**: Pre-designed poster templates
- **Bulk Operations**: Send to multiple contacts
- **Scheduling**: Plan content in advance
- **A/B Testing**: Test different message variations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README and inline code comments
- **API Issues**: Check respective API provider documentation

## 🙏 Acknowledgments

- OpenAI for GPT-4 integration
- Twilio for WhatsApp Business API
- Canva for design API
- React and Vite communities
- Tailwind CSS for beautiful UI components

---

**Built with ❤️ for yoga studios and wellness communities**
