# Testing Guide - OpenAI Integration

This guide explains how to test the OpenAI integration service.

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key
2. **Dependencies**: All Python dependencies installed (see README.md)

## Setup

1. Configure your OpenAI API key:
   ```bash
   cd apps/api
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

2. Start the API server:
   ```bash
   cd apps/api
   # Using Poetry (if installed)
   poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Or using Python directly
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Manual Testing

### Test 1: Health Check

Verify the API is running:

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T...",
  "service": "api"
}
```

### Test 2: Generate Complete CV Package (Resume + Cover Letter)

```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_text": "Sou um desenvolvedor full-stack com 5 anos de experiência em Python, FastAPI, React e Next.js. Trabalhei na XYZ Corp como Senior Developer, onde liderei uma equipe de 3 pessoas. Tenho bacharelado em Ciência da Computação pela USP. Falo português nativo e inglês fluente.",
    "job_text": "Procuramos um desenvolvedor senior com forte experiência em Python e frameworks modernos como FastAPI. O candidato ideal tem experiência em liderança técnica e trabalho em equipe. Inglês fluente é obrigatório.",
    "language": "pt-BR",
    "tone": "profissional"
  }' | jq .
```

### Test 3: Generate Resume Only

```bash
curl -X POST http://localhost:8000/v1/generate/resume \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_text": "Senior Python developer with 5 years experience at Tech Corp. Led team of 5 developers. BS in Computer Science from MIT. Native English, fluent Spanish.",
    "job_text": "Looking for senior Python developer with FastAPI experience and team leadership skills.",
    "language": "en-US",
    "tone": "profissional"
  }' | jq .
```

### Test 4: Generate Cover Letter Only

```bash
curl -X POST http://localhost:8000/v1/generate/cover-letter \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_text": "Desenvolvedor backend com 3 anos de experiência em Python e APIs RESTful. Formado em Engenharia de Software.",
    "job_text": "Vaga para desenvolvedor Python junior/pleno. Experiência com APIs REST e bancos de dados relacionais.",
    "language": "pt-BR",
    "tone": "neutro"
  }' | jq .
```

### Test 5: Error Handling - Missing API Key

Stop the server, remove the OPENAI_API_KEY from .env, and restart:

```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_text": "Test",
    "job_text": "Test"
  }' | jq .
```

Expected response:
```json
{
  "detail": "Failed to generate content: Failed to extract payload: OPENAI_API_KEY environment variable is not set. Please configure your OpenAI API key to use this service."
}
```

### Test 6: Different Tones

Test the three tone options:

**Professional:**
```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"candidate_text":"...","job_text":"...","tone":"profissional"}' | jq .
```

**Neutral:**
```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"candidate_text":"...","job_text":"...","tone":"neutro"}' | jq .
```

**Creative:**
```bash
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"candidate_text":"...","job_text":"...","tone":"criativo"}' | jq .
```

## Expected Behavior

### Successful Response Structure

#### Resume Response:
```json
{
  "name": "João Silva",
  "job_title": "Engenheiro de Software",
  "candidate_introduction": "Professional summary...",
  "experiences": [
    {
      "company": "Tech Corp",
      "role": "Senior Developer",
      "start_date": "2020-01",
      "end_date": "Atual",
      "location": "São Paulo, Brasil",
      "bullets": ["Achievement 1", "Achievement 2"],
      "tech_stack": ["Python", "FastAPI"]
    }
  ],
  "education": [
    {
      "institution": "USP",
      "degree": "BS Computer Science",
      "start_date": "2015-03",
      "end_date": "2019-12"
    }
  ],
  "languages": [
    {"name": "Português", "level": "Nativo"},
    {"name": "Inglês", "level": "C1"}
  ]
}
```

#### Cover Letter Response:
```json
{
  "greeting": "Prezado(a) Recrutador(a),",
  "body": "Professional cover letter text (150-220 words) that references specific job requirements...",
  "signature": "Atenciosamente,\nJoão Silva"
}
```

## Validation Checks

The service automatically validates:

1. **Date Format**: Must be YYYY-MM or "Atual"
2. **Language Levels**: Must be A2, B1, B2, C1, C2, or Nativo
3. **Required Fields**: All required fields must be present and non-empty
4. **Bullet Points**: At least one bullet point per experience
5. **Cover Letter Length**: Body should be 150-220 words

## Retry Behavior

The service will automatically retry on:
- API errors
- Timeout errors
- Rate limit errors

Retry configuration:
- **Max attempts**: 3
- **Wait time**: 2-10 seconds (exponential backoff)
- **Timeout**: 30 seconds per request

## Common Issues

### Issue: "OPENAI_API_KEY environment variable is not set"
**Solution**: Add your API key to the .env file

### Issue: Rate limit errors
**Solution**: The service will automatically retry. If persistent, wait a few minutes.

### Issue: Empty or invalid responses
**Solution**: The service validates and cleans responses. Check logs for details.

### Issue: Timeout errors
**Solution**: The service has 30s timeout and will retry. For persistent issues, check OpenAI status.

## Logging

The service logs all operations. Check the console output for:
- Info: Normal operation logs
- Error: API errors, validation failures

Example log entries:
```
INFO: Extracting payload from candidate and job text
INFO: Successfully extracted payload
INFO: Generating resume JSON
INFO: Successfully generated resume JSON
INFO: Generating cover letter text
INFO: Successfully generated cover letter
```

## Performance Notes

- **Extract payload**: ~2-5 seconds
- **Generate resume**: ~3-7 seconds  
- **Generate cover letter**: ~2-5 seconds
- **Complete package**: ~7-15 seconds total

These times depend on OpenAI API response times and may vary.
