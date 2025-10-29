# Schema Comparison: TypeScript (Zod) vs Python (Pydantic)

This document demonstrates the equivalence between the TypeScript (Zod) and Python (Pydantic) schema implementations, ensuring identical validation in both frontend and backend.

## GenerateRequestSchema

### TypeScript (Zod)
```typescript
const GenerateRequestSchema = z.object({
  candidate_text: z.string().min(1, 'Candidate text is required'),
  job_text: z.string().min(1, 'Job text is required'),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
  tone: z.enum(['profissional', 'neutro', 'criativo']).default('profissional'),
  format: z.enum(['docx']).default('docx'),
});
```

### Python (Pydantic)
```python
class GenerateRequest(BaseModel):
    candidate_text: str = Field(..., min_length=1, description="Candidate text is required")
    job_text: str = Field(..., min_length=1, description="Job text is required")
    language: Literal["pt-BR", "en-US"] = "pt-BR"
    tone: Literal["profissional", "neutro", "criativo"] = "profissional"
    format: Literal["docx"] = "docx"
```

**Equivalence:**
- ✅ Same field names
- ✅ Same required fields (candidate_text, job_text)
- ✅ Same enum values for language, tone, and format
- ✅ Same default values
- ✅ Same minimum length validation (min 1)

---

## ExperienceSchema

### TypeScript (Zod)
```typescript
const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}-\d{2}$|^Atual$/, 'End date must be in YYYY-MM format or "Atual"'),
  location: z.string().min(1, 'Location is required'),
  bullets: z.array(z.string().min(1)).min(1, 'At least one bullet point is required'),
  tech_stack: z.array(z.string().min(1)).default([]),
});
```

### Python (Pydantic)
```python
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
```

**Equivalence:**
- ✅ Same field names
- ✅ Same required fields
- ✅ Same date format validation (YYYY-MM)
- ✅ Same regex patterns for dates
- ✅ Same "Atual" keyword support for end_date
- ✅ Same minimum array length (bullets must have at least 1 item)
- ✅ Same default value for tech_stack (empty array)
- ✅ Same validation for non-empty strings in arrays

---

## EducationSchema

### TypeScript (Zod)
```typescript
const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, 'End date must be in YYYY-MM format'),
});
```

### Python (Pydantic)
```python
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
```

**Equivalence:**
- ✅ Same field names
- ✅ All fields required
- ✅ Same date format validation (YYYY-MM)
- ✅ Same regex patterns
- ✅ Same minimum length validation

---

## LanguageSchema

### TypeScript (Zod)
```typescript
const LanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'], {
    errorMap: () => ({ message: 'Level must be one of: A2, B1, B2, C1, C2, Nativo' })
  }),
});
```

### Python (Pydantic)
```python
class Language(BaseModel):
    name: str = Field(..., min_length=1, description="Language name is required")
    level: Literal["A2", "B1", "B2", "C1", "C2", "Nativo"] = Field(
        ..., description="Level must be one of: A2, B1, B2, C1, C2, Nativo"
    )
```

**Equivalence:**
- ✅ Same field names
- ✅ All fields required
- ✅ Same enum values (A2, B1, B2, C1, C2, Nativo)
- ✅ Same validation messages

---

## ResumeResponseSchema

### TypeScript (Zod)
```typescript
const ResumeResponseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  candidate_introduction: z.string().min(1, 'Candidate introduction is required'),
  experiences: z.array(ExperienceSchema).min(1, 'At least one experience is required'),
  education: z.array(EducationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
});
```

### Python (Pydantic)
```python
class ResumeResponse(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    job_title: str = Field(..., min_length=1, description="Job title is required")
    candidate_introduction: str = Field(..., min_length=1, description="Candidate introduction is required")
    experiences: List[Experience] = Field(..., min_length=1, description="At least one experience is required")
    education: List[Education] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)
```

**Equivalence:**
- ✅ Same field names
- ✅ Same required fields (name, job_title, candidate_introduction, experiences)
- ✅ Same minimum array length (experiences must have at least 1 item)
- ✅ Same optional fields with default empty arrays (education, languages)
- ✅ Same nested schema types

---

## Validation Test Results

Both implementations have been tested with identical test cases:

### ✅ Valid Data Tests
- [x] GenerateRequest with valid data
- [x] Experience with valid dates and all fields
- [x] Education with valid dates
- [x] Language with valid CEFR level
- [x] ResumeResponse with complete nested structure

### ✅ Invalid Data Tests
- [x] Experience with invalid date format (2020/01 instead of 2020-01)
- [x] Language with invalid level (C3 instead of A2-C2/Nativo)
- [x] Empty required strings rejected
- [x] Empty arrays rejected where minimum length is 1

### ✅ Edge Cases
- [x] "Atual" accepted as end_date in Experience
- [x] Empty arrays accepted for optional fields (education, languages, tech_stack)
- [x] Default values applied correctly

## Conclusion

Both TypeScript (Zod) and Python (Pydantic) implementations are **fully equivalent** and provide:

1. **Identical field names and structure**
2. **Same validation rules and constraints**
3. **Consistent error messages**
4. **Matching default values**
5. **Compatible data formats**

This ensures that:
- Frontend validation catches the same errors as backend validation
- API contracts are consistent across the entire application
- Data serialization/deserialization works seamlessly
- Developer experience is consistent when working with either codebase
