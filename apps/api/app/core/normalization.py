import html
import re
from typing import Any, Dict, Iterable, List, Optional, Tuple


# --- Constants -----------------------------------------------------------------

MAX_NAME_LENGTH = 120
MAX_JOB_TITLE_LENGTH = 120
MAX_INTRO_LENGTH = 1200
MAX_BULLET_LENGTH = 320
MAX_TECH_ITEM_LENGTH = 60
MAX_LOCATION_LENGTH = 120
MAX_EDU_FIELD_LENGTH = 160
MAX_LANGUAGE_NAME_LENGTH = 60
MAX_EXTERNAL_LABEL_LENGTH = 80
MAX_EXTERNAL_URL_LENGTH = 220
MAX_CONTACT_FIELD_LENGTH = 120


EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags (iOS)
    "\U00002700-\U000027BF"  # dingbats
    "\U0001F900-\U0001F9FF"  # supplemental symbols and pictographs
    "\U0001FA70-\U0001FAFF"  # symbols & pictographs extended-A
    "\U00002600-\U000026FF"  # miscellaneous symbols
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)

HTML_TAG_PATTERN = re.compile(r"<[^>]+>")
WHITESPACE_PATTERN = re.compile(r"\s+")

# Month names in English and Portuguese (lowercase)
MONTH_ALIASES: Dict[str, int] = {
    "january": 1,
    "jan": 1,
    "janeiro": 1,
    "jan.": 1,
    "february": 2,
    "feb": 2,
    "fev": 2,
    "fevereiro": 2,
    "mar": 3,
    "march": 3,
    "março": 3,
    "marco": 3,
    "apr": 4,
    "apr.": 4,
    "april": 4,
    "abril": 4,
    "may": 5,
    "maio": 5,
    "jun": 6,
    "june": 6,
    "junho": 6,
    "jul": 7,
    "july": 7,
    "julho": 7,
    "aug": 8,
    "august": 8,
    "agosto": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "set": 9,
    "setembro": 9,
    "oct": 10,
    "october": 10,
    "out": 10,
    "outubro": 10,
    "nov": 11,
    "november": 11,
    "novembro": 11,
    "dec": 12,
    "december": 12,
    "dez": 12,
    "dezembro": 12,
}

RAW_TECH_KEYWORDS = [
    "Python",
    "FastAPI",
    "Flask",
    "Django",
    "Java",
    "Spring",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "NestJS",
    "PHP",
    "Laravel",
    "Ruby",
    "Ruby on Rails",
    "Go",
    "Golang",
    "Rust",
    "C",
    "C++",
    "C#",
    ".NET",
    "ASP.NET",
    "Kotlin",
    "Swift",
    "Objective-C",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "SQLite",
    "MongoDB",
    "Redis",
    "Elasticsearch",
    "GraphQL",
    "REST",
    "gRPC",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Terraform",
    "Ansible",
    "CI/CD",
    "Git",
    "GitHub Actions",
    "Bitbucket",
    "Jenkins",
    "Linux",
    "Bash",
    "PowerShell",
    "HTML",
    "CSS",
    "SASS",
    "Tailwind",
    "Bootstrap",
    "Figma",
    "Photoshop",
    "Illustrator",
    "Tableau",
    "Power BI",
    "Airflow",
    "Spark",
    "Hadoop",
    "Pandas",
    "NumPy",
    "TensorFlow",
    "PyTorch",
    "Scikit-Learn",
    "Machine Learning",
    "Data Science",
    "ETL",
    "NoSQL",
    "Microservices",
    "Event-Driven",
]


def _compile_keyword_patterns(keywords: Iterable[str]) -> List[Tuple[re.Pattern[str], str]]:
    patterns: List[Tuple[re.Pattern[str], str]] = []
    for keyword in keywords:
        escaped = re.escape(keyword.lower())
        pattern = re.compile(rf"(?<!\w){escaped}(?!\w)", re.IGNORECASE)
        patterns.append((pattern, keyword))
    return patterns


TECH_KEYWORD_PATTERNS = _compile_keyword_patterns(RAW_TECH_KEYWORDS)


# --- Text utilities ------------------------------------------------------------

def strip_html(text: str) -> str:
    return HTML_TAG_PATTERN.sub(" ", text)


def remove_emoji(text: str) -> str:
    return EMOJI_PATTERN.sub("", text)


def normalize_whitespace(text: str) -> str:
    return WHITESPACE_PATTERN.sub(" ", text).strip()


def clean_text(value: Optional[str], max_length: int) -> Optional[str]:
    if value is None:
        return None
    text = html.unescape(value)
    text = strip_html(text)
    text = remove_emoji(text)
    text = normalize_whitespace(text)
    if not text:
        return None
    if len(text) > max_length:
        text = text[:max_length].rstrip()
    return text


# --- Date normalization --------------------------------------------------------

