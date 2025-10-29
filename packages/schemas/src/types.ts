import { z } from 'zod';

// Placeholder schema types - will be expanded later
export const GenerateRequestSchema = z.object({
  candidate_text: z.string(),
  job_text: z.string(),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
  tone: z.enum(['profissional', 'neutro', 'criativo']).default('profissional'),
  format: z.enum(['docx']).default('docx'),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
