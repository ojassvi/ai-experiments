# 🧘‍♀️ Yoga Studio Content Workflow

A comprehensive MCP (Model Context Protocol) client + agent workflow that automates content creation for yoga studios across multiple channels.

## 🎯 Features


- **📱 WhatsApp Business API**: Send personalized messages to your community *(Not functional at this time)*
- **📝 Website Content**: Generate SEO-friendly markdown posts with frontmatter
- **🤖 AI-Powered**: Uses AI SDK with OpenAI GPT-4 or Perplexity AI for intelligent content generation
- **🌓 Dark/Light Mode**: Beautiful, responsive UI with system preference detection
- **🔐 Secure**: Encrypted storage of API keys and sensitive data
- **📱 Responsive**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js Backend│    │  External APIs  │
│                 │    │                 │    │                 │
│ • Chat Interface│◄──►│ • MCP Server    │◄──►│ • AI SDK        │
│ • Settings Page │    │ • Task Orchestr.│    │ • OpenAI GPT-4  │
│ • Dark/Light    │    │ • API Services  │    │ • Perplexity AI │
│ • Responsive UI │    │ • File Storage  │    
│                 │    │                 │    │ • Twilio WhatsApp│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤖 AI SDK Integration

This project now uses the [AI SDK](https://ai-sdk.dev/) for seamless integration with multiple AI providers:

- **Unified API**: Single interface for OpenAI and Perplexity AI
- **Automatic Fallback**: Seamlessly switches between providers if one fails
- **Type Safety**: Full TypeScript support with IntelliSense
- **Model Flexibility**: Easy switching between different AI models
- **Performance**: Optimized for production use

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ and npm
- OpenAI API key OR Perplexity AI API key (or both for fallback)
- Twilio account (for WhatsApp Business API)


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
# From root directory
npm run dev
```

This starts both:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

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



# Security
ENCRYPTION_KEY=your-32-char-encryption-key
```

### API Key Setup

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. **Perplexity AI**: Get your API key from [Perplexity AI](https://www.perplexity.ai/settings/api)
3. **Twilio**: Sign up at [Twilio](https://www.twilio.com/) and enable WhatsApp Business API


## 💡 Usage Example

### Input
```
"Announce Yoga Workshop on Sept 15th at 7 PM – theme: Stress Relief Breathing"
```

### Output
The system automatically:

1. **📱 Sends WhatsApp Message**
   - Generates casual, friendly message
   - Sends via Twilio WhatsApp Business API
   - Confirms delivery status

2. **📝 Creates Website Post**
   - Generates SEO-friendly markdown content
   - Includes frontmatter (title, date, tags, description)
   - Saves to `./content/events/2025-09-15-stress-relief-breathing.md`

## 🔧 MCP Capabilities

### AI Provider Management
- **Provider Selection**: Choose between OpenAI GPT-4 and Perplexity AI
- **Automatic Fallback**: Seamlessly switch providers if one fails
- **Real-time Switching**: Change providers via API endpoints
- **Status Monitoring**: View current provider and availability

### 1. `generate_whatsapp_message`
- **Purpose**: Create and send WhatsApp messages
- **Input**: Event description
- **Output**: Sent message confirmation
- **AI Enhancement**: Casual, engaging tone optimization

### 2. `generate_markdown_post`
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
