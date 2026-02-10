"use client";

import { GenerateForm } from "@/app/(home)/_components/generate-resume-form";
import { ProfessionalInfoForm } from "./_components/professional-info-form";
import {
  Candidate,
  CandidateSchema,
} from "@/types/professional-info-form.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GenerateFormData } from "./_hooks/use-generate-form";
import { GenerateRequestSchema } from "@/types";

export default function Home() {
  const candidateForm = useForm<Candidate>({
    resolver: zodResolver(CandidateSchema),
    shouldFocusError: true,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const generateResumeForm = useForm<GenerateFormData>({
    resolver: zodResolver(GenerateRequestSchema) as any,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      job_text: "",
      language: "pt-BR",
      tone: "profissional",
      format: "docx",
    },
  });

  return (
    <div>
      <main className="container mx-auto pb-24 pt-20 grid gap-10 lg:items-start lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section
          id="generate"
          className="px-6 lg:sticky lg:top-20 lg:self-start"
        >
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Traga sua experiência e deixe que a nossa IA cuide do resto.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Conte sua história, cole descrição da vaga e deixe nossa IA criar
              um currículo e uma carta de apresentação com a sua cara.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                Personalize o tom e o idioma (Inglês ou Português).
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                Baixe seu currículo impecável em menos de um minuto.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                Projetado para proporcionar clareza em ambientes escuros e
                sessões de preparação noturnas.
              </li>
            </ul>
          </div>
        </section>
        <section id="generate" className="lg:px-6 space-y-6">
          <ProfessionalInfoForm form={candidateForm} />
          <GenerateForm
            form={generateResumeForm}
            triggerCandidateForm={async () =>
              await candidateForm.trigger(undefined, {
                shouldFocus: true,
              })
            }
          />
        </section>
      </main>
    </div>
  );
}
