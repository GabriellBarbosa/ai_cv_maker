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
- Python >= 3.10
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

### Environment variables

- `OPENAI_API_KEY`: required by the API to call OpenAI.
- `LOG_LEVEL`: optional; defaults to `info` for the API service.
- `NEXT_PUBLIC_API_URL`: web app base URL for the API (defaults to `http://localhost:8000`).

### Development URLs

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)

## 🔌 API Usage

Base URL (dev): `http://localhost:8000`

### Endpoints
- `POST /v1/generate`: generates resume + cover letter in one call.
- `POST /v1/generate/resume`: generates only the resume JSON.
- `POST /v1/generate/cover-letter`: generates only the cover letter JSON.

### Request body
```json
{
  "candidate_text": "Raw profile text from the user",
  "job_text": "Job description text",
  "language": "pt-BR | en-US", 
  "tone": "profissional | neutro | criativo",
  "format": "docx"
}
```

### Example cURL
```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_text": "Senior backend engineer with 8 years of Python experience...",
    "job_text": "We are hiring a backend engineer to build APIs...",
    "language": "en-US",
    "tone": "profissional"
  }'
```

### Response shape (simplified)
```json
{
  "resume": {
    "name": "Jane Doe",
    "job_title": "Senior Backend Engineer",
    "candidate_introduction": "...",
    "experiences": [
      {
        "company": "Acme Corp",
        "role": "Backend Engineer",
        "start_date": "2021-01",
        "end_date": "Atual",
        "bullets": ["..."],
        "tech_stack": ["Python", "FastAPI"]
      }
    ],
    "education": [],
    "languages": [],
    "contact_information": {"email": "jane@example.com"},
    "external_links": []
  },
  "cover_letter": {
    "greeting": "Dear Hiring Manager,",
    "body": "...",
    "signature": "Sincerely,\nJane Doe"
  }
}
```

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

# Run API tests
cd apps/api && poetry run pytest
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
