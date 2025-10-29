# 📘 CV Maker — Project Specifications

## 🎯 Objective
Generate a **curriculum vitae (CV)** and **cover letter** using **AI**, based on:
- The **candidate’s experiences** (entered as free text).
- The **job description** (entered as free text).

Outputs are generated as structured JSON and **rendered to DOCX** templates on the frontend.

---

## 🧱 Tech Stack Overview

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, shadcn/ui, TypeScript |
| **Backend API** | FastAPI (Python 3.11) |
| **AI Integration** | OpenAI API (GPT-4/5 models) |
| **Templating** | DOCX generated via [`docx`](https://www.npmjs.com/package/docx) library (frontend) |
| **Shared Schemas** | Zod (TypeScript) + Pydantic (Python) |
| **Infrastructure** | Docker Compose for local dev |
| **Monorepo Manager** | pnpm for JS; Poetry for Python |

---

## 🗂️ Monorepo Structure

/apps
/web → Next.js 15 (frontend)
/api → FastAPI (backend)
/docs → Documentation
/packages
/schemas → Shared zod/pydantic schemas
/prompts → Prompt templates for OpenAI
/templates
/resume.docx → Resume template
/cover.docx → Cover letter template
/infra
docker-compose.yml
/specifications.md

yaml
Copiar código

---

## 🖥️ User Interface (Web)

The app provides a simple **two-field form**:
1. `candidate_text`: free-text field describing professional experiences.
2. `job_text`: free-text field for the job description.

Optional controls:
- `language`: dropdown (`pt-BR` or `en-US`).
- `tone`: dropdown (`profissional`, `neutro`, `criativo`).

After submission, the AI generates structured data and text for:
- **CV content** (to fill the resume template).
- **Cover letter text** (to fill the cover template).

---

## 🧠 Backend API Specification

### Endpoints

#### `POST /v1/generate`
Generates both the resume and the cover letter.

#### `POST /v1/generate/resume`
Generates only the resume.

#### `POST /v1/generate/cover-letter`
Generates only the cover letter.

---

### Request Body

```json
{
  "candidate_text": "string (candidate's professional profile and experiences)",
  "job_text": "string (job description)",
  "language": "pt-BR",
  "tone": "profissional",
  "format": "docx"
}
```

### Response Schema

```json
{
  "name": "string",
  "job_title": "string",
  "candidate_introduction": "string",
  "experiences": [
    {
      "company": "string",
      "role": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM | Atual",
      "location": "string",
      "bullets": ["string"],
      "tech_stack": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM"
    }
  ],
  "languages": [
    { "name": "string", "level": "A2|B1|B2|C1|C2|Nativo" }
  ]
}
```

⚙️ Backend Logic Flow
Input normalization

Clean up text, remove extra whitespace, normalize line breaks.

Information extraction

Use an OpenAI prompt to extract structured data (skills, experiences, education).

Resume generation

Produce a JSON response matching the schema above.

Cover letter generation

Generate a 150–220 word professional letter referencing 2–3 job requirements.

Return JSON

The frontend uses this data to render DOCX templates locally.

🧩 Prompts (Packages)
/packages/prompts/extract.json
Extracts candidate and job data into structured JSON.

/packages/prompts/resume_gen.json
Builds the final structured resume JSON.

/packages/prompts/cover_gen.json
Generates the cover letter text (greeting, body, signature).

📄 Frontend DOCX Generation
Libraries
docx for document creation.

Browser-based file download via Blob and Packer.toBlob().

Resume Template
Sections:

Header (name, job title)

Summary

Experiences (loop)

Education (loop)

Languages

Skills (optional)

Cover Letter Template
Sections:

Date and company name

Greeting

Body (from AI)

Signature

🧪 Validation & Testing
Frontend: zod validation for input & response schemas.

Backend: pydantic validation and JSON structure testing.

Integration tests: check that LLM responses always produce valid schemas.

Template tests: ensure DOCX generation succeeds with mock data.

🔒 Security & Privacy
No personal data is stored.

Inputs are transient and never logged in full.

.env files must be gitignored.

API rate limit: 10 requests per minute per IP.

✅ MVP Acceptance Criteria
 User submits form and receives valid JSON in defined schema.

 DOCX for resume and cover letter can be generated and downloaded.

 Output content references job description naturally.

 Validation and error handling for empty or invalid inputs.

 Logs contain no sensitive data.

🚀 Next Steps (Future Roadmap)
Upload of existing CVs for parsing (PDF/DOCX → JSON).

Template customization (multiple resume styles).

Support for English/Portuguese auto-detection.

Match scoring (candidate vs job keywords).

User accounts and saved generations.

Export as PDF.

Author: Gabriel Barbosa de Almeida
Version: 0.1.0
Last updated: 2025-10-29

pgsql
Copiar código

---

Would you like me to tailor this `specifications.md` so it’s **auto-readable by AI tools** like Copilot or Cursor (using comment markers for context awareness)? That makes the assistant always “understand” your schema and API when editing code.