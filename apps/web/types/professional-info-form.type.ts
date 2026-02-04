import { z } from "zod";

export const CandidateSchema = z.object({
  name: z.string(),
  professional_title: z.string(),
  candidate_introduction: z.string(),

  contact_information: z.object({
    email: z.string(),
    phone: z.string(),
    location: z.string(),
  }),

  external_links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),

  experiences: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        start_date: z.string(),
        end_date: z.string(),
        location: z.string(),

        bullets: z.array(z.string()),
        soft_skills: z.array(z.string()),
        hard_skills: z.array(z.string()),
      }),
    )
    .optional(),

  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        start_date: z.string(),
        end_date: z.string(),
      }),
    )
    .optional(),

  languages: z
    .array(
      z.object({
        name: z.string(),
        level: z.string(),
      }),
    )
    .optional(),
});

export type Candidate = z.infer<typeof CandidateSchema>;
