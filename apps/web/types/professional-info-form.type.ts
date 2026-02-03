import { z } from "zod";

const YYYY_MM_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const yyyymm = z
  .string()
  .regex(YYYY_MM_REGEX, "Expected format YYYY-MM (e.g. 2026-02)");

const nullableString = z.string().nullable();

export const CandidateSchema = z.object({
  name: z.string().min(1),
  professional_title: z.string().min(1),
  candidate_introduction: z.string().min(1),

  contact_information: z.object({
    email: nullableString,
    phone: nullableString,
    location: nullableString,
  }),

  external_links: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .optional(),

  experiences: z.array(
    z.object({
      company: z.string().min(1),
      role: z.string().min(1),
      start_date: yyyymm,
      end_date: z.union([yyyymm, z.literal("Present")]),
      location: z.string().min(1),

      bullets: z.array(z.string().min(1)).min(1),
      soft_skills: z.array(z.string().min(1)).default([]),
      hard_skills: z.array(z.string().min(1)).default([]),
    }),
  ),

  education: z.array(
    z.object({
      institution: z.string().min(1),
      degree: z.string().min(1),
      start_date: yyyymm,
      end_date: yyyymm,
    }),
  ),

  languages: z
    .array(
      z.object({
        name: z.string().min(1),
        level: z.enum(["A2", "B1", "B2", "C1", "C2", "Native"]),
      }),
    )
    .optional(),
});

export type Candidate = z.infer<typeof CandidateSchema>;
