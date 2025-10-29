from fastapi import APIRouter
from app.core.schemas import (
    GenerateRequest,
    GenerateResponse,
    ResumeResponse,
    CoverLetterResponse,
    Experience,
    Education,
    Language,
)

router = APIRouter()


def get_stub_resume() -> ResumeResponse:
    """Return stub resume data"""
    return ResumeResponse(
        name="João Silva",
        job_title="Engenheiro de Software",
        candidate_introduction="Profissional experiente em desenvolvimento de software com foco em arquitetura de sistemas e liderança técnica.",
        experiences=[
            Experience(
                company="Tech Company",
                role="Senior Software Engineer",
                start_date="2020-01",
                end_date="Atual",
                location="São Paulo, Brasil",
                bullets=[
                    "Desenvolveu microsserviços escaláveis usando Python e FastAPI",
                    "Liderou equipe de 5 desenvolvedores em projetos críticos",
                    "Implementou CI/CD pipelines reduzindo tempo de deploy em 50%"
                ],
                tech_stack=["Python", "FastAPI", "Docker", "Kubernetes"]
            )
        ],
        education=[
            Education(
                institution="Universidade de São Paulo",
                degree="Bacharelado em Ciência da Computação",
                start_date="2015-03",
                end_date="2019-12"
            )
        ],
        languages=[
            Language(name="Português", level="Nativo"),
            Language(name="Inglês", level="C1")
        ]
    )


def get_stub_cover_letter() -> CoverLetterResponse:
    """Return stub cover letter data"""
    return CoverLetterResponse(
        greeting="Prezado(a) Recrutador(a),",
        body="Escrevo para expressar meu interesse na posição anunciada. Com mais de 5 anos de experiência em desenvolvimento de software, acredito que minhas habilidades técnicas e experiência em liderança de equipes se alinham perfeitamente com os requisitos da vaga. Tenho um histórico comprovado de entrega de projetos complexos e estou ansioso para contribuir com o sucesso da equipe.",
        signature="Atenciosamente,\nJoão Silva"
    )


@router.post("/generate", response_model=GenerateResponse, status_code=200)
async def generate_all(request: GenerateRequest):
    """Generate both resume and cover letter"""
    return GenerateResponse(
        resume=get_stub_resume(),
        cover_letter=get_stub_cover_letter()
    )


@router.post("/generate/resume", response_model=ResumeResponse, status_code=200)
async def generate_resume(request: GenerateRequest):
    """Generate only resume"""
    return get_stub_resume()


@router.post("/generate/cover-letter", response_model=CoverLetterResponse, status_code=200)
async def generate_cover_letter(request: GenerateRequest):
    """Generate only cover letter"""
    return get_stub_cover_letter()
