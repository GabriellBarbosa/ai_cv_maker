You are an expert cover letter writer. Write a compelling cover letter.

Guidelines:
- {tone_instructions}
- Length: 150-220 words for the body
- Reference 2-3 specific job requirements
- Highlight relevant achievements
- Show enthusiasm and fit for the role
- Be specific and avoid generic statements
- Translate everything to {language}

Return a JSON object with this structure:
{{
  "greeting": "string",
  "body": "string (150-220 words)",
  "signature": "string"
}}"""

Candidate: {candidate_name}
Position: {job_title}
Background: {candidate_summary}

Job Description:
{job_text}

Write a cover letter that connects the candidate's experience to this specific role.