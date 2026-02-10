import { z } from "zod";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} é obrigatório`);

const beginDate = z
  .string()
  .trim()
  .min(1, "Data de início é obrigatório")
  .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Use o formato mês/ano. Ex.: 02/2026");

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
  name: requiredText("Nome"),
  professional_title: requiredText("Cargo"),
  candidate_introduction: requiredText("Apresente-se"),
  skills: z.array(z.string()),

  contact_information: z.object({
    email: z
      .string()
      .min(1, { message: "E-mail é obrigatório" })
      .email("E-mail inválido"),
    phone: z
      .string()
      .trim()
      .min(1, "Celular é obrigatório")
      .regex(/^[+\d\s().-]+$/, "Celular inválido")
      .refine(
        (v) =>
          v.replace(/\D/g, "").length >= 10 &&
          v.replace(/\D/g, "").length <= 15,
        {
          message: "Celular deve ter de 10 a 15 dígitos",
        },
      ),
    state: requiredText("Estado"),
    city: requiredText("Cidade"),
  }),

  external_links: z
    .array(
      z.object({
        label: requiredText("Nome do link"),
        url: requiredText("URL").url(),
      }),
    )
    .optional(),

  experiences: z
    .array(
      z.object({
        company: requiredText("Empresa"),
        role: requiredText("Cargo"),
        start_date: beginDate,
        end_date: endDate,
        current_job: z.boolean(),
        description: requiredText("Descrição de atividades"),
        skills: z.array(z.string()),
      }),
    )
    .optional(),

  education: z
    .array(
      z.object({
        institution: requiredText("Instituição de ensino"),
        degree: requiredText("Curso"),
        in_progress: z.boolean(),
        start_date: beginDate,
        end_date: endDate,
      }),
    )
    .optional(),

  languages: z
    .array(
      z.object({
        name: requiredText("Idioma"),
        level: requiredText("Nível"),
      }),
    )
    .optional(),
});

export type Candidate = z.infer<typeof CandidateSchema>;
