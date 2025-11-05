from pathlib import Path

def load_raw_text_normalization_prompt(candidate_text: str, job_text: str, language: str) -> str:
    template = _load_prompt('raw_text_normalization.md')
    
    return template.format(
        candidate_text=candidate_text,
        job_text=job_text,
        language=language,
    )
    
def load_resume_json_prompt(
    tone_instructions: str,
    language: str,
    extracted_data: str,
    job_text=str,
) -> str:
    template = _load_prompt('resume_json.md')
    
    return template.format(
        tone_instructions=tone_instructions,
        language=language,
        extracted_data=extracted_data,
        job_text=job_text,
    )
    
def load_cover_letter_prompt(
    tone_instructions=str,
    language=str,
    candidate_name=str,
    job_title=str,
    candidate_summary=str,
    job_text=str,
) -> str:
    template = _load_prompt('cover_letter.md')
    
    return template.format(
        tone_instructions=tone_instructions,
        language=language,
        candidate_name=candidate_name,
        job_title=job_title,
        candidate_summary=candidate_summary,
        job_text=job_text,
    )
    
def _load_prompt(file_name: str) -> str:
    PROMPT_PATH = Path(__file__).parent / file_name
  
    return PROMPT_PATH.read_text(encoding="utf-8")