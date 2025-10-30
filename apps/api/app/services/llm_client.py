"""
OpenAI LLM Client Service

This module provides integration with OpenAI API for:
- Extracting structured data from candidate and job descriptions
- Generating resume JSON
- Generating cover letter text

Features:
- Retry logic with exponential backoff
- 30 second timeout
- Hallucination and empty field handling
"""

import json
import logging
import os
from typing import Dict, Any, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from openai import OpenAI, APIError, APITimeoutError, RateLimitError
from pydantic import ValidationError

from app.core.schemas import (
    ResumeResponse,
    CoverLetterResponse,
    Experience,
    Education,
    Language,
)

logger = logging.getLogger(__name__)

# Module-level client instance (singleton pattern)
_client: Optional[OpenAI] = None


def _get_openai_client() -> OpenAI:
    """
    Get or create OpenAI client instance (singleton pattern).
    
    This function creates a single client instance that is reused across all calls,
    avoiding the overhead of creating new connections.
    """
    global _client
    
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise LLMClientError(
                "OPENAI_API_KEY environment variable is not set. "
                "Please configure your OpenAI API key to use this service."
            )
        _client = OpenAI(api_key=api_key, timeout=30.0)
    
    return _client


class LLMClientError(Exception):
    """Custom exception for LLM client errors"""
    pass


def _validate_and_clean_json(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and clean JSON data to handle hallucinations and empty fields.
    
    Args:
        data: Raw JSON data from LLM
        
    Returns:
        Cleaned and validated JSON data
        
    Raises:
        LLMClientError: If data is invalid or contains too many empty fields
    """
    if not data or not isinstance(data, dict):
        raise LLMClientError("Invalid JSON structure received from LLM")
    
    # Remove None values and empty strings
    def clean_dict(d: Any) -> Any:
        if isinstance(d, dict):
            return {k: clean_dict(v) for k, v in d.items() if v not in [None, "", []]}
        elif isinstance(d, list):
            cleaned = [clean_dict(item) for item in d if item not in [None, ""]]
            return cleaned if cleaned else None
        return d
    
    cleaned_data = clean_dict(data)
    
    if not cleaned_data:
        raise LLMClientError("All fields are empty after cleaning")
    
    return cleaned_data


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, APITimeoutError, RateLimitError)),
    reraise=True,
)
def extract_payload(
    candidate_text: str,
    job_text: str,
    language: str = "pt-BR",
) -> Dict[str, Any]:
    """
    Extract structured data from candidate and job description text.
    
    This function uses OpenAI to parse free-form text into structured data
    that can be used for resume and cover letter generation.
    
    Args:
        candidate_text: Free-form text describing candidate's experience
        job_text: Free-form text describing the job requirements
        language: Language code (pt-BR or en-US)
        
    Returns:
        Dictionary with extracted structured data
        
    Raises:
        LLMClientError: If extraction fails or returns invalid data
    """
    logger.info("Extracting payload from candidate and job text")
    
    try:
        client = _get_openai_client()
        system_prompt = """You are an expert HR assistant that extracts structured information from text.
Extract the following information from the candidate and job descriptions:
- Candidate's name (if mentioned)
- Current or desired job title
- Professional experiences (company, role, dates, location, achievements)
- Education (institution, degree, dates)
- Languages and proficiency levels
- Skills and technologies

Return a valid JSON object with this structure.
If information is not available, omit the field rather than inventing data.
For dates, use YYYY-MM format. For ongoing roles, use "Atual"."""

        user_prompt = f"""Language: {language}

Candidate Information:
{candidate_text}

Job Description:
{job_text}

Extract structured data from the above information."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        if not content:
            raise LLMClientError("Empty response from OpenAI")
        
        extracted_data = json.loads(content)
        validated_data = _validate_and_clean_json(extracted_data)
        
        logger.info("Successfully extracted payload")
        return validated_data
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from OpenAI response: {e}")
        raise LLMClientError(f"Invalid JSON response: {e}")
    except (APIError, APITimeoutError, RateLimitError) as e:
        logger.error(f"OpenAI API error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in extract_payload: {e}")
        raise LLMClientError(f"Failed to extract payload: {e}")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, APITimeoutError, RateLimitError)),
    reraise=True,
)
def generate_resume_json(
    extracted_data: Dict[str, Any],
    job_text: str,
    language: str = "pt-BR",
    tone: str = "profissional",
) -> ResumeResponse:
    """
    Generate a structured resume JSON from extracted data.
    
    Args:
        extracted_data: Structured data from extract_payload
        job_text: Job description to tailor the resume
        language: Language code (pt-BR or en-US)
        tone: Tone of the resume (profissional, neutro, criativo)
        
    Returns:
        ResumeResponse object with structured resume data
        
    Raises:
        LLMClientError: If generation fails or returns invalid data
        ValidationError: If the generated data doesn't match the schema
    """
    logger.info("Generating resume JSON")
    
    try:
        client = _get_openai_client()
        tone_instructions = {
            "profissional": "Use a formal, professional tone with industry-standard terminology.",
            "neutro": "Use a neutral, straightforward tone without embellishments.",
            "criativo": "Use a creative, engaging tone that highlights personality.",
        }
        
        system_prompt = f"""You are an expert resume writer. Create a structured resume in JSON format.

Guidelines:
- {tone_instructions.get(tone, tone_instructions['profissional'])}
- Tailor achievements to match job requirements
- Use action verbs and quantifiable results
- Dates must be in YYYY-MM format
- For current positions, use "Atual" for end_date
- Include relevant tech_stack for each experience
- Language levels: A2, B1, B2, C1, C2, or Nativo

Return a JSON object with this exact structure:
{{
  "name": "string",
  "job_title": "string",
  "candidate_introduction": "string (2-3 sentences)",
  "experiences": [
    {{
      "company": "string",
      "role": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or Atual",
      "location": "string",
      "bullets": ["achievement 1", "achievement 2"],
      "tech_stack": ["skill1", "skill2"]
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
      "level": "A2|B1|B2|C1|C2|Nativo"
    }}
  ]
}}"""

        user_prompt = f"""Language: {language}

Extracted Data:
{json.dumps(extracted_data, ensure_ascii=False, indent=2)}

Job Requirements:
{job_text}

Generate a complete resume JSON that highlights relevant experience for this role."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.5,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        if not content:
            raise LLMClientError("Empty response from OpenAI")
        
        resume_data = json.loads(content)
        validated_data = _validate_and_clean_json(resume_data)
        
        # Validate with Pydantic schema
        resume = ResumeResponse(**validated_data)
        
        logger.info("Successfully generated resume JSON")
        return resume
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from OpenAI response: {e}")
        raise LLMClientError(f"Invalid JSON response: {e}")
    except ValidationError as e:
        logger.error(f"Generated resume doesn't match schema: {e}")
        raise LLMClientError(f"Invalid resume structure: {e}")
    except (APIError, APITimeoutError, RateLimitError) as e:
        logger.error(f"OpenAI API error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_resume_json: {e}")
        raise LLMClientError(f"Failed to generate resume: {e}")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, APITimeoutError, RateLimitError)),
    reraise=True,
)
def generate_cover_text(
    candidate_name: str,
    job_title: str,
    candidate_summary: str,
    job_text: str,
    language: str = "pt-BR",
    tone: str = "profissional",
) -> CoverLetterResponse:
    """
    Generate a cover letter text tailored to the job description.
    
    The cover letter should be 150-220 words and reference 2-3 key job requirements.
    
    Args:
        candidate_name: Name of the candidate
        job_title: Job title being applied for
        candidate_summary: Brief summary of candidate's background
        job_text: Job description
        language: Language code (pt-BR or en-US)
        tone: Tone of the letter (profissional, neutro, criativo)
        
    Returns:
        CoverLetterResponse object with greeting, body, and signature
        
    Raises:
        LLMClientError: If generation fails or returns invalid data
        ValidationError: If the generated data doesn't match the schema
    """
    logger.info("Generating cover letter text")
    
    try:
        client = _get_openai_client()
        tone_instructions = {
            "profissional": "Use a formal, professional tone appropriate for corporate settings.",
            "neutro": "Use a neutral, straightforward tone without excessive formality.",
            "criativo": "Use a warm, engaging tone that shows personality while remaining professional.",
        }
        
        greeting_template = {
            "pt-BR": "Prezado(a) Recrutador(a),",
            "en-US": "Dear Hiring Manager,",
        }
        
        signature_template = {
            "pt-BR": f"Atenciosamente,\n{candidate_name}",
            "en-US": f"Sincerely,\n{candidate_name}",
        }
        
        system_prompt = f"""You are an expert cover letter writer. Write a compelling cover letter.

