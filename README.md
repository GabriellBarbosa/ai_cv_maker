# AI CV Maker

An AI-powered CV and cover letter generator using Next.js 15, FastAPI, and OpenAI.

## 🏗️ Monorepo Structure

```
/apps/web          # Next.js 15 App Router frontend
/apps/api          # FastAPI backend
/packages/schemas  # Shared Zod + Pydantic schemas
/packages/prompts  # OpenAI prompt templates
/templates         # DOCX templates (placeholders)
/infra             # Docker Compose configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.11
- Poetry

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/GabriellBarbosa/ai_cv_maker.git
   cd ai_cv_maker
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies and workspace packages
   pnpm install
   
   # Install Python dependencies for the API
   cd apps/api
   poetry install
   cd ../..
   ```

3. **Configure environment variables**
   
   Copy `.env.example` files and fill in the required values:
   
   ```bash
   # API environment
   cp apps/api/.env.example apps/api/.env
   # Add your OPENAI_API_KEY
   
   # Web environment
   cp apps/web/.env.example apps/web/.env
   # Default API_URL is already set
   ```

4. **Start development servers**
   ```bash
   # Start both web and API servers concurrently
   pnpm dev
   
   # Or start individually:
   pnpm dev:web  # Start Next.js only
   pnpm dev:api  # Start FastAPI only
   ```

### Development URLs

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)

### Health Checks

- **Web Health**: http://localhost:3000/api/health
- **API Health**: http://localhost:8000/api/health

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.11+) |
| **AI** | OpenAI API |
| **Schemas** | Zod (TypeScript) + Pydantic (Python) |
| **Package Manager** | pnpm (Node.js), Poetry (Python) |
| **Infrastructure** | Docker Compose |

## 🧪 Testing

```bash
# Build the web app
pnpm build

# Lint the web app
pnpm lint
```

## 🐳 Docker

Start with Docker Compose:

```bash
cd infra
docker compose up
```

## 📚 Documentation

See [SPECIFICATIONS.md](./SPECIFICATIONS.md) for detailed project specifications.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

TBD

---

**Author**: Gabriel Barbosa de Almeida  
**Version**: 0.1.0
