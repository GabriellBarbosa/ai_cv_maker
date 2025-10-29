from pydantic import BaseModel
from typing import Literal

# Placeholder Pydantic schemas - matching Zod schemas
class GenerateRequest(BaseModel):
    candidate_text: str
    job_text: str
    language: Literal["pt-BR", "en-US"] = "pt-BR"
    tone: Literal["profissional", "neutro", "criativo"] = "profissional"
    format: Literal["docx"] = "docx"
