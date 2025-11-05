import json
import logging
import os
import time
from typing import Dict, Any, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from openai import OpenAI, APIError, APITimeoutError, RateLimitError
from pydantic import ValidationError
from dotenv import load_dotenv

from app.core.observability import log_event, record_llm_usage
from app.core.schemas import (
    ResumeResponse,
    CoverLetterResponse,
)
from app.core.normalization import normalize_resume_payload

from app.prompts.load_md_prompt import (
    load_raw_text_normalization_prompt,
    load_resume_json_prompt,
    load_cover_letter_prompt
)

load_dotenv()

logger = logging.getLogger(__name__)

_client: Optional[OpenAI] = None

def _get_openai_client() -> OpenAI:
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
    pass


def _validate_and_clean_json(data: Dict[str, Any]) -> Dict[str, Any]:
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
    start_time = time.perf_counter()
    log_event("llm_call_started", logger=logger, step="extract_payload")

    try:
        client = _get_openai_client()

        system_prompt = load_raw_text_normalization_prompt(
            candidate_text=candidate_text, 
            job_text=job_text, 
            language=language
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        if not content:
            raise LLMClientError("Empty response from OpenAI")

        extracted_data = json.loads(content)
        validated_data = _validate_and_clean_json(extracted_data)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        record_llm_usage(
            "extract_payload",
            response.usage,
            duration_ms=duration_ms,
            model=response.model if hasattr(response, "model") else None,
            logger=logger,
        )

        log_event(
            "payload_extracted",
            logger=logger,
            step="extract_payload",
            status="success",
            duration_ms=duration_ms,
        )
        return validated_data
        
    except json.JSONDecodeError as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="extract_payload",
            error="invalid_json_response",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise LLMClientError(f"Invalid JSON response: {e}")
    except (APIError, APITimeoutError, RateLimitError) as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="extract_payload",
            error="openai_api_error",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise
    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="extract_payload",
            error="unexpected_error",
            details=str(e),
            duration_ms=duration_ms,
        )
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
    start_time = time.perf_counter()
    log_event("llm_call_started", logger=logger, step="generate_resume_json")

    try:
        client = _get_openai_client()
        tone_instructions = {
            "profissional": "Use a formal, professional tone with industry-standard terminology.",
            "neutro": "Use a neutral, straightforward tone without embellishments.",
            "criativo": "Use a creative, engaging tone that highlights personality.",
        }
        
        system_prompt = load_resume_json_prompt(
            tone_instructions=tone_instructions.get(tone, tone_instructions['profissional']),
            language=language,
            extracted_data=json.dumps(extracted_data, ensure_ascii=False, indent=2),
            job_text=job_text
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
            ],
            temperature=0.5,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        if not content:
            raise LLMClientError("Empty response from OpenAI")
        
        resume_data = json.loads(content)
        
        validated_data = _validate_and_clean_json(resume_data)
        try:
            normalized_data = normalize_resume_payload(validated_data, job_text=job_text)
        except ValueError as e:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            log_event(
                "llm_call_failed",
                logger=logger,
                level=logging.ERROR,
                step="generate_resume_json",
                error="normalization_error",
                details=str(e),
                duration_ms=duration_ms,
            )
            raise LLMClientError(f"Failed to normalize resume data: {e}") from e
        
        # Validate with Pydantic schema
        resume = ResumeResponse(**normalized_data)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        record_llm_usage(
            "generate_resume_json",
            response.usage,
            duration_ms=duration_ms,
            model=response.model if hasattr(response, "model") else None,
            logger=logger,
        )

        log_event(
            "resume_generated",
            logger=logger,
            step="generate_resume_json",
            status="success",
            duration_ms=duration_ms,
        )
        return resume
        
    except json.JSONDecodeError as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_resume_json",
            error="invalid_json_response",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise LLMClientError(f"Invalid JSON response: {e}")
    except ValidationError as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_resume_json",
            error="schema_validation_error",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise LLMClientError(f"Invalid resume structure: {e}")
    except (APIError, APITimeoutError, RateLimitError) as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_resume_json",
            error="openai_api_error",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise
    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_resume_json",
            error="unexpected_error",
            details=str(e),
            duration_ms=duration_ms,
        )
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
    start_time = time.perf_counter()
    log_event("llm_call_started", logger=logger, step="generate_cover_text")

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
        
        system_prompt = load_cover_letter_prompt(
            tone_instructions=tone_instructions.get(tone, tone_instructions['profissional']),
            language=language,
            candidate_name=candidate_name,
            job_title=job_title,
            candidate_summary=candidate_summary,
            job_text=job_text
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
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

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        record_llm_usage(
            "generate_cover_text",
            response.usage,
            duration_ms=duration_ms,
            model=response.model if hasattr(response, "model") else None,
            logger=logger,
        )

        log_event(
            "cover_letter_generated",
            logger=logger,
            step="generate_cover_text",
            status="success",
            duration_ms=duration_ms,
        )
        return cover_letter
        
    except json.JSONDecodeError as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_cover_text",
            error="invalid_json_response",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise LLMClientError(f"Invalid JSON response: {e}")
    except ValidationError as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_cover_text",
            error="schema_validation_error",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise LLMClientError(f"Invalid cover letter structure: {e}")
    except (APIError, APITimeoutError, RateLimitError) as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_cover_text",
            error="openai_api_error",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise
    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event(
            "llm_call_failed",
            logger=logger,
            level=logging.ERROR,
            step="generate_cover_text",
            error="unexpected_error",
            details=str(e),
            duration_ms=duration_ms,
        )
        raise LLMClientError(f"Failed to generate cover letter: {e}")