def normalize_date(value: str, allow_atual: bool = True) -> str:
    raw = clean_text(value, max_length=40)
    if not raw:
        raise ValueError("Date value is empty after normalization")

    lowered = raw.lower()
    if allow_atual and lowered in {"atual", "current", "present", "ongoing", "now"}:
        return "Atual"

    # Direct YYYY-MM
    match = re.match(r"^(\d{4})[-/\.](\d{1,2})$", raw)
    if match:
        year, month = match.groups()
        month_num = int(month)
        if 1 <= month_num <= 12:
            return f"{year}-{month_num:02d}"

    # MM/YYYY or MM-YYYY
    match = re.match(r"^(\d{1,2})[-/\.](\d{4})$", raw)
    if match:
        month, year = match.groups()
        month_num = int(month)
        if 1 <= month_num <= 12:
            return f"{year}-{month_num:02d}"

    # Month name + year
    match = re.match(r"^([A-Za-zçÇ\.]+)[\s\-/,\.]*(\d{4})$", lowered)
    if match:
        month_name, year = match.groups()
        month_num = MONTH_ALIASES.get(month_name.strip(". "))
        if month_num:
            return f"{year}-{month_num:02d}"

    # Year only
    match = re.match(r"^(\d{4})$", raw)
    if match:
        year = match.group(1)
        return f"{year}-01"

    raise ValueError(f"Invalid date format: {value}")


# --- Tech stack fallback -------------------------------------------------------

def extract_tech_keywords(*texts: Optional[str]) -> List[str]:
    combined: List[str] = []
    seen: set[str] = set()
    for text in texts:
        if not text:
            continue
        for pattern, label in TECH_KEYWORD_PATTERNS:
            if label in seen:
                continue
            if pattern.search(text):
                seen.add(label)
                combined.append(label)
    return combined[:10]


# --- Resume normalization ------------------------------------------------------

def normalize_resume_payload(data: Dict[str, Any], job_text: Optional[str] = None) -> Dict[str, Any]:
    normalized: Dict[str, Any] = {}

    normalized["name"] = clean_text(data.get("name"), MAX_NAME_LENGTH) or ""
    normalized["job_title"] = clean_text(data.get("job_title"), MAX_JOB_TITLE_LENGTH) or ""
    normalized["candidate_introduction"] = clean_text(
        data.get("candidate_introduction"), MAX_INTRO_LENGTH
    ) or ""

    contact_info = data.get("contact_information")
    if contact_info:
        normalized_contact: Dict[str, Optional[str]] = {}
        for field in ("email", "phone", "location"):
            normalized_value = clean_text(contact_info.get(field), MAX_CONTACT_FIELD_LENGTH)
            normalized_contact[field] = normalized_value
        if any(value for value in normalized_contact.values()):
            normalized["contact_information"] = normalized_contact
        else:
            normalized["contact_information"] = None
    else:
        normalized["contact_information"] = None

    experiences = []
    for exp in data.get("experiences") or []:
        normalized_exp: Dict[str, Any] = {}
        normalized_exp["company"] = clean_text(exp.get("company"), MAX_NAME_LENGTH) or ""
        normalized_exp["role"] = clean_text(exp.get("role"), MAX_JOB_TITLE_LENGTH) or ""
        normalized_exp["location"] = clean_text(exp.get("location"), MAX_LOCATION_LENGTH)
        normalized_exp["start_date"] = normalize_date(exp.get("start_date", ""))
        normalized_exp["end_date"] = normalize_date(exp.get("end_date", ""), allow_atual=True)

        bullets: List[str] = []
        for bullet in exp.get("bullets", []):
            cleaned_bullet = clean_text(bullet, MAX_BULLET_LENGTH)
            if cleaned_bullet:
                bullets.append(cleaned_bullet)
        normalized_exp["bullets"] = bullets

        tech_stack: List[str] = []
        for item in exp.get("tech_stack") or []:
            cleaned_item = clean_text(item, MAX_TECH_ITEM_LENGTH)
            if cleaned_item:
                tech_stack.append(cleaned_item)

        if tech_stack:
            deduped: List[str] = []
            seen_items: set[str] = set()
            for skill in tech_stack:
                key = skill.lower()
                if key in seen_items:
                    continue
                seen_items.add(key)
                deduped.append(skill)
            tech_stack = deduped

        if not tech_stack:
            fallback_candidates = [
                normalized_exp["role"],
                normalized_exp["company"],
                *(bullets or []),
                job_text,
            ]
            tech_stack = extract_tech_keywords(*fallback_candidates)

        normalized_exp["tech_stack"] = tech_stack
        experiences.append(normalized_exp)

    normalized["experiences"] = experiences

    education_entries = []
    for edu in data.get("education") or []:
        normalized_edu: Dict[str, Any] = {}
        normalized_edu["institution"] = clean_text(edu.get("institution"), MAX_EDU_FIELD_LENGTH) or ""
        normalized_edu["degree"] = clean_text(edu.get("degree"), MAX_EDU_FIELD_LENGTH) or ""
        normalized_edu["start_date"] = normalize_date(edu.get("start_date", ""), allow_atual=False)
        normalized_edu["end_date"] = normalize_date(edu.get("end_date", ""), allow_atual=False)
        education_entries.append(normalized_edu)
    normalized["education"] = education_entries

    language_entries = []
    for lang in data.get("languages") or []:
        normalized_lang: Dict[str, Any] = {}
        normalized_lang["name"] = clean_text(lang.get("name"), MAX_LANGUAGE_NAME_LENGTH) or ""
        normalized_lang["level"] = clean_text(lang.get("level"), 10) or ""
        language_entries.append(normalized_lang)
    normalized["languages"] = language_entries

    external_links = []
    for link in data.get("external_links") or []:
        normalized_link: Dict[str, Any] = {}
        normalized_link["label"] = clean_text(link.get("label"), MAX_EXTERNAL_LABEL_LENGTH) or ""
        normalized_link["url"] = clean_text(link.get("url"), MAX_EXTERNAL_URL_LENGTH) or ""
        if normalized_link["label"] and normalized_link["url"]:
            external_links.append(normalized_link)
    normalized["external_links"] = external_links

    return normalized
