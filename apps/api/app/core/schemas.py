from pydantic import BaseModel, Field, field_validator
from typing import Literal, List
import re

# Generate Request Schema
class GenerateRequest(BaseModel):
    candidate_text: str = Field(..., min_length=1, description="Candidate text is required")
    job_text: str = Field(..., min_length=1, description="Job text is required")
    language: Literal["pt-BR", "en-US"] = "pt-BR"
    tone: Literal["profissional", "neutro", "criativo"] = "profissional"
    format: Literal["docx"] = "docx"


# Experience Schema
class Experience(BaseModel):
    company: str = Field(..., min_length=1, description="Company name is required")
    role: str = Field(..., min_length=1, description="Role is required")
    start_date: str = Field(..., description="Start date must be in YYYY-MM format")
    end_date: str = Field(..., description='End date must be in YYYY-MM format or "Atual"')
    location: str = Field(..., min_length=1, description="Location is required")
    bullets: List[str] = Field(..., min_length=1, description="At least one bullet point is required")
    tech_stack: List[str] = Field(default_factory=list)

    @field_validator('start_date')
    @classmethod
    def validate_start_date(cls, v: str) -> str:
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Start date must be in YYYY-MM format')
        return v

    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: str) -> str:
        if not re.match(r'^\d{4}-\d{2}$|^Atual$', v):
            raise ValueError('End date must be in YYYY-MM format or "Atual"')
        return v

    @field_validator('bullets')
    @classmethod
    def validate_bullets(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError('At least one bullet point is required')
        for bullet in v:
            if not bullet or len(bullet) == 0:
                raise ValueError('Bullet points must not be empty')
        return v


# Education Schema
class Education(BaseModel):
    institution: str = Field(..., min_length=1, description="Institution name is required")
    degree: str = Field(..., min_length=1, description="Degree is required")
    start_date: str = Field(..., description="Start date must be in YYYY-MM format")
    end_date: str = Field(..., description="End date must be in YYYY-MM format")

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


# Language Schema
class Language(BaseModel):
    name: str = Field(..., min_length=1, description="Language name is required")
    level: Literal["A2", "B1", "B2", "C1", "C2", "Nativo"] = Field(
        ..., description="Level must be one of: A2, B1, B2, C1, C2, Nativo"
    )


# Resume Response Schema
class ResumeResponse(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    job_title: str = Field(..., min_length=1, description="Job title is required")
    candidate_introduction: str = Field(..., min_length=1, description="Candidate introduction is required")
    experiences: List[Experience] = Field(..., min_length=1, description="At least one experience is required")
    education: List[Education] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)


# Cover Letter Response Schema
class CoverLetterResponse(BaseModel):
    greeting: str = Field(..., min_length=1, description="Greeting is required")
    body: str = Field(..., min_length=1, description="Body is required")
    signature: str = Field(..., min_length=1, description="Signature is required")


# Combined Generate Response Schema
class GenerateResponse(BaseModel):
    resume: ResumeResponse
    cover_letter: CoverLetterResponse
