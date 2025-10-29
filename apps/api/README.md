# AI CV Maker API

FastAPI backend for generating CV and cover letters using AI.

## Endpoints

### Generate Routes

All endpoints accept the following request body:

```json
{
  "candidate_text": "string (required, min 1 character)",
  "job_text": "string (required, min 1 character)",
  "language": "pt-BR" | "en-US" (optional, default: "pt-BR"),
  "tone": "profissional" | "neutro" | "criativo" (optional, default: "profissional"),
  "format": "docx" (optional, default: "docx")
}
```

#### `POST /v1/generate`

Generates both resume and cover letter.

**Response:**
```json
{
  "resume": { ... },
  "cover_letter": { ... }
}
```

#### `POST /v1/generate/resume`

Generates only the resume.

**Response:**
```json
{
  "name": "string",
  "job_title": "string",
  "candidate_introduction": "string",
  "experiences": [...],
  "education": [...],
  "languages": [...]
}
```

#### `POST /v1/generate/cover-letter`

Generates only the cover letter.

**Response:**
```json
{
  "greeting": "string",
  "body": "string",
  "signature": "string"
}
```

## Middlewares

### Request ID Middleware
- Generates a unique UUID for each request
- Adds `X-Request-ID` header to all responses
- Useful for tracking and debugging

### Structured Logging Middleware
- Logs all requests and responses in JSON format
- Includes request_id, method, path, status_code, and duration
- Example log:
  ```json
  {
    "event": "request_completed",
    "request_id": "abc-123",
    "method": "POST",
    "path": "/v1/generate",
    "status_code": 200,
    "duration_ms": 1.25
  }
  ```

### CORS Middleware
- Restricted to web host: `http://localhost:3000`
- Allows credentials
- Allows all HTTP methods and headers

## Testing

Run the test script:

```bash
# Start the API server first
python -m uvicorn app.main:app --reload

# In another terminal, run the test script
./test_endpoints.sh
```

Or test manually with curl:

```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "candidate_text": "Senior Software Engineer with 5 years experience",
    "job_text": "Looking for a backend engineer"
  }'
```

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI Schema: http://localhost:8000/openapi.json

## Development

### Install Dependencies

```bash
pip install fastapi uvicorn pydantic pydantic-settings python-dotenv openai
```

Or using Poetry:

```bash
poetry install
```

### Run the Server

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Project Structure

```
app/
├── main.py              # FastAPI app with middleware configuration
├── api/
│   ├── health.py        # Health check endpoint
│   └── generate.py      # Generation endpoints
├── core/
│   └── schemas.py       # Pydantic models and validation
└── middleware/
    ├── request_id.py    # Request ID middleware
    └── logging.py       # Structured logging middleware
```