Guidelines:
- {tone_instructions.get(tone, tone_instructions['profissional'])}
- Length: 150-220 words for the body
- Reference 2-3 specific job requirements
- Highlight relevant achievements
- Show enthusiasm and fit for the role
- Be specific and avoid generic statements

Return a JSON object with this structure:
{{
  "greeting": "string",
  "body": "string (150-220 words)",
  "signature": "string"
}}"""

        user_prompt = f"""Language: {language}

Candidate: {candidate_name}
Position: {job_title}
Background: {candidate_summary}

Job Description:
{job_text}

Write a cover letter that connects the candidate's experience to this specific role."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        if not content:
            raise LLMClientError("Empty response from OpenAI")
        
        cover_data = json.loads(content)
        
        # Set default greeting and signature if not provided or empty
        if not cover_data.get("greeting"):
            cover_data["greeting"] = greeting_template.get(language, greeting_template["pt-BR"])
        
        if not cover_data.get("signature"):
            cover_data["signature"] = signature_template.get(language, signature_template["pt-BR"])
        
        # Validate body is not empty
        if not cover_data.get("body") or len(cover_data["body"].strip()) < 50:
            raise LLMClientError("Cover letter body is too short or empty")
        
        # Validate with Pydantic schema
        cover_letter = CoverLetterResponse(**cover_data)
        
        logger.info("Successfully generated cover letter")
        return cover_letter
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from OpenAI response: {e}")
        raise LLMClientError(f"Invalid JSON response: {e}")
    except ValidationError as e:
        logger.error(f"Generated cover letter doesn't match schema: {e}")
        raise LLMClientError(f"Invalid cover letter structure: {e}")
    except (APIError, APITimeoutError, RateLimitError) as e:
        logger.error(f"OpenAI API error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_cover_text: {e}")
        raise LLMClientError(f"Failed to generate cover letter: {e}")
