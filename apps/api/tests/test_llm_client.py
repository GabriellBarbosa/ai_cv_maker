import json
from dataclasses import dataclass
from inspect import cleandoc
from pathlib import Path
from types import SimpleNamespace

import pytest # type: ignore

from app.services import llm_client

SNAPSHOT_DIR = Path(__file__).parent / "snapshots"


def read_snapshot(name: str) -> str:
    return cleandoc((SNAPSHOT_DIR / name).read_text())


@dataclass
class FakeUsage:
    prompt_tokens: int = 10
    completion_tokens: int = 20


class FakeResponse:
    def __init__(self, content: str):
        self.choices = [
            SimpleNamespace(message=SimpleNamespace(content=content))
        ]
        self.usage = FakeUsage()
        self.model = "test-model"


class StubCompletions:
    def __init__(self, response: FakeResponse, capture: dict):
        self._response = response
        self._capture = capture

    def create(self, **kwargs):
        self._capture["kwargs"] = kwargs
        return self._response


class StubChat:
    def __init__(self, response: FakeResponse, capture: dict):
        self.completions = StubCompletions(response, capture)


class StubClient:
    def __init__(self, response: FakeResponse, capture: dict):
        self.chat = StubChat(response, capture)


def stub_openai(monkeypatch, content: dict, capture: dict):
    response = FakeResponse(json.dumps(content))
    stub = StubClient(response, capture)
    monkeypatch.setattr(llm_client, "_get_openai_client", lambda: stub)
    return response


def test_validate_and_clean_json_removes_empty_fields():
    data = {
        "name": "Alice",
        "job_title": "",
        "experiences": [
            {
                "company": "Acme",
                "location": " ",
                "bullets": ["Built system", ""],
                "tech_stack": [],
            }
        ],
        "languages": [],
    }

    cleaned = llm_client._validate_and_clean_json(data)
    assert cleaned == {
        "name": "Alice",
        "experiences": [
            {
                "company": "Acme",
                "bullets": ["Built system"],
                "location": " ",
            }
        ],
    }


def test_validate_and_clean_json_rejects_empty_payload():
    with pytest.raises(llm_client.LLMClientError):
        llm_client._validate_and_clean_json({})


def test_extract_payload_emits_expected_system_prompt(monkeypatch):
    capture: dict = {}
    stub_openai(
        monkeypatch,
        content={
            "name": "Alice",
            "job_title": "Engineer",
        },
        capture=capture,
    )

    result = llm_client.extract_payload("candidate info", "job info", language="en-US")
    assert result == {"name": "Alice", "job_title": "Engineer"}

    system_prompt = cleandoc(capture["kwargs"]["messages"][0]["content"])
    assert system_prompt == read_snapshot("extract_payload_system_prompt.txt")


def test_generate_resume_json_parses_llm_response(monkeypatch):
    capture: dict = {}
    resume_payload = {
        "name": "Alice Smith",
        "job_title": "Senior Engineer",
        "candidate_introduction": "Experienced engineer.",
        "contact_information": {
            "email": "alice@example.com",
            "phone": None,
            "location": "Remote",
        },
        "experiences": [
            {
                "company": "Acme",
                "role": "Engineer",
                "start_date": "2020-01",
                "end_date": "Atual",
                "location": "Remote",
                "bullets": ["Built APIs."],
                "tech_stack": ["Python", "FastAPI"],
            }
        ],
        "education": [
            {
                "institution": "MIT",
                "degree": "BS Computer Science",
                "start_date": "2015-01",
                "end_date": "2019-12",
            }
        ],
        "languages": [{"name": "English", "level": "C2"}],
        "external_links": [{"label": "LinkedIn", "url": "https://example.com"}],
    }

    stub_openai(monkeypatch, content=resume_payload, capture=capture)

    resume = llm_client.generate_resume_json(
        extracted_data={"name": "Alice"},
        job_text="We need an engineer.",
        language="en-US",
        tone="criativo",
    )

    assert resume.name == "Alice Smith"
    assert resume.job_title == "Senior Engineer"
    assert resume.experiences[0].company == "Acme"

    system_prompt = cleandoc(capture["kwargs"]["messages"][0]["content"])
    assert system_prompt == read_snapshot("generate_resume_system_prompt.txt")


def test_generate_cover_text_applies_defaults_and_snapshot(monkeypatch):
    capture: dict = {}
    cover_payload = {
        "greeting": "",
        "body": "This is a detailed cover letter body that well exceeds fifty characters.",
        "signature": "",
    }

    stub_openai(monkeypatch, content=cover_payload, capture=capture)

    cover = llm_client.generate_cover_text(
        candidate_name="Alice Smith",
        job_title="Senior Engineer",
        candidate_summary="Seasoned engineer with API expertise.",
        job_text="Company seeks dedicated engineer.",
        language="pt-BR",
        tone="profissional",
    )

    assert cover.greeting.startswith("Prezado(a)")
    assert cover.signature.endswith("Alice Smith")

    system_prompt = cleandoc(capture["kwargs"]["messages"][0]["content"])
    assert system_prompt == read_snapshot("generate_cover_system_prompt.txt")
