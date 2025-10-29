# @ai-cv-maker/schemas

Shared validation schemas for the AI CV Maker application. This package provides identical validation logic for both frontend (TypeScript/Zod) and backend (Python/Pydantic).

## Overview

This package contains the core data schemas used throughout the application:

- **GenerateRequestSchema**: Request payload for AI generation endpoints
- **ResumeResponseSchema**: Complete resume data structure
- **ExperienceSchema**: Professional experience entry
- **EducationSchema**: Educational background entry
- **LanguageSchema**: Language proficiency entry

## Schema Definitions

### GenerateRequest

Used for making requests to the AI generation API.

**Fields:**
- `candidate_text` (string, required): The candidate's professional profile and experiences
- `job_text` (string, required): The job description
- `language` (enum, default: 'pt-BR'): Output language ('pt-BR' or 'en-US')
- `tone` (enum, default: 'profissional'): Writing tone ('profissional', 'neutro', or 'criativo')
- `format` (enum, default: 'docx'): Output format (currently only 'docx')

### ResumeResponse

The complete resume structure returned by the API.

**Fields:**
- `name` (string, required): Candidate's full name
- `job_title` (string, required): Current or desired job title
- `candidate_introduction` (string, required): Professional summary/introduction
- `experiences` (array, required): List of professional experiences (min 1)
- `education` (array, optional): List of educational qualifications
- `languages` (array, optional): List of language proficiencies

### Experience

Professional experience entry.

**Fields:**
- `company` (string, required): Company name
- `role` (string, required): Job title/role
- `start_date` (string, required): Start date in YYYY-MM format
- `end_date` (string, required): End date in YYYY-MM format or "Atual" (current)
- `location` (string, required): Work location
- `bullets` (array of strings, required): Key achievements/responsibilities (min 1)
- `tech_stack` (array of strings, optional): Technologies used

### Education

Educational qualification entry.

**Fields:**
- `institution` (string, required): Educational institution name
- `degree` (string, required): Degree or qualification obtained
- `start_date` (string, required): Start date in YYYY-MM format
- `end_date` (string, required): End date in YYYY-MM format

### Language

Language proficiency entry.

**Fields:**
- `name` (string, required): Language name
- `level` (enum, required): Proficiency level ('A2', 'B1', 'B2', 'C1', 'C2', or 'Nativo')

## Usage

### TypeScript (Frontend)

```typescript
import { 
  GenerateRequestSchema, 
  ResumeResponseSchema,
  type GenerateRequest,
  type ResumeResponse
} from '@ai-cv-maker/schemas';

// Validate request data
const requestData = GenerateRequestSchema.parse({
  candidate_text: "...",
  job_text: "...",
  language: "pt-BR",
  tone: "profissional"
});

// Validate response data
const resume = ResumeResponseSchema.parse(apiResponse);
```

### Python (Backend)

```python
from app.core.schemas import GenerateRequest, ResumeResponse

# Validate request data
request_data = GenerateRequest(
    candidate_text="...",
    job_text="...",
    language="pt-BR",
    tone="profissional"
)

# Create response data
resume = ResumeResponse(
    name="John Doe",
    job_title="Software Engineer",
    candidate_introduction="...",
    experiences=[...],
    education=[...],
    languages=[...]
)
```

## Validation Guarantees

Both TypeScript and Python implementations provide:

1. **Type Safety**: Compile-time type checking in TypeScript and runtime validation in Python
2. **Identical Field Names**: All field names match exactly between implementations
3. **Consistent Validation**: Same validation rules (required fields, formats, enums)
4. **Matching Error Messages**: Similar error messages for validation failures
5. **Default Values**: Same default values where applicable

## Date Format

All dates follow the **YYYY-MM** format (e.g., "2020-01", "2023-12").

The only exception is for `end_date` in experiences, which can also be "Atual" (Portuguese for "Current") to indicate ongoing employment.

## Language Levels

Language proficiency levels follow the Common European Framework of Reference for Languages (CEFR):

- **A2**: Elementary
- **B1**: Intermediate
- **B2**: Upper Intermediate
- **C1**: Advanced
- **C2**: Proficiency
- **Nativo**: Native speaker

## Development

### Type Checking (TypeScript)

```bash
pnpm run type-check
```

### Testing Python Schemas

```bash
cd apps/api
poetry run python -c "from app.core.schemas import *; print('Schemas loaded successfully')"
```
