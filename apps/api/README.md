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
- Emits JSON logs for the request lifecycle (`http_request_started`, `http_request_completed`, `request_metrics`)
- Automatically enriches logs with `request_id`, method, path, status code, duration, and LLM token usage
- Token usage and latency per LLM step are emitted via `llm_call_completed`
- Example log:
  ```json
  {
    "event": "request_metrics",
    "request_id": "abc-123",
    "method": "POST",
    "path": "/v1/generate",
    "status_code": 200,
    "duration_ms": 245.17,
    "tokens": {
      "prompt_tokens": 3124,
      "completion_tokens": 1280,
      "total_tokens": 4404
    },
    "metrics_snapshot": {
      "requests": {"success": 42, "error": 3},
      "step_average_duration_ms": {
        "extract_payload": 418.73,
        "generate_resume_json": 702.11,
        "generate_cover_text": 489.32
      }
    }
  }
  ```

### CORS Middleware
- Restricted to web host: `http://localhost:3000`
- Allows credentials
- Allows all HTTP methods and headers

## Metrics & Dashboards
- Success/error counters and moving averages per LLM step are maintained in memory and emitted with each `request_metrics` log.
- Basic dashboards can be built by tailing logs and grouping by `event`, `handler`, or `step`. Example:
  ```bash
  uvicorn app.main:app --reload | jq 'select(.event=="request_metrics") | {status_code, duration_ms, tokens}'
  ```
- LLM-specific telemetry is available via `llm_call_started`, `llm_call_completed`, and `llm_call_failed` events.

## Testing

Run the test script:

```bash
# Start the API server first
python -m uvicorn app.main:app --reload

# In another terminal, make the test script executable and run it
chmod +x test_endpoints.sh
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
│   ├── metrics.py       # In-memory metrics recorder
│   ├── observability.py # Logging helpers and request context
│   └── schemas.py       # Pydantic models and validation
└── middleware/
    ├── request_id.py    # Request ID middleware
    └── logging.py       # Structured logging middleware
```
