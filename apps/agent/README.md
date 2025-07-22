# LukAI Agent Service

The LukAI Python Agent Service is a FastAPI-based microservice that provides AI-powered scheduling and automation capabilities.

## 🚀 Features

- **AI Agent Processing**: Handles complex scheduling logic using OpenAI, Mistral, and other AI providers
- **WhatsApp Integration**: Processes WhatsApp messages and notifications
- **Document Processing**: OCR and PDF processing capabilities
- **Redis Integration**: Caching and session management
- **Mixpanel Analytics**: Event tracking and analytics

## 🛠 Tech Stack

- **Framework**: FastAPI
- **Python**: 3.11+
- **Dependency Management**: Poetry
- **AI Providers**: OpenAI, Mistral, Anthropic, Cohere, Groq
- **Database**: Redis (Upstash)
- **Document Processing**: PyPDF2, Pillow
- **ML Libraries**: scikit-learn, scipy, torch

## 📦 Installation

### Prerequisites

- Python 3.11+
- Poetry

### Setup

1. **Install Poetry** (if not already installed)

   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **Install dependencies**

   ```bash
   poetry install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

## 🚀 Development

### Start Development Server

```bash
# Using npm (from monorepo root)
npm run agent:dev

# Using Poetry directly
poetry run uvicorn app.main:app --reload --port 8000
```

### Available Commands

```bash
# Development
poetry run dev          # Start development server
poetry run start        # Start production server

# Testing
poetry run test         # Run tests
poetry run lint         # Run linting
poetry run format       # Format code
poetry run type-check   # Run type checking

# Package management
poetry install          # Install dependencies
poetry add <package>    # Add new dependency
poetry remove <package> # Remove dependency
```

## 🔧 Configuration

### Environment Variables

| Variable                   | Description              | Required |
| -------------------------- | ------------------------ | -------- |
| `OPENAI_API_KEY`           | OpenAI API key           | Yes      |
| `MISTRAL_API_KEY`          | Mistral API key          | Yes      |
| `MAIN_API_URL`             | Main API URL             | Yes      |
| `AGENT_API_SECRET`         | Agent API secret         | Yes      |
| `MIXPANEL_TOKEN`           | Mixpanel token           | Yes      |
| `GOOGLE_API_KEY`           | Google API key           | Yes      |
| `WHATSAPP_VERIFY_TOKEN`    | WhatsApp verify token    | Yes      |
| `WHATSAPP_API_TOKEN`       | WhatsApp API token       | Yes      |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | Yes      |
| `WHATSAPP_ADMIN_NUMBER`    | Admin WhatsApp number    | Yes      |
| `UPSTASH_REDIS_REST_URL`   | Redis URL                | Yes      |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token              | Yes      |

### API Endpoints

- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs` (if enabled)
- **Webhooks**: `POST /api/v1/webhooks/*`

## 🏗 Project Structure

```
app/
├── api/                 # API routes and endpoints
│   └── v1/
│       └── endpoints/
├── core/               # Core configuration and settings
├── db/                 # Database models and connections
├── models/             # Data models
├── schemas/            # Pydantic schemas
├── services/           # Business logic services
├── utils/              # Utility functions
└── main.py            # FastAPI application entry point
```

## 🧪 Testing

```bash
# Run all tests
poetry run pytest

# Run tests with coverage
poetry run pytest --cov=app

# Run specific test file
poetry run pytest tests/test_webhooks.py
```

## 📝 Code Quality

```bash
# Format code
poetry run black app tests

# Sort imports
poetry run isort app tests

# Lint code
poetry run flake8 app tests

# Type checking
poetry run mypy app
```

## 🚀 Deployment

### Railway Deployment

The agent service is configured for Railway deployment with the `railway.json` file.

### Environment Setup

1. Set all required environment variables in Railway
2. Deploy using Railway CLI or GitHub integration
3. The service will be available at the Railway-provided URL

## 📄 License

This project is licensed under AGPL-3.0 - see the [LICENSE](../../LICENSE) file for details.

## 🤝 Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) file for contribution guidelines.
