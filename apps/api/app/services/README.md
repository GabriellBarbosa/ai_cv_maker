# Services Module

This directory contains service layer implementations for the AI CV Maker API.

## LLM Client Service (`llm_client.py`)

The LLM Client service provides integration with OpenAI's API for AI-powered resume and cover letter generation.

### Features

- **Retry Logic**: Automatic retry with exponential backoff (3 attempts, 2-10 second wait)
- **Timeout**: 30-second timeout for all API calls
- **Error Handling**: Comprehensive error handling for API errors, timeouts, and rate limits
- **Data Validation**: Validates and cleans LLM responses to prevent hallucinations and empty fields
- **Schema Compliance**: Returns Pydantic-validated responses matching the API schemas

### Functions

#### `extract_payload(candidate_text, job_text, language="pt-BR")`

Extracts structured data from candidate and job description text.

**Parameters:**
- `candidate_text` (str): Free-form text describing candidate's experience
- `job_text` (str): Free-form text describing the job requirements
- `language` (str): Language code (pt-BR or en-US)

**Returns:**
- `Dict[str, Any]`: Extracted structured data

**Raises:**
- `LLMClientError`: If extraction fails or returns invalid data

#### `generate_resume_json(extracted_data, job_text, language="pt-BR", tone="profissional")`

Generates a structured resume JSON from extracted data.

**Parameters:**
- `extracted_data` (dict): Structured data from `extract_payload`
- `job_text` (str): Job description to tailor the resume
- `language` (str): Language code (pt-BR or en-US)
- `tone` (str): Tone of the resume (profissional, neutro, criativo)

**Returns:**
- `ResumeResponse`: Pydantic model with structured resume data

**Raises:**
- `LLMClientError`: If generation fails or returns invalid data
- `ValidationError`: If the generated data doesn't match the schema

#### `generate_cover_text(candidate_name, job_title, candidate_summary, job_text, language="pt-BR", tone="profissional")`

Generates a cover letter text tailored to the job description.

**Parameters:**
- `candidate_name` (str): Name of the candidate
- `job_title` (str): Job title being applied for
- `candidate_summary` (str): Brief summary of candidate's background
- `job_text` (str): Job description
- `language` (str): Language code (pt-BR or en-US)
- `tone` (str): Tone of the letter (profissional, neutro, criativo)

**Returns:**
- `CoverLetterResponse`: Pydantic model with greeting, body, and signature

**Raises:**
- `LLMClientError`: If generation fails or returns invalid data
- `ValidationError`: If the generated data doesn't match the schema

### Configuration

Set the following environment variable:

```bash
OPENAI_API_KEY=your-api-key-here
```

### Error Handling

The service handles several types of errors:

1. **Missing API Key**: Returns clear error message when `OPENAI_API_KEY` is not set
2. **API Errors**: Retries on transient errors (APIError, APITimeoutError, RateLimitError)
3. **Invalid Responses**: Validates and cleans JSON to handle hallucinations
4. **Schema Validation**: Ensures all responses match the expected Pydantic schemas

### Retry Strategy

All three main functions use tenacity for retry logic:
- **Max Attempts**: 3
- **Wait Strategy**: Exponential backoff (2s min, 10s max, 1x multiplier)
- **Retry On**: APIError, APITimeoutError, RateLimitError
- **Timeout**: 30 seconds per request

### Usage Example

```python
from app.services.llm_client import (
    extract_payload,
    generate_resume_json,
    generate_cover_text,
)

# Extract data
extracted = extract_payload(
    candidate_text="I have 5 years of Python experience...",
    job_text="Looking for Senior Python Developer...",
    language="pt-BR"
)

# Generate resume
resume = generate_resume_json(
    extracted_data=extracted,
    job_text="Looking for Senior Python Developer...",
    language="pt-BR",
    tone="profissional"
)

# Generate cover letter
cover = generate_cover_text(
    candidate_name=resume.name,
    job_title=resume.job_title,
    candidate_summary=resume.candidate_introduction,
    job_text="Looking for Senior Python Developer...",
    language="pt-BR",
    tone="profissional"
)
```

### Testing

The service includes:
- Input validation
- Output schema validation
- Error handling for edge cases
- Data cleaning to prevent hallucinations
- Default value handling for missing fields

To test without making real API calls, ensure the OPENAI_API_KEY is not set - the service will return appropriate error messages.
