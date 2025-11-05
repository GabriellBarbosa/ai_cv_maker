import pytest # type: ignore
from pydantic import ValidationError

from app.core.schemas import Experience, GenerateRequest


def _valid_experience(**overrides):
    base = {
        "company": "Acme Corp",
        "role": "Software Engineer",
        "start_date": "2022-01",
        "end_date": "2023-06",
        "location": "Remote",
        "bullets": ["Implemented feature X"],
        "tech_stack": ["Python", "FastAPI"],
    }
    base.update(overrides)
    return Experience(**base)


@pytest.mark.parametrize(
    "start_date",
    ["202201", "January 2022", "2022/13", "22-01", ""],
)
def test_experience_rejects_invalid_start_date(start_date):
    with pytest.raises(ValidationError):
        _valid_experience(start_date=start_date)


@pytest.mark.parametrize(
    "end_date",
    ["2023", "Jun 2023", "2023/00", ""],
)
def test_experience_rejects_invalid_end_date(end_date):
    with pytest.raises(ValidationError):
        _valid_experience(end_date=end_date)


def test_experience_normalizes_blank_location():
    exp = _valid_experience(location="   ")
    assert exp.location is None


def test_experience_requires_non_empty_bullets():
    with pytest.raises(ValidationError):
        _valid_experience(bullets=["Effective communicator", ""])


def test_generate_request_defaults_format_and_language():
    request = GenerateRequest(candidate_text="a", job_text="b")
    assert request.format == "docx"
    assert request.language == "pt-BR"
