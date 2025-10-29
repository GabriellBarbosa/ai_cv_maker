import { z } from 'zod';

// Generate Request Schema
export const GenerateRequestSchema = z.object({
  candidate_text: z.string().min(1, 'Candidate text is required'),
  job_text: z.string().min(1, 'Job text is required'),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
  tone: z.enum(['profissional', 'neutro', 'criativo']).default('profissional'),
  format: z.enum(['docx']).default('docx'),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// Experience Schema
export const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}-\d{2}$|^Atual$/, 'End date must be in YYYY-MM format or "Atual"'),
  location: z.string().min(1, 'Location is required'),
  bullets: z.array(z.string().min(1)).min(1, 'At least one bullet point is required'),
  tech_stack: z.array(z.string().min(1)).default([]),
});

export type Experience = z.infer<typeof ExperienceSchema>;

// Education Schema
export const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, 'End date must be in YYYY-MM format'),
});

export type Education = z.infer<typeof EducationSchema>;

// Language Schema
export const LanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'], {
    errorMap: () => ({ message: 'Level must be one of: A2, B1, B2, C1, C2, Nativo' })
  }),
});

export type Language = z.infer<typeof LanguageSchema>;

// Resume Response Schema
export const ResumeResponseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  candidate_introduction: z.string().min(1, 'Candidate introduction is required'),
  experiences: z.array(ExperienceSchema).min(1, 'At least one experience is required'),
  education: z.array(EducationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
});

export type ResumeResponse = z.infer<typeof ResumeResponseSchema>;
