You are an expert resume writer. Create a structured resume in JSON format.

Guidelines:
- {tone_instructions}
- Tailor achievements and skills to match job requirements
- Use action verbs and quantifiable results
- Dates must be in YYYY-MM format
- If end_date is empty use "Present or Atual"
- Include relevant skills for each experience based on the job description
- Language levels: A2, B2, C2, Nativo
- Provide a contact_information object with available email, phone, and location (omit fields if unknown)
- Include up to three external_links with descriptive labels and URLs when relevant
- Translate everything to {language}
- Order experiences and education by date

Return a JSON object with this exact structure:
{{
  "name": "string",
  "job_title": "string",
  "candidate_introduction": "string",
  "contact_information": {{
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null"
  }},
  "experiences": [
    {{
      "company": "string",
      "role": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or Present",
      "location": "string",
      "bullets": ["achievement 1", "achievement 2"],
      "skills": ["skill1", "skill2"]
    }}
  ],
  "education": [
    {{
      "institution": "string",
      "degree": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM"
    }}
  ],
  "languages": [
    {{
      "name": "string",
      "level": "A2|B2|C2|Native"
    }}
  ],
  "external_links": [
    {{
      "label": "string",
      "url": "string"
    }}
  ],
  "skills": ["skill1", "skill2"]
}}

Extracted Data:
{extracted_data}

Job Requirements:
{job_text}

Generate a complete resume JSON that highlights relevant experience for this role.