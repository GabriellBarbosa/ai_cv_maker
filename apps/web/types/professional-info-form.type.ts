import { z } from "zod";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const beginDate = z
  .string()
  .trim()
  .min(1, "Start date is required")
  .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Use MM/YYYY format. Example: 02/2026");

const endDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine(
    (v) => v === undefined || /^(0[1-9]|1[0-2])\/\d{4}$/.test(v),
    "Use MM/yyyy (ex: 04/2026)",
  );

export const CandidateSchema = z.object({
  profile: z.object({
    name: requiredText("Full name"),
    professional_title: requiredText("Job title"),
    candidate_introduction: requiredText("Introduction"),
    skills: z.array(z.string()),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Invalid email"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required")
      .regex(/^[+\d\s().-]+$/, "Invalid phone number")
      .refine(
        (v) =>
          v.replace(/\D/g, "").length >= 10 &&
          v.replace(/\D/g, "").length <= 15,
        {
          message: "Phone number must have 10 to 15 digits",
        },
      ),
    state: requiredText("State"),
    city: requiredText("City"),
  }),

  external_links: z
    .array(
      z.object({
        label: requiredText("Link label"),
        url: requiredText("URL").url(),
      }),
    )
    .optional(),

  experiences: z
    .array(
      z.object({
        company: requiredText("Company"),
        role: requiredText("Role"),
        start_date: beginDate,
        end_date: endDate,
        current_job: z.boolean(),
        description: requiredText("Role description"),
        skills: z.array(z.string()),
      }),
    )
    .optional(),

  education: z
    .array(
      z.object({
        institution: requiredText("Institution"),
        degree: requiredText("Degree"),
        in_progress: z.boolean(),
        start_date: beginDate,
        end_date: endDate,
      }),
    )
    .optional(),

  languages: z
    .array(
      z.object({
        name: requiredText("Language"),
        level: requiredText("Level"),
      }),
    )
    .optional(),
});

export type Candidate = z.infer<typeof CandidateSchema>;
