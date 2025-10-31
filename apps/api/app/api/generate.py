import logging
from fastapi import APIRouter, HTTPException
from app.core.schemas import (
    GenerateRequest,
    GenerateResponse,
    ResumeResponse,
    CoverLetterResponse,
)
from app.services.llm_client import (
    extract_payload,
    generate_resume_json,
    generate_cover_text,
    LLMClientError,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=GenerateResponse, status_code=200)
async def generate_all(request: GenerateRequest):
    """Generate both resume and cover letter"""
    try:
        logger.info("Generating complete CV package")
        
        # Step 1: Extract structured data
        extracted_data = extract_payload(
            candidate_text=request.candidate_text,
            job_text=request.job_text,
            language=request.language,
        )
        
        # Step 2: Generate resume
        resume = generate_resume_json(
            extracted_data=extracted_data,
            job_text=request.job_text,
            language=request.language,
            tone=request.tone,
        )
        
        # Step 3: Generate cover letter
        cover_letter = generate_cover_text(
            candidate_name=resume.name,
            job_title=resume.job_title,
            candidate_summary=resume.candidate_introduction,
            job_text=request.job_text,
            language=request.language,
            tone=request.tone,
        )
        
        logger.info("Successfully generated complete CV package")
        return GenerateResponse(resume=resume, cover_letter=cover_letter)
        
    except LLMClientError as e:
        logger.error(f"LLM client error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/generate/resume", response_model=ResumeResponse, status_code=200)
async def generate_resume(request: GenerateRequest):
    """Generate only resume"""
    try:
        logger.info("Generating resume only")
        
        # Extract structured data
        extracted_data = extract_payload(
            candidate_text=request.candidate_text,
            job_text=request.job_text,
            language=request.language,
        )
        
        # Generate resume
        resume = generate_resume_json(
            extracted_data=extracted_data,
            job_text=request.job_text,
            language=request.language,
            tone=request.tone,
        )
        
        logger.info("Successfully generated resume")
        return resume
        
    except LLMClientError as e:
        logger.error(f"LLM client error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/generate/cover-letter", response_model=CoverLetterResponse, status_code=200)
async def generate_cover_letter_endpoint(request: GenerateRequest):
    """Generate only cover letter"""
    try:
        logger.info("Generating cover letter only")
        
        # Extract structured data
        extracted_data = extract_payload(
            candidate_text=request.candidate_text,
            job_text=request.job_text,
            language=request.language,
        )
        
        # Extract candidate info for cover letter
        candidate_name = extracted_data.get("name", "Candidate")
        job_title = extracted_data.get("job_title", "Position")
        
        # Create a summary from candidate text (first 200 chars as fallback)
        candidate_summary = extracted_data.get(
            "summary",
            request.candidate_text[:200] + "..." if len(request.candidate_text) > 200 else request.candidate_text
        )
        
        # Generate cover letter
        cover_letter = generate_cover_text(
            candidate_name=candidate_name,
            job_title=job_title,
            candidate_summary=candidate_summary,
            job_text=request.job_text,
            language=request.language,
            tone=request.tone,
        )
        
        logger.info("Successfully generated cover letter")
        return cover_letter
        
    except LLMClientError as e:
        logger.error(f"LLM client error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
