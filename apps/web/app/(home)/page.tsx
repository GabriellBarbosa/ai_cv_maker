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
      <header className="pt-6">
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            GB
          </span>
          <a
            href="https://portfolio-gabriellbarbosa.vercel.app/pt"
            target="_blank"
          >
            <span className="text-sm font-medium tracking-wide text-muted-foreground underline">
              by Gabriel Barbosa
            </span>
          </a>
        </div>
      </header>

      <main className="mx-auto pb-24 pt-6 grid gap-10 lg:items-start">
        <section id="generate">
          <div className="relative overflow-hidden bg-white border-b border-zinc-200">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            {/* Radial highlight */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-10 max-w-4xl mx-auto py-28 px-6">
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Traga sua experiência e deixe que a nossa IA cuide do resto.
                </h2>
                <p className="text-base text-muted-foreground md:text-lg">
                  Conte sua história, cole descrição da vaga e deixe nossa IA
                  criar um currículo e uma carta de apresentação com a sua cara.
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
            </div>
          </div>
          {/* <div className="relative bg-zinc-50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10 py-24 px-4"></div>
          </div> */}
        </section>
        <section id="generate" className="max-w-3xl mx-auto w-full space-y-6">
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
