from pathlib import Path

def load_raw_text_normalization_prompt(candidate_text: str, job_text: str, language: str) -> str:
    template = _load_prompt('raw_text_normalization.md')
    
    return template.format(
        candidate_text=candidate_text,
        job_text=job_text,
        language=language,
    )
    
def _load_prompt(file_name: str) -> str:
    PROMPT_PATH = Path(__file__).parent / file_name
  
    return PROMPT_PATH.read_text(encoding="utf-8")